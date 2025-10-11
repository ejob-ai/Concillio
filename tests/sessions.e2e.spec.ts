import { test, expect, request } from '@playwright/test'

const BASE = (process.env.PREVIEW_URL || process.env.BASE_URL || '').trim()

// Robust E2E: create → run → outcome → protocol.md
// Skips automatically if no BASE/PREVIEW set (good for forks/Dependabot)

test.describe('Decision Sessions API (mock orchestrator)', () => {
  test.skip(!BASE, 'BASE_URL/PREVIEW_URL saknas i CI-miljön')

  test('create → run → outcome → protocol.md', async () => {
    const api = await request.newContext({ baseURL: BASE })

    // 1) create
    const createRes = await api.post('/api/sessions', {
      data: { topic: 'E2E smoke: launch pricing v2', plan: 'starter', meta: { source: 'ci' } },
    })
    expect(createRes.status(), 'create should 201').toBe(201)
    const { id } = await createRes.json()
    expect(id, 'session id').toBeTruthy()

    // 2) run (mock orchestrator)
    const runRes = await api.post(`/api/sessions/${id}/run`)
    expect(runRes.status(), 'run should 200').toBe(200)

    // 3) outcome
    const outRes = await api.get(`/api/sessions/${id}/outcome`)
    expect(outRes.status(), 'outcome should 200').toBe(200)
    const outcome = await outRes.json()
    expect(String(outcome.consensus || '')).toContain('Consensus')

    // 4) protocol.md
    const proto = await api.get(`/api/sessions/${id}/protocol.md`)
    expect(proto.status(), 'protocol.md should 200').toBe(200)
    expect(await proto.text()).toContain('# Concillio Protocol')
  })
})
