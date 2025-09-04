import { Hono } from 'hono'
import { aesGcmEncrypt } from '../utils/crypto'

const router = new Hono()

// Basic seed (legacy example, SV draft)
router.post('/admin/seed-concillio-core', async (c) => {
  const DB = c.env.DB as D1Database
  const keys = c.env.PROMPT_KMS_KEYS as string
  const keyMap = JSON.parse(keys || '{}')
  const b64 = keyMap['1']
  if (!b64) return c.text('Missing KMS key v1', 500)

  const packSlug = 'concillio-core'
  const packName = 'Concillio Core'
  const version = '1.0.0'
  const locale = 'sv-SE'

  await DB.prepare("INSERT OR IGNORE INTO prompt_packs (slug, name) VALUES (?, ?)").bind(packSlug, packName).run()
  const pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(packSlug).first<any>()

  await DB.prepare("INSERT OR IGNORE INTO prompt_versions (pack_id, version, locale, status) VALUES (?, ?, ?, 'draft')").bind(pack.id, version, locale).run()
  const ver = await DB.prepare('SELECT id FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?').bind(pack.id, version, locale).first<any>()

  const entries = [
    { role: 'BASE', system: 'Du är del av Concillios råd. Svara formellt och koncist.', user: 'Ärende: {{question}}\nKontext: {{context}}', params: { temperature: 0.3, response_format: 'json_object' }, allowed: ['question','context','roles_json','goals','constraints'] },
    { role: 'STRATEGIST', system: 'Chief Strategist. Fokus: 2–3 år, beroenden, trade-offs.', user: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed: ['question','context'] },
    { role: 'FUTURIST', system: 'Futurist. Scenarier: optimistisk/bas/pessimistisk.', user: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed: ['question','context'] },
    { role: 'PSYCHOLOGIST', system: 'Behavioral Psychologist. Biaser, motivation, regret.', user: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed: ['question','context'] },
    { role: 'ADVISOR', system: 'Senior Advisor. Sammanvägning, pragmatism.', user: 'Fråga: {{question}}\nKontext: {{context}}', params: {}, allowed: ['question','context'] },
    { role: 'CONSENSUS', system: 'Sammanställ rådets huvudpunkter och leverera ett ceremoniellt Council Consensus.', user: 'Input: {{roles_json}}', params: { response_format: 'json_object' }, allowed: ['roles_json'] }
  ]

  for (const e of entries) {
    const sysEnc = await aesGcmEncrypt(e.system, b64)
    const usrEnc = await aesGcmEncrypt(e.user, b64)
    await DB.prepare(`INSERT OR REPLACE INTO prompt_entries (version_id, role, system_prompt_enc, user_template_enc, params_json, allowed_placeholders, model_params_json, entry_hash, encryption_key_version, schema_version)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 1, '1')`)
      .bind(ver.id, e.role, sysEnc, usrEnc, JSON.stringify(e.params||{}), JSON.stringify(e.allowed))
      .run()
  }

  return c.json({ ok: true, pack_id: pack.id, version_id: ver.id, entries: entries.length })
})

