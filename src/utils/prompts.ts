import { sha256Hex } from './crypto'

export type Role = 'BASE' | 'STRATEGIST' | 'FUTURIST' | 'PSYCHOLOGIST' | 'ADVISOR' | 'CONSENSUS'

export interface PromptEntry {
  role: Role
  system_prompt: string
  user_template: string
  params?: Record<string, unknown>
  allowed_placeholders?: string[]
}

export interface PromptPack {
  pack: { slug: string; name: string }
  version: string
  locale: string
  entries: PromptEntry[]
}

export interface PromptMeta {
  pack_slug: string
  locale: string
  version: string
  prompt_hash: string // sha256 of system+user+params stringified
}

const CACHE_TTL_MS = 300_000
const cache = new Map<string, { at: number; data: PromptPack }>()

function stableKey(packSlug: string, locale: string, version: string, envHash: string) {
  return `prompt:${packSlug}:${locale}:${version}:${envHash}`
}

function envOverrideHash(env: Record<string, string | undefined>, packSlug: string, locale: string) {
  const prefix = `PROMPT_OVERRIDE__${packSlug.toUpperCase()}__${locale.toUpperCase()}__`
  const relevant = Object.keys(env)
    .filter(k => k.startsWith(prefix))
    .sort()
    .map(k => `${k}=${env[k]}`)
    .join('|')
  return relevant ? sha256Hex(relevant) : Promise.resolve('none')
}

export async function computePromptHash(entry: PromptEntry): Promise<string> {
  const base = JSON.stringify({
    system_prompt: entry.system_prompt,
    user_template: entry.user_template,
    params: entry.params || {},
    allowed_placeholders: entry.allowed_placeholders || []
  })
  const h = await sha256Hex(base)
  return `sha256:${h}`
}

export async function applyEnvOverrides(pack: PromptPack, env: Record<string, string | undefined>): Promise<PromptPack> {
  const prefix = 'PROMPT_OVERRIDE__' + pack.pack.slug.toUpperCase() + '__' + pack.locale.toUpperCase() + '__'
  const map = new Map(pack.entries.map(e => [e.role, e]))
  const roles: Role[] = ['BASE','STRATEGIST','FUTURIST','PSYCHOLOGIST','ADVISOR','CONSENSUS']
  for (const role of roles) {
    const sys = env[prefix + role + '__SYSTEM']
    const usr = env[prefix + role + '__USER']
    if (sys || usr) {
      const cur = map.get(role) || { role, system_prompt: '', user_template: '' }
      map.set(role, {
        role,
        system_prompt: sys ?? cur.system_prompt,
        user_template: usr ?? cur.user_template,
        params: cur.params,
        allowed_placeholders: cur.allowed_placeholders
      } as PromptEntry)
    }
  }
  return { ...pack, entries: Array.from(map.values()) }
}

export function renderTemplate(tpl: string, data: Record<string, string>, allowed: string[]) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => allowed.includes(k) ? (data[k] ?? '') : '')
}

export function compileForRole(pack: PromptPack, role: Role, data: Record<string,string>) {
  const base = pack.entries.find(e => e.role === 'BASE')
  const r = pack.entries.find(e => e.role === role)
  if (!base || !r) throw new Error('Missing BASE or role entry')
  const system = [base.system_prompt, r.system_prompt].filter(Boolean).join('\n\n')
  const allowed = r.allowed_placeholders || []
  const user = renderTemplate(r.user_template, data, allowed)
  const params = { ...(base.params||{}), ...(r.params||{}) }
  return { system, user, params }
}

export async function loadPromptPack(cEnv: any, packSlug: string, locale: string, pinnedVersion?: string): Promise<PromptPack> {
  // For MVP: file-bundlad baseline pack (sv-SE)
  // TODO: add DB-backed loading with D1 as per design
  let filePack: PromptPack
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: JSON import assertion handled by bundler
    const mod = await import('../prompts/concillio-core/sv-SE/pack.json', { with: { type: 'json' } })
    filePack = mod.default as PromptPack
  } catch {
    // Minimal fallback
    filePack = {
      pack: { slug: 'concillio-core', name: 'Concillio Core' },
      version: '1.0.0',
      locale: 'sv-SE',
      entries: [
        { role: 'BASE', system_prompt: 'Du är del av Concillios råd. Svara formellt och koncist.', user_template: 'Ärende: {{question}}\nKontext: {{context}}', params: { temperature: 0.3, response_format: 'json_object' }, allowed_placeholders: ['question','context','roles_json','goals','constraints'] },
        { role: 'STRATEGIST', system_prompt: 'Chief Strategist. Fokus: 2–3 år, beroenden, trade-offs.', user_template: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed_placeholders: ['question','context'] },
        { role: 'FUTURIST', system_prompt: 'Futurist. Scenarier: optimistisk/bas/pessimistisk.', user_template: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed_placeholders: ['question','context'] },
        { role: 'PSYCHOLOGIST', system_prompt: 'Behavioral Psychologist. Biaser, motivation, regret.', user_template: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed_placeholders: ['question','context'] },
        { role: 'ADVISOR', system_prompt: 'Senior Advisor. Sammanvägning, pragmatism.', user_template: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed_placeholders: ['question','context'] },
        { role: 'CONSENSUS', system_prompt: 'Sammanställ rådets huvudpunkter och leverera ett ceremoniellt Council Consensus.', user_template: 'Input: {{roles_json}}', params: { response_format: 'json_object' }, allowed_placeholders: ['roles_json'] }
      ]
    }
  }

  const envHash = await envOverrideHash(cEnv, filePack.pack.slug, filePack.locale)
  const key = stableKey(filePack.pack.slug, filePack.locale, filePack.version, envHash)
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.data

  const patched = await applyEnvOverrides(filePack, cEnv)
  cache.set(key, { at: now, data: patched })
  return patched
}
