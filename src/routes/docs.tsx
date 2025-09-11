// src/routes/docs.tsx
import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { ROLES } from '../content/roles'
import { LINEUPS } from '../content/lineups'

function pct(n: number) { return Math.round(n * 100) }
const roleSlug = (key: string) => (ROLES.find(r => r.key === key)?.slug) || key.toLowerCase()

const Shell: FC<{ title: string; children: any }> = ({ title, children }) => (
  <html lang="sv">
    <head>
      <meta charSet="utf-8" />
      <title>{title} — Concillio</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Roller och line-ups i Concillio — referens och vägledning." />
    </head>
    <body class="bg-gray-50 text-gray-900">
      <a id="top" />
      <div class="max-w-3xl mx-auto px-5 py-6">
        {children}
      </div>
    </body>
  </html>
)

const RolesPage: FC = () => (
  <Shell title="Roller">
    <nav class="text-sm text-gray-600 mb-4">
      <a class="underline" href="/">Hem</a> <span class="mx-1">/</span>
      <span class="text-gray-800">Roller</span>
    </nav>

    <h1 class="text-2xl font-semibold mb-2">Roller</h1>
    <p class="text-sm text-gray-600 mb-6">Översikt av varje rådets roll och hur de samspelar.</p>

    {/* TOC */}
    <div class="mb-6 rounded-xl border bg-white p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Innehåll</div>
      <div class="flex flex-wrap gap-2">
        {ROLES.map(r => (
          <a href={`#${r.slug}`} class="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">{r.name}</a>
        ))}
      </div>
    </div>

    <div class="space-y-6">
      {ROLES.map(r => (
        <section id={r.slug} class="rounded-2xl bg-white border p-5">
          <h2 class="text-xl font-semibold">{r.name}</h2>
          <p class="mt-1 text-gray-700">{r.intro}</p>

          <div class="mt-4 grid md:grid-cols-2 gap-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500">Huvudansvar</div>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                {r.huvudansvar.map(x => <li>{x}</li>)}
              </ul>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500">Dynamik</div>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                {r.dynamik.map(x => <li>{x}</li>)}
              </ul>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-4">
            <a href="/docs/lineups" class="text-sm underline">Se line-ups</a>
            <a href="#top" class="text-xs text-gray-500 underline">Till toppen ↑</a>
          </div>
        </section>
      ))}
    </div>
  </Shell>
)

const LineupsPage: FC = () => (
  <Shell title="Line-ups">
    <nav class="text-sm text-gray-600 mb-4">
      <a class="underline" href="/">Hem</a> <span class="mx-1">/</span>
      <span class="text-gray-800">Line-ups</span>
    </nav>

    <h1 class="text-2xl font-semibold mb-2">Line-ups</h1>
    <p class="text-sm text-gray-600">Referens-line-ups för olika beslutssituationer.</p>
    <p class="text-xs text-gray-500 mb-6">
      Visade procent är <strong>baseline</strong>. Vikter kan finjusteras dynamiskt av heuristik baserat på fråga/kontext.
    </p>

    {/* TOC */}
    <div class="mb-6 rounded-xl border bg-white p-4">
      <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Innehåll</div>
      <div class="flex flex-wrap gap-2">
        {LINEUPS.map(l => (
          <a href={`#${l.slug}`} class="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">{l.name}</a>
        ))}
      </div>
    </div>

    <div class="space-y-6">
      {LINEUPS.map(l => (
        <section id={l.slug} class="rounded-2xl bg-white border p-5">
          <h2 class="text-xl font-semibold">{l.name}</h2>
          <p class="mt-1 text-gray-700">{l.intro}</p>

          <div class="mt-4">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Rollsammansättning</div>
            <div class="space-y-2">
              {l.composition.slice().sort((a,b)=>a.position-b.position).map(r => (
                <div class="flex items-center gap-3">
                  <div class="w-28 shrink-0">
                    <a class="underline text-sm" href={`/docs/roller#${roleSlug(r.role_key)}`}>{r.role_key}</a>
                  </div>
                  <div class="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                    <div class="h-2 bg-gray-800" style={{ width: `${pct(r.weight)}%` }} />
                  </div>
                  <div class="w-12 text-right text-sm tabular-nums">{pct(r.weight)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div class="mt-4 grid md:grid-cols-2 gap-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500">Kärnfunktion</div>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                {l.karna.map(x => <li>{x}</li>)}
              </ul>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500">Dynamik</div>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                {l.dynamik.map(x => <li>{x}</li>)}
              </ul>
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs uppercase tracking-wide text-gray-500">Mest värdefull vid</div>
            <ul class="mt-1 list-disc pl-5 space-y-1">
              {l.best_for.map(x => <li>{x}</li>)}
            </ul>
          </div>

          <div class="mt-4 flex items-center gap-4">
            <a href="/docs/roller" class="text-sm underline">Läs om rollerna</a>
            <a href="#top" class="text-xs text-gray-500 underline">Till toppen ↑</a>
          </div>
        </section>
      ))}
    </div>
  </Shell>
)

const app = new Hono()

// Samlad docs-ingång (valfritt: redirect till roller)
app.get('/docs', c => c.redirect('/docs/roller'))
app.get('/docs/roller', c => c.html(<RolesPage />))
app.get('/docs/lineups', c => c.html(<LineupsPage />))

export default app
