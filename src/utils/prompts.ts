import { sha256Hex } from './crypto'

export type Role =
  | 'BASE'
  | 'STRATEGIST'
  | 'FUTURIST'
  | 'PSYCHOLOGIST'
  | 'ADVISOR'            // legacy name for Senior Advisor in v1 packs
  | 'SENIOR_ADVISOR'     // v2 name
  | 'RISK_COMPLIANCE_OFFICER'
  | 'CFO_ANALYST'
  | 'CUSTOMER_ADVOCATE'
  | 'INNOVATION_CATALYST'
  | 'DATA_SCIENTIST'
  | 'LEGAL_ADVISOR'
  | 'CONSENSUS'          // legacy summarizer role name in v1 packs
  | 'SUMMARIZER'         // v2 summarizer role name

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
    const allowedRaw = env[prefix + role + '__ALLOWED']
    const paramsRaw = env[prefix + role + '__PARAMS']
    const cur = map.get(role) || { role, system_prompt: '', user_template: '' }
    let allowed_placeholders = cur.allowed_placeholders
    let params = cur.params
    try { if (allowedRaw) allowed_placeholders = JSON.parse(allowedRaw) } catch {}
    try { if (paramsRaw) params = JSON.parse(paramsRaw) } catch {}
    if (sys || usr || allowedRaw || paramsRaw) {
      map.set(role, {
        role,
        system_prompt: sys ?? cur.system_prompt,
        user_template: usr ?? cur.user_template,
        params,
        allowed_placeholders
      } as PromptEntry)
    }
  }
  return { ...pack, entries: Array.from(map.values()) }
}

export function renderTemplate(tpl: string, data: Record<string, string>, allowed: string[]) {
  const allow = Array.isArray(allowed) && allowed.length ? allowed : Object.keys(data)
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => allow.includes(k) ? (data[k] ?? '') : '')
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

