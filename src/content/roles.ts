// src/content/roles.ts
export type RoleKey =
  | 'STRATEGIST'
  | 'FUTURIST'
  | 'PSYCHOLOGIST'
  | 'SENIOR_ADVISOR'
  | 'RISK_COMPLIANCE_OFFICER'
  | 'CFO_ANALYST'
  | 'CUSTOMER_ADVOCATE'
  | 'INNOVATION_CATALYST'
  | 'DATA_SCIENTIST'
  | 'LEGAL_ADVISOR';

export type RoleDoc = {
  key: RoleKey;
  name: string;          // visningsnamn
  slug: string;          // för ankare
  intro: string;         // 1–2 meningar
  huvudansvar: string[]; // 3–5 punkter
  dynamik: string[];     // 3–5 punkter
};

export const ROLES: RoleDoc[] = [
  {
    key: 'STRATEGIST',
    name: 'Chief Strategist (Strategen)',
    slug: 'strategist',
    intro:
      'Ser helheten och formulerar vägen framåt. Väger alternativ, risk och positionering för hållbar tillväxt.',
    huvudansvar: [
      'Rama in beslutet: mål, constraints, antaganden och tidshorisont.',
      'Formulera tydliga alternativ med trade-offs, reversibilitet och milstolpar.',
      'Definiera “första 90 dagarna” och Q1–Q4-vägval med KPI:er.',
      'Identifiera andraordningseffekter och “no-regret”-drag.',
    ],
    dynamik: [
      'Växelverkar med Futuristen om scenarier och timing.',
      'Tar in psykologiska risker och friktion från Beteendepsykologen.',
      'Ger underlag till Senior Advisor för syntes och beslut.',
      'Synkar med CFO kring budget, ROI och kapitaleffekter.',
    ],
  },
  {
    key: 'FUTURIST',
    name: 'Futurist',
    slug: 'futurist',
    intro:
      'Kartlägger svaga signaler och plausibla framtider. Översätter trendlägen till konkreta implikationer.',
    huvudansvar: [
      'Bygga 2–3 distinkta scenarier med sannolikhet och påverkan.',
      'Föreslå ledande indikatorer och bevakningslista (watchlist).',
      'Identifiera reala optioner och no-regret-moves.',
      'Tydliggöra tidsfönster och “regulatoriska chocker”.',
    ],
    dynamik: [
      'Matar Strategen med scenario-baserade tidsfönster.',
      'Kalibrerar med Data Scientist kring evidens och databrist.',
      'Utmanar Innovation Catalyst med verklighetsförankring.',
      'Hjälper Senior Advisor med osäkerhetskartläggning.',
    ],
  },
  {
    key: 'PSYCHOLOGIST',
    name: 'Beteendepsykolog',
    slug: 'psychologist',
    intro:
      'Synliggör mänskliga faktorer, biaser och friktion. Ger enkla, lågdoserade motdrag som ökar beslutets bärighet.',
    huvudansvar: [
      'Kartlägga intressenter, drivkrafter och gruppdynamik.',
      'Identifiera sannolika biaser och friktionspunkter.',
      'Föreslå praktiska mitigeringar och rit för beslut/uppföljning.',
      'Planera premortem/postmortem och bra möteshygien.',
    ],
    dynamik: [
      'Ger risk- och beteendeinsikter till alla roller.',
      'Förankrar kund- och team-perspektiv med Customer Advocate.',
      'Avlastar Senior Advisor med beslutsprotokoll och checklista.',
      'Kalibrerar med Strategen för realistiska förändringssteg.',
    ],
  },
  {
    key: 'SENIOR_ADVISOR',
    name: 'Senior Advisor (Rådgivare)',
    slug: 'senior-advisor',
    intro:
      'Pragmatisk syntes. Vänder lärdomar till en handlingsbar rekommendation med villkor och KPI:er.',
    huvudansvar: [
      'Syntetisera rollerna till ett “styrelsebeslut”.',
      'Konkretisera villkor, risker och uppföljnings-KPI:er.',
      'Ge erfarenhetsbaserade “do/don’t”-punkter.',
      'Säkra tydlig ansvarsfördelning och check-ins.',
    ],
    dynamik: [
      'Binder ihop Strategist, Futurist och Psychologist.',
      'Viktar rösterna efter sammanhang (baseline + heuristik).',
      'Driver beslut till konkreta 30/60/90-steg.',
      'Dokumenterar oenighet och review-horisonter.',
    ],
  },
  {
    key: 'RISK_COMPLIANCE_OFFICER',
    name: 'Risk & Compliance Officer',
    slug: 'risk-compliance',
    intro:
      'Yttrar regulatoriska, legala och etiska risker. Sätter guardrails och “röda linjer” tidigt.',
    huvudansvar: [
      'Kartlägga lagkrav, standarder och tillsynsmyndigheter.',
      'Identifiera compliance-risker med sannolikhet/impact.',
      'Formulera tydliga röda linjer och mätbara indikatorer.',
      'ESG/etik-flaggor och “förbjudna zoner”.',
    ],
    dynamik: [
      'Säkerställer robusthet tillsammans med Legal Advisor.',
      'Ger early-warning-indikatorer till Futurist/Data Scientist.',
      'Kalibrerar med Strategen för “compliance-by-design”.',
      'Informerar Senior Advisor om icke-förhandlingsbara villkor.',
    ],
  },
  {
    key: 'CFO_ANALYST',
    name: 'CFO / Financial Analyst',
    slug: 'cfo-analyst',
    intro:
      'Sätter kronor-och-öre på konsekvenserna. Scenarier, kapitalbehov, ROI, guardrails och tid till likviditetsbro.',
    huvudansvar: [
      'Definiera finansiella mål och guardrails.',
      'Bygga 2–3 scenarier med antaganden och cashflow-bild.',
      'Rekommendera kapitalplan (belopp, timing, källor).',
      'Föreslå ledande KPI:er och red flags.',
    ],
    dynamik: [
      'Växlar med Strategen om prioritering/sekvensering.',
      'Synkar med Data Scientist för antaganden och känslighet.',
      'Sätter hårda “stop loss”-gränser i Senior Advisors villkor.',
      'Ger underlag till Risk/Legal för ekonomisk exponering.',
    ],
  },
  {
    key: 'CUSTOMER_ADVOCATE',
    name: 'Customer Advocate',
    slug: 'customer-advocate',
    intro:
      'Representerar användaren/kunden. Gör behov, friktion och lojalitetsdrivare konkreta och mätbara.',
    huvudansvar: [
      'Segmentera kunder och tydliggöra behov/byten.',
      'Kartlägga friktioner i adoption/upplevelse.',
      'Formulera “röda linjer” för förtroende (t.ex. transparens).',
      'Sätta ledande kund-KPI:er och feedback-loopar.',
    ],
    dynamik: [
      'Kopplar innovation/strategi till faktisk nytta.',
      'Kalibrerar med Psychologist om beteende och motivation.',
      'Ger framtids-tecken (”voice of customer”) till Futurist.',
      'Lyfter edge-cases till Legal/Risk tidigt.',
    ],
  },
  {
    key: 'INNOVATION_CATALYST',
    name: 'Innovation Catalyst',
    slug: 'innovation-catalyst',
    intro:
      'Bryter ramar, föreslår laterala drag och billiga experiment. Hittar asymmetrier och “optioner”.',
    huvudansvar: [
      'Reframe:a problemet i 3–5 alternativa vinklar.',
      'Föreslå kreativa taktiker (<90 dagar) och long-shots.',
      'Identifiera ignition-conditions och failure modes.',
      'Ge monitoring-signaler för “idékort”.',
    ],
    dynamik: [
      'Växlar med Futurist om plausibilitet och tajming.',
      'Testar kundvärde med Customer Advocate.',
      'Mappar databehov med Data Scientist.',
      'Ger optioner att väga i Senior Advisors syntes.',
    ],
  },
  {
    key: 'DATA_SCIENTIST',
    name: 'Data Scientist / Analyst',
    slug: 'data-scientist',
    intro:
      'Formulerar hypoteser, mätbara mål och evidensbehov. Rekommenderar metoder och snabba test.',
    huvudansvar: [
      'Definiera falsifierbara hypoteser kopplade till beslutet.',
      'Lista datakällor, känslighetsvariabler och evidensgap.',
      'Föreslå metoder (A/B, regressions, NLP, kohorter).',
      'Designa <90-dagars lågkostnads-experiment.',
    ],
    dynamik: [
      'Kalibrerar antaganden med CFO/Strategist.',
      'Samkör VOC/UX-signaler med Customer Advocate.',
      'Ger Futurist indikatorer och Data red flags.',
      'Matar Senior Advisor med mätbarhet för beslut.',
    ],
  },
  {
    key: 'LEGAL_ADVISOR',
    name: 'Legal Advisor (Juridik)',
    slug: 'legal-advisor',
    intro:
      'Identifierar kontraktuella, IP- och jurisdiktionsfrågor. Stakar ut legala guardrails och “do/don’t”.',
    huvudansvar: [
      'Kartlägga legala domäner och jurisdiktionsfaktorer.',
      'Identifiera kontrakts-/IP-risker med sannolikhet/impact.',
      'Formulera röda linjer och konkreta mitigeringar.',
      'Tidiga varningssignaler (lagförslag, tillsynsfall).',
    ],
    dynamik: [
      'Samverkar med Risk & Compliance för helgardering.',
      'Informerar Strategist om legala spärrar/tidplan.',
      'Synkar med Customer Advocate om förtroende/terms.',
      'Ger Senior Advisor “villkor för go/no-go”.',
    ],
  },
];
