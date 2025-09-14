import { Hono } from 'hono'
import { renderer } from '../renderer'
import { Header } from '../components/Header'

const home = new Hono()
home.use(renderer)

// Liten ikon-helper (inline paths → inga externa assets)
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={d} fill="currentColor" />
  </svg>
)

home.get('/', (c) => {
  try { c.set('routeName', 'home:index') } catch {}

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
    <main id="mainContent" class="home-page min-h-screen bg-white text-slate-900">
      {/* Local tokens moved to /static/tailwind.css and /src/styles/components.css */}

      {/* NAV - already mounted globally in renderer; keep content header out here */}
      {/* <Header /> */}

      {/* HERO */}
      <section
        class="hero hero-gradient relative overflow-hidden"
      >
        <div class="wrap min-h-[78svh] flex items-center">
          <div class="mx-auto text-center max-w-[860px]">
            <p class="badge text-emerald-700/80">Concillio</p>
            <h1 class="font-['Crimson_Text',serif] text-4xl sm:text-6xl lg:text-7xl tracking-tight mt-2">
              Where wisdom convenes.
            </h1>
            <p class="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">Your personal council of minds, always ready.</p>
            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/council/ask" class="btn-gold">Enter Concillio</a>
              <a href="/docs/lineups" class="btn-outline">Want to know more?</a>
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
            <a class="btn-outline" href="/docs/lineups">Explore all line-ups</a>
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

      {/* Mobile menu logic moved to /static/menu.js; inline disabled for CSP */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function(){ /* disabled inline menu (moved to /static/menu.js) */ return;
            var burger   = document.getElementById('menu-trigger');
            var closeBtn = document.getElementById('menu-close');
            var overlay  = document.getElementById('site-menu-overlay');
            var panel    = document.getElementById('site-menu-panel');
            var main     = document.getElementById('mainContent');

            if (!overlay || !burger) return;

            // Startläge
            overlay.setAttribute('data-state','closed');
            overlay.setAttribute('aria-hidden','true');
            burger.setAttribute('aria-expanded','false');
            if (main) main.removeAttribute('inert');

            var lastFocus = null;
            var isiOS = /iP(ad|hone|od)/.test(navigator.platform)
                     || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
            var saved = { bodyPadRight:'', bodyPos:'', bodyTop:'', scrollY:0 };

            function sw(){ return window.innerWidth - document.documentElement.clientWidth; }

            function focusFirst(el){
              var q = el && el.querySelector('[autofocus],button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
              if (q) { try{ q.focus(); }catch(_){} return; }
              if (el && !el.hasAttribute('tabindex')) el.setAttribute('tabindex','-1');
              try{ el && el.focus(); }catch(_){ }
            }

            function setOpen(open){
              overlay.setAttribute('data-state', open ? 'open' : 'closed');
              overlay.setAttribute('aria-hidden', String(!open));
              burger.setAttribute('aria-expanded', String(open));
              document.body.classList.toggle('no-scroll', open);
              if (main) main.toggleAttribute('inert', open);

              if (open){
                saved.bodyPadRight = document.body.style.paddingRight || '';
                var w = sw(); if (w>0) document.body.style.paddingRight = w+'px';
                saved.scrollY = window.scrollY || 0;
                if (isiOS){ saved.bodyPos = document.body.style.position||''; saved.bodyTop = document.body.style.top||''; document.body.style.position='fixed'; document.body.style.top = (-saved.scrollY)+'px'; }
                lastFocus = document.activeElement;
                focusFirst(panel || overlay);
                document.addEventListener('keydown', onKeydown);
              } else {
                document.body.style.paddingRight = saved.bodyPadRight;
                if (isiOS){ document.body.style.position = saved.bodyPos; document.body.style.top = saved.bodyTop; window.scrollTo(0, saved.scrollY||0); }
                document.removeEventListener('keydown', onKeydown);
                if (lastFocus && lastFocus.focus) { try{ lastFocus.focus(); }catch(_){} }
              }
            }

            function onKeydown(e){
              if (e.key === 'Escape'){ setOpen(false); return; }
              if (e.key !== 'Tab') return;
              var scope = panel || overlay;
              var items = scope.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
              if (!items.length) return;
              var first = items[0], last = items[items.length-1];
              if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
            }

            burger.addEventListener('click', function(e){ e.preventDefault(); setOpen(true); });
            if (closeBtn) closeBtn.addEventListener('click', function(e){ e.preventDefault(); setOpen(false); });
            overlay.addEventListener('click', function(e){ if (e.target === overlay) setOpen(false); });
            document.addEventListener('visibilitychange', function(){ if (document.hidden) setOpen(false); });

            // Smooth scroll for internal anchors on this page
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
