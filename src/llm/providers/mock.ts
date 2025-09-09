import type { LLMProvider, CompleteJSONOptions } from '../types'

export class MockProvider implements LLMProvider {
  async completeJSON(opts: CompleteJSONOptions) {
    const now = new Date().toISOString()
    return {
      mock: true,
      schema: opts.schemaName || 'unknown',
      generated_at: now,
      note: 'This is a mock JSON payload. Set OPENAI_API_KEY to use real provider.'
    }
  }
}
