import { Hono } from 'hono'
import type { FC } from 'hono/jsx'
import { rolesDocs as rolesRaw } from '../content/roles'
import { lineups as lineupsRaw } from '../content/lineups'

const Docs = new Hono()

// Map existing content to the simple shapes expected by this view
const roles = rolesRaw.map((r) => ({
  name: r.name?.sv || '',
  intro: r.intro?.sv || '',
  huvudansvar: Array.isArray((r as any)?.huvudansvar?.sv) ? (r as any).huvudansvar.sv : [],
  dynamik: Array.isArray((r as any)?.dynamik?.sv) ? (r as any).dynamik.sv : [],
}))

const lineups = lineupsRaw.map((l: any) => ({
  name: l.name?.sv || '',
  intro: l.intro?.sv || '',
  composition: Array.isArray(l.composition) ? l.composition.map((c: any) => ({
    role_key: String(c.role_key || ''),
    weight: Number(c.weight) || 0,
    note: c?.note?.sv ? String(c.note.sv) : ''
  })) : [],
  karfnunktion: l?.coreFunction?.sv ? [ String(l.coreFunction.sv) ] : [],
  dynamik: Array.isArray(l?.dynamics?.sv) ? l.dynamics.sv : [],
  mestVardefullVid: Array.isArray(l?.bestFor?.sv) ? l.bestFor.sv : [],
}))

// ---- Shared UI bits ---------------------------------------------------------
const Layout: FC<{ title: string; children: any }> = ({ title, children }) => (
  <html lang="sv">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} · Concillio</title>
      {/* Tailwind via CDN (matchar er befintliga setup) */}
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-50 text-slate-900">
      <header class="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <a href="/" class="font-semibold tracking-tight text-slate-900">Concillio</a>
          <nav class="ml-auto flex items-center gap-2 text-sm">
            <a class="px-3 py-1.5 rounded-lg hover:bg-slate-100" href="/docs/roller">Roller</a>
            <a class="px-3 py-1.5 rounded-lg hover:bg-slate-100" href="/docs/lineups">Line-ups</a>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer class="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Concillio. Baseline-vikter kan justeras dynamiskt av heuristiken beroende på fråga och kontext.</p>
      </footer>
    </body>
  </html>
)

// ---- Roller ----------------------------------------------------------------
const RoleCard: FC<{
  name: string
  intro: string
  huvudansvar: string[]
  dynamik: string[]
}> = ({ name, intro, huvudansvar, dynamik }) => (
  <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6">
    <h3 class="text-lg font-semibold tracking-tight text-slate-900">{name}</h3>
    <p class="mt-2 text-slate-700">{intro}</p>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <h4 class="text-sm font-semibold text-slate-900">Huvudansvar</h4>
        <ul class="mt-2 list-disc pl-5 space-y-1.5 text-slate-700">
          {huvudansvar.map((x) => (<li>{x}</li>))}
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-slate-900">Dynamik</h4>
        <ul class="mt-2 list-disc pl-5 space-y-1.5 text-slate-700">
          {dynamik.map((x) => (<li>{x}</li>))}
        </ul>
      </div>
    </div>
  </section>
)

Docs.get('/docs/roller', (c) => {
  return c.html(
    <Layout title="Roller">
      <header class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Roller</h1>
        <p class="mt-2 text-slate-700 text-sm md:text-base">
          Våra specialiserade roller. Varje roll beskriver <em>Huvudansvar</em> (vad den levererar)
          och <em>Dynamik</em> (hur den arbetar och samspelar).
        </p>
      </header>

      <div class="grid gap-4 md:gap-6">
        {roles.map((r) => (
          <RoleCard
            name={r.name}
            intro={r.intro}
            huvudansvar={r.huvudansvar}
            dynamik={r.dynamik}
          />
        ))}
      </div>
    </Layout>
  )
})

// ---- Line-ups ---------------------------------------------------------------
const pct = (w: number) => `${Math.round(w * 100)}%`

const Pill: FC<{ children: any }> = ({ children }) => (
  <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
    {children}
  </span>
)

const LineupCard: FC<{
  name: string
  intro: string
  composition: { role_key: string; weight: number; note: string }[]
  karfnunktion: string[]
  dynamik: string[]
  mestVardefullVid: string[]
}> = ({ name, intro, composition, karfnunktion, dynamik, mestVardefullVid }) => (
  <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6">
    <h3 class="text-lg font-semibold tracking-tight text-slate-900">{name}</h3>
    <p class="mt-2 text-slate-700">{intro}</p>

    <div class="mt-4">
      <h4 class="text-sm font-semibold text-slate-900">Rollsammansättning</h4>
      <ul class="mt-2 grid gap-2 md:grid-cols-2">
        {composition.map((r) => (
          <li class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="font-medium text-slate-900">{r.role_key}</div>
              <Pill>{pct(r.weight)}</Pill>
            </div>
            {r.note ? <p class="mt-1 text-sm text-slate-700">{r.note}</p> : null}
          </li>
        ))}
      </ul>
      <p class="mt-2 text-xs text-slate-500">
        Visade procent är baseline. Vikter kan finjusteras dynamiskt baserat på fråga/kontext.
      </p>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div>
        <h4 class="text-sm font-semibold text-slate-900">Kärnfunktion</h4>
        <ul class="mt-2 list-disc pl-5 space-y-1.5 text-slate-700">
          {karfnunktion.map((x) => (<li>{x}</li>))}
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-slate-900">Dynamik</h4>
        <ul class="mt-2 list-disc pl-5 space-y-1.5 text-slate-700">
          {dynamik.map((x) => (<li>{x}</li>))}
        </ul>
      </div>
    </div>

    <div class="mt-4">
      <h4 class="text-sm font-semibold text-slate-900">Mest värdefull vid</h4>
      <ul class="mt-2 list-disc pl-5 space-y-1.5 text-slate-700">
        {mestVardefullVid.map((x) => (<li>{x}</li>))}
      </ul>
    </div>
  </section>
)

Docs.get('/docs/lineups', (c) => {
  return c.html(
    <Layout title="Line-ups">
      <header class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Line-ups</h1>
        <p class="mt-2 text-slate-700 text-sm md:text-base">
          Våra förkonfigurerade line-ups med <em>baseline-vikter</em>. I konsultationen kan vikter
          justeras heuristiskt utifrån din fråga och kontext.
        </p>
      </header>

      <div class="grid gap-4 md:gap-6">
        {lineups.map((l) => (
          <LineupCard
            name={l.name}
            intro={l.intro}
            composition={l.composition}
            karfnunktion={l.karfnunktion}
            dynamik={l.dynamik}
            mestVardefullVid={l.mestVardefullVid}
          />
        ))}
      </div>
    </Layout>
  )
})

export default Docs
