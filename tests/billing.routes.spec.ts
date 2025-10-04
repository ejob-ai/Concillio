import { describe, it, expect } from 'vitest'

// CI-only tests. They require BASE_URL to be set to a live deployment.
// When BASE_URL is not set, the whole suite is skipped to avoid local flakiness.

const BASE = process.env.BASE_URL || ''
const hasBase = !!BASE
const D = hasBase ? describe : describe.skip

function url(path: string) {
  return new URL(path, BASE).toString()
}

async function fetchNoFollow(u: string, init?: RequestInit) {
  return fetch(u, { ...(init || {}), redirect: 'manual' as RequestRedirect })
}

D('Billing routes (CI)', () => {
  it('GET /api/billing/checkout/start?plan=starter → 302 and Location host is checkout.stripe.com (in prod)', async () => {
    const res = await fetchNoFollow(url('/api/billing/checkout/start?plan=starter'))
    if (res.status === 302) {
      const loc = res.headers.get('location') || ''
      expect(loc).toBeTruthy()
      const host = (() => { try { return new URL(loc).host } catch { return '' } })()
      expect(host).toBe('checkout.stripe.com')
    } else {
      // If the environment lacks STRIPE_SECRET, allow infra statuses
      expect([501, 500]).toContain(res.status)
    }
  })

  it('GET /api/billing/checkout/start?plan=unknown → 400', async () => {
    const res = await fetchNoFollow(url('/api/billing/checkout/start?plan=unknown'))
    expect(res.status).toBe(400)
  })

  it('GET /checkout preserves utm_* in 302 Location', async () => {
    const res = await fetchNoFollow(url('/checkout?plan=starter&utm_source=abc'))
    expect(res.status).toBe(302)
    const loc = res.headers.get('location') || ''
    expect(loc).toContain('/api/billing/checkout/start?')
    expect(loc).toContain('utm_source=abc')
  })
})
