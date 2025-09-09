import { scrubPII } from './scrub'

export async function writeAnalytics(DB: D1Database, data: any) {
  // Ensure table exists with a minimal schema; then try to add known columns
  await DB.prepare(`CREATE TABLE IF NOT EXISTS analytics_council (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT)`).run()
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN label TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN path TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN ts_client TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN ts_server TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN created_at TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN req_id TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN role TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN minutes_id INTEGER`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN total_latency_ms INTEGER`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN latency_ms INTEGER`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN model TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN prompt_tokens INTEGER`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN completion_tokens INTEGER`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN cost_usd REAL`).run() } catch {}
  // Some legacy deployments had a NOT NULL "ts" column without default; add column if missing
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN ts TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN schema_version TEXT`).run() } catch {}
  try { await DB.prepare(`ALTER TABLE analytics_council ADD COLUMN prompt_version TEXT`).run() } catch {}

  const nowIso = new Date().toISOString().replace('T',' ').replace('Z','')
  const { event, label, path, ts_client, reqId, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd, schema_version, prompt_version } = data || {}
  const roleVal = (role == null || role === '') ? 'system' : String(role)

  // Sanitize PII for analytics only (do not alter prompts anywhere else)
  const evSan = event != null ? String(scrubPII(event)) : null
  const labelSan = label != null ? String(scrubPII(label)) : null
  const pathSan = path != null ? String(scrubPII(path)) : null
  const tsClientSan = ts_client != null ? String(scrubPII(ts_client)) : null

  const schemaVersionSan = schema_version != null ? String(scrubPII(schema_version)) : null
  const promptVersionSan = prompt_version != null ? String(scrubPII(prompt_version)) : null

  // Try insert with legacy "ts" column AND version columns
  try {
    await DB.prepare(
      `INSERT INTO analytics_council (event, label, path, ts_client, ts_server, created_at, req_id, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd, schema_version, prompt_version, ts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      evSan,
      labelSan,
      pathSan,
      tsClientSan,
      nowIso,
      nowIso,
      reqId || null,
      roleVal,
      minutes_id || null,
      total_latency_ms || null,
      latency_ms || null,
      model || null,
      prompt_tokens || null,
      completion_tokens || null,
      cost_usd || null,
      schemaVersionSan,
      promptVersionSan,
      nowIso
    ).run()
    return
  } catch {}

  // Fallback: without ts but WITH version columns
  try {
    await DB.prepare(
      `INSERT INTO analytics_council (event, label, path, ts_client, ts_server, created_at, req_id, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd, schema_version, prompt_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      evSan,
      labelSan,
      pathSan,
      tsClientSan,
      nowIso,
      nowIso,
      reqId || null,
      roleVal,
      minutes_id || null,
      total_latency_ms || null,
      latency_ms || null,
      model || null,
      prompt_tokens || null,
      completion_tokens || null,
      cost_usd || null,
      schemaVersionSan,
      promptVersionSan
    ).run()
    return
  } catch {}

  // Final fallback: insert without version columns
  await DB.prepare(
    `INSERT INTO analytics_council (event, label, path, ts_client, ts_server, created_at, req_id, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    evSan,
    labelSan,
    pathSan,
    tsClientSan,
    nowIso,
    nowIso,
    reqId || null,
    roleVal,
    minutes_id || null,
    total_latency_ms || null,
    latency_ms || null,
    model || null,
    prompt_tokens || null,
    completion_tokens || null,
    cost_usd || null
  ).run()
}
