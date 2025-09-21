import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { nanoid } from 'nanoid'

export const testLogin = new Hono()

function isEnabled(c: any) {
  return String(((c as any).env?.TEST_LOGIN_ENABLED ?? '')).trim() === '1'
}

testLogin.get('/api/test-login', async (c) => {
  try { (c.set as any)?.('routeName', 'api:test-login') } catch {}

  if (!isEnabled(c)) return c.json({ error: 'forbidden' }, 403)

  const DB = (c.env as any)?.DB as D1Database | undefined
  if (!DB) return c.json({ error: 'database unavailable' }, 500)

  const url = new URL(c.req.url)
  const email = url.searchParams.get('email') || 'test@example.com'
  const customerId = url.searchParams.get('customerId') || 'cus_test_123'
  const plan = (url.searchParams.get('plan') || 'starter').toLowerCase()
  const status = (url.searchParams.get('status') || 'active').toLowerCase()
  const seats = Number(url.searchParams.get('seats') || '1') || 1
  const orgId = url.searchParams.get('orgId') || `org_${nanoid(8)}`
  const subId = url.searchParams.get('subscriptionId') || `sub_${nanoid(8)}`
  const now = Math.floor(Date.now() / 1000)
  const periodEnd = now + 30 * 24 * 3600

  // users: ensure exists and set stripe_customer_id
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

  // org: upsert
  await DB.prepare(`
    INSERT INTO org (id, stripe_customer_id, name)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET stripe_customer_id=excluded.stripe_customer_id
  `).bind(orgId, customerId, `Test Org ${orgId.slice(-4)}`).run()

  // subscription: upsert latest status
  await DB.prepare(`
    INSERT INTO subscription (id, org_id, stripe_subscription_id, plan, status, seats, current_period_end, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET plan=excluded.plan, status=excluded.status, seats=excluded.seats, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at
  `).bind(subId, orgId, `stripe_${subId}`, plan, status, seats, periodEnd, now, now).run()

  // Create session (expires in 1h). Our schema stores ISO-8601 in sessions.expires_at
  const sid = nanoid()
  const expiresAtISO = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  await DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sid, user!.id, expiresAtISO)
    .run()

  setCookie(c, 'sid', sid, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3600 })

  return c.json({ ok: true, userId: user!.id, email, customerId, orgId, subscriptionId: subId, plan, status, seats })
})

testLogin.get('/api/test-logout', async (c) => {
  if (!isEnabled(c)) return c.json({ error: 'forbidden' }, 403)
  deleteCookie(c, 'sid', { path: '/' })
  return c.json({ ok: true })
})
