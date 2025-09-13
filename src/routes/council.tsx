import { Hono } from 'hono'
import { renderer } from '../renderer'

// Council sub-app: single source for /council pages
const council = new Hono()
council.use(renderer)

function getLang(c: any): 'sv' | 'en' {
  try {
    const url = new URL(c.req.url)
    const v = (url.searchParams.get('lang') || url.searchParams.get('locale') || 'sv').toLowerCase()
    return (v === 'en' ? 'en' : 'sv') as any
  } catch { return 'sv' }
}

// Intro page
council.get('/council', (c) => {
  const lang = getLang(c)
  const title = lang === 'sv' ? 'Rådet' : 'Council'
  const subtitle = lang === 'sv'
    ? 'Möt Concillio‑rådet: fyra kompletterande expertroller som syntetiserar dina svåraste beslut.'
    : 'Meet the Concillio council: four complementary expert roles synthesizing your toughest decisions.'
  try { c.set('head', { title: `Concillio – ${title}`, description: subtitle }) } catch {}
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10">
      <header class="mb-6">
        <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{title}</h1>
        <p class="text-neutral-400 mt-1">{subtitle}</p>
      </header>
      <div class="mt-6 flex gap-3 flex-wrap">
        <a class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[var(--gold)] text-white font-medium shadow" href={`/council/ask?lang=${lang}`}>
          {lang==='sv' ? 'Ställ din fråga' : 'Ask your question'}
        </a>
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-800 text-neutral-200" href={`/council/consensus?lang=${lang}`}>
          {lang==='sv' ? 'Se konsensus' : 'View consensus'}
        </a>
      </div>
    </main>
  )
})

// Consensus overview (placeholder; can be expanded)
council.get('/council/consensus', (c) => {
  const lang = getLang(c)
  const title = lang === 'sv' ? 'Rådets konsensus' : 'Council Consensus'
  try { c.set('head', { title: `Concillio – ${title}`, description: title }) } catch {}
  return c.render(
    <main class="min-h-screen container mx-auto px-6 py-10">
      <h1 class="font-['Playfair_Display'] text-3xl text-neutral-100">{title}</h1>
      <p class="text-neutral-400 mt-2">
        {lang==='sv' ? 'En ceremoniell, enig rekommendation baserad på flera roller.' : 'A ceremonial, unanimous recommendation synthesized from multiple roles.'}
      </p>
      <div class="mt-6">
        <a class="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-800 text-neutral-200" href={`/council?lang=${lang}`}>
          {lang==='sv' ? 'Tillbaka till Rådet' : 'Back to Council'}
        </a>
      </div>
    </main>
  )
})

export default council
