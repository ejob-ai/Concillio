// src/content/rolesContent.ts
import type { RoleKey } from './roles'
import { ROLE_LABEL } from './roleLabels'

type RoleContent = {
  title: string
  core: string
  responsibilities: string[]
  workingStyle: string[]
  mostValuable: string[]
  riskIfAbsent: string[]
  strengths: string[]
  limitations: string[]
  challengeWith: string[]
}

export const ROLES_CONTENT: Record<RoleKey, RoleContent> = {
  STRATEGIST: {
    title: ROLE_LABEL.STRATEGIST, // "Chief Strategist (Strategen)"
    core: "Ser helheten och formulerar vägen framåt; väger alternativ och prioriteringar för hållbar tillväxt och positionering.",
    responsibilities: [
      "Formulera långsiktig riktning och prioriteringar",
      "Scenarior, konkurrens- och marknadsanalys"
    ],
    workingStyle: ["Strukturerad", "Analytisk", "Scenariobaserad"],
    mostValuable: ["Stora vägval: expansion, nya marknader, pivotering"],
    riskIfAbsent: ["Fragmenterade beslut utan riktning"],
    strengths: ["Ger riktning/ramverk", "Kopplar mål till strategi"],
    limitations: ["Risk att bli teoretisk"],
    challengeWith: ["CUSTOMER_ADVOCATE", "SENIOR_ADVISOR"]
  },

  FUTURIST: {
    title: ROLE_LABEL.FUTURIST,
    core: "Utforskar trender och scenarier; breddar perspektivet och synliggör osäkerheter, möjligheter och hot.",
    responsibilities: [
      "Identifiera trender och framtidsscenarier",
      "Översätta svaga signaler till implikationer"
    ],
    workingStyle: ["Kreativ", "Utforskande", "Tvärdisciplinär"],
    mostValuable: ["Långhorisont-beslut, investeringar, innovation"],
    riskIfAbsent: ["Blir överraskad av förändringar, missar disruption"],
    strengths: ["Framtidsperspektiv", "Idégenerering"],
    limitations: ["Kan bli spekulativ"],
    challengeWith: ["DATA_SCIENTIST", "FINANCIAL_ANALYST"]
  },

  PSYCHOLOGIST: {
    title: ROLE_LABEL.PSYCHOLOGIST,
    core: "Synliggör mänskliga faktorer: motivationer, biaser och gruppdynamik; gör besluten hållbara i verkligheten.",
    responsibilities: [
      "Kartlägga drivkrafter/konflikter/biaser",
      "Föreslå mitigeringar och förändringsplaner"
    ],
    workingStyle: ["Empatisk", "Systematisk", "Modellbaserad"],
    mostValuable: ["Förändringsledning, team, kundbeteende"],
    riskIfAbsent: ["Beslut faller på mänskliga faktorer"],
    strengths: ["Insikt om drivkrafter/konflikter", "Praktiska mitigeringar"],
    limitations: ["Kan upplevas teoretisk"],
    challengeWith: ["STRATEGIST", "SENIOR_ADVISOR"]
  },

  SENIOR_ADVISOR: {
    title: ROLE_LABEL.SENIOR_ADVISOR,
    core: "Tillför erfarenhetsbaserad klokhet; pekar på risker, genvägar och fallgropar för jordnära beslut.",
    responsibilities: [
      "Erfarenhetsråd från liknande situationer",
      "Praktiska risker och genvägar"
    ],
    workingStyle: ["Berättande", "Kontextuell", "Konkret"],
    mostValuable: ["Nya projekt, expansion, ovana lägen"],
    riskIfAbsent: ["Naiva beslut utan verklighetsförankring"],
    strengths: ["Sparar tid/pengar", "Praktisk förankring"],
    limitations: ["Kan färgas av egna erfarenheter"],
    challengeWith: ["FUTURIST", "INNOVATION_CATALYST"]
  },

  RISK_OFFICER: {
    title: ROLE_LABEL.RISK_OFFICER, // “Risk & Compliance”
    core: "Säkerställer juridisk/regulatorisk/etisk efterlevnad och minimerar operativa/reputationsrisker.",
    responsibilities: [
      "Identifiera regulatoriska/etiska krav",
      "Riskanalys och kontrollförslag"
    ],
    workingStyle: ["Metodisk", "Detaljorienterad", "Regelstyrd"],
    mostValuable: ["Reglerade branscher, internationell expansion"],
    riskIfAbsent: ["Rättsliga problem, böter, förtroendeförlust"],
    strengths: ["Trygghet, minskar kostsamma fel"],
    limitations: ["Kan bromsa tempo/innovation"],
    challengeWith: ["INNOVATION_CATALYST", "FUTURIST"]
  },

  FINANCIAL_ANALYST: {
    title: ROLE_LABEL.FINANCIAL_ANALYST, // “Financial Analyst (Ekonom)”
    core: "Sätter siffror på beslut: kapital, kostnader, intäkter, ROI; väger risk mot avkastning.",
    responsibilities: [
      "Kassaflöde, scenario- och känslighetsanalys",
      "Kapitalbehov och ROI"
    ],
    workingStyle: ["Kvantitativ", "Noggrann", "Scenariofokus"],
    mostValuable: ["Investering, finansiering, expansion"],
    riskIfAbsent: ["Ekonomiskt ohållbara beslut"],
    strengths: ["Mätbarhet, realistiska ramar"],
    limitations: ["Risk för defensiv/kortsiktig bias"],
    challengeWith: ["FUTURIST", "INNOVATION_CATALYST"]
  },

  CUSTOMER_ADVOCATE: {
    title: ROLE_LABEL.CUSTOMER_ADVOCATE,
    core: "Representerar användarnas behov och upplevelse; ser till att beslut skapar verkligt kundvärde.",
    responsibilities: [
      "Kundinsikter och feedback",
      "Värde/upplevelse i fokus"
    ],
    workingStyle: ["Lyhörd", "Konkret", "Datainformerad"],
    mostValuable: ["Produkt/service-förbättring, lojalitet"],
    riskIfAbsent: ["Bygger saker som inte används"],
    strengths: ["Förankrar i verkliga behov"],
    limitations: ["Risk för kortsiktighet/detaljfokus"],
    challengeWith: ["STRATEGIST", "FINANCIAL_ANALYST"]
  },

  INNOVATION_CATALYST: {
    title: ROLE_LABEL.INNOVATION_CATALYST,
    core: "Utmanar invanda mönster; hittar okonventionella lösningar och öppnar nya vägar.",
    responsibilities: [
      "Idégenerering och alternativa angreppssätt",
      "Experiment och prototyper"
    ],
    workingStyle: ["Lekfull", "Idérik", "Provocerande"],
    mostValuable: ["Nystart, stagnation, produktinnovation"],
    riskIfAbsent: ["Fastnar i gamla lösningar"],
    strengths: ["Banbrytande perspektiv"],
    limitations: ["Svår att förankra i verklighet/ekonomi"],
    challengeWith: ["FINANCIAL_ANALYST", "RISK_OFFICER"]
  },

  DATA_SCIENTIST: {
    title: ROLE_LABEL.DATA_SCIENTIST,
    core: "Bygger bro mellan data och beslut; testar hypoteser och synliggör mönster.",
    responsibilities: [
      "Strukturera data och experiment",
      "Evidensbaserade insikter"
    ],
    workingStyle: ["Hypotesdriven", "Metodisk"],
    mostValuable: ["Affärsidéer, produktutveckling, optimering"],
    riskIfAbsent: ["Beslut på magkänsla"],
    strengths: ["Objektiva mätpunkter, dolda samband"],
    limitations: ["Risk för analysparalys"],
    challengeWith: ["SENIOR_ADVISOR", "STRATEGIST"]
  },

  LEGAL_ADVISOR: {
    title: ROLE_LABEL.LEGAL_ADVISOR,
    core: "Kartlägger avtal, IP, ansvar och jurisdiktion; skapar juridisk trygghet och skydd.",
    responsibilities: [
      "Identifiera juridiska risker",
      "Föreslå skydd/avtal"
    ],
    workingStyle: ["Noggrann", "Riskmedveten", "Strukturerad"],
    mostValuable: ["Avtal, IP, expansion, partnerskap"],
    riskIfAbsent: ["Tvister, IP-förluster, oklara ansvar"],
    strengths: ["Minimerar juridiska överraskningar"],
    limitations: ["Kan bli för försiktig"],
    challengeWith: ["STRATEGIST", "INNOVATION_CATALYST"]
  }
}
