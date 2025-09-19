import { Hono } from 'hono'
import { resolvePriceId } from '../../config/stripe-prices'

const billing = new Hono()

billing.post('/api/billing/checkout', async (c) => {
  // Read payload
  const body = await c.req.json().catch(() => ({} as any))
  const plan = String((body as any)?.plan || '').toLowerCase()
  const quantity = Number((body as any)?.quantity ?? 1) || 1
  const orgId = (body as any)?.orgId || ''
  const utm = (body as any)?.utm || null
  if (!plan) return c.json({ error: 'MISSING_PLAN' }, 400)

  // Resolve price id
  let priceId = ''
  try { priceId = resolvePriceId(plan) } catch { return c.json({ error: 'UNKNOWN_PLAN' }, 400) }

  // Env + URL base
  const env = c.env as any
  const STRIPE_KEY = env?.STRIPE_SECRET_KEY || env?.STRIPE_SECRET
  if (!STRIPE_KEY) return c.json({ error: 'PAYMENTS_NOT_CONFIGURED' }, 501)

  const origin = new URL(c.req.url).origin
  const base0 = env?.SITE_URL || env?.APP_BASE_URL || origin
  const base = String(base0 || '').replace(/\/$/, '')

  const success = `${base}/thank-you?plan=${encodeURIComponent(plan)}&session_id={CHECKOUT_SESSION_ID}`
  const cancel  = `${base}/checkout?plan=${encodeURIComponent(plan)}`

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': String(quantity),
    success_url: success,
    cancel_url: cancel,
    allow_promotion_codes: 'true',
    'subscription_data[metadata][org_id]': String(orgId || ''),
    'automatic_tax[enabled]': 'true',
    'metadata[plan]': plan,
  })
  // Flatten UTM into metadata if provided
  if (utm && typeof utm === 'object') {
    for (const [k, v] of Object.entries(utm)) {
      params.append(`metadata[utm_${k}]`, String(v))
    }
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: params,
  })
  const data: any = await resp.json().catch(() => ({} as any))
  if (!resp.ok) return c.json({ error: data?.error?.message || 'STRIPE_ERROR' }, 400)
  return c.json({ url: data?.url })
})

// Customer Portal: create a Billing Portal session (POST /api/billing/portal)
billing.post('/api/billing/portal', async (c) => {
  try {
    const stripeKey = (c.env as any)?.STRIPE_SECRET_KEY || (c.env as any)?.STRIPE_SECRET
    if (!stripeKey) return c.json({ error: 'PAYMENT_NOT_CONFIGURED' }, 501)

    const body = await c.req.json().catch(() => ({} as any))
    const customerId = String((body as any)?.customerId || '')
    if (!customerId) return c.json({ error: 'MISSING_CUSTOMER' }, 400)

    const base = (c.env as any)?.SITE_URL || (c.env as any)?.APP_BASE_URL || (new URL(c.req.url)).origin
    const origin = String(base || '').replace(/\/$/, '')
    const params = new URLSearchParams({
      customer: customerId,
      return_url: `${origin}/app/billing`
    })

    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: params,
    })

    const data: any = await res.json().catch(() => ({} as any))
    if (!res.ok) {
      try { console.error('stripe.portal error', data) } catch {}
      return c.json({ error: data?.error?.message || 'STRIPE_ERROR' }, 400)
    }
    return c.json({ url: data?.url })
  } catch (e: any) {
    try { console.error('portal exception', e) } catch {}
    return c.json({ error: e?.message || 'INTERNAL_ERROR' }, 500)
  }
})

export default billing
