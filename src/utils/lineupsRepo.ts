export async function getPresetWithRoles(db: D1Database, presetId: number) {
  const preset = await db.prepare(
    `SELECT id, name FROM lineups_presets WHERE id = ?`
  ).bind(presetId).first<{id:number; name:string}>();
  if (!preset) return null;

  const roles = await db.prepare(
    `SELECT role_key, weight, position
     FROM lineups_preset_roles
     WHERE preset_id = ?
     ORDER BY position ASC`
  ).bind(presetId).all<{role_key:string; weight:number; position:number}>();

  return {
    id: preset.id,
    name: preset.name,
    roles: (roles.results || []).map(r => ({
      role_key: String(r.role_key).toUpperCase(),
      weight: Number(r.weight),
      position: Number(r.position)
    }))
  };
}
