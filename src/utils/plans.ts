export const PLANS = {
  free:    { councilsPerMonth: 1,   attachments: { maxFiles: 0,  maxMB: 0 },   exports: { csv: false, pdf: false }, aiReports: false, fileEval: false, integrations: [] },
  starter: { councilsPerMonth: 5,   attachments: { maxFiles: 5,  maxMB: 10 },  exports: { csv: true,  pdf: false }, aiReports: true,  fileEval: true,  integrations: ["Google Drive"] },
  pro:     { councilsPerMonth: 20,  attachments: { maxFiles: 20, maxMB: 25 },  exports: { csv: true,  pdf: true  }, aiReports: true,  fileEval: true,  integrations: ["Google Drive","Slack","Notion"] },
  legacy:  { councilsPerMonth: 100, attachments: { maxFiles: 50, maxMB: 100 }, exports: { csv: true,  pdf: true  }, aiReports: true,  fileEval: true,  integrations: ["Google Drive","Slack","Notion"] },
} as const

export type PlanKey = keyof typeof PLANS
export type PlanConfig = (typeof PLANS)[PlanKey]

export function hasIntegration(plan: PlanKey, name: string): boolean {
  return (PLANS[plan].integrations || []).includes(name)
}

export function canExportCSV(plan: PlanKey): boolean { return !!PLANS[plan].exports.csv }
export function canExportPDF(plan: PlanKey): boolean { return !!PLANS[plan].exports.pdf }
export function canUseAIReports(plan: PlanKey): boolean { return !!PLANS[plan].aiReports }
export function canUseFileEval(plan: PlanKey): boolean { return !!PLANS[plan].fileEval }

export function councilsLimit(plan: PlanKey): number { return PLANS[plan].councilsPerMonth }

export function attachmentLimits(plan: PlanKey): { maxFiles: number; maxMB: number } {
  return PLANS[plan].attachments
}
