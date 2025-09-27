export type PromptPackEntry = {
  role_key: string
  system_template: string
  user_template: string | null
}

// Returns active v2 pack id for given name+locale, or null
export async function getActivePackId(db: any, name: string, locale: string): Promise<number | null> {
  const stmt = db
    .prepare(
      "SELECT id FROM prompt_packs_v2 WHERE name=? AND locale=? AND status='active' LIMIT 1"
    )
    .bind(name, locale)

  const row = await stmt.first()
  return row ? (row.id as number) : null
}

// Returns all entries for a v2 pack id
export async function getPackEntries(db: any, packId: number): Promise<PromptPackEntry[]> {
  const rs = await db
    .prepare(
      `SELECT role_key, system_template, user_template
       FROM prompt_pack_entries
       WHERE pack_id=?`
    )
    .bind(packId)
    .all()

  return (rs && rs.results ? (rs.results as PromptPackEntry[]) : [])
}
