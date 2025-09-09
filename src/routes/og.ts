import { Hono } from 'hono'

export const ogRouter = new Hono()

function esc(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'} as any)[m] as string)
}

ogRouter.get('/og', (c) => {
  const title = esc(c.req.query('title') ?? 'Concillio')
  const subtitle = esc(c.req.query('subtitle') ?? '')
  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .t { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#0b0f1a"/>
  <text x="60" y="220" font-size="72" fill="#ffffff" class="t">${title}</text>
  <text x="60" y="320" font-size="32" fill="#cbd5e1" class="t">${subtitle}</text>
  <rect x="60" y="360" width="1080" height="2" fill="#1f2937"/>
  <text x="60" y="420" font-size="28" fill="#94a3b8" class="t">Concillio · AI Council</text>
</svg>`
  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400, immutable',
  })
})
