import { describe, it, expect } from 'vitest'

/**
 * Sanity test for reseeded presets (1..10) with 5-role 10-mix
 *
 * Requirements verified per preset (IDs 1..10):
 * - exactly 5 roles
 * - roles positions strictly ordered (0..4) and unique
 * - role_key belongs to the allowed v2 advisor role set
 * - weights sum approximately 1.0 (0.99..1.01)
 *
 * Notes:
 * - This test expects that D1 migrations have been applied, in particular
 *   migrations/0017_reseed_lineups_full_10.sql.
 * - Run locally: BASE=http://localhost:3000 vitest run tests/presets-reseed.spec.ts
 *   Ensure your dev server is running (wrangler pages dev dist --d1=concillio-production --local).
 */

const BASE = process.env.BASE || 'http://localhost:3000'

const VALID_ROLE_KEYS = new Set([
  'STRATEGIST',
  'FUTURIST',
  'PSYCHOLOGIST',
  'SENIOR_ADVISOR',
  'RISK_COMPLIANCE_OFFICER',
  'CFO_ANALYST',
  'CUSTOMER_ADVOCATE',
  'INNOVATION_CATALYST',
  'DATA_SCIENTIST',
  'LEGAL_ADVISOR'
])

describe('/api/lineups/presets reseed sanity', () => {
  it('returns at least 10 presets and validates 1..10 structure', async () => {
    const r = await fetch(`${BASE}/api/lineups/presets`)
    expect(r.ok).toBe(true)
    const j = await r.json()
    expect(j.ok).toBe(true)
    expect(Array.isArray(j.presets)).toBe(true)
    expect(j.presets.length).toBeGreaterThanOrEqual(10)

    // Index by id for quick lookup
    const byId = new Map<number, any>()
    for (const p of j.presets) {
      byId.set(Number(p.id), p)
    }

    for (let id = 1; id <= 10; id++) {
      const p = byId.get(id)
      expect(p, `Preset ${id} missing – ensure reseed migration applied`).toBeTruthy()

      // roles are returned as a JSON string from the SQL json_group_array in the API
      const rolesRaw = p?.roles
      let roles: Array<{ role_key: string; weight: number; position: number }>
      try {
        roles = JSON.parse(rolesRaw || '[]')
      } catch (e) {
        throw new Error(`Preset ${id} roles not valid JSON: ${rolesRaw}`)
      }

      // exactly 5 roles
      expect(roles.length, `Preset ${id} should have exactly 5 roles`).toBe(5)

      // positions strictly ordered and unique
      const positions = roles.map(r => Number(r.position))
      const sorted = [...positions].sort((a, b) => a - b)
      expect(sorted, `Preset ${id} positions should be sorted`).toEqual(positions)
      // uniqueness check
      const posSet = new Set(sorted)
      expect(posSet.size, `Preset ${id} positions must be unique`).toBe(positions.length)

      // role_key validity
      for (const r of roles) {
        const key = String(r.role_key || '').toUpperCase()
        expect(
          VALID_ROLE_KEYS.has(key),
          `Preset ${id} has invalid role_key ${r.role_key}`
        ).toBe(true)
      }

      // weights sum approx 1.0
      const sum = roles.reduce((s, r) => s + Number(r.weight || 0), 0)
      expect(sum).toBeGreaterThan(0.99)
      expect(sum).toBeLessThan(1.01)
    }
  })
})
