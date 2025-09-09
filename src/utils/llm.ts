// Lightweight LLM adapter: OpenAI + mock provider
// Cloudflare Workers runtime compatible (fetch)

export type LlmUsage = { prompt_tokens?: number; completion_tokens?: number }
export type LlmResult<T = any> = { json: T; latency_ms: number; usage: LlmUsage; model?: string }

export type LlmProvider = {
  chatJSON(opts: {
    system: string
    user: string
    model?: string
    temperature?: number
  }): Promise<LlmResult>
}

function now() { return Date.now() }

// OpenAI provider (chat.completions JSON)
export function openAiProvider(apiKey: string): LlmProvider {
  return {
    async chatJSON({ system, user, model = 'gpt-4o-mini', temperature = 0.2 }) {
      const t0 = now()
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          temperature,
          response_format: { type: 'json_object' }
        })
      })
      const t1 = now()
      const j: any = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        const msg = String(j?.error?.message || resp.status)
        throw new Error('openai_error: ' + msg)
      }
      const raw = j.choices?.[0]?.message?.content?.trim() || '{}'
      const s = raw.indexOf('{'); const e = raw.lastIndexOf('}')
      const text = (s !== -1 && e !== -1 && e > s) ? raw.slice(s, e + 1) : raw
      const json = JSON.parse(text)
      const usage: LlmUsage = {
        prompt_tokens: j?.usage?.prompt_tokens,
        completion_tokens: j?.usage?.completion_tokens
      }
      return { json, latency_ms: t1 - t0, usage, model }
    }
  }
}

// Mock provider – returns deterministic JSON based on inputs
export function mockProvider(): LlmProvider {
  return {
    async chatJSON({ system, user, model = 'mock', temperature = 0.0 }) {
      const t0 = now()
      // Minimal deterministic structure; echoes parts of inputs
      const json = {
        decision: 'Proceed with phased pilot',
        bullets: [
          'Pilot in two regions before scaling',
          'Track CAC/LTV and leading indicators',
          'Mitigate key execution risks early'
        ],
        meta: { model, temperature, sys_len: system.length, user_len: user.length }
      }
      const latency_ms = Math.max(30, Math.floor(Math.random() * 50))
      const usage: LlmUsage = { prompt_tokens: 200, completion_tokens: 150 }
      // Simulate delay lightly without blocking (no sleep in workers)
      return { json, latency_ms, usage, model }
    }
  }
}
