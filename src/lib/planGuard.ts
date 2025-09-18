import { PLANS, type PlanConfig } from "../utils/plans";

export type PlanKey = keyof typeof PLANS;
export type CapabilityFn = (p: PlanConfig) => boolean;

export function requirePlan(userPlan: PlanKey | undefined, capability: CapabilityFn): boolean {
  const plan = PLANS[userPlan ?? "free"];
  return capability(plan);
}

export function featureDenied(feature: string, needed: PlanKey) {
  return {
    status: 403,
    body: { ok: false, code: "UPGRADE_REQUIRED", feature, needed },
  } as const;
}
