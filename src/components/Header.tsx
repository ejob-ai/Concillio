// src/components/Header.tsx
// IDs/klasser som menu.js använder: siteHeader, menu-trigger, site-menu-overlay,
// site-menu, menu-close, site-menu-title, menu-link, etc.

import { Fragment } from 'react'

export function Header() {
  return (
    <header id="siteHeader" className="site-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 shrink-0" aria-label="Concillio home">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="font-semibold tracking-[-0.02em]">Concillio</span>
        </a>

        <div className="grid grid-cols-3 items-center h-16">
          {/* Vänster: Logo */}
          <div className="flex items-center">
            <a href="/" className="logo">Concillio</a>
          </div>

          {/* Mitten: Navigation centrerad */}
          <nav className="hidden lg:flex justify-center items-center gap-6" aria-label="Primary">
          <a className="nav-link" href="/pricing">Pricing</a>
          <a className="nav-link" href="/docs/lineups">Board</a>
          <a className="nav-link" href="/docs/roller">Roles</a>

          {/* Diskret theme toggle (nav-länk, ingen CTA-knapp) */}
          <a href="#" className="nav-link nav-toggle-link" data-theme-toggle aria-label="Toggle theme">
            Toggle theme
          </a>

          {/* Höger: Actions */}
          <div className="flex justify-end items-center gap-4">
            <a href="#" className="nav-link nav-toggle-link" data-theme-toggle>Toggle theme</a>
            <a href="/login" className="nav-link">Log in</a>
          </div>
        </div>

        {/* Mobile menu trigger (syns < lg) */}
        <button
          id="menu-trigger"
          type="button"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300/70 dark:border-slate-600/60"
          data-menu-toggle
          aria-controls="site-menu"
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
      <div id="site-menu-overlay" data-menu-overlay className="menu-overlay"></div>
      <nav
        id="site-menu"
        tabIndex={-1}
        aria-label="Mobile"
        className="flex h-full w-full flex-col"
        data-menu
        aria-hidden="true"
        inert
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
            <span className="t-label-dark">Switch to Dark</span>
            <span className="t-label-light">Switch to Light</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

// Behåll både default och named export för kompatibilitet
export default Header
