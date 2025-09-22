// src/routes/checkout.tsx
import { Hono } from 'hono'

const router = new Hono()

router.get('/checkout', (c) => {
  const u = new URL(c.req.url)
  const plan = (u.searchParams.get('plan') || 'starter').toLowerCase()
  const qty = Number(u.searchParams.get('quantity') || '1') || 1

  const fwd = new URL('/api/billing/checkout/start', u.origin)
  fwd.searchParams.set('plan', plan)
  fwd.searchParams.set('quantity', String(qty))
  // Bevara alla utm_*
  u.searchParams.forEach((v, k) => {
    if (k.toLowerCase().startsWith('utm_')) fwd.searchParams.set(k, v)
  })

  try { (c.set as any)?.('head', { robots: 'noindex,nofollow' }) } catch {}
  return Response.redirect(fwd.toString(), 302)
})

export default router
