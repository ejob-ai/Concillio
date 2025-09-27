import { Hono } from 'hono'

const roles = new Hono()

// Map incoming slugs to canonical role anchor slugs under /docs/roller
const roleSlugMap: Record<string, string> = {
  strategist: 'strategist',
  'chief-strategist': 'strategist',
  'risk-officer': 'risk-officer',
  'financial-analyst': 'financial-analyst',
  // fyll på vid behov
}

// Redirect /roles → canonical docs page
roles.get('/roles', (c) => c.redirect('/docs/roller', 301))

// Redirect /roles/:slug → docs anchor
roles.get('/roles/:slug', (c) => {
  const raw = (c.req.param('slug') || '').toLowerCase()
  const target = roleSlugMap[raw] || raw
  return c.redirect(`/docs/roller#${encodeURIComponent(target)}`, 301)
})

export default roles
