// PATCH 5 — src/routes/sessions.ts (API-skeleton v1)
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { requireEnv, optionalEnv } from '../lib/env'
import { getSession, deleteSession, ensureUserByEmail } from '../lib/db'

const router = new Hono()

const SESSION_COOKIE = 'sid'

// POST /api/sessions/dev-login  (preview-only helper)
// Body: { email }
router.post('/api/sessions/dev-login', async (c) => {
  const prod = (() => { try { return (String((c.env as any)?.ENV || '').toLowerCase() === 'production') } catch { return false } })()
  if (prod) return c.json({ ok:false, error:'forbidden' }, 403)
  const body = await c.req.json().catch(()=>({})) as any
  const email = String(body.email || '').trim().toLowerCase()
  if (!email) return c.json({ ok:false, error:'email required' }, 400)
  const DB = c.env.DB as D1Database
  const uid = await ensureUserByEmail(DB, email)
  const sid = crypto.randomUUID()
  const ttlDays = parseInt(optionalEnv(c, 'SESSION_TTL_DAYS', '14') || '14', 10)
  const expires = new Date(Date.now() + ttlDays*86400_000).toISOString()
  const ua = c.req.header('user-agent') || ''
  await DB.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)').bind(sid, uid, expires, ua).run()
  setCookie(c, SESSION_COOKIE, sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 })
  return c.json({ ok:true, user:{ id: uid, email }, sid, expires })
})

// DELETE /api/sessions/current → logout
router.delete('/api/sessions/current', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE)
  if (!sid) return c.json({ ok:true })
  await deleteSession(c.env.DB as D1Database, sid)
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok:true })
})

// GET /api/sessions/current → whoami
router.get('/api/sessions/current', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE)
  if (!sid) return c.json({ ok:false, user:null })
  const sess = await getSession(c.env.DB as D1Database, sid)
  if (!sess) return c.json({ ok:false, user:null })
  const user = await (c.env.DB as D1Database).prepare('SELECT id,email,verified,stripe_customer_id FROM users WHERE id=?').bind(sess.user_id).first()
  return c.json({ ok:true, user })
})

export default router
