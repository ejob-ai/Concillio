// src/components/Header.tsx
// Behåller IDs/klasser som menu.js använder: siteHeader, menu-trigger, site-menu-overlay,
// site-menu-panel, menu-close, site-menu-title, menu-link, etc.

import { Fragment } from 'react'

export default function Header() {
  return (
    <header id="siteHeader" className="site-header">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 shrink-0" aria-label="Concillio home">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="font-semibold tracking-[-0.02em]">Concillio</span>
        </a>

        {/* Desktop nav (md+ / lg+) */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
          <a className="nav-link" href="/#why">Why Concillio?</a>
          <a className="nav-link" href="/pricing">Pricing</a>
          <a className="nav-link" href="/docs/lineups">Docs</a>
          <a className="nav-link" href="/roles">Roles</a>

          {/* Diskret theme toggle (nav-länk, ingen CTA-knapp) */}
          <button
            type="button"
            className="nav-link nav-toggle-link"
            data-theme-toggle
            aria-pressed="false"
            aria-label="Toggle theme"
          >
            <span className="t-label-dark">Light</span>
            <span className="t-label-light">Dark</span>
          </button>

          {/* Diskret Log in */}
          <a className="nav-link" href="/login">Log in</a>
        </nav>

        {/* Mobile menu trigger (syns < lg) */}
        <button
          id="menu-trigger"
          type="button"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300/70 dark:border-slate-600/60"
          aria-controls="site-menu-overlay"
          aria-expanded="false"
          aria-label="Open menu"
        >
          <span className="sr-only">Open menu</span>
          {/* simple hamburger */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay + slide-in panel */}
      <div id="site-menu-overlay" data-state="closed" aria-hidden="true">
        <nav
          id="site-menu-panel"
          tabIndex={-1}
          aria-label="Mobile"
          className="flex h-full w-full flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-700/60">
            <div id="site-menu-title" className="font-semibold">Menu</div>
            <button id="menu-close" type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md"
              aria-label="Close menu">
              <span className="sr-only">Close</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Länkar + diskret theme-toggle (INGEN CTA-rad här längre) */}
          <div className="px-4 py-3 space-y-2">
            <a className="menu-link" href="/#why">Why Concillio?</a>
            <a className="menu-link" href="/pricing">Pricing</a>
            <a className="menu-link" href="/docs/lineups">Docs</a>
            <a className="menu-link" href="/roles">Roles</a>
            <a className="menu-link" href="/login">Log in</a>

            <button
              type="button"
              className="menu-toggle-mobile"
              data-theme-toggle
              aria-pressed="false"
              aria-label="Toggle theme"
            >
              <span className="t-label-dark">Switch to Light</span>
              <span className="t-label-light">Switch to Dark</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

// Behåll named export för bakåtkompatibilitet där { Header } importeras
export { Header }
