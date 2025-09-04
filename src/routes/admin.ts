import { Hono } from 'hono'
// @ts-ignore - Vite raw import for SQL
import schemaSql from '../../migrations/0001_prompts.sql?raw'
import { appendAuditKV, diffHash, signAudit } from '../utils/audit'
import Ajv from 'ajv'

const router = new Hono()

// Simple guard (DEV only): require X-Admin-Token if provided in env
function requireAdmin(c: any) {
  const must = c.env.ADMIN_TOKEN as string | undefined
  if (!must) return true
  const got = c.req.header('X-Admin-Token')
  return got === must
}

router.post('/admin/migrate', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  if (!DB) return c.text('No DB binding', 500)
  try {
    // Execute statements one by one to avoid parser issues
    const statements: string[] = [
      "CREATE TABLE IF NOT EXISTS prompt_packs ( id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, name TEXT, created_at TEXT DEFAULT (datetime('now')) )",
      "CREATE TABLE IF NOT EXISTS prompt_versions ( id INTEGER PRIMARY KEY AUTOINCREMENT, pack_id INTEGER NOT NULL REFERENCES prompt_packs(id), version TEXT NOT NULL, locale TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','active','deprecated')), metadata_json TEXT, json_schema TEXT, prompt_hash TEXT, rollout_percent INTEGER DEFAULT 100 CHECK(rollout_percent BETWEEN 0 AND 100), created_by TEXT, created_at TEXT DEFAULT (datetime('now')), UNIQUE(pack_id, version, locale) )",
      "CREATE TABLE IF NOT EXISTS prompt_entries ( id INTEGER PRIMARY KEY AUTOINCREMENT, version_id INTEGER NOT NULL REFERENCES prompt_versions(id), role TEXT NOT NULL, system_prompt_enc TEXT NOT NULL, user_template_enc TEXT NOT NULL, params_json TEXT, allowed_placeholders TEXT, model_params_json TEXT, entry_hash TEXT, encryption_key_version INTEGER DEFAULT 1, schema_version TEXT DEFAULT '1', created_at TEXT DEFAULT (datetime('now')), UNIQUE(version_id, role) )",
      "CREATE TABLE IF NOT EXISTS roles ( id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','editor','viewer')), created_at TEXT DEFAULT (datetime('now')) )",
      "CREATE TABLE IF NOT EXISTS prompt_audit_log ( id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, pack_slug TEXT NOT NULL, version TEXT, locale TEXT, role TEXT, actor TEXT, diff_hash TEXT, created_at TEXT DEFAULT (datetime('now')) )",
      "CREATE TABLE IF NOT EXISTS inference_log ( id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT NOT NULL, pack_slug TEXT NOT NULL, version TEXT NOT NULL, prompt_hash TEXT NOT NULL, model TEXT, temperature REAL, params_json TEXT, request_ts TEXT, latency_ms INTEGER, cost_estimate_cents REAL, status TEXT, error TEXT, payload_json TEXT, session_sticky_version TEXT )",
      "CREATE INDEX IF NOT EXISTS idx_entries_version_role ON prompt_entries(version_id, role)",
      "CREATE INDEX IF NOT EXISTS idx_versions_pack_locale_status ON prompt_versions(pack_id, locale, status)"
    ]
    for (const s of statements) {
      await DB.exec(s)
    }
    return c.json({ ok: true, statements: statements.length })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

router.post('/admin/prompts/publish', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const body = await c.req.json<{ pack_slug: string; version: string; locale: string; actor?: string; note?: string; before?: unknown; after?: unknown }>().catch(()=>null)
  if (!body) return c.text('Bad Request', 400)
  const { pack_slug, version, locale, actor, before, after } = body
  const DB = c.env.DB as D1Database
  if (!DB) return c.text('No DB', 500)

  try {
    const pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(pack_slug).first<any>()
    if (!pack) return c.text('Pack not found', 404)
    const ver = await DB.prepare('SELECT id FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
      .bind(pack.id, version, locale).first<any>()
    if (!ver) return c.text('Version not found', 404)

    // Deprecate current active
    await DB.prepare("UPDATE prompt_versions SET status='deprecated' WHERE pack_id = ? AND locale = ? AND status='active'")
      .bind(pack.id, locale).run()
    // Activate target
    await DB.prepare("UPDATE prompt_versions SET status='active' WHERE id = ?").bind(ver.id).run()

    // Audit in D1
    const dh = await diffHash(before ?? null, after ?? { version, locale })
    await DB.prepare('INSERT INTO prompt_audit_log (action, pack_slug, version, locale, actor, diff_hash) VALUES (?, ?, ?, ?, ?, ?)')
      .bind('publish', pack_slug, version, locale, actor || 'system', dh).run()

    // Append-only audit in KV with HMAC if available
    const kv = (c.env as any).AUDIT_LOG_KV as KVNamespace | undefined
    const hmac = c.env.AUDIT_HMAC_KEY as string | undefined
    if (kv) {
      const entry = { action: 'publish', pack_slug, version, locale, actor: actor || 'system', ts: new Date().toISOString(), diff_hash: dh }
      if (hmac) {
        const s = await signAudit(entry, hmac)
        await appendAuditKV(kv, { ...entry, signature: s.signature })
      } else {
        await appendAuditKV(kv, entry)
      }
    }

    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

router.post('/admin/prompts/dry-run', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  type DryRunBody = { pack_slug: string; version: string; locale: string; role: string; data: any }
  const body = await c.req.json<DryRunBody>().catch(()=>null)
  if (!body || !body.role || !body.pack_slug || !body.version || !body.locale) return c.text('Bad Request', 400)

  const DB = c.env.DB as D1Database
  // Hämta json_schema från prompt_versions
  const row = await DB.prepare(
    'SELECT json_schema FROM prompt_versions pv JOIN prompt_packs p ON p.id=pv.pack_id WHERE p.slug = ? AND pv.version = ? AND pv.locale = ?'
  ).bind(body.pack_slug, body.version, body.locale).first<any>()

  const ajv = new Ajv({ allErrors: true, strict: false })
  let validate: any
  const errs: string[] = []

  let schemaWarn: string | null = null
  if (row?.json_schema) {
    try {
      const schemaRoot = JSON.parse(row.json_schema)
      // Antag format: { roles: { STRATEGIST: {...}, CONSENSUS: {...} } }
      const roleKey = body.role
      const schema = schemaRoot?.roles?.[roleKey] || (roleKey === 'CONSENSUS' ? schemaRoot?.roles?.['SUMMARIZER'] : undefined)
      if (schema) {
        try {
          validate = ajv.compile(schema)
        } catch (ce: any) {
          // In restricted runtimes (e.g., Miniflare/Workers with no eval), Ajv can fail with codegen restrictions.
          // Treat as a warning and gracefully fall back to simple checks instead of returning an error.
          schemaWarn = 'Schema compile unavailable in this runtime; using fallback checks'
        }
      } else {
        schemaWarn = 'No role schema found; using fallback checks'
      }
    } catch (e: any) {
      schemaWarn = 'Invalid json_schema in DB; using fallback checks'
    }
  } else {
    schemaWarn = 'No json_schema in DB; using fallback checks'
  }

  if (validate) {
    const ok = validate(body.data)
    if (!ok) {
      const details = (validate.errors || []).map((e: any) => `${e.instancePath || ''} ${e.message || ''}`.trim())
      return c.json({ ok: false, errors: details })
    }
    return c.json({ ok: true, errors: [] })
  }

  // Fallback: enkel typkontroll om schema saknas/ogiltigt
  const data = body.data || {}
  const isString = (x: any) => typeof x === 'string'
  const isStringArray = (x: any) => Array.isArray(x) && x.every(isString)

  if (body.role === 'CONSENSUS') {
    // v2 Executive Summarizer fallback checks
    if (!isString(data.decision)) errs.push('decision must be string')
    if (!isString(data.summary)) errs.push('summary must be string')
    if (data.consensus_bullets != null && !isStringArray(data.consensus_bullets)) errs.push('consensus_bullets must be string[] if present')
    if (data.top_risks != null && !isStringArray(data.top_risks)) errs.push('top_risks must be string[] if present')
    if (data.conditions != null && !isStringArray(data.conditions)) errs.push('conditions must be string[] if present')
  } else {
    if (!isString(data.analysis)) errs.push('analysis must be string')
    if (data.recommendations != null && !isStringArray(data.recommendations)) errs.push('recommendations must be string[] if present')
  }

  return c.json({ ok: errs.length === 0, errors: errs })
})

router.get('/admin/inference-log/count', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  const row = await DB.prepare('SELECT COUNT(*) AS c FROM inference_log').first<any>()
  return c.json({ ok: true, count: Number(row?.c || 0) })
})

router.post('/admin/prompts/schema', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  const body = await c.req.json<{ pack_slug: string; version: string; locale: string; json_schema: any }>().catch(()=>null)
  if (!body?.pack_slug || !body?.version || !body?.locale || (typeof body?.json_schema !== 'string' && typeof body?.json_schema !== 'object')) return c.text('Bad Request', 400)

  const schemaStr = typeof body.json_schema === 'string' ? body.json_schema : JSON.stringify(body.json_schema)

  // Validate JSON syntax
  try { JSON.parse(schemaStr) } catch (e: any) {
    return c.json({ ok: false, error: 'Invalid JSON schema: ' + String(e?.message || e) }, 400)
  }

  // Update row
  const pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(body.pack_slug).first<any>()
  if (!pack) return c.text('Pack not found', 404)
  const ver = await DB.prepare('SELECT id FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
    .bind(pack.id, body.version, body.locale).first<any>()
  if (!ver) return c.text('Version not found', 404)

  await DB.prepare('UPDATE prompt_versions SET json_schema = ? WHERE id = ?').bind(schemaStr, ver.id).run()
  return c.json({ ok: true })
})

// Convenience: upsert schema into the currently active (or auto‑created) version
// Body: { pack_slug: string, locale: string, json_schema: string, version?: string, actor?: string }
router.post('/admin/prompts/schema/active', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  type Body = { pack_slug: string; locale: string; json_schema: any; version?: string; actor?: string }
  const body = await c.req.json<Body>().catch(()=>null)
  if (!body?.pack_slug || !body?.locale || (typeof body?.json_schema !== 'string' && typeof body?.json_schema !== 'object')) return c.text('Bad Request', 400)

  const schemaStr = typeof body.json_schema === 'string' ? body.json_schema : JSON.stringify(body.json_schema)

  // Validate JSON syntax early
  try { JSON.parse(schemaStr) } catch (e: any) {
    return c.json({ ok: false, error: 'Invalid JSON schema: ' + String(e?.message || e) }, 400)
  }

  // Ensure pack exists
  let pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(body.pack_slug).first<any>()
  if (!pack) {
    await DB.prepare('INSERT INTO prompt_packs (slug, name) VALUES (?, ?)').bind(body.pack_slug, body.pack_slug).run()
    pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(body.pack_slug).first<any>()
  }

  // Resolve target version
  let ver: any = null
  if (body.version) {
    ver = await DB.prepare('SELECT id, version, status FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
      .bind(pack.id, body.version, body.locale).first<any>()
    if (!ver) {
      await DB.prepare("UPDATE prompt_versions SET status='deprecated' WHERE pack_id = ? AND locale = ? AND status='active'").bind(pack.id, body.locale).run()
      await DB.prepare("INSERT INTO prompt_versions (pack_id, version, locale, status, metadata_json) VALUES (?, ?, ?, 'active', ?)")
        .bind(pack.id, body.version, body.locale, JSON.stringify({ created_by: body.actor || 'system' })).run()
      ver = await DB.prepare('SELECT id, version, status FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
        .bind(pack.id, body.version, body.locale).first<any>()
    }
  } else {
    // Try active; else create an auto version
    ver = await DB.prepare("SELECT id, version, status FROM prompt_versions WHERE pack_id = ? AND locale = ? AND status='active' ORDER BY created_at DESC LIMIT 1")
      .bind(pack.id, body.locale).first<any>()
    if (!ver) {
      const autoVersion = 'dev-' + new Date().toISOString().slice(0,19).replace(/[-:T]/g,'')
      await DB.prepare("UPDATE prompt_versions SET status='deprecated' WHERE pack_id = ? AND locale = ? AND status='active'").bind(pack.id, body.locale).run()
      await DB.prepare("INSERT INTO prompt_versions (pack_id, version, locale, status, metadata_json) VALUES (?, ?, ?, 'active', ?)")
        .bind(pack.id, autoVersion, body.locale, JSON.stringify({ created_by: body.actor || 'system' })).run()
      ver = await DB.prepare('SELECT id, version, status FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
        .bind(pack.id, autoVersion, body.locale).first<any>()
    }
  }

  if (!ver) return c.text('Could not resolve or create version', 500)

  await DB.prepare('UPDATE prompt_versions SET json_schema = ? WHERE id = ?').bind(schemaStr, ver.id).run()

  return c.json({ ok: true, version: ver.version })
})

export default router
