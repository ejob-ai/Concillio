import type { Context, Next } from 'hono'

export function idempotency({ kvBinding = 'RL_KV', ttlSec = 24 * 3600 } = {}) {
  return async (c: Context, next: Next) => {
    try {
      const key = c.req.header('Idempotency-Key')
      if (!key) return next()

      const kv = (c.env as any)[kvBinding] as KVNamespace | undefined
      if (!kv) return next()

      const k = `idem:${key}`
      const hit = await kv.get(k)
      if (hit) {
        return new Response(hit, { status: 200, headers: { 'X-Idempotent': 'true', 'Content-Type': 'application/json' } })
      }

      await next()
      const res = c.res as Response
      // Capture body safely
      const body = await res.clone().text()
      try {
        await kv.put(k, body, { expirationTtl: ttlSec })
      } catch {
        // ignore KV write errors in production
      }
      const headers = new Headers(res.headers)
      headers.delete('content-length')
      c.res = new Response(body, { status: res.status, statusText: res.statusText, headers })
      return
    } catch {
      return next()
    }
  }
}
