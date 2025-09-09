import { Hono } from 'hono'

export const adminAnalytics = new Hono()

function isDev(c:any) {
  if (c.env?.DEV === 'true') return true
  const ip = c.req.header('cf-connecting-ip') || ''
  const allow = (c.env?.ADMIN_IP_ALLOWLIST || '').split(',').map(s=>s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

adminAnalytics.get('/admin/analytics', async (c) => {
  if (!isDev(c)) return c.text('Not allowed', 403)
  const db = c.env.DB as D1Database
  const { results=[] } = await db.prepare(`
    SELECT id, req_id, event, role, model, latency_ms, cost_usd,
           prompt_tokens, completion_tokens, created_at,
           schema_version, prompt_version
    FROM analytics_council
    ORDER BY id DESC
    LIMIT 50
  `).all()

  const rows = results as any[]
  const html = `
  <html><head><meta charset="utf-8"/><title>Analytics</title>
    <style>body{font-family:ui-sans-serif,system-ui;padding:16px}
    table{border-collapse:collapse;width:100%} th,td{padding:6px 8px;border:1px solid #e5e7eb;font-size:12px}
    th{background:#f8fafc;text-align:left} code{font-family:ui-monospace,Menlo,monospace}</style>
  </head><body>
    <h1>Analytics (latest 50)</h1>
    <table>
      <thead><tr>
        <th>id</th><th>req_id</th><th>event</th><th>role</th><th>model</th>
        <th>latency_ms</th><th>cost_usd</th><th>prompt</th><th>completion</th>
        <th>schema_v</th><th>prompt_v</th><th>created_at</th>
      </tr></thead>
      <tbody>
        ${rows.map(r=>`
          <tr>
            <td>${r.id}</td>
            <td><code>${r.req_id||''}</code></td>
            <td>${r.event}</td>
            <td>${r.role||''}</td>
            <td>${r.model||''}</td>
            <td>${r.latency_ms??''}</td>
            <td>${r.cost_usd??''}</td>
            <td>${r.prompt_tokens??''}</td>
            <td>${r.completion_tokens??''}</td>
            <td>${r.schema_version||''}</td>
            <td>${r.prompt_version||''}</td>
            <td>${r.created_at||''}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </body></html>`
  return c.html(html)
})

// JSON endpoint for internal SDK
adminAnalytics.get('/admin/analytics.json', async (c) => {
  if (!isDev(c)) return c.json({ ok:false, error:'Not allowed' }, 403)
  const db = c.env.DB as D1Database
  const limit = Math.min(parseInt(c.req.query('limit') || '50',10) || 50, 200)
  const sql = `
    SELECT id, req_id, event, role, model,
           latency_ms, cost_usd, prompt_tokens, completion_tokens,
           schema_version, prompt_version, created_at
    FROM analytics_council
    ORDER BY id DESC
    LIMIT ?`
  const { results = [] } = await db.prepare(sql).bind(limit).all()
  return c.json({ rows: results })
})
