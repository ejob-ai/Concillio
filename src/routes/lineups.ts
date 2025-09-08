import { Hono } from 'hono'

import { getCookie, setCookie } from 'hono/cookie'

const lineupsRouter = new Hono()

// minimal local validators to avoid bundling zod here
function isNumber(x: any) { return typeof x === 'number' && !isNaN(x) }
function isInt(x: any) { return isNumber(x) && Number.isInteger(x) }


// Helper: get or set uid cookie (UUID v4), renew TTL to 180 days on activity
function ensureUidCookie(c: any): string {
  const existing = getCookie(c, 'uid')
  const reUuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  let uid = existing && reUuidV4.test(existing) ? existing : crypto.randomUUID()
  const expire = new Date(Date.now() + 180*24*60*60*1000)
  setCookie(c, 'uid', uid, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    expires: expire
  })
  return uid
}

// GET /api/lineups?public=1 | ?mine=1
lineupsRouter.get('/api/lineups', async (c) => {
  try {
    const DB = c.env.DB as D1Database
    if (!DB) return c.json({ ok: false, error: 'No DB binding' }, 500)

    const url = new URL(c.req.url)
    const isPublic = url.searchParams.get('public') === '1'
    const isMine = url.searchParams.get('mine') === '1'

    if (isPublic) {
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
    }

    if (isMine) {
      const uid = ensureUidCookie(c)
      const rows = await DB.prepare(
        `SELECT l.id as lineup_id, l.name, l.owner_uid, l.is_public, l.created_at, l.updated_at,
                r.role_key, r.weight, r.position
           FROM user_lineups l
      LEFT JOIN user_lineup_roles r ON r.lineup_id = l.id
          WHERE l.owner_uid = ?
       ORDER BY l.id ASC, r.position ASC`
      ).bind(uid).all()

      type Row = { lineup_id: number; name: string; owner_uid: string; is_public: number|null; created_at?: string|null; updated_at?: string|null; role_key?: string|null; weight?: number|null; position?: number|null }
      const map = new Map<number, any>()
      for (const row of (rows.results||[]) as Row[]) {
        if (!map.has(row.lineup_id)) {
          map.set(row.lineup_id, {
            id: row.lineup_id,
            owner_uid: row.owner_uid,
            name: row.name,
            is_public: row.is_public ?? 0,
            created_at: row.created_at || undefined,
            updated_at: row.updated_at || undefined,
            roles: [] as Array<{ role_key: string; weight: number; position: number }>
          })
        }
        if (row.role_key) {
          map.get(row.lineup_id).roles.push({ role_key: row.role_key!, weight: row.weight||0, position: row.position||0 })
        }
      }
      const lineups = Array.from(map.values())
      return c.json({ ok: true, count: lineups.length, lineups })
    }

    return c.json({ ok: false, error: 'Unsupported query. Use ?public=1 or ?mine=1' }, 400)
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

// POST /api/lineups/clone { preset_id, name? }
lineupsRouter.post('/api/lineups/clone', async (c) => {
  try {
    const DB = c.env.DB as D1Database
    const uid = ensureUidCookie(c)
    const body = await c.req.json().catch(() => ({}))
    const presetId = Number(body?.preset_id)
    if (!presetId || isNaN(presetId)) return c.json({ ok: false, error: 'preset_id required' }, 400)

    const preset = await DB.prepare(
      `SELECT id, name, audience, focus FROM lineups_presets WHERE id = ?`
    ).bind(presetId).first<{ id: number; name: string; audience?: string|null; focus?: string|null }>()
    if (!preset) return c.json({ ok: false, error: 'preset not found' }, 404)

    const rolesRes = await DB.prepare(
      `SELECT role_key, weight, position FROM lineups_preset_roles WHERE preset_id = ? ORDER BY position ASC`
    ).bind(presetId).all<{ role_key: string; weight: number; position: number }>()

    const name = (body?.name && String(body.name).trim()) || `${preset.name} – Min`

    // Insert lineup
    const ins = await DB.prepare(`INSERT INTO user_lineups (owner_uid, name, is_public, created_at, updated_at) VALUES (?, ?, 0, datetime('now'), datetime('now'))`).bind(uid, name).run()
    const lineupId = (ins.meta as any)?.last_row_id

    // Insert roles
    for (const r of (rolesRes.results||[])) {
      await DB.prepare(`INSERT INTO user_lineup_roles (lineup_id, role_key, weight, position) VALUES (?, ?, ?, ?)`).bind(lineupId, r.role_key, r.weight, r.position).run()
    }

    return c.json({ ok: true, id: lineupId })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

// Normalize weights to sum ~1.0 (avoid div-by-zero)
function normalizeWeights(roles: Array<{ role_key: string; weight: number; position: number }>) {
  const sum = roles.reduce((a, b) => a + (Number(b.weight)||0), 0)
  if (sum <= 0) return roles.map(r => ({ ...r, weight: 0 }))
  return roles.map(r => ({ ...r, weight: Number(r.weight)/sum }))
}

const ALLOWED_DB_ROLES = new Set(['strategist','futurist','psychologist','advisor'])

function normalizeIncomingRoles(input: any): { ok: true, roles: Array<{ role_key: string; weight: number; position: number }> } | { ok: false, error: any } {
  try {
    if (!Array.isArray(input)) return { ok: false, error: 'roles must be an array' }
    const arr = input.map((r: any) => ({
      role_key: String((r && (r.role_key ?? r.role)) || '').toUpperCase().trim(),
      weight: Number((r && r.weight) ?? 0),
      position: Number((r && r.position) ?? 0)
    }))
    for (const r of arr) {
      if (!r.role_key) return { ok: false, error: 'role_key required' }
      if (!Number.isFinite(r.weight) || r.weight < 0) return { ok: false, error: 'weight must be >= 0' }
      if (!Number.isInteger(r.position)) return { ok: false, error: 'position must be integer' }
    }
    const lowered = arr.map(r => ({ role_key: r.role_key.toLowerCase(), weight: r.weight, position: r.position }))
    for (const r of lowered) {
      if (!ALLOWED_DB_ROLES.has(r.role_key)) {
        return { ok: false, error: `role_key ${r.role_key} not supported in current DB` }
      }
    }
    return { ok: true, roles: lowered }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

// POST /api/lineups/save { lineup_id?, name, roles: RoleWeight[] }
lineupsRouter.post('/api/lineups/save', async (c) => {
  try {
    const DB = c.env.DB as D1Database
    const uid = ensureUidCookie(c)
    const body = await c.req.json()

    const name = String(body?.name||'').trim()
    const lineup_id = body?.lineup_id != null ? Number(body.lineup_id) : undefined
    const rolesIn = Array.isArray(body?.roles) ? body.roles : null
    if (!name || !rolesIn) return c.json({ ok: false, error: 'name and roles required' }, 400)

    // validate/normalize incoming roles (accept uppercase RoleKey etc.)
    const normIn = normalizeIncomingRoles(rolesIn)
    if (!normIn.ok) return c.json({ ok: false, error: String((normIn as any).error) }, 400)

    // normalize weights
    const normalizedRoles = normalizeWeights(normIn.roles)

    if (!isNumber(lineup_id)) {
      // create
      const ins = await DB.prepare(`INSERT INTO user_lineups (owner_uid, name, is_public, created_at, updated_at) VALUES (?, ?, 0, datetime('now'), datetime('now'))`).bind(uid, name.trim()).run()
      const lineupId = (ins.meta as any)?.last_row_id
      // roles
      for (const r of normalizedRoles) {
        await DB.prepare(`INSERT INTO user_lineup_roles (lineup_id, role_key, weight, position) VALUES (?, ?, ?, ?)`).bind(lineupId, r.role_key, r.weight, r.position).run()
      }
      return c.json({ ok: true, id: lineupId })
    } else {
      // update: verify ownership
      const row = await DB.prepare(`SELECT owner_uid FROM user_lineups WHERE id = ?`).bind(lineup_id).first<{ owner_uid: string }>()
      if (!row || row.owner_uid !== uid) return c.json({ ok: false, error: 'not found' }, 404)
      await DB.prepare(`UPDATE user_lineups SET name = ?, updated_at = datetime('now') WHERE id = ?`).bind(name.trim(), lineup_id).run()
      // replace roles
      await DB.prepare(`DELETE FROM user_lineup_roles WHERE lineup_id = ?`).bind(lineup_id).run()
      for (const r of normalizedRoles) {
        await DB.prepare(`INSERT INTO user_lineup_roles (lineup_id, role_key, weight, position) VALUES (?, ?, ?, ?)`).bind(lineup_id, r.role_key, r.weight, r.position).run()
      }
      return c.json({ ok: true, id: lineup_id })
    }
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

export default lineupsRouter
