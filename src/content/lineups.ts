// src/content/lineups.ts
export type Lineup = {
  name: string
  intro: string
  composition: { role_key: string; weight: number; note: string }[]
  karfnunktion: string[]
  dynamik: string[]
  mestVardefullVid: string[]
}

export const lineups: Lineup[] = [
  {
    name: 'Balanserad kvartett',
    intro: 'Jämn tyngd åt strategi, framtid, psykologi och syntes. Passar när inget område dominerar risken.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.25, note: '' },
      { role_key: 'FUTURIST', weight: 0.25, note: '' },
      { role_key: 'PSYCHOLOGIST', weight: 0.25, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Ger robust baslinje och spårbar väg till konsensus.'
    ],
    dynamik: [
      'Snabb konvergens tack vare symmetrisk viktning.',
      'Tydlig spårbarhet från respektive roll till konsensus.',
      'Låg risk för övervikt åt en dimension.'
    ],
    mestVardefullVid: [
      'Generella strategiska vägval',
      'Långsiktiga prioriteringar utan tydlig dominant risk',
      'Styrelseramverk och principbeslut'
    ]
  },
  {
    name: 'ROI‑fokus',
    intro: 'Övervikt åt strategisk inramning och beslutsföring för att knyta an värdeskapande och ROI.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.35, note: 'Övervikt åt strategisk inramning och milstolpar' },
      { role_key: 'FUTURIST', weight: 0.2, note: '' },
      { role_key: 'PSYCHOLOGIST', weight: 0.15, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.3, note: '' },
    ],
    karfnunktion: [
      'Säkerställer operativ mätbarhet och tydliga milstolpar.'
    ],
    dynamik: [
      'Advisor driver till tydlig rekommendation med KPI:er.',
      'Strategist säkrar milstolpar och 90‑dagarsplan.'
    ],
    mestVardefullVid: [
      'Budget, ROI, resursallokering',
      'Produktivitets- och effektivitetssatsningar'
    ]
  },
  {
    name: 'Risk & Compliance‑först',
    intro: 'Högre tyngd på regulatoriska/legala risker när bransch eller marknad har snabba regelförändringar.',
    composition: [
      { role_key: 'RISK_COMPLIANCE_OFFICER', weight: 0.3, note: 'Sätter guardrails och röda linjer' },
      { role_key: 'LEGAL_ADVISOR', weight: 0.2, note: 'Jurisdiktion, IP och kontrakt' },
      { role_key: 'STRATEGIST', weight: 0.25, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Förhindrar fatala efterlevnadsfel och låser upp säkra vägval.'
    ],
    dynamik: [
      'Risk/Legal sätter tydliga röda linjer.',
      'Strategist ramar in med compliance‑by‑design.',
      'Senior Advisor formulerar villkor för go/no‑go.'
    ],
    mestVardefullVid: [
      'Regulatoriskt täta miljöer',
      'Health/Fintech/AI med tillsynsrytm',
      'Avtal och internationell expansion'
    ]
  },
  {
    name: 'Datadriven validering',
    intro: 'Tyngd på hypoteser och evidens när datakvalitet och experimenthastighet avgör.',
    composition: [
      { role_key: 'DATA_SCIENTIST', weight: 0.35, note: 'Hypoteser, metoder och mätbarhet' },
      { role_key: 'CFO_ANALYST', weight: 0.2, note: 'Kassaflöde, känslighet och guardrails' },
      { role_key: 'STRATEGIST', weight: 0.2, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Minskar beslutets oklarhet via snabb evidensproduktion.'
    ],
    dynamik: [
      'Data Scientist definierar mätbara hypoteser.',
      'CFO kalibrerar antaganden och stop loss.',
      'Senior Advisor låser upp beslut med KPI‑villkor.'
    ],
    mestVardefullVid: [
      'Produkt/Go‑to‑market‑hypoteser',
      'Tidiga skeden med hög osäkerhet',
      'Optimering av nyckeltal'
    ]
  },
  {
    name: 'Kund‑centrerad',
    intro: 'Övervikt för kundperspektivet vid förtroende, adoption och lojalitet.',
    composition: [
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.3, note: 'VOC, friktion och lojalitet' },
      { role_key: 'PSYCHOLOGIST', weight: 0.2, note: 'Beteenden, biaser och ritualer' },
      { role_key: 'STRATEGIST', weight: 0.25, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Ökar adoption och minskar churn genom praktisk kundlogik.'
    ],
    dynamik: [
      'Customer Advocate lyfter röda linjer för förtroende.',
      'Psychologist designar lågfriktions‑beslut.',
      'Senior Advisor knyter ihop med tydliga kund‑KPI:er.'
    ],
    mestVardefullVid: [
      'Lanseringar och prissättning',
      'Förtroendekritiska domäner',
      'UX/Support/Onboarding‑friktion'
    ]
  },
  {
    name: 'Innovation/Options',
    intro: 'Laterala drag och billiga experiment för att skapa asymmetrisk uppsida.',
    composition: [
      { role_key: 'INNOVATION_CATALYST', weight: 0.35, note: 'Reframes och experiment' },
      { role_key: 'FUTURIST', weight: 0.2, note: 'Timing och plausibilitet' },
      { role_key: 'STRATEGIST', weight: 0.2, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Skapar billiga optioner och snabb lärkurva.'
    ],
    dynamik: [
      'Innovation och Futurist testar plausibilitet.',
      'Strategist väljer säkrast väg mot mål.',
      'Senior Advisor håller ramen beslutsbar.'
    ],
    mestVardefullVid: [
      'Tidiga marknader/nya kategorier',
      'Produkt‑pivot och utforskning',
      'Pilot/experiment‑tunga beslut'
    ]
  },
  {
    name: 'Expansions‑juridik',
    intro: 'Juridik och compliance växlas upp för internationell expansion och IP‑skydd.',
    composition: [
      { role_key: 'LEGAL_ADVISOR', weight: 0.35, note: 'Jurisdiktion och IP' },
      { role_key: 'RISK_COMPLIANCE_OFFICER', weight: 0.2, note: 'Tillsyn och standarder' },
      { role_key: 'STRATEGIST', weight: 0.2, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Låser upp expansion utan att skapa legala skulder.'
    ],
    dynamik: [
      'Legal sätter kontrakts‑ och IP‑guardrails.',
      'Risk/Compliance ger röda linjer och indikatorer.',
      'Senior Advisor skriver villkor för go/no‑go.'
    ],
    mestVardefullVid: [
      'Internationell expansion',
      'Partner‑/licens‑/IP‑frågor',
      'Regeltunga vertikaler'
    ]
  },
  {
    name: 'Kapital/Runway',
    intro: 'Finansiell disciplin där kapitalplan, runway och riskkontroll är centrala.',
    composition: [
      { role_key: 'CFO_ANALYST', weight: 0.35, note: 'Runway/kassaflöde' },
      { role_key: 'DATA_SCIENTIST', weight: 0.2, note: 'Känslighet och evidens' },
      { role_key: 'STRATEGIST', weight: 0.2, note: '' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Skapar tydliga guardrails och tidiga varningssignaler.'
    ],
    dynamik: [
      'CFO sätter stop‑loss och KPI‑trösklar.',
      'Data Scientist testar antaganden skarpt.',
      'Senior Advisor samlar till beslut.'
    ],
    mestVardefullVid: [
      'Kapitalresning och runway‑styrning',
      'Strikta budgetramar',
      'Stora capex‑/opex‑beslut'
    ]
  },
  {
    name: 'GTM‑operations',
    intro: 'Fokus på genomförbarhet och adoption vid kommersiell expansion.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.3, note: 'Sekvensering och 90‑dagarsplan' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.2, note: 'Adoption/friktion' },
      { role_key: 'PSYCHOLOGIST', weight: 0.2, note: 'Beslutsritual och teambeteenden' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.3, note: '' },
    ],
    karfnunktion: [
      'Binder ihop strategi med exekverbar GTM‑plan.'
    ],
    dynamik: [
      'Strategist och Senior Advisor låser plan och KPI:er.',
      'Customer Advocate säkrar värdestig och adoption.',
      'Psychologist minskar friktion i beslut/utförande.'
    ],
    mestVardefullVid: [
      'Region/ICP‑expansion',
      'Produktlanseringar',
      'Omställning av kommersiell modell'
    ]
  },
  {
    name: 'AI/Plattforms‑risk',
    intro: 'För AI‑tunga beslut med integritets‑/IP‑risker och standarder i snabb rörelse.',
    composition: [
      { role_key: 'RISK_COMPLIANCE_OFFICER', weight: 0.3, note: 'Policy och standarder' },
      { role_key: 'LEGAL_ADVISOR', weight: 0.25, note: 'Licenser, IP och ansvar' },
      { role_key: 'DATA_SCIENTIST', weight: 0.2, note: 'Mätning, drift och bias' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.25, note: '' },
    ],
    karfnunktion: [
      'Minimerar oönskad exponering och säkrar hållbarhet.'
    ],
    dynamik: [
      'Risk/Legal sätter ramar som inte får brytas.',
      'Data Scientist mäter bias och drift.',
      'Senior Advisor balanserar tempo och säkerhet.'
    ],
    mestVardefullVid: [
      'AI/ML‑drivna produkter',
      'Tunga 3:e parts‑/plattform‑beroenden',
      'Hög integritets‑/IP‑känslighet'
    ]
  }
]
