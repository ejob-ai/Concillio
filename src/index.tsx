import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'
import { rateLimit } from './middleware/rateLimit'
import { idempotency } from './middleware/idempotency'
import { getCookie, setCookie } from 'hono/cookie'
import { computePromptHash, loadPromptPack, compileForRole, computePackHash } from './utils/prompts'

import promptsRouter from './routes/prompts'
import adminRouter from './routes/admin'
import adminUIRouter from './routes/admin-ui'
import seedRouter from './routes/seed'
import advisorRouter from './routes/advisor'

// Types for bindings
type Bindings = {
  OPENAI_API_KEY: string
  DB: D1Database
  BROWSERLESS_TOKEN?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API routes (if needed later for clients)
app.use('/api/*', cors())
app.use('/api/*', rateLimit())
app.use('/api/*', idempotency())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// API subrouter for prompts
app.route('/', promptsRouter)
app.route('/', adminRouter)
app.route('/', adminUIRouter)
app.route('/', seedRouter)
app.route('/', advisorRouter)

// Language helpers
const SUPPORTED_LANGS = ['sv', 'en'] as const
 type Lang = typeof SUPPORTED_LANGS[number]
 function getLang(c: any): Lang {
  // Support both ?lang and ?locale, cookie fallback, default sv
  const q = c.req.query('lang') || c.req.query('locale')
  let lang = (q || getCookie(c, 'lang') || 'sv').toLowerCase()
  if (q) setCookie(c, 'lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'Lax' })
  if (!SUPPORTED_LANGS.includes(lang as any)) lang = 'sv'
  return lang as Lang
 }
 function t(lang: Lang) {
  return lang === 'en'
    ? {
        title: 'Your personal board – a "council of minds"',
        hero_subtitle: 'Ask your question. The council convenes. You receive ceremonial minutes with clear recommendations and a sealed Council Consensus.',
        ask: 'Ask your question',
        placeholder_question: 'Should I accept the job offer?',
        placeholder_context: 'Relevant context (goals, constraints, time horizon)',
        submit: 'Assemble the council',
        cta_access: 'Request Access',
        cta_demo: 'See demo',
        council_voices: 'Council Voices',
        consensus: 'Council Consensus',
        minutes_title: 'Council Minutes',
        case_title: 'Case',
        download_pdf: 'Download PDF',
        risks_label: 'Identified risks',
        working_title: 'The council is convening',
        working_preparing: 'Preparing…',
        working_steps: [
          'Preparing council documents',
          'Chief Strategist analyzing',
          'Futurist analyzing',
          'Behavioral Psychologist analyzing',
          'Senior Advisor consolidating',
          'Formulating Council Consensus'
        ],
        error_generic_prefix: 'Something went wrong:',
        error_tech_prefix: 'Technical error:',
        error_unknown: 'unknown error',
        council_sealed_prefix: 'Council Sealed:',
        seal_text: 'Council Sealed',
        unanimous_recommendation_label: 'Unanimous Recommendation:',
        opportunities_label: 'Opportunities',
        board_statement_label: 'Board statement',
        conditions_label: 'Conditions',
        kpis_label: 'KPIs to monitor',
        back_to_minutes: 'Back to minutes',
        recommendations_label: 'Recommendations',
        council_page_title: 'Council',
        council_page_subtitle: 'Meet the Concillio council: four complementary expert roles synthesizing your toughest decisions.',
        learn_more: 'Learn more',
        run_session: 'Run a session',
        role_desc: {
          strategist: 'Long-horizon strategic framing: options, reversibility, milestones, and first 90 days.',
          futurist: 'Scenario thinking with probabilities, leading indicators, no-regret moves, and real options.',
          psychologist: 'Human factors: biases, identity fit, risk appetite, resistance points, decision protocols.',
          advisor: 'Synthesis and decision: trade-offs, primary recommendation, conditions, KPIs, and board statement.'
        },
        consensus_desc: 'The ceremonial synthesis of all roles: risks, opportunities, unanimous recommendation, board statement, conditions, and KPIs.',
        what_you_get_label: "What you'll get",
        example_snippet_label: 'Example minutes snippet',
        method_scope_label: 'Method & scope',
        faq_label: 'FAQ',
        cta_run_council_session: 'Run a Council Session',
        cta_apply_invite: 'Apply for Invite',
        what_get_items: [
          'Strategic analysis and framing',
          'Options with reversibility and milestones',
          'Trade-offs and implications',
          'Primary recommendation with scope and conditions'
        ],
        method_scope_paragraph: 'This role considers time horizons (12–36 months), constraints, reversibility, and salient biases. It synthesizes inputs to outline clear options with evidence and milestones, while explicitly stating assumptions and conditions for success.',
        faq_q1: 'How does Council Consensus work?',
        faq_a1: 'All roles feed a formal synthesis that yields a ceremonial, unanimous recommendation with conditions.',
        faq_q2: 'How long are minutes stored?',
        faq_a2: 'By default 30 days (configurable). Personally identifiable information is scrubbed.',
        faq_q3: 'Which models do you use?',
        faq_a3: 'We use state-of-the-art models, pinned by version, with strict JSON outputs and evidence fields.',
        faq_q4: 'Can I export to PDF?',
        faq_a4: 'Yes. Minutes pages provide a print/PDF export, with localized labels.',
        example_structure_label: 'Example structure',
        consensus_hero_subcopy: 'The collective wisdom distilled into one unanimous recommendation.',
        consensus_get_items: [
          'A formal, unanimous council decision',
          'Risks and conditions explicitly listed',
          'A “ceremonial” board-like statement'
        ],
        consensus_example_quote: '“By unanimous consent, the Council recommends acceptance of the CTO role, conditional on milestone-based equity and immediate VP Engineering hire.”',
        consensus_method_scope_items: [
          'Focus: The council’s collective and binding voice',
          'Method: Consolidation of all roles’ outputs into a unified ruling',
          'Scope: Final decision, risks, conditions, board-style endorsement'
        ],
        cta_secure_seat: 'Secure Your Seat at the Table',
        cta_see_how_works: 'See how the Council works',
        reveal_deliberations: "Reveal the council's deliberations",
        aria_learn_more_about: 'Learn more about',
        aria_open_role: 'Open role details for',
        aria_view_consensus_details: 'View consensus details',
        menu_open: 'Open menu',
        menu_close: 'Close menu',
        menu_title: 'Menu',
        menu_language: 'Language',
        menu_council: 'Council',
        menu_roles: 'Roles',
        menu_consensus: 'Consensus',
        menu_about: 'About',
        menu_how_it_works: 'How it works',
        menu_pricing: 'Pricing',
        menu_cases: 'Case Studies',
        menu_resources: 'Resources',
        menu_blog: 'Blog',
        menu_waitlist: 'Waitlist / Apply',
        menu_contact: 'Contact',
        menu_theme: 'Theme',
        theme_system: 'System',
        theme_light: 'Light',
        theme_dark: 'Dark',
            menu_more: 'More',
            tagline_short: 'Where wisdom convenes.',
            head_home_title: 'Concillio – Council of Minds',
            head_home_desc: 'Your personal board: four expert voices synthesised into a ceremonial, unanimous recommendation.',
            minutes_desc: 'Ceremonial minutes with clear recommendations.',
            why_items: [
              { k: 'Multiple perspectives', d: 'Four expert roles in structured synthesis.' },
              { k: 'Decisions in minutes', d: 'Ceremonial minutes with clear actions.' },
              { k: 'Exclusive access', d: 'Invitation-only, limited seats.' },
              { k: 'Confidential & Secure', d: 'Your information stays private.' }
            ],
            hero_heading: 'Where wisdom convenes.',
            hero_tagline: 'Your personal council of minds, always ready.',
            story_head: 'Imagine never facing a major decision alone again.',
            story_paragraph: 'Concillio combines multiple expert perspectives into a single, ceremonial recommendation—fast, confident, and clear. Members enjoy an exclusive, invitation-only experience designed for leaders making high-stakes decisions.',
            story_elite_title: 'Elite Decision Support',
            story_elite_b1: 'Strategic framing with reversibility and milestones',
            story_elite_b2: 'Scenario thinking with probabilities',
            story_elite_b3: 'Human factors and decision protocols',
            story_wisdom_title: 'Wisdom & Clarity',
            story_wisdom_b1: 'Concise synthesis into Council Minutes',
            story_wisdom_b2: 'Unanimous recommendation with conditions',
            story_wisdom_b3: 'Board statement and KPIs to monitor',
            council_in_action_title: 'Council in Action',
            council_in_action_case: 'Case: Should I accept the offer?',
            role_card_blurb: 'Concise analysis and top recommendations…',
            consensus_teaser_label: 'Unanimous Recommendation',
            consensus_teaser_line: 'Proceed with a phased implementation, subject to conditions A and B.',
            testimonials: [
              { q: '“The fastest path to clarity I’ve experienced.”', a: 'A.M., Founder' },
              { q: '“Boardroom-grade advice on demand.”', a: 'L.S., Partner' }
            ],
            about_title: 'Concillio Overview',
            about_overview: 'Concillio is a council of complementary perspectives delivering ceremonial minutes and a unanimous Council Consensus.',
            about_bullets: [
              '“Where wisdom convenes.”',
              'Why: to make better decisions in complex environments.',
              'Exclusivity: “Invitation only, curated intelligence.”'
            ],
            about_intro_title: 'Our mission',
            about_who_title: 'Who we are',
            about_values_title: 'Our values',
            about_values: [
              'Board-style consensus and minutes',
              'Multiple expert perspectives synthesized',
              'Premium, selective membership'
            ],
            story_label: 'Storytelling',
            story_why: 'Why a council? Today’s decisions demand multiple lenses: strategy, future, psychology, and decision synthesis. Together they provide confidence and clarity.',
            how_title: 'How it works',
            how_items: [
              { i: '❓', t: 'Ask your question', d: 'Describe your goal and context.' },
              { i: '🧭', t: 'Roles analyze', d: 'Strategist, Futurist, Psychologist, Advisor.' },
              { i: '📜', t: 'Council Minutes', d: 'You receive minutes with recommendations.' },
              { i: '🏛️', t: 'Council Consensus', d: 'A formal, unanimous decision.' }
            ],
            how_intro_tagline: 'Exact process in 4 steps',
            how_example_title: 'Example: Council Minutes',
            how_example_desc: 'A simplified mockup is shown here.',
            pricing_title: 'Premium Pricing',
            pricing_plans: [
              { n: 'Individual', p: '$249/m', f: ['Full access to the council','Ceremonial minutes','Council Consensus'] },
              { n: 'Team', p: '$699/m', f: ['Up to 5 users','Shared cases and history','Priority support'] },
              { n: 'Enterprise', p: 'Custom', f: ['Security & legal add-ons','SLA & dedicated liaison','Integrations'] }
            ],
            pricing_value_title: 'Value over cost',
            pricing_value_blurb: 'A wrong decision costs far more. Concillio reduces risk and accelerates the right call.',
            cases_title: 'Case Studies',
            case_items: [
              { t: 'Expansion to new market', s: ['Strategist warned of long-term risks.','Futurist foresaw industry shifts.','Psychologist highlighted hidden biases.','Advisor balanced the options.'] },
              { t: 'Product strategy pivot', s: ['Strategist mapped trade-offs.','Futurist flagged regulatory vectors.','Psychologist aligned team incentives.','Advisor drove a crisp decision.'] }
            ],
            case_outcome: 'Outcome: A unanimous Council Consensus.',
            case_more_coming: 'More case studies will be added over time.',
            resources_title: 'Resources',
            resources_items: [
              { k: 'Whitepaper', d: 'Whitepaper: Decision-making under uncertainty' },
              { k: 'Playbook', d: 'Decision-Making Playbook & checklists' },
              { k: 'Explainer', d: 'Bias & futures analysis — explained' }
            ],
            resources_download_latest: 'Download whitepapers and frameworks as lead magnets.',
            blog_posts: [
              { t: 'On Strategic Reversibility', d: 'Why options and milestones matter.' },
              { t: 'Biases that Blind Founders', d: 'A short guide to audit your decisions.' }
            ],
            waitlist_line: '500+ Members | Invitation Only | Fully Confidential',
            placeholder_name: 'Name',
            placeholder_email: 'Email',
            placeholder_linkedin: 'LinkedIn URL',
            waitlist_thanks: 'Thanks — we’ll be in touch.',
            contact_title: 'Council Liaison',
            contact_blurb: 'Professional contact for members, press, and partners.',
            placeholder_message: 'Message',
            contact_submit: 'Send',
            lang_switch_hint: 'Language switch is in the menu',
        aria_switch_to_sv: 'Switch language to Swedish',
        aria_switch_to_en: 'Switch language to English',
        aria_switch_to_theme_system: 'Switch theme to System',
        aria_switch_to_theme_light: 'Switch theme to Light',
        aria_switch_to_theme_dark: 'Switch theme to Dark'
      }
    : {
        title: 'Din personliga styrelse – ett "council of minds"',
        hero_subtitle: 'Ställ din fråga. Rådet samlas. Du får ett ceremoniellt protokoll med tydliga rekommendationer och ett sigillerat Council Consensus.',
        ask: 'Ställ din fråga',
        placeholder_question: 'Ska jag tacka ja till jobberbjudandet?',
        placeholder_context: 'Relevant kontext (mål, begränsningar, tidshorisont)',
        submit: 'Samla rådet',
        cta_access: 'Begär åtkomst',
        cta_demo: 'Se demo',
        council_voices: 'Rådets röster',
        consensus: 'Rådets konsensus',
        minutes_title: 'Protokoll',
        case_title: 'Ärende',
        download_pdf: 'Ladda ner PDF',
        risks_label: 'Identifierade risker',
        working_title: 'Rådet sammanträder',
        working_preparing: 'Förbereder…',
        working_steps: [
          'Förbereder rådets dokument',
          'Chefstrateg analyserar',
          'Futurist analyserar',
          'Beteendepsykolog analyserar',
          'Senior rådgivare väger samman',
          'Formulerar Council Consensus'
        ],
        error_generic_prefix: 'Något gick fel:',
        error_tech_prefix: 'Tekniskt fel:',
        error_unknown: 'okänt fel',
        council_sealed_prefix: 'Rådets sigill:',
        seal_text: 'Rådets sigill',
        unanimous_recommendation_label: 'Enig rekommendation:',
        opportunities_label: 'Möjligheter',
        board_statement_label: 'Styrelsens uttalande',
        conditions_label: 'Villkor',
        kpis_label: 'KPI:er att övervaka',
        back_to_minutes: 'Tillbaka till protokollet',
        recommendations_label: 'Rekommendationer',
        council_page_title: 'Rådet',
        council_page_subtitle: 'Möt Concillio-rådet: fyra kompletterande expertroller som syntetiserar dina svåraste beslut.',
        learn_more: 'Läs mer',
        run_session: 'Starta en session',
        role_desc: {
          strategist: 'Långsiktig strategisk inramning: alternativ, reversibilitet, milstolpar och första 90 dagarna.',
          futurist: 'Scenariotänkande med sannolikheter, ledande indikatorer, no-regret moves och reala optioner.',
          psychologist: 'Mänskliga faktorer: biaser, identitetsfit, riskaptit, motståndspunkter och beslutsprotokoll.',
          advisor: 'Syntes och beslut: trade-offs, primär rekommendation, villkor, KPI:er och styrelsens uttalande.'
        },
        consensus_desc: 'Den ceremoniella syntesen av alla roller: risker, möjligheter, enig rekommendation, styrelsens uttalande, villkor och KPI:er.',
        what_you_get_label: 'Det här får du',
        example_snippet_label: 'Exempel ur protokoll',
        method_scope_label: 'Metod & scope',
        faq_label: 'FAQ',
        cta_run_council_session: 'Starta en Council Session',
        cta_apply_invite: 'Ansök om inbjudan',
        what_get_items: [
          'Strategisk analys och inramning',
          'Alternativ med reversibilitet och milstolpar',
          'Avvägningar och implikationer',
          'Primär rekommendation med omfattning och villkor'
        ],
        method_scope_paragraph: 'Rollen beaktar tidshorisonter (12–36 månader), begränsningar, reversibilitet och framträdande biaser. Den syntetiserar underlag för att ange tydliga alternativ med evidens och milstolpar, samt uttalar antaganden och villkor för framgång.',
        faq_q1: 'Hur fungerar Council Consensus?',
        faq_a1: 'Alla roller matas in i en formell syntes som ger en ceremoniell, enig rekommendation med villkor.',
        faq_q2: 'Hur länge lagras protokoll?',
        faq_a2: 'Som standard 30 dagar (konfigurerbart). Personligt identifierbar information rensas.',
        faq_q3: 'Vilka modeller använder ni?',
        faq_a3: 'Vi använder toppmoderna modeller, pinnade per version, med strikt JSON-utdata och evidensfält.',
        faq_q4: 'Kan jag exportera till PDF?',
        faq_a4: 'Ja. Protokollsidorna erbjuder utskrift/PDF-export med lokaliserade etiketter.',
        example_structure_label: 'Exempel på struktur',
        consensus_hero_subcopy: 'Rådets samlade klokskap destillerad till en enig rekommendation.',
        consensus_get_items: [
          'Ett formellt, enigt rådsbeslut',
          'Risker och villkor uttryckligen listade',
          'Ett “ceremoniellt” styrelseliknande uttalande'
        ],
        consensus_example_quote: '“Genom enhälligt beslut rekommenderar Rådet att anta CTO-rollen, villkorat av milstolpebaserad equity och omedelbar rekrytering av en VP Engineering.”',
        consensus_method_scope_items: [
          'Fokus: Rådets kollektiva och bindande röst',
          'Metod: Sammanslagning av alla rollers utdata till en enhetlig utsaga',
          'Scope: Slutligt beslut, risker, villkor, styrelseliknande uttalande'
        ],
        cta_secure_seat: 'Säkra din plats vid bordet',
        cta_see_how_works: 'Se hur Rådet fungerar',
        reveal_deliberations: 'Visa rådets överläggningar',
        aria_learn_more_about: 'Läs mer om',
        aria_open_role: 'Öppna roldetaljer för',
        aria_view_consensus_details: 'Visa konsensusdetaljer',
        menu_open: 'Öppna meny',
        menu_close: 'Stäng meny',
        menu_title: 'Meny',
        menu_language: 'Språk',
        menu_council: 'Rådet',
        menu_roles: 'Roller',
        menu_consensus: 'Konsensus',
        menu_about: 'Om',
        menu_how_it_works: 'Så fungerar det',
        menu_pricing: 'Priser',
        menu_cases: 'Kundcase',
        menu_resources: 'Resurser',
        menu_blog: 'Blogg',
        menu_waitlist: 'Väntelista / Ansök',
        menu_contact: 'Kontakt',
        menu_theme: 'Tema',
        theme_system: 'System',
        theme_light: 'Ljust',
        theme_dark: 'Mörkt',
            menu_more: 'Mer',
            tagline_short: 'Där klokskap samlas.',
            head_home_title: 'Concillio – Råd av sinnen',
            head_home_desc: 'Din personliga styrelse: fyra expertroller som sammanväger till en ceremoniell, enad rekommendation.',
            minutes_desc: 'Ceremoniella protokoll med tydliga rekommendationer.',
            why_items: [
              { k: 'Flera perspektiv', d: 'Fyra expertroller i strukturerad syntes.' },
              { k: 'Beslut på minuter', d: 'Ceremoniella protokoll med tydliga åtgärder.' },
              { k: 'Exklusiv åtkomst', d: 'Endast inbjudan, begränsat antal platser.' },
              { k: 'Konfidentiellt & Säkert', d: 'Din information förblir privat.' }
            ],
            hero_heading: 'Där klokskap samlas.',
            hero_tagline: 'Din personaliserade rådskrets, alltid redo.',
            story_head: 'Fatta aldrig ett stort beslut ensam igen.',
            story_paragraph: 'Concillio förenar flera expertperspektiv till en ceremoniell rekommendation—snabb, trygg och tydlig. Medlemmar får en exklusiv, inbjudningsbaserad upplevelse för ledare som fattar avgörande beslut.',
            story_elite_title: 'Elitstöd för beslut',
            story_elite_b1: 'Strategisk inramning med reversibilitet och milstolpar',
            story_elite_b2: 'Scenariotänkande med sannolikheter',
            story_elite_b3: 'Mänskliga faktorer och beslutsprotokoll',
            story_wisdom_title: 'Visdom & Klarhet',
            story_wisdom_b1: 'Koncis syntes i protokoll',
            story_wisdom_b2: 'Enig rekommendation med villkor',
            story_wisdom_b3: 'Styrelseliknande uttalande och KPI:er att följa upp',
            council_in_action_title: 'Rådet i praktiken',
            council_in_action_case: 'Ärende: Bör jag acceptera erbjudandet?',
            role_card_blurb: 'Koncis analys och topprekommendationer…',
            consensus_teaser_label: 'Enig rekommendation',
            consensus_teaser_line: 'Gå vidare med stegvis införande, villkorat av A och B.',
            testimonials: [
              { q: '“Den snabbaste vägen till klarhet jag upplevt.”', a: 'A.M., Grundare' },
              { q: '“Styrelserådgivning på begäran.”', a: 'L.S., Partner' }
            ],
            about_title: 'Överblick över Concillio',
            about_overview: 'Concillio är ett råd av kompletterande perspektiv som ger ceremoniella protokoll och ett enigt Council Consensus.',
            about_bullets: [
              '“Där klokskap samlas.”',
              'Varför: för att fatta bättre beslut i komplexa miljöer.',
              'Exklusivitet: “Invitation only, curated intelligence.”'
            ],
            about_intro_title: 'Vår mission',
            about_who_title: 'Vilka vi är',
            about_values_title: 'Våra värderingar',
            about_values: [
              'Styrelseliknande konsensus och protokoll',
              'Flera expertperspektiv sammanvägda',
              'Premium, selektivt medlemskap'
            ],
            story_label: 'Berättelse',
            story_why: 'Varför ett råd? Dagens beslut kräver flera perspektiv: strategi, framtid, psykologi och beslutssyntes. Tillsammans skapar de trygghet och tydlighet.',
            how_title: 'Så fungerar det',
            how_items: [
              { i: '❓', t: 'Ställ din fråga', d: 'Beskriv målet och kontexten.' },
              { i: '🧭', t: 'Rollerna analyserar', d: 'Strategist, Futurist, Psychologist, Advisor.' },
              { i: '📜', t: 'Protokoll', d: 'Du får ett protokoll med rekommendationer.' },
              { i: '🏛️', t: 'Rådets konsensus', d: 'Ett enigt, formellt beslut.' }
            ],
            how_intro_tagline: 'Exakt process i 4 steg',
            how_example_title: 'Exempel: Council Minutes',
            how_example_desc: 'En förenklad mockup visas här.',
            pricing_title: 'Premium-prissättning',
            pricing_plans: [
              { n: 'Individuell', p: '$249/m', f: ['Full tillgång till rådet','Ceremoniella protokoll','Council Consensus'] },
              { n: 'Team', p: '$699/m', f: ['Upp till 5 användare','Delade ärenden och historik','Prioriterad support'] },
              { n: 'Enterprise', p: 'Custom', f: ['Säkerhets- & juridiska tillägg','SLA & dedikerad kontakt','Integrationer'] }
            ],
            pricing_value_title: 'Värde över kostnad',
            pricing_value_blurb: 'Ett felbeslut kan kosta mångdubbelt mer. Concillio minskar risken och accelererar rätt beslut.',
            cases_title: 'Fallstudier',
            case_items: [
              { t: 'Expansion till ny marknad', s: ['Strategen varnade för långsiktiga risker.','Futuristen förutsåg branschskiften.','Psykologen synliggjorde dolda biaser.','Rådgivaren balanserade alternativen.'] },
              { t: 'Pivot av produktstrategi', s: ['Strategen kartlade avvägningar.','Futuristen flaggade regulatoriska vektorer.','Psykologen linjerade teamets incitament.','Rådgivaren drev ett tydligt beslut.'] }
            ],
            case_outcome: 'Slutsats: Ett enigt Council Consensus.',
            case_more_coming: 'Fler case kommer att adderas över tid.',
            resources_title: 'Resurser',
            resources_items: [
              { k: 'Vitbok', d: 'Vitbok: Beslutsfattande under osäkerhet' },
              { k: 'Playbook', d: 'Playbook för beslutsfattande & checklistor' },
              { k: 'Förklaring', d: 'Bias & framtidsanalys – förklarat' }
            ],
            resources_download_latest: 'Ladda ner whitepapers och ramverk som lead‑magnets.',
            blog_posts: [
              { t: 'Om strategisk reversibilitet', d: 'Varför alternativ och milstolpar spelar roll.' },
              { t: 'Biaser som förblindar grundare', d: 'En kort guide för att granska dina beslut.' }
            ],
            waitlist_line: '500+ medlemmar | Endast inbjudan | Helt konfidentiellt',
            placeholder_name: 'Namn',
            placeholder_email: 'Email',
            placeholder_linkedin: 'LinkedIn‑URL',
            waitlist_thanks: 'Tack — vi hör av oss.',
            contact_title: 'Council Liaison',
            contact_blurb: 'Professionell kontakt för medlemmar, press och partners.',
            placeholder_message: 'Meddelande',
            contact_submit: 'Skicka',
            lang_switch_hint: 'Språkval finns i menyn',
        aria_switch_to_sv: 'Byt språk till svenska',
        aria_switch_to_en: 'Byt språk till engelska',
        aria_switch_to_theme_system: 'Byt tema till System',
        aria_switch_to_theme_light: 'Byt tema till Ljust',
        aria_switch_to_theme_dark: 'Byt tema till Mörkt'
      }
 }

// Localize role names for display
function roleLabel(name: string, lang: 'sv' | 'en') {
  if (lang === 'sv') {
    const map: Record<string, string> = {
      'Chief Strategist': 'Chefstrateg',
      'Futurist': 'Futurist',
      'Behavioral Psychologist': 'Beteendepsykolog',
      'Senior Advisor': 'Senior rådgivare'
    }
    return map[name] || name
  }
  return name
}

// Global premium hamburger menu component
function hamburgerUI(lang: Lang) {
  const L = t(lang)
  return (
    <>
      <button id="menu-trigger" aria-label={L.menu_open} aria-controls="site-menu-panel" aria-expanded="false"
        class="fixed top-4 right-4 z-[60] inline-flex items-center justify-center w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50">
        <span class="sr-only">{L.menu_open}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="3" y="6" width="18" height="2" rx="1" fill="var(--concillio-gold)"/>
          <rect x="3" y="11" width="18" height="2" rx="1" fill="var(--concillio-gold)"/>
          <rect x="3" y="16" width="18" height="2" rx="1" fill="var(--concillio-gold)"/>
        </svg>
      </button>

      <div id="site-menu-overlay" class="fixed inset-0 z-[59] hidden bg-black/50"></div>

      <nav id="site-menu-panel" role="dialog" aria-modal="true" aria-labelledby="site-menu-title"
        class="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[61] translate-x-full transition-transform duration-200 ease-out">
        <div class="h-full bg-neutral-950 border-l border-neutral-800 p-6 overflow-y-auto">
          <div class="flex items-start justify-between">
            <div id="site-menu-title" class="font-['Playfair_Display'] text-xl text-neutral-100">{L.menu_title}</div>
            <button id="menu-close" aria-label={L.menu_close}
              class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="var(--concillio-gold)" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="sr-only">{L.menu_close}</span>
            </button>
          </div>

          <div class="mt-6">
            <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.menu_language}</div>
            <div class="flex gap-2">
              <button data-set-lang="sv" class="px-3 py-1 rounded border border-neutral-800 text-neutral-200 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50" aria-label={L.aria_switch_to_sv}>SV</button>
              <button data-set-lang="en" class="px-3 py-1 rounded border border-neutral-800 text-neutral-200 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50" aria-label={L.aria_switch_to_en}>EN</button>
            </div>
          </div>

          <div class="mt-6">
            <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.menu_theme}</div>
            <div class="flex gap-2" role="group" aria-label={L.menu_theme}>
              <button data-set-theme="system" class="theme-btn px-3 py-1 rounded border border-neutral-800 text-neutral-200 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50" aria-label={L.aria_switch_to_theme_system} aria-pressed="false">{L.theme_system}</button>
              <button data-set-theme="light" class="theme-btn px-3 py-1 rounded border border-neutral-800 text-neutral-200 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50" aria-label={L.aria_switch_to_theme_light} aria-pressed="false">{L.theme_light}</button>
              <button data-set-theme="dark" class="theme-btn px-3 py-1 rounded border border-neutral-800 text-neutral-200 hover:border-[var(--concillio-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50" aria-label={L.aria_switch_to_theme_dark} aria-pressed="false">{L.theme_dark}</button>
            </div>
          </div>

          <div class="mt-6">
            <PrimaryCTA href={`/council/ask?lang=${lang}`} label={L.ask} />
          </div>

          <div class="mt-8">
            <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.menu_council}</div>
            <ul class="space-y-2">
              <li><a href={`/council?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{L.menu_council}</a></li>
            </ul>
          </div>

          <div class="mt-6">
            <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.menu_roles}</div>
            <ul class="space-y-2">
              <li><a href={`/council/strategist?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{roleLabel('Chief Strategist', lang)}</a></li>
              <li><a href={`/council/futurist?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{roleLabel('Futurist', lang)}</a></li>
              <li><a href={`/council/psychologist?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{roleLabel('Behavioral Psychologist', lang)}</a></li>
              <li><a href={`/council/advisor?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{roleLabel('Senior Advisor', lang)}</a></li>
              <li><a href={`/council/consensus?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200">{L.menu_consensus}</a></li>
            </ul>
          </div>

          <div class="mt-6">
            <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.menu_more}</div>
            <ul class="space-y-1 text-neutral-300">
              <li><a href={`/about?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_about}</a></li>
              <li><a href={`/how-it-works?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_how_it_works}</a></li>
              <li><a href={`/pricing?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_pricing}</a></li>
              <li><a href={`/case-studies?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_cases}</a></li>
              <li><a href={`/resources?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_resources}</a></li>
              <li><a href={`/blog?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_blog}</a></li>
              <li><a href={`/waitlist?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_waitlist}</a></li>
              <li><a href={`/contact?lang=${lang}`} class="block px-3 py-2 rounded border border-transparent hover:border-[var(--concillio-gold)] text-neutral-200 hover:text-neutral-100">{L.menu_contact}</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var openBtn = document.getElementById('menu-trigger');
          var closeBtn = document.getElementById('menu-close');
          var panel = document.getElementById('site-menu-panel');
          var overlay = document.getElementById('site-menu-overlay');
          var previousFocus = null;

          function focusables(){
            return panel.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
          }
          function beacon(payload){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify(payload)); }
            catch(e){ try{ fetch('/api/analytics/council', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); }catch(_){} }
          }
          function open(){
            previousFocus = document.activeElement;
            panel.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
            openBtn.setAttribute('aria-expanded','true');
            document.body.style.overflow = 'hidden';
            beacon({ event: 'menu_open', role: 'menu', ts: Date.now() });
            var f = focusables(); if (f.length) f[0].focus(); else closeBtn.focus();
          }
          function close(){
            panel.classList.add('translate-x-full');
            overlay.classList.add('hidden');
            openBtn.setAttribute('aria-expanded','false');
            document.body.style.overflow = '';
            beacon({ event: 'menu_close', role: 'menu', ts: Date.now() });
            if (previousFocus && previousFocus.focus) { try{ previousFocus.focus(); }catch(e){} }
          }
          function onKey(e){
            if (panel.classList.contains('translate-x-full')) return;
            if (e.key === 'Escape'){ e.preventDefault(); close(); return; }
            if (e.key === 'Tab'){
              var el = Array.prototype.slice.call(focusables());
              if (!el.length) return;
              var first = el[0], last = el[el.length-1];
              if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
            }
          }
          if (openBtn) openBtn.addEventListener('click', open);
          if (closeBtn) closeBtn.addEventListener('click', close);
          if (overlay) overlay.addEventListener('click', close);
          document.addEventListener('keydown', onKey);

          // Theme switching
          var media = window.matchMedia('(prefers-color-scheme: dark)');
          var mediaListener = null;
          function applyTheme(theme){
            var html = document.documentElement;
            html.setAttribute('data-theme', theme);
            if (theme === 'dark') { html.classList.add('dark'); }
            if (theme === 'light') { html.classList.remove('dark'); }
            if (theme === 'system') {
              if (media.matches) html.classList.add('dark'); else html.classList.remove('dark');
            }
          }
          function updateThemeButtons(theme){
            try{
              panel.querySelectorAll('[data-set-theme]').forEach(function(btn){
                var active = btn.getAttribute('data-set-theme') === theme;
                btn.setAttribute('aria-pressed', active ? 'true' : 'false');
                btn.classList.toggle('selected', !!active);
              });
            }catch(e){}
          }
          function setTheme(theme){
            try{ document.cookie = 'theme='+theme+'; Path=/; Max-Age='+ (60*60*24*365) +'; SameSite=Lax'; localStorage.setItem('theme', theme); }catch(e){}
            if (mediaListener) { try{ media.removeEventListener('change', mediaListener); }catch(_){} }
            if (theme === 'system') {
              mediaListener = function(){ applyTheme('system'); };
              try{ media.addEventListener('change', mediaListener); }catch(_){ try{ media.addListener(mediaListener); }catch(__){} }
            }
            applyTheme(theme);
            updateThemeButtons(theme);
            beacon({ event: 'menu_link_click', role: 'menu', label: 'set_theme_'+theme, ts: Date.now() });
          }
          // Initialize theme selection UI state
          (function initTheme(){
            var stored = (function(){ try{ return localStorage.getItem('theme') || ''; }catch(_) { return ''; } })();
            var cookie = (document.cookie.match(/(?:^|; )theme=([^;]+)/)?.[1] || '').toLowerCase();
            var theme = stored || cookie || 'system';
            applyTheme(theme);
            updateThemeButtons(theme);
            if (theme === 'system') { try{ media.addEventListener('change', function(){ applyTheme('system'); updateThemeButtons('system'); }); }catch(_){ try{ media.addListener(function(){ applyTheme('system'); updateThemeButtons('system'); }); }catch(__){} } }
          })();

          panel.querySelectorAll('[data-set-theme]').forEach(function(btn){
            btn.addEventListener('click', function(){ setTheme(btn.getAttribute('data-set-theme')); });
          });

          // Language switching
          function setLang(lang){
            try{ document.cookie = 'lang='+lang+'; Path=/; Max-Age='+ (60*60*24*365) +'; SameSite=Lax'; localStorage.setItem('lang', lang); }catch(e){}
            var u = new URL(location.href);
            u.searchParams.set('lang', lang);
            // Remove legacy 'locale' param for consistency
            u.searchParams.delete('locale');
            location.href = u.toString();
          }
          panel.querySelectorAll('[data-set-lang]').forEach(function(btn){
            btn.addEventListener('click', function(){
              var v = btn.getAttribute('data-set-lang');
              beacon({ event: 'menu_link_click', role: 'menu', label: 'set_lang_'+v, ts: Date.now() });
              setLang(v);
            });
          });

          // Link click tracking
          panel.addEventListener('click', function(e){
            var a = e.target instanceof Element ? e.target.closest('a') : null;
            if (!a) return;
            var href = a.getAttribute('href') || '';
            beacon({ event: 'menu_link_click', role: 'menu', label: href, ts: Date.now() });
          });
        })();
      ` }} />
    </>
  )
}

