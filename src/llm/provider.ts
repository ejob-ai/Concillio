import type { LLMProvider, CompleteJSONOptions } from './types'
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

export async function completeJSON(env: any, opts: CompleteJSONOptions) {
  const p = getProvider(env)
  return p.completeJSON(opts)
}
