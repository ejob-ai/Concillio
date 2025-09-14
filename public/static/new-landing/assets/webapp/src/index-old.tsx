import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { enhancedRenderer } from './lib/design-system/enhanced-renderer'
import { secureHeaders } from 'hono/secure-headers'
import { 
  Container,
  ConcillioHero,
  ConcillioOrbit,
  ConcillioInviteForm,
  FeatureCard,
  TestimonialCard,
  PerspectiveCard,
  ThemeToggle,
  IconContainer,
  PremiumButton 
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

app.use(enhancedRenderer)

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

// Multiple perspectives page
app.get('/multiple-perspectives', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Multiple perspectives</title>
      <meta name="description" content="Four disciplines. One council. Strategist, futurist, advisor, and psychologist give you decision power without blind spots.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/#why" class="underline-offset-2 hover:underline">Why Concillio</a></li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Multiple perspectives</li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Multiple perspectives</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          Four disciplines. One council — so you see the whole board before you move.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Request Access</a>
        </div>
      </header>

      <!-- Innehåll -->
      <section class="container mx-auto px-6 grid md:grid-cols-12 gap-10 pb-16 md:pb-24">
        <!-- Copy -->
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-[clamp(24px,3.2vw,34px)]">Why multiple lenses outperform single-expert advice</h2>
          <p>
            Blind spots kill decisions. Concillio combines <em>Strategic Analysis</em>, <em>Market Intelligence</em>,
            <em>Advisory</em>, and <em>Decision Psychology</em> into a repeatable council method that converges on clarity —
            not compromise.
          </p>

          <div class="grid sm:grid-cols-2 gap-6">
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Eliminate blind spots</h3>
              <p class="text-[var(--navy-80)]">Each role interrogates the decision from its domain — risk/reward, timing, positioning, and bias.</p>
            </div>
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Converge fast</h3>
              <p class="text-[var(--navy-80)]">Parallel deliberation yields a crisp, ceremonial consensus in minutes.</p>
            </div>
          </div>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">How a council session works</h3>
          <ol class="list-decimal pl-5 space-y-2 text-[var(--navy-90)]">
            <li>Define the question (binary if possible).</li>
            <li>Roles deliberate in parallel using a standard structure.</li>
            <li>Consensus is issued — with risks and mitigations.</li>
            <li>Outcome is documented for sharing with stakeholders.</li>
          </ol>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">When to use it</h3>
          <ul class="list-disc pl-5 space-y-2 text-[var(--navy-90)]">
            <li>Career transitions & compensation decisions</li>
            <li>Vendor/partner selection, product strategy</li>
            <li>Significant purchases or investments</li>
            <li>High-stakes personal choices</li>
          </ul>
        </div>

        <!-- Sidebar highlights -->
        <aside class="md:col-span-5 card-soft p-6 space-y-6">
          <h3 class="font-serif text-xl">What you get</h3>
          <ul class="space-y-3">
            <li>360° analysis on a single page</li>
            <li>Bias checks and documented rationale</li>
            <li>Actionable consensus you can share</li>
            <li>Less decision fatigue, more conviction</li>
          </ul>

          <div class="border-t border-[color-mix(in_oklab,var(--gold)_25%,white_75%)] pt-6">
            <a href="/apply" class="btn-premium w-full justify-center">Request Access</a>
          </div>
        </aside>
      </section>

      <!-- Proof -->
      <section class="container mx-auto px-6 pb-20">
        <blockquote class="card-soft p-8 text-center max-w-3xl mx-auto">
          <p class="font-serif italic text-[clamp(18px,2.6vw,22px)]">
            "The collective wisdom of minds is greater than the sum of their parts."
          </p>
          <footer class="mt-4 text-[var(--navy-70)]">— Concillio Institutional Doctrine</footer>
        </blockquote>
      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Ready to sit at the table?</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Mini-footer nav -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
            <ul class="space-y-2">
              <li><a href="/" class="hover:underline">Home</a></li>
              <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
            </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Decisions in minutes page
app.get('/decisions-in-minutes', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Decisions in minutes</title>
      <meta name="description" content="Decision quality in real-time. Parallel deliberation, standardized analysis, and ceremonial consensus in minutes.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/#why" class="underline-offset-2 hover:underline">Why Concillio</a></li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Decisions in minutes</li>
        </ol>
      </nav>

      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Decisions in minutes</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          Speed without sacrificing rigor.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Get guidance now</a>
        </div>
      </header>

      <section class="container mx-auto px-6 grid md:grid-cols-12 gap-10 pb-16 md:pb-24">
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-[clamp(24px,3.2vw,34px)]">How we deliver in minutes</h2>
          <ul class="space-y-4 text-[var(--navy-90)]">
            <li><strong>Parallel deliberation.</strong> Roles work simultaneously — no serial bottlenecks.</li>
            <li><strong>Standardised structure.</strong> Premises → Assessment → Recommendation → Risks/Mitigations.</li>
            <li><strong>Ceremonial consensus.</strong> A clear, signed decision you can act on immediately.</li>
          </ul>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)]">Quality guardrails</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>Bias checks (loss aversion, sunk cost, confirmation)</li>
            <li>Traceable rationale and assumptions</li>
            <li>Conservative language in high-risk contexts</li>
          </ul>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)]">Use cases</h3>
          <ul class="list-disc pl-5 space-y-2">
            <li>Offer decisions: accept, renegotiate, decline</li>
            <li>Go-to-market timing and pricing</li>
            <li>Vendor/partner selection</li>
            <li>Personal high-stakes trade-offs</li>
          </ul>
        </div>

        <aside class="md:col-span-5 card-soft p-6 space-y-6">
          <h3 class="font-serif text-xl">Service levels</h3>
          <ul class="space-y-3">
            <li><strong>Express:</strong> minutes (live session)</li>
            <li><strong>Same-day:</strong> for light materials</li>
            <li><strong>Deep dive:</strong> 24–48h for complex inputs</li>
          </ul>
          <div class="border-t border-[color-mix(in_oklab,var(--gold)_25%,white_75%)] pt-6">
            <a href="/apply" class="btn-premium w-full justify-center">Get guidance now</a>
          </div>
        </aside>
      </section>

      <section class="container mx-auto px-6 pb-20">
        <blockquote class="card-soft p-8 text-center max-w-3xl mx-auto">
          <p class="font-serif italic text-[clamp(18px,2.6vw,22px)]">
            "Clarity in minutes is not haste — it's method."
          </p>
          <footer class="mt-4 text-[var(--navy-70)]">— Concillio Council</footer>
        </blockquote>
      </section>

      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Make the hard call — fast</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Mini-footer nav -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
          <ul class="space-y-2">
            <li><a href="/" class="hover:underline">Home</a></li>
            <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
          </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Exclusive access page
app.get('/exclusive-access', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Exclusive access</title>
      <meta name="description" content="Invitation-only membership. Discreet, confidential, and premium counsel for leaders and investors.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/#why" class="underline-offset-2 hover:underline">Why Concillio</a></li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Exclusive access</li>
        </ol>
      </nav>

      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Exclusive access</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          A council when you need it — and silence when you don't.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Apply for invite</a>
        </div>
      </header>

      <section class="container mx-auto px-6 grid md:grid-cols-12 gap-10 pb-16 md:pb-24">
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-[clamp(24px,3.2vw,34px)]">Membership</h2>
          <ul class="space-y-3">
            <li><strong>Invitation-only.</strong> Selection on discretion, judgment, intention.</li>
            <li><strong>Priority windows.</strong> Preferred access to sessions and consensus delivery.</li>
            <li><strong>Confidential.</strong> Encrypted protocols, minimal retention, no external sharing.</li>
          </ul>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)]">Onboarding</h3>
          <ol class="list-decimal pl-5 space-y-2">
            <li>Short application (profile + goals)</li>
            <li>Intro call to define decision domains</li>
            <li>Access granted — your council is one click away</li>
          </ol>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)]">Who it's for</h3>
          <p>Founders, CEOs, investors and senior leaders who value time, discretion and rigor.</p>
        </div>

        <aside class="md:col-span-5 card-soft p-6 space-y-6">
          <h3 class="font-serif text-xl">Guarantees for discretion</h3>
          <ul class="space-y-3">
            <li>Need-to-know access, revocable links</li>
            <li>Secure channels and audit logs</li>
            <li>NDA / enterprise agreements available</li>
          </ul>
          <div class="border-t border-[color-mix(in_oklab,var(--gold)_25%,white_75%)] pt-6">
            <a href="/apply" class="btn-premium w-full justify-center">Apply for invite</a>
          </div>
        </aside>
      </section>

      <section class="container mx-auto px-6 pb-20">
        <blockquote class="card-soft p-8 text-center max-w-3xl mx-auto">
          <p class="font-serif italic text-[clamp(18px,2.6vw,22px)]">
            "Excellence is quiet. So is trust."
          </p>
          <footer class="mt-4 text-[var(--navy-70)]">— Concillio Council</footer>
        </blockquote>
      </section>

      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Join a private circle of counsel</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Mini-footer nav -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
          <ul class="space-y-2">
            <li><a href="/" class="hover:underline">Home</a></li>
            <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
          </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Council deliberations page
app.get('/council-deliberations', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Council Deliberations</title>
      <meta name="description" content="See how our council works. Parallel deliberation from strategist, futurist, psychologist, and advisor.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <!-- SVG Sprite -->
      <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute; width:0; height:0; overflow:hidden;">
        <!-- Strategist (chess knight) -->
        <symbol id="ico-strategist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 20h10v-2H7v2Zm12-8.5c0-3.92-2.95-7.33-6.84-7.48A7 7 0 0 0 5 11v2h3.5l-1 2.5H17a4 4 0 0 0 2-3.5v-.5Zm-7.2-4.9c1.86.1 3.4 1.34 3.93 3.01.14.45-.23.89-.7.82-1.3-.18-2.26-.23-3.04.2-.6.33-1.15.93-1.21 1.87a.8.8 0 0 1-1.6-.12c.08-1.36.78-2.46 1.83-3.04.72-.39 1.57-.56 2.79-.53-.44-.66-1.12-1.12-2-1.21a.8.8 0 1 1 .1-1.6Z"/>
        </symbol>

        <!-- Advisor (gavel) -->
        <symbol id="ico-advisor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 20h12v2H2v-2Zm5.5-15L5 7.5l6 6L11.5 11l-4-4Zm6 6L19.5 17 17 19.5l-6-6 2.5-2.5Z"/>
        </symbol>

        <!-- Futurist (telescope/forward) -->
        <symbol id="ico-futurist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/>
        </symbol>

        <!-- Psychologist (heart/insight) -->
        <symbol id="ico-psych" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.5-3.8-8.4-7.1C1 10.1 2.6 6 6.2 6c2 0 3.1 1 3.8 2 .7-1 1.8-2 3.8-2 3.6 0 5.2 4.1 2.6 7.9C18.5 17.2 12 21 12 21Z"/>
        </symbol>
      </svg>
      
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Council Deliberations</li>
          <li aria-hidden="true">/</li>
          <li><a href="/council-consensus" class="underline-offset-2 hover:underline">Council Consensus</a></li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Council Deliberations</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          See how your council works — parallel analysis, rigorous deliberation.
        </p>
      </header>

      <!-- Council Deliberations Block -->
      <section class="minutes">
        <div class="c-card">

          <div class="px-5 sm:px-6 py-4 border-b border-black/5 text-[var(--navy)]">
            <p class="font-serif italic text-[clamp(1rem,2vw,1.15rem)]">
              "Should I accept the new job offer or stay in my current position?"
            </p>
          </div>


          <div class="px-5 sm:px-6 py-5 space-y-6">


            <div class="flex items-start gap-3">
              <span class="c-sigil" aria-hidden="true">
                <svg width="16" height="16" role="img" aria-label="Chief Strategist">
                  <use href="#ico-strategist"></use>
                </svg>
              </span>
              <div class="flex-1">
                <h4 class="font-semibold text-[var(--navy)]">Chief Strategist</h4>
                <p class="text-sm text-[color:var(--navy-80)] -mt-0.5">Strategic Analysis</p>

                <div class="mt-3">
                  <span class="rec-badge"><span class="dot"></span>Recommendation</span>
                  <span class="ml-2 font-serif text-[clamp(18px,2vw,20px)] text-[#132047]">Evaluate risk–reward matrix</span>
                </div>

                <ul class="mt-2 space-y-1.5 list-disc pl-5 text-[var(--navy)]/90">
                  <li>New role indicates 40% growth trajectory.</li>
                  <li>Current role optimizes stability, not upside.</li>
                  <li>Key levers: momentum, compensation, learning.</li>
                </ul>
              </div>
            </div>

            <div class="c-sep"></div>


            <div class="flex items-start gap-3">
              <span class="c-sigil" aria-hidden="true">
                <svg width="16" height="16" role="img" aria-label="Advisor">
                  <use href="#ico-advisor"></use>
                </svg>
              </span>
              <div class="flex-1">
                <h4 class="font-semibold text-[var(--navy)]">Advisor</h4>
                <p class="text-sm text-[color:var(--navy-80)] -mt-0.5">Strategic Counsel</p>

                <div class="mt-3">
                  <span class="rec-badge"><span class="dot"></span>Recommendation</span>
                  <span class="ml-2 font-serif text-[clamp(18px,2vw,20px)] text-[#132047]">Clarify offer terms & guardrails</span>
                </div>

                <ul class="mt-2 space-y-1.5 list-disc pl-5 text-[var(--navy)]/90">
                  <li>Define success metrics for first 90 days.</li>
                  <li>Negotiate scope creep protection.</li>
                  <li>Align comp with market + impact.</li>
                </ul>
              </div>
            </div>

            <div class="c-sep"></div>


            <div class="flex items-start gap-3">
              <span class="c-sigil" aria-hidden="true">
                <svg width="16" height="16" role="img" aria-label="Behavioral Psychologist">
                  <use href="#ico-psych"></use>
                </svg>
              </span>
              <div class="flex-1">
                <h4 class="font-semibold text-[var(--navy)]">Behavioral Psychologist</h4>
                <p class="text-sm text-[color:var(--navy-80)] -mt-0.5">Decision Psychology</p>

                <div class="mt-3">
                  <span class="rec-badge"><span class="dot"></span>Recommendation</span>
                  <span class="ml-2 font-serif text-[clamp(18px,2vw,20px)] text-[#132047]">Address cognitive barriers</span>
                </div>

                <ul class="mt-2 space-y-1.5 list-disc pl-5 text-[var(--navy)]/90">
                  <li>Loss aversion may bias toward status quo.</li>
                  <li>Frame as growth investment, not risk.</li>
                  <li>Use structured transition plan for confidence.</li>
                </ul>
              </div>
            </div>

            <div class="c-sep"></div>


            <div class="flex items-start gap-3">
              <span class="c-sigil" aria-hidden="true">
                <svg width="16" height="16" role="img" aria-label="Senior Futurist">
                  <use href="#ico-futurist"></use>
                </svg>
              </span>
              <div class="flex-1">
                <h4 class="font-semibold text-[var(--navy)]">Senior Futurist</h4>
                <p class="text-sm text-[color:var(--navy-80)] -mt-0.5">Market Intelligence</p>

                <div class="mt-3">
                  <span class="rec-badge"><span class="dot"></span>Recommendation</span>
                  <span class="ml-2 font-serif text-[clamp(18px,2vw,20px)] text-[#132047]">Position for 2030</span>
                </div>

                <ul class="mt-2 space-y-1.5 list-disc pl-5 text-[var(--navy)]/90">
                  <li>Target sector projects 300% growth this cycle.</li>
                  <li>Early movers capture outsized learning loops.</li>
                  <li>Incumbent shows disruption exposures.</li>
                </ul>

                <p class="c-quote">"Timing favors transition."</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Get your own council</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Navigation -->
      <section class="container mx-auto px-6 py-8 text-center">
        <div class="flex justify-center gap-6 text-sm mb-4">
          <a href="/" class="hover:underline text-[var(--navy-70)]">← Back to Home</a>
          <a href="/council-consensus" class="hover:underline text-[var(--navy-70)]">View Council Consensus →</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
            <ul class="space-y-2">
              <li><a href="/" class="hover:underline">Home</a></li>
              <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
            </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Council consensus page
app.get('/council-consensus', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Council Consensus</title>
      <meta name="description" content="Formal decision consensus from Concillio Council. Unanimous recommendation with risk analysis and action plan.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <!-- SVG Sprite -->
      <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute; width:0; height:0; overflow:hidden;">
        <!-- Strategist (chess knight) -->
        <symbol id="ico-strategist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 20h10v-2H7v2Zm12-8.5c0-3.92-2.95-7.33-6.84-7.48A7 7 0 0 0 5 11v2h3.5l-1 2.5H17a4 4 0 0 0 2-3.5v-.5Zm-7.2-4.9c1.86.1 3.4 1.34 3.93 3.01.14.45-.23.89-.7.82-1.3-.18-2.26-.23-3.04.2-.6.33-1.15.93-1.21 1.87a.8.8 0 0 1-1.6-.12c.08-1.36.78-2.46 1.83-3.04.72-.39 1.57-.56 2.79-.53-.44-.66-1.12-1.12-2-1.21a.8.8 0 1 1 .1-1.6Z"/>
        </symbol>

        <!-- Advisor (gavel) -->
        <symbol id="ico-advisor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 20h12v2H2v-2Zm5.5-15L5 7.5l6 6L11.5 11l-4-4Zm6 6L19.5 17 17 19.5l-6-6 2.5-2.5Z"/>
        </symbol>

        <!-- Futurist (telescope/forward) -->
        <symbol id="ico-futurist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/>
        </symbol>

        <!-- Psychologist (heart/insight) -->
        <symbol id="ico-psychologist" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.5-3.8-8.4-7.1C1 10.1 2.6 6 6.2 6c2 0 3.1 1 3.8 2 .7-1 1.8-2 3.8-2 3.6 0 5.2 4.1 2.6 7.9C18.5 17.2 12 21 12 21Z"/>
        </symbol>
      </svg>

      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/council-deliberations" class="underline-offset-2 hover:underline">Council Deliberations</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Council Consensus</li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Council Consensus</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          Formal resolution — unanimous, actionable, documented.
        </p>
      </header>

      <!-- Council Consensus Content -->
      <section class="container mx-auto px-6 pb-16 md:pb-24">
        <div class="c-card consensus-box max-w-6xl mx-auto min-h-[90vh]">
          <header class="c-header">
            <div class="c-header-title">
              <span class="c-sigil text-[var(--gold)]" aria-hidden="true" style="width: 24px; height: 24px;">
                <svg width="24" height="24" role="img" aria-label="Advisor">
                  <use href="#ico-advisor"></use>
                </svg>
              </span>
              <h3 class="text-lg sm:text-xl font-semibold">Council Consensus</h3>
            </div>
            <div class="text-white/80 text-sm sm:text-base">Formal Resolution</div>
          </header>

          <div class="px-8 py-16 consensus-watermark relative">
            <h2 class="consensus-title font-serif text-[clamp(18px,2vw,20px)] font-semibold mb-8 mt-6 text-[var(--navy)]">Unanimous Recommendation</h2>

            <div class="mx-auto mt-8 max-w-4xl rounded-xl bg-[rgba(13,27,61,.035)] p-[clamp(1.5rem,3vw,2rem)]">
              <p class="text-[var(--navy)] text-[clamp(1rem,2vw,1.15rem)] leading-[1.6] mb-6">
                <strong>Accept the position.</strong> Strategic timing, market momentum, and personal growth alignment converge in this favorable window.
              </p>
              <p class="font-serif italic text-[color:var(--navy-80)] text-[clamp(1rem,2vw,1.15rem)] leading-[1.7]">
                Mitigate transition risks through structured onboarding and network preservation.
              </p>
            </div>

            <!-- Council Signatures -->
            <div class="mt-12 pt-8 border-t border-[var(--navy)]/10">
              <h3 class="font-serif text-[clamp(18px,2vw,20px)] font-semibold mb-8 text-[var(--navy)]">Council Signatures</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- Strategist Signature -->
                <div class="signature-block">
                  <div class="flex items-start gap-4 mb-4">
                    <span class="c-sigil text-[var(--gold)]" aria-hidden="true" style="width: 16px; height: 16px;">
                      <svg width="16" height="16" role="img" aria-label="Strategist">
                        <use href="#ico-strategist"></use>
                      </svg>
                    </span>
                    <div class="flex-1">
                      <div class="signature-line border-b border-[var(--navy)]/20 pb-2 mb-2 min-h-[2rem]">
                        <div class="signature-text font-semibold text-[var(--navy)]">Dr. Elena Vasquez</div>
                      </div>
                      <div class="text-sm text-[color:var(--navy-80)] -mt-0.5">Chief Strategist</div>
                    </div>
                  </div>
                </div>

                <!-- Advisor Signature -->
                <div class="signature-block">
                  <div class="flex items-start gap-4 mb-4">
                    <span class="c-sigil text-[var(--gold)]" aria-hidden="true" style="width: 16px; height: 16px;">
                      <svg width="16" height="16" role="img" aria-label="Advisor">
                        <use href="#ico-advisor"></use>
                      </svg>
                    </span>
                    <div class="flex-1">
                      <div class="signature-line border-b border-[var(--navy)]/20 pb-2 mb-2 min-h-[2rem]">
                        <div class="signature-text font-semibold text-[var(--navy)]">Prof. Marcus Chen</div>
                      </div>
                      <div class="text-sm text-[color:var(--navy-80)] -mt-0.5">Senior Advisor</div>
                    </div>
                  </div>
                </div>

                <!-- Futurist Signature -->
                <div class="signature-block">
                  <div class="flex items-start gap-4 mb-4">
                    <span class="c-sigil text-[var(--gold)]" aria-hidden="true" style="width: 16px; height: 16px;">
                      <svg width="16" height="16" role="img" aria-label="Futurist">
                        <use href="#ico-futurist"></use>
                      </svg>
                    </span>
                    <div class="flex-1">
                      <div class="signature-line border-b border-[var(--navy)]/20 pb-2 mb-2 min-h-[2rem]">
                        <div class="signature-text font-semibold text-[var(--navy)]">Dr. Aria Blackwood</div>
                      </div>
                      <div class="text-sm text-[color:var(--navy-80)] -mt-0.5">Lead Futurist</div>
                    </div>
                  </div>
                </div>

                <!-- Psychologist Signature -->
                <div class="signature-block">
                  <div class="flex items-start gap-4 mb-4">
                    <span class="c-sigil text-[var(--gold)]" aria-hidden="true" style="width: 16px; height: 16px;">
                      <svg width="16" height="16" role="img" aria-label="Psychologist">
                        <use href="#ico-psychologist"></use>
                      </svg>
                    </span>
                    <div class="flex-1">
                      <div class="signature-line border-b border-[var(--navy)]/20 pb-2 mb-2 min-h-[2rem]">
                        <div class="signature-text font-semibold text-[var(--navy)]">Dr. James Morrison</div>
                      </div>
                      <div class="text-sm text-[color:var(--navy-80)] -mt-0.5">Behavioral Psychologist</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Consensus Date and Authentication -->
              <div class="mt-10 pt-6 border-t border-[var(--navy)]/10 text-center">
                <div class="text-sm text-[color:var(--navy-80)] mb-2">Consensus reached on</div>
                <div class="font-serif text-[clamp(18px,2vw,20px)] text-[#132047] font-semibold mb-4">August 31, 2025</div>
                <div class="text-sm text-[var(--navy-70)] italic">
                  Authenticated by Concillio Council Protocol v2.1
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Get your own council</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Navigation -->
      <section class="container mx-auto px-6 py-8 text-center">
        <div class="flex justify-center gap-6 text-sm mb-4">
          <a href="/" class="hover:underline text-[var(--navy-70)]">← Back to Home</a>
          <a href="/council-deliberations" class="hover:underline text-[var(--navy-70)]">View Council Deliberations →</a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
            <ul class="space-y-2">
              <li><a href="/" class="hover:underline">Home</a></li>
              <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
            </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Beyond AI Assistants page
app.get('/beyond-ai-assistants', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Beyond AI Assistants</title>
      <meta name="description" content="Ceremonial Council Minutes & Consensus you can share with leadership or investors. Professional documentation of decision-making process.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/#why" class="underline-offset-2 hover:underline">Why Concillio</a></li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Beyond AI Assistants</li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Beyond AI Assistants</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          Ceremonial documentation that commands respect and trust.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Request Access</a>
        </div>
      </header>

      <!-- Innehåll -->
      <section class="container mx-auto px-6 grid md:grid-cols-12 gap-10 pb-16 md:pb-24">
        <!-- Copy -->
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-[clamp(24px,3.2vw,34px)]">Why ceremonial documentation matters</h2>
          <p>
            AI assistants give you answers. Concillio gives you <em>Council Minutes</em> and <em>Consensus Documents</em> 
            that you can present to leadership, investors, and stakeholders with complete confidence.
          </p>

          <div class="grid sm:grid-cols-2 gap-6">
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Shareable Authority</h3>
              <p class="text-[var(--navy-80)]">Professional council deliberations with signatures and authentication stamps.</p>
            </div>
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Institutional Trust</h3>
              <p class="text-[var(--navy-80)]">Formal consensus documents that demonstrate rigorous decision-making process.</p>
            </div>
          </div>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">What makes it ceremonial</h3>
          <ul class="list-disc pl-5 space-y-2 text-[var(--navy-90)]">
            <li>Formal council member signatures and credentials</li>
            <li>Authenticated consensus with protocol verification</li>
            <li>Professional formatting suitable for boardrooms</li>
            <li>Traceable decision rationale and risk analysis</li>
          </ul>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">When to use ceremonial documentation</h3>
          <ul class="list-disc pl-5 space-y-2 text-[var(--navy-90)]">
            <li>Board presentations and investor meetings</li>
            <li>Major strategic decisions requiring approval</li>
            <li>Due diligence and compliance documentation</li>
            <li>Executive team alignment and buy-in</li>
          </ul>
        </div>

        <!-- Sidebar highlights -->
        <aside class="md:col-span-5 card-soft p-6 space-y-6">
          <h3 class="font-serif text-xl">Ceremonial Features</h3>
          <ul class="space-y-3">
            <li>Council member credentials and signatures</li>
            <li>Formal consensus authentication</li>
            <li>Professional presentation format</li>
            <li>Institutional-grade documentation</li>
          </ul>

          <div class="border-t border-[color-mix(in_oklab,var(--gold)_25%,white_75%)] pt-6">
            <a href="/apply" class="btn-premium w-full justify-center">Request Access</a>
          </div>
        </aside>
      </section>

      <!-- Proof -->
      <section class="container mx-auto px-6 pb-20">
        <blockquote class="card-soft p-8 text-center max-w-3xl mx-auto">
          <p class="font-serif italic text-[clamp(18px,2.6vw,22px)]">
            "Trust is built through transparency, process, and ceremony."
          </p>
          <footer class="mt-4 text-[var(--navy-70)]">— Concillio Institutional Doctrine</footer>
        </blockquote>
      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Ready for institutional-grade decisions?</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Mini-footer nav -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/smarter-safer-decisions" class="hover:underline">Smarter, safer decisions</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
            <ul class="space-y-2">
              <li><a href="/" class="hover:underline">Home</a></li>
              <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
            </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

// Smarter, Safer Decisions page
app.get('/smarter-safer-decisions', (c) => {
  return c.html(`
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Concillio – Smarter, Safer Decisions</title>
      <meta name="description" content="Reduce bias, groupthink, and missteps with balanced perspectives. Multi-discipline council approach to decision-making.">
      <link rel="stylesheet" href="/static/tailwind.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <link href="/static/style.css" rel="stylesheet">
      <script src="/static/theme-toggle.js" defer></script>
    </head>
    <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="container mx-auto px-6 pt-6">
        <ol class="flex gap-2 text-[var(--navy-70)] text-sm">
          <li><a href="/" class="underline-offset-2 hover:underline">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/#why" class="underline-offset-2 hover:underline">Why Concillio</a></li>
          <li aria-current="page" class="text-[var(--navy)] font-medium">Smarter, Safer Decisions</li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="container mx-auto px-6 py-16 md:py-24 text-center">
        <p class="uppercase tracking-[0.15em] text-[var(--gold)] mb-3">Concillio</p>
        <h1 class="font-serif text-[clamp(36px,8vw,72px)] leading-[1.05]">Smarter, Safer Decisions</h1>
        <p class="italic text-[var(--navy-80)] text-[clamp(16px,2.2vw,22px)] mt-4">
          Multi-perspective analysis eliminates cognitive blind spots.
        </p>
        <div class="mt-8">
          <a href="/apply" class="btn-premium">Request Access</a>
        </div>
      </header>

      <!-- Innehåll -->
      <section class="container mx-auto px-6 grid md:grid-cols-12 gap-10 pb-16 md:pb-24">
        <!-- Copy -->
        <div class="md:col-span-7 space-y-8 leading-relaxed">
          <h2 class="font-serif text-[clamp(24px,3.2vw,34px)]">How balanced perspectives improve decisions</h2>
          <p>
            Single advisors, even experts, carry cognitive biases and domain limitations. 
            Concillio's multi-discipline council approach systematically reduces decision risks 
            through <em>Strategic Analysis</em>, <em>Market Intelligence</em>, <em>Advisory Counsel</em>, and <em>Decision Psychology</em>.
          </p>

          <div class="grid sm:grid-cols-2 gap-6">
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Bias Detection</h3>
              <p class="text-[var(--navy-80)]">Systematic identification of confirmation bias, anchoring, and overconfidence.</p>
            </div>
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Groupthink Prevention</h3>
              <p class="text-[var(--navy-80)]">Independent parallel analysis prevents consensus pressure and echo chambers.</p>
            </div>
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Risk Mitigation</h3>
              <p class="text-[var(--navy-80)]">Cross-disciplinary review identifies blind spots and hidden risks.</p>
            </div>
            <div class="card-soft p-6">
              <h3 class="font-serif text-[var(--navy)] mb-2">Quality Assurance</h3>
              <p class="text-[var(--navy-80)]">Structured deliberation ensures thorough analysis before consensus.</p>
            </div>
          </div>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">Common decision traps we prevent</h3>
          <ul class="list-disc pl-5 space-y-2 text-[var(--navy-90)]">
            <li><strong>Confirmation bias:</strong> Seeking information that confirms existing beliefs</li>
            <li><strong>Anchoring bias:</strong> Over-reliance on first information received</li>
            <li><strong>Sunk cost fallacy:</strong> Continuing failed strategies due to past investment</li>
            <li><strong>Overconfidence:</strong> Overestimating accuracy of judgments</li>
            <li><strong>Groupthink:</strong> Pressure for harmony resulting in poor decisions</li>
          </ul>

          <h3 class="font-serif text-[clamp(20px,2.6vw,28px)] mt-6">Council methodology</h3>
          <ol class="list-decimal pl-5 space-y-2 text-[var(--navy-90)]">
            <li>Independent parallel analysis by each discipline</li>
            <li>Structured bias checks and assumption testing</li>
            <li>Cross-examination of recommendations</li>
            <li>Convergence on balanced consensus</li>
          </ol>
        </div>

        <!-- Sidebar highlights -->
        <aside class="md:col-span-5 card-soft p-6 space-y-6">
          <h3 class="font-serif text-xl">Decision Safety Features</h3>
          <ul class="space-y-3">
            <li>Multi-discipline perspective analysis</li>
            <li>Systematic bias detection and correction</li>
            <li>Independent parallel deliberation</li>
            <li>Risk assessment and mitigation planning</li>
          </ul>

          <div class="border-t border-[color-mix(in_oklab,var(--gold)_25%,white_75%)] pt-6">
            <a href="/apply" class="btn-premium w-full justify-center">Request Access</a>
          </div>
        </aside>
      </section>

      <!-- Proof -->
      <section class="container mx-auto px-6 pb-20">
        <blockquote class="card-soft p-8 text-center max-w-3xl mx-auto">
          <p class="font-serif italic text-[clamp(18px,2.6vw,22px)]">
            "The antidote to bias is not more analysis — it's better process."
          </p>
          <footer class="mt-4 text-[var(--navy-70)]">— Concillio Decision Science</footer>
        </blockquote>
      </section>

      <!-- CTA -->
      <section class="container mx-auto px-6 pb-24 text-center">
        <h2 class="font-serif text-[clamp(22px,3vw,30px)]">Make decisions with confidence</h2>
        <a href="/apply" class="btn-premium mt-4">Request Access</a>
      </section>

      <!-- Mini-footer nav -->
      <footer class="border-t border-[color-mix(in_oklab,var(--navy)_10%,white_90%)]">
        <div class="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Explore</p>
            <ul class="space-y-2">
              <li><a href="/multiple-perspectives" class="hover:underline">Multiple perspectives</a></li>
              <li><a href="/decisions-in-minutes" class="hover:underline">Decisions in minutes</a></li>
              <li><a href="/beyond-ai-assistants" class="hover:underline">Beyond AI assistants</a></li>
              <li><a href="/exclusive-access" class="hover:underline">Exclusive access</a></li>
            </ul>
          </div>
          <div>
            <p class="uppercase tracking-[0.12em] text-[var(--navy-70)] mb-2">Company</p>
            <ul class="space-y-2">
              <li><a href="/" class="hover:underline">Home</a></li>
              <li><a href="/#why" class="hover:underline">Why Concillio</a></li>
            </ul>
          </div>
          <div class="md:text-right">
            <p class="text-[var(--navy-70)]">© Concillio 2025</p>
          </div>
        </div>
      </footer>
    </body>
    </html>
  `)
})

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
            <button class="cta btn-premium mt-[clamp(12px,2vh,20px)]">
              Request Access
            </button>
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

export default app
