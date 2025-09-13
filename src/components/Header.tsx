// src/components/Header.tsx
import { FC } from 'hono/jsx'

export const Header: FC = () => (
  <header id="siteHeader" class="site-header">
    <div class="wrap flex items-center justify-between py-4 text-slate-900">
      <a href="/" class="brand inline-flex items-center gap-2">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name font-bold">Concillio</span>
      </a>

      {/* Trigger */}
      <button
        id="menu-trigger"
        type="button"
        aria-controls="site-menu-overlay"
        aria-expanded="false"
        aria-label="Open menu"
        class="menu-trigger"
      >
        <span class="sr-only">Open menu</span>
        {/* din ikon här */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/></svg>
      </button>
    </div>

    {/* Overlay = dialog wrapper */}
    <div
      id="site-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-menu-title"
      aria-hidden="true"
      data-state="closed"
    >
      <nav id="site-menu-panel" class="site-menu-panel wrap pb-6 bg-white text-slate-900" tabindex="-1">
        <h2 id="site-menu-title" class="sr-only">Main menu</h2>

        <div class="flex items-center justify-between py-2">
          <span aria-hidden="true"></span>
          <button id="menu-close" aria-label="Close" class="menu-close">
            <span class="sr-only">Close</span>
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          </button>
        </div>

        <div class="grid gap-2">
          <a class="menu-link" href="/docs/roller">Roles</a>
          <a class="menu-link" href="/docs/lineups">Line-ups</a>
          <a class="menu-link" href="/council/ask">Run a Session</a>
          <a class="menu-link" href="/pricing">Pricing</a>
          <a class="menu-link" href="/login">Log in</a>
        </div>
      </nav>
    </div>
  </header>
)
