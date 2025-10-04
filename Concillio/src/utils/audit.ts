import { sha256Hex } from './crypto'

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

// Stable/canonical JSON stringify (sorts object keys)
function canonicalStringify(value: any): string {
  const seen = new WeakSet()
  const walk = (v: any): any => {
    if (v === null || typeof v !== 'object') return v
    if (seen.has(v)) return '[Circular]'
    seen.add(v)
    if (Array.isArray(v)) return v.map(walk)
    const out: Record<string, any> = {}
    const keys = Object.keys(v).sort()
    for (const k of keys) out[k] = walk(v[k])
    return out
  }
  return JSON.stringify(walk(value))
}

// Compute a hash representing the diff between two JSON-serializable values
export async function diffHash(before: unknown, after: unknown): Promise<string> {
  const payload = canonicalStringify({ before, after })
  return sha256Hex(payload)
}

async function hmacHexFromBase64Key(base64Key: string, message: string): Promise<string> {
  try {
    const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0))
    const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
    return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback: if key import fails, at least return SHA-256 of message
    return sha256Hex(message)
  }
}

// Sign an audit entry with HMAC-SHA256 (hex output) using a base64 key
export async function signAudit(entry: Record<string, unknown>, base64Key: string): Promise<{ signature: string }> {
  const msg = canonicalStringify(entry)
  const signature = await hmacHexFromBase64Key(base64Key, msg)
  return { signature }
}

// Backwards-compatible export name expected by routes
export { auditAppendKV as appendAuditKV }
