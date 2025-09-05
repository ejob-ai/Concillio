// src/routes/auth.ts
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { z } from 'zod'
import { hashPassword, verifyPassword, makeSaltB64 } from '../utils/auth'

type Bindings = {
  DB: D1Database
  AUTH_PEPPER: string
  SESSION_TTL_DAYS?: string
  AUDIT_HMAC_KEY?: string
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const Signup = z.object({ email: z.string().regex(emailRe), password: z.string().min(12) })
const Login  = z.object({ email: z.string().regex(emailRe), password: z.string().min(8) })

const SESSION_COOKIE = 'sid'

const auth = new Hono<{ Bindings: Bindings }>()

auth.post('/api/auth/signup', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = Signup.safeParse(body)
  if (!parsed.success) return c.json({ ok:false, error:'Invalid payload' }, 400)
  const { email, password } = parsed.data

  const db = c.env.DB
  const existing = await db.prepare('SELECT id FROM users WHERE email=?').bind(email).first()
  if (existing) return c.json({ ok:false, error:'Email already registered' }, 409)

  const saltB64 = makeSaltB64()
  const pepper = c.env.AUTH_PEPPER || ''
  const hashB64 = await hashPassword(password, saltB64, pepper)

  const res = await db.prepare(
    'INSERT INTO users (email, password_hash, password_salt) VALUES (?, ?, ?)'
  ).bind(email, hashB64, saltB64).run()

  const userId = (res as any)?.meta?.last_row_id as number
  const sid = crypto.randomUUID()
  const ttlDays = parseInt(c.env.SESSION_TTL_DAYS || '14', 10)
  const expires = new Date(Date.now() + ttlDays*86400_000).toISOString()
  const ua = c.req.header('user-agent') || ''
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(sid, userId, expires, ua).run()

  setCookie(c, SESSION_COOKIE, sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 })

  return c.json({ ok:true, user:{ id: userId, email } })
})

auth.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = Login.safeParse(body)
  if (!parsed.success) return c.json({ ok:false, error:'Invalid payload' }, 400)

  const { email, password } = parsed.data
  const db = c.env.DB
  const row = await db.prepare('SELECT id, password_hash, password_salt, disabled FROM users WHERE email=?').bind(email).first<{
    id: number, password_hash: string, password_salt: string, disabled: number
  }>()
  if (!row || row.disabled) return c.json({ ok:false, error:'Invalid credentials' }, 401)

  const ok = await verifyPassword(password, row.password_salt, (c.env.AUTH_PEPPER||''), row.password_hash)
  if (!ok) return c.json({ ok:false, error:'Invalid credentials' }, 401)

  // update last_login
  await db.prepare('UPDATE users SET last_login_at=datetime("now"), updated_at=datetime("now") WHERE id=?').bind(row.id).run()

  const sid = crypto.randomUUID()
  const ttlDays = parseInt(c.env.SESSION_TTL_DAYS || '14', 10)
  const expires = new Date(Date.now() + ttlDays*86400_000).toISOString()
  const ua = c.req.header('user-agent') || ''
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(sid, row.id, expires, ua).run()

  setCookie(c, SESSION_COOKIE, sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 })

  return c.json({ ok:true, user:{ id: row.id, email } })
})

auth.post('/api/auth/logout', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE)
  if (sid) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(sid).run()
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
  }
  return c.json({ ok:true })
})

auth.get('/api/me', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE)
  if (!sid) return c.json({ ok:false, user:null }, 200)
  const db = c.env.DB
  const sess = await db.prepare('SELECT user_id, expires_at FROM sessions WHERE id=?').bind(sid).first<{user_id:number,expires_at:string}>()
  if (!sess) return c.json({ ok:false, user:null }, 200)
  if (new Date(sess.expires_at).getTime() < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE id=?').bind(sid).run()
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return c.json({ ok:false, user:null }, 200)
  }
  const user = await db.prepare('SELECT id, email, created_at, last_login_at FROM users WHERE id=?').bind(sess.user_id).first()
  return c.json({ ok:true, user })
})

export default auth
