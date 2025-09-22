// src/utils/email.ts
// Server-side email sending via Resend / SendGrid / Mailgun
// Choose provider based on which env var is present.

export type EmailEnv = {
  RESEND_API_KEY?: string
  SENDGRID_API_KEY?: string
  MAILGUN_API_KEY?: string
  MAILGUN_DOMAIN?: string
  APP_BASE_URL?: string
}

function buildOrigin(env: EmailEnv, reqUrl?: string) {
  try {
    if (env.APP_BASE_URL) return env.APP_BASE_URL
    if (reqUrl) {
      const u = new URL(reqUrl)
      return `${u.protocol}//${u.host}`
    }
  } catch {}
  return ''
}

export async function sendVerificationEmail(env: EmailEnv, to: string, token: string, reqUrl?: string) {
  const origin = buildOrigin(env, reqUrl)
  const verifyUrl = origin ? `${origin}/api/auth/verify?token=${encodeURIComponent(token)}&ui=1` : `/api/auth/verify?token=${encodeURIComponent(token)}&ui=1`
  const subject = 'Bekräfta din e‑postadress'
  const html = `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.6;padding:16px;">
    <h2>Välkommen till Concillio</h2>
    <p>Klicka på länken nedan för att verifiera din e‑postadress.</p>
    <p><a href="${verifyUrl}" style="background:#e8c76f;color:#111;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Verifiera e‑post</a></p>
    <p>Om knappen inte fungerar, kopiera och klistra in denna URL:<br/>
    <code>${verifyUrl}</code></p>
  </div>`
  const text = `Välkommen till Concillio. Verifiera din e‑post: ${verifyUrl}`

  if (env.RESEND_API_KEY) {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Concillio <noreply@concillio.dev>',
        to: [to],
        subject,
        html,
        text
      })
    })
    if (!resp.ok) throw new Error(`Resend failed: ${resp.status}`)
    return true
  }

  if (env.SENDGRID_API_KEY) {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@concillio.dev', name: 'Concillio' },
        subject,
        content: [ { type: 'text/plain', value: text }, { type: 'text/html', value: html } ]
      })
    })
    if (!resp.ok) throw new Error(`SendGrid failed: ${resp.status}`)
    return true
  }

  if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    const fd = new FormData()
    fd.set('from', 'Concillio <noreply@concillio.dev>')
    fd.set('to', to)
    fd.set('subject', subject)
    fd.set('text', text)
    fd.set('html', html)
    const url = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`
    const auth = 'Basic ' + btoa('api:' + env.MAILGUN_API_KEY)
    const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': auth }, body: fd as any })
    if (!resp.ok) throw new Error(`Mailgun failed: ${resp.status}`)
    return true
  }

  // No provider configured; no-op in dev
  return false
}
