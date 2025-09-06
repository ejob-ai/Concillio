// src/routes/auth.ts
import { Hono } from 'hono'
import { rateLimit } from '../middleware/rateLimit'
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
const Signup = z.object({ email: z.string().regex(emailRe), password: z.string().min(12), remember: z.boolean().optional() })
const Login  = z.object({ email: z.string().regex(emailRe), password: z.string().min(8), remember: z.boolean().optional() })

const SESSION_COOKIE = 'sid'

const auth = new Hono<{ Bindings: Bindings }>()

// Strict rate limit for auth endpoints: 5 req/min per IP/tenant
auth.use('/api/auth/*', rateLimit({ burst: 5, sustained: 5, windowSec: 60 }))

auth.post('/api/auth/signup', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = Signup.safeParse(body)
  if (!parsed.success) return c.json({ ok:false, error:'Invalid payload' }, 400)
  const { email, password, remember } = parsed.data

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

  // Issue verification token (valid 24h)
  const vt = crypto.randomUUID()
  const vexp = new Date(Date.now() + 24*3600_000).toISOString()
  await db.prepare('INSERT INTO verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(vt, userId, vexp).run()
  // TODO: send email with link: /api/auth/verify?token=' + vt
  const sid = crypto.randomUUID()
  let ttlDays = parseInt(c.env.SESSION_TTL_DAYS || '14', 10)
  if (remember === true) ttlDays = Math.max(ttlDays, 30)
  const expires = new Date(Date.now() + ttlDays*86400_000).toISOString()
  const ua = c.req.header('user-agent') || ''
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(sid, userId, expires, ua).run()

  setCookie(c, SESSION_COOKIE, sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 })

  // Issue CSRF cookie at signup as well
  try { setCookie(c, 'csrf', crypto.randomUUID(), { path: '/', secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 }) } catch {}
  return c.json({ ok:true, user:{ id: userId, email }, verification: { sent: true } })
})

auth.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = Login.safeParse(body)
  if (!parsed.success) return c.json({ ok:false, error:'Invalid payload' }, 400)

  const { email, password, remember } = parsed.data
  const db = c.env.DB
  const row = await db.prepare('SELECT id, password_hash, password_salt, disabled, verified FROM users WHERE email=?').bind(email).first<{
    id: number, password_hash: string, password_salt: string, disabled: number, verified: number
  }>()
  if (!row || row.disabled) return c.json({ ok:false, error:'Invalid credentials' }, 401)
  if (!row.verified) return c.json({ ok:false, error:'Email not verified' }, 403)

  const ok = await verifyPassword(password, row.password_salt, (c.env.AUTH_PEPPER||''), row.password_hash)
  if (!ok) return c.json({ ok:false, error:'Invalid credentials' }, 401)

  // update last_login
  await db.prepare('UPDATE users SET last_login_at=datetime("now"), updated_at=datetime("now") WHERE id=?').bind(row.id).run()

  const sid = crypto.randomUUID()
  let ttlDays = parseInt(c.env.SESSION_TTL_DAYS || '14', 10)
  if (remember === true) ttlDays = Math.max(ttlDays, 30)
  const expires = new Date(Date.now() + ttlDays*86400_000).toISOString()
  const ua = c.req.header('user-agent') || ''
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(sid, row.id, expires, ua).run()

  setCookie(c, SESSION_COOKIE, sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 })

  // Issue CSRF cookie for future POSTs (double-submit); not HttpOnly so client can echo it in header
  try { setCookie(c, 'csrf', crypto.randomUUID(), { path: '/', secure: true, sameSite: 'Lax', maxAge: ttlDays*86400 }) } catch {}
  return c.json({ ok:true, user:{ id: row.id, email } })
})

// CSRF helper: double-submit cookie check
function readCookies(header: string | null): Record<string,string> {
  const out: Record<string,string> = {}
  if (!header) return out
  for (const part of header.split(/;\s*/)) {
    const [k, v] = part.split('=')
    if (k && v) out[k.trim()] = decodeURIComponent(v)
  }
  return out
}

auth.post('/api/auth/logout', async (c) => {
  // CSRF: require x-csrf-token header matching csrf cookie (double-submit)
  const hdr = c.req.header('x-csrf-token') || ''
  const csrfCookie = getCookie(c, 'csrf') || ''
  if (!hdr || !csrfCookie || hdr !== csrfCookie) {
    return c.json({ ok:false, error:'CSRF' }, 403)
  }

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

auth.get('/api/auth/verify', async (c) => {
  const t = c.req.query('token') || ''
  if (!t) return c.json({ ok:false, error:'Missing token' }, 400)
  const db = c.env.DB
  const rec = await db.prepare('SELECT user_id, expires_at, used_at FROM verification_tokens WHERE token=?').bind(t).first<{user_id:number,expires_at:string,used_at:string|null}>()
  if (!rec) return c.json({ ok:false, error:'Invalid token' }, 400)
  if (rec.used_at) return c.json({ ok:false, error:'Already used' }, 400)
  if (new Date(rec.expires_at).getTime() < Date.now()) return c.json({ ok:false, error:'Expired' }, 400)
  await db.prepare('UPDATE users SET verified=1, updated_at=datetime("now") WHERE id=?').bind(rec.user_id).run()
  await db.prepare('UPDATE verification_tokens SET used_at=datetime("now") WHERE token=?').bind(t).run()
  return c.json({ ok:true })
})

export default auth
