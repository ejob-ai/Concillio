import { Hono } from 'hono';
import type { Context } from 'hono';
import { jsxRenderer } from '../renderer';
import { PLANS } from '../utils/plans';

const fmtUSD = (n: number) => `$${n.toFixed(2)}`;

const router = new Hono();

// Keep /checkout as a simple 302 redirect to the GET start endpoint
router.get('/checkout', (c: Context) => {
  const url = new URL(c.req.url)
  const plan = (url.searchParams.get('plan') || 'starter').toLowerCase()
  const quantity = Number(url.searchParams.get('quantity') || '1') || 1
  // noindex, nofollow to avoid indexing this legacy path
  try { (c.set as any)?.('head', { robots: 'noindex,nofollow' }) } catch {}
  const base = url.origin
  return Response.redirect(`${base}/api/billing/checkout/start?plan=${encodeURIComponent(plan)}&quantity=${quantity}`, 302)
});

export default router;
