// src/utils/heuristicsRepo.ts
export type HeuristicRule = {
  locale: string
  keyword: string
  role_key: string
  delta: number
  priority: number
}

export async function getActiveHeuristicRules(
  DB: D1Database,
  locale: string = 'sv-SE'
): Promise<HeuristicRule[]> {
  try {
    const rs = await DB.prepare(
      `SELECT locale, keyword, role_key, delta, priority
       FROM weighting_heuristics_active
       WHERE locale = ? ORDER BY priority DESC, keyword ASC, role_key ASC`
    ).bind(locale).all()

    const rows = (rs.results ?? []) as any[]
    if (rows.length > 0) return rows as HeuristicRule[]

    if (locale !== 'sv-SE') {
      const rs2 = await DB.prepare(
        `SELECT locale, keyword, role_key, delta, priority
         FROM weighting_heuristics_active
         WHERE locale = 'sv-SE' ORDER BY priority DESC, keyword ASC, role_key ASC`
      ).all()
      return (rs2.results ?? []) as HeuristicRule[]
    }
  } catch (e) {
    // If table/view missing or any error, return empty to avoid breaking pipeline
    return []
  }
  return []
}
