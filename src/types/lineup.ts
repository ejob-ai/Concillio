export type RoleKey =
  | 'STRATEGIST' | 'FUTURIST' | 'PSYCHOLOGIST' | 'SENIOR_ADVISOR'
  | 'RISK_COMPLIANCE_OFFICER' | 'CFO_ANALYST' | 'CUSTOMER_ADVOCATE'
  | 'INNOVATION_CATALYST' | 'DATA_SCIENTIST' | 'LEGAL_ADVISOR'

export type RoleSpec = { role_key: RoleKey; weight: number; position: number }

export type LineupSnapshot = {
  source: 'preset' | 'custom'
  preset_id?: number
  preset_name?: string
  roles: RoleSpec[]
}