function PrimaryCTA(props: { href: string; label: string; sublabel?: string; dataCta?: string; dataCtaSource?: string }) {
  const { href, label, sublabel, dataCta, dataCtaSource } = props
  const normalize = (variant: 'primary' | 'secondary', value?: string, href?: string) => {
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9\-]+/g, '-')
    if (value) {
      const v = clean(value)
      if (v.startsWith('primary-') || v.startsWith('secondary-')) return v
      return `${variant}-${v}`
    }
    try {
      const path = (href || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0]
      const ctx = clean(path.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\//g, '-')) || 'home'
      return `${variant}-${ctx}`
    } catch { return `${variant}-generic` }
  }
  const dataCtaFinal = normalize('primary', dataCta, href)
  return (
    <a href={href}
       data-cta={dataCtaFinal}
       data-cta-source={dataCtaSource}
       class="inline-flex items-center justify-center w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-[var(--gold)] text-white font-medium shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-[48px]">
      <span>{label}</span>
      {sublabel ? <span class="ml-3 text-xs opacity-80">{sublabel}</span> : null}
    </a>
  )
}

export function SecondaryCTA({
  href,
  label,
  dataCta,
  iconLeft,
  iconRight,
  disabled,
  dataCtaSource,
}: {
  href: string;
  label: string;
  dataCta?: string;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  disabled?: boolean;
  dataCtaSource?: string;
}) {
  const normalize = (variant: 'primary' | 'secondary', value?: string, href?: string) => {
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9\-]+/g, '-')
    if (value) {
      const v = clean(value)
      if (v.startsWith('primary-') || v.startsWith('secondary-')) return v
      return `${variant}-${v}`
    }
    try {
      const path = (href || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0]
      const ctx = clean(path.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\//g, '-')) || 'home'
      return `${variant}-${ctx}`
    } catch { return `${variant}-generic` }
  }
  const dataCtaFinal = normalize('secondary', dataCta, href)
  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled ? 'true' : 'false'}
      data-cta={dataCtaFinal}
      data-cta-source={dataCtaSource}
      class={[
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl",
        "min-h-[48px] border border-[var(--concillio-gold)] text-[var(--navy)]",
        "hover:bg-[var(--gold-12)]",
        "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/60",
        disabled ? "opacity-60 pointer-events-none" : ""
      ].join(" ")}
    >
      {iconLeft && <span class="shrink-0">{iconLeft}</span>}
      <span>{label}</span>
      {iconRight && <span class="shrink-0">{iconRight}</span>}
    </a>
  );
}

