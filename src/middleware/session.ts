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
      const u: any = {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripe_customer_id || user.stripeCustomerId || null,
      }

      // Enrich with subscription info if we have a Stripe customer id
      try {
        const customerId = u.stripeCustomerId
        if (customerId) {
          const org = await DB.prepare('SELECT id FROM org WHERE stripe_customer_id=?')
            .bind(customerId)
            .first<{ id: string }>()
          if (org?.id) {
            const sub = await DB.prepare('SELECT plan, status FROM subscription WHERE org_id=? ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 1')
              .bind(org.id)
              .first<{ plan: string | null; status: string | null }>()
            if (sub) {
              const normalizePlan = (s?: string | null) => {
                const v = String(s || '').toLowerCase()
                if (!v) return null
                if (v.includes('legacy')) return 'legacy'
                if (v.includes('pro')) return 'pro'
                if (v.includes('starter') || v.includes('basic') || v.includes('start')) return 'starter'
                if (v === 'free') return 'free'
                return null
              }
              u.subscriptionPlan = normalizePlan(sub.plan)
              u.subscriptionStatus = (sub.status || '').toLowerCase()
            }
          }
        }
      } catch {}

      try { (c.set as any)?.('session', { id: sid, userId: sess.user_id, expiresAt: sess.expires_at }) } catch {}
      try { (c.set as any)?.('user', u) } catch {}
    }
  } catch {
    // best-effort only
  }

  return next()
}
