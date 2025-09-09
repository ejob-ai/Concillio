import { Hono } from 'hono'

export const adminCost = new Hono()


function isDev(c:any){
  if ((c.env as any)?.DEV==='true') return true
  const ip = c.req.header('cf-connecting-ip') || ''
  const allow = String((c.env as any)?.ADMIN_IP_ALLOWLIST || '').split(',').map(s=>s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

async function sum(db:D1Database, fromIso:string){
  const from = fromIso.replace('T',' ').replace('Z','')
  const {results=[{sum:0}]} = await db.prepare(
    `SELECT ROUND(COALESCE(SUM(cost_usd),0),6) AS sum
     FROM analytics_council WHERE created_at >= ?`
  ).bind(from).all()
  return (results[0] as any).sum || 0
}

async function perRole(db: D1Database, fromIso: string){
  const from = fromIso.replace('T',' ').replace('Z','')
  const { results = [] } = await db.prepare(`
    SELECT role, ROUND(SUM(cost_usd),6) AS sum
    FROM analytics_council
    WHERE created_at >= ? AND role IS NOT NULL
    GROUP BY role
    ORDER BY sum DESC
  `).bind(from).all()
  return results as Array<{ role: string|null, sum: number }>
}

adminCost.post('/admin/cost-check', async (c) => {
  if(!isDev(c)) return c.text('Not allowed',403)
  const db = c.env.DB as D1Database
  const now = new Date()
  const d0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = await sum(db, d0.toISOString())
  const limit = parseFloat((c.env as any).COST_LIMIT_USD || '5')
  const over = Number(day) > Number(limit)
  return c.json({ ok: true, today_usd: Number(day), limit_usd: Number(limit), over_limit: over })
})

adminCost.get('/admin/cost', async (c)=>{
  if(!isDev(c)) return c.text('Not allowed',403)
  const db = c.env.DB as D1Database
  const now = new Date()
  const d0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const d7 = new Date(d0); d7.setUTCDate(d0.getUTCDate()-7)
  const day = await sum(db, d0.toISOString())
  const week = await sum(db, d7.toISOString())
  const dayBy = await perRole(db, d0.toISOString())
  const weekBy = await perRole(db, d7.toISOString())
  const limit = parseFloat((c.env as any).COST_LIMIT_USD || '5')
  const table = (rows: Array<{role:string|null,sum:number}>) => `
    <table style="border-collapse:collapse;min-width:320px">
      <thead><tr>
        <th style="text-align:left;border:1px solid #e5e7eb;padding:6px 8px">Role</th>
        <th style="text-align:right;border:1px solid #e5e7eb;padding:6px 8px">Sum (USD)</th>
      </tr></thead>
      <tbody>
        ${rows.map(r=>`<tr>
          <td style="border:1px solid #e5e7eb;padding:6px 8px">${r.role||''}</td>
          <td style="border:1px solid #e5e7eb;padding:6px 8px;text-align:right">$${Number(r.sum||0).toFixed(4)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`
  const html = `<html><head><meta charset="utf-8"/><title>Cost</title>
  <style>body{font-family:ui-sans-serif,system-ui;padding:16px} .k{font-size:28px}</style></head>
  <body><h1>OpenAI cost</h1>
  <p>Today (UTC): <span class="k">$${Number(day).toFixed(4)}</span> / limit $${Number(limit).toFixed(2)}</p>
  <p>Last 7 days: <span class="k">$${Number(week).toFixed(4)}</span></p>
  <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));margin-top:16px">
    <div><h3>Per role today</h3>${table(dayBy)}</div>
    <div><h3>Per role (7 days)</h3>${table(weekBy)}</div>
  </div>
  <p style="margin-top:16px"><a href="/admin/cost-check">Run cost-check now</a></p>
  <section class="mt-8">
    <div id="top-roles-box" class="p-4 border rounded bg-white/60 dark:bg-slate-900/40"></div>
  </section>
  <script src="/static/admin-cost-top-roles.js" defer></script>
  </body></html>`
  return c.html(html)
})
