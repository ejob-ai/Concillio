export async function insertMinutes(DB: D1Database, args: {
  question: string
  context: any
  roles_json: any
  consensus_json: any
  lineup_snapshot: any
  lineup_preset_id: number | null
  lineup_preset_name: string | null
  schema_version: string
  prompt_version: string
}) {
  // Create minimal table if missing, then best-effort add needed columns
  await DB.prepare(`CREATE TABLE IF NOT EXISTS minutes (id INTEGER PRIMARY KEY AUTOINCREMENT)`).run()
  const add = async (sql: string) => { try { await DB.prepare(sql).run() } catch {} }
  await add(`ALTER TABLE minutes ADD COLUMN question TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN context_json TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN roles_json TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN consensus_json TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN lineup_snapshot TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN lineup_preset_id INTEGER`)
  await add(`ALTER TABLE minutes ADD COLUMN lineup_preset_name TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN schema_version TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN prompt_version TEXT`)
  await add(`ALTER TABLE minutes ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`)

  const ins = await DB.prepare(`INSERT INTO minutes (question, context_json, roles_json, consensus_json, lineup_snapshot, lineup_preset_id, lineup_preset_name, schema_version, prompt_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      args.question,
      JSON.stringify(args.context || {}),
      JSON.stringify(args.roles_json || {}),
      JSON.stringify(args.consensus_json || {}),
      JSON.stringify(args.lineup_snapshot || {}),
      args.lineup_preset_id,
      args.lineup_preset_name,
      args.schema_version,
      args.prompt_version
    ).run()
  return (ins.meta as any)?.last_row_id
}
