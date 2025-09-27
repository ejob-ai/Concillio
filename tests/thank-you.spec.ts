import { describe, it, expect } from 'vitest'

const BASE = process.env.BASE_URL
const maybeIt = BASE ? it : it.skip

describe('/thank-you SSR', () => {
  maybeIt('returns 200 and includes X-Robots-Tag: noindex', async () => {
    const url = `${BASE}/thank-you?plan=starter&session_id=test`
    const res = await fetch(url, { method: 'GET' })
    expect(res.status).toBe(200)
    const robots = (res.headers.get('x-robots-tag') || '').toLowerCase()
    expect(robots).toContain('noindex')
    expect(robots).toContain('nofollow')
    const html = await res.text()
    expect(html.toLowerCase()).toContain('tack')
  })
})
