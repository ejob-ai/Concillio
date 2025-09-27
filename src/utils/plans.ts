export const PLANS = {
  free: {
    key: 'free',
    label: 'Free',
    priceUSD: 0,
    councils: 1,
    attachments: { maxFiles: 0, maxMB: 0 },
    exports: { csv: false, pdf: false },
    aiReports: false,
    fileEval: false,
    integrations: [],
  },
  starter: {
    key: 'starter',
    label: 'Starter',
    priceUSD: 19.95,
    councils: 5,
    attachments: { maxFiles: 5, maxMB: 10 },
    exports: { csv: true, pdf: true },
    aiReports: true,
    fileEval: true,
    integrations: ['drive'],
  },
  pro: {
    key: 'pro',
    label: 'Pro',
    priceUSD: 34.95,
    councils: 20,
    attachments: { maxFiles: 20, maxMB: 25 },
    exports: { csv: true, pdf: true },
    aiReports: true,
    fileEval: true,
    integrations: ['drive', 'slack', 'notion'],
  },
  legacy: {
    key: 'legacy',
    label: 'Legacy',
    priceUSD: 74.95,
    councils: 100,
    attachments: { maxFiles: 50, maxMB: 50 },
    exports: { csv: true, pdf: true },
    aiReports: true,
    fileEval: true,
    integrations: ['drive', 'slack', 'notion'],
  },
} as const

export type PlanKey = keyof typeof PLANS
export type PlanConfig = (typeof PLANS)[PlanKey]

export function hasIntegration(plan: PlanKey, code: string): boolean {
  return (PLANS[plan].integrations || []).includes(code as any)
}

export function canExportCSV(plan: PlanKey): boolean { return !!PLANS[plan].exports.csv }
export function canExportPDF(plan: PlanKey): boolean { return !!PLANS[plan].exports.pdf }
export function canUseAIReports(plan: PlanKey): boolean { return !!PLANS[plan].aiReports }
export function canUseFileEval(plan: PlanKey): boolean { return !!PLANS[plan].fileEval }

export function councilsLimit(plan: PlanKey): number { return PLANS[plan].councils }

export function attachmentLimits(plan: PlanKey): { maxFiles: number; maxMB: number } {
  return PLANS[plan].attachments
}

export function integrationLabel(code: string): string {
  const map: Record<string, string> = {
    drive: 'Google Drive',
    slack: 'Slack',
    notion: 'Notion',
  }
  return map[code] || (code.charAt(0).toUpperCase() + code.slice(1))
}
