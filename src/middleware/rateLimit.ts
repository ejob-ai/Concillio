// Tenant-aware rate limiter using KV token bucket (burst + sustained)
import type { Context, Next } from 'hono'

export function rateLimit({ kvBinding = 'RATE_KV', burst = 10, sustained = 60, windowSec = 60, key = 'tenant' as 'tenant' | 'ip' } = {}) {
  return async (c: Context, next: Next) => {
    let kv: KVNamespace | undefined
    try {
      const env: any = c.env as any
      kv = (env[kvBinding] as KVNamespace | undefined) ?? env.RATE_KV ?? env.SESSIONS_KV ?? env.RL_KV
    } catch {}
    if (!kv) return next() // disabled if no KV or binding error

    try {
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
      const tenantHdr = c.req.header('x-tenant-id') || c.req.header('x-invite-key') || 'public'
      const id = key === 'ip' ? (ip || 'public') : tenantHdr
      const now = Date.now()
      const sec = Math.floor(now / 1000)
      const burstKey = `rl:burst:${id}:${sec}`
      const sustKey = `rl:sust:${id}:${Math.floor(sec / windowSec)}`

      const dec = async (key: string, limit: number, ttl: number) => {
        try {
          const curRaw = (await kv!.get(key)) || '0'
          let cur = parseInt(curRaw, 10)
          if (isNaN(cur)) cur = 0
          if (cur >= limit) return false
          await kv!.put(key, String(cur + 1), { expirationTtl: ttl })
          return true
        } catch {
          // If KV errors, do not block
          return true
        }
      }

      const okBurst = await dec(burstKey, burst, 60)
      const okSust = await dec(sustKey, sustained, windowSec)

      if (!okBurst || !okSust) {
        // Compute Retry-After seconds based on remaining window time
        const windowStartSec = Math.floor(sec / windowSec) * windowSec
        const remWindow = Math.max(1, Math.ceil(windowSec - (sec - windowStartSec)))
        const remBurst = okBurst ? 0 : 1
        const retryAfter = Math.max(remBurst, remWindow)
        return c.json({ ok: false, message: 'Rate limit exceeded' }, 429, { 'Retry-After': String(retryAfter) })
      }
    } catch {
      // safety: on any unexpected error, allow request
      return next()
    }

    return next()
  }
}
