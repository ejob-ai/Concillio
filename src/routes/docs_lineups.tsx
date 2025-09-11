// src/routes/docs_lineups.tsx
import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { LINEUPS } from '../content/lineups';
import { ROLES } from '../content/roles';

function pct(n: number) { return Math.round(n * 100); }
function roleName(key: string) {
  const r = ROLES.find(x => x.key === key);
  return r ? r.name : key;
}

const Page: FC = () => {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <title>Line-ups — Concillio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body class="bg-gray-50 text-gray-900">
        <div class="max-w-3xl mx-auto px-5 py-6">
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
                <a href={`#${l.slug}`} class="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">
                  {l.name}
                </a>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div class="space-y-6">
            {LINEUPS.map(l => (
              <section id={l.slug} class="rounded-2xl bg-white border p-5">
                <h2 class="text-xl font-semibold">{l.name}</h2>
                <p class="mt-1 text-gray-700">{l.intro}</p>

                <div class="mt-4">
                  <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Rollsammansättning</div>
                  <div class="space-y-2">
                    {l.composition
                      .slice()
                      .sort((a,b)=>a.position-b.position)
                      .map(r => (
                      <div class="flex items-center gap-3">
                        <div class="w-28 shrink-0">
                          <a class="underline text-sm" href={`/docs/roller#${(ROLES.find(x=>x.key===r.role_key)?.slug)||r.role_key.toLowerCase()}`}>
                            {r.role_key}
                          </a>
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

                <div class="mt-4">
                  <a href="/docs/roller" class="text-sm underline">Läs om rollerna</a>
                </div>
              </section>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
};

const app = new Hono();
app.get('/docs/lineups', c => c.html(<Page />));
export default app;
