// src/components/Header.tsx
// IDs/klasser som menu.js använder: siteHeader, menu-trigger, site-menu-overlay,
// site-menu, menu-close, site-menu-title, menu-link, etc.

export function Header() {
  return (
    <header className="siteHeader">
      <div className="container mx-auto grid grid-cols-3 items-center py-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <a href="/" className="font-bold text-lg text-emerald-900" aria-label="Concillio home">
            Concillio
          </a>
        </div>

        {/* Center: Nav */}
        <nav className="flex justify-center" aria-label="Primary">
          <ul className="flex items-center space-x-6">
            <li>
              <a href="/pricing" className="nav-link">Pricing</a>
            </li>
            <li>
              <a href="/docs/lineups" className="nav-link">Board</a>
            </li>
            <li>
              <a href="/docs/roller" className="nav-link">Roles</a>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex justify-end items-center space-x-4">
          <a href="#" className="nav-link nav-toggle-link" data-theme-toggle>
            Toggle theme
          </a>
          <a href="/login" className="nav-link">Log in</a>
        </div>
      </div>

      {/* Mobile overlay + slide-in panel (unchanged for menu.js compatibility) */}
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
          <button id="menu-close" type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md" aria-label="Close menu">
            <span className="sr-only">Close</span>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 space-y-2">
          <a className="menu-link" href="/pricing">Pricing</a>
          <a className="menu-link" href="/docs/lineups">Board</a>
          <a className="menu-link" href="/docs/roller">Roles</a>
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

export default Header
