// Concillio Role Plugin Boilerplate
// Define a role that can be orchestrated (analyze → return strict JSON)

export type RoleOutput = Record<string, any>

export type RolePlugin = {
  key: string // e.g. 'STRATEGIST'
  displayName: string // e.g. 'Chief Strategist'
  analyze(input: { question: string; context: any }, env: any): Promise<RoleOutput>
}

// Example: Minimal deterministic role plugin (mock)
export function mockRolePlugin(key: string, displayName: string): RolePlugin {
  return {
    key,
    displayName,
    async analyze({ question, context }, env) {
      return {
        role: displayName,
        analysis: `Analysis for: ${question}`,
        recommendations: [
          'Start with a phased approach',
          'Define clear success metrics',
          'Align incentives and stakeholders'
        ],
        context_echo: typeof context === 'string' ? context : JSON.stringify(context || {})
      }
    }
  }
}
