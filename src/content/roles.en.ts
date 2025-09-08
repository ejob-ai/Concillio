import type { RoleContent, RoleKey } from './roles.sv'

const strategist: RoleContent = {
  slug: 'strategist',
  title: 'Chief Strategist',
  intro: 'Long-horizon strategic framing: options, reversibility, milestones, and first 90 days.',
  deliverables: [
    'Options with clear trade-offs',
    'Reversibility and milestone plan',
    'First 90 days outline'
  ],
  method: [
    'Clarify goals, constraints, time horizon',
    'Frame decision into manageable options',
    'Expose critical assumptions and risks'
  ],
  examples: [
    'Scale a new product with limited budget',
    'Enter a new market segment'
  ],
  unique: [
    'Consistent decision hygiene',
    'Focus on reversibility and first moves'
  ]
}

const futurist: RoleContent = {
  slug: 'futurist',
  title: 'Futurist',
  intro: 'Scenario thinking with probabilities, leading indicators, and real options.',
  deliverables: [],
  method: [],
  examples: [],
  unique: []
}

const psychologist: RoleContent = {
  slug: 'psychologist',
  title: 'Behavioral Psychologist',
  intro: 'The behavioral psychology voice highlights human factors, bias and group dynamics in decision-making.',
  deliverables: [
    'Map biases and risk appetite',
    'Decision protocol and friction mitigations',
    'Signal system for team resistance points'
  ],
  method: [
    'Identify cognitive biases and identity fit',
    'Recommend decision culture and rituals',
    'Define simple rules for conflict and escalation'
  ],
  examples: [
    'Leadership team split on direction',
    'Hiring decision where culture fit is critical'
  ],
  unique: [
    'Human-in-the-loop and psychological safety',
    'Concrete rituals that keep decisions healthy'
  ]
}

const advisor: RoleContent = {
  slug: 'advisor',
  title: 'Senior Advisor',
  intro: 'Synthesis and decision: trade-offs, primary recommendation, conditions, KPIs, and the board statement.',
  deliverables: [],
  method: [],
  examples: [],
  unique: []
}

const consensus: RoleContent = {
  slug: 'consensus',
  title: 'Council Consensus',
  deliverables: [],
  method: [],
  examples: [],
  unique: []
}

export const rolesEn: Record<RoleKey, RoleContent> = { strategist, futurist, psychologist, advisor, consensus }
