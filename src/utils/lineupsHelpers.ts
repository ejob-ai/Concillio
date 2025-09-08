export type RoleInput = { role_key: string; weight: number; position?: number }
export function normalizeWeights(roles: RoleInput[]) {
  const sum = roles.reduce((a, r) => a + (Number(r.weight)||0), 0)
  if (sum <= 0) return roles.map(r => ({ role_key: r.role_key, weight: 0 }))
  return roles.map(r => ({ role_key: r.role_key, weight: Number(r.weight)/sum }))
}
