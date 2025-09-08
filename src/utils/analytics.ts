export async function writeAnalytics(DB: D1Database, data: any) {
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

  const nowIso = new Date().toISOString().replace('T',' ').replace('Z','')
  const { event, label, path, ts_client, reqId, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd } = data || {}
  await DB.prepare(
    `INSERT INTO analytics_council (event, label, path, ts_client, ts_server, created_at, req_id, role, minutes_id, total_latency_ms, latency_ms, model, prompt_tokens, completion_tokens, cost_usd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    event || null,
    label || null,
    path || null,
    ts_client || null,
    nowIso,
    nowIso,
    reqId || null,
    role || null,
    minutes_id || null,
    total_latency_ms || null,
    latency_ms || null,
    model || null,
    prompt_tokens || null,
    completion_tokens || null,
    cost_usd || null
  ).run()
}
