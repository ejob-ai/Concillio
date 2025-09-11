export type HeuristicsFlags = {
  enabled: boolean
  cap: number
  perRoleMax: number
  maxHits: number
}

// KV keys:
// flag:heuristics.enabled
// flag:heuristics.cap
// flag:heuristics.per_role_max
// flag:heuristics.max_hits
export async function loadHeuristicsFlags(env: any): Promise<HeuristicsFlags> {
  const kv = env.FLAGS_KV as KVNamespace | undefined

  const kvGet = async (k: string) => {
    try { return kv ? await kv.get(k) : null } catch { return null }
  }

  const kvEnabled = (await kvGet('flag:heuristics.enabled')) ?? env.HEURISTICS_ENABLED ?? 'true'
  const kvCap     = (await kvGet('flag:heuristics.cap')) ?? env.HEURISTICS_CAP ?? '0.25'
  const kvPerMax  = (await kvGet('flag:heuristics.per_role_max')) ?? env.HEURISTICS_PER_ROLE_MAX ?? '0.15'
  const kvMaxHits = (await kvGet('flag:heuristics.max_hits')) ?? env.HEURISTICS_MAX_HITS ?? '3'

  const enabled = String(kvEnabled).toLowerCase() === 'true'
  const cap = clamp01(Number(kvCap))
  const perRoleMax = clamp01(Number(kvPerMax))
  const maxHits = Math.max(0, Math.min(10, Number(kvMaxHits) || 0))

  return { enabled, cap, perRoleMax, maxHits }
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}
