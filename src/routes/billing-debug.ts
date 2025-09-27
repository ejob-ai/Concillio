import { Hono } from 'hono'
import { resolvePriceId } from '../../config/stripe-prices'

export const billingDebug = new Hono()

const isPreview = () => (globalThis as any).process?.env?.ENVIRONMENT === 'preview'

billingDebug.get('/api/debug/billing-env', (c) => {
  if (!isPreview()) return c.json({ error: 'FORBIDDEN' }, 403)
  const res: Record<string, string> = {}
  const keys = ['STRIPE_SECRET_KEY','PRICE_STARTER','PRICE_PRO','PRICE_LEGACY']
  for (const k of keys) {
    const v = (globalThis as any).process?.env?.[k]
    res[k] = v ? 'SET' : 'MISSING'
  }
  let starter = 'ok', pro = 'ok'
  try { resolvePriceId('starter' as any) } catch (e:any) { starter = String(e?.message||e) }
  try { resolvePriceId('pro' as any) } catch (e:any) { pro = String(e?.message||e) }
  return c.json({ env: res, resolve: { starter, pro } })
})
