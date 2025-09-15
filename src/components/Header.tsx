// src/components/Header.tsx
import { FC } from 'react';

export const Header: FC = () => {
  return (
    <header id="siteHeader" className="site-header">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        {/* Brand */}
        <a href="/" className="menu-link flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-block h-3.5 w-3.5 rounded-full bg-teal-500" aria-hidden />
          Concillio
        </a>

        {/* Desktop right side actions */}
        <nav className="hidden md:flex items-center gap-5">
          <a href="/pricing" className="nav-link">Pricing</a>
          <a href="/docs/lineups" className="nav-link">Docs</a>
          <a href="/roles" className="nav-link">Roles</a>

          {/* Theme: diskret länk */}
          <button
            type="button"
            className="nav-link nav-toggle-link"
            data-theme-toggle
            aria-pressed="false"
            aria-label="Toggle theme"
          >
            <span className="t-label-dark">Dark</span>
            <span className="t-label-light">Light</span>
          </button>

          {/* Diskret inloggning */}
          <a href="/login" className="nav-link">Log in</a>
        </nav>

        {/* Mobil: hamburger (md:hidden) */}
        <button
          id="menu-trigger"
          aria-controls="site-menu-overlay"
          aria-expanded="false"
          type="button"
          aria-label="Open menu"
          className="md:hidden menu-trigger"
        >
          <span className="sr-only">Open menu</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobil overlay / panel (oförändrad struktur för menu.js) */}
      <div
        id="site-menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-menu-title"
        aria-hidden="true"
        data-state="closed"
      >
        <nav id="site-menu-panel" className="site-menu-panel wrap pb-6" tabIndex={-1}>
          <h2 id="site-menu-title" className="sr-only">Main menu</h2>

          <div className="flex items-center justify-between pt-2 pb-4">
            <a href="/" className="menu-link flex items-center gap-2 font-semibold text-slate-900">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-teal-500" aria-hidden />
              Concillio
            </a>
            <button id="menu-close" aria-label="Close" className="menu-close">
              <span className="sr-only">Close</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <a href="/pricing" className="menu-link">Pricing</a>
            <a href="/docs/lineups" className="menu-link">Docs</a>
            <a href="/roles" className="menu-link">Roles</a>
            <a href="/login" className="menu-link">Log in</a>

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

          <div className="mt-4 flex gap-2">
            <a href="/council/ask" className="btn-gold w-full">Enter Concillio</a>
            <a href="/contact" className="btn-outline w-full">Contact</a>
          </div>
        </nav>
      </div>
    </header>
  );
};
export default Header;