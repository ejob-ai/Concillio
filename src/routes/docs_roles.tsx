import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { rolesDocs } from '../content/roles'

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
    page_title: 'Roles',
    intro_note: 'Overview of each council role and how they interact.',
    sections: { intro: 'Intro', huvudansvar: 'Main responsibilities', dynamik: 'Dynamics' }
  } : {
    page_title: 'Roller',
    intro_note: 'Översikt av varje rådets roll och hur de samspelar.',
    sections: { intro: 'Intro', huvudansvar: 'Huvudansvar', dynamik: 'Dynamik' }
  }
}

const docsRoles = new Hono()

docsRoles.get('/docs/roller', (c) => {
  const lang = getLang(c)
  const t = L(lang)
  c.set('head', { title: `Concillio – ${t.page_title}`, description: t.intro_note })
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10">
      <header class="mb-6">
        <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{t.page_title}</h1>
        <p class="text-neutral-400 mt-1">{t.intro_note}</p>
      </header>

      <div class="grid md:grid-cols-2 gap-6">
        {rolesDocs.map((r) => (
          <article class="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60">
            <h2 class="text-[var(--concillio-gold)] text-lg font-semibold mb-2">{r.name[lang] || r.name.sv}</h2>
            <section class="mt-2">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.intro}</div>
              <p class="text-neutral-200 mt-1">{(r.intro as any)[lang] || r.intro.sv}</p>
            </section>
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.huvudansvar}</div>
              <ul class="mt-1 list-disc list-inside text-neutral-200 text-sm">
                {((r.huvudansvar as any)[lang] || r.huvudansvar.sv || []).map((x:string) => <li>{x}</li>)}
              </ul>
            </section>
            <section class="mt-4">
              <div class="uppercase tracking-wider text-xs text-[var(--concillio-gold)]">{t.sections.dynamik}</div>
              <ul class="mt-1 list-disc list-inside text-neutral-200 text-sm">
                {((r.dynamik as any)[lang] || r.dynamik.sv || []).map((x:string) => <li>{x}</li>)}
              </ul>
            </section>
          </article>
        ))}
      </div>
    </main>
  )
})

export default docsRoles
