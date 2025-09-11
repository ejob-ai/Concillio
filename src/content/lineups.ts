// Static documentation content for Line-ups
// TODO: Replace placeholder texts with the exact content provided by the product team.

export type Lineup = {
  key: string
  name: { sv: string; en?: string }
  composition: Array<{ role_key: 'STRATEGIST'|'FUTURIST'|'PSYCHOLOGIST'|'SENIOR_ADVISOR'; weight: number; note?: { sv: string; en?: string } }>
  intro: { sv: string; en?: string }
  coreFunction: { sv: string; en?: string }
  dynamics: { sv: string[]; en?: string[] }
  bestFor: { sv: string[]; en?: string[] }
}

export const lineups: Lineup[] = [
  {
    key: 'balanced_4',
    name: { sv: 'Balanserad kvartett', en: 'Balanced Quartet' },
    composition: [
      { role_key: 'STRATEGIST', weight: 0.25 },
      { role_key: 'FUTURIST', weight: 0.25 },
      { role_key: 'PSYCHOLOGIST', weight: 0.25 },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25 },
    ],
    intro: {
      sv: 'En välavvägd line‑up som ger jämn tyngd åt strategi, framtidsanalys, mänskliga faktorer och syntes.',
      en: 'A well‑balanced line‑up giving equal weight to strategy, futures, human factors, and synthesis.'
    },
    coreFunction: {
      sv: 'Ger ett robust grundperspektiv när situationen kräver jämn fördelning mellan perspektiven.',
      en: 'Provides a robust baseline when the situation calls for evenly distributed perspectives.'
    },
    dynamics: {
      sv: [
        'Snabb konvergens tack vare symmetrisk viktning',
        'Tydlig spårbarhet från respektive roll till konsensus',
        'Låg risk för övervikt åt en dimension'
      ]
    },
    bestFor: {
      sv: [
        'Generella strategiska vägval',
        'Långsiktiga prioriteringar utan tydlig dominant risk',
        'Styrelseramverk och principbeslut'
      ]
    }
  },
  {
    key: 'roi_focus',
    name: { sv: 'ROI‑fokus', en: 'ROI Focus' },
    composition: [
      { role_key: 'STRATEGIST', weight: 0.35, note: { sv: 'Övervikt åt strategisk inramning och milstolpar' } },
      { role_key: 'FUTURIST', weight: 0.2 },
      { role_key: 'PSYCHOLOGIST', weight: 0.15 },
      { role_key: 'SENIOR_ADVISOR', weight: 0.3 },
    ],
    intro: {
      sv: 'Viktar upp strategiskt ramverk och beslutsföring för att tydligt binda upp värdeskapande och ROI.',
      en: 'Overweights strategic framing and decision‑making to tightly bind value creation and ROI.'
    },
    coreFunction: {
      sv: 'Säkerställer att rekommendationen är operativt mätbar och kopplad till tydliga milstolpar.',
      en: 'Ensures the recommendation is operationally measurable and tied to milestones.'
    },
    dynamics: {
      sv: ['Advisor driver till tydlig rekommendation med KPI:er', 'Strategist säkrar milstolpar och 90‑dagarsplan']
    },
    bestFor: { sv: ['Budget, ROI, resursallokering', 'Produktivitets- och effektivitetssatsningar'] }
  }
]