async function loadFromDB(env: any, packSlug: string, locale: string, pinnedVersion?: string): Promise<PromptPack | null> {
  const DB = env.DB as D1Database | undefined
  if (!DB) return null
  try {
    // select pack
    const packRow = await DB.prepare('SELECT id, slug, name FROM prompt_packs WHERE slug = ?').bind(packSlug).first<any>()
    if (!packRow) return null
    // select version
    let ver: any
    if (pinnedVersion) {
      ver = await DB.prepare('SELECT id, version, locale, status FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
        .bind(packRow.id, pinnedVersion, locale).first<any>()
    } else {
      ver = await DB.prepare("SELECT id, version, locale, status FROM prompt_versions WHERE pack_id = ? AND locale = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1")
        .bind(packRow.id, locale).first<any>()
    }
    if (!ver) return null
    const entries = await DB.prepare('SELECT role, system_prompt_enc, user_template_enc, params_json, allowed_placeholders, model_params_json, entry_hash, encryption_key_version FROM prompt_entries WHERE version_id = ?')
      .bind(ver.id).all<any>()
    const keyMapStr = env.PROMPT_KMS_KEYS || '{}'
    const keyMap = JSON.parse(keyMapStr as string)
    const { aesGcmDecrypt } = await import('./crypto')
    const outEntries: PromptEntry[] = []
    for (const e of entries.results) {
      const kver = e.encryption_key_version || env.PROMPT_KMS_ACTIVE_VERSION || '1'
      const b64Key = keyMap[String(kver)]
      if (!b64Key) {
        // cannot decrypt -> skip to avoid leaking
        continue
      }
      const system_prompt = await aesGcmDecrypt(e.system_prompt_enc, b64Key)
      const user_template = await aesGcmDecrypt(e.user_template_enc, b64Key)
      const params = e.params_json ? JSON.parse(e.params_json) : undefined
      const allowed_placeholders = e.allowed_placeholders ? JSON.parse(e.allowed_placeholders) : undefined
      outEntries.push({ role: e.role, system_prompt, user_template, params, allowed_placeholders })
    }
    return {
      pack: { slug: packRow.slug, name: packRow.name },
      version: ver.version,
      locale: ver.locale,
      entries: outEntries
    }
  } catch (err: any) {
    const msg = String(err?.message || err || '')
    if (msg.includes('no such table')) {
      // Missing tables (common locally before migrations) -> allow file fallback
      return null
    }
    // For any other D1 error, also degrade to file fallback instead of 500
    return null
  }
}

// v2 plaintext loader (prompt_packs_v2 + prompt_pack_entries)
async function loadFromDBV2(env: any, packName: string, locale: string, pinnedVersion?: string): Promise<PromptPack | null> {
  const DB = env.DB as D1Database | undefined
  if (!DB) return null
  try {
    const packRow = await DB.prepare(
      `SELECT id, name, locale, status FROM prompt_packs_v2 WHERE name = ? AND locale = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(packName, locale).first<any>()
    if (!packRow || (packRow.status !== 'active' && !pinnedVersion)) return null

    // Determine version to use
    let versionRow: any
    if (pinnedVersion) {
      versionRow = { version: pinnedVersion }
    } else {
      versionRow = await DB.prepare(
        `SELECT version FROM prompt_pack_entries WHERE pack_id = ? ORDER BY created_at DESC LIMIT 1`
      ).bind(packRow.id).first<any>()
    }
    const version = versionRow?.version || 'v1'

    const entries = await DB.prepare(
      `SELECT role_key AS role, system_template AS system_prompt, user_template, version FROM prompt_pack_entries WHERE pack_id = ? AND version = ?`
    ).bind(packRow.id, version).all<any>()

    const outEntries: PromptEntry[] = []
    for (const e of (entries.results || [])) {
      // Auto-detect placeholders as allowed if not explicitly specified
      const placeholders = Array.from((e.user_template || '').matchAll(/\{\{(\w+)\}\}/g)).map((m: any) => m[1])
      outEntries.push({
        role: e.role,
        system_prompt: e.system_prompt,
        user_template: e.user_template || '',
        allowed_placeholders: placeholders,
        params: {}
      })
    }

    // Inject a sensible BASE entry if not present
    const hasBase = outEntries.some(e => e.role === 'BASE')
    if (!hasBase) {
      outEntries.unshift({
        role: 'BASE',
        system_prompt: locale === 'en-US'
          ? 'You are part of Concillio’s executive council. Answer formally, concisely, and STRICTLY in valid JSON.'
          : 'Du är del av Concillios råd. Svara formellt, koncist och ENDAST i giltig JSON.',
        user_template: '',
        params: { temperature: 0.3 },
        allowed_placeholders: ['question','context','roles_json','advisor_json','weights','pre_consensus_signals','goals','constraints']
      })
    }

    return {
      pack: { slug: packName, name: packName },
      version,
      locale: packRow.locale,
      entries: outEntries
    }
  } catch (err) {
    return null
  }
}

function fileFallback(): PromptPack {
  return {
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

export async function loadPromptPack(cEnv: any, packSlug: string, locale: string, pinnedVersion?: string): Promise<PromptPack> {
  // Try v2 plaintext first, then legacy encrypted, then file fallback
  const dbPackV2 = await loadFromDBV2(cEnv, packSlug, locale, pinnedVersion)
  const dbPack = dbPackV2 ?? await loadFromDB(cEnv, packSlug, locale, pinnedVersion)
  const chosen = dbPack ?? fileFallback()

  const envHash = await envOverrideHash(cEnv, chosen.pack.slug, chosen.locale)
  const key = stableKey(chosen.pack.slug, chosen.locale, chosen.version, await envHash)
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.data

  // ENV overrides are disabled: D1 governs fully
  const patched = chosen
  cache.set(key, { at: now, data: patched })
  return patched
}

export async function computePackHash(pack: PromptPack): Promise<string> {
  const parts: string[] = []
  for (const e of pack.entries) {
    parts.push(await computePromptHash(e))
  }
  return 'sha256:' + await sha256Hex(parts.join('|') + `@${pack.version}/${pack.locale}`)
}
