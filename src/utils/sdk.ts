export type Fetcher = (path: string, init?: RequestInit) => Promise<Response>

export function makeFetcher(baseUrl: string, adminToken?: string): Fetcher {
  return async (path, init = {}) => {
    const url = path.startsWith('http') ? path : `${baseUrl.replace(/\/$/,'')}${path}`
    const headers = new Headers(init.headers || {})
    headers.set('Accept', 'application/json')
    if (adminToken) headers.set('X-Admin-Token', adminToken) // valfritt, om du inför token-guard senare
    return fetch(url, { ...init, headers })
  }
}

/** Dagens kostnad (och alert-info) från /admin/cost-check */
export async function getCostToday(fetcher: Fetcher) {
  const res = await fetcher('/admin/cost-check')
  if (!res.ok) throw new Error(`cost-check failed: ${res.status}`)
  return res.json() as Promise<{
    ok: boolean
    sum_usd: number
    limit: number
    alerted: boolean
    by_role?: { role: string, sum: number }[]
  }>
}

/** Senaste 50 analyticsrader (JSON) – kräver /admin/analytics.json, se patch nedan */
export async function getAnalytics(fetcher: Fetcher, limit = 50) {
  const res = await fetcher(`/admin/analytics.json?limit=${limit}`)
  if (!res.ok) throw new Error(`analytics fetch failed: ${res.status}`)
  return res.json() as Promise<{
    rows: Array<{
      id:number, req_id:string|null, event:string|null, role:string|null,
      model:string|null, latency_ms:number|null, cost_usd:number|null,
      prompt_tokens:number|null, completion_tokens:number|null,
      schema_version:string|null, prompt_version:string|null,
      created_at:string|null
    }>
  }>
}
