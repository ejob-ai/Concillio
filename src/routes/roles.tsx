import { Hono } from 'hono'
import { renderer } from '../renderer'
import { ROLE_KEYS } from '../content/roles'
import { ROLE_LABEL } from '../content/roleLabels'

const roles = new Hono()
roles.use(renderer)

roles.get('/roles', c => {
  c.set('head', { title: 'Concillio – Roles' })
  return c.render(
    <section class="container mx-auto px-4 py-12">
      <h1 class="font-serif text-4xl mb-6">Roles</h1>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_KEYS.map(k => (
          <li class="border rounded-xl p-4">
            <a class="font-semibold hover:underline" href={`/roles/${k.toLowerCase()}`}>{ROLE_LABEL[k]}</a>
          </li>
        ))}
      </ul>
    </section>
  )
})

roles.get('/roles/:key', c => {
  const key = (c.req.param('key') || '').toUpperCase()
  if (!ROLE_KEYS.includes(key as any)) return c.notFound()
  const title = ROLE_LABEL[key] || key
  c.set('head', { title: `Concillio – ${title}` })
  return c.render(
    <section class="container mx-auto px-4 py-12 prose max-w-3xl">
      <h1 class="font-serif">{title}</h1>
      <p class="text-slate-600">Overview of the {title} role: remit, strengths, and how it contributes to council consensus.</p>
      <h2>What this role brings</h2>
      <ul>
        <li>Perspective 1</li>
        <li>Perspective 2</li>
        <li>Perspective 3</li>
      </ul>
      <a class="btn-gold mt-6 inline-flex rounded-xl px-4 py-2" href="/council/ask">Run a Session</a>
    </section>
  )
})

export default roles
