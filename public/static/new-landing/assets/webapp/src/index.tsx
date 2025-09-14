import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { concillioRenderer } from './lib/design-system/enhanced-renderer'
import { secureHeaders } from 'hono/secure-headers'
import { 
  Container,
  ConcillioHero,
  ConcillioOrbit,
  ConcillioInviteForm,
  FeatureCard,
  Testimonial,
  ThemeToggle,
  Badge,
  Section
} from './components/concillio-ui'

const app = new Hono()

// Security headers for performance and security
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"]
  },
  crossOriginEmbedderPolicy: false // Allow external resources
}))

// Performance headers
app.use('*', async (c, next) => {
  await next()
  
  // Cache static assets
  if (c.req.path.startsWith('/static/')) {
    c.header('Cache-Control', 'public, max-age=86400') // 24 hours
  }
  
  // Performance hints for critical resources
  if (c.req.path === '/') {
    c.header('Link', '</static/style.css>; rel=preload; as=style')
    c.header('Link', '</static/app.js>; rel=preload; as=script', { append: true })
  }
})

app.use(concillioRenderer)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API route for invite form
app.post('/api/invite', async (c) => {
  const body = await c.req.json()
  
  // Here you would normally save to database or send to email service
  console.log('Invite request:', body)
  
  return c.json({ 
    success: true, 
    message: 'Thank you for your application. We will return with an invitation shortly.' 
  })
})