function PageIntro(lang: Lang, title: string, intro?: string) {
  return (
    <>
      <style type="text/tailwindcss">{`
  [data-scrolled="true"] { @apply shadow-sm; }
  @media (min-width: 1024px){
    [data-scrolled="true"] { @apply shadow-md; }
  }
  @media (prefers-reduced-motion: reduce){
    #page-sticky-header { transition: none !important; }
  }
`}</style>
      <header id="page-sticky-header"
        class="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-[color-mix(in_oklab,var(--navy)85%,white15%)] transition-shadow mb-0 min-h-[48px] flex items-center"
        data-scrolled="false">
        <a href={`/?lang=${lang}`} class="inline-flex items-center gap-3 group py-2 md:py-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{title}</div>
          </div>
        </a>
      </header>
      {intro ? <p class="text-neutral-300 mt-4">{intro}</p> : null}
      <script dangerouslySetInnerHTML={{ __html: `
  (() => {
    const el = document.getElementById('page-sticky-header');
    if (!el) return;
    const onScroll = () => el.dataset.scrolled = (scrollY > 0) ? 'true' : 'false';
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  })();
` }} />
    </>
  )
}

app.use(renderer)

// Slug helpers for council pages
const ROLE_SLUGS = ['strategist', 'futurist', 'psychologist', 'advisor'] as const
 type RoleSlug = typeof ROLE_SLUGS[number]
 function slugToRoleName(slug: RoleSlug): 'Chief Strategist' | 'Futurist' | 'Behavioral Psychologist' | 'Senior Advisor' {
  switch (slug) {
    case 'strategist': return 'Chief Strategist'
    case 'futurist': return 'Futurist'
    case 'psychologist': return 'Behavioral Psychologist'
    case 'advisor': return 'Senior Advisor'
  }
 }

