export type CoreRoleKey = 'strategist'|'futurist'|'psychologist'|'advisor'
export type RoleWeight = { role_key: CoreRoleKey; weight: number; position: number }
export type LineupPreset = {
  id: number
  name: string
  audience?: string | null
  focus?: string | null
  is_public?: number
  roles: RoleWeight[]
}
