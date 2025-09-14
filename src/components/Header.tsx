export function Header() {
  return (
    <header id="siteHeader" class="site-header">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" class="brand menu-link inline-flex items-center gap-2">
          <span class="inline-block h-6 w-6 rounded-lg bg-[conic-gradient(from_220deg,#0f766e,#3aa69f_35%,#90e0da_65%,#0f766e)] shadow"></span>
          <span class="font-bold tracking-tight">Concillio</span>
        </a>

        <button id="menu-trigger" aria-controls="site-menu-overlay" aria-expanded="false" type="button" aria-label="Open menu"
                class="menu-trigger inline-flex h-10 w-10 items-center justify-center rounded-xl border">
          <span class="sr-only">Open menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>

      <div id="site-menu-overlay" role="dialog" aria-modal="true"
           aria-labelledby="site-menu-title" aria-hidden="true" data-state="closed">
        <nav id="site-menu-panel" class="site-menu-panel" tabindex="-1">
          <h2 id="site-menu-title" class="sr-only">Main menu</h2>
          <div class="flex items-center justify-between">
            <span class="font-semibold">Menu</span>
            <button id="menu-close" aria-label="Close" class="menu-close inline-flex h-10 w-10 items-center justify-center rounded-xl border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2"/></svg>
            </button>
          </div>

          <div class="mt-4 grid gap-2">
            <a class="menu-link" href="/council/ask">Run a Session</a>
            <a class="menu-link" href="/pricing">Pricing</a>
            <a class="menu-link" href="/docs/lineups">Line-ups</a>
            <a class="menu-link" href="/docs/roles">Roles</a>
          </div>
        </nav>
      </div>
    </header>
  )
}
