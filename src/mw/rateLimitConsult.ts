import type { Context, Next } from 'hono'

const BUCKET_S = 1 // seconds window
const LIMIT_S = 2 // 2 req/second burst
const BUCKET_10M = 600 // 10 minutes window
const LIMIT_10M = 5 // 5 req / 10 minutes

function nowSec() { return Math.floor(Date.now() / 1000) }

function retryAfterSec(): number {
  const n = nowSec()
  const rem1 = 1 - (n % 1) || 1
  const rem10 = 600 - (n % 600) || 600
  return Math.min(rem1, rem10)
}

export async function rateLimitConsult(c: Context, next: Next) {
  const p = new URL(c.req.url).pathname
  if (!p.startsWith('/api/council/consult')) return next()

  // Resolve KV binding (prefer KV_RL; fallback to RL_KV to be backward compatible)
  const kv = (c.env as any).KV_RL as KVNamespace | undefined || (c.env as any).RL_KV as KVNamespace | undefined
  if (!kv) return next() // if no KV configured, do not block

  const ip = c.req.header('cf-connecting-ip') || c.req.header('CF-Connecting-IP') || '0.0.0.0'
  const cookie = c.req.header('Cookie') || ''
  const uid = (/uid=([a-z0-9-]+)/i.exec(cookie)?.[1]) ?? 'anon'

  const t = nowSec()
  const k1 = `rl:consult:${ip}:${uid}:s:${t}`
  const k10 = `rl:consult:${ip}:${uid}:b:${Math.floor(t / BUCKET_10M)}`

  const [v1, v10] = await Promise.all([kv.get(k1), kv.get(k10)])
  const n1 = v1 ? parseInt(v1, 10) || 0 : 0
  const n10 = v10 ? parseInt(v10, 10) || 0 : 0

  if (n1 >= LIMIT_S || n10 >= LIMIT_10M) {
    const ra = String(retryAfterSec())
    return c.text('Too Many Requests', 429, { 'Retry-After': ra })
  }

  await Promise.all([
    // Cloudflare KV minimum TTL is 60 seconds
    kv.put(k1, String(n1 + 1), { expirationTtl: 61 }),
    kv.put(k10, String(n10 + 1), { expirationTtl: BUCKET_10M + 5 }),
  ])

  return next()
}
