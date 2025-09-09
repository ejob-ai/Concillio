import { Hono } from 'hono'

export const scheduleRouter = new Hono()

function isDev(c:any) {
  if (c.env?.DEV === 'true') return true
  const ip = c.req.header('cf-connecting-ip') || ''
  const allow = (c.env?.ADMIN_IP_ALLOWLIST || '').split(',').map(s=>s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

async function costToday(db: D1Database) {
  const since = new Date(); since.setUTCHours(0,0,0,0)
  const { results=[{sum:0}] } = await db.prepare(`
    SELECT ROUND(COALESCE(SUM(cost_usd),0),6) AS sum
    FROM analytics_council
    WHERE created_at >= ?
  `).bind(since.toISOString().replace('T',' ').replace('Z','')).all()
  return (results[0] as any).sum || 0
}

scheduleRouter.get('/admin/cost-check', async (c) => {
  if (!isDev(c)) return c.text('Not allowed', 403)
  const db = c.env.DB as D1Database
  const sum = await costToday(db)
  const limit = parseFloat((c.env as any).COST_LIMIT_USD || '5')
  const hook = (c.env as any).COST_WEBHOOK_URL as string | undefined

  // Build per-role breakdown for today (UTC)
  const since = new Date(); since.setUTCHours(0,0,0,0)
  const sinceIso = since.toISOString().replace('T',' ').replace('Z','')
  const { results: roleRows = [] } = await db.prepare(`
    SELECT role, ROUND(SUM(cost_usd),6) AS sum
    FROM analytics_council
    WHERE created_at >= ? AND role IS NOT NULL
    GROUP BY role
    ORDER BY sum DESC
  `).bind(sinceIso).all() as any
  const byRole = roleRows

  if (hook && sum > limit) {
    try {
      await fetch(hook, { method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ type:'cost_alert', sum_usd: sum, limit, by_role: byRole, ts: new Date().toISOString() }) })
    } catch {}
  }
  return c.json({ ok:true, sum_usd: sum, limit, by_role: byRole, alerted: hook? sum>limit:false })
})
