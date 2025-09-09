export const version = 'futurist@2025-09-09'
export const schemaName = 'FUTURIST_V1'
export const systemPrompt = `
You are the FUTURIST. Map weak signals, plausible near/mid-term futures, and implications.
Return VALID JSON ONLY per schema FUTURIST_V1. No extra keys. De-duplicate, concrete timelines.`.trim()

export function buildUserPrompt(input:{question:string, context?:any}){
  return JSON.stringify({ question: input.question, context: input.context || {} })
}
