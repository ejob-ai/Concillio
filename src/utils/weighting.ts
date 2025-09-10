// src/utils/weighting.ts
import type { HeuristicRule } from './heuristicsRepo'

export type WeightMap = Record<string, number>

export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.min(1, x))
}

export function normalizeWeights(input: WeightMap): WeightMap {
  const keys = Object.keys(input)
  const sum = keys.reduce((s, k) => s + Math.max(0, Number(input[k] ?? 0)), 0)
  if (sum <= 1e-9) {
    const v = keys.length ? 1 / keys.length : 0
    const out: WeightMap = {}
    for (const k of keys) out[k] = v
    return out
  }
  const out: WeightMap = {}
  for (const k of keys) out[k] = Math.max(0, Number(input[k] ?? 0)) / sum
  return out
}

export function textToTokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\+\/%\-_. ]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export function containsKeyword(tokens: string[], keyword: string): boolean {
  const k = keyword.toLowerCase()
  if (!k) return false
  return tokens.some(t => t === k || t.includes(k))
}

export function applyHeuristicWeights(
  base: WeightMap,
  corpus: string,
  rules: HeuristicRule[]
): { adjusted: WeightMap; applied: Array<{keyword:string; role_key:string; delta:number}> } {
  const tokens = textToTokens(corpus)
  const deltas: Record<string, number> = {}
  const applied: Array<{keyword:string; role_key:string; delta:number}> = []

  for (const r of rules) {
    if (!containsKeyword(tokens, r.keyword)) continue
    const k = r.role_key.toUpperCase()
    deltas[k] = (deltas[k] ?? 0) + Number(r.delta || 0)
    applied.push({ keyword: r.keyword, role_key: k, delta: Number(r.delta || 0) })
  }

  const absTotal = Object.values(deltas).reduce((s, d) => s + Math.abs(d), 0)
  const maxTotalShift = 0.25
  let scale = 1
  if (absTotal > maxTotalShift && absTotal > 0) {
    scale = maxTotalShift / absTotal
  }

  const maxAbsRoleShift = 0.15
  const out: WeightMap = {}
  const keys = Object.keys(base)
  for (const k of keys) {
    const b = clamp01(Number(base[k] ?? 0))
    const d = (deltas[k] ?? 0) * scale
    const cappedD = Math.max(-maxAbsRoleShift, Math.min(maxAbsRoleShift, d))
    out[k] = clamp01(b + cappedD)
  }

  return { adjusted: normalizeWeights(out), applied }
}
