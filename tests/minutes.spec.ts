import { describe, it, expect } from 'vitest'

/**
 * Kör mot lokalt dev (wrangler pages dev --d1=concillio-production --local).
 * Sätt BASE i env: BASE=http://localhost:3000 vitest run
 */
const BASE = process.env.BASE || 'http://localhost:3000'

describe('/api/minutes/:id', () => {
  let minutesId: number

  it('creates minutes via mock consult with preset', async () => {
    const r = await fetch(`${BASE}/api/council/consult?mock=1&lang=sv`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question: 'Test – UK Q2?',
        context: 'SaaS, mål 12m',
        lineup_preset_id: 11
      })
    })
    expect(r.ok).toBe(true)
    const j = await r.json()
    expect(j.ok).toBe(true)
    expect(typeof j.id).toBe('number')
    minutesId = j.id
  })

  it('returns lineup snapshot on minutes/:id', async () => {
    const r = await fetch(`${BASE}/api/minutes/${minutesId}`)
    expect(r.ok).toBe(true)
    const j = await r.json()
    expect(j.ok).toBe(true)
    expect(j.lineup).toBeTruthy()
    expect(j.lineup.preset_id).toBeGreaterThan(0)
    expect(j.lineup.roles?.length).toBeGreaterThan(0)
    // weight-normalisering: sum ~ 1
    const sum = j.lineup.roles.reduce((s: number, r: any) => s + Number(r.weight || 0), 0)
    expect(sum).toBeGreaterThan(0.99)
    expect(sum).toBeLessThan(1.01)
    // positionsordning
    const positions = j.lineup.roles.map((r: any) => r.position)
    expect([...positions].sort((a,b)=>a-b)).toEqual(positions)
  })
})
