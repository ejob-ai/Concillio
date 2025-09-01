import type { Context, Next } from 'hono'

export function idempotency({ kvBinding = 'RL_KV', ttlSec = 24 * 3600 } = {}) {
  return async (c: Context, next: Next) => {
    const key = c.req.header('Idempotency-Key')
    if (!key) return next()

    const kv = (c.env as any)[kvBinding] as KVNamespace | undefined
    if (!kv) return next()

    const k = `idem:${key}`
    const hit = await kv.get(k)
    if (hit) {
      return new Response(hit, { status: 200, headers: { 'X-Idempotent': 'true' } })
    }

    const res = await next()
    // Clone result text (simple JSON-only for MVP)
    const body = await res.text()
    await kv.put(k, body, { expirationTtl: ttlSec })
    return new Response(body, res)
  }
}
