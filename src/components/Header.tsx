import { FC } from 'react';

const Header: FC = () => {
  return (
    <header id="siteHeader" className="site-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Concillio</span>
        </a>

        {/* Desktop nav (≥1024px) */}
        <nav className="hidden lg:flex items-center gap-6">
          <a href="/#why" className="nav-link">Why Concillio?</a>
          <a href="/pricing" className="nav-link">Pricing</a>
          <a href="/docs/lineups" className="nav-link">Docs</a>
          <a href="/roles" className="nav-link">Roles</a>

          {/* Diskret theme-toggle som länk */}
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
          <a href="/login" className="nav-link">Log in</a>
        </nav>

        {/* Mobile menu trigger (<1024px) */}
        <button
          id="menu-trigger"
          className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300/60 dark:border-slate-700/60"
          aria-controls="site-menu-overlay"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="sr-only">Open menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile overlay + panel */}
      <div id="site-menu-overlay" data-state="closed" aria-hidden="true">
        <nav
          id="site-menu-panel"
          tabIndex={-1}
          aria-labelledby="site-menu-title"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 id="site-menu-title" className="text-base font-semibold">Menu</h2>
              <button id="menu-close" className="menu-close" aria-label="Close menu">
                ✕
              </button>
            </div>

            {/* Länkar */}
            <div className="mt-4 space-y-2">
              <a className="menu-link" href="/#why">Why Concillio?</a>
              <a className="menu-link" href="/pricing">Pricing</a>
              <a className="menu-link" href="/docs/lineups">Docs</a>
              <a className="menu-link" href="/roles">Roles</a>
              <a className="menu-link" href="/login">Log in</a>

              {/* Diskret theme-toggle i panelen */}
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

            {/* OBS: Primär CTA-rad borttagen i mobilpanelen enligt önskemål */}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
export { Header };
