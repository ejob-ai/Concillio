// JSON Schemas and helpers for validation
// Keep lightweight for Workers runtime

export const AllowedPlaceholders = ['question','context','goals','constraints','roles_json'] as const

// Advisor bullets-by-role schema: 3–5 items per role, each <= 160 chars
export const AdvisorBulletsSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    strategist: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 3, maxLength: 160 }
    },
    futurist: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 3, maxLength: 160 }
    },
    psychologist: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 3, maxLength: 160 }
    },
    advisor: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 3, maxLength: 160 }
    }
  },
  required: ['strategist','futurist','psychologist','advisor']
} as const

// Consensus v2 schema (subset sufficient for validation and UI)
export const ConsensusV2Schema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    decision: { type: 'string', minLength: 3, maxLength: 280 },
    summary: { type: 'string', minLength: 3 },
    consensus_bullets: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string', minLength: 3, maxLength: 200 }
    },
    rationale_bullets: {
      type: 'array',
      items: { type: 'string', minLength: 3, maxLength: 200 }
    },
    top_risks: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: { type: 'string', minLength: 3, maxLength: 200 }
    },
    conditions: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: { type: 'string', minLength: 3, maxLength: 200 }
    },
    review_horizon_days: { type: 'integer', minimum: 0 },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    source_map: { type: 'object' }
  },
  required: ['decision','summary','consensus_bullets','conditions']
} as const

export type ConsensusShape = {
  summary: string
  risks?: string[]
  unanimous_recommendation?: string
  board_statement?: string
  kpis_monitor?: string[]
  conditions?: string[]
}
