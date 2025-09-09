# Miljövariabler (Env)

## Kärna
- `OPENAI_API_KEY` — används av OpenAI-providern. Lämna tom för mock.
- `LLM_PROVIDER` — `openai` | `mock` (default: `openai` om nyckel finns, annars `mock`).
- `MODEL_NAME` — t.ex. `gpt-4o-mini` (default i koden).

## Säkerhet/adm
- `DEV` — `true` aktiverar adminrutter i preview/staging.
- `ADMIN_IP_ALLOWLIST` — kommaseparerad IP-lista för prod-skyddad adminåtkomst.
- `AUDIT_HMAC_KEY` — nyckel för HMAC av IP i admin_audit.

## Kost/telemetri
- `COST_LIMIT_USD` — tröskel för kost-alert (default 5).
- `COST_WEBHOOK_URL` — webhook att pinga vid övertrassering.

## Cloudflare-bindningar (wrangler.jsonc)
- `DB` — D1 database (concillio-production)
- `KV_RL` — KV namespace för rate limit
- `PROGRESS_KV` — KV namespace för progress

🧠 LLM-adapter (OpenAI + Mock)
src/llm/types.ts
export type JsonValue = any

export type CompleteJSONOptions = {
  model?: string
  system: string
  user: string
  schemaName?: string         // för logg/diagnostik
  maxTokens?: number
  temperature?: number
  // Telemetri-hook (frivilligt)
  onUsage?: (u: {prompt_tokens:number; completion_tokens:number; cost_usd:number; model:string}) => void
}

export interface LLMProvider {
  completeJSON(opts: CompleteJSONOptions): Promise<JsonValue>
}

src/llm/providers/openai.ts
import { LLMProvider, CompleteJSONOptions } from '../types'

// En enkel prislista (justera efter behov)
const PRICES_USD = {
  'gpt-4o-mini': { input: 0.0003, output: 0.0015 }, // per 1k tokens
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
    // usage
    const pt = json.usage?.prompt_tokens ?? 0
    const ct = json.usage?.completion_tokens ?? 0
    const price = PRICES_USD[model] || PRICES_USD['gpt-4o-mini']
    const cost = (pt/1000)*price.input + (ct/1000)*price.output
    opts.onUsage?.({ prompt_tokens: pt, completion_tokens: ct, cost_usd: cost, model })

    // primary output
    const content = json.choices?.[0]?.message?.content
    if (!content) throw new Error('No content in OpenAI response')

    // Strict JSON parse with single repair attempt
    try {
      return JSON.parse(content)
    } catch {
      // one repair try
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

src/llm/providers/mock.ts
import { LLMProvider, CompleteJSONOptions } from '../types'

export class MockProvider implements LLMProvider {
  async completeJSON(opts: CompleteJSONOptions) {
    // Returnera deterministisk “ok” JSON för dev
    const now = new Date().toISOString()
    return {
      mock: true,
      schema: opts.schemaName || 'unknown',
      generated_at: now,
      note: 'This is a mock JSON payload. Set OPENAI_API_KEY to use real provider.'
    }
  }
}

src/llm/provider.ts
import { LLMProvider, CompleteJSONOptions } from './types'
import { OpenAIProvider } from './providers/openai'
import { MockProvider } from './providers/mock'

let provider: LLMProvider | null = null

export function getProvider(env: Record<string, string | undefined>): LLMProvider {
  if (provider) return provider
  const force = (env.LLM_PROVIDER || '').toLowerCase()
  const hasKey = !!env.OPENAI_API_KEY

  if (force === 'mock' || (!hasKey && force !== 'openai')) {
    provider = new MockProvider()
  } else {
    provider = new OpenAIProvider(env.OPENAI_API_KEY as string)
  }
  return provider
}

// convenience
export async function completeJSON(env: any, opts: CompleteJSONOptions) {
  const p = getProvider(env)
  return p.completeJSON(opts)
}
