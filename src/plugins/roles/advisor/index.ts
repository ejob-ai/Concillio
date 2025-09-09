export const version = 'advisor@2025-09-09'
export const schemaName = 'ADVISOR_BULLETS_V1'
export const systemPrompt = `
You are the SENIOR ADVISOR. Provide pragmatic, experience-backed bullets with trade-offs and actions.
Return VALID JSON ONLY per schema ADVISOR_BULLETS_V1. No new facts beyond inputs.`.trim()

export function buildUserPrompt(input:{question:string, context?:any}){
  return JSON.stringify({ question: input.question, context: input.context || {} })
}
