export type RoleKey = 'strategist'|'futurist'|'psychologist'|'advisor'|'consensus'
export type RoleContent = {
  slug: RoleKey
  title: string
  intro?: string
  deliverables: string[]
  method: string[]
  examples: string[]
  unique: string[]
}

const strategist: RoleContent = {
  slug: 'strategist',
  title: 'Chefstrateg',
  intro: 'Långsiktig strategisk inramning: alternativ, reversibilitet, milstolpar och första 90 dagarna.',
  deliverables: [
    'Alternativ med tydliga trade-offs',
    'Reversibilitet och milstolpar',
    'Första 90 dagars plan',
  ],
  method: [
    'Tydliggör mål, begränsningar och tidshorisont',
    'Ramar in beslutet i hanterbara val',
    'Identifierar kritiska antaganden och risker'
  ],
  examples: [
    'Skala ny produkt med begränsad budget',
    'Etablera närvaro i nytt marknadssegment'
  ],
  unique: [
    'Konsekvent beslutshygien',
    'Fokus på reversibilitet och första steg'
  ]
}

const futurist: RoleContent = {
  slug: 'futurist',
  title: 'Futurist',
  intro: 'Scenariotänkande med sannolikheter, ledande indikatorer och reala optioner.',
  deliverables: [],
  method: [],
  examples: [],
  unique: []
}

const psychologist: RoleContent = {
  slug: 'psychologist',
  title: 'Beteendepsykolog',
  intro: 'Den beteendepsykologiska rösten synliggör mänskliga faktorer, bias och gruppdynamik i beslutsfattande.',
  deliverables: [
    'Kartläggning av bias och riskaptit',
    'Beslutsprotokoll och åtgärder för friktion',
    'Signalsystem för teamets motståndspunkter'
  ],
  method: [
    'Identifierar kognitiva snedvridningar och identitetsfit',
    'Rekommenderar beslutskultur och ritualer',
    'Formar enkla regler för konflikter och eskalering'
  ],
  examples: [
    'Ledningsgrupp splittrad kring vägval',
    'Rekryteringsbeslut där teamkultur är avgörande'
  ],
  unique: [
    'Human‑in‑the‑loop och psykologisk trygghet',
    'Konkreta ritualer som håller beslut friska'
  ]
}

const advisor: RoleContent = {
  slug: 'advisor',
  title: 'Senior rådgivare',
  intro: 'Syntes och beslut: trade-offs, primär rekommendation, villkor, KPI:er och styrelsens uttalande.',
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

export const rolesSv: Record<RoleKey, RoleContent> = { strategist, futurist, psychologist, advisor, consensus }
