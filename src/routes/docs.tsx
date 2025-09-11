// src/routes/docs.tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { ROLES } from '../content/roles'
import { LINEUPS } from '../content/lineups'

const pct = (n: number) => Math.round(n * 100)
const roleByKey = (key: string) => ROLES.find(r => r.key === key)
const roleSlug = (key: string) => roleByKey(key)?.slug || key.toLowerCase()
const roleName = (key: string) => roleByKey(key)?.name || key

const Shell: FC<{ title: string; children: any }> = ({ title, children }) => (
  <html lang="sv">
    <head>
      <meta charSet="utf-8" />
      <title>{title} — Concillio</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Concillio – Roller och Line-ups. Referens, vägledning och kompositioner." />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Tailwind via CDN redan tillåtet i din CSP */}
    </head>
    <body class="bg-neutral-50 text-neutral-900 antialiased">
      <a id="top" />
      <header class="bg-white/70 backdrop-blur border-b sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <a href="/" class="text-sm font-medium hover:underline">← Hem</a>
          <nav class="hidden sm:flex items-center gap-4 text-sm">
            <a class="hover:underline" href="/docs/roller">Roller</a>
            <a class="hover:underline" href="/docs/lineups">Line-ups</a>
          </nav>
        </div>
      </header>
      <main class="max-w-6xl mx-auto px-5 py-8">
        {children}
      </main>
      <footer class="max-w-6xl mx-auto px-5 pb-10 text-xs text-neutral-500">
        <div class="border-t pt-6">© {new Date().getFullYear()} Concillio</div>
      </footer>
    </body>
  </html>
)

/* ---------- UI helpers ---------- */
const SectionTitle: FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div class="mb-6">
    <h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
    {subtitle && <p class="mt-2 text-neutral-600">{subtitle}</p>}
  </div>
)

const Divider: FC = () => <hr class="my-8 border-neutral-200" />

const Card: FC<{ children: any; tone?: 'default' | 'muted' }> = ({ children, tone = 'default' }) => (
  <section class={`rounded-2xl border ${tone==='muted' ? 'bg-neutral-50' : 'bg-white'} p-5 shadow-sm`} >
    {children}
  </section>
)

const Badge: FC<{ children: any }> = ({ children }) => (
  <span class="inline-flex items-center rounded-full border px-2 py-[2px] text-xs font-medium bg-white">
    {children}
  </span>
)

const PercentBar: FC<{ value: number }> = ({ value }) => (
  <div class="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
    <div class="h-full bg-neutral-900" style={{ width: `${pct(value)}%` }} />
  </div>
)

const Kicker: FC<{ children: any }> = ({ children }) => (
  <div class="text-[11px] uppercase tracking-wide text-neutral-500">{children}</div>
)

