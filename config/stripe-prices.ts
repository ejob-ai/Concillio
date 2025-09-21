// config/stripe-prices.ts
export const STRIPE_PRICES: Record<string, string> = {
  starter: "price_TEST_STARTER",
  pro:     "price_TEST_PRO",
  legacy:  "price_TEST_LEGACY",
};

export function resolvePriceId(plan: string) {
  const id = STRIPE_PRICES[String(plan || '').toLowerCase()];
  if (!id) throw new Error('UNKNOWN_PLAN');
  return id;
}
