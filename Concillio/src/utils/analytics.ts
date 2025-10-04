export type UsageAnalyticsRow = {
  role?: string | null
  model?: string | null
  prompt_tokens?: number | null
  completion_tokens?: number | null
  total_tokens?: number | null
  cost_usd?: number | null
  latency_ms?: number | null
  schema_version?: string | null
  prompt_version?: string | null
}

function costForModel(model: string | null | undefined, promptTokens?: number | null, completionTokens?: number | null): number {
  const pt = Math.max(0, Number(promptTokens || 0))
  const ct = Math.max(0, Number(completionTokens || 0))
  const m = String(model || '').toLowerCase()
  // Very rough defaults, USD per 1M tokens
  let inPerM = 0.15, outPerM = 0.60
  if (m.includes('gpt-4o-mini')) { inPerM = 0.15; outPerM = 0.60 }
  else if (m.includes('gpt-4o') || m.includes('gpt-4.1')) { inPerM = 5.00; outPerM = 15.00 }
  else if (m.includes('o3') || m.includes('o4')) { inPerM = 2.50; outPerM = 10.00 }
  const cost = (pt/1_000_000)*inPerM + (ct/1_000_000)*outPerM
  return Math.round(cost * 1e6) / 1e6 // 6 decimals
}

export async function writeAnalytics(DB: D1Database, row: UsageAnalyticsRow) {
  await DB.prepare("CREATE TABLE IF NOT EXISTS analytics_council (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)").run()
  const tryAlter = async (sql: string) => { try { await DB.exec(sql) } catch (_) {} }
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN role TEXT")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN model TEXT")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN prompt_tokens INTEGER")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN completion_tokens INTEGER")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN total_tokens INTEGER")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN cost_usd REAL")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN latency_ms INTEGER")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN schema_version TEXT")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN prompt_version TEXT")
  await tryAlter("ALTER TABLE analytics_council ADD COLUMN created_at TEXT")

  const total = (Number(row.prompt_tokens||0) + Number(row.completion_tokens||0)) || null
  const cost = typeof row.cost_usd === 'number' ? row.cost_usd : costForModel(row.model, row.prompt_tokens, row.completion_tokens)
  const nowIso = new Date().toISOString().replace('T',' ').replace('Z','')

  await DB.prepare(
    `INSERT INTO analytics_council (event, role, model, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, schema_version, prompt_version, created_at)
     VALUES ('usage', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    row.role ?? null,
    row.model ?? null,
    row.prompt_tokens ?? null,
    row.completion_tokens ?? null,
    total,
    cost ?? null,
    row.latency_ms ?? null,
    row.schema_version ?? null,
    row.prompt_version ?? null,
    nowIso
  ).run()
}
