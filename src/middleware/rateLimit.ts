// Tenant-aware rate limiter using KV token bucket (burst + sustained)
import type { Context, Next } from 'hono'

export function rateLimit({ kvBinding = 'RL_KV', burst = 10, sustained = 60, windowSec = 60 } = {}) {
  return async (c: Context, next: Next) => {
    const kv = (c.env as any)[kvBinding] as KVNamespace | undefined
    if (!kv) return next() // disabled if no KV

    const ip = c.req.header('cf-connecting-ip') || '0.0.0.0'
    const tenant = c.req.header('x-tenant-id') || c.req.header('x-invite-key') || 'public'
    const now = Date.now()
    const sec = Math.floor(now / 1000)
    const burstKey = `rl:burst:${tenant}:${sec}`
    const sustKey = `rl:sust:${tenant}:${Math.floor(sec / windowSec)}`

    const dec = async (key: string, limit: number, ttl: number) => {
      const curRaw = (await kv.get(key)) || '0'
      let cur = parseInt(curRaw, 10)
      if (isNaN(cur)) cur = 0
      if (cur >= limit) return false
      await kv.put(key, String(cur + 1), { expirationTtl: ttl })
      return true
    }

    const okBurst = await dec(burstKey, burst, 60)
    const okSust = await dec(sustKey, sustained, windowSec)

    if (!okBurst || !okSust) {
      return c.text('Too Many Requests', 429)
    }

    return next()
  }
}
