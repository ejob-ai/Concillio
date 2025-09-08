import { Hono } from 'hono'

const lineupsRouter = new Hono()

// GET /api/lineups?public=1 -> return public presets with roles
lineupsRouter.get('/api/lineups', async (c) => {
  try {
    const DB = c.env.DB as D1Database
    if (!DB) return c.json({ ok: false, error: 'No DB binding' }, 500)

    const url = new URL(c.req.url)
    const isPublic = url.searchParams.get('public') === '1'

    if (!isPublic) {
      return c.json({ ok: false, error: 'Unsupported query. Use ?public=1' }, 400)
    }

    const res = await DB.prepare(
      `SELECT p.id as preset_id, p.name as preset_name, p.audience, p.focus, p.is_public,
              r.role_key, r.weight, r.position
         FROM lineups_presets p
    LEFT JOIN lineups_preset_roles r ON r.preset_id = p.id
        WHERE p.is_public = 1
     ORDER BY p.id ASC, r.position ASC`
    ).all()

    type Row = { preset_id: number; preset_name: string; audience: string|null; focus: string|null; is_public: number; role_key: string|null; weight: number|null; position: number|null }
    const rows = (res.results || []) as Row[]

    const map = new Map<number, any>()
    for (const row of rows) {
      if (!map.has(row.preset_id)) {
        map.set(row.preset_id, {
          id: row.preset_id,
          name: row.preset_name,
          audience: row.audience,
          focus: row.focus,
          is_public: row.is_public,
          roles: [] as Array<{ role_key: string; weight: number; position: number }>
        })
      }
      if (row.role_key) {
        map.get(row.preset_id).roles.push({ role_key: row.role_key, weight: row.weight || 0, position: row.position || 0 })
      }
    }

    const presets = Array.from(map.values())
    return c.json({ ok: true, count: presets.length, presets })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

export default lineupsRouter
