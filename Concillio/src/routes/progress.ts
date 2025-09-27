import { Hono } from 'hono'

const progressRouter = new Hono()

progressRouter.get('/api/progress/:pid', async (c) => {
  try {
    const pid = c.req.param('pid')
    if (!pid) return c.json({ ok: false, error: 'missing pid' }, 400)
    const kv = (c.env as any).AUDIT_LOG_KV as KVNamespace | undefined
    if (!kv) return c.json({ ok: false, error: 'no kv binding' }, 500)
    const key = `progress:${pid}`
    const val = await kv.get(key)
    if (!val) return c.json({ ok: true, status: 'unknown', progress_id: pid })
    try {
      const parsed = JSON.parse(val)
      return c.json(parsed)
    } catch {
      return c.json({ ok: true, raw: val, progress_id: pid })
    }
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

export default progressRouter
