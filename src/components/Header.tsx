export default function Header() {
  return (
    <header className="siteHeader">
      <div className="container mx-auto grid grid-cols-3 items-center py-4">
        {/* Left: Logo + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            id="menu-trigger"
            data-menu-toggle
            aria-controls="site-menu"
            aria-expanded="false"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg ring-offset-2 focus:outline-none focus-visible:ring"
          >
            <span className="sr-only">Open menu</span>
            {/* icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <a href="/" className="font-semibold">Concillio</a>
        </div>

        {/* Middle: centered nav (desktop only) */}
        <nav className="nav justify-center hidden md:flex">
          <ul className="flex items-center gap-6">

            <li><a className="nav-link" href="/docs/lineups">Board</a></li>
            <li><a className="nav-link" href="/docs/roller">Roles</a></li>
            <li><a className="nav-link" href="/pricing">Pricing</a></li>
          </ul>
        </nav>

        {/* Right: actions (theme toggle hidden on mobile) */}
        <div className="flex items-center justify-end gap-4">
          <a
            href="#"
            data-theme-toggle
            aria-pressed="false"
            className="hidden md:inline-flex link-like"
          >
            <span className="t-label-dark">Switch to Dark</span>
            <span className="t-label-light">Switch to Light</span>
          </a>
          <a href="/login" className="link-like">Log in</a>
        </div>
      </div>

      {/* Overlay + drawer already handled by your CSS/JS */}
      <div id="site-menu-overlay" data-menu-overlay hidden aria-hidden="true"></div>
      <aside id="site-menu" data-menu aria-hidden="true" inert>
        <button id="menu-close" className="menu-close" aria-label="Close">×</button>
        <nav className="menu-list">

          <a className="menu-link" href="/docs/lineups">Board</a>
          <a className="menu-link" href="/docs/roller">Roles</a>
          <a className="menu-link" href="/pricing">Pricing</a>
          <hr className="menu-sep" />
          {/* Theme toggle appears inside the menu on mobile */}
          <a className="menu-link" href="#" data-theme-toggle aria-pressed="false">
            <span className="t-label-dark">Switch to Dark</span>
            <span className="t-label-light">Switch to Light</span>
          </a>
          <a className="menu-link" href="/login">Log in</a>
        </nav>
      </aside>
    </header>
  );
}
