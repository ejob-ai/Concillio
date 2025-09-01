// Placeholder for JSON Schemas or Zod validations per role
// For MVP we export simple schema descriptors; can replace with zod later

export const AllowedPlaceholders = ['question','context','goals','constraints','roles_json'] as const

export type ConsensusShape = {
  summary: string
  risks?: string[]
  unanimous_recommendation?: string
  board_statement?: string
  kpis_monitor?: string[]
  conditions?: string[]
}
