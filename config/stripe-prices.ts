// config/stripe-prices.ts
// Fallback-aware resolver: prefers provided env (Workers c.env),
// falls back to process.env in dev/Node/Vite/e2b.

export type PriceEnv = {
  PRICE_STARTER?: string
  PRICE_PRO?: string
  PRICE_LEGACY?: string
  [k: string]: string | undefined
}

export function resolvePriceId(plan: string, env?: PriceEnv) {
  const src: Record<string, string | undefined> = env ?? (typeof process !== 'undefined' ? (process as any).env ?? {} : {})

  const key = String(plan || '').toLowerCase()
  if (!['starter', 'pro', 'legacy'].includes(key)) throw new Error('UNKNOWN_PLAN')

  const mapping = {
    starter: src.PRICE_STARTER,
    pro: src.PRICE_PRO,
    legacy: src.PRICE_LEGACY,
  } as const

  const id = mapping[key as 'starter' | 'pro' | 'legacy']
  if (!id) throw new Error(`MISSING_PRICE_ID_${key.toUpperCase()}`)
  return id
}
