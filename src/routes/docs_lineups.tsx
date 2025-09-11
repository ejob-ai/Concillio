import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { lineups } from '../content/lineups'

const SUPPORTED_LANGS = ['sv','en'] as const
 type Lang = typeof SUPPORTED_LANGS[number]
function getLang(c:any): Lang {
  const q = c.req.query('lang') || c.req.query('locale')
  let lang = (q || getCookie(c,'lang') || 'sv').toLowerCase()
  if (!SUPPORTED_LANGS.includes(lang as any)) lang = 'sv'
  return lang as Lang
}

function L(lang: Lang){
  return lang==='en' ? {
    page_title: 'Line-ups',
    intro_note: 'Reference line-ups for different decision contexts.',
    sections: { intro: 'Introduction', comp: 'Role composition', core: 'Core function', dyn: 'Dynamics', best: 'Most valuable for' },
    baseline_note: 'Shown percentages are baseline. Weights can be tuned dynamically by heuristics based on your question/context.'
  } : {
    page_title: 'Line-ups',
    intro_note: 'Referens‑line‑ups för olika beslutssituationer.',
    sections: { intro: 'Introduktion', comp: 'Rollsammansättning', core: 'Kärnfunktion', dyn: 'Dynamik', best: 'Mest värdefull vid' },
    baseline_note: 'Visade procent är baseline. Vikter kan finjusteras dynamiskt av heuristik baserat på fråga/kontext.'
  }
}

const docsLineups = new Hono()

docsLineups.get('/docs/lineups', (c) => {
  const lang = getLang(c)
  const t = L(lang)
  c.set('head', { title: `Concillio – ${t.page_title}`, description: t.intro_note })
  const pct = (w:number) => Math.round(w*100)
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10">
      <header class="mb-6">
        <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{t.page_title}</h1>
        <p class="text-neutral-400 mt-1">{t.intro_note}</p>
        <p class="text-neutral-400 mt-1 italic text-sm">{t.baseline_note}</p>
      </header>

      <div class="space-y-6">
        {lineups.map((lu) => (
          <article class="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60">
            <h2 class="text-[var(--concillio-gold)] text-lg font-semibold mb-2">{lu.name[lang] || lu.name.sv}</h2>
            {/* Intro */}
            <section>
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.intro}</div>
              <p class="text-neutral-200 mt-1">{(lu.intro as any)[lang] || lu.intro.sv}</p>
            </section>
            {/* Composition */}
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.comp}</div>
              <ul class="mt-1 space-y-1 text-neutral-200 text-sm">
                {lu.composition.map((c2) => (
                  <li>
                    <span class="inline-block w-40">{c2.role_key.replace('_',' ')}</span>
                    <span class="inline-block font-semibold">{pct(c2.weight)}%</span>
                    {c2.note ? <span class="inline-block ml-2 text-neutral-400">{(c2.note as any)[lang] || c2.note.sv}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
            {/* Core function */}
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.core}</div>
              <p class="text-neutral-200 mt-1">{(lu.coreFunction as any)[lang] || lu.coreFunction.sv}</p>
            </section>
            {/* Dynamics */}
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.dyn}</div>
              <ul class="mt-1 list-disc list-inside text-neutral-200 text-sm">
                {((lu.dynamics as any)[lang] || lu.dynamics.sv || []).map((x:string)=>(<li>{x}</li>))}
              </ul>
            </section>
            {/* Best for */}
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.best}</div>
              <ul class="mt-1 list-disc list-inside text-neutral-200 text-sm">
                {((lu.bestFor as any)[lang] || lu.bestFor.sv || []).map((x:string)=>(<li>{x}</li>))}
              </ul>
            </section>
          </article>
        ))}
      </div>
    </main>
  )
})

export default docsLineups
