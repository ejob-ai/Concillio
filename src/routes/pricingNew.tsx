import { Hono } from 'hono'
import type { Context } from 'hono'
import { renderPricing } from './pricing'

const router = new Hono()

router.get('/pricing-new', (c: Context) => {
  try {
    c.header('X-Pricing-Route', 'v2')
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    c.header('Pragma', 'no-cache')
    c.header('Expires', '0')
    const head = (c.get as any)?.('head') || {}
    ;(c.set as any)?.('head', { ...head, xPricingRoute: 'v2', robots: 'noindex, nofollow', canonical: 'https://concillio.pages.dev/pricing' })
  } catch {}
  return renderPricing(c)
})

export default router
