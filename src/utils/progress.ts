export async function progressPut(KV: KVNamespace, progressId: string, step: 'roles'|'consensus'|'saved') {
  if (!KV) return
  const key = `progress:${progressId}`
  const now = Date.now()
  const payload = JSON.stringify({ step, updatedAt: now })
  await KV.put(key, payload, { expirationTtl: 60 * 60 * 6 })
}
