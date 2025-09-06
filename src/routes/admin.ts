import { Hono } from 'hono'
// @ts-ignore - Vite raw import for SQL
import schemaSql from '../../migrations/0001_prompts.sql?raw'
import { appendAuditKV, diffHash, signAudit } from '../utils/audit'
import Ajv from 'ajv'

const router = new Hono()

// Simple guard (DEV only): allow X-Admin-Token header OR Bearer token
function requireAdmin(c: any) {
  const must = c.env.ADMIN_TOKEN as string | undefined
  if (!must) return true
  const gotHeader = c.req.header('X-Admin-Token')
  const auth = c.req.header('Authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  return (gotHeader && gotHeader === must) || (bearer && bearer === must)
}

// Helper that returns boolean; some endpoints should 404 on unauthorized
function isAdminAuthorized(c: any): boolean {
  return requireAdmin(c)
}

// Optional admin audit table with hashed IP; 24h retention handled in cleanup
async function ensureAdminAudit(DB: D1Database) {
  try {
    await DB.exec(`CREATE TABLE IF NOT EXISTS admin_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      ua TEXT,
      ip_hash TEXT,
      typ TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`)
    // best-effort schema evolution
    try { await DB.exec("ALTER TABLE admin_audit ADD COLUMN typ TEXT").catch(()=>{}) } catch {}
  } catch {}
}
async function hmacHex(keyB64: string, text: string) {
  try {
    const raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0))
    const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
    return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2,'0')).join('')
  } catch {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('')
    } catch { return '' }
  }
}
async function adminAudit(c: any, path: string) {
  try {
    const DB = c.env.DB as D1Database
    await ensureAdminAudit(DB)
    const ua = c.req.header('User-Agent') || ''
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
    const ipSaltB64 = (c.env.AUDIT_HMAC_KEY as string) || ''
    const hash = ip ? await hmacHex(ipSaltB64 || btoa('concillio-default-salt'), String(ip)) : null
    await DB.prepare('INSERT INTO admin_audit (path, ua, ip_hash) VALUES (?, ?, ?)').bind(path, ua, hash).run()
  } catch {}
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

    // If browser expects HTML (form POST), render a tiny success card
    const accept = (c.req.header('Accept') || '').toLowerCase()
    const wantsHtml = /text\/html|application\/xhtml\+xml/.test(accept) || (new URL(c.req.url).searchParams.get('ui') === '1')
    if (wantsHtml) {
      const ts = new Date().toISOString().replace('T',' ').replace('Z','')
      const affected = Array.from(new Set(statements
        .map(s => (s.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i)?.[1] || s.match(/ALTER TABLE\s+(\w+)/i)?.[1] || '')
          .trim())
        .filter(Boolean)))
      const rows = affected.map(t => `<li class="text-neutral-200">${t}</li>`).join('') || '<li class="text-neutral-400">(no-op)</li>'
      const html = `<!doctype html><html><head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Migrate – OK</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head><body class="bg-neutral-950 text-neutral-100">
        <section class="max-w-xl mx-auto p-6">
          <div class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5">
            <div class="text-green-400 font-semibold">Migration successful</div>
            <div class="text-neutral-400 text-sm mt-1">${ts}</div>
            <div class="mt-3 text-neutral-300">Tables created/altered:</div>
            <ul class="list-disc pl-6 mt-1">${rows}</ul>
            <div class="mt-4">
              <a href="/admin" class="inline-flex items-center px-3 py-1.5 rounded border border-neutral-700 text-neutral-300 hover:text-neutral-100">Back to Admin</a>
            </div>
          </div>
        </section>
      </body></html>`
      return c.html(html)
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

// Admin analytics: top CTA in last N days (default 7)
router.get('/api/admin/analytics/cta/top', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  const days = Math.max(1, Math.min(365, Number(c.req.query('days') || 7)))
  try {
    // If table doesn't exist, return empty
    const res = await DB.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_cta'`).first<any>()
    if (!res) return c.json({ ok: true, days, items: [] })
    const rows = await DB.prepare(
      `SELECT cta, COUNT(*) AS n
       FROM analytics_cta
       WHERE datetime(ts_server) >= datetime('now', ?)
       GROUP BY cta
       ORDER BY n DESC
       LIMIT 50`
    ).bind(`-${days} days`).all<any>()
    const items = (rows?.results || []).map((r: any) => ({ cta: r.cta, count: Number(r.n || 0) }))
    return c.json({ ok: true, days, items })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
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

// --- Admin analytics summary API (used by experiments view & curl) ---
router.get('/api/admin/analytics/summary', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const DB = c.env.DB as D1Database
  const days = Math.max(1, Math.min(365, Number(c.req.query('days') || 7)))
  // Ensure table exists; if not, return zeros
  const has = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
  if (!has) return c.json({ ok: true, days, funnel: { ask_start: 0, ask_submit: 0, submit_rate_pct: 0 }, by_variant: [] })

  // Determine time column (ts_server if exists, else created_at)
  let timeCol = 'ts_server'
  try {
    const tbl = await DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
    const sql = String(tbl?.sql || '').toLowerCase()
    const hasTsServer = /\bts_server\b/.test(sql)
    const hasCreatedAt = /\bcreated_at\b/.test(sql)
    const hasTsClient = /\bts_client\b/.test(sql)
    if (hasTsServer) timeCol = 'ts_server'
    else if (hasCreatedAt) timeCol = 'created_at'
    else if (hasTsClient) timeCol = 'ts_client'
    else timeCol = ''
  } catch { timeCol = '' }

  // Helper: COUNT by event with optional variant label match (A/B)
  const countEvent = async (event: string, variant?: string) => {
    const where: string[] = ["event = ?"]
    const params: any[] = [event]
    if (timeCol) { where.push(`datetime(${timeCol}) >= datetime('now', ?)`); params.push(`-${days} days`) }
    if (variant) { where.push("label LIKE ?"); params.push(`%${variant}%`) }
    const row = await DB.prepare(`SELECT COUNT(*) AS n FROM analytics_council WHERE ${where.join(' AND ')}`).bind(...params).first<any>()
    return Number(row?.n || 0)
  }

  const ask_start_total = await countEvent('ask_start')
  const ask_submit_total = await countEvent('ask_submit')
  const funnel = {
    ask_start: ask_start_total,
    ask_submit: ask_submit_total,
    submit_rate_pct: ask_start_total ? Math.round((ask_submit_total / ask_start_total) * 1000) / 10 : 0
  }

  const variants = ['A','B']
  const by_variant = [] as any[]
  for (const v of variants) {
    const ask_start = await countEvent('ask_start', v)
    const ask_submit = await countEvent('ask_submit', v)
    const copy_bullets = await countEvent('copy_bullets', v)
    const copy_summary = await countEvent('copy_summary', v)
    const copy_rationale = await countEvent('copy_rationale', v)
    const pdf_download = await countEvent('pdf_download', v)
    by_variant.push({ variant: v, ask_start, ask_submit, submit_rate_pct: ask_start ? Math.round((ask_submit/ask_start)*1000)/10 : 0, copy_bullets, copy_summary, copy_rationale, pdf_download })
  }

  return c.json({ ok: true, days, funnel, by_variant })
})

// --- SSR: Experiments overview (minimal markup) ---
router.get('/admin/experiments', async (c) => {
  if (!requireAdmin(c)) return c.text('Forbidden', 403)
  const days = Math.max(1, Math.min(365, Number(c.req.query('days') || 7)))
  const DB = c.env.DB as D1Database
  // Build analytics directly to avoid nested fetch instability in local dev
  const has = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
  const safeData = { ok: true, days, funnel: { ask_start: 0, ask_submit: 0, submit_rate_pct: 0 }, by_variant: [] as any[] }
  if (has) {
    let timeCol = 'ts_server'
    try {
      const tbl = await DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
      const sql = String(tbl?.sql || '').toLowerCase()
      const hasTsServer = /\bts_server\b/.test(sql)
      const hasCreatedAt = /\bcreated_at\b/.test(sql)
      const hasTsClient = /\bts_client\b/.test(sql)
      if (hasTsServer) timeCol = 'ts_server'; else if (hasCreatedAt) timeCol = 'created_at'; else if (hasTsClient) timeCol = 'ts_client'; else timeCol = ''
    } catch { timeCol = '' }
    const countEvent = async (event: string, variant?: string) => {
      const where: string[] = ["event = ?"]
      const params: any[] = [event]
      if (timeCol) { where.push(`datetime(${timeCol}) >= datetime('now', ?)`); params.push(`-${days} days`) }
      if (variant) { where.push("label LIKE ?"); params.push(`%${variant}%`) }
      const row = await DB.prepare(`SELECT COUNT(*) AS n FROM analytics_council WHERE ${where.join(' AND ')}`).bind(...params).first<any>()
      return Number(row?.n || 0)
    }
    const ask_start_total = await countEvent('ask_start')
    const ask_submit_total = await countEvent('ask_submit')
    safeData.funnel.ask_start = ask_start_total
    safeData.funnel.ask_submit = ask_submit_total
    safeData.funnel.submit_rate_pct = ask_start_total ? Math.round((ask_submit_total / ask_start_total) * 1000) / 10 : 0
    for (const v of ['A','B']) {
      const ask_start = await countEvent('ask_start', v)
      const ask_submit = await countEvent('ask_submit', v)
      const copy_bullets = await countEvent('copy_bullets', v)
      const copy_summary = await countEvent('copy_summary', v)
      const copy_rationale = await countEvent('copy_rationale', v)
      const pdf_download = await countEvent('pdf_download', v)
      safeData.by_variant.push({ variant: v, ask_start, ask_submit, submit_rate_pct: ask_start ? Math.round((ask_submit/ask_start)*1000)/10 : 0, copy_bullets, copy_summary, copy_rationale, pdf_download })
    }
  }
  const data: any = safeData

  function esc(s: any){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'} as any)[m]) }
  function row(v: any){
    return `<tr><td>${esc(v.variant)}</td><td>${esc(v.ask_start)}</td><td>${esc(v.ask_submit)}</td><td>${esc(v.submit_rate_pct)}%</td><td>${esc(v.copy_bullets)}</td><td>${esc(v.copy_summary)}</td><td>${esc(v.copy_rationale)}</td><td>${esc(v.pdf_download)}</td></tr>`
  }
  const rows = Array.isArray(data.by_variant) ? data.by_variant.map(row).join('') : ''

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Experiments</title>
    <link rel="stylesheet" href="/static/style.css"/>
    <script src="https://cdn.tailwindcss.com"></script>
  </head><body class="bg-neutral-950 text-neutral-100">
  <section class="mx-auto max-w-5xl px-4 py-8">
    <h1 class="text-2xl mb-4">Experiments (last ${esc(data.days)} days)</h1>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="card p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg">
        <h2 class="text-lg mb-2">Funnel</h2>
        <p>Starts: ${esc(data.funnel?.ask_start)}</p>
        <p>Submits: ${esc(data.funnel?.ask_submit)}</p>
        <p>Submit rate: ${esc(data.funnel?.submit_rate_pct)}%</p>
      </div>

      <div class="card p-4 md:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-lg overflow-auto">
        <h2 class="text-lg mb-2">By variant</h2>
        <table class="w-full text-sm">
          <thead><tr><th class="text-left">Variant</th><th class="text-left">Starts</th><th class="text-left">Submits</th><th class="text-left">Submit %</th><th class="text-left">Copy bullets</th><th class="text-left">Copy summary</th><th class="text-left">Copy rationale</th><th class="text-left">PDF</th></tr></thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </section>
  </body></html>`

  return c.html(html)
})

// --- Protected Admin Index (404 on unauthorized) ---
router.get('/admin', async (c) => {
  if (!isAdminAuthorized(c)) return c.notFound()
  const DB = c.env.DB as D1Database
  await adminAudit(c, '/admin')
  const daysDefault = 7

  // Error badge: count last 60 minutes
  let err60 = 0
  try {
    await ensureAdminAudit(DB)
    const row = await DB.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE typ='error' AND datetime(created_at) >= datetime('now','-60 minutes')").first<any>()
    err60 = Number(row?.n || 0)
  } catch {}

  // Recent events from analytics_council (latest 25)
  let eventsHtml = '<div class="text-neutral-400 text-sm">No events yet</div>'
  try {
    const has = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
    if (has) {
      const res = await DB.prepare("SELECT event, label, path, ts_server FROM analytics_council ORDER BY id DESC LIMIT 25").all<any>()
      const rows = (res?.results || []) as any[]
      const esc = (s:any)=> String(s??'').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' } as any)[m])
      if (rows.length) {
        eventsHtml = `<table class="w-full text-sm"><thead><tr><th class="text-left">Event</th><th class="text-left">Label</th><th class="text-left">Path</th><th class="text-left">TS</th></tr></thead><tbody>`+
          rows.map(r=>`<tr><td>${esc(r.event)}</td><td>${esc(r.label)}</td><td>${esc(r.path)}</td><td>${esc(r.ts_server)}</td></tr>`).join('')+
          `</tbody></table>`
      }
    }
  } catch {}

  const html = `<!doctype html><html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  </head><body class="bg-neutral-950 text-neutral-100">
  <section class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-semibold flex items-center gap-2">Admin ${err60>0?`<span class=\"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-600/20 text-red-300 border border-red-700\" title=\"Errors last 60 min\">${err60}</span>`:''}</h1>

    <div class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5">
      <h2 class="text-lg mb-2">Analytics & Experiments</h2>
      <ul class="list-disc list-inside text-neutral-300">
        <li><a class="text-[var(--concillio-gold)] hover:underline" href="/admin/experiments?days=${daysDefault}">/admin/experiments?days=${daysDefault}</a></li>
        <li><a class="text-[var(--concillio-gold)] hover:underline" href="/api/admin/analytics/summary?days=${daysDefault}">/api/admin/analytics/summary?days=${daysDefault}</a></li>
      </ul>
    </div>

    <div class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5 space-y-4">
      <h2 class="text-lg">Maintenance</h2>
      <div class="flex items-center gap-3 flex-wrap">
        <form method="POST" action="/admin/migrate" class="inline">
          <button class="btn btn--primary px-3 py-1.5 rounded bg-[var(--gold)] text-black">Run migrate</button>
        </form>
      </div>
      <h3 class="text-md mt-3">Cleanup</h3>
      <form method="post" action="/api/admin/analytics/cleanup" class="flex items-center gap-3">
        <button class="px-4 py-2 rounded bg-[var(--gold)] text-black">Cleanup (env retention)</button>
        <span class="text-neutral-400 text-sm">Uses ANALYTICS_RETENTION_DAYS and ADMIN_AUDIT_RETENTION_HOURS</span>
      </form>
      <form method="post" action="/api/admin/sessions/cleanup" class="flex items-center gap-3">
        <button class="px-4 py-2 rounded bg-[var(--gold)] text-black">Cleanup Sessions</button>
        <span class="text-neutral-400 text-sm">Deletes revoked and expired sessions</span>
      </form>
    </div>

    <div class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-5">
      <h2 class="text-lg mb-2">Recent events</h2>
      ${eventsHtml}
    </div>
  </section>
  </body></html>`
  return c.html(html)
})

// --- Cleanup: Analytics (404 on unauthorized) ---
router.post('/api/admin/analytics/cleanup', async (c) => {
  if (!isAdminAuthorized(c)) return c.notFound()
  const DB = c.env.DB as D1Database
  await adminAudit(c, '/api/admin/analytics/cleanup')
  const envDays = Number((c.env as any).ANALYTICS_RETENTION_DAYS || 0)
  const days = Math.max(1, Math.min(3650, Number(c.req.query('days')) || (Number.isFinite(envDays) && envDays > 0 ? envDays : 90)))
  const cutoffClause = `datetime('now', ?)`
  const cutoffArg = `-${days} days`
  const auditHours = Math.max(1, Math.min(720, Number((c.env as any).ADMIN_AUDIT_RETENTION_HOURS || 24)))
  let delCouncil = 0, delCta = 0, delAudit = 0
  try {
    const hasCouncil = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
    const hasCta = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_cta'").first<any>()
    const hasAudit = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_audit'").first<any>()

    // Ensure performance indexes (idempotent)
    if (hasCouncil) {
      try { await DB.exec("CREATE INDEX IF NOT EXISTS idx_analytics_council_event_day ON analytics_council (event, substr(created_at,1,10))") } catch {}
    }
    if (hasCta) {
      try { await DB.exec("CREATE INDEX IF NOT EXISTS idx_analytics_cta_cta_day ON analytics_cta (cta, substr(created_at,1,10))") } catch {}
    }

    if (hasCouncil) {
      const row = await DB.prepare(`SELECT COUNT(*) AS n FROM analytics_council WHERE datetime(created_at) < ${cutoffClause}`).bind(cutoffArg).first<any>()
      delCouncil = Number(row?.n || 0)
      await DB.prepare(`DELETE FROM analytics_council WHERE datetime(created_at) < ${cutoffClause}`).bind(cutoffArg).run()
    }
    if (hasCta) {
      const row = await DB.prepare(`SELECT COUNT(*) AS n FROM analytics_cta WHERE datetime(created_at) < ${cutoffClause}`).bind(cutoffArg).first<any>()
      delCta = Number(row?.n || 0)
      await DB.prepare(`DELETE FROM analytics_cta WHERE datetime(created_at) < ${cutoffClause}`).bind(cutoffArg).run()
    }
    // Admin audit retention via ENV hours
    if (hasAudit) {
      const arg = `-${auditHours} hours`
      const row = await DB.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE datetime(created_at) < datetime('now', ?)").bind(arg).first<any>()
      delAudit = Number(row?.n || 0)
      await DB.prepare("DELETE FROM admin_audit WHERE datetime(created_at) < datetime('now', ?)").bind(arg).run()
    }
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
  return c.json({ ok: true, days, deleted: { council: delCouncil, cta: delCta, audit: delAudit }, audit_hours: auditHours })
})

// --- Cleanup: Sessions (404 on unauthorized) ---
router.post('/api/admin/sessions/cleanup', async (c) => {
  if (!isAdminAuthorized(c)) return c.notFound()
  const DB = c.env.DB as D1Database
  await adminAudit(c, '/api/admin/sessions/cleanup')
  let deleted = 0
  try {
    const has = await DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='sessions'").first<any>()
    if (!has) return c.json({ ok: true, deleted: 0 })
    const sql = String(has?.sql || '').toLowerCase()
    const hasRevoked = /\brevoked_at\b/.test(sql)
    const whereParts: string[] = []
    if (hasRevoked) whereParts.push('revoked_at IS NOT NULL')
    // expires_at might be TEXT; compare using datetime()
    whereParts.push("datetime(expires_at) <= datetime('now')")
    const where = whereParts.join(' OR ')
    const row = await DB.prepare(`SELECT COUNT(*) AS n FROM sessions WHERE ${where}`).first<any>()
    deleted = Number(row?.n || 0)
    await DB.exec(`DELETE FROM sessions WHERE ${where}`)
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
  return c.json({ ok: true, deleted })
})

export default router
