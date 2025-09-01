import { Hono } from 'hono'
import { aesGcmEncrypt } from '../utils/crypto'

const router = new Hono()

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

export default router
