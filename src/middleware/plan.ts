import type { Next } from 'hono'
import { auditAppendKV } from '../utils/audit'
import { requirePlan, featureDenied, type PlanKey } from '../lib/planGuard'

// Extract current user's plan.
// Priority:
// 1) Session-derived subscription when status === 'active' (from attachSession enrichment)
// 2) Cookie fallback `plan` (legacy/testing)
// 3) 'free'
export function getUserPlan(c: any): PlanKey {
  // 1) Session/D1 subscription (preferred)
  try {
    const u: any = (c.get as any)?.('user')
    const status = (u?.subscriptionStatus || '').toLowerCase()
    const plan = (u?.subscriptionPlan || '').toLowerCase()
    if (status === 'active') {
      if (plan === 'starter' || plan === 'pro' || plan === 'legacy') return plan as PlanKey
    }
  } catch {}
  // 2) Cookie fallback
  try {
    const cookie = c.req.header('Cookie') || ''
    const m = cookie.match(/(?:^|;\s*)plan=([^;]+)/)
    const v = m ? decodeURIComponent(m[1]).toLowerCase() : ''
    if (v === 'starter' || v === 'pro' || v === 'legacy' || v === 'free') return v as PlanKey
  } catch {}
  // 3) Default
  return 'free'
}

export async function denyWithAudit(c: any, feature: string, needed: PlanKey) {
  try {
    await auditAppendKV((c.env as any).AUDIT_LOG_KV, {
      type: 'plan_denied',
      plan: getUserPlan(c),
      feature,
      needed,
      path: c.req.path,
      ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null,
      ua: c.req.header('User-Agent') || null
    }, Number((c.env as any).ADMIN_AUDIT_RETENTION_HOURS || 24) / 24)
  } catch {}
  const res = featureDenied(feature, needed)
  return c.json(res.body, res.status)
}

// Capability helpers
export const Cap = {
  csv:   (p: any) => !!p.exports?.csv,
  pdf:   (p: any) => !!p.exports?.pdf,
  ai:    (p: any) => !!p.aiReports,
  eval:  (p: any) => !!p.fileEval,
  attachAny: (p: any) => (p.attachments?.maxFiles||0) > 0,
}

export async function requireCSV(c: any, next: Next) {
  const plan = getUserPlan(c)
  if (!requirePlan(plan, Cap.csv)) return denyWithAudit(c, 'csv-export', 'starter')
  return next()
}
export async function requirePDF(c: any, next: Next) {
  const plan = getUserPlan(c)
  if (!requirePlan(plan, Cap.pdf)) return denyWithAudit(c, 'pdf-export', 'pro')
  return next()
}
export async function requireAIReports(c: any, next: Next) {
  const plan = getUserPlan(c)
  if (!requirePlan(plan, Cap.ai)) return denyWithAudit(c, 'ai-reports', 'starter')
  return next()
}
export async function requireFileEval(c: any, next: Next) {
  const plan = getUserPlan(c)
  if (!requirePlan(plan, Cap.eval)) return denyWithAudit(c, 'file-eval', 'starter')
  return next()
}
export async function requireAttachmentsAllowed(c: any, next: Next) {
  const plan = getUserPlan(c)
  if (!requirePlan(plan, Cap.attachAny)) return denyWithAudit(c, 'attachments', 'starter')
  return next()
}
