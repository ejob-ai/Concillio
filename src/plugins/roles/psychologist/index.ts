export const version = 'psychologist@2025-09-09'
export const schemaName = 'PSYCHOLOGIST_V1'
export const systemPrompt = `
You are the BEHAVIORAL PSYCHOLOGIST. Surface stakeholders, biases, frictions, mitigations.
Return VALID JSON ONLY per schema PSYCHOLOGIST_V1. Neutral, decision-useful language.`.trim()

export function buildUserPrompt(input:{question:string, context?:any}){
  return JSON.stringify({ question: input.question, context: input.context || {} })
}
