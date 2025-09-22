// src/content/lineups.ts
import type { RoleKey } from './roles';

export type LineupRole = { role_key: RoleKey; weight: number; position: number; note?: string };
export type LineupDoc = {
  id: number;
  slug: string;
  name: string;
  intro: string;
  composition: LineupRole[];         // baseline
  karna: string[];                   // Kärnfunktion
  dynamik: string[];                 // Dynamik
  best_for: string[];                // Mest värdefull vid
};

export const LINEUPS: LineupDoc[] = [
  {
    id: 1,
    slug: 'entreprenor-startup',
    name: 'Entreprenör / Startup-grundare',
    intro:
      'För tidiga entreprenörer som vill bygga från grunden och nå snabb tillväxt. Kombinerar riktning, framtidsblick, mänskliga faktorer, kapitaldisciplin och erfarenhetsbas.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.22, position: 0, note: 'Sätter riktning och prioriterar snabb väg mot PMF.' },
      { role_key: 'FUTURIST', weight: 0.20, position: 1, note: 'Varnar för skiften tidigt; hittar fönster för genvägar.' },
      { role_key: 'PSYCHOLOGIST', weight: 0.18, position: 2, note: 'Skyddar teamets fokus och uthållighet.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.20, position: 3, note: 'Håller burn-rate och runway i schack.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.20, position: 4, note: 'Avdramatiserar vägval med ‘war stories’.' }
    ],
    karna: [
      'Ger en sammanhållen väg mot PMF och kapitalfärdplan.',
      'Binder ihop vision, tempo och kassaflöde till körbar plan.',
    ],
    dynamik: [
      'Strategist + Futurist sätter riktning/tajming.',
      'Psychologist minskar teamfriktion och bias.',
      'CFO klargör runway och ROI-trösklar.',
      'Senior Advisor driver beslut till 30/60/90.',
    ],
    best_for: ['Go-to-market, PMF, första finansiering', 'Pivot/omprioritering under 12–18 månader'],
  },
  {
    id: 2,
    slug: 'sme-corporate-ledare',
    name: 'Företagsledare (SME/Corporate)',
    intro:
      'För ledare som behöver stabilitet, skalning och riskminimering. Tyngd på strategi, compliance, ekonomi, kund och genomförandekraft.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.24, position: 0, note: 'Orkestrerar portfölj/roadmap för skalning.' },
      { role_key: 'RISK_OFFICER', weight: 0.20, position: 1, note: 'Minimerar regulatorisk risk när ni skalar.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.20, position: 2, note: 'Säkrar kapitaldisciplin och ROI.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.18, position: 3, note: 'Styr investeringar mot verkligt kundvärde.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.18, position: 4, note: 'Förankrar förändring i verkstad och kultur.' }
    ],
    karna: [
      'Säker skalning med tydliga guardrails och mätbar effekt.',
      'Balanserar kost/nytta, risk och kundvärde.',
    ],
    dynamik: [
      'Risk/Legal rälsar beslutet tidigt.',
      'CFO + Strategist synkar investeringslogik och exekvering.',
      'Customer Advocate minskar churn-risk i förändring.',
    ],
    best_for: ['Effektiviseringsprogram', 'Nya policys/processer', 'Skalning utan att tappa kundnöjdhet'],
  },
  {
    id: 3,
    slug: 'investerare-styrelse',
    name: 'Investerare / Styrelseledamot',
    intro:
      'Fokuserar på avkastning, risk och utsikter. Lyfter finans, compliance, långsiktiga trender, strategi och teamrisk.',
    composition: [
      { role_key: 'FINANCIAL_ANALYST', weight: 0.26, position: 0, note: 'Kvantifierar tillväxt, marginal och kassaflöde.' },
      { role_key: 'RISK_OFFICER', weight: 0.22, position: 1, note: 'Belyser bounded downside.' },
      { role_key: 'FUTURIST', weight: 0.18, position: 2, note: 'Ger utsikter bortom 12–36 mån.' },
      { role_key: 'STRATEGIST', weight: 0.18, position: 3, note: 'Testar moats, timing och alternativ.' },
      { role_key: 'PSYCHOLOGIST', weight: 0.16, position: 4, note: 'Bedömer grundarteams riskprofil.' }
    ],
    karna: ['Ger beslutsunderlag som styrelse kan stå för.', 'Kopplar risk/avkastning till tydliga villkor.'],
    dynamik: [
      'CFO leder scenarier och kapitallogik.',
      'Risk/Compliance ringar in “no-go” och indikatorer.',
      'Futurist och Strategist sätter utsikter och optionalitet.',
      'Psychologist bedömer teamutförande och blindspots.',
    ],
    best_for: ['Investeringsbeslut', 'Styrelsebeslut om större satsning', 'DD-komplettering'],
  },
  {
    id: 4,
    slug: 'kreator-innovatör',
    name: 'Kreatör / Innovatör',
    intro:
      'För idégenerering och kreativa genombrott. Combination av out-of-the-box, trendläsning, kundreaktion, beteende och erfarenhet.',
    composition: [
      { role_key: 'INNOVATION_CATALYST', weight: 0.28, position: 0, note: 'Bryter låsningar med lateralt tänk.' },
      { role_key: 'FUTURIST', weight: 0.22, position: 1, note: 'Inspirerar med framtidsbilder nära nuet.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.20, position: 2, note: 'Håller publikkänslan sann.' },
      { role_key: 'PSYCHOLOGIST', weight: 0.15, position: 3, note: 'Skyddar flow och kreativ stamina.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.15, position: 4, note: 'Filtrerar idéer mot realiteter.' }
    ],
    karna: [
      'Bryter låsningar och ger snabba experimentvägar.',
      'Balanserar djärva drag med användargrund och riskkoll.',
    ],
    dynamik: [
      'Innovation driver reframe + experiment (<90 dagar).',
      'Futurist säkrar riktning/tajming.',
      'Customer Advocate jordar värdet i verkliga behov.',
      'Psychologist minimerar kreativa friktioner.',
    ],
    best_for: ['Nya koncept', 'Program för snabb förbättring/experiment', 'Stagnation eller idétorka'],
  },
  {
    id: 5,
    slug: 'policy-ngo',
    name: 'Policy Maker / NGO-ledare',
    intro:
      'För samhällspåverkan, etik och långsiktighet. Fokus på lag/etik, trender, medborgarperspektiv, strategi och beteendeförändring.',
    composition: [
      { role_key: 'RISK_OFFICER', weight: 0.26, position: 0, note: 'Etik, ESG och rättslig hållbarhet.' },
      { role_key: 'FUTURIST', weight: 0.20, position: 1, note: 'Visar samhällstrender och sekundäreffekter.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.18, position: 2, note: 'Ger röst åt medborgaren/brukaren.' },
      { role_key: 'STRATEGIST', weight: 0.18, position: 3, note: 'Koordinerar intressenter och mandat.' },
      { role_key: 'PSYCHOLOGIST', weight: 0.18, position: 4, note: 'Driver beteendeförändring praktiskt.' }
    ],
    karna: [
      'Skapar hållbara beslut inom juridiska/etiska ramar.',
      'Kopplar sociala trender till praktisk styrning.',
    ],
    dynamik: [
      'Risk/Compliance sätter gränser och mätbara indikatorer.',
      'Futurist väver in samhällstrender.',
      'Customer Advocate representerar brukare/medborgare.',
      'Psychologist designar beteendeförändring.',
    ],
    best_for: ['Policyförändring', 'Programdesign', 'Intressenthantering och legitimitet'],
  },
  {
    id: 6,
    slug: 'scale-up',
    name: 'Scale-up / Rapid Growth',
    intro:
      'Aggressiv men kontrollerad skalning. Kassaflöde, retention, mätbarhet och exekvering i fokus.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.24, position: 0, note: 'Prioriterar hävstänger för kontrollerad skalning.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.22, position: 1, note: 'Balans mellan tillväxt och runway.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.18, position: 2, note: 'Minskar churn, ökar LTV.' },
      { role_key: 'DATA_SCIENTIST', weight: 0.18, position: 3, note: 'Finner friktionspunkter och signaler.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.18, position: 4, note: 'Erfaren av ‘breakage’ under skalning.' }
    ],
    karna: ['Skalar utan att tappa kvalitet/lojalitet.', 'Binder samman ekonomi, data och kundvärde.'],
    dynamik: [
      'Strategist + CFO driver prioritering och ROI.',
      'Data Scientist mäter, varnar och accelererar.',
      'Customer Advocate skyddar NPS/retention.',
    ],
    best_for: ['Snabb expansion', 'PLG/CS-investeringar', 'Unit economics-förbättring'],
  },
  {
    id: 7,
    slug: 'regulated',
    name: 'Reglerad bransch (Health/Finance/Utilities)',
    intro:
      'Efterlevnad, juridik, kapitaldisciplin och kundförtroende. Robust strategi inom hårda ramar.',
    composition: [
      { role_key: 'RISK_OFFICER', weight: 0.28, position: 0, note: 'Sätter guardrails som håller i revision.' },
      { role_key: 'LEGAL_ADVISOR', weight: 0.22, position: 1, note: 'Kontrakts-, ansvar- och jurisdiktionskompass.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.18, position: 2, note: 'Kapitalkrav, CAPEX/OPEX och prissättning.' },
      { role_key: 'STRATEGIST', weight: 0.18, position: 3, note: 'Go-to-market inom reglerade ramar.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.14, position: 4, note: 'Bygger och behåller förtroende.' }
    ],
    karna: [
      'Optimerar inom regelverk snarare än trots dem.',
      'Väver ihop efterlevnad, ekonomi och kundförtroende.',
    ],
    dynamik: [
      'Risk + Legal sätter röda linjer tidigt.',
      'CFO tydliggör kapitalkrav och kostnader.',
      'Strategist väljer sekvens som minimerar regulatorisk risk.',
      'Customer Advocate bevarar tillit.',
    ],
    best_for: ['Lansering i reglerad domän', 'GDPR/HIPAA/PSD2-frågor', 'Offentlig upphandling'],
  },
  {
    id: 8,
    slug: 'saas-b2b',
    name: 'SaaS B2B (Enterprise Software)',
    intro:
      'Produkt-marknad för företag, långa säljcykler, ROI och datadriven tillväxt. Kombination av strategi, kund, data, ekonomi och erfarenhet.',
    composition: [
      { role_key: 'STRATEGIST', weight: 0.22, position: 0, note: 'Kopplar GTM till enterprise-cykler.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.20, position: 1, note: 'Säkrar värde i varje konto.' },
      { role_key: 'DATA_SCIENTIST', weight: 0.18, position: 2, note: 'Leading indicators för sälj/retention.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.20, position: 3, note: 'CAC-payback, NRR och prissättningslogik.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.20, position: 4, note: 'Stänger ‘last mile’ i enterprise-deals.' }
    ],
    karna: [
      'Knyter värdehypotes till affärsfall per segment.',
      'Accelererar funnel med mätbar ROI och användningsdata.',
    ],
    dynamik: [
      'Customer Advocate driver segmentering och behov.',
      'Data Scientist säkrar leading metrics/kohorter.',
      'CFO alignar prissättning och payback.',
      'Senior Advisor rensar friktion i enterprise-sälj.',
    ],
    best_for: ['ICP/segmentval', 'Enterprise-säljstrategi', 'Pricing/packaging-beslut'],
  },
  {
    id: 9,
    slug: 'b2c-appar',
    name: 'Konsumentappar (B2C Digital Products)',
    intro:
      'Snabb adoption, retention, virala loopar och UX. Tyngd på innovation, kund, beteende, data och strategi.',
    composition: [
      { role_key: 'INNOVATION_CATALYST', weight: 0.22, position: 0, note: 'Hittar loopar som faktiskt sprids.' },
      { role_key: 'CUSTOMER_ADVOCATE', weight: 0.22, position: 1, note: 'Tonträff i UX och trust.' },
      { role_key: 'PSYCHOLOGIST', weight: 0.20, position: 2, note: 'Motiverande design utan mörka mönster.' },
      { role_key: 'DATA_SCIENTIST', weight: 0.18, position: 3, note: 'Retention/kohorter berättar sanningen.' },
      { role_key: 'STRATEGIST', weight: 0.18, position: 4, note: 'Väger viralt vs hållbar monetisering.' }
    ],
    karna: [
      'Skapar momentum via billiga experiment och virala mekaniker.',
      'Förankrar upplevelse i beteendedrivare och datapulser.',
    ],
    dynamik: [
      'Innovation driver testkatalog.',
      'Customer Advocate “voice of user”.',
      'Psychologist formar beteende-loopar.',
      'Data Scientist mäter retention/kohorter.',
    ],
    best_for: ['Aktivering/retention', 'Virala loopar', 'UX-hypoteser och snabb iteration'],
  },
  {
    id: 10,
    slug: 'industri-iot',
    name: 'Industri / IoT / Tillverkning',
    intro:
      'Robusthet, säkerhet, kostnadseffektivitet och efterlevnad. Tyngd på risk/lag, ekonomi, strategi och erfarenhet.',
    composition: [
      { role_key: 'RISK_OFFICER', weight: 0.24, position: 0, note: 'Säkerhet och standarder först.' },
      { role_key: 'LEGAL_ADVISOR', weight: 0.18, position: 1, note: 'IP, ansvar och leverantörskedjor.' },
      { role_key: 'FINANCIAL_ANALYST', weight: 0.18, position: 2, note: 'Capex/opex-balans och payback.' },
      { role_key: 'STRATEGIST', weight: 0.20, position: 3, note: 'Fashionsättande faser och pilot-till-rollout.' },
      { role_key: 'SENIOR_ADVISOR', weight: 0.20, position: 4, note: 'Undviker stopp genom beprövad praxis.' }
    ],
    karna: [
      'Levererar säkra beslut med drift- och kostnadskontroll.',
      'Förenar regelverk, CAPEX/OPEX och växande krav.',
    ],
    dynamik: [
      'Risk + Legal ritar ramarna.',
      'CFO väger CAPEX/OPEX och payback.',
      'Strategist sätter sekvenser för minsta driftstörning.',
      'Senior Advisor översätter till verkstad.',
    ],
    best_for: ['IoT-utrullning', 'Automationsprojekt', 'Leverantörsbyten och kontraktsrisk'],
  },
  {
    id: 11,
    slug: 'privatperson-livsbeslut-5',
    name: 'Privatperson / Livsbeslut',
    intro:
      'Line-up för viktiga vardags-/livsbeslut – boende, karriär, familj. Kombinerar mänskliga, strategiska, ekonomiska och juridiska perspektiv.',
    composition: [
      { role_key: 'PSYCHOLOGIST',    weight: 0.26, position: 0, note: 'Mänskliga faktorer & bias.' },
      { role_key: 'STRATEGIST',      weight: 0.22, position: 1, note: 'Ramar, alternativ, reversibilitet.' },
      { role_key: 'FINANCIAL_ANALYST',     weight: 0.20, position: 2, note: 'Kalkyler, risk, unit economics.' },
      { role_key: 'LEGAL_ADVISOR',   weight: 0.16, position: 3, note: 'Avtal, regler, rättigheter.' },
      { role_key: 'SENIOR_ADVISOR',  weight: 0.16, position: 4, note: 'Syntes & rekommendation.' },
    ],
    karna: [
      'Ger ett tryggt beslutsstöd: alternativ, risker, kalkyler och villkor — med mänskliga faktorer i fokus.',
    ],
    dynamik: [
      'Psykologen lyfter drivkrafter, känslor och biaser.',
      'Strategen ramar in vägval och reversibilitet.',
      'CFO/Analytiker gör kalkyler (kostnad, risk, avkastning).',
      'Juridisk rådgivare säkerställer lagar, avtal, rättigheter.',
      'Senior Advisor syntetiserar till en pragmatisk rekommendation.',
    ],
    best_for: [
      'Bostadsköp/flytt.',
      'Karriär- eller utbildningsval.',
      'Familjebeslut som påverkar känslor och ekonomi.',
      'Val med juridiska/finansiella konsekvenser.',
    ],
  },
];
