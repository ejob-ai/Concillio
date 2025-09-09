import type { LLMProvider, CompleteJSONOptions } from '../types'

const PRICES_USD: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.0003, output: 0.0015 },
}

export class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async completeJSON(opts: CompleteJSONOptions) {
    const model = opts.model || 'gpt-4o-mini'
    const body = {
      model,
      response_format: { type: 'json_object' },
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 1200,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ]
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenAI error ${res.status}: ${text}`)
    }

    const json = await res.json()
    const pt = json.usage?.prompt_tokens ?? 0
    const ct = json.usage?.completion_tokens ?? 0
    const price = PRICES_USD[model] || PRICES_USD['gpt-4o-mini']
    const cost = (pt/1000)*price.input + (ct/1000)*price.output
    opts.onUsage?.({ prompt_tokens: pt, completion_tokens: ct, cost_usd: cost, model })

    const content = json.choices?.[0]?.message?.content
    if (!content) throw new Error('No content in OpenAI response')

    try {
      return JSON.parse(content)
    } catch {
      const repairBody = {
        model,
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 600,
        messages: [
          { role: 'system', content: 'You are a JSON repair agent. Output ONLY valid JSON.' },
          { role: 'user', content: `Repair this to valid JSON only:\n\n${content}` }
        ]
      }
      const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{
          'content-type':'application/json',
          'authorization':`Bearer ${this.apiKey}`
        },
        body: JSON.stringify(repairBody)
      })
      const json2 = await res2.json()
      const fixed = json2.choices?.[0]?.message?.content
      return JSON.parse(fixed)
    }
  }
}