// Exceptional mode seed: accepts a JSON payload with one field per role
// Body:
// {
//   "version": "v2-exceptional",   // optional, default v2-exceptional
//   "locale": "en-US",             // optional, default en-US
//   "status": "draft",             // optional, draft|active
//   "entries": {                    // REQUIRED mapping of role -> system prompt
//     "STRATEGIST": "...",
//     "FUTURIST": "...",
//     "PSYCHOLOGIST": "...",
//     "ADVISOR": "...",
//     "SUMMARIZER": "..."          // mapped to DB role CONSENSUS
//   }
// }
router.post('/admin/seed-concillio-core-exceptional', async (c) => {
  const DB = c.env.DB as D1Database
  const keys = c.env.PROMPT_KMS_KEYS as string
  const keyMap = JSON.parse(keys || '{}')
  const b64 = keyMap['1']
  if (!b64) return c.text('Missing KMS key v1', 500)

  type Payload = {
    version?: string
    locale?: string
    status?: 'draft'|'active'
    entries?: Record<string, string>
    actor?: string
  }
  const body = await c.req.json<Payload>().catch(()=>null)
  if (!body || !body.entries) return c.text('Bad Request', 400)

  const version = body.version || 'v2-exceptional'
  const locale = body.locale || 'en-US'
  const status = body.status || 'draft'

  const packSlug = 'concillio-core'
  const packName = 'Concillio Core'

  await DB.prepare("INSERT OR IGNORE INTO prompt_packs (slug, name) VALUES (?, ?)").bind(packSlug, packName).run()
  const pack = await DB.prepare('SELECT id FROM prompt_packs WHERE slug = ?').bind(packSlug).first<any>()

  await DB.prepare("INSERT OR IGNORE INTO prompt_versions (pack_id, version, locale, status, metadata_json) VALUES (?, ?, ?, ?, ?)")
    .bind(pack.id, version, locale, status, JSON.stringify({ created_by: body.actor || 'seed' })).run()
  const ver = await DB.prepare('SELECT id FROM prompt_versions WHERE pack_id = ? AND version = ? AND locale = ?')
    .bind(pack.id, version, locale).first<any>()

  // Default BASE (ensures response_format json and common placeholders)
  const base = {
    role: 'BASE',
    system: 'You are a member of the Concillio Council. Always reply with valid JSON only (no prose).',
    user: 'Question: {{question}}\nContext: {{context}}',
    params: { temperature: 0.3, response_format: 'json_object' },
    allowed: ['question','context','roles_json','strategist_json','futurist_json','psychologist_json','advisor_json','goals','constraints']
  }

  // Build per-role definitions from payload
  const E = body.entries || {}
  const perRole = [
    {
      role: 'STRATEGIST',
      system: E['STRATEGIST'] || 'You are the STRATEGIST.',
      user: 'Question: {{question}}\nContext: {{context}}',
      allowed: ['question','context'],
      params: {}
    },
    {
      role: 'FUTURIST',
      system: E['FUTURIST'] || 'You are the FUTURIST.',
      user: 'Question: {{question}}\nContext: {{context}}',
      allowed: ['question','context'],
      params: {}
    },
    {
      role: 'PSYCHOLOGIST',
      system: E['PSYCHOLOGIST'] || 'You are the PSYCHOLOGIST.',
      user: 'Question: {{question}}\nContext: {{context}}',
      allowed: ['question','context'],
      params: {}
    },
    {
      role: 'ADVISOR',
      system: E['ADVISOR'] || 'You are the ADVISOR.',
      // Advisor distills from other roles; accept roles_json by default
      user: 'Input roles: {{roles_json}}',
      allowed: ['roles_json'],
      params: {}
    },
    {
      role: 'CONSENSUS',
      system: E['SUMMARIZER'] || E['CONSENSUS'] || 'You are the EXECUTIVE SUMMARIZER.',
      user: 'Here are the role outputs (JSON):\n- Strategist: {{strategist_json}}\n- Futurist: {{futurist_json}}\n- Psychologist: {{psychologist_json}}\n- Advisor (bullets_by_role): {{advisor_json}}\n\nDecision context:\n{{question}}\n{{context}}\n\nProduce the final consensus JSON following your schema and rules.',
      allowed: ['question','context','strategist_json','futurist_json','psychologist_json','advisor_json'],
      params: { response_format: 'json_object' }
    }
  ]

  // Upsert BASE first
  {
    const sysEnc = await aesGcmEncrypt(base.system, b64)
    const usrEnc = await aesGcmEncrypt(base.user, b64)
    await DB.prepare(`INSERT OR REPLACE INTO prompt_entries (version_id, role, system_prompt_enc, user_template_enc, params_json, allowed_placeholders, model_params_json, entry_hash, encryption_key_version, schema_version)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 1, '1')`)
      .bind(ver.id, base.role, sysEnc, usrEnc, JSON.stringify(base.params||{}), JSON.stringify(base.allowed))
      .run()
  }

  // Upsert each role
  for (const e of perRole) {
    const sysEnc = await aesGcmEncrypt(e.system, b64)
    const usrEnc = await aesGcmEncrypt(e.user, b64)
    await DB.prepare(`INSERT OR REPLACE INTO prompt_entries (version_id, role, system_prompt_enc, user_template_enc, params_json, allowed_placeholders, model_params_json, entry_hash, encryption_key_version, schema_version)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 1, '1')`)
      .bind(ver.id, e.role, sysEnc, usrEnc, JSON.stringify(e.params||{}), JSON.stringify(e.allowed))
      .run()
  }

  return c.json({ ok: true, pack_id: pack.id, version_id: ver.id, entries: 1 + perRole.length, version, locale, status })
})

export default router
