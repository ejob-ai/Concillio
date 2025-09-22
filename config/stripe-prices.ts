// config/stripe-prices.ts
// Read from process.env (via globalThis) and throw clear errors

function requiredEnv(name: string): string {
  const v = (globalThis as any).process?.env?.[name];
  if (!v) {
    // Clear to read in logs and 501/500 responses
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

export type Plan = 'starter' | 'pro' | 'legacy';

export function resolvePriceId(plan: Plan): string {
  switch (plan) {
    case 'starter': return requiredEnv('PRICE_STARTER');
    case 'pro':     return requiredEnv('PRICE_PRO');
    case 'legacy':  return requiredEnv('PRICE_LEGACY'); // remove if you drop legacy
    default:
      throw new Error(`UNKNOWN_PLAN: ${plan}`);
  }
}
