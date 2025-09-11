// Static documentation content for Roles
// TODO: Replace placeholder texts with the exact content provided by the product team.

export type RoleDoc = {
  key: 'strategist' | 'futurist' | 'psychologist' | 'advisor' | string
  name: { sv: string; en?: string }
  intro: { sv: string; en?: string }
  huvudansvar: { sv: string[]; en?: string[] }
  dynamik: { sv: string[]; en?: string[] }
}

export const rolesDocs: RoleDoc[] = [
  {
    key: 'strategist',
    name: { sv: 'Chefstrateg', en: 'Chief Strategist' },
    intro: {
      sv: 'Långsiktig inramning av beslut: alternativ, reversibilitet, milstolpar samt de första 90 dagarna.',
      en: 'Long-horizon strategic framing of decisions: options, reversibility, milestones, and the first 90 days.'
    },
    huvudansvar: {
      sv: [
        'Identifiera beslutets ramar, antaganden och constraints',
        'Formulera tydliga alternativ med reversibilitet och milstolpar',
        'Definiera de första 90 dagarnas fokus och mätpunkter'
      ]
    },
    dynamik: {
      sv: [
        'Växelverkar starkt med Futuristen kring scenarier och optioner',
        'Tar emot psykologiska riskinsikter från Beteendepsykologen',
        'Ger underlag till Senior Advisor för slutlig syntes'
      ]
    }
  },
  {
    key: 'futurist',
    name: { sv: 'Futurist', en: 'Futurist' },
    intro: {
      sv: 'Scenariotänkande med sannolikheter, ledande indikatorer, no‑regret‑moves och reala optioner.',
      en: 'Scenario thinking with probabilities, leading indicators, no‑regret moves and real options.'
    },
    huvudansvar: {
      sv: [
        'Kartlägga scenarier och sannolikheter',
        'Identifiera no‑regret‑moves och reala optioner',
        'Föreslå ledande indikatorer att bevaka'
      ]
    },
    dynamik: {
      sv: [
        'Informerar Chefstrategen om framtidsrisker och möjligheter',
        'Ger underlag för Senior Advisors rekommendation',
        'Växlar med Beteendepsykologen kring mänskliga faktorer i responsen'
      ]
    }
  },
  {
    key: 'psychologist',
    name: { sv: 'Beteendepsykolog', en: 'Behavioral Psychologist' },
    intro: {
      sv: 'Mänskliga faktorer: biaser, identitetsfit, riskaptit, motståndspunkter och beslutsprotokoll.',
      en: 'Human factors: biases, identity fit, risk appetite, resistance points, and decision protocols.'
    },
    huvudansvar: {
      sv: [
        'Identifiera kognitiva biaser och gruppdynamik',
        'Bedöma identitetsfit och riskaptit',
        'Rekommendera beslutsprotokoll och premortem‑punkter'
      ]
    },
    dynamik: {
      sv: [
        'Ger risk‑ och beteendeinsikter till övriga roller',
        'Stödjer Senior Advisor med premortem och checklista',
        'Kalibrerar med Futuristen kring riskuppfattning'
      ]
    }
  },
  {
    key: 'advisor',
    name: { sv: 'Senior rådgivare', en: 'Senior Advisor' },
    intro: {
      sv: 'Syntes och beslut: trade‑offs, primär rekommendation, villkor, KPI:er och styrelsens uttalande.',
      en: 'Synthesis and decision: trade‑offs, primary recommendation, conditions, KPIs, and board statement.'
    },
    huvudansvar: {
      sv: [
        'Syntetisera samtliga roller till en rekommendation',
        'Tydliggöra villkor, risker och uppföljnings‑KPI:er',
        'Formulera ett ceremoniellt styrelseliknande uttalande'
      ]
    },
    dynamik: {
      sv: [
        'Växer samman strategiska, framtids‑ och psykologiska perspektiv',
        'Äger den enade rekommendationen och dess villkor',
        'Initierar uppföljning på definierad review‑horisont'
      ]
    }
  }
]
