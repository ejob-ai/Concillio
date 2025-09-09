export type JsonValue = any

export type CompleteJSONOptions = {
  model?: string
  system: string
  user: string
  schemaName?: string
  maxTokens?: number
  temperature?: number
  onUsage?: (u: { prompt_tokens: number; completion_tokens: number; cost_usd: number; model: string }) => void
}

export interface LLMProvider {
  completeJSON(opts: CompleteJSONOptions): Promise<JsonValue>
}
