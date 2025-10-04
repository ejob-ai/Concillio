import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { computePackHash, loadPromptPack } from '../utils/prompts'

const router = new Hono()

router.get('/api/prompts/:pack', async (c) => {
  const packSlug = c.req.param('pack')
  const locale = c.req.query('locale') || 'sv-SE'
  const cookiePinned = getCookie(c, 'concillio_version')
  const pinned = c.req.query('version') || c.req.header('X-Prompts-Version') || cookiePinned || undefined

  const pack = await loadPromptPack(c.env as any, packSlug, locale, pinned)
  const etag = await computePackHash(pack)

  const inm = c.req.header('If-None-Match')
  if (inm && inm === etag) return c.body(null, 304)

  // Sticky pinning cookie (30 days) - persist resolved active version
  setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })

  c.header('ETag', etag)
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return c.json({ pack })
})

export default router
