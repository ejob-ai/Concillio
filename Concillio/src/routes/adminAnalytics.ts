import { Hono } from 'hono'

const router = new Hono()

function isAllowed(c: any){
  if (String((c.env as any)?.DEV||'').toLowerCase()==='true') return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any)?.ADMIN_IP_ALLOWLIST || '').split(',').map((s:string)=>s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

router.get('/admin/analytics.json', async (c) => {
  if (!isAllowed(c)) return c.json({ ok: false, error: 'Not allowed' }, 403)
  const DB = c.env.DB as D1Database
  const limit = Math.max(1, Math.min(500, Number(c.req.query('limit') || 50)))
  try {
    const has = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_council'").first<any>()
    if (!has) return c.json({ ok: true, rows: [] })
    const res = await DB.prepare(`SELECT id, event, role, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, schema_version, prompt_version, created_at FROM analytics_council ORDER BY id DESC LIMIT ?`).bind(limit).all<any>()
    const rows = (res?.results || [])
    return c.json({ ok: true, rows })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

router.get('/admin/analytics', async (c) => {
  if (!isAllowed(c)) return c.text('Not allowed', 403)
  const html = `<!doctype html><html><head><meta charset='utf-8'/><title>Admin Analytics</title></head><body>
    <h1>Admin Analytics</h1>
    <p>JSON feed: <a href='/admin/analytics.json?limit=50'>/admin/analytics.json?limit=50</a></p>
  </body></html>`
  return c.html(html)
})

export default router
