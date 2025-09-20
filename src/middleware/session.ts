import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'

// Attach authenticated user/session (if any) to the request context
// - c.set('session', { id, userId, expiresAt })
// - c.set('user', { id, email, stripeCustomerId? })
// Non-throwing: silently proceeds when no session/user is found
export async function attachSession(c: Context, next: Next) {
  try {
    const DB = (c.env as any)?.DB as D1Database | undefined
    if (!DB) return await next()

    const sid = getCookie(c, 'sid')
    if (!sid) return await next()

    const sess = await DB.prepare('SELECT user_id, expires_at FROM sessions WHERE id=?')
      .bind(sid)
      .first<{ user_id: number; expires_at: string }>()
      .catch(() => null)
    if (!sess) return await next()

    if (new Date(sess.expires_at).getTime() < Date.now()) {
      // Expired; do not attach
      return await next()
    }

    // Try to load user. Not all installations have stripe_customer_id yet.
    let user: any = null
    try {
      // Attempt to also fetch a potential stripe customer column (best-effort)
      user = await DB.prepare('SELECT id, email, stripe_customer_id FROM users WHERE id=?')
        .bind(sess.user_id)
        .first<any>()
    } catch {
      user = await DB.prepare('SELECT id, email FROM users WHERE id=?')
        .bind(sess.user_id)
        .first<any>()
    }

    if (user) {
      const u = {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripe_customer_id || user.stripeCustomerId || null,
      }
      try { (c.set as any)?.('session', { id: sid, userId: sess.user_id, expiresAt: sess.expires_at }) } catch {}
      try { (c.set as any)?.('user', u) } catch {}
    }
  } catch {
    // best-effort only
  }

  return next()
}
