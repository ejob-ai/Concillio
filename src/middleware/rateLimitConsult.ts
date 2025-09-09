import type { Context, Next } from 'hono'

// Dual-bucket rate limiter for /api/council/consult
// - Burst: 2 requests per second
// - Budget: 5 requests per 10 minutes
// Keyed by ip + uid cookie (uid=...)
// Uses KV with minimum TTL compliance (>= 60s)
export function rateLimitConsult({ kvBinding = 'RL_KV' as const } = {}) {
  return async (c: Context, next: Next) => {
    let kv: KVNamespace | undefined
    try { kv = (c.env as any)[kvBinding] as KVNamespace | undefined } catch {}
    if (!kv) return next()

    const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'ip-unknown'
    const cookie = c.req.header('Cookie') || ''
    const m = /(?:^|;\s*)uid=([a-z0-9-]+)/i.exec(cookie)
    const uid = (m && m[1]) ? m[1] : 'anon'

    const t = Math.floor(Date.now()/1000)
    const k1 = `rl:consult:${ip}:${uid}:s:${t}` // per-second bucket
    const k10 = `rl:consult:${ip}:${uid}:b:${Math.floor(t / 600)}` // per-10min bucket index

    const getNum = (s: string | null) => {
      const n = parseInt(String(s || '0'), 10); return Number.isFinite(n) && n >= 0 ? n : 0
    }

    try {
      const [v1, v10] = await Promise.all([kv.get(k1), kv.get(k10)])
      const n1 = getNum(v1)
      const n10 = getNum(v10)
      const limit1 = 2
      const limit10 = 5

      if (n1 >= limit1 || n10 >= limit10) {
        // Compute Retry-After: remaining seconds in current second or in 10-minute window
        const secLeft = 1
        const window10Start = Math.floor(t / 600) * 600
        const rem10 = Math.max(1, 600 - (t - window10Start))
        const retry = Math.max(secLeft, rem10)
        return c.text('Too Many Requests', 429, { 'Retry-After': String(retry) })
      }

      await Promise.all([
        kv.put(k1, String(n1 + 1), { expirationTtl: 61 }), // >= 60s TTL safeguard
        kv.put(k10, String(n10 + 1), { expirationTtl: 605 }) // 10min + 5s
      ])
    } catch {
      // On KV failure, allow request
      return next()
    }

    return next()
  }
}
