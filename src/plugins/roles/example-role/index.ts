// Exempel på roll-plugin (byts ut mot verkliga roller)
export const version = '2025-09-09'

export const systemPrompt = `
You are the EXAMPLE ROLE. Produce concise, decision-useful JSON.
OUTPUT: {"bullets": string[], "risks": string[]}
Rules:
- Valid JSON only
- Max 6 bullets, 4 risks
`

export type ExampleOutput = {
  bullets: string[]
  risks: string[]
}

export const schemaName = 'EXAMPLE_OUTPUT_V1'

// Hjälp: skapa user prompt från payload
export function buildUserPrompt(input: { question: string; context?: Record<string,any> }) {
  const ctx = input.context ? JSON.stringify(input.context).slice(0, 2000) : '{}'
  return `Question: ${input.question}\nContext: ${ctx}`
}
