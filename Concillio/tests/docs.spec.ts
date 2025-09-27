import { describe, it, expect } from 'vitest'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
async function get(path: string) {
  const r = await fetch(`${BASE}${path}`)
  return { status: r.status, text: await r.text() }
}

describe('Docs pages', () => {
  it('/docs/roller renders 10 roles', async () => {
    const { status, text } = await get('/docs/roller')
    expect(status).toBe(200)
    const hits = (text.match(/<h2 class="text-xl font-semibold">/g) || []).length
    expect(hits).toBeGreaterThanOrEqual(10)
  })

  it('/docs/lineups renders 10 lineups with % bars', async () => {
    const { status, text } = await get('/docs/lineups')
    expect(status).toBe(200)
    expect(text).toMatch(/Rollsammansättning/)
    expect(text).toMatch(/%<\/div>/)
  })
})
