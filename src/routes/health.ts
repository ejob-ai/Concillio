import { Hono } from 'hono'

const router = new Hono()

// Health for analytics endpoint (GET)
router.get('/api/analytics/council', (c) => c.json({ ok: true, kind: 'health' }))

// GET helper for council consult: redirect to /demo when mock flags are present
router.get('/api/council/consult', (c) => {
  const url = new URL(c.req.url)
  const lang = url.searchParams.get('lang') || 'en'
  const mock = url.searchParams.get('mock')
  const mockV2 = url.searchParams.get('mock_v2')
  if (mock === '1' || mockV2 === '1') {
    const q = url.searchParams.get('q') || 'Demo question'
    const ctx = url.searchParams.get('ctx') || 'Demo context'
    const v2 = mockV2 === '1' ? '&mock_v2=1' : ''
    const qs = `mock=1${v2}&lang=${encodeURIComponent(lang)}&q=${encodeURIComponent(q)}&ctx=${encodeURIComponent(ctx)}`
    return c.redirect(`/demo?${qs}`, 302)
  }
  return c.json({ ok: false, error: 'Use POST /api/council/consult' }, 405)
})

export default router
