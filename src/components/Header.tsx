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

      {/* Mobile menu overlay */}
      <div id="site-menu-overlay" data-menu-overlay className="menu-overlay"></div>

      {/* Mobile menu panel */}
      <div
        id="site-menu"
        className="site-menu"
        data-menu
        aria-hidden="true"
      >
        <div className="site-menu__inner">
          <button
            id="menu-close"
            className="menu-close"
            aria-label="Close menu"
            data-menu-close
            type="button"
          >
            ×
          </button>

          <nav className="mt-4 space-y-2">
            <a href="/pricing" className="menu-link">Pricing</a>
            <a href="/docs/lineups" className="menu-link">Board</a>
            <a href="/docs/roller" className="menu-link">Roles</a>
            <a href="/login" className="menu-link">Log in</a>
            <button className="menu-toggle-mobile" data-theme-toggle type="button">
              Toggle theme
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
