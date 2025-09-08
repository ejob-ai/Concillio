import Ajv from 'ajv'
import { AdvisorBulletsSchema, ConsensusV2Schema } from './schemas'

const ajv = new Ajv({ allErrors: true, strict: false })
const validateRole = ajv.compile(AdvisorBulletsSchema)
const validateConsensus = ajv.compile(ConsensusV2Schema)

function estimateCostUSD(model: string, usage?: { prompt_tokens?: number; completion_tokens?: number }): number {
  // Very rough default (adjust with real pricing table)
  const pt = usage?.prompt_tokens || 0
  const ct = usage?.completion_tokens || 0
  const rate = model.includes('gpt-4o') ? 0.000005 : 0.000001
  return Number(((pt + ct) * rate).toFixed(6))
}

export async function callRole(roleKey: string, question: string, context: any, env: any) {
  const t0 = Date.now()
  // Placeholder: replace with real OpenAI call with response_format: { type: 'json_object' }
  // Simulated output complying with AdvisorBulletsSchema
  const json: any = {
    strategist: ["Svar a","Svar b","Svar c"],
    futurist: ["Svar a","Svar b","Svar c"],
    psychologist: ["Svar a","Svar b","Svar c"],
    advisor: ["Svar a","Svar b","Svar c"]
  }
  const ok = validateRole(json)
  if (!ok) {
    // one repair attempt (placeholder)
  }
  const latency_ms = Date.now() - t0
  const usage = { prompt_tokens: 100, completion_tokens: 300, cost_usd: estimateCostUSD('gpt-4o-mini', { prompt_tokens: 100, completion_tokens: 300 }) }
  return { json, latency_ms, usage }
}

export async function callSummarizer(payload: { roles_json: any, weights: Record<string, number>, question: string, context: any }, env: any) {
  const t0 = Date.now()
  // Placeholder: produce a valid consensus
  const json: any = {
    decision: "Rekommenderad riktning",
    summary: "Sammanfattning...",
    consensus_bullets: ["Punkt 1","Punkt 2","Punkt 3"],
    conditions: ["Villkor 1"]
  }
  const ok = validateConsensus(json)
  if (!ok) {
    // repair attempt placeholder
  }
  const latency_ms = Date.now() - t0
  const usage = { prompt_tokens: 200, completion_tokens: 600, cost_usd: 0.004 }
  return { json, latency_ms, usage }
}
