export async function getPresetWithRoles(DB: D1Database, presetId: number) {
  const p = await DB.prepare(`SELECT id, name, audience, focus FROM lineups_presets WHERE id = ?`).bind(presetId).first<{ id: number; name: string; audience?: string|null; focus?: string|null }>()
  if (!p) return null
  const rolesRes = await DB.prepare(`SELECT role_key, weight, position FROM lineups_preset_roles WHERE preset_id = ? ORDER BY position ASC`).bind(presetId).all<{ role_key: string; weight: number; position: number }>()
  const roles = (rolesRes.results||[]).map(r => ({ role_key: String(r.role_key).toUpperCase(), weight: Number(r.weight), position: Number(r.position) }))
  return { id: p.id, name: p.name, audience: p.audience, focus: p.focus, roles }
}
