import { useEffect, useState } from 'react'

export function useBillingVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const b = (document && document.body && (document.body as any).dataset) || ({} as DOMStringMap)
      const active = String(b.subscriptionActive || '').toLowerCase() === 'true'
      const hasStripe = String((b as any).stripeCustomerId || '').length > 0
      setVisible(active || hasStripe)
    } catch {
      setVisible(false)
    }
  }, [])

  return visible
}
