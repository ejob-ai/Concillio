import { Hono } from 'hono'
import { renderer } from '../renderer'

// Fresh, CSS/Tailwind-based landing page
// Does not depend on prior design assets. Keeps rest of app intact.
const newLanding = new Hono()
newLanding.use(renderer)

// Shared style tokens for this page only
const PAGE_STYLE = `
  html { scroll-behavior: smooth; }
  :root {
    --concillio-paper: #FAF9F2;
    --concillio-navy: #0f1b2d;
    --concillio-gold: #c89b3c;
  }
  body { background-color: var(--concillio-paper) !important; color: var(--concillio-navy) !important; }
  #ssr-auth-header { display: none !important; }
`

function GoldIconCircle(props: { children: JSX.Element; label?: string }) {
  return (
    <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--concillio-gold)] ring-2 ring-[var(--concillio-navy)] shadow-sm" aria-hidden="true">
      {props.children}
    </span>
  )
}

// Hero + Why landing page
newLanding.get('/new', (c) => {
  try { c.set('routeName', 'newLanding:new') } catch {}

  try {
    c.set('head', {
      title: 'Concillio – Where wisdom convenes.',
      description: 'Your personal council of minds. EXCLUSIVE. INVITATION ONLY.'
    })
  } catch {}

  return c.render(
    <main class="min-h-screen">
      <style>{PAGE_STYLE}</style>

      {/* HERO */}
      <section class="container mx-auto px-6 py-20 lg:py-28">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="font-['Playfair_Display'] text-[clamp(2.2rem,6vw,4rem)] leading-[1.1]">Where wisdom convenes.</h1>
          <p class="mt-3 text-[clamp(1rem,2.2vw,1.25rem)] opacity-90">Your personal council of minds.</p>
          <p class="mt-2 text-[clamp(.95rem,2vw,1.1rem)] text-[var(--concillio-gold)] italic">AI-powered council for better decisions.</p>

          <div class="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/login"
              class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--concillio-gold)] text-white border-2 border-[var(--concillio-navy)] shadow hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/60"
            >
              Enter Concillio
            </a>
            <a
              href="#why"
              class="inline-flex items-center justify-center px-5 py-3 rounded-xl border-2 border-[var(--concillio-navy)] text-[var(--concillio-navy)] bg-white/30 hover:bg-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--concillio-gold)]/50"
            >
              Want to know more?
            </a>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section id="why" class="container mx-auto px-6 py-16 lg:py-20">
        <h2 class="text-center font-['Playfair_Display'] text-[clamp(1.8rem,4.5vw,2.6rem)] mb-12">Why Concillio?</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Multiple perspectives */}
          <a href="/why/multiple-perspectives" class="group block text-center p-6 rounded-xl ring-1 ring-[color-mix(in_oklab,var(--concillio-navy)15%,white85%)] hover:ring-[var(--concillio-navy)] bg-white/40 hover:bg-white/60 transition">
            <div class="flex flex-col items-center gap-4">
              <GoldIconCircle>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 7a3 3 0 110 6 3 3 0 010-6Zm-6.5 9a3.5 3.5 0 017 0H5.5Zm9 0a3.5 3.5 0 017 0h-7Z" fill="#0f1b2d"/></svg>
              </GoldIconCircle>
              <h3 class="font-serif text-lg">Multiple perspectives</h3>
              <p class="text-sm opacity-80 italic max-w-[32ch]">Get advice from a council of minds – strategist, futurist, psychologist, advisor.</p>
            </div>
          </a>

          {/* Decisions in minutes */}
          <a href="/why/decisions-in-minutes" class="group block text-center p-6 rounded-xl ring-1 ring-[color-mix(in_oklab,var(--concillio-navy)15%,white85%)] hover:ring-[var(--concillio-navy)] bg-white/40 hover:bg-white/60 transition">
            <div class="flex flex-col items-center gap-4">
              <GoldIconCircle>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2 6h6l-4.9 3.6L17.8 18 12 14.5 6.2 18l2.7-6.4L4 8h6L12 2z" fill="#0f1b2d"/></svg>
              </GoldIconCircle>
              <h3 class="font-serif text-lg">Decisions in minutes</h3>
              <p class="text-sm opacity-80 italic max-w-[32ch]">Fast, reliable guidance at your fingertips — without sacrificing rigor.</p>
            </div>
          </a>

          {/* Beyond AI Assistants */}
          <a href="/why/beyond-ai-assistants" class="group block text-center p-6 rounded-xl ring-1 ring-[color-mix(in_oklab,var(--concillio-navy)15%,white85%)] hover:ring-[var(--concillio-navy)] bg-white/40 hover:bg-white/60 transition">
            <div class="flex flex-col items-center gap-4">
              <GoldIconCircle>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4h14v14H5z" stroke="#0f1b2d" stroke-width="2"/><path d="M8 8h8M8 12h5" stroke="#0f1b2d" stroke-width="2"/></svg>
              </GoldIconCircle>
              <h3 class="font-serif text-lg">Beyond AI Assistants</h3>
              <p class="text-sm opacity-80 italic max-w-[32ch]">Ceremonial "Council Minutes & Consensus" you can share with leadership or investors.</p>
            </div>
          </a>

          {/* Smarter, Safer Decisions */}
          <a href="/why/smarter-safer-decisions" class="group block text-center p-6 rounded-xl ring-1 ring-[color-mix(in_oklab,var(--concillio-navy)15%,white85%)] hover:ring-[var(--concillio-navy)] bg-white/40 hover:bg-white/60 transition">
            <div class="flex flex-col items-center gap-4">
              <GoldIconCircle>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" stroke="#0f1b2d" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="#0f1b2d" stroke-width="2"/></svg>
              </GoldIconCircle>
              <h3 class="font-serif text-lg">Smarter, Safer Decisions</h3>
              <p class="text-sm opacity-80 italic max-w-[32ch]">Reduce bias, groupthink, and missteps with balanced perspectives.</p>
            </div>
          </a>
        </div>
      </section>
    </main>
  )
})

// Simple SSR detail pages for each card (minimal content; can be expanded later)
function WhyPage(c: any, title: string, body: string) {
  try { c.set('head', { title: `${title} – Concillio`, description: body }) } catch {}
  return c.render(
    <main class="min-h-screen">
      <style>{PAGE_STYLE}</style>
      <section class="container mx-auto px-6 py-16 lg:py-20">
        <a href="/new#why" class="text-[var(--concillio-navy)] underline">← Back</a>
        <h1 class="mt-3 font-['Playfair_Display'] text-[clamp(1.6rem,4.5vw,2.4rem)]">{title}</h1>
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
