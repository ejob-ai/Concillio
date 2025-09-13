// src/routes/seed_lineups.ts
import { Hono } from 'hono'
import { LINEUPS } from '../content/lineups'

// Bindings for this route
type SeedEnv = {
  DB: D1Database
  ADMIN_TOKEN?: string
  DEV?: string | boolean
}

const seed = new Hono<{ Bindings: SeedEnv }>()

// Guard: allow in dev or with admin token
seed.use('*', async (c, next) => {
  const isDev = (String(c.env?.DEV) === 'true') || (c.env?.DEV === true)
  const allow = (c.req.header('X-Admin-Token') || '') === (c.env?.ADMIN_TOKEN || '')
  if (!isDev && !allow) return c.json({ ok: false, error: 'forbidden' }, 403)
  await next()
})

seed.post('/admin/seed/lineups', async (c) => {
  const DB = c.env.DB

  // Ensure tables exist (use the same schema as /api/lineups/presets)
  await DB.exec(`
    CREATE TABLE IF NOT EXISTS lineups_presets (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS lineups_preset_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE,
      role_key TEXT NOT NULL,
      weight REAL NOT NULL,
      position INTEGER NOT NULL,
      note TEXT,
      UNIQUE(preset_id, position)
    );
  `)

  let presetsUpserted = 0
  let rolesInserted = 0

  for (const L of LINEUPS) {
    // Upsert preset by numeric id from content
    await DB.prepare(
      `INSERT INTO lineups_presets (id, name, is_public)
       VALUES (?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, is_public=1`
    ).bind(L.id, L.name).run()

    // Replace roles for this preset
    await DB.prepare('DELETE FROM lineups_preset_roles WHERE preset_id = ?').bind(L.id).run()
    const comp = Array.isArray(L.composition) ? L.composition : []
    for (const r of comp) {
      await DB.prepare(
        `INSERT INTO lineups_preset_roles (preset_id, role_key, weight, position, note)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(L.id, String(r.role_key).toUpperCase(), Number(r.weight || 0), Number(r.position || 0), r.note || null).run()
      rolesInserted++
    }
    presetsUpserted++
  }

  return c.json({ ok: true, presets: presetsUpserted, roles: rolesInserted })
})

// Maintenance: normalize role_key synonyms to canonical keys
seed.post('/admin/normalize/roles', async (c) => {
  const DB = c.env.DB
  let updPresetRoles = 0
  let updLegacyRoles = 0
  try {
    await DB.exec('BEGIN')
    // Normalize in primary table used by this app
    const n1 = await DB.prepare("UPDATE lineups_preset_roles SET role_key='CFO_ANALYST' WHERE UPPER(role_key) IN ('FINANCE','CFO','FINANCE_ANALYST')").run()
    const n2 = await DB.prepare("UPDATE lineups_preset_roles SET role_key='LEGAL_ADVISOR' WHERE UPPER(role_key) IN ('LEGAL','LEGAL_OBSERVER','LEGAL_COUNSEL')").run()
    updPresetRoles += (n1?.meta?.changes || 0) + (n2?.meta?.changes || 0)
    // Try to normalize legacy table if it exists
    try {
      const l1 = await DB.prepare("UPDATE lineup_roles SET role_key='CFO_ANALYST' WHERE UPPER(role_key) IN ('FINANCE','CFO','FINANCE_ANALYST')").run()
      const l2 = await DB.prepare("UPDATE lineup_roles SET role_key='LEGAL_ADVISOR' WHERE UPPER(role_key) IN ('LEGAL','LEGAL_OBSERVER','LEGAL_COUNSEL')").run()
      updLegacyRoles += (l1?.meta?.changes || 0) + (l2?.meta?.changes || 0)
    } catch (_) { /* legacy table may not exist, ignore */ }
    await DB.exec('COMMIT')
  } catch (e) {
    try { await DB.exec('ROLLBACK') } catch {}
    return c.json({ ok: false, error: (e as any)?.message || 'normalization failed' }, 500)
  }
  return c.json({ ok: true, updated: { lineups_preset_roles: updPresetRoles, legacy_lineup_roles: updLegacyRoles } })
})

export default seed
