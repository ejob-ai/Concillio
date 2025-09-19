import { Hono } from 'hono'
import type { Context } from 'hono'
import { renderPricing } from './pricing'

const router = new Hono()

router.get('/pricing-new', (c: Context) => {
  // 410 Gone to retire the alias explicitly (optional)
  return c.text('This route has been removed. Please use /pricing', 410)
})

export default router
