import { Hono } from 'hono'
import { resolvePriceId } from '../../config/stripe-prices'

const billing = new Hono()

billing.post('/api/billing/checkout', async (c) => {
  // Optional secret – if missing, report not configured
  const stripeKey = (c.env as any)?.STRIPE_SECRET
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

  // PSEUDO: In real integration, call Stripe REST API
  // Build canonical success/cancel URLs per requirement
  // NOTE: Use absolute production URLs for Stripe
  const successUrl = `https://concillio.pages.dev/thank-you?plan=${encodeURIComponent(plan)}`
  const cancelUrl = `https://concillio.pages.dev/checkout?plan=${encodeURIComponent(plan)}`

  // using fetch() with the secret, e.g.
  // await fetch('https://api.stripe.com/v1/checkout/sessions', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     'line_items[0][price]': priceId,
  //     'line_items[0][quantity]': '1',
  //     'mode': 'subscription',
  //     // Step 3 requirement:
  //     'success_url': successUrl,   // https://concillio.pages.dev/thank-you?plan={PLAN}
  //     'cancel_url': cancelUrl,     // https://concillio.pages.dev/checkout?plan={PLAN}
  //     // Flatten UTM into metadata
  //     'metadata[plan]': plan,
  //     ...(utm ? Object.fromEntries(Object.entries(utm).map(([k,v]) => [`metadata[${k}]`, String(v)])) : {}),
  //   })
  // })
  // Then: const session = await resp.json(); return c.json({ ok:true, url: session.url });

  // Stubbed redirect for now
  return c.json({ ok: true, url: '/thank-you?plan=' + encodeURIComponent(plan) })
})

export default billing
