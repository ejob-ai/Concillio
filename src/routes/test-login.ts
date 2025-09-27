import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { nanoid } from 'nanoid'

export const testLogin = new Hono()

const enabled = (c: any) => String((c as any).env?.TEST_LOGIN_ENABLED || '') === '1'
const ok = (c: any) => enabled(c) && (c.req.header('x-test-auth') || '') === String((c as any).env?.TEST_LOGIN_TOKEN || '')
const authed = ok

testLogin.post('/api/test/login', async (c) => {
  try { (c.set as any)?.('routeName', 'api:test:login') } catch {}
  if (!ok(c)) return c.json({ error: 'forbidden' }, 403)

  const DB = (c.env as any)?.DB as D1Database | undefined
  if (!DB) return c.json({ error: 'database unavailable' }, 500)

  const body = await c.req.json().catch(() => ({} as any))
  const email = body.email || 'e2e-billing@example.com'
  const customerId = body.customerId || 'cus_e2e_123'
  const plan = String(body.plan || 'starter').toLowerCase()
  const status = String(body.status || 'active').toLowerCase()
  const seats = Number(body.seats || 1) || 1

  // Upsert user and stripe_customer_id
  let user = await DB.prepare('SELECT id, email, stripe_customer_id FROM users WHERE email=?')
    .bind(email)
    .first<{ id: number; email: string; stripe_customer_id?: string | null }>()
    .catch(() => null)
  if (!user) {
    // users schema requires password_hash and password_salt
    const salt = btoa(String(Math.random())).slice(0, 24)
    const hash = btoa(String(Math.random())).slice(0, 44)
    await DB.prepare('INSERT INTO users (email, password_hash, password_salt, stripe_customer_id) VALUES (?, ?, ?, ?)')
      .bind(email, hash, salt, customerId)
      .run()
    user = await DB.prepare('SELECT id, email, stripe_customer_id FROM users WHERE email=?')
      .bind(email)
      .first<{ id: number; email: string; stripe_customer_id?: string | null }>()
  } else if (!user.stripe_customer_id) {
    await DB.prepare('UPDATE users SET stripe_customer_id=? WHERE id=?').bind(customerId, user.id).run()
    user.stripe_customer_id = customerId
  }

  // Upsert org linked to customerId
  const orgId = `org_${customerId}`
  await DB.prepare(`
    INSERT INTO org (id, stripe_customer_id, name) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET stripe_customer_id=excluded.stripe_customer_id
  `).bind(orgId, customerId, 'E2E Org').run()

  // Upsert subscription as latest state
  const now = Math.floor(Date.now() / 1000)
  const subId = `sub_${customerId}`
  const periodEnd = now + 30 * 24 * 3600
  await DB.prepare(`
    INSERT INTO subscription (id, org_id, stripe_subscription_id, plan, status, seats, current_period_end, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET plan=excluded.plan, status=excluded.status, seats=excluded.seats, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at
  `).bind(subId, orgId, `stripe_${subId}`, plan, status, seats, periodEnd, now, now).run()

  // Create session (expires in 1h) using ISO string to match schema
  const sid = nanoid()
  const expiresAtISO = new Date((now + 3600) * 1000).toISOString()
  await DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sid, user!.id, expiresAtISO)
    .run()

  setCookie(c, 'sid', sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3600 })
  return c.json({ ok: true })
})

testLogin.post('/api/test/logout', async (c) => {
  if (!authed(c)) return c.json({ error: 'forbidden' }, 403)
  try {
    const sid = getCookie(c, 'sid')
    if (sid) {
      const DB = (c.env as any)?.DB as D1Database | undefined
      if (DB) {
        await DB.prepare('DELETE FROM sessions WHERE id=?').bind(sid).run().catch(() => {})
      }
    }
    // Clear cookie (best-effort)
    deleteCookie(c, 'sid', { path: '/' })
    setCookie(c, 'sid', '', { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 0 })
  } catch (_) {
    // swallow – logout should be best-effort
  }
  return c.json({ ok: true })
})
