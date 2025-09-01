import { Hono } from 'hono'
import { loadPromptPack, compileForRole } from '../utils/prompts'

const router = new Hono()

router.post('/api/advisor/try', async (c) => {
  const { OPENAI_API_KEY } = c.env as any
  if (!OPENAI_API_KEY) return c.json({ error: 'Missing OPENAI_API_KEY' }, 500)

  type Payload = {
    user_query: string
    context?: Record<string, unknown>
    expert_inputs: Record<string, unknown>
  }
  const body = await c.req.json<Payload>().catch(() => null)
  if (!body?.user_query || !body?.expert_inputs) return c.json({ error: 'Bad Request' }, 400)

  // Load current pack and build ADVISOR system prompt (BASE + ADVISOR overrides)
  const locale = 'sv-SE'
  const pack = await loadPromptPack(c.env as any, 'concillio-core', locale)
  const compiled = compileForRole(pack, 'ADVISOR', {
    question: body.user_query,
    context: body.context ? JSON.stringify(body.context) : ''
  } as any)

  // Build user message with provided expert inputs
  const userMsg = `Input to Advisor (JSON):\n${JSON.stringify({
    user_query: body.user_query,
    context: body.context || {},
    expert_inputs: body.expert_inputs
  })}`

  const t0 = Date.now()
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: compiled.system + '\n[Format] Svara ENDAST i giltig json utan extra text.' },
        { role: 'user', content: userMsg }
      ],
      temperature: (compiled.params?.temperature as number) ?? 0.3,
      response_format: { type: 'json_object' }
    })
  })
  const t1 = Date.now()
  const json: any = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const errText = typeof json?.error?.message === 'string' ? json.error.message : `status ${resp.status}`
    return c.json({ error: 'OpenAI: ' + errText }, 500)
  }
  const raw = json.choices?.[0]?.message?.content?.trim() || '{}'
  const s = raw.indexOf('{'); const e = raw.lastIndexOf('}')
  const text = (s !== -1 && e !== -1 && e > s) ? raw.slice(s, e + 1) : raw
  let data: any
  try { data = JSON.parse(text) } catch { data = { _raw: raw } }
  return c.json({ ok: true, data, usage: json.usage, latency_ms: t1 - t0, model: json.model })
})

export default router
