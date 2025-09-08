export type CoreRoleKey = 'strategist'|'futurist'|'psychologist'|'advisor'
export type Weights = Record<CoreRoleKey, number>
export type Lineup = { id?: number; name: string; weights: Weights; owner?: string; is_public?: 0|1; created_at?: string }
export type ProgressStep = 'roles'|'consensus'|'saved'
export type ProgressState = { step: ProgressStep; updatedAt: number }