// Landing page
app.get('/', (c) => {
  // set per-page head
  const lang0 = getLang(c)
  const L0 = t(lang0)
  c.set('head', {
    title: t(lang0).head_home_title,
    description: t(lang0).head_home_desc
  })
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen">{hamburgerUI(getLang(c))}
      <section class="container mx-auto px-6 py-16">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
          <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
          <div class="grid lg:grid-cols-2 gap-10 items-center relative">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-3 mb-6">
                <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
                <span class="uppercase tracking-[0.3em] text-sm text-neutral-300">Concillio</span>
              </div>
              {(() => { const L = t(getLang(c)); return (<h1 class="font-['Playfair_Display'] text-5xl sm:text-6xl leading-tight text-neutral-50">{L.hero_heading}</h1>) })()}
              {(() => { const L = t(getLang(c)); return (<p class="mt-5 text-neutral-300 max-w-xl">{L.hero_tagline}</p>) })()}
              <div class="mt-10 flex gap-3 flex-wrap">
                {(() => { const lang = getLang(c); const L = t(lang); return (
                  <PrimaryCTA href={`/council/ask?lang=${lang}`} label={L.ask} dataCtaSource="home:hero" />
                ) })()}
                {(() => { const lang = getLang(c); const L = t(lang); return (
                  <SecondaryCTA href={`/council?lang=${lang}`} label={L.cta_see_how_works} dataCtaSource="home:hero" />
                ) })()}
                {(() => { const lang = getLang(c); const L = t(lang); return (
                  <SecondaryCTA href={`/waitlist?lang=${lang}`} label={L.cta_apply_invite} dataCtaSource="home:hero" />
                ) })()}
              </div>
            </div>
            <div class="flex justify-center lg:justify-end">
              <div class="hero-orbit">
                <div class="ring r1"></div>
                <div class="ring r2"></div>
                <div class="ring r3"></div>
                <div class="seal">
                  <svg width="180" height="180" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Concillio */}
      <section class="container mx-auto px-6 py-14">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => { const L = t(getLang(c)); const items = L.why_items; return items.map((it) => (
            <div class="card-premium border border-neutral-800 rounded-xl p-5 bg-neutral-950/40 hover:bg-neutral-900/60">
              <div class="flex items-center gap-3 text-[var(--concillio-gold)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9.5" stroke="var(--concillio-gold)"/><path d="M8 12l2.5 2.5L16 9" stroke="var(--concillio-gold)" stroke-width="1.8" fill="none"/></svg>
                <div class="font-semibold">{it.k}</div>
              </div>
              <div class="mt-2 text-neutral-300 text-sm">{it.d}</div>
            </div>
          )) })()}
        </div>
      </section>

      {/* Storytelling */}
      <section class="container mx-auto px-6 py-16">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
          <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
          <div class="relative max-w-4xl">
            {(() => { const L = t(getLang(c)); return (<div class="text-[var(--concillio-gold)] font-semibold uppercase tracking-wider">{L.story_head}</div>) })()} 
            {(() => { const L = t(getLang(c)); return (<p class="mt-3 text-neutral-300">{L.story_paragraph}</p>) })()} 
          </div>
          <div class="relative mt-8 grid md:grid-cols-2 gap-6">
            <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
              <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-1">{t(getLang(c)).story_elite_title}</div>
              <ul class="list-disc list-inside text-neutral-200 leading-7">
                <li>{t(getLang(c)).story_elite_b1}</li>
                <li>{t(getLang(c)).story_elite_b2}</li>
                <li>{t(getLang(c)).story_elite_b3}</li>
              </ul>
            </div>
            <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
              <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-1">{t(getLang(c)).story_wisdom_title}</div>
              <ul class="list-disc list-inside text-neutral-200 leading-7">
                <li>{t(getLang(c)).story_wisdom_b1}</li>
                <li>{t(getLang(c)).story_wisdom_b2}</li>
                <li>{t(getLang(c)).story_wisdom_b3}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Ask / Run a Council Session */}
      <section id="ask" class="container mx-auto px-6 py-16">
        {(() => { const L = t(getLang(c)); const lang = getLang(c); return (
          <div class="flex items-center justify-between flex-wrap gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
            <div>
              <h2 class="font-['Playfair_Display'] text-3xl text-neutral-100">{L.ask}</h2>
              <p class="text-neutral-400 mt-1">{L.waitlist_line}</p>
            </div>
            <PrimaryCTA href={`/council/ask?lang=${lang}`} label={L.ask} />
          </div>
        ) })()}
      </section>

      {/* Council in Action */}
      <section class="container mx-auto px-6 py-14">
        {(() => { const L = t(getLang(c)); return (<div class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.council_in_action_title}</div>) })()}
        <div class="mt-5 border border-neutral-800 rounded-xl p-6 bg-neutral-900/60 relative">
          <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
          {(() => { const L = t(getLang(c)); return (<div class="text-neutral-300">{L.council_in_action_case}</div>) })()}
          <div class="grid md:grid-cols-2 gap-4 mt-4">
            {[ 'Chief Strategist','Futurist','Behavioral Psychologist','Senior Advisor'].map((r) => (
              <div class="border border-neutral-800 rounded-lg p-4 bg-neutral-950/40">
                {(() => { const lang = getLang(c); return (<div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-1">{roleLabel(r, lang)}</div>) })()}
                {(() => { const L = t(getLang(c)); return (<div class="text-neutral-200 text-sm">{L.role_card_blurb}</div>) })()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Council Consensus */}
      <section class="container mx-auto px-6 py-8">
        <div class="border border-neutral-800 rounded-xl p-6 bg-neutral-950/50 relative overflow-hidden">
          <div class="absolute -right-6 -top-10 text-[160px] font-['Playfair_Display'] text-[color-mix(in_oklab,var(--concillio-gold)25%,transparent)] select-none">C</div>
          <div class="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="var(--concillio-gold)" stroke-width="3" fill="none"/></svg>
            {(() => { const L = t(getLang(c)); return (<div class="text-[var(--concillio-gold)] font-semibold">{L.consensus_teaser_label}</div>) })()}
          </div>
          {(() => { const L = t(getLang(c)); return (<div class="mt-2 text-neutral-200">{L.consensus_teaser_line}</div>) })()}
        </div>
      </section>

      {/* Testimonials */}
      <section class="container mx-auto px-6 py-10">
        <div class="grid md:grid-cols-2 gap-4">
          {(() => { const L = t(getLang(c)); const items = L.testimonials; return items.map(x => (
            <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
              <div class="text-neutral-100">{x.q}</div>
              <div class="mt-2 text-neutral-400 text-sm flex items-center gap-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full border border-neutral-700 text-[var(--concillio-gold)] font-semibold">{x.a.split(',')[0].split('.').slice(0,2).join('')}</span><span>{x.a}</span></div>
            </div>
          )) })()}
        </div>
      </section>







      {/* Waitlist */}
      <section id="waitlist" class="container mx-auto px-6 py-14">
        {(() => { const L = t(getLang(c)); return (<div class="font-['Playfair_Display'] text-3xl text-neutral-100">{L.cta_secure_seat}</div>) })()}
        {(() => { const L = t(getLang(c)); return (<div class="mt-4 text-neutral-400">{L.waitlist_line}</div>) })()}
        {(() => { const lang = getLang(c); const L = t(lang); return (
          <PrimaryCTA href={`/waitlist?lang=${lang}`} label={L.cta_apply_invite} dataCtaSource="home:waitlist" />
        ) })()}
      </section>

      {/* Contact */}
      <section id="contact" class="container mx-auto px-6 py-14">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-base font-semibold">{L.menu_contact}</div>
        <h2 class="font-['Playfair_Display'] text-3xl text-neutral-100 mt-1">{t(getLang(c)).contact_title}</h2>
        <p class="mt-2 text-neutral-400">{t(getLang(c)).contact_blurb}</p>
        {(() => { const lang = getLang(c); return (
          <SecondaryCTA href={`/contact?lang=${lang}`} label={t(lang).menu_contact} dataCtaSource="home:contact" />
        ) })()}
      </section>

      {/* Footer */}
      <footer class="mt-8 bg-[#0b0f1a] text-neutral-300">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-500">Concillio</div>
            <div class="mt-2 text-neutral-200">{t(getLang(c)).tagline_short}</div>
          </div>
          <div class="space-y-2">
            <div><a href={`/about?lang=${getLang(c)}`} class="hover:text-neutral-100">{t(getLang(c)).menu_about}</a></div>
            <div><a href={`/pricing?lang=${getLang(c)}`} class="hover:text-neutral-100">{t(getLang(c)).menu_pricing}</a></div>
            <div><a href={`/resources?lang=${getLang(c)}`} class="hover:text-neutral-100">{t(getLang(c)).menu_resources}</a></div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--concillio-gold)"/><path d="M7 9v6M12 11v4M17 7v10" stroke="var(--concillio-gold)"/></svg><span>LinkedIn</span></div>
            <div><a href="#contact" class="hover:text-neutral-100">{t(getLang(c)).menu_contact}</a></div>
          </div>
        </div>
      </footer>
    </main>
  )
})

// PII scrub + inference logging utilities
function scrubPII(x: any): any {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  const phone = /(\+?\d[\d\s\-()]{7,}\d)/g
  const ssnSe = /\b(\d{6}|\d{8})[-+]\d{4}\b/g
  const repl = (s: string) => s
    .replace(email, '[email]')
    .replace(phone, '[phone]')
    .replace(ssnSe, '[personnummer]')
  if (typeof x === 'string') return repl(x)
  if (x && typeof x === 'object') {
    const out: any = Array.isArray(x) ? [] : {}
    for (const k of Object.keys(x)) {
      const v = (x as any)[k]
      out[k] = typeof v === 'string' ? repl(v) : scrubPII(v)
    }
    return out
  }
  return x
}

async function logInference(c: any, row: {
  session_id?: string
  role: string
  pack_slug: string
  version: string
  prompt_hash: string
  model?: string
  temperature?: number
  params_json?: any
  request_ts: string
  latency_ms: number
  cost_estimate_cents?: number | null
  status: 'ok' | 'error'
  error?: string | null
  payload_json?: any
  session_sticky_version?: string | null
}) {
  try {
    const DB = c.env.DB as D1Database
    await DB.prepare(`INSERT INTO inference_log (session_id, role, pack_slug, version, prompt_hash, model, temperature, params_json, request_ts, latency_ms, cost_estimate_cents, status, error, payload_json, session_sticky_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        row.session_id || null,
        row.role,
        row.pack_slug,
        row.version,
        row.prompt_hash,
        row.model || null,
        row.temperature ?? null,
        row.params_json ? JSON.stringify(row.params_json) : null,
        row.request_ts,
        row.latency_ms,
        row.cost_estimate_cents ?? null,
        row.status,
        row.error ?? null,
        row.payload_json ? JSON.stringify(scrubPII(row.payload_json)) : null,
        row.session_sticky_version ?? null
      ).run()
  } catch (e) {
    // best-effort only
  }
}

// API: council consult
app.post('/api/council/consult', async (c) => {
  const { OPENAI_API_KEY, DB } = c.env
  // No early return: if OPENAI key is missing we fall back to mock mode automatically

  const body = await c.req.json<{ question: string; context?: string }>().catch(() => null)
  if (!body?.question) return c.json({ error: 'question krävs' }, 400)

  // Load prompt pack (DB or fallback), sticky pinning via header/cookie can be added later
  const lang = getLang(c)
  const locale = lang === 'en' ? 'en-US' : 'sv-SE'
  const cookiePinned = getCookie(c, 'concillio_version')
  const pinned = c.req.header('X-Prompts-Version') || cookiePinned || undefined
  const pack = await loadPromptPack(c.env as any, 'concillio-core', locale, pinned)
  const packHash = await computePackHash(pack)

  // Mock mode: allow testing without OpenAI by adding ?mock=1 or header X-Mock: 1
  const isMock = c.req.query('mock') === '1' || c.req.header('X-Mock') === '1' || !OPENAI_API_KEY
  if (isMock) {
    const roleResults = [
      { role: 'Chief Strategist', analysis: `Strategisk analys för: ${body.question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför']},
      { role: 'Futurist', analysis: `Scenarier för: ${body.question}`, recommendations: ['No-regret: X', 'Real option: Y']},
      { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A']},
      { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...']}
    ]
    const consensus = {
      summary: `Sammanvägd bedömning kring: ${body.question}`,
      risks: ['Exekveringsrisk', 'Resursrisk'],
      unanimous_recommendation: 'Gå vidare med stegvis införande'
    }
    await DB.prepare(`CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run()
    const insert = await DB.prepare(`INSERT INTO minutes (question, context, roles_json, consensus_json) VALUES (?, ?, ?, ?)`)
      .bind(body.question, body.context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()
    const id = insert.meta.last_row_id
    c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
    c.header('X-Prompt-Version', pack.version)
    c.header('X-Prompt-Hash', packHash)
    c.header('X-Model', 'mock')
    setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
    setCookie(c, 'last_minutes_id', String(id), { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'Lax' })
    return c.json({ id, mock: true })
  }
  const rolesMap: Record<string, 'STRATEGIST'|'FUTURIST'|'PSYCHOLOGIST'|'ADVISOR'> = {
    'Chief Strategist': 'STRATEGIST',
    'Futurist': 'FUTURIST',
    'Behavioral Psychologist': 'PSYCHOLOGIST',
    'Senior Advisor': 'ADVISOR'
  }
  const roles = ['Chief Strategist', 'Futurist', 'Behavioral Psychologist', 'Senior Advisor'] as const

  const makePrompt = (roleKey: typeof roles[number]) => {
    const entryRole = rolesMap[roleKey]
    const compiled = compileForRole(pack, entryRole, {
      question: body.question,
      context: body.context || '',
      roles_json: '',
      goals: '',
      constraints: ''
    })
    return { system: compiled.system, user: compiled.user, params: compiled.params }
  }

  const callOpenAI = async (prompt: { system: string; user: string; params?: Record<string, unknown> }) => {
    const t0 = Date.now()
    const sysContent = (prompt.system || '') + (lang === 'en'
      ? '\n[Format] Answer ONLY in valid JSON with no extra text.\n[Language] Answer in English.'
      : '\n[Format] Svara ENDAST i giltig json utan extra text.\n[Språk] Svara på svenska.')
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sysContent },
          { role: 'user', content: prompt.user }
        ],
        temperature: (prompt.params?.temperature as number) ?? 0.3,
        response_format: { type: 'json_object' }
      })
    })
    const t1 = Date.now()
    const json: any = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      const errText = typeof json?.error?.message === 'string' ? json.error.message : `status ${resp.status}`
      throw new Error('OpenAI fel: ' + errText)
    }
    const raw = json.choices?.[0]?.message?.content?.trim() || '{}'
    // Robust JSON extraction: take substring between first { and last }
    let text = raw
    const s = raw.indexOf('{')
    const e = raw.lastIndexOf('}')
    if (s !== -1 && e !== -1 && e > s) text = raw.slice(s, e + 1)
    return { data: JSON.parse(text), usage: json.usage, latency: t1 - t0, model: json.model }
  }

  const toStr = (v: any) => typeof v === 'string' ? v : (v == null ? '' : JSON.stringify(v))
  const toList = (v: any) => Array.isArray(v) ? v.map(toStr) : (v == null ? [] : Object.values(v).map(toStr))

  function summarizeRoleOutput(roleName: string, data: any, lang: 'sv'|'en') {
    try {
      if (!data || typeof data !== 'object') return { analysis: toStr(data?.analysis) || '', recommendations: toList(data?.recommendations) }
      const recs: string[] = []
      let analysis = ''
      const r = roleName
      if (r === 'Chief Strategist') {
        const opts = Array.isArray(data.options) ? data.options : []
        const optNames = opts.map((o: any) => o?.name).filter(Boolean).join(', ')
        const ropt = data.recommended_option || data.recommended || ''
        analysis = optNames ? `Alternativ: ${optNames}. Rekommenderat: ${ropt || '—'}` : (toStr(data.analysis) || '')
        if (Array.isArray(data.why_now)) recs.push(...data.why_now.map(toStr))
        if (Array.isArray(data.first_90_days)) recs.push(...data.first_90_days.map((x: any) => toStr(x?.action || x)))
        if (opts.length && opts[0]?.milestones) {
          const ms = (opts[0].milestones || []).map((m: any) => `${m?.name || ''} ${m?.when ? '('+m.when+')' : ''}`.trim()).filter(Boolean)
          if (ms.length) recs.push('Milestones: ' + ms.join(', '))
        }
      } else if (r === 'Futurist') {
        const scenarios = Array.isArray(data.scenarios) ? data.scenarios : []
        if (scenarios.length) {
          const toSvName = (name: any) => {
            const n = String(name || '').toLowerCase()
            if (!n) return ''
            if (/(base|baseline)/.test(n)) return 'Bas'
            if (/(bear|negativ|downside|pessimist)/.test(n)) return 'Negativ'
            if (/(bull|positiv|upside|optimist)/.test(n)) return 'Positiv'
            return name
          }
          const fmtPct = (p: any) => {
            const v = Number(p)
            if (Number.isFinite(v)) {
              if (v >= 0 && v <= 1) return Math.round(v * 100) + ' %'
              if (v > 1 && v <= 100) return Math.round(v) + ' %'
            }
            return ''
          }
          const parts = scenarios.map((s: any) => {
            const n = toSvName(s?.name)
            const pr = fmtPct(s?.probability)
            return [n, pr && `(${pr})`].filter(Boolean).join(' ')
          }).filter(Boolean)
          if (parts.length) {
            analysis = `Scenarier (sannolikhet): ${parts.join(', ')}`
          } else {
            analysis = toStr(data.analysis) || ''
          }
        } else analysis = toStr(data.analysis) || ''
        if (Array.isArray(data.no_regret_moves)) recs.push(...data.no_regret_moves.map(toStr))
        if (Array.isArray(data.real_options)) recs.push(...data.real_options.map(toStr))
      } else if (r === 'Behavioral Psychologist') {
        // Omit explicit bias listing in the main analysis for a cleaner read.
        const fitRaw = data.identity_alignment?.fit
        const riskRaw = data.risk_profile?.appetite
        const svFitMap: any = { strong: 'stark', medium: 'medel', weak: 'svag' }
        const svRiskMap: any = { low: 'låg', medium: 'medel', high: 'hög' }
        const fit = svFitMap[String(fitRaw)] || fitRaw || '—'
        const risk = svRiskMap[String(riskRaw)] || riskRaw || '—'
        analysis = `Identitetsfit: ${fit}. Riskaptit: ${risk}`
        const checklist = data.decision_protocol?.checklist
        if (Array.isArray(checklist)) recs.push(...checklist.map(toStr))
        const premortem = data.decision_protocol?.premortem
        if (Array.isArray(premortem)) recs.push(...premortem.map(toStr))
      } else if (r === 'Senior Advisor') {
        const syn = Array.isArray(data.synthesis) ? data.synthesis : []
        analysis = syn.length ? `Syntes: ${syn.slice(0,3).map(toStr).join(' · ')}` : (toStr(data.analysis) || '')
        const pr = data.primary_recommendation?.decision
        if (pr) recs.push(`Rekommendation: ${toStr(pr)}`)
        const trade = Array.isArray(data.tradeoffs) ? data.tradeoffs.map((t: any) => `${t?.option || ''}: ${t?.upside || ''}/${t?.risk || ''}`.trim()) : []
        if (trade.length) recs.push(...trade)
      } else {
        analysis = toStr(data.analysis) || ''
        recs.push(...toList(data.recommendations))
      }
      // fallback if still empty
      if (!analysis) analysis = toStr(data.summary) || toStr(data.note) || ''
      const uniqueRecs = Array.from(new Set(recs.filter(Boolean)))
      return { analysis, recommendations: uniqueRecs }
    } catch {
      return { analysis: toStr(data?.analysis) || '', recommendations: toList(data?.recommendations) }
    }
  }

  let roleResults = [] as any[]
  try {
    for (const rName of roles) {
      const req = makePrompt(rName)
      const res: any = await callOpenAI(req)
      const data = res.data ?? res
      const fmt = summarizeRoleOutput(rName, data, lang)
      roleResults.push({
        role: rName,
        analysis: fmt.analysis,
        recommendations: fmt.recommendations
      })
      await logInference(c, {
        session_id: c.req.header('X-Session-Id') || undefined,
        role: rName,
        pack_slug: pack.pack.slug,
        version: pack.version,
        prompt_hash: packHash,
        model: res.model || 'gpt-4o-mini',
        temperature: (req.params?.temperature as number) ?? 0.3,
        params_json: req.params || {},
        request_ts: new Date().toISOString(),
        latency_ms: res.latency || 0,
        cost_estimate_cents: null,
        status: 'ok',
        error: null,
        payload_json: { system: req.system, user: req.user, output: data },
        session_sticky_version: pinned || null
      })
    }
  } catch (e: any) {
    // Graceful fallback to mock if OpenAI fails
    roleResults = [
      { role: 'Chief Strategist', analysis: `Strategisk analys för: ${body.question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför'] },
      { role: 'Futurist', analysis: `Scenarier för: ${body.question}`, recommendations: ['No-regret: X', 'Real option: Y'] },
      { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A'] },
      { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...'] }
    ]
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'ERROR',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      params_json: {},
      request_ts: new Date().toISOString(),
      latency_ms: 0,
      cost_estimate_cents: null,
      status: 'error',
      error: String(e?.message || e),
      payload_json: { question: body.question, context: body.context },
      session_sticky_version: pinned || null
    })
    c.header('X-Model', 'mock-fallback')
  }

  // Consensus
  const consensusCompiled = compileForRole(pack, 'CONSENSUS', {
    question: body.question,
    context: body.context || '',
    roles_json: JSON.stringify(roleResults)
  })
  const consensusCall = { system: consensusCompiled.system + (lang === 'en' ? '\n[Language] Answer in English.' : '\n[Språk] Svara på svenska.'), user: consensusCompiled.user, params: consensusCompiled.params }
  let consensusData: any
  try {
    const consensusRes: any = await callOpenAI(consensusCall)
    consensusData = consensusRes.data ?? consensusRes
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'CONSENSUS',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: consensusRes.model || 'gpt-4o-mini',
      temperature: (consensusCall.params?.temperature as number) ?? 0.3,
      params_json: consensusCall.params || {},
      request_ts: new Date().toISOString(),
      latency_ms: consensusRes.latency || 0,
      cost_estimate_cents: null,
      status: 'ok',
      error: null,
      payload_json: { system: consensusCall.system, user: consensusCall.user, output: consensusData },
      session_sticky_version: pinned || null
    })
  } catch (e: any) {
    // Fallback consensus
    consensusData = {
      summary: `Sammanvägd bedömning kring: ${body.question}`,
      risks: ['Exekveringsrisk', 'Resursrisk'],
      unanimous_recommendation: 'Gå vidare med stegvis införande'
    }
    await logInference(c, {
      session_id: c.req.header('X-Session-Id') || undefined,
      role: 'CONSENSUS',
      pack_slug: pack.pack.slug,
      version: pack.version,
      prompt_hash: packHash,
      model: 'mock-fallback',
      temperature: (consensusCall.params?.temperature as number) ?? 0.3,
      params_json: consensusCall.params || {},
      request_ts: new Date().toISOString(),
      latency_ms: 0,
      cost_estimate_cents: null,
      status: 'error',
      error: String(e?.message || e),
      payload_json: { system: consensusCall.system, user: consensusCall.user },
      session_sticky_version: pinned || null
    })
    c.header('X-Model', 'mock-fallback')
  }
  const consensus = {
    summary: toStr(consensusData.summary),
    risks: toList(consensusData.risks),
    unanimous_recommendation: toStr(consensusData.unanimous_recommendation)
  }

  // Persist to D1
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()

  const insert = await DB.prepare(`
    INSERT INTO minutes (question, context, roles_json, consensus_json)
    VALUES (?, ?, ?, ?)
  `).bind(body.question, body.context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()

  const id = insert.meta.last_row_id

  // Add reproducibility headers
  const entryHash = await computePromptHash({ role: 'BASE', system_prompt: 'Concillio', user_template: body.question, params: { model: 'gpt-4o-mini' }, allowed_placeholders: [] })
  c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
  c.header('X-Prompt-Version', pack.version)
  c.header('X-Prompt-Hash', packHash)
  c.header('X-Model', 'gpt-4o-mini')

  setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
  setCookie(c, 'last_minutes_id', String(id), { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'Lax' })
  return c.json({ id })
})

// View: minutes render
app.get('/minutes/:id', async (c) => {
  // per-page head (avoid PII in title/desc)
  const langH = getLang(c)
  const LH = t(langH)
  c.set('head', {
    title: `Concillio – ${LH.minutes_title}`,
    description: LH.minutes_desc || (langH === 'sv' ? 'Ceremoniella protokoll med tydliga rekommendationer.' : 'Ceremonial minutes with clear recommendations.')
  })
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  if (!id) return c.notFound()

  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const consensus = JSON.parse(row.consensus_json)

  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${getLang(c)}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            {(() => { const L = t(getLang(c)); return (<div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>) })()}
          </div>
        </a>
        <div class="flex items-center gap-4">
          <div class="sr-only" aria-hidden="true">{t(getLang(c)).lang_switch_hint}</div>
          {(() => { const lang = getLang(c); const L = t(lang); return (
            <SecondaryCTA href={`/api/minutes/${id}/pdf?lang=${lang}`} label={L.download_pdf} />
          ) })()}
        </div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
        {(() => { const L = t(getLang(c)); return (<h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.case_title}</h1>) })()}
        <p class="text-neutral-300 mt-2">{row.question}</p>
        {row.context && <p class="text-neutral-400 mt-1 whitespace-pre-wrap">{row.context}</p>}

        {(() => { const L = t(getLang(c)); return (<h2 class="mt-8 font-['Playfair_Display'] text-xl text-neutral-100">{L.council_voices}</h2>) })()}
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          {roles.map((r: any, i: number) => (
            (() => { const lang = getLang(c) as 'sv'|'en'; const L = t(lang); return (
              <a aria-label={`${L.aria_open_role} ${roleLabel(r.role, lang)}`} href={`/minutes/${id}/role/${i}?lang=${lang}`} key={`${r.role}-${i}`}
                 class="card-premium block border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[var(--concillio-gold)] hover:ring-1 hover:ring-[var(--concillio-gold)]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50">
                <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{roleLabel(r.role, lang)}</div>
                <div class="text-neutral-200 whitespace-pre-wrap">{r.analysis}</div>
                {r.recommendations && (
                  <ul class="mt-3 list-disc list-inside text-neutral-300">
                    {(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => <li>{it}</li>)}
                  </ul>
                )}
              </a>
            ) })()
          ))}
        </div>

        {(() => { const lang = getLang(c); const L = t(lang); return (
          <div class="mt-8">
            <h2 class="font-['Playfair_Display'] text-xl text-neutral-100 mb-2">{L.consensus}</h2>
          </div>
        ) })()}
        {(() => { const lang = getLang(c); const L = t(lang as any); return (
          <a aria-label={L.aria_view_consensus_details} href={`/minutes/${id}/consensus?lang=${lang}`} class="block mt-3 border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[var(--concillio-gold)] hover:ring-1 hover:ring-[var(--concillio-gold)]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50">
          <div class="text-neutral-200 whitespace-pre-wrap">{consensus.summary}</div>
          {consensus.risks && (
            <div class="mt-3">
              {(() => { const L = t(getLang(c)); return (<div class="text-neutral-400 text-sm mb-1">{L.risks_label}</div>) })()}
              <ul class="list-disc list-inside text-neutral-300">
                {(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => <li>{it}</li>)}
              </ul>
            </div>
          )}
          {consensus.unanimous_recommendation && (
            <div class="mt-4 flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="var(--concillio-gold)" stroke-width="3" fill="none"/></svg>
              {(() => { const L = t(getLang(c)); return (<div class="text-[var(--concillio-gold)] font-semibold">{L.council_sealed_prefix} {String(consensus.unanimous_recommendation)}</div>) })()}
            </div>
          )}
        </a>
        ) })()}
      </section>
    </main>
  )
})

// View: single role details
app.get('/minutes/:id/role/:idx', async (c) => {
  // per-page head
  const langH = getLang(c)
  const LH = t(langH)
  c.set('head', {
    title: `${langH === 'sv' ? 'Concillio – Roll i protokoll' : 'Concillio – Role in Minutes'}`,
    description: langH === 'sv' ? 'Rollens analys och rekommendationer i protokollet.' : 'Role analysis and recommendations within the minutes.'
  })
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  const idx = Number(c.req.param('idx'))
  if (!id || !Number.isFinite(idx)) return c.notFound()
  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const role = roles?.[idx]
  if (!role) return c.notFound()
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${lang}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>
          </div>
        </a>
        <SecondaryCTA href={`/minutes/${id}?lang=${lang}`} label={L.back_to_minutes} />
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style="background-image:url('/static/watermark.svg'); background-size: 600px; background-repeat: no-repeat; background-position: right -60px top -40px;"></div>
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs">{roleLabel(role.role, lang as any)}</div>
        <h1 class="mt-1 font-['Playfair_Display'] text-2xl text-neutral-100">{row.question}</h1>
        {row.context && <p class="text-neutral-400 mt-1 whitespace-pre-wrap">{row.context}</p>}

        <h2 class="mt-6 font-['Playfair_Display'] text-xl text-neutral-100">{L.case_title}</h2>
        <div class="mt-2 text-neutral-200 whitespace-pre-wrap">{role.analysis}</div>

        {role.recommendations && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.recommendations_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {(Array.isArray(role.recommendations) ? role.recommendations : [String(role.recommendations)]).map((it: string) => <li>{it}</li>)}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
})

// API: PDF export (server-side via Browserless if token exists, fallback to print HTML)
// View: consensus details
app.get('/minutes/:id/consensus', async (c) => {
  // per-page head
  const langH = getLang(c)
  const LH = t(langH)
  c.set('head', {
    title: `${langH === 'sv' ? 'Concillio – Konsensus' : 'Concillio – Consensus'}`,
    description: langH === 'sv' ? 'Enig rekommendation, risker, villkor och styrelseliknande uttalande.' : 'Unanimous recommendation, risks, conditions and board-style statement.'
  })
  const { DB } = c.env
  const id = Number(c.req.param('id'))
  if (!id) return c.notFound()

  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const consensus = JSON.parse(row.consensus_json || '{}')
  const lang = getLang(c) as 'sv' | 'en'
  const L = t(lang)
  const toArray = (v: any): any[] => Array.isArray(v) ? v : (v ? [v] : [])

  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${lang}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.minutes_title}</div>
          </div>
        </a>
        <SecondaryCTA href={`/minutes/${id}?lang=${lang}`} label={L.back_to_minutes} />
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>

        <h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.consensus}</h1>
        {consensus.summary && (
          <div class="mt-2 text-neutral-200 whitespace-pre-wrap">{String(consensus.summary)}</div>
        )}

        {toArray(consensus.risks).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.risks_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.risks).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {toArray(consensus.opportunities).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.opportunities_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.opportunities).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {consensus.unanimous_recommendation && (
          <div class="mt-6 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M24 33 l6 6 l12 -14" stroke="var(--concillio-gold)" stroke-width="3" fill="none"/></svg>
            <div class="text-[var(--concillio-gold)] font-semibold">{L.unanimous_recommendation_label} {String(consensus.unanimous_recommendation)}</div>
          </div>
        )}

        {consensus.board_statement && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.board_statement_label}</div>
            <div class="text-neutral-200 whitespace-pre-wrap">{String(consensus.board_statement)}</div>
          </div>
        )}

        {toArray(consensus.conditions).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.conditions_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.conditions).map((it: any) => <li>{String(it)}</li>)}
            </ul>
          </div>
        )}

        {toArray(consensus.kpis_monitor).length > 0 && (
          <div class="mt-5">
            <div class="text-neutral-400 text-sm mb-1">{L.kpis_label}</div>
            <ul class="list-disc list-inside text-neutral-300">
              {toArray(consensus.kpis_monitor).map((it: any) => {
                try {
                  if (it && typeof it === 'object') {
                    const parts = [it.metric, it.target, it.cadence].filter(Boolean)
                    return <li>{parts.join(' · ')}</li>
                  }
                } catch {}
                return <li>{String(it)}</li>
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
})

// Pages: marketing standalone overviews
app.get('/council', (c) => {
  // per-page head
  const langH = getLang(c)
  const LH = t(langH)
  c.set('head', {
    title: langH === 'sv' ? 'Concillio – Rådet' : 'Concillio – Council',
    description: langH === 'sv' ? LH.council_page_subtitle : LH.council_page_subtitle
  })
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${lang}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.council_page_title}</div>
          </div>
        </a>
        <div class="sr-only" aria-hidden="true">{t(getLang(c)).lang_switch_hint}</div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <p class="text-neutral-300">{L.council_page_subtitle}</p>

        <div class="mt-6 grid md:grid-cols-2 gap-4">
          {(['strategist','futurist','psychologist','advisor','consensus'] as any[]).map((slug) => {
            const isConsensus = slug === 'consensus'
            const roleNameEn = isConsensus ? L.consensus : slugToRoleName(slug as RoleSlug)
            const displayName = isConsensus ? roleNameEn : roleLabel(roleNameEn, lang as any)
            const desc = isConsensus ? L.consensus_desc : L.role_desc[slug as RoleSlug]
            const href = isConsensus ? `/council/consensus?lang=${lang}` : `/council/${slug}?lang=${lang}`
            const ariaLabelText = `${L.aria_learn_more_about} ${displayName}`
            return (
              <a aria-label={ariaLabelText} data-role={slug} href={href} class="card-premium block border border-neutral-800 rounded-lg p-4 bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-[var(--concillio-gold)] hover:ring-1 hover:ring-[var(--concillio-gold)]/30 transform-gpu transition transition-transform cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_6px_18px_rgba(179,160,121,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50">
                <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{displayName}</div>
                <div class="text-neutral-200">{desc}</div>
                <div class="mt-3 text-sm text-neutral-400">{L.learn_more} →</div>
              </a>
            )
          })}
        </div>

        <div class="mt-8 flex gap-3">
          <PrimaryCTA dataCta="start-session" href={`/council/ask?lang=${lang}`} label={L.run_session} dataCtaSource="council:hero" />
          <SecondaryCTA dataCta="start-session" href={`/waitlist?lang=${lang}`} label={L.cta_access} dataCtaSource="council:hero" />
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        // Analytics: standardized events with labels
        const cards = document.querySelectorAll('a[data-role]');
        function send(evt, role, label){
          const payload = { event: evt, role, label, ts: Date.now() };
          try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify(payload)); }catch(e){ fetch('/api/analytics/council', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}); }
        }
        cards.forEach(el=>{
          const role = el.getAttribute('data-role');
          el.addEventListener('mouseenter', ()=> send('council_card_hover', role, role));
          el.addEventListener('click', ()=> send('council_card_click', role, role));
        });
        document.querySelectorAll('[data-cta$="-start-session"]').forEach(function(el){
          el.addEventListener('click', function(){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'start_session_click', role: 'consensus', role_context: 'current', ts: Date.now() })); }catch(e){}
          });
        });
      ` }} />
    </main>
  )
})

// Council consensus detail page (marketing + live excerpt)

// /about
app.get('/about', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Om oss' : 'Concillio – About',
    description: lang === 'sv' ? 'Vår mission, vision och varför Concillio behövs.' : 'Our mission, vision, and why Concillio exists.'
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, lang==='sv'?'Om Concillio':'About Concillio', L.about_overview)}

      <section class="space-y-6">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <h2 class="font-['Playfair_Display'] text-xl text-neutral-100">{lang==='sv'?'Vår mission':'Our mission'}</h2>
          <p class="text-neutral-300 mt-2">{L.story_paragraph}</p>
        </div>
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <h2 class="font-['Playfair_Display'] text-xl text-neutral-100">{lang==='sv'?'Vilka vi är':'Who we are'}</h2>
          <p class="text-neutral-300 mt-2">{L.about_overview}</p>
        </div>
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <h2 class="font-['Playfair_Display'] text-xl text-neutral-100">{lang==='sv'?'Våra värderingar':'Our values'}</h2>
          <ul class="list-disc list-inside text-neutral-200 leading-7 mt-2">
            <li>{lang==='sv'?'Tillit':'Trust'}</li>
            <li>{lang==='sv'?'Visdom':'Wisdom'}</li>
            <li>{lang==='sv'?'Konfidentialitet':'Confidentiality'}</li>
            <li>{lang==='sv'?'Excellens':'Excellence'}</li>
          </ul>
        </div>
        <div>
          <PrimaryCTA href={`/council?lang=${lang}`} label={lang==='sv'?'Möt Rådet':'Meet the Council'} />
        </div>
      </section>
    </main>
  )
})

// /how-it-works
app.get('/how-it-works', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Så fungerar det' : 'Concillio – How it works',
    description: L.how_title
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, L.how_title, L.how_intro_tagline)}
      <section class="grid md:grid-cols-3 gap-4">
        <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
          <div class="text-2xl">❓</div>
          <h2 class="mt-2 text-neutral-100 font-semibold">{lang==='sv'?'Ställ din fråga':'Ask your question'}</h2>
          <div class="text-neutral-300 text-sm">{lang==='sv'?'Beskriv mål och kontext.':'Describe your goal and context.'}</div>
        </div>
        <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
          <div class="text-2xl">🧠</div>
          <h2 class="mt-2 text-neutral-100 font-semibold">{lang==='sv'?'Rådet överlägger':'The Council deliberates'}</h2>
          <div class="text-neutral-300 text-sm">{lang==='sv'?'Fyra roller analyserar parallellt.':'Four roles analyze in parallel.'}</div>
        </div>
        <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-950/40">
          <div class="text-2xl">✅</div>
          <h2 class="mt-2 text-neutral-100 font-semibold">{lang==='sv'?'Få konsensus':'Receive consensus'}</h2>
          <div class="text-neutral-300 text-sm">{lang==='sv'?'Få ceremoniellt protokoll och en enig rekommendation.':'Get ceremonial minutes and a unanimous recommendation.'}</div>
        </div>
      </section>
      <section class="mt-8 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.what_you_get_label}</div>
        <ul class="list-disc list-inside text-neutral-200 leading-7">
          {L.what_get_items.map((it: string) => <li>{it}</li>)}
        </ul>
      </section>
      <section class="mt-8 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{lang==='sv'?'Exempel: Council Minutes':'Example: Council Minutes'}</div>
        <div class="text-neutral-300">{lang==='sv'?'En förenklad mockup visas här.':'A simplified mockup is shown here.'}</div>
      </section>
      <section class="mt-6">
        <PrimaryCTA href={`/council/ask?lang=${lang}`} label={lang==='sv'?'Prova en session':'Try a session'} />
      </section>
    </main>
  )
})

// /pricing
app.get('/pricing', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Priser' : 'Concillio – Pricing',
    description: L.pricing_value_blurb
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, lang==='sv'?'Priser':'Pricing', lang==='sv'?'Exklusiv åtkomst till elitstöd för beslut':'Exclusive access to elite decision support')}
      <section class="grid md:grid-cols-3 gap-4">
        {[
          { n: lang==='sv'?'Individuell':'Individual', p: '$249/mo', f: [lang==='sv'?'Full tillgång till rådet':'Full access to the council', 'Ceremonial minutes', 'Council Consensus'] },
          { n: 'Business', p: '$699/mo', f: [lang==='sv'?'Upp till 5 användare':'Up to 5 users', lang==='sv'?'Delad historik':'Shared case history', lang==='sv'?'Prioriterad support':'Priority support'] },
          { n: 'Enterprise', p: lang==='sv'?'På förfrågan':'On request', f: [lang==='sv'?'Säkerhet & juridik':'Security & legal add‑ons', 'SLA & dedicated liaison', 'Integrations'] }
        ].map((p: any) => (
          <div class="border border-neutral-800 rounded-xl p-6 bg-neutral-900/60">
            <div class="text-neutral-100 text-lg font-semibold">{p.n}</div>
            <div class="text-[var(--concillio-gold)] text-2xl mt-1">{p.p}</div>
            <ul class="mt-3 list-disc list-inside text-neutral-300">{p.f.map((it: string) => <li>{it}</li>)}</ul>
            <PrimaryCTA href={`/waitlist?lang=${lang}`} label={lang==='sv'?'Ansök nu':'Apply now'} dataCtaSource={(p.n || '').toLowerCase().includes('enterprise') ? 'pricing:enterprise' : ((p.n || '').toLowerCase().includes('business') || (p.n || '').toLowerCase().includes('team') ? 'pricing:business' : 'pricing:individual')} />
            {p.n === 'Enterprise' ? (
              <div class="mt-3">
                <SecondaryCTA href={`/contact?lang=${lang}`} label={t(lang).menu_contact} dataCta="contact-sales" />
              </div>
            ) : null}
          </div>
        ))}
      </section>
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">FAQ</div>
        <div class="grid md:grid-cols-3 gap-4 text-neutral-200">
          <div>
            <div class="font-semibold">{lang==='sv'?'Betalningar':'Payments'}</div>
            <div class="text-neutral-300 text-sm">{lang==='sv'?'Kort debiteras månadsvis. Årsavtal på begäran.':'Cards billed monthly. Annual terms on request.'}</div>
          </div>
          <div>
            <div class="font-semibold">{lang==='sv'?'Avtal':'Agreements'}</div>
            <div class="text-neutral-300 text-sm">{lang==='sv'?'MSA/DPA tillgängligt för Business/Enterprise.':'MSA/DPA available for Business/Enterprise.'}</div>
          </div>
          <div>
            <div class="font-semibold">{lang==='sv'?'Konfidentialitet':'Confidentiality'}</div>
            <div class="text-neutral-300 text-sm">{lang==='sv'?'Allt material behandlas konfidentiellt.':'All materials are handled confidentially.'}</div>
          </div>
        </div>
      </section>
    </main>
  )
})

// /case-studies
app.get('/case-studies', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Fallstudier' : 'Concillio – Case Studies',
    description: L.cases_title
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, L.cases_title, lang==='sv'?'Se hur ledare har använt Concillio':'See how leaders have used Concillio')}
      <section class="grid md:grid-cols-2 gap-4">
        {L.case_items.map((cas: any) => (
          <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60">
            <div class="text-neutral-100 font-semibold">{cas.t}</div>
            <ul class="mt-2 list-disc list-inside text-neutral-300">{cas.s.map((line: string) => <li>{line}</li>)}</ul>
            <div class="mt-3 text-[var(--concillio-gold)]">{L.case_outcome}</div>
          </div>
        ))}
      </section>
      <section class="mt-8">
        <div class="text-neutral-400 text-sm">{lang==='sv'?'Fler case kommer att adderas över tid.':'More case studies will be added over time.'}</div>
        <div class="mt-4">
          <PrimaryCTA href={`/waitlist?lang=${lang}`} label={lang==='sv'?'Ansök nu':'Apply now'} />
        </div>
      </section>
    </main>
  )
})

// /resources
app.get('/resources', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Resurser' : 'Concillio – Resources',
    description: L.resources_title
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, L.resources_title)}
      <section class="mt-6 grid md:grid-cols-4 gap-4">
        {[
          { k: lang==='sv'?'Vitböcker':'Whitepapers', d: lang==='sv'?'Fördjupningar om beslutsmetodik.':'Deep dives on decision methodology.' },
          { k: lang==='sv'?'Guider':'Guides', d: lang==='sv'?'Praktiska playbooks och checklistor.':'Practical playbooks and checklists.' },
          { k: lang==='sv'?'Webbinarier':'Webinars', d: lang==='sv'?'Livesessioner med rådsmedlemmar.':'Live sessions with council members.' },
          { k: lang==='sv'?'Kunskapshubb':'Knowledge hub', d: lang==='sv'?'Samlad kunskap och resurser.':'Curated knowledge and resources.' }
        ].map((r: any) => (
          <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60">
            <div class="text-neutral-100 font-semibold">{r.k}</div>
            <div class="text-neutral-300 text-sm mt-1">{r.d}</div>
          </div>
        ))}
      </section>
      <section class="mt-8 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <form id="res-whitepaper" class="grid sm:grid-cols-[1fr_auto] gap-3 max-w-xl">
          <input name="name" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={lang==='sv'?'Namn':'Name'} />
          <input type="email" name="email" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder="Email" />
          <input type="hidden" name="source" value="resources-whitepaper" />
          <button class="sm:justify-self-start inline-flex items-center px-5 py-3 rounded-md bg-[var(--gold)] text-white font-medium shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed" type="submit">{lang==='sv'?'Ladda ner senaste vitboken':'Download latest whitepaper'}</button>
          <div id="res-ok" class="text-[var(--concillio-gold)] text-sm hidden sm:col-span-2">{lang==='sv'?'Tack – vi återkommer.':'Thanks — we’ll be in touch.'}</div>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var f=document.getElementById('res-whitepaper'); var ok=document.getElementById('res-ok'); if(!f) return;
            f.addEventListener('submit', async function(e){
              e.preventDefault(); var fd=new FormData(f);
              var payload={ name:String(fd.get('name')||'').trim(), email:String(fd.get('email')||'').trim(), source:String(fd.get('source')||'resources-whitepaper') };
              try{ var res=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(res.ok){ ok&&ok.classList.remove('hidden'); f.reset(); } else { alert('Submission failed'); } }catch(err){ alert('Network error'); }
            });
          })();
        ` }} />
      </section>
    </main>
  )
})

