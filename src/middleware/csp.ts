import type { Context, Next } from 'hono'

export const POLICY = [
  "default-src 'self'",
  // No Tailwind CDN anymore; keep inline for legacy inline <script> blocks used in some routes
  "script-src 'self' 'unsafe-inline'",
  // Allow Google Fonts CSS and jsdelivr for Font Awesome CSS only
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://api.openai.com",
  "frame-ancestors 'none'",
  "base-uri 'self'"
].join('; ')

export function withCSP() {
  return async (c: Context, next: Next) => {
    await next()
    try {
      c.header('Content-Security-Policy', POLICY)
      c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    } catch {}
  }
}
