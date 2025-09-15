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
        {/* Mobile panel content */}
        <nav id="site-menu-panel" tabIndex={-1} className="p-4 focus:outline-none">
          <h2 id="site-menu-title" className="sr-only">Main menu</h2>

          <div className="mt-2 space-y-2">
            <a className="menu-link" href="/pricing">Pricing</a>
            <a className="menu-link" href="/docs/lineups">Docs</a>
            <a className="menu-link" href="/roles">Roles</a>
            <a className="menu-link" href="/login">Log in</a>
          </div>

          <div className="mt-4">
            <button
              type="button"
              data-theme-toggle
              aria-pressed="false"
              aria-label="Toggle theme"
              className="menu-toggle-mobile"
            >
              <span className="t-label-dark">Switch to Light</span>
              <span className="t-label-light">Switch to Dark</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
export default Header;