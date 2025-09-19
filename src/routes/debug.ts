import { Hono } from 'hono'
const r = new Hono()

r.get('/_whoami', (c) => {
  return c.json({
    ok: true,
    routes: ['pricing:v2'],
    env: (c.env && (c.env as any).__ENV) || 'unknown',
    now: new Date().toISOString(),
  })
})

export default r
