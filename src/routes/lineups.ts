import { Hono } from 'hono'
import { LINEUPS } from '../content/lineups'

const router = new Hono()

router.get('/api/lineups/presets', async (c) => {
  const DB = c.env.DB as D1Database
  try {
    await DB.exec(`CREATE TABLE IF NOT EXISTS lineups_presets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, is_public INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
                   CREATE TABLE IF NOT EXISTS lineups_preset_roles (id INTEGER PRIMARY KEY AUTOINCREMENT, preset_id INTEGER NOT NULL REFERENCES lineups_presets(id) ON DELETE CASCADE, role_key TEXT NOT NULL, weight REAL NOT NULL, position INTEGER NOT NULL, UNIQUE(preset_id, position));`)
  } catch {}
  // Return all presets, public and private, so the selector always shows the full set (admins/testers expect ~10 presets)
  const rs = await DB.prepare(`SELECT p.id, p.name, p.is_public,
                                   json_group_array(CASE WHEN r.role_key IS NOT NULL THEN json_object('role_key', r.role_key, 'weight', r.weight, 'position', r.position) END) AS roles
                            FROM lineups_presets p
                            LEFT JOIN lineups_preset_roles r ON r.preset_id = p.id
                            GROUP BY p.id
                            ORDER BY p.id`).all()
  let rows = rs.results || []
  if (!rows.length) {
    // Fallback: derive presets from the documentation content (/docs/lineups) so names/weights match exactly
    rows = (LINEUPS || []).map(l => ({
      id: l.id,
      name: l.name,
      is_public: 1,
      roles: JSON.stringify(l.composition.map(r => ({ role_key: r.role_key, weight: r.weight, position: r.position })))
    })) as any
  }
  return c.json({ ok: true, presets: rows })
})

export default router
