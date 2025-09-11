// src/routes/docs_roles.tsx
import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { ROLES } from '../content/roles';

const Page: FC = () => {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <title>Roller — Concillio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body class="bg-gray-50 text-gray-900">
        <div class="max-w-3xl mx-auto px-5 py-6">
          <h1 class="text-2xl font-semibold mb-2">Roller</h1>
          <p class="text-sm text-gray-600 mb-6">
            Översikt av varje rådets roll och hur de samspelar.
          </p>

          {/* TOC */}
          <div class="mb-6 rounded-xl border bg-white p-4">
            <div class="text-xs uppercase tracking-wide text-gray-500 mb-2">Innehåll</div>
            <div class="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <a href={`#${r.slug}`} class="text-sm px-3 py-1 rounded-full border hover:bg-gray-50">
                  {r.name}
                </a>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div class="space-y-6">
            {ROLES.map(r => (
              <section id={r.slug} class="rounded-2xl bg-white border p-5">
                <h2 class="text-xl font-semibold">{r.name}</h2>
                <p class="mt-1 text-gray-700">{r.intro}</p>

                <div class="mt-4 grid md:grid-cols-2 gap-4">
                  <div class="rounded-xl bg-gray-50 p-4">
                    <div class="text-xs uppercase tracking-wide text-gray-500">Huvudansvar</div>
                    <ul class="mt-2 list-disc pl-5 space-y-1">
                      {r.huvudansvar.map((x) => <li>{x}</li>)}
                    </ul>
                  </div>
                  <div class="rounded-xl bg-gray-50 p-4">
                    <div class="text-xs uppercase tracking-wide text-gray-500">Dynamik</div>
                    <ul class="mt-2 list-disc pl-5 space-y-1">
                      {r.dynamik.map((x) => <li>{x}</li>)}
                    </ul>
                  </div>
                </div>

                <div class="mt-4">
                  <a href="/docs/lineups" class="text-sm underline">Se line-ups</a>
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
app.get('/docs/roller', c => c.html(<Page />));
export default app;
