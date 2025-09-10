import { Hono } from 'hono'

const adminAudit = new Hono()

function allowed(c: any) {
  const dev = String((c.env as any).DEV || '').toLowerCase() === 'true'
  if (dev) return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any).ADMIN_IP_ALLOWLIST || '')
  return allow.split(',').map((s) => s.trim()).filter(Boolean).includes(ip)
}

adminAudit.get('/admin/audit', async (c) => {
  if (!allowed(c)) return c.text('Forbidden', 403)
  const kv = (c.env as any).AUDIT_LOG_KV as KVNamespace | undefined
  if (!kv) return c.text('KV not configured', 500)
  const day = c.req.query('day') || new Date().toISOString().slice(0, 10)
  const prefix = `audit:${day}:`
  const list = await kv.list({ prefix })
  const items = await Promise.all((list.keys || []).map((k) => kv.get(k.name)))
  const lines = items.filter(Boolean).map(String)
  const html = `<h1>Audit ${day}</h1><pre style="white-space:pre-wrap">${lines
    .map((x) => x.replace(/</g, '&lt;'))
    .join('\n')}</pre>`
  return c.html(html)
})

export default adminAudit
