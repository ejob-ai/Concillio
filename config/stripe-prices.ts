// config/stripe-prices.ts
// Cloudflare Workers/Pages runtime: read price IDs from c.env (not process.env)
// Plans: starter, pro, legacy

export type PriceEnv = {
  PRICE_STARTER?: string
  PRICE_PRO?: string
  PRICE_LEGACY?: string
}

export function resolvePriceId(plan: string, env: PriceEnv) {
  const key = String(plan || '').toLowerCase()
  // Validate known plans first
  const known = ['starter', 'pro', 'legacy'] as const
  if (!known.includes(key as any)) throw new Error('UNKNOWN_PLAN')

  const mapping: Record<string, string | undefined> = {
    starter: env?.PRICE_STARTER,
    pro: env?.PRICE_PRO,
    legacy: env?.PRICE_LEGACY,
  }

  const id = mapping[key]
  if (!id) throw new Error(`MISSING_PRICE_ID_${key.toUpperCase()}`)
  return id
}