// /blog
app.get('/blog', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: 'Concillio – Blog',
    description: L.menu_blog
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, lang==='sv'?'Insikter från Rådet':'Insights from the Council', lang==='sv'?'Perspektiv på beslutsfattande från Concillio‑rådet.':'Perspectives on decision‑making from the Concillio Council.')}
      <section class="grid md:grid-cols-2 gap-4">
        {L.blog_posts.map((p: any) => (
          <div class="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60">
            <div class="text-neutral-100 font-semibold">{p.t}</div>
            <div class="text-neutral-300 text-sm mt-1">{p.d}</div>
          </div>
        ))}
      </section>
      <section class="mt-8">
        <SecondaryCTA href={`/waitlist?lang=${lang}`} label={lang==='sv'?'Gå med i samtalet':'Join the conversation'} dataCtaSource="blog:footer" />
      </section>
    </main>
  )
})

// /waitlist
app.get('/waitlist', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Väntelista' : 'Concillio – Waitlist',
    description: L.waitlist_line
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, L.cta_secure_seat, L.waitlist_line)}
      <div class="mb-4">
        <h2 class="font-['Playfair_Display'] text-xl text-neutral-200">Invitation-only access</h2>
        <div class="mt-2 flex items-center gap-4 text-neutral-400 text-sm">
          <div class="flex items-center gap-2"><span>👥</span><span>500+ members</span></div>
          <div class="flex items-center gap-2"><span>🔒</span><span>Confidential</span></div>
          <div class="flex items-center gap-2"><span>⭐</span><span>Exclusive</span></div>
        </div>
      </div>
      <form id="waitlist-form" class="grid gap-3 max-w-xl">
        <input name="name" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_name} />
        <input type="email" name="email" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_email} />
        <input name="linkedin" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_linkedin} />
        <button class="justify-self-start inline-flex items-center px-5 py-3 rounded-md bg-[var(--gold)] text-white font-medium shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed" type="submit">{L.cta_apply_invite}</button>
        <div class="text-neutral-400 text-sm mt-2">Applications reviewed weekly</div>
        <div id="waitlist-success" class="text-[var(--concillio-gold)] text-sm mt-2 hidden">{L.waitlist_thanks}</div>
      </form>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var f = document.getElementById('waitlist-form');
          var ok = document.getElementById('waitlist-success');
          if (!f) return;
          f.addEventListener('submit', async function(e){
            e.preventDefault();
            var btn = f.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.classList.add('opacity-60','cursor-not-allowed'); }
            const fd = new FormData(f);
            const payload = {
              name: String(fd.get('name')||'').trim(),
              email: String(fd.get('email')||'').trim(),
              linkedin: String(fd.get('linkedin')||'').trim(),
              source: 'waitlist-page'
            };
            try{
              const res = await fetch('/api/waitlist', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
              if (res.ok) { ok && ok.classList.remove('hidden'); f.reset(); }
              else { const t = await res.text(); alert('Submission failed: ' + t); }
            }catch(err){ alert('Network error: ' + (err?.message||err)); }
            finally { if (btn) { btn.disabled = false; btn.classList.remove('opacity-60','cursor-not-allowed'); } }
          });
        })();
      ` }} />
    </main>
  )
})

// /contact
app.get('/contact', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Kontakt' : 'Concillio – Contact',
    description: L.contact_blurb
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      {PageIntro(lang, L.menu_contact, L.contact_blurb)}
      <section class="mt-6 grid md:grid-cols-2 gap-6">
        <form id="contact-form" class="grid gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <input name="name" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_name} />
          <input type="email" name="email" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_email} />
          <textarea name="msg" rows="4" class="bg-neutral-900 border border-neutral-800 rounded p-3 text-neutral-100" placeholder={L.placeholder_message}></textarea>
          <button class="justify-self-start inline-flex items-center px-5 py-2 rounded-md bg-[var(--gold)] text-white font-medium shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed" type="submit">{lang==='sv'?'Skicka meddelande':'Send message'}</button>
          <div id="contact-success" class="text-[var(--concillio-gold)] text-sm mt-2 hidden">Thanks — message sent.</div>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var f = document.getElementById('contact-form');
            var ok = document.getElementById('contact-success');
            if (!f) return;
            f.addEventListener('submit', async function(e){
              e.preventDefault();
              var btn = f.querySelector('button[type="submit"]');
              if (btn) { btn.disabled = true; btn.classList.add('opacity-60','cursor-not-allowed'); }
              const fd = new FormData(f);
              const payload = {
                name: String(fd.get('name')||'').trim(),
                email: String(fd.get('email')||'').trim(),
                message: String(fd.get('msg')||'').trim(),
                source: 'contact-page'
              };
              try{
                const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                if (res.ok) { ok && ok.classList.remove('hidden'); f.reset(); }
                else { const t = await res.text(); alert('Submission failed: ' + t); }
              }catch(err){ alert('Network error: ' + (err?.message||err)); }
              finally { if (btn) { btn.disabled = false; btn.classList.remove('opacity-60','cursor-not-allowed'); } }
            });
          })();
        ` }} />
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div class="text-neutral-300">{L.contact_blurb}</div>
          <ul class="mt-3 text-neutral-200">
            <li>Email: contact@concillio.example</li>
            <li>LinkedIn: linkedin.com/company/concillio</li>
          </ul>
        </div>
      </section>
    </main>
  )
})
app.get('/council/consensus', async (c) => {
  // per-page head
  const langH = getLang(c)
  const LH = t(langH)
  c.set('head', {
    title: langH === 'sv' ? 'Concillio – Rådets konsensus' : 'Concillio – Council Consensus',
    description: LH.consensus_hero_subcopy
  })
  const lang = getLang(c)
  const L = t(lang)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${lang}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.consensus}</div>
          </div>
        </a>
        <div class="flex items-center gap-3">
          <SecondaryCTA href={`/council?lang=${lang}`} label={`← ${L.council_page_title}`} />
          <div class="sr-only" aria-hidden="true">{t(getLang(c)).lang_switch_hint}</div>
        </div>
      </header>

      {/* Hero (role-style) */}
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-base font-semibold">{L.consensus}</div>
        <p class="mt-2 text-neutral-300 max-w-2xl">{L.consensus_hero_subcopy}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <PrimaryCTA dataCta="start-session" href={`/council/ask?lang=${lang}`} label={L.run_session} />
          <SecondaryCTA dataCta="start-session" href={`/waitlist?lang=${lang}`} label={L.cta_access} />
        </div>
      </section>

      {/* What you'll get + Example */}
      <section class="mt-10 grid lg:grid-cols-2 gap-6">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.what_you_get_label}</div>
          <ul class="list-disc list-inside text-neutral-200 leading-7">
            {t(getLang(c)).consensus_get_items?.map((it: string) => <li>{it}</li>) || null}
          </ul>
        </div>
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.example_snippet_label}</div>
          <blockquote class="text-neutral-200 text-base bg-neutral-950/40 border border-neutral-800 rounded p-4">
            {t(getLang(c)).consensus_example_quote}
          </blockquote>
        </div>
      </section>

      {/* Method & scope */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.method_scope_label}</div>
        <ul class="list-disc list-inside text-neutral-300 leading-7">
          {t(getLang(c)).consensus_method_scope_items?.map((it: string) => <li>{it}</li>) || null}
        </ul>
      </section>

      {/* FAQ (reuse generic) */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.faq_label}</div>
        <div class="grid md:grid-cols-2 gap-4 text-neutral-200">
          <div>
            <div class="font-semibold">{L.faq_q1}</div>
            <div class="text-neutral-300">{L.faq_a1}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q2}</div>
            <div class="text-neutral-300">{L.faq_a2}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q3}</div>
            <div class="text-neutral-300">{L.faq_a3}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q4}</div>
            <div class="text-neutral-300">{L.faq_a4}</div>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name": L.faq_q1, "acceptedAnswer": {"@type":"Answer","text": L.faq_a1}},
            {"@type":"Question","name": L.faq_q2, "acceptedAnswer": {"@type":"Answer","text": L.faq_a2}},
            {"@type":"Question","name": L.faq_q3, "acceptedAnswer": {"@type":"Answer","text": L.faq_a3}},
            {"@type":"Question","name": L.faq_q4, "acceptedAnswer": {"@type":"Answer","text": L.faq_a4}}
          ]
        }) }} />
      </section>

      {/* CTA block */}
      <section class="mt-6 flex flex-wrap gap-3">
        <PrimaryCTA dataCta="start-session" href={`/council/ask?lang=${lang}`} label={L.cta_run_council_session} />
        <SecondaryCTA dataCta="start-session" href={`/waitlist?lang=${lang}`} label={L.cta_apply_invite} />
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'role_page_view', role: 'consensus', label: 'consensus', ts: Date.now() })); }catch(e){}
        try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'consensus_page_view', role: 'consensus', ts: Date.now() })); }catch(e){}
        document.querySelectorAll('[data-cta$="-start-session"]').forEach(function(el){
          el.addEventListener('click', function(){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'start_session_click', role: 'consensus', role_context: 'current', ts: Date.now() })); }catch(e){}
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'consensus_cta_click', role: 'consensus', role_context: 'current', ts: Date.now() })); }catch(e){}
          });
        });
        var rev = document.querySelector('a[data-analytics="reveal-deliberations"]');
        if (rev) {
          rev.addEventListener('click', function(){
            var mid = rev.getAttribute('data-minutes-id') || '';
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'consensus_view_minutes', role: 'consensus', minutes_id: mid, ts: Date.now() })); }catch(e){}
          });
        }
      ` }} />
    </main>
  )
})

// Council role detail page
app.get('/council/:slug', async (c, next) => {
  // per-page head
  const langH = getLang(c)
  const LH = t(langH)
  const s = (c.req.param('slug') || '').toLowerCase() as any
  if (s === 'ask') return next()
  const name = ['strategist','futurist','psychologist','advisor'].includes(s) ? roleLabel(slugToRoleName(s), langH as any) : ''
  c.set('head', {
    title: name ? `Concillio – ${name}` : (langH === 'sv' ? 'Concillio – Roll' : 'Concillio – Role'),
    description: name ? LH.role_desc[s] : undefined
  })
  const lang = getLang(c)
  const L = t(lang)
  const slug = (c.req.param('slug') || '').toLowerCase() as RoleSlug
  const ok = (['strategist','futurist','psychologist','advisor'] as RoleSlug[]).includes(slug)
  if (!ok) return c.notFound()
  const roleName = slugToRoleName(slug)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <a href={`/?lang=${lang}`} class="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400 group-hover:text-neutral-300 transition">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{roleLabel(roleName, lang)}</div>
          </div>
        </a>
        <div class="flex items-center gap-3">
          <SecondaryCTA href={`/council?lang=${lang}`} label={`← ${L.council_page_title}`} />
          <div class="sr-only" aria-hidden="true">{t(getLang(c)).lang_switch_hint}</div>
        </div>
      </header>

      {/* Hero */}
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-base font-semibold">{roleLabel(roleName, lang)}</div>
        <p class="mt-2 text-neutral-300 max-w-2xl">{L.role_desc[slug]}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <PrimaryCTA dataCta="start-session" href={`/council/ask?lang=${lang}`} label={L.run_session} />
          <SecondaryCTA dataCta="start-session" href={`/waitlist?lang=${lang}`} label={L.cta_access} />
        </div>
      </section>

      {/* What you'll get */}
      <section class="mt-10 grid lg:grid-cols-2 gap-6">
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.what_you_get_label}</div>
          {(() => {
            if (slug === 'strategist') {
              return (
                <ul class="list-disc list-inside text-neutral-200 leading-7">
                  <li>{lang === 'sv' ? 'En långsiktig strategisk vy (2–3 år framåt)' : 'A long-term strategic view (2–3 years ahead)'}</li>
                  <li>{lang === 'sv' ? 'Tydlig avvägning (tillväxt vs. risk, möjlighet vs. kostnad)' : 'Clear trade-off analysis (growth vs. risk, opportunity vs. cost)'}</li>
                  <li>{lang === 'sv' ? 'Genomförbara rekommendationer kopplade till milstolpar' : 'Actionable recommendations tied to milestones'}</li>
                </ul>
              )
            }
            if (slug === 'futurist') {
              return (
                <ul class="list-disc list-inside text-neutral-200 leading-7">
                  <li>{lang === 'sv' ? 'Tre plausibla scenarier med sannolikheter och tidiga varningsindikatorer' : 'Three plausible scenarios with probabilities and early warning indicators'}</li>
                  <li>{lang === 'sv' ? 'No‑regret‑åtgärder du kan göra nu' : 'No-regret moves you can execute now'}</li>
                  <li>{lang === 'sv' ? 'Reala optioner för att bevara uppsida under osäkerhet' : 'Real options to preserve upside under uncertainty'}</li>
                </ul>
              )
            }
            if (slug === 'psychologist') {
              return (
                <ul class="list-disc list-inside text-neutral-200 leading-7">
                  <li>{lang === 'sv' ? 'Tydlig avläsning av kognitiva och organisatoriska biaser' : 'Clear readout of cognitive and organizational biases in play'}</li>
                  <li>{lang === 'sv' ? 'Beslutsprotokoll med checklista och premortem' : 'Decision protocol with checklist and premortem'}</li>
                  <li>{lang === 'sv' ? 'Skyddsräcken som linjerar identitet, risk och tempo' : 'Safeguards to align identity, risk, and tempo'}</li>
                </ul>
              )
            }
            if (slug === 'advisor') {
              return (
                <ul class="list-disc list-inside text-neutral-200 leading-7">
                  <li>{lang === 'sv' ? 'En koncis syntes av avvägningar och en primär rekommendation' : 'A crisp synthesis of trade-offs and a primary recommendation'}</li>
                  <li>{lang === 'sv' ? 'Villkor för att gå vidare samt explicita fallback‑vägar' : 'Conditions to proceed and explicit fallbacks'}</li>
                  <li>{lang === 'sv' ? 'KPI:er och cadens för att följa upp genomförande' : 'KPIs and cadence to monitor execution'}</li>
                </ul>
              )
            }
            return (
              <ul class="list-disc list-inside text-neutral-200 leading-7">
                {L.what_get_items.map((it: string) => <li>{it}</li>)}
              </ul>
            )
          })()}
        </div>
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.example_snippet_label}</div>
          {(() => {
            if (slug === 'strategist') {
              return (
                <blockquote class="text-neutral-200 text-base bg-neutral-950/40 border border-neutral-800 rounded p-4">
                  {lang === 'sv'
                    ? '“Expansion till Asien ligger i linje med långsiktig tillväxt men kräver kapitalomallokering. Rekommendation: kör pilot i Q1, villkorat av att säkra distributionspartner.”'
                    : '“Expansion into Asia aligns with long-term growth, but requires capital reallocation. Recommendation: proceed with pilot in Q1, contingent on securing distribution partner.”'}
                </blockquote>
              )
            }
            if (slug === 'futurist') {
              return (
                <blockquote class="text-neutral-200 text-base bg-neutral-950/40 border border-neutral-800 rounded p-4">
                  {lang === 'sv'
                    ? '“Basscenario 55% med stabil efterfrågan; uppsida 25% beroende av regulatorisk klarhet; nedsida 20% drivet av finansiering. No‑regret: förstärk datainflödet; Real option: stegvis marknadsinträde med partnerklausuler.”'
                    : '“Base case at 55% with stable demand; upside at 25% contingent on regulatory clarity; downside at 20% driven by funding constraints. No-regret: fortify data pipeline; Real option: staged market entry with partner clauses.”'}
                </blockquote>
              )
            }
            if (slug === 'psychologist') {
              return (
                <blockquote class="text-neutral-200 text-base bg-neutral-950/40 border border-neutral-800 rounded p-4">
                  {lang === 'sv'
                    ? '“Teamet uppvisar loss aversion och status quo‑bias kring nuvarande produktlinje. Inför premortem‑workshop och definiera 3 objektiva kill‑kriterier för att motverka escalation of commitment.”'
                    : '“Team exhibits loss aversion and status-quo bias around current product line. Introduce premortem workshop and define 3 objective kill‑criteria to counter escalation of commitment.”'}
                </blockquote>
              )
            }
            if (slug === 'advisor') {
              return (
                <blockquote class="text-neutral-200 text-base bg-neutral-950/40 border border-neutral-800 rounded p-4">
                  {lang === 'sv'
                    ? '“Gå vidare med Alternativ B under villkor 1–3; om CAC/LTV > 0,35 vecka 6, pivotera till Alternativ A. Veckovis uppföljning av ledande indikatorer; styrelse‑avstämning dag 45.”'
                    : '“Proceed with Option B under Conditions 1–3; if CAC-to-LTV > 0.35 by week 6, pivot to Option A. Weekly cadence on leading indicators; board check‑in at day 45.”'}
                </blockquote>
              )
            }
            return (
              <pre class="text-neutral-300 text-sm whitespace-pre-wrap bg-neutral-950/40 border border-neutral-800 rounded p-3">
{`{
  "role": "${roleLabel(roleName, lang)}",
  "options": ["A","B","C"],
  "tradeoffs": ["A: upside/risk", "B: upside/risk"],
  "recommendation": "Option A",
  "first_90_days": ["M1", "M2"]
}`}
              </pre>
            )
          })()}
        </div>
      </section>

      {/* Method & scope */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.method_scope_label}</div>
        {(() => {
          if (slug === 'strategist') {
            return (
              <ul class="list-disc list-inside text-neutral-300 leading-7">
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Fokus:' : 'Focus:'}</span> {lang === 'sv' ? 'Långsiktig positionering och konkurrensfördel' : 'Long-term positioning and competitive advantage'}</li>
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Metod:' : 'Method:'}</span> {lang === 'sv' ? 'Scenariomappning, milstolpetriggers, strategiska avvägningar' : 'Scenario mapping, milestone triggers, strategic trade-offs'}</li>
                <li><span class="text-neutral-200 font-medium">Scope:</span> {lang === 'sv' ? 'Tillväxtstrategi, kapitalallokering, organisationsskalning' : 'Growth strategy, capital allocation, organizational scaling'}</li>
              </ul>
            )
          }
          if (slug === 'futurist') {
            return (
              <ul class="list-disc list-inside text-neutral-300 leading-7">
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Fokus:' : 'Focus:'}</span> {lang === 'sv' ? 'Osäkerhet, optionalitet och signalupptäckt' : 'Uncertainty, optionality, and signal detection'}</li>
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Metod:' : 'Method:'}</span> {lang === 'sv' ? 'Scenarioplanering, indikatorer, optionsvärdering' : 'Scenario planning, indicators, option valuation'}</li>
                <li><span class="text-neutral-200 font-medium">Scope:</span> {lang === 'sv' ? 'Marknadsbanor, teknikskiften, regulatoriska vektorer' : 'Market trajectories, tech inflections, regulatory vectors'}</li>
              </ul>
            )
          }
          if (slug === 'psychologist') {
            return (
              <ul class="list-disc list-inside text-neutral-300 leading-7">
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Fokus:' : 'Focus:'}</span> {lang === 'sv' ? 'Mänskliga faktorer som påverkar beslutskvalitet' : 'Human factors that amplify or degrade decision quality'}</li>
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Metod:' : 'Method:'}</span> {lang === 'sv' ? 'Bias‑audit, premortem/postmortem, beslutschecklistor' : 'Bias audits, premortem/postmortem, decision checklists'}</li>
                <li><span class="text-neutral-200 font-medium">Scope:</span> {lang === 'sv' ? 'Teamdynamik, incitament, kommunikations‑cadens' : 'Team dynamics, incentives, communication cadence'}</li>
              </ul>
            )
          }
          if (slug === 'advisor') {
            return (
              <ul class="list-disc list-inside text-neutral-300 leading-7">
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Fokus:' : 'Focus:'}</span> {lang === 'sv' ? 'Beslut och ansvarstagande' : 'Decision and accountability'}</li>
                <li><span class="text-neutral-200 font-medium">{lang === 'sv' ? 'Metod:' : 'Method:'}</span> {lang === 'sv' ? 'Syntes, avvägningar, besluts‑memo' : 'Synthesis, trade-off articulation, decision memo'}</li>
                <li><span class="text-neutral-200 font-medium">Scope:</span> {lang === 'sv' ? 'Genomförandevägar, villkor, KPI:er, styrelsens uttalande' : 'Execution paths, conditions, KPIs, board statement'}</li>
              </ul>
            )
          }
          return (<p class="text-neutral-300 leading-7">{L.method_scope_paragraph}</p>)
        })()}
      </section>

      {/* FAQ with schema.org/FAQPage */}
      <section class="mt-6 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
        <div class="text-[var(--concillio-gold)] uppercase tracking-wider text-xs mb-2">{L.faq_label}</div>
        <div class="grid md:grid-cols-2 gap-4 text-neutral-200">
          <div>
            <div class="font-semibold">{L.faq_q1}</div>
            <div class="text-neutral-300">{L.faq_a1}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q2}</div>
            <div class="text-neutral-300">{L.faq_a2}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q3}</div>
            <div class="text-neutral-300">{L.faq_a3}</div>
          </div>
          <div>
            <div class="font-semibold">{L.faq_q4}</div>
            <div class="text-neutral-300">{L.faq_a4}</div>
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name": L.faq_q1, "acceptedAnswer": {"@type":"Answer","text": L.faq_a1}},
            {"@type":"Question","name": L.faq_q2, "acceptedAnswer": {"@type":"Answer","text": L.faq_a2}},
            {"@type":"Question","name": L.faq_q3, "acceptedAnswer": {"@type":"Answer","text": L.faq_a3}},
            {"@type":"Question","name": L.faq_q4, "acceptedAnswer": {"@type":"Answer","text": L.faq_a4}}
          ]
        }) }} />
      </section>

      {/* CTA block */}
      <section class="mt-6 flex flex-wrap gap-3">
        <PrimaryCTA href={`/?lang=${lang}#ask`} label={L.cta_run_council_session} />
        <SecondaryCTA href={`/?lang=${lang}#ask`} label={L.cta_apply_invite} />
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'role_page_view', role: '${slug}', label: '${slug}', ts: Date.now() })); }catch(e){}
        document.querySelectorAll('[data-cta$="-start-session"]').forEach(function(el){
          el.addEventListener('click', function(){
            try{ navigator.sendBeacon('/api/analytics/council', JSON.stringify({ event: 'start_session_click', role: '${slug}', role_context: 'current', ts: Date.now() })); }catch(e){}
          });
        });
      ` }} />
    </main>
  )
})

// Analytics endpoint for council interactions
app.post('/api/analytics/council', async (c) => {
  try {
    const { DB } = c.env
    const body = await c.req.json<any>().catch(() => ({}))

    // Common request context
    const ua = c.req.header('User-Agent') || ''
    const referer = c.req.header('Referer') || ''
    const url = new URL(c.req.url)
    const path = url.pathname
    const lang = url.searchParams.get('lang') || (getCookie(c, 'lang') || 'sv')

    // Branch A: CTA analytics from global [data-cta] listener
    if (typeof body.cta === 'string') {
      const cta = body.cta.toString().trim().slice(0, 120)
      const source = (body.source || '').toString().slice(0, 120) || null
      const href = (body.href || '').toString().slice(0, 200) || null
      const tsClient = Number(body.ts) || Date.now()

      // Optional normalization/denylist (kept permissive)
      // if (!/^primary-|secondary-/.test(cta)) return c.json({ ok: false })

      // Anonymous session id cookie
      let sid = getCookie(c, 'sid') || ''
      if (!sid) {
        try { sid = (crypto as any).randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2) }
        catch { sid = String(Date.now()) + '-' + Math.random().toString(36).slice(2) }
        setCookie(c, 'sid', sid, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'Lax' })
      }

      // IP hash (sha256 of ip + salt)
      async function sha256Hex(s: string) {
        const enc = new TextEncoder().encode(s)
        const buf = await crypto.subtle.digest('SHA-256', enc)
        const arr = Array.from(new Uint8Array(buf))
        return arr.map(b => b.toString(16).padStart(2, '0')).join('')
      }
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('cf-connecting-ip') || (c.req.header('x-forwarded-for') || '').split(',')[0].trim() || ''
      const salt = (c.env as any).AUDIT_HMAC_KEY || ''
      const ipHash = ip ? await sha256Hex(ip + salt) : null

      // Ensure table + indexes exist
      await DB.prepare(`CREATE TABLE IF NOT EXISTS analytics_cta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cta TEXT NOT NULL,
        source TEXT,
        href TEXT,
        lang TEXT,
        path TEXT,
        session_id TEXT,
        ua TEXT,
        referer TEXT,
        ip_hash TEXT,
        ts_client INTEGER,
        ts_server TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now'))
      )`).run()
      await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_created_at ON analytics_cta(created_at)`).run()
      await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_cta ON analytics_cta(cta)`).run()
      await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_source ON analytics_cta(source)`).run()

      await DB.prepare(`INSERT INTO analytics_cta (cta, source, href, lang, path, session_id, ua, referer, ip_hash, ts_client)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(cta, source, href, lang, path, sid, ua, referer, ipHash, Math.floor(tsClient))
        .run()

      return c.json({ ok: true, kind: 'cta' })
    }

    // Branch B: existing council role/menu analytics (whitelisted)
    const role = String(body.role || '')
    const event = String(body.event || '')
    const ts = new Date(body.ts ? Number(body.ts) : Date.now()).toISOString()
    if (!['strategist','futurist','psychologist','advisor','consensus','menu'].includes(role) || !['hover','click','view','role_page_view','council_card_hover','council_card_click','start_session_click','consensus_page_view','consensus_cta_click','consensus_view_minutes','menu_open','menu_close','menu_link_click'].includes(event)) return c.json({ ok: false }, 400)
    await DB.prepare(`CREATE TABLE IF NOT EXISTS analytics_council (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      event TEXT NOT NULL,
      ts TEXT NOT NULL,
      ua TEXT,
      referer TEXT
    )`).run()
    await DB.prepare(`INSERT INTO analytics_council (role, event, ts, ua, referer) VALUES (?, ?, ?, ?, ?)`)
      .bind(role, event, ts, ua, referer)
      .run()
    return c.json({ ok: true, kind: 'council' })
  } catch {
    return c.json({ ok: true }) // best-effort, never block UX
  }
})

app.get('/api/minutes/:id/pdf', async (c) => {
  const { DB, BROWSERLESS_TOKEN } = c.env
  const id = Number(c.req.param('id'))
  const row = await DB.prepare('SELECT * FROM minutes WHERE id = ?').bind(id).first<any>()
  if (!row) return c.notFound()

  const roles = JSON.parse(row.roles_json)
  const consensus = JSON.parse(row.consensus_json)

  const lang = getLang(c)
  const L = t(lang)
  const html = `<!doctype html>
  <html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <title>Concillio – ${L.minutes_title} #${id}</title>
    <style>
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .page { page-break-after: always; }
      }
      body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; color: #111; }
      h1, h2 { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
      .seal { color: #b3a079; }
      .watermark { position: fixed; inset: 0; opacity: 0.06; background-image: url('/static/watermark.svg'); background-size: 800px; background-repeat: no-repeat; background-position: right -80px top -40px; }
      .box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-top: 10px; break-inside: avoid; page-break-inside: avoid; -webkit-column-break-inside: avoid; }
      h2 { page-break-after: avoid; break-after: avoid-page; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div class="watermark"></div>
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="display:flex;gap:10px;align-items:center;">
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#111" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#fff" stroke="var(--concillio-gold)"/></svg>
        <div>
          <div style="letter-spacing:0.3em;text-transform:uppercase;font-size:10px;color:#666">Concillio</div>
          <div style="font-family:'Playfair Display',serif;font-size:18px;">${L.minutes_title}</div>
        </div>
      </div>
      <div class="seal" style="font-weight:600;">${L.seal_text}</div>
    </header>
    <h1>${L.case_title}</h1>
    <p>${row.question}</p>
    ${row.context ? `<p style="white-space:pre-wrap;color:#444">${row.context}</p>` : ''}

    <h2>${L.council_voices}</h2>
    ${roles.map((r: any) => `
      <div class="box">
        <div style="color:#b3a079;letter-spacing:0.12em;text-transform:uppercase;font-size:12px">${roleLabel(r.role, lang)}</div>
        <div style="white-space:pre-wrap;margin-top:6px;">${r.analysis}</div>
        ${r.recommendations ? `<ul style="margin-top:8px">${(Array.isArray(r.recommendations) ? r.recommendations : [String(r.recommendations)]).map((it: string) => `<li>${it}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')}

    <h2>${L.consensus}</h2>
    <div class="box">
      <div style="white-space:pre-wrap;">${consensus.summary ?? ''}</div>
      ${consensus.risks ? `<div style="margin-top:8px"><div style="color:#666;font-size:12px">${L.risks_label}</div><ul>${(Array.isArray(consensus.risks) ? consensus.risks : [String(consensus.risks)]).map((it: string) => `<li>${it}</li>`).join('')}</ul></div>` : ''}
      ${consensus.unanimous_recommendation ? `<div style="margin-top:10px;color:#b3a079;font-weight:600">${L.unanimous_recommendation_label} ${String(consensus.unanimous_recommendation)}</div>` : ''}
    </div>
  </body>
  </html>`

  if (BROWSERLESS_TOKEN) {
    try {
      const resp = await fetch(`https://chrome.browserless.io/pdf?token=${BROWSERLESS_TOKEN}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, options: { printBackground: true, preferCSSPageSize: true } })
      })
      if (resp.ok) {
        const pdf = await resp.arrayBuffer()
        return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=concillio-minutes-${id}.pdf` } })
      }
    } catch (e) {
      // fall through to HTML
    }
  }

  // Fallback: print-friendly HTML
  return c.html(html)
})

// Simple health route
app.get('/api/hello', (c) => c.json({ message: 'Hello from Concillio' }))

// Mobile-friendly demo endpoint: GET /demo?mock=1&q=...&ctx=...
// Creates mock minutes and redirects to /minutes/:id (no OpenAI needed)
app.get('/demo', async (c) => {
  const { DB, OPENAI_API_KEY } = c.env
  const isMock = c.req.query('mock') === '1' || !OPENAI_API_KEY
  if (!isMock) return c.text('Disabled. Add ?mock=1 or set OPENAI key missing in dev.', 403)

  const lang = getLang(c)
  const locale = lang === 'en' ? 'en-US' : 'sv-SE'
  const pinned = c.req.header('X-Prompts-Version') || getCookie(c, 'concillio_version') || undefined
  const pack = await loadPromptPack(c.env as any, 'concillio-core', locale, pinned)
  const packHash = await computePackHash(pack)

  const question = c.req.query('q') || 'Demo: Ska jag tacka ja till jobberbjudandet?'
  const context = c.req.query('ctx') || ''

  const roleResults = [
    { role: 'Chief Strategist', analysis: `Strategisk analys för: ${question}`, recommendations: ['Fas 1: utvärdera', 'Fas 2: genomför'] },
    { role: 'Futurist', analysis: `Scenarier för: ${question}`, recommendations: ['No-regret: X', 'Real option: Y'] },
    { role: 'Behavioral Psychologist', analysis: 'Mänskliga faktorer identifierade', recommendations: ['Minska loss aversion', 'Beslutsprotokoll A'] },
    { role: 'Senior Advisor', analysis: 'Syntes av rådets röster', recommendations: ['Primär väg: ...', 'Fallback: ...'] }
  ]
  const consensus = {
    summary: `Sammanvägd bedömning kring: ${question}`,
    risks: ['Exekveringsrisk', 'Resursrisk'],
    unanimous_recommendation: 'Gå vidare med stegvis införande'
  }

  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS minutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      context TEXT,
      roles_json TEXT NOT NULL,
      consensus_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run()
  const insert = await DB.prepare(`
    INSERT INTO minutes (question, context, roles_json, consensus_json)
    VALUES (?, ?, ?, ?)
  `).bind(question, context || null, JSON.stringify(roleResults), JSON.stringify(consensus)).run()

  const id = insert.meta.last_row_id
  c.header('X-Prompt-Pack', `${pack.pack.slug}@${pack.locale}`)
  c.header('X-Prompt-Version', pack.version)
  c.header('X-Prompt-Hash', packHash)
  c.header('X-Model', 'mock')
  setCookie(c, 'concillio_version', pack.version, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax' })
  setCookie(c, 'last_minutes_id', String(id), { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'Lax' })
  return c.redirect(`/minutes/${id}`, 302)
})

// Product hub: /council/ask
app.get('/council/ask', (c) => {
  const lang = getLang(c)
  const L = t(lang)
  c.set('head', {
    title: lang === 'sv' ? 'Concillio – Ställ din fråga' : 'Concillio – Ask the Council',
    description: L.head_home_desc
  })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-16">{hamburgerUI(getLang(c))}
      <header class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#0f1216" stroke="var(--concillio-gold)" stroke-width="2"/><path d="M32 14 L42 32 L32 50 L22 32 Z" fill="var(--concillio-gold)" opacity="0.9"/><circle cx="32" cy="32" r="6" fill="#0b0d10" stroke="var(--concillio-gold)"/></svg>
          <div>
            <div class="uppercase tracking-[0.3em] text-xs text-neutral-400">Concillio</div>
            <div class="font-['Playfair_Display'] text-lg text-neutral-100">{L.council_page_title}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <SecondaryCTA href={`/council?lang=${lang}`} label={`← ${L.council_page_title}`} />
          <div class="sr-only" aria-hidden="true">{t(getLang(c)).lang_switch_hint}</div>
        </div>
      </header>

      <section class="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
        <div class="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/static/watermark.svg')", backgroundSize: '600px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right -60px top -40px' }}></div>
        <h1 class="font-['Playfair_Display'] text-2xl text-neutral-100">{L.ask}</h1>
        <form id="ask-form" class="grid gap-4 max-w-2xl mt-4">
          <input name="question" class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder={L.placeholder_question} />
          <textarea name="context" rows={4} class="bg-neutral-900 border border-neutral-700 rounded p-3 text-neutral-100" placeholder={L.placeholder_context}></textarea>
          <button id="ask-submit" class="justify-self-start inline-flex items-center px-5 py-2 rounded-md bg-[var(--gold)] text-white font-medium shadow hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 min-h-[48px]" type="submit">{L.submit}</button>
        </form>

        <div class="mt-6 text-neutral-400 text-sm">{L.waitlist_line}</div>
      </section>

      <div id="council-working" class="fixed inset-0 hidden items-center justify-center bg-black/60 z-50">
        <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div class="flex items-start gap-4">
            <svg class="animate-spin mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-20" cx="12" cy="12" r="10" stroke="var(--concillio-gold)" stroke-width="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="var(--concillio-gold)" stroke-width="3"/></svg>
            <div>
              <div class="text-neutral-100 font-semibold">{L.working_title}</div>
              <div id="council-working-step" class="text-neutral-400 text-sm mt-1">{L.working_preparing}</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-neutral-800 rounded h-2">
              <div id="council-progress-bar" class="h-2 rounded bg-[var(--concillio-gold)] transition-all" style="width: 6%;"></div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        const form = document.getElementById('ask-form');
        const submitBtn = document.getElementById('ask-submit');
        const overlay = document.getElementById('council-working');
        const stepEl = document.getElementById('council-working-step');
        const barEl = document.getElementById('council-progress-bar');

        const urlLang = new URLSearchParams(location.search).get('lang');
        const cookieLang = (document.cookie.match(/(?:^|; )lang=([^;]+)/)?.[1] || '').toLowerCase();
        const lang = (urlLang || cookieLang || document.documentElement.lang || 'sv').toLowerCase();
        const isEn = lang === 'en';
        const stepsEn = ${JSON.stringify(t('en' as any).working_steps)};
        const stepsSv = ${JSON.stringify(t('sv' as any).working_steps)};
        const steps = isEn ? stepsEn : stepsSv;
        const fallbackUnknown = isEn ? ${JSON.stringify(t('en' as any).error_unknown)} : ${JSON.stringify(t('sv' as any).error_unknown)};
        const genericPrefix = isEn ? ${JSON.stringify(t('en' as any).error_generic_prefix)} : ${JSON.stringify(t('sv' as any).error_generic_prefix)};
        const techPrefix = isEn ? ${JSON.stringify(t('en' as any).error_tech_prefix)} : ${JSON.stringify(t('sv' as any).error_tech_prefix)};

        let stepIdx = 0; let timerId = null;
        function showWorking() {
          overlay.classList.remove('hidden');
          overlay.classList.add('flex');
          stepIdx = 0;
          updateStep();
          timerId = setInterval(() => {
            if (stepIdx < steps.length - 1) { stepIdx++; updateStep(); }
          }, 1500);
        }
        function hideWorking() {
          if (timerId) clearInterval(timerId);
          overlay.classList.add('hidden');
          overlay.classList.remove('flex');
        }
        function updateStep() {
          stepEl.textContent = steps[stepIdx];
          const pct = Math.max(6, Math.min(96, Math.round(((stepIdx+1)/steps.length)*100)));
          barEl.style.width = pct + '%';
        }

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-60','cursor-not-allowed');
          showWorking();
          try {
            const fd = new FormData(form);
            const payload = { question: fd.get('question'), context: fd.get('context') };
            let res = await fetch('/api/council/consult', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': (function(){try{const v=(crypto.randomUUID&&crypto.randomUUID())||String(Date.now());return /^[A-Za-z0-9._-]{1,200}$/.test(v)?v:String(Date.now());}catch(e){return String(Date.now())}})() }, body: JSON.stringify(payload) });
            let text;
            try { text = await res.text(); } catch(e) {
              const res2 = await fetch('/api/council/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              text = await res2.text();
              res = res2;
            }
            let data = null;
            try { data = JSON.parse(text); } catch {}
            if (res.ok && data?.id) {
              location.href = '/minutes/' + data.id;
              return;
            }
            const msg = data?.error || text || fallbackUnknown;
            alert(genericPrefix + ' ' + msg);
          } catch (err) {
            alert(techPrefix + ' ' + (err?.message || err));
          } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-60','cursor-not-allowed');
            hideWorking();
          }
        });
      ` }} />
    </main>
  )
})

// Forms API endpoints: waitlist and contact
app.post('/api/waitlist', async (c) => {
  try {
    const { DB } = c.env
    let name = ''
    let email = ''
    let linkedin = ''
    let source = ''
    const ct = (c.req.header('Content-Type') || '').toLowerCase()
    if (ct.includes('application/json')) {
      const b = await c.req.json<any>().catch(() => null)
      name = (b?.name || '').toString().trim()
      email = (b?.email || '').toString().trim()
      linkedin = (b?.linkedin || '').toString().trim()
      source = (b?.source || '').toString().trim()
    } else if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const fd = await c.req.formData().catch(() => null)
      if (fd) {
        name = String(fd.get('name') || '').trim()
        email = String(fd.get('email') || '').trim()
        linkedin = String(fd.get('linkedin') || '').trim()
        source = String(fd.get('source') || '').trim()
      }
    }

    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return c.json({ ok: false, error: 'Invalid name or email' }, 400)
    }

    await DB.prepare(`CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      linkedin TEXT,
      source TEXT,
      ua TEXT,
      referer TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run()

    await DB.prepare(`INSERT INTO waitlist (name, email, linkedin, source, ua, referer) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(name, email, linkedin || null, source || null, c.req.header('User-Agent') || '', c.req.header('Referer') || '')
      .run()

    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

app.post('/api/contact', async (c) => {
  try {
    const { DB } = c.env
    let name = ''
    let email = ''
    let message = ''
    let source = ''
    const ct = (c.req.header('Content-Type') || '').toLowerCase()
    if (ct.includes('application/json')) {
      const b = await c.req.json<any>().catch(() => null)
      name = (b?.name || '').toString().trim()
      email = (b?.email || '').toString().trim()
      message = (b?.message || b?.msg || '').toString().trim()
      source = (b?.source || '').toString().trim()
    } else if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const fd = await c.req.formData().catch(() => null)
      if (fd) {
        name = String(fd.get('name') || '').trim()
        email = String(fd.get('email') || '').trim()
        message = String(fd.get('message') || fd.get('msg') || '').trim()
        source = String(fd.get('source') || '').trim()
      }
    }

    if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return c.json({ ok: false, error: 'Invalid input' }, 400)
    }

    await DB.prepare(`CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT,
      ua TEXT,
      referer TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run()

    await DB.prepare(`INSERT INTO contact_messages (name, email, message, source, ua, referer) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(name, email, message, source || null, c.req.header('User-Agent') || '', c.req.header('Referer') || '')
      .run()

    return c.json({ ok: true })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

// Legacy alias removed: respond with 410 Gone to encourage migration
app.post('/api/analytics/cta', async (c) => {
  return c.json({ ok: false, error: 'Moved. Use /api/analytics/council', endpoint: '/api/analytics/council' }, 410)
})

// Admin cleanup route for analytics retention
app.post('/api/admin/analytics/cleanup', async (c) => {
  try {
    const auth = c.req.header('Authorization') || ''
    const expected = (c.env as any).ADMIN_KEY || (c.env as any).ANALYTICS_CLEANUP_KEY || ''
    if (!expected || auth !== `Bearer ${expected}`) {
      return c.json({ ok: false, error: 'unauthorized' }, 401)
    }

    const daysStr = c.req.query('days') || (c.env as any).ANALYTICS_RETENTION_DAYS || '180'
    let days = parseInt(String(daysStr), 10)
    if (!Number.isFinite(days) || days <= 0) days = 180
    if (days > 3650) days = 3650

    // Best-effort cleanup; ignore errors if table does not exist
    let deleted = 0
    try {
      const res: any = await c.env.DB.prepare(
        `DELETE FROM analytics_cta WHERE created_at < datetime('now', ?)`
      ).bind(`-${days} days`).run()
      deleted = (res?.meta?.changes as number) || 0
    } catch {}

    return c.json({ ok: true, days, deleted })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

// Optional Admin Endpoints (read-only JSON)
// Auth: Authorization: Bearer ADMIN_KEY
app.get('/api/admin/analytics/cta/top', async (c) => {
  try {
    const auth = c.req.header('Authorization') || ''
    const expected = (c.env as any).ADMIN_KEY || ''
    if (!expected || auth !== `Bearer ${expected}`) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const days = Math.max(1, Math.min(3650, parseInt(String(c.req.query('days') || '7'), 10) || 7))
    let limit = parseInt(String(c.req.query('limit') || '25'), 10)
    if (!Number.isFinite(limit) || limit <= 0) limit = 25
    if (limit > 1000) limit = 1000

    // Optional filters
    const lang = (c.req.query('lang') || '').toLowerCase().trim()
    const sourceExact = (c.req.query('source') || '').trim()
    const sourcePrefix = (c.req.query('source_prefix') || '').trim()
    const ctaExact = (c.req.query('cta') || '').trim()
    const ctaPrefix = (c.req.query('cta_prefix') || '').trim()
    const ctaSuffix = (c.req.query('cta_suffix') || '').trim()

    // Indexes
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_ts_server ON analytics_cta(ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_lang_ts ON analytics_cta(lang, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_source_ts ON analytics_cta(source, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_cta_ts ON analytics_cta(cta, ts_server)`).run() } catch {}

    const conds: string[] = ["ts_server > datetime('now', ?)"]
    const params: any[] = [`-${days} days`]
    if (lang) { conds.push('lang = ?'); params.push(lang) }
    if (sourcePrefix) { conds.push('source LIKE ?'); params.push(sourcePrefix + '%') }
    else if (sourceExact) { conds.push('source = ?'); params.push(sourceExact) }
    if (ctaPrefix) { conds.push('cta LIKE ?'); params.push(ctaPrefix + '%') }
    else if (ctaSuffix) { conds.push('cta LIKE ?'); params.push('%' + ctaSuffix) }
    else if (ctaExact) { conds.push('cta = ?'); params.push(ctaExact) }

    const where = conds.join(' AND ')
    const sql = `SELECT cta, COUNT(*) AS clicks FROM analytics_cta WHERE ${where} GROUP BY cta ORDER BY clicks DESC, cta LIMIT ${limit}`
    const rows: any = await c.env.DB.prepare(sql).bind(...params).all()
    return c.json({ ok: true, days, limit, items: rows.results || [] })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

app.get('/api/admin/analytics/cta/source', async (c) => {
  try {
    const auth = c.req.header('Authorization') || ''
    const expected = (c.env as any).ADMIN_KEY || ''
    if (!expected || auth !== `Bearer ${expected}`) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const days = Math.max(1, Math.min(3650, parseInt(String(c.req.query('days') || '30'), 10) || 30))

    // Optional filters
    const lang = (c.req.query('lang') || '').toLowerCase().trim()
    const sourceExact = (c.req.query('source') || '').trim()
    const sourcePrefix = (c.req.query('source_prefix') || '').trim()
    const ctaExact = (c.req.query('cta') || '').trim()
    const ctaPrefix = (c.req.query('cta_prefix') || '').trim()
    const ctaSuffix = (c.req.query('cta_suffix') || '').trim()

    // Indexes
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_ts_server ON analytics_cta(ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_lang_ts ON analytics_cta(lang, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_source_ts ON analytics_cta(source, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_cta_ts ON analytics_cta(cta, ts_server)`).run() } catch {}

    const conds: string[] = ["ts_server > datetime('now', ?)"]
    const params: any[] = [`-${days} days`]
    if (lang) { conds.push('lang = ?'); params.push(lang) }
    if (sourcePrefix) { conds.push('source LIKE ?'); params.push(sourcePrefix + '%') }
    else if (sourceExact) { conds.push('source = ?'); params.push(sourceExact) }
    if (ctaPrefix) { conds.push('cta LIKE ?'); params.push(ctaPrefix + '%') }
    else if (ctaSuffix) { conds.push('cta LIKE ?'); params.push('%' + ctaSuffix) }
    else if (ctaExact) { conds.push('cta = ?'); params.push(ctaExact) }

    const where = conds.join(' AND ')
    const sql = `SELECT COALESCE(source,'(none)') AS source, COUNT(*) AS clicks FROM analytics_cta WHERE ${where} GROUP BY source ORDER BY clicks DESC`
    const rows: any = await c.env.DB.prepare(sql).bind(...params).all()
    return c.json({ ok: true, days, items: rows.results || [] })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

app.get('/api/admin/analytics/cta/href', async (c) => {
  try {
    const auth = c.req.header('Authorization') || ''
    const expected = (c.env as any).ADMIN_KEY || ''
    if (!expected || auth !== `Bearer ${expected}`) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const days = Math.max(1, Math.min(3650, parseInt(String(c.req.query('days') || '30'), 10) || 30))
    let limit = parseInt(String(c.req.query('limit') || '100'), 10)
    if (!Number.isFinite(limit) || limit <= 0) limit = 100
    if (limit > 1000) limit = 1000

    // Optional filters
    const lang = (c.req.query('lang') || '').toLowerCase().trim()
    const sourceExact = (c.req.query('source') || '').trim()
    const sourcePrefix = (c.req.query('source_prefix') || '').trim()
    const ctaExact = (c.req.query('cta') || '').trim()
    const ctaPrefix = (c.req.query('cta_prefix') || '').trim()
    const ctaSuffix = (c.req.query('cta_suffix') || '').trim()

    // Indexes
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_ts_server ON analytics_cta(ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_lang_ts ON analytics_cta(lang, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_source_ts ON analytics_cta(source, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_cta_ts ON analytics_cta(cta, ts_server)`).run() } catch {}

    const conds: string[] = ["ts_server > datetime('now', ?)"]
    const params: any[] = [`-${days} days`]
    if (lang) { conds.push('lang = ?'); params.push(lang) }
    if (sourcePrefix) { conds.push('source LIKE ?'); params.push(sourcePrefix + '%') }
    else if (sourceExact) { conds.push('source = ?'); params.push(sourceExact) }
    if (ctaPrefix) { conds.push('cta LIKE ?'); params.push(ctaPrefix + '%') }
    else if (ctaSuffix) { conds.push('cta LIKE ?'); params.push('%' + ctaSuffix) }
    else if (ctaExact) { conds.push('cta = ?'); params.push(ctaExact) }

    const where = conds.join(' AND ')
    const sql = `SELECT href, COUNT(*) AS clicks FROM analytics_cta WHERE ${where} GROUP BY href ORDER BY clicks DESC, href LIMIT ${limit}`
    const rows: any = await c.env.DB.prepare(sql).bind(...params).all()
    return c.json({ ok: true, days, limit, items: rows.results || [] })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

app.get('/api/admin/analytics/cta/daily', async (c) => {
  try {
    const auth = c.req.header('Authorization') || ''
    const expected = (c.env as any).ADMIN_KEY || ''
    if (!expected || auth !== `Bearer ${expected}`) return c.json({ ok: false, error: 'unauthorized' }, 401)
    const days = Math.max(1, Math.min(3650, parseInt(String(c.req.query('days') || '30'), 10) || 30))

    // Optional filters
    const lang = (c.req.query('lang') || '').toLowerCase().trim()
    const sourceExact = (c.req.query('source') || '').trim()
    const sourcePrefix = (c.req.query('source_prefix') || '').trim()
    const ctaExact = (c.req.query('cta') || '').trim()
    const ctaPrefix = (c.req.query('cta_prefix') || '').trim()
    const ctaSuffix = (c.req.query('cta_suffix') || '').trim()

    // Indexes
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_ts_server ON analytics_cta(ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_lang_ts ON analytics_cta(lang, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_source_ts ON analytics_cta(source, ts_server)`).run() } catch {}
    try { await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_cta_cta_ts ON analytics_cta(cta, ts_server)`).run() } catch {}

    const conds: string[] = ["ts_server >= date('now', ?)"]
    const params: any[] = [`-${days} days`]
    if (lang) { conds.push('lang = ?'); params.push(lang) }
    if (sourcePrefix) { conds.push('source LIKE ?'); params.push(sourcePrefix + '%') }
    else if (sourceExact) { conds.push('source = ?'); params.push(sourceExact) }
    if (ctaPrefix) { conds.push('cta LIKE ?'); params.push(ctaPrefix + '%') }
    else if (ctaSuffix) { conds.push('cta LIKE ?'); params.push('%' + ctaSuffix) }
    else if (ctaExact) { conds.push('cta = ?'); params.push(ctaExact) }

    const where = conds.join(' AND ')
    const sql = `SELECT date(ts_server) AS day, COUNT(*) AS clicks FROM analytics_cta WHERE ${where} GROUP BY day ORDER BY day ASC`
    const rows: any = await c.env.DB.prepare(sql).bind(...params).all()
    return c.json({ ok: true, days, items: rows.results || [] })
  } catch (e: any) {
    return c.json({ ok: false, error: String(e?.message || e) }, 500)
  }
})

export default app
