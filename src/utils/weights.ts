import type { Weights, CoreRoleKey } from '../types/lineups'
export function normalizeWeights(w: Partial<Weights>): Weights {
  const keys: CoreRoleKey[] = ['strategist','futurist','psychologist','advisor']
  const vals = keys.map(k => Math.max(0.0001, Number((w as any)[k] ?? 0)))
  const sum = vals.reduce((a,b)=>a+b,0)
  const out = Object.fromEntries(keys.map((k,i)=>[k, +(vals[i]/sum).toFixed(4)])) as Weights
  return out
}
export function validateWeights(w: any): asserts w is Weights {
  const keys: CoreRoleKey[] = ['strategist','futurist','psychologist','advisor']
  if (!keys.every(k => typeof w?.[k] === 'number')) throw new Error('bad-weights')
  normalizeWeights(w)
}
