export const STRIPE_PRICES: Record<string, string> = {
  starter: "price_1S8qILC13JJPKQjRt9veEa5F", // inte prod_
  pro:     "price_1S8qdXC13JJPKQjRQc5QyR4o",
  legacy:  "price_1S8qeOC13JJPKQjRhMXOjeI9",
};

export const resolvePriceId = (plan: string) => {
  const id = STRIPE_PRICES[String(plan || '').toLowerCase()];
  if (!id) throw new Error(`Unknown plan: ${plan}`);
  return id;
};