// Main homepage route using new design system components
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-[var(--bg-primary)]">
      {/* Premium SVG Sprite (place once per page, right after <body>) */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{position:'absolute', width:0, height:0, overflow:'hidden'}}>
        {/* Strategist (chess knight) */}
        <symbol id="ico-strategist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 20h10v-2H7v2Zm12-8.5c0-3.92-2.95-7.33-6.84-7.48A7 7 0 0 0 5 11v2h3.5l-1 2.5H17a4 4 0 0 0 2-3.5v-.5Zm-7.2-4.9c1.86.1 3.4 1.34 3.93 3.01.14.45-.23.89-.7.82-1.3-.18-2.26-.23-3.04.2-.6.33-1.15.93-1.21 1.87a.8.8 0 0 1-1.6-.12c.08-1.36.78-2.46 1.83-3.04.72-.39 1.57-.56 2.79-.53-.44-.66-1.12-1.12-2-1.21a.8.8 0 1 1 .1-1.6Z"/>
        </symbol>

        {/* Advisor (gavel) */}
        <symbol id="ico-advisor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 20h12v2H2v-2Zm5.5-15L5 7.5l6 6L11.5 11l-4-4Zm6 6L19.5 17 17 19.5l-6-6 2.5-2.5Z"/>
        </symbol>

        {/* Futurist (telescope/forward) */}
        <symbol id="ico-futurist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/>
        </symbol>

        {/* Psychologist (heart/insight) */}
        <symbol id="ico-psych" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.5-3.8-8.4-7.1C1 10.1 2.6 6 6.2 6c2 0 3.1 1 3.8 2 .7-1 1.8-2 3.8-2 3.6 0 5.2 4.1 2.6 7.9C18.5 17.2 12 21 12 21Z"/>
        </symbol>

        {/* Psychologist (alternative ID for consistency) */}
        <symbol id="ico-psychologist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.5-3.8-8.4-7.1C1 10.1 2.6 6 6.2 6c2 0 3.1 1 3.8 2 .7-1 1.8-2 3.8-2 3.6 0 5.2 4.1 2.6 7.9C18.5 17.2 12 21 12 21Z"/>
        </symbol>

        {/* Council emblem "C" (ornament/ring) */}
        <symbol id="ico-council-c" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 2a7 7 0 1 1 0 14A7 7 0 0 1 12 5Zm4.2 4.2a.9.9 0 0 1 0 1.3 5 5 0 1 0 0 7.1.9.9 0 0 1 1.3 1.3 6.8 6.8 0 1 1 0-9.7.9.9 0 0 1-1.3 0Z"/>
        </symbol>
      </svg>

      {/* Hero */}
      <section class="hero min-h-[100svh] grid place-items-center">
        <header class="fold__hero grid place-items-center text-center px-[clamp(8px,2vw,24px)]">
          <div>
            <h1 class="h1 font-serif text-[var(--text-primary)] text-[clamp(36px,6vw,86px)] leading-[1.06] whitespace-nowrap">
              Where wisdom convenes.
            </h1>
            <p class="sub mt-[0.6em] italic text-[clamp(1.05rem,1.4vw,1.55rem)] text-[var(--text-secondary)]">
              Your personal council of minds.
            </p>
            <p class="exclusive mt-2 tracking-[.12em] text-[clamp(.9rem,1vw,1rem)] text-[color:var(--gold)] uppercase">
              EXCLUSIVE. INVITATION ONLY.
            </p>
            <a href="/apply" class="cta btn-premium mt-[clamp(12px,2vh,20px)]">
              Request Access
            </a>
          </div>
        </header>
      </section>

      {/* WHY CONCILLIO – klickbara kort */}
      <section id="why" aria-labelledby="why-title" class="container mx-auto px-6 py-16 md:py-24">
        <h2 id="why-title" class="text-center font-serif text-[clamp(24px,4vw,40px)] text-[var(--text-primary)] mb-12">
          Why Concillio?
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {/* Multiple perspectives */}
          <a href="/multiple-perspectives" class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-xl p-6 hover:bg-[var(--bg-secondary)] transition-all duration-300">
            <div class="flex flex-col items-center text-center gap-5">
              <span class="c-icon c-icon--badge group-hover:scale-105 group-active:scale-95 transition-transform duration-200"></span>
              <h3 class="font-serif text-[clamp(18px,2vw,24px)] text-[var(--text-primary)]">
                Multiple perspectives
              </h3>
              <p class="max-w-[32ch] text-[var(--text-secondary)] italic text-sm">
                Get advice from a council of minds – strategist, futurist, psychologist, advisor.
              </p>
            </div>
          </a>

          {/* Decisions in minutes */}
          <a href="/decisions-in-minutes" class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-xl p-6 hover:bg-[var(--bg-secondary)] transition-all duration-300">
            <div class="flex flex-col items-center text-center gap-5">
              <span class="c-icon c-icon--badge c-icon--bolt group-hover:scale-105 group-active:scale-95 transition-transform duration-200"></span>
              <h3 class="font-serif text-[clamp(18px,2vw,24px)] text-[var(--text-primary)]">
                Decisions in minutes
              </h3>
              <p class="max-w-[32ch] text-[var(--text-secondary)] italic text-sm">
                Fast, reliable guidance at your fingertips — without sacrificing rigor.
              </p>
            </div>
          </a>

          {/* Beyond AI Assistants */}
          <a href="/beyond-ai-assistants" class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-xl p-6 hover:bg-[var(--bg-secondary)] transition-all duration-300">
            <div class="flex flex-col items-center text-center gap-5">
              <span class="c-icon c-icon--badge c-icon--document group-hover:scale-105 group-active:scale-95 transition-transform duration-200"></span>
              <h3 class="font-serif text-[clamp(18px,2vw,24px)] text-[var(--text-primary)]">
                Beyond AI Assistants
              </h3>
              <p class="max-w-[32ch] text-[var(--text-secondary)] italic text-sm">
                Ceremonial "Council Minutes & Consensus" you can share with leadership or investors.
              </p>
            </div>
          </a>

          {/* Smarter, Safer Decisions */}
          <a href="/smarter-safer-decisions" class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-xl p-6 hover:bg-[var(--bg-secondary)] transition-all duration-300">
            <div class="flex flex-col items-center text-center gap-5">
              <span class="c-icon c-icon--badge c-icon--shield group-hover:scale-105 group-active:scale-95 transition-transform duration-200"></span>
              <h3 class="font-serif text-[clamp(18px,2vw,24px)] text-[var(--text-primary)]">
                Smarter, Safer Decisions
              </h3>
              <p class="max-w-[32ch] text-[var(--text-secondary)] italic text-sm">
                Reduce bias, groupthink, and missteps with balanced perspectives.
              </p>
            </div>
          </a>

          {/* Exclusive access */}
          <a href="/exclusive-access" class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-xl p-6 hover:bg-[var(--bg-secondary)] transition-all duration-300">
            <div class="flex flex-col items-center text-center gap-5">
              <span class="c-icon c-icon--badge c-icon--lock group-hover:scale-105 group-active:scale-95 transition-transform duration-200"></span>
              <h3 class="font-serif text-[clamp(18px,2vw,24px)] text-[var(--text-primary)]">
                Exclusive access
              </h3>
              <p class="max-w-[32ch] text-[var(--text-secondary)] italic text-sm">
                Invitation-only membership. Premium. Private.
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Modern Storytelling Section - Container Queries */}
      <section class="py-20 sm:py-24 lg:py-32 bg-[radial-gradient(120%_120%_at_50%_-10%,#0d1b3d,rgba(5,12,32,1))] relative storytelling-section">
        <div class="c-wrap">
          <div class="text-center mb-16">
            <h2 class="text-[clamp(1.75rem,4.5vw,3.5rem)] font-serif text-[var(--gold)] mb-6">
              Imagine never facing a major decision alone again.
            </h2>
            <p class="text-[clamp(1.125rem,2.2vw,1.5rem)] text-white/90 font-light italic max-w-3xl mx-auto">
              With Concillio, your council of minds is always ready.
            </p>
          </div>
          
          <section class="storytelling">
            <div class="storytelling-bg">
              <div class="storytelling-grid">
                
                <div>
                  <h3 class="text-[clamp(1.25rem,2.8vw,2rem)] font-serif text-[var(--gold)] mb-4">
                    Elite Decision Support
                  </h3>
                  <p class="text-white/85 leading-relaxed">
                    Whether you're navigating career transitions, investment opportunities, or complex strategic challenges
                  </p>
                </div>
                
                <div>
                  <h3 class="text-[clamp(1.25rem,2.8vw,2rem)] font-serif text-[var(--gold)] mb-4">
                    Wisdom & Clarity
                  </h3>
                  <p class="text-white/85 leading-relaxed">
                    Your exclusive council provides the perspective and clarity needed to move forward with absolute confidence
                  </p>
                </div>
                
                <div>
                  <h3 class="text-[clamp(1.25rem,2.8vw,2rem)] font-serif text-[var(--gold)] mb-4">
                    Always Available
                  </h3>
                  <p class="text-white/85 leading-relaxed">
                    24/7 access to your personal council means never being stuck on important decisions again
                  </p>
                </div>
                
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Orbital Council System - Interactive Animation */}
      <section class="orbit-wrapper">
        <div class="fold__orbit">
          <div class="orbit__ring"></div>
          <div class="orbit__center">C</div>
          
          {/* Satelliter med roller - Perfect orbital positioning */}
          <div class="orbit__sat" style="--angle: 0deg;">
            <div class="orbit__badge">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><use href="#ico-strategist"/></svg>
            </div>
            <div class="orbit__label">Chief Strategist</div>
          </div>

          <div class="orbit__sat" style="--angle: 90deg;">
            <div class="orbit__badge">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><use href="#ico-advisor"/></svg>
            </div>
            <div class="orbit__label">Advisor</div>
          </div>

          <div class="orbit__sat" style="--angle: 180deg;">
            <div class="orbit__badge">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><use href="#ico-futurist"/></svg>
            </div>
            <div class="orbit__label">Senior Futurist</div>
          </div>

          <div class="orbit__sat" style="--angle: 270deg;">
            <div class="orbit__badge">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><use href="#ico-psychologist"/></svg>
            </div>
            <div class="orbit__label">Behavioral Psychologist</div>
          </div>
        </div>
      </section>

      {/* Dual Council CTAs */}
      <section class="dual-cta">
        <a href="/council-deliberations">
          Council Minutes
        </a>
        <a href="/council-consensus">
          Council Consensus
        </a>
      </section>

      {/* Citat */}
      <section class="fold__quote py-[clamp(32px,8vh,80px)] grid place-items-center px-[clamp(10px,3vw,28px)]">
        <blockquote class="quote-premium mx-auto max-w-3xl">
          <p class="font-serif italic text-[clamp(18px,2.6vw,28px)] leading-[1.55] text-[var(--text-primary)] text-center">
            "The collective wisdom of minds greater than the sum of their parts."
          </p>
          <footer class="mt-3 text-center text-[var(--text-secondary)]">
            — Concillio Institutional Doctrine —
          </footer>
        </blockquote>
      </section>

      {/* Modern Apply Section */}
      <section id="apply" class="bg-[radial-gradient(120%_120%_at_50%_-10%,#0d1b3d,rgba(5,12,32,1))] relative">
        <div class="c-wrap py-[clamp(32px,6vw,72px)] text-center max-w-[720px]">
          <h2 class="font-serif font-semibold text-[clamp(26px,3.6vw,40px)] text-white">Secure Your Seat at the Table</h2>
          <p class="mt-1 font-serif italic text-white/90">Apply for Invite</p>

          {/* Social proof */}
          <div class="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/85 text-sm">
            <span>🏛️ 500+ Members</span>
            <span>👑 Invitation Only</span>
            <span>🛡️ Fully Confidential</span>
          </div>

          {/* Form */}
          <form class="mt-7 space-y-3.5 text-left">
            <input class="input" type="text" placeholder="Namn" />
            <input class="input" type="email" placeholder="E-postadress" />
            <input class="input" type="url" placeholder="LinkedIn-profil (valfritt)" />

            <button type="submit" class="btn-premium w-full py-3.5 text-[clamp(1rem,1.8vw,1.125rem)]">
              Request Access
            </button>
          </form>

          <p class="mt-5 font-serif italic text-white/85 text-[clamp(14px,1.6vw,16px)]">
            Applications reviewed weekly. Founding members receive priority access and 3 months complimentary membership.
          </p>
        </div>
      </section>

      {/* Premium Footer */}
      <footer class="footer-premium">
        <div class="footer-logo">Concillio — Where wisdom convenes.</div>
        <nav class="footer-nav">
          <a href="#why">Why Concillio</a>
          <a href="#session">Council Session</a>
          <a href="#apply">Request Access</a>
        </nav>
        <div class="footer-legal">© Concillio. All rights reserved.</div>
      </footer>
      
      {/* JavaScript for form handling */}
      <script src="/static/app.js"></script>
    </div>
  )
})

