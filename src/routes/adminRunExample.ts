import { Hono } from 'hono'
import { rolesRegistry } from '../plugins'
import { completeJSON } from '../llm/provider'

export const adminRunExample = new Hono()

function isDev(c: any) {
  if ((c.env as any)?.DEV === 'true') return true
  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || ''
  const allow = String((c.env as any)?.ADMIN_IP_ALLOWLIST || '')
    .split(',').map(s => s.trim()).filter(Boolean)
  return allow.length ? allow.includes(ip) : false
}

adminRunExample.get('/admin/run-example', async (c) => {
  if (!isDev(c)) return c.json({ ok:false, error: 'Not allowed' }, 403)

  const EX = (rolesRegistry as any).EXAMPLE
  if (!EX) return c.json({ ok:false, error: 'EXAMPLE role not registered' }, 500)

  const system = EX.systemPrompt || 'You are EXAMPLE. Return JSON.'
  const user = EX.buildUserPrompt ? EX.buildUserPrompt({ question: 'Should we pilot in the US?', context: { goal: 'profitable growth', horizon_months: 12 } }) : 'Question: test'

  const output = await completeJSON(c.env as any, {
    system,
    user,
    schemaName: EX.schemaName || 'EXAMPLE_OUTPUT',
    temperature: 0.1,
    maxTokens: 600,
  })

  return c.json({ ok: true, version: EX.version || 'unknown', output })
})
