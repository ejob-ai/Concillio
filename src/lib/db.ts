// PATCH 4 — src/lib/db.ts
// Thin D1 helpers and session utilities

export type SessionRow = {
  id: string
  user_id: number
  created_at: string
  expires_at: string
  ip_hash?: string | null
  user_agent?: string | null
}

export async function getSession(DB: D1Database, sid: string): Promise<SessionRow | null> {
  const row = await DB.prepare('SELECT id, user_id, created_at, expires_at, ip_hash, user_agent FROM sessions WHERE id=?')
    .bind(sid)
    .first<SessionRow>()
  return row || null
}

export async function deleteSession(DB: D1Database, sid: string): Promise<void> {
  await DB.prepare('DELETE FROM sessions WHERE id=?').bind(sid).run()
}

export async function touchUserLogin(DB: D1Database, userId: number): Promise<void> {
  await DB.prepare('UPDATE users SET last_login_at=datetime("now"), updated_at=datetime("now") WHERE id=?').bind(userId).run()
}

export async function ensureUserByEmail(DB: D1Database, email: string): Promise<number> {
  const row = await DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first<{id:number}>()
  if (row?.id) return row.id
  const res = await DB.prepare('INSERT INTO users (email, password_hash, password_salt, verified) VALUES (?, ?, ?, 1)')
    .bind(email, '!', '!').run()
  return (res as any)?.meta?.last_row_id as number
}