/* ---------- Pages ---------- */
const RolesPage: FC = () => (
  <Shell title="Roller">
    {/* Hero */}
    <div class="mb-8">
      <SectionTitle
        title="Roller"
        subtitle="Översikt av rådets 10 roller och hur de samspelar. Varje roll har tydligt huvudansvar och kompletterande dynamik." />
      <div class="flex gap-2 flex-wrap">
        <Badge>JSON-kontrakt</Badge>
        <Badge>Beslutsstöd</Badge>
        <Badge>Scenario & risk</Badge>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Sticky TOC */}
      <aside class="lg:sticky lg:top-20 h-max">
        <Card tone="muted">
          <Kicker>Innehåll</Kicker>
          <nav class="mt-3 space-y-1">
            {ROLES.map(r => (
              <a href={`#${r.slug}`} class="block text-sm px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border">
                {r.name}
              </a>
            ))}
          </nav>
        </Card>
      </aside>

      {/* Content */}
      <div class="space-y-6">
        {ROLES.map(r => (
          <Card>
            <a id={r.slug} />
            <div class="flex items-start justify-between gap-4">
              <h2 class="text-xl font-semibold">{r.name}</h2>
              <a href="#top" class="text-xs text-neutral-500 hover:underline">Till toppen ↑</a>
            </div>
            <p class="mt-1 text-neutral-700">{r.intro}</p>

            <Divider />

            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <Kicker>Huvudansvar</Kicker>
                <ul class="mt-2 list-disc pl-5 space-y-1">
                  {r.huvudansvar.map(x => <li>{x}</li>)}
                </ul>
              </div>
              <div>
                <Kicker>Dynamik</Kicker>
                <ul class="mt-2 list-disc pl-5 space-y-1">
                  {r.dynamik.map(x => <li>{x}</li>)}
                </ul>
              </div>
            </div>

            <div class="mt-4">
              <a class="text-sm underline" href="/docs/lineups">Se line-ups där denna roll förekommer</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </Shell>
)

const LineupsPage: FC = () => (
  <Shell title="Line-ups">
    {/* Hero */}
    <div class="mb-8">
      <SectionTitle
        title="Line-ups"
        subtitle="Referens-line-ups för olika beslutssituationer. Visade procent är baseline – heuristik kan justera dynamiskt baserat på fråga/kontext." />
      <div class="flex gap-2 flex-wrap">
        <Badge>Baseline-vikter</Badge>
        <Badge>Heuristisk finjustering</Badge>
        <Badge>Spårbarhet</Badge>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Sticky TOC */}
      <aside class="lg:sticky lg:top-20 h-max">
        <Card tone="muted">
          <Kicker>Innehåll</Kicker>
          <nav class="mt-3 space-y-1">
            {LINEUPS.map(l => (
              <a href={`#${l.slug}`} class="block text-sm px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border">
                {l.name}
              </a>
            ))}
          </nav>
        </Card>
      </aside>

      {/* Content */}
      <div class="space-y-6">
        {LINEUPS.map(l => (
          <Card>
            <a id={l.slug} />
            <div class="flex items-start justify-between gap-4">
              <h2 class="text-xl font-semibold">{l.name}</h2>
              <a href="#top" class="text-xs text-neutral-500 hover:underline">Till toppen ↑</a>
            </div>
            <p class="mt-1 text-neutral-700">{l.intro}</p>

            <Divider />

            {/* Composition */}
            <div>
              <Kicker>Rollsammansättning (baseline)</Kicker>
              <div class="mt-3 space-y-2">
                {l.composition.slice().sort((a,b)=>a.position-b.position).map(r => (
                  <div class="flex items-center gap-3">
                    <div class="w-44 shrink-0">
                      <a class="underline text-sm" href={`/docs/roller#${roleSlug(r.role_key)}`}>{roleName(r.role_key)}</a>
                    </div>
                    <div class="flex-1">
                      <PercentBar value={r.weight} />
                    </div>
                    <div class="w-16 text-right text-sm tabular-nums">{pct(r.weight)}%</div>
                  </div>
                ))}
              </div>
              {(l as any).composition_note && (
                <p class="mt-2 text-xs text-neutral-500">{(l as any).composition_note}</p>
              )}
            </div>

            <Divider />

            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <Kicker>Kärnfunktion</Kicker>
                <ul class="mt-2 list-disc pl-5 space-y-1">
                  {l.karna.map(x => <li>{x}</li>)}
                </ul>
              </div>
              <div>
                <Kicker>Dynamik</Kicker>
                <ul class="mt-2 list-disc pl-5 space-y-1">
                  {l.dynamik.map(x => <li>{x}</li>)}
                </ul>
              </div>
            </div>

            <div class="mt-4">
              <Kicker>Mest värdefull vid</Kicker>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                {l.best_for.map(x => <li>{x}</li>)}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </Shell>
)

const app = new Hono()
app.get('/docs', c => c.redirect('/docs/roller'))
app.get('/docs/roller', c => c.html(<RolesPage />))
app.get('/docs/lineups', c => c.html(<LineupsPage />))
export default app
