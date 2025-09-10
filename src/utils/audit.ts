export async function auditAppendKV(
  kv: KVNamespace | undefined,
  entry: Record<string, unknown>,
  ttlDays = 30
) {
  if (!kv) return
  const now = new Date()
  const dateKey = now.toISOString().slice(0, 10) // YYYY-MM-DD
  const id = (crypto as any).randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const key = `audit:${dateKey}:${id}`
  const ttl = Math.max(60, Math.floor(ttlDays * 86400))
  try {
    await kv.put(key, JSON.stringify({ ts: now.toISOString(), ...entry }), { expirationTtl: ttl })
  } catch {
    // best-effort only
  }
}

export function redactErr(err: unknown) {
  const e = err as any
  return {
    name: (e && e.name) || 'Error',
    message: (e && e.message) || String(err),
    stack: typeof e?.stack === 'string' ? String(e.stack).slice(0, 2000) : undefined
  }
}
