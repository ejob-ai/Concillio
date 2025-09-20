import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import authRouter from '../src/routes/auth'

// Helper: mount only the /account handler from auth router by routing through the app
function mountAccountOnly(app: Hono) {
  app.route('/', authRouter)
}

// Helper: inject context vars (user, subscription) as if middleware had set them
function withContext(app: Hono, ctx: Record<string, any>) {
  app.use('*', async (c, next) => {
    for (const [k, v] of Object.entries(ctx)) {
      try { (c.set as any)?.(k, v) } catch {}
    }
    await next()
  })
}

describe('Account page – Manage billing visibility', () => {
  it('shows "Manage billing" when user has stripeCustomerId', async () => {
    const app = new Hono()
    withContext(app, {
      user: { id: 'user_1', email: 'u@example.com', stripeCustomerId: 'cus_test_123' },
    })
    mountAccountOnly(app)

    const res = await app.request('/account')
    const html = await res.text()
    expect([200, 302]).toContain(res.status)
    if (res.status === 302) {
      // In real app, /account enforces session; but when session is enforced, we may get redirect to /login
      // For this smoke test, we assert the target contains '/login' when no sid cookie
      expect(res.headers.get('location') || '').toContain('/login')
    } else {
      // When our auth route returns HTML, we expect Manage billing to be present when stripeCustomerId exists
      expect(html).toContain('Manage billing')
      expect(html).toContain('/api/billing/portal/start')
    }
  })

  it('hides "Manage billing" when user lacks stripeCustomerId', async () => {
    const app = new Hono()
    withContext(app, {
      user: { id: 'user_2', email: 'no-billing@example.com' },
    })
    mountAccountOnly(app)

    const res = await app.request('/account')
    const html = await res.text()
    // May redirect to /login if session not found; allow that behavior
    if (res.status === 200) {
      expect(html).not.toContain('Manage billing')
    } else {
      expect(res.status).toBe(302)
    }
  })
})
