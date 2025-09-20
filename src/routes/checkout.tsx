import { Hono } from 'hono';
import type { Context } from 'hono';
import { jsxRenderer } from '../renderer';
import { PLANS } from '../utils/plans';

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

const router = new Hono();

// Keep /checkout as a simple 302 redirect to the GET start endpoint
router.get('/checkout', (c: Context) => {
  const u = new URL(c.req.url)
  const plan = (u.searchParams.get('plan') || 'starter').toLowerCase()
  const quantity = Number(u.searchParams.get('quantity') || '1') || 1
  // noindex, nofollow to avoid indexing this legacy path
  try { (c.set as any)?.('head', { robots: 'noindex,nofollow' }) } catch {}
  const forward = new URL(`/api/billing/checkout/start`, u.origin)
  forward.searchParams.set('plan', plan)
  forward.searchParams.set('quantity', String(quantity))
  for (const [k, v] of u.searchParams) if (k.toLowerCase().startsWith('utm_')) forward.searchParams.set(k, v)
  return Response.redirect(forward.toString(), 302)
});

export default router;
