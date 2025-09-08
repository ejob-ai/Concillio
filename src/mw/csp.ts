import type { Context, Next } from 'hono'

export const POLICY = [
  "default-src 'self'",
  "script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
  "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://api.openai.com",
  "frame-ancestors 'none'",
  "base-uri 'self'"
].join('; ')

export async function withCSP(c: Context, next: Next) {
  await next()
  const h = c.res.headers
  h.set('Content-Security-Policy', POLICY)
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
}