// Keep all existing routes from the original file
// Multiple perspectives page
app.get('/multiple-perspectives', (c) => {
  return c.render(
    <Container size="lg" className="py-16">
      <nav class="mb-8">
        <div class="flex gap-2 text-concillio-navy/70 text-sm">
          <a href="/" class="hover:underline">Home</a>
          <span>/</span>
          <span class="text-concillio-navy font-medium">Multiple perspectives</span>
        </div>
      </nav>

      <div class="text-center mb-16">
        <p class="uppercase tracking-wider text-concillio-gold mb-3">Concillio</p>
        <h1 class="font-serif text-fluid-h1">Multiple perspectives</h1>
        <p class="italic text-concillio-navy/80 text-fluid-body mt-4">
          Four disciplines. One council — so you see the whole board before you move.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Request Access</a>
        </div>
      </div>

      <div class="grid md:grid-cols-12 gap-10">
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-fluid-h2">Why multiple lenses outperform single-expert advice</h2>
          <p>
            Blind spots kill decisions. Concillio combines <em>Strategic Analysis</em>, <em>Market Intelligence</em>,
            <em>Advisory</em>, and <em>Decision Psychology</em> into a repeatable council method that converges on clarity —
            not compromise.
          </p>

          <div class="grid sm:grid-cols-2 gap-6">
            <FeatureCard
              title="Eliminate blind spots"
              description="Each role interrogates the decision from its domain — risk/reward, timing, positioning, and bias."
            />
            <FeatureCard
              title="Converge fast"
              description="Parallel deliberation yields a crisp, ceremonial consensus in minutes."
            />
          </div>

          <h3 class="font-serif text-fluid-h3 mt-6">How a council session works</h3>
          <ol class="list-decimal pl-5 space-y-2 text-concillio-navy/90">
            <li>Define the question (binary if possible).</li>
            <li>Roles deliberate in parallel using a standard structure.</li>
            <li>Consensus is issued — with risks and mitigations.</li>
            <li>Outcome is documented for sharing with stakeholders.</li>
          </ol>
        </div>

        <aside class="md:col-span-5 bg-concillio-paper/50 rounded-xl p-6 space-y-6">
          <h3 class="font-serif text-xl">What you get</h3>
          <ul class="space-y-3">
            <li>360° analysis on a single page</li>
            <li>Bias checks and documented rationale</li>
            <li>Actionable consensus you can share</li>
            <li>Less decision fatigue, more conviction</li>
          </ul>

          <div class="border-t border-concillio-gold/25 pt-6">
            <a href="/apply" class="btn-premium w-full text-center">Request Access</a>
          </div>
        </aside>
      </div>
    </Container>
  )
})

// Apply page (simplified form page)
app.get('/apply', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-b from-concillio-navy to-concillio-ink flex items-center justify-center">
      <Container size="md" className="text-center text-white">
        <h1 class="font-serif text-fluid-h1 mb-8">Apply for Concillio Access</h1>
        <ConcillioInviteForm />
        <p class="mt-8 font-serif italic text-white/85 text-sm">
          Applications reviewed weekly. We'll be in touch within 5 business days.
        </p>
      </Container>
    </div>
  )
})

export default app