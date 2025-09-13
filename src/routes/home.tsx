import { Hono } from 'hono'
import { renderer } from '../renderer'

const home = new Hono()
home.use(renderer)

// Liten ikon-helper (inline paths → inga externa assets)
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={d} fill="currentColor" />
  </svg>
)

home.get('/', (c) => {
  c.set('head', {
    title: 'Concillio — Where wisdom convenes.',
    description: 'Your personal council of minds, always ready.'
  })

  const why = [
    {
      slug: 'multiple-perspectives',
      title: 'Multiple perspectives',
      body: 'Four to ten expert roles in structured synthesis — not a single “assistant”.',
      icon: 'M12 2l7 7-7 7-7-7 7-7z'
    },
    {
      slug: 'decisions-in-minutes',
      title: 'Decisions in minutes',
      body: 'Concise minutes with actions, risks, trade-offs, and follow-ups.',
      icon: 'M5 12h14M5 12l4-4M5 12l4 4'
    },
    {
      slug: 'weighted-consensus',
      title: 'Weighted consensus',
      body: 'Transparent role weighting with heuristic nudges from your context.',
      icon: 'M3 12h18M12 3v18'
    },
    {
      slug: 'smarter-safer',
      title: 'Smarter, safer',
      body: 'Strict CSP, PII scrubbing, guards and rate-limits — safety by design.',
      icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z'
    },
    {
      slug: 'from-brief-to-pdf',
      title: 'From brief to PDF',
      body: 'One flow: ask → counsel → validated consensus → export.',
      icon: 'M6 4h9l3 3v13H6z'
    }
  ]

  const steps = [
    {
      n: '01',
      title: 'Describe your decision',
      body: 'Goal, constraints and context. Bring a link or short brief. We reduce noise.',
      icon: 'M4 12h16'
    },
    {
      n: '02',
      title: 'Pick a line-up',
      body: 'Start from a preset or customize. Roles are weighted and explained.',
      icon: 'M6 6h12M6 12h12M6 18h8'
    },
    {
      n: '03',
      title: 'Get the minutes',
      body: 'Clear actions, risks and conditions. Export to PDF and share.',
      icon: 'M5 12l4 4L19 6'
    }
  ]

  const lineups = [
    { name: 'Entrepreneur / Founder', slug: 'entrepreneur', to: '/docs/lineups#entreprenor' },
    { name: 'SaaS B2B', slug: 'saas-b2b', to: '/docs/lineups#saas-b2b' },
    { name: 'Regulated Industry', slug: 'regulated', to: '/docs/lineups#regulated-industry' },
    { name: 'Consumer Apps', slug: 'consumer', to: '/docs/lineups#konsumentappar' },
    { name: 'Scale-up', slug: 'scaleup', to: '/docs/lineups#scale-up-rapid-growth' }
  ]

  return c.render(
    <main class="min-h-screen bg-white text-slate-900">
      {/* Local tokens for polish, no extra bundles */}
      <style>{`
        :root{
          --gold: #d4a526; --gold-ink:#111827;
          --ink:#0b1b34; --muted:#5b6471; --line: #e8ecf2;
          --nav-h: 72px;
        }
        .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
        .nav-blur{backdrop-filter:saturate(180%) blur(10px)}
        .elev{box-shadow:0 2px 8px rgba(10,12,16,.05),0 12px 40px rgba(10,12,16,.06)}
        .btn{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;font-weight:700}
        .btn-primary{background:var(--gold);color:var(--gold-ink);padding:14px 18px}
        .btn-primary:hover{filter:saturate(110%)}
        .btn-secondary{border:1px solid var(--line);padding:12px 16px}
        .muted{color:var(--muted)}
        .badge{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase}
        .glass{background:rgba(255,255,255,.7);border:1px solid var(--line)}
        .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
        .card:hover{box-shadow:0 12px 34px rgba(10,12,16,.06);transform:translateY(-1px)}
        .grid-why{display:grid;gap:14px}
        @media(min-width:640px){.grid-why{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(min-width:1024px){.grid-why{grid-template-columns:repeat(5,minmax(0,1fr))}}
        .grid-steps{display:grid;gap:16px}
        @media(min-width:960px){.grid-steps{grid-template-columns:repeat(3,minmax(0,1fr))}}
        .role-chip{display:inline-flex;align-items:center;gap:.5rem;border:1px solid var(--line);border-radius:999px;padding:8px 12px;background:#fff}
        .role-dot{width:8px;height:8px;border-radius:999px;background:var(--gold)}
        .sticky-nav-shadow{box-shadow:0 1px 0 var(--line)}
        .nav-link{border-radius:10px;padding:10px 12px}
        .nav-link:hover{background:rgba(2,6,23,.05)}
        .mobile-overlay{position:fixed;inset:0;background:rgba(255,255,255,.98);display:none;z-index:60}
        .mobile-overlay.open{display:block}
      `}</style>

      {/* NAV */}
      <header
        class="sticky top-0 z-50 bg-white/80 nav-blur sticky-nav-shadow"
        aria-label="Main navigation"
      >
        <div class="wrap h-[var(--nav-h)] flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold tracking-tight">
            <span class="inline-block w-[26px] h-[26px] rounded-lg"
              style="background:conic-gradient(from 210deg,#0f766e,#50c3b4 36%,#b9efe8 66%,#0f766e)">
            </span>
            Concillio
          </a>

          {/* Desktop menu */}
          <nav class="hidden md:flex items-center gap-1" role="menubar">
            <a class="nav-link" role="menuitem" href="/docs/roller">Roles</a>
            <a class="nav-link" role="menuitem" href="/docs/lineups">Line-ups</a>
            <a class="nav-link" role="menuitem" href="/#pricing">Pricing</a>
            <a class="nav-link" role="menuitem" href="/minutes/1">Examples</a>
            <a class="ml-2 btn btn-secondary" href="/login">Log in</a>
            <a class="ml-1 btn btn-primary" href="/council/ask" data-cta="start-now">Run a session</a>
          </nav>

          {/* Mobile hamburger */}
          <button
            id="hamburger"
            class="md:hidden w-11 h-11 rounded-xl glass grid place-items-center"
            aria-label="Open menu"
            aria-controls="m-ovl"
            aria-expanded="false"
          >
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          </button>
        </div>

        {/* Mobile overlay */}
        <div id="m-ovl" class="mobile-overlay">
          <div class="wrap h-[var(--nav-h)] flex items-center justify-between">
            <div class="font-bold">Concillio</div>
            <button id="closeOverlay" class="w-11 h-11 rounded-xl glass grid place-items-center" aria-label="Close menu">
              <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" fill="none"/></svg>
            </button>
          </div>
          <nav class="wrap pb-6">
            <a class="block p-4 text-lg" href="/docs/roller">Roles</a>
            <a class="block p-4 text-lg" href="/docs/lineups">Line-ups</a>
            <a class="block p-4 text-lg" href="/#pricing">Pricing</a>
            <a class="block p-4 text-lg" href="/minutes/1">Examples</a>
            <div class="mt-2 flex flex-col gap-3">
              <a class="btn btn-secondary" href="/login">Log in</a>
              <a class="btn btn-primary" href="/council/ask">Run a session</a>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        class="relative overflow-hidden"
        style="background:
          radial-gradient(900px 500px at 80% -10%, rgba(15,118,110,.06), transparent 60%),
          linear-gradient(180deg,#ffffff,#f8fafc)"
      >
        <div class="wrap min-h-[78svh] flex items-center">
          <div class="mx-auto text-center max-w-[860px]">
            <p class="badge text-emerald-700/80">Concillio</p>
            <h1 class="font-['Crimson_Text',serif] text-4xl sm:text-6xl lg:text-7xl tracking-tight mt-2">
              Where wisdom convenes.
            </h1>
            <p class="mt-3 text-base sm:text-lg muted">Your personal council of minds, always ready.</p>
            <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a class="btn btn-primary min-w-[240px]" href="/login" data-cta="enter">Enter Concillio</a>
              <a class="btn btn-secondary" href="#why" data-scroll data-cta="know-more">Want to know more?</a>
            </div>
            {/* Social proof (text-only → snabbt) */}
            <div class="mt-6 text-xs sm:text-sm muted">
              Trusted by founders, operators and policy leaders across EU & US.
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" class="py-16">
        <div class="wrap">
          <h2 class="text-2xl sm:text-3xl font-semibold text-center">Why Concillio?</h2>
          <div class="mt-6 grid-why">
            {why.map((x) => (
              <a
                href={`/why/${x.slug}`}
                class="card transition transform hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
              >
                <div class="w-10 h-10 rounded-xl bg-amber-100 grid place-items-center text-[var(--ink)]">
                  <Icon d={x.icon} />
                </div>
                <div class="mt-2 font-semibold">{x.title}</div>
                <p class="mt-1 text-sm muted">{x.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section class="py-14 bg-slate-50 border-y border-[var(--line)]">
        <div class="wrap">
          <h2 class="text-2xl sm:text-3xl font-semibold text-center">How it works</h2>
          <div class="mt-6 grid-steps">
            {steps.map((s) => (
              <div class="card">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-amber-600">{s.n}</span>
                  <div class="font-semibold">{s.title}</div>
                </div>
                <p class="mt-2 text-sm muted">{s.body}</p>
                <div class="mt-3 text-amber-700/70">
                  <Icon d={s.icon} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LINE-UPS TEASER */}
      <section class="py-16">
        <div class="wrap">
          <div class="flex items-end justify-between gap-4 flex-wrap">
            <h2 class="text-2xl sm:text-3xl font-semibold">Line-ups that fit your decision</h2>
            <a class="btn btn-secondary" href="/docs/lineups">Explore all line-ups</a>
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            {lineups.map((l) => (
              <a class="role-chip hover:shadow-sm" href={l.to}>
                <span class="role-dot" aria-hidden="true" />
                {l.name}
              </a>
            ))}
          </div>
          <p class="mt-3 text-xs muted">
            Baseline weights shown in docs; live sessions may adjust weighting heuristically based on your question & context.
          </p>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section id="pricing" class="py-16 bg-slate-50 border-y border-[var(--line)]">
        <div class="wrap">
          <h2 class="text-2xl sm:text-3xl font-semibold text-center">Transparent pricing</h2>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="card">
              <div class="font-bold">Free</div>
              <p class="muted text-sm mt-1">Try core features. Personal line-up. PDF export.</p>
              <a class="mt-4 btn btn-secondary w-full" href="/council/ask">Start free</a>
            </div>
            <div class="card ring-2 ring-amber-300">
              <div class="font-bold">Pro</div>
              <p class="muted text-sm mt-1">Custom line-ups up to 7 roles. Heuristic tuning. Share links.</p>
              <a class="mt-4 btn btn-primary w-full" href="/council/ask">Upgrade</a>
            </div>
            <div class="card">
              <div class="font-bold">Enterprise</div>
              <p class="muted text-sm mt-1">SSO, data residency, SLAs, private prompts.</p>
              <a class="mt-4 btn btn-secondary w-full" href="/council/ask">Contact</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section class="py-16">
        <div class="wrap text-center">
          <h3 class="text-xl sm:text-2xl font-semibold">Ready to convene your council?</h3>
          <p class="muted mt-2">Run a session in under two minutes.</p>
          <div class="mt-5 flex items-center justify-center gap-3">
            <a class="btn btn-primary min-w-[220px]" href="/council/ask">Run a session</a>
            <a class="btn btn-secondary" href="/docs/roller">Explore roles</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer class="border-t border-[var(--line)]">
        <div class="wrap py-8 text-sm muted flex items-center justify-between flex-wrap gap-3">
          <div class="font-semibold text-slate-700">Concillio</div>
          <nav class="flex gap-4" aria-label="Footer">
            <a href="/docs/roller">Roles</a>
            <a href="/docs/lineups">Line-ups</a>
            <a href="/minutes/1">Example minutes</a>
            <a href="/health">Status</a>
          </nav>
          <div>© {new Date().getFullYear()} Concillio</div>
        </div>
      </footer>

      {/* Minimal JS: mobile menu + smooth scroll (CSP tillåter inline i er policy) */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){
            var ovl = document.getElementById('m-ovl');
            var open = document.getElementById('hamburger');
            var close = document.getElementById('closeOverlay');
            function openO(){ ovl.classList.add('open'); open.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
            function closeO(){ ovl.classList.remove('open'); open.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
            open && open.addEventListener('click', openO);
            close && close.addEventListener('click', closeO);
            ovl && ovl.addEventListener('click', function(e){ if(e.target===ovl) closeO(); });
            window.addEventListener('keydown', function(e){ if(e.key==='Escape' && ovl && ovl.classList.contains('open')) closeO(); });

            document.querySelectorAll('a[data-scroll][href^="#"]').forEach(function(a){
              a.addEventListener('click', function(e){
                var id = a.getAttribute('href').slice(1);
                var el = document.getElementById(id);
                if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
              });
            });
          })();
        `
      }} />
    </main>
  )
})

export default home
