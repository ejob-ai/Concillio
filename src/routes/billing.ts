import { Hono } from 'hono'
import { resolvePriceId } from '../../config/stripe-prices'

const billing = new Hono()

billing.post('/api/billing/checkout', async (c) => {
  // Optional secret – if missing, report not configured
  const stripeKey = (c.env as any)?.STRIPE_SECRET_KEY || (c.env as any)?.STRIPE_SECRET
  if (!stripeKey) {
    return c.json({ ok: false, code: 'PAYMENT_NOT_CONFIGURED' }, 501)
  }

  const body = await c.req.json().catch(() => ({} as any))
  const planRaw = (body as any)?.plan
  const utm = (body as any)?.utm || null
  const plan = String(planRaw || 'starter').toLowerCase()

  // Map plan -> Stripe price id via config
  let priceId = ''
  try { priceId = resolvePriceId(plan) } catch { return c.json({ ok:false, code:'UNKNOWN_PLAN', plan }, 400) }

  // Build canonical success/cancel URLs per requirement
  const base = (c.env as any)?.SITE_URL || (c.env as any)?.APP_BASE_URL || (new URL(c.req.url)).origin
  const origin = String(base || '').replace(/\/$/, '')
  const successUrl = `${origin}/thank-you?plan=${encodeURIComponent(plan)}`
  const cancelUrl = `${origin}/checkout?plan=${encodeURIComponent(plan)}`

  // Using fetch() with the secret (commented until you enable live Stripe)
  // const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${stripeKey}`,
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Idempotency-Key': crypto.randomUUID()
  //   },
  //   body: new URLSearchParams({
  //     'line_items[0][price]': priceId,
  //     'line_items[0][quantity]': '1',
  //     'mode': 'subscription',
  //     'success_url': successUrl,
  //     'cancel_url': cancelUrl,
  //     'metadata[plan]': plan,
  //     ...(utm ? Object.fromEntries(Object.entries(utm).map(([k,v]) => [`metadata[${k}]`, String(v)])) : {}),
  //   })
  // })
  // const session = await resp.json().catch(() => ({} as any));
  // if (!resp.ok) return c.json({ ok:false, code:'STRIPE_ERROR', message: session?.error?.message || 'stripe' }, 400)
  // return c.json({ ok:true, url: session.url })

  // Stubbed redirect for now
  return c.json({ ok: true, url: '/thank-you?plan=' + encodeURIComponent(plan) })
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
