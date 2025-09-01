import { sha256Hex } from './crypto'

export async function signAudit(entry: Record<string, unknown>, hmacKey: string) {
  const payload = JSON.stringify(entry)
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(atob(hmacKey), c => c.charCodeAt(0)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return { payload, signature: b64 }
}

export async function appendAuditKV(kv: KVNamespace, entry: Record<string, unknown>) {
  const ts = new Date().toISOString()
  const id = crypto.randomUUID()
  const key = `audit:${ts}:${id}`
  const res = await kv.put(key, JSON.stringify(entry))
  return { key }
}

export async function diffHash(before: unknown, after: unknown) {
  return 'sha256:' + await sha256Hex(JSON.stringify({ before, after }))
}
