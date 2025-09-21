import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

const router = new Hono()

function isProdHost(hostname: string) {
  try {
    return hostname === 'concillio.pages.dev'
  } catch {
    return false
  }
}

router.get('/api/test-login', async (c) => {
  try { (c.set as any)?.('routeName', 'api:test-login') } catch {}

  // Deny on production host
  const u = new URL(c.req.url)
  if (isProdHost(u.hostname)) {
    return c.json({ error: 'forbidden' }, 403)
  }

  const DB = (c.env as any)?.DB as D1Database | undefined
  if (!DB) return c.json({ error: 'database unavailable' }, 500)

  const email = c.req.query('email') || 'test@example.com'
  const stripeId = c.req.query('stripe') || 'cus_test_123'

  // Ensure user exists (users table requires password_hash and password_salt)
  let user = await DB.prepare('SELECT id, email, stripe_customer_id FROM users WHERE email=?')
    .bind(email)
    .first<{ id: number; email: string; stripe_customer_id?: string | null }>()
    .catch(() => null)

  if (!user) {
    const salt = btoa(String(Math.random())).slice(0, 24)
    const hash = btoa(String(Math.random())).slice(0, 44)
    // Insert minimal user
    await DB.prepare('INSERT INTO users (email, password_hash, password_salt, stripe_customer_id) VALUES (?, ?, ?, ?)')
      .bind(email, hash, salt, stripeId)
      .run()
    user = await DB.prepare('SELECT id, email, stripe_customer_id FROM users WHERE email=?')
      .bind(email)
      .first<{ id: number; email: string; stripe_customer_id?: string | null }>()
  } else {
    // Ensure stripe_customer_id present
    if (!user.stripe_customer_id) {
      await DB.prepare('UPDATE users SET stripe_customer_id=? WHERE id=?').bind(stripeId, user.id).run()
      user.stripe_customer_id = stripeId
    }
  }

  // Ensure org mapped to stripe customer
  try {
    await DB.prepare('INSERT OR IGNORE INTO org (id, name, stripe_customer_id) VALUES (?, ?, ?)')
      .bind(`org_${user!.id}`, null, user!.stripe_customer_id)
      .run()
  } catch {}

  // Ensure active subscription for org (best-effort)
  try {
    const org = await DB.prepare('SELECT id FROM org WHERE stripe_customer_id=?')
      .bind(user!.stripe_customer_id)
      .first<{ id: string }>()
    if (org?.id) {
      const sub = await DB.prepare('SELECT id FROM subscription WHERE org_id=? ORDER BY created_at DESC LIMIT 1')
        .bind(org.id)
        .first<{ id: string }>()
      if (!sub) {
        await DB.prepare('INSERT INTO subscription (id, org_id, plan, status, seats, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(`sub_${Date.now()}`, org.id, 'starter', 'active', 1, Math.floor(Date.now() / 1000))
          .run()
      } else {
        await DB.prepare('UPDATE subscription SET status=?, plan=?, updated_at=? WHERE id=?')
          .bind('active', 'starter', Math.floor(Date.now() / 1000), sub.id)
          .run()
      }
    }
  } catch {}

  // Create session (expires in 1h) – sessions.expires_at expects ISO-8601 per migrations
  const sid = (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`
  const expiresAtISO = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  await DB.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(sid, user!.id, expiresAtISO, c.req.header('User-Agent') || '')
    .run()

  // Set session cookie
  try {
    setCookie(c, 'sid', sid, {
      path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3600,
    })
  } catch {}

  return c.json({ ok: true, user: { id: user!.id, email: user!.email, stripe_customer_id: user!.stripe_customer_id } })
})

export default router
