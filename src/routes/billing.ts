import { Hono } from 'hono'
import { resolvePriceId } from '../../config/stripe-prices'

const billing = new Hono()

// GET /api/billing/checkout/start?plan=starter&quantity=1 → 302 redirect to Stripe Checkout
billing.get('/api/billing/checkout/start', async (c) => {
  try {
    const plan = String(c.req.query('plan') || '').toLowerCase()
    const quantity = Number(c.req.query('quantity') || '1') || 1
    if (!plan) return c.text('MISSING_PLAN', 400)

    // Resolve price id
    let priceId = ''
    try { priceId = resolvePriceId(plan) } catch { return c.text('UNKNOWN_PLAN', 400) }

    const env = c.env as any
    const STRIPE_KEY = env?.STRIPE_SECRET_KEY || env?.STRIPE_SECRET
    if (!STRIPE_KEY) return c.text('PAYMENTS_NOT_CONFIGURED', 501)

    const url = new URL(c.req.url)
    const origin = url.origin
    const base0 = env?.SITE_URL || env?.APP_BASE_URL || origin
    const base = String(base0 || '').replace(/\/$/, '')

    const success = `${base}/thank-you?plan=${encodeURIComponent(plan)}&session_id={CHECKOUT_SESSION_ID}`
    const cancel  = `${base}/pricing?plan=${encodeURIComponent(plan)}`

    // Collect utm_* into metadata
    const metadata: Record<string, string> = { plan }
    for (const [k, v] of url.searchParams.entries()) {
      if (k.startsWith('utm_') && v) {
        const key = `utm_${k.slice(4)}`
        metadata[key] = v
      }
    }
    // Server-side analytics log for CTA click
    try { console.log('click_pricing_cta', { plan, env: (env?.ENV || env?.NODE_ENV || 'unknown'), utm: Object.fromEntries(Object.entries(metadata).filter(([k]) => k.startsWith('utm_'))) }) } catch {}

    const params = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': String(quantity),
      success_url: success,
      cancel_url: cancel,
      allow_promotion_codes: 'true',
      'subscription_data[metadata][org_id]': '',
      'automatic_tax[enabled]': 'true',
      'metadata[plan]': plan,
    })
    // Add dynamic UTM metadata fields
    for (const [k, v] of Object.entries(metadata)) {
      if (k === 'plan') continue
      params.append(`metadata[${k}]`, String(v))
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
    if (!resp.ok || !data?.url) return c.text(String(data?.error?.message || 'STRIPE_ERROR'), 400)

    return Response.redirect(String(data.url), 302)
  } catch (e: any) {
    return c.text(String(e?.message || 'INTERNAL_ERROR'), 500)
  }
})

// Deprecated endpoint: POST /api/billing/checkout (use GET /api/billing/checkout/start)
// Temporary 410 Gone stub to catch old clients
// TODO: remove 410 stub after 2025-10-04
billing.all('/api/billing/checkout', (c) => {
  try { c.header('Cache-Control', 'no-store') } catch {}
  return c.json({ error: 'GONE', message: 'Use GET /api/billing/checkout/start?plan=…', since: '2025-09-20' }, 410)
})

// GET /api/billing/portal/start?customerId=cus_... → 302 redirect to Stripe Billing Portal
billing.get('/api/billing/portal/start', async (c) => {
  try {
    const url = new URL(c.req.url)
    const customerId = url.searchParams.get('customerId') || ''
    if (!customerId) return c.json({ error: 'MISSING_CUSTOMER_ID' }, 400)

    const env = c.env as any
    const STRIPE_KEY = env?.STRIPE_SECRET_KEY || env?.STRIPE_SECRET
    if (!STRIPE_KEY) return c.json({ error: 'PAYMENTS_NOT_CONFIGURED' }, 501)

    const base0 = env?.SITE_URL || env?.APP_BASE_URL || url.origin
    const base = String(base0 || '').replace(/\/$/, '')
    const returnUrl = `${base}/app/billing`

    const body = new URLSearchParams({
      customer: customerId,
      return_url: returnUrl,
    })

    const resp = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body,
    })

    const data: any = await resp.json().catch(() => ({} as any))
    if (!resp.ok || !data?.url) {
      const msg = data?.error?.message || 'STRIPE_ERROR'
      return c.json({ error: msg }, 400)
    }

    return Response.redirect(String(data.url), 302)
  } catch (e: any) {
    return c.json({ error: e?.message || 'INTERNAL_ERROR' }, 500)
  }
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

// Stripe Webhook with signature verification (no Stripe SDK – Workers-compatible)
billing.post('/api/billing/webhook', async (c) => {
  try {
    const env = c.env as any
    const whsec = env?.STRIPE_WEBHOOK_SECRET
    if (!whsec) return c.body('missing stripe webhook secret', 500)

    const sig = c.req.header('stripe-signature') || c.req.header('Stripe-Signature') || ''
    const raw = await c.req.text() // keep raw body

    // Parse Stripe-Signature header: t=timestamp, v1=signature[, v1=...]
    const parts = String(sig).split(',').map(s => s.trim()).filter(Boolean)
    const sigMap: Record<string,string[]> = {}
    for (const p of parts) {
      const [k, v] = p.split('=')
      if (!k || !v) continue
      if (!sigMap[k]) sigMap[k] = []
      sigMap[k].push(v)
    }
    const tStr = (sigMap['t'] || [])[0]
    const v1s = sigMap['v1'] || []
    if (!tStr || !v1s.length) return c.body('invalid signature', 400)

    // Tolerance (default 5 min)
    const ts = Number(tStr)
    if (!Number.isFinite(ts)) return c.body('invalid signature', 400)
    const now = Math.floor(Date.now() / 1000)
    const toleranceSec = 300
    if (Math.abs(now - ts) > toleranceSec) return c.body('invalid signature', 400)

    // Compute expected signature: HMAC-SHA256(secret, `${t}.${raw}`)
    async function hmacHex(secret: string, payload: string) {
      const keyData = new TextEncoder().encode(secret)
      const msgData = new TextEncoder().encode(payload)
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const sigBuf = await crypto.subtle.sign('HMAC', key, msgData)
      return [...new Uint8Array(sigBuf)].map(b => b.toString(16).padStart(2, '0')).join('')
    }
    const computed = await hmacHex(String(whsec), `${tStr}.${raw}`)

    // Constant-time compare against any provided v1 signature
    function timingSafeEqual(a: string, b: string): boolean {
      if (a.length !== b.length) return false
      let out = 0
      for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
      return out === 0
    }
    const match = v1s.some((v) => timingSafeEqual(computed, v))
    if (!match) return c.body('invalid signature', 400)

    // Verified – parse JSON
    let evt: any
    try { evt = JSON.parse(raw) } catch { return c.body('bad json', 400) }

    try { console.log('stripe.webhook', { type: evt?.type, id: evt?.id }) } catch {}

    switch (evt?.type) {
      case 'checkout.session.completed': {
        const s = evt?.data?.object || {}
        try { console.log('session.completed', { customer: s.customer, subscription: s.subscription, plan: s?.metadata?.plan || '(n/a)' }) } catch {}
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
      case 'customer.subscription.trial_will_end': {
        const obj = evt?.data?.object || {}
        try { console.log('sub.event', { t: evt?.type, sub: obj?.id, status: obj?.status }) } catch {}
        break
      }
      default:
        try { console.log('unhandled', evt?.type) } catch {}
    }
    return c.body('ok', 200)
  } catch (e: any) {
    try { console.error('webhook.error', e?.message || e) } catch {}
    return c.body('error', 500)
  }
})

export default billing
