// PATCH 3 — src/lib/env.ts
// Small helpers to read required/optional env vars with defaults and type hints.

export type EnvBindings = {
  DB: D1Database
  RATE_KV?: KVNamespace
  WEBHOOK_DEDUP?: KVNamespace
  AUDIT_LOG_KV?: KVNamespace
  AUTH_PEPPER?: string
  SESSION_TTL_DAYS?: string
  AUDIT_HMAC_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_SECRET?: string
  STRIPE_WEBHOOK_SECRET?: string
  SITE_URL?: string
  APP_BASE_URL?: string
}

export function requireEnv(c: any, key: keyof EnvBindings): string {
  const v = (c.env as any)?.[key]
  if (typeof v !== 'string' || !v) throw new Error(`Missing required env: ${String(key)}`)
  return v
}

export function optionalEnv<T extends keyof EnvBindings>(c: any, key: T, fallback?: string): string | undefined {
  const v = (c.env as any)?.[key]
  if (typeof v === 'string' && v) return v
  return fallback
}

export function isProduction(c: any): boolean {
  try {
    const env = (c.env as any)
    const mode = String(env?.ENV || env?.NODE_ENV || '').toLowerCase()
    return mode === 'production'
  } catch {
    return false
  }
}
