import { Hono } from 'hono'
import { renderer } from '../renderer'

// Fresh, CSS/Tailwind-based landing page
// Does not depend on prior design assets. Keeps rest of app intact.
const newLanding = new Hono()
newLanding.use(renderer)

// Shared style tokens for this page only
// PAGE_STYLE removed – using global light theme and Tailwind

function GoldIconCircle(props: { children: JSX.Element; label?: string }) {
  return (
    <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--concillio-gold)] ring-2 ring-[var(--navy)] shadow-sm" aria-hidden="true">
      {props.children}
    </span>
  )
}

// Hero + Why landing page
newLanding.get('/new', (c) => c.redirect('/#why', 301))

// Simple SSR detail pages for each card (minimal content; can be expanded later)
function WhyPage(c: any, title: string, body: string) {
  try { c.set('head', { title: `${title} – Concillio`, description: body }) } catch {}
  return c.render(
    <main class="min-h-screen nl-page bg-white text-slate-900">
      
      <section class="container mx-auto px-6 py-16 lg:py-20">
        <a href="/#why" class="text-[var(--navy)] underline">← Back</a>
        <h1 class="mt-3 font-['Crimson_Text'] text-[clamp(1.6rem,4.5vw,2.4rem)]">{title}</h1>
        <p class="mt-3 max-w-3xl text-lg opacity-90">{body}</p>
      </section>
    </main>
  )
}

newLanding.get('/why/multiple-perspectives', (c) =>
  WhyPage(c, 'Multiple perspectives', 'Concillio brings four complementary roles to your case: Strategist, Futurist, Behavioral Psychologist, and Senior Advisor — structured into a ceremonial synthesis.')
)
newLanding.get('/why/decisions-in-minutes', (c) =>
  WhyPage(c, 'Decisions in minutes', 'Fast but rigorous: you receive Council Minutes with clear recommendations, conditions, and KPIs, typically in minutes.')
)
newLanding.get('/why/beyond-ai-assistants', (c) =>
  WhyPage(c, 'Beyond AI Assistants', 'More than a chat reply: formal Council Minutes and a sealed Council Consensus designed for boardroom-grade communication.')
)
newLanding.get('/why/smarter-safer-decisions', (c) =>
  WhyPage(c, 'Smarter, Safer Decisions', 'Balanced perspectives help reduce bias and groupthink, making outcomes safer and more robust under uncertainty.')
)

export default newLanding
