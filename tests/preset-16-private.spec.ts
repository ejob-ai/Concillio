import { describe, it, expect } from 'vitest'

const BASE = process.env.BASE_URL ?? process.env.BASE ?? 'http://localhost:3000'

// Simple sanity check for preset 16 (Privatperson / Livsbeslut)
describe('Preset #16 Privatperson / Livsbeslut', () => {
  it('exists with 5 roles and correct ordering/weights', async () => {
    const res = await fetch(`${BASE}/api/lineups/presets`)
    expect(res.ok).toBe(true)
    const j = await res.json()
    const p16 = (j.presets || []).find((p: any) => Number(p.id) === 16)
    expect(p16).toBeTruthy()
    expect(String(p16.name)).toMatch(/Privatperson/i)

    const roles = JSON.parse(p16.roles)
    expect(Array.isArray(roles)).toBe(true)
    expect(roles.length).toBe(5)

    const positions = roles.map((r: any) => Number(r.position))
    expect(positions).toEqual([0, 1, 2, 3, 4])

    const keys = roles.map((r: any) => String(r.role_key)).sort()
    expect(keys).toEqual(['FUTURIST','LEGAL_ADVISOR','PSYCHOLOGIST','SENIOR_ADVISOR','STRATEGIST'].sort())

    const sum = roles.reduce((s: number, r: any) => s + Number(r.weight || 0), 0)
    expect(Math.abs(sum - 1)).toBeLessThanOrEqual(0.001)
  }, 30000)
})
