import { describe, it, expect } from 'vitest'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

async function runConsult(question: string, lineup_roles: any[]) {
  const r = await fetch(`${BASE}/api/council/consult?mock=1&lang=sv`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, context: 'QA', lineup_roles })
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`consult failed: ${r.status} ${JSON.stringify(j)}`)
  return j.id
}

describe('Heuristic weighting smoke', () => {
  it('influences outcome qualitatively without surfacing numeric weights', async () => {
    // Baseline: flat 20% på fem roller (exempel)
    const base = [
      { role_key: 'STRATEGIST', weight: 0.2, position: 0 },
      { role_key: 'CFO_ANALYST', weight: 0.2, position: 1 },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.2, position: 2 },
      { role_key: 'LEGAL_ADVISOR', weight: 0.2, position: 3 },
      { role_key: 'DATA_SCIENTIST', weight: 0.2, position: 4 }
    ]

    const idA = await runConsult('Behöver tajta budget och högre lönsamhet Q3.', base) // bör driva CFO upp
    const idB = await runConsult('Behöver GDPR-säkra avtal och policyer.', base)      // bör driva LEGAL/COMPLIANCE upp

    // Hämta minutes JSON
    const [a, b] = await Promise.all([
      fetch(`${BASE}/api/minutes/${idA}`).then(r=>r.json()),
      fetch(`${BASE}/api/minutes/${idB}`).then(r=>r.json())
    ])

    expect(a.ok).toBeTruthy()
    expect(b.ok).toBeTruthy()
    // Svartlådetest: titta i consensus_bullets/conditions/text att fokus skiftat
    const aText = JSON.stringify(a.consensus ?? a.consensus_json ?? a)
    const bText = JSON.stringify(b.consensus ?? b.consensus_json ?? b)

    // Inga explicit läckta "weights" värden
    expect(aText.toLowerCase()).not.toContain('"weights"')
    expect(bText.toLowerCase()).not.toContain('"weights"')

    // Grov förväntan: ekonomi-fokus vs juridik-fokus
    expect(aText.toLowerCase()).toMatch(/(kostnad|budget|lönsam)/)
    expect(bText.toLowerCase()).toMatch(/(gdpr|juridik|avtal|policy)/)
  }, 30000)
})
