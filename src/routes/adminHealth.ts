import { Hono } from 'hono'
import { POLICY } from '../mw/csp'

export const adminHealth = new Hono()

function isDev(c: any) {
  if ((c.env as any)?.DEV === 'true') return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any)?.ADMIN_IP_ALLOWLIST || '')
    .split(',').map(s => s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

adminHealth.get('/admin/health', async (c) => {
  if (!isDev(c)) return c.text('Not allowed', 403)

  const kv = (c.env as any).KV_RL as KVNamespace | undefined
  const db = (c.env as any).DB as D1Database | undefined

  // KV check (write+read temporary key)
  let kvOk = false, kvMsg = 'not bound'
  if (kv) {
    try {
      const k = `health:${Date.now()}`
      await kv.put(k, 'ok', { expirationTtl: 60 })
      kvOk = (await kv.get(k)) === 'ok'
      kvMsg = kvOk ? 'ok' : 'get!=ok'
    } catch (e: any) { kvMsg = `error: ${e?.message || e}` }
  }

  // D1 check (simple pragma)
  let d1Ok = false, d1Msg = 'not bound'
  if (db) {
    try {
      const q = await db.prepare('SELECT 1 as ok').first<{ ok: number }>()
      d1Ok = q?.ok === 1
      d1Msg = d1Ok ? 'ok' : 'bad result'
    } catch (e: any) { d1Msg = `error: ${e?.message || e}` }
  }

  const origin = new URL(c.req.url).origin
  const ogUrl = new URL('/og', origin)
  ogUrl.searchParams.set('title', 'Concillio')
  ogUrl.searchParams.set('subtitle', 'Health OK')

  const payload = {
    env: { project: 'concillio', dev: (c.env as any)?.DEV === 'true' },
    kv_rl: { bound: !!kv, status: kvMsg },
    d1: { bound: !!db, status: d1Msg },
    csp: POLICY,
    og_image_example: ogUrl.toString(),
    ratelimit_policy: { burst_per_sec: 2, per_10min: 5, window_sec: 600 }
  }

  const html = `
  <html><head><meta charset="utf-8"/><title>Admin Health</title>
    <style>body{font-family:ui-sans-serif,system-ui;padding:20px}
    code{background:#f1f5f9;padding:2px 4px;border-radius:4px}</style>
  </head><body>
    <h1>Admin Health</h1>
    <p><b>ENV.dev:</b> ${payload.env.dev}</p>
    <p><b>KV_RL:</b> ${payload.kv_rl.status}</p>
    <p><b>D1:</b> ${payload.d1.status}</p>
    <p><b>CSP:</b> <code>${payload.csp}</code></p>
    <p><b>OG image:</b> <a href="${payload.og_image_example}" target="_blank">${payload.og_image_example}</a></p>
    <p><b>Rate limit:</b> burst ${payload.ratelimit_policy.burst_per_sec}/s, ${payload.ratelimit_policy.per_10min}/10min</p>
    <hr/>
    <details><summary>JSON</summary><pre>${JSON.stringify(payload,null,2)}</pre></details>
  </body></html>`
  return c.html(html)
})
