/**
 * Theme Toggle System for Concillio
 * Supports: Light Mode, Dark Mode, System Mode
 */

class ThemeManager {
  constructor() {
    this.themes = ['light', 'dark', 'system'];
    this.currentTheme = this.getStoredTheme() || 'system';
    this.init();
  }

  // Get stored theme preference
  getStoredTheme() {
    return localStorage.getItem('concillio-theme');
  }

  // Store theme preference
  setStoredTheme(theme) {
    localStorage.setItem('concillio-theme', theme);
  }

  // Get system preference
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme to document
  applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove existing theme attributes
    root.removeAttribute('data-theme');
    
    if (theme === 'system') {
      // Let CSS media queries handle system theme
      const systemTheme = this.getSystemTheme();
      // Set data attribute for JS access but don't override CSS
      root.setAttribute('data-system-theme', systemTheme);
    } else {
      // Explicitly set theme
      root.setAttribute('data-theme', theme);
      root.removeAttribute('data-system-theme');
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme === 'system' ? this.getSystemTheme() : theme);
  }

  // Update meta theme-color tag
  updateMetaThemeColor(actualTheme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Use appropriate color for each theme
      const colors = {
        light: '#d4af37', // Gold
        dark: '#ffd54f'   // Lighter gold for dark mode
      };
      metaThemeColor.setAttribute('content', colors[actualTheme] || colors.light);
    }
  }

  // Update toggle buttons visual state
  updateToggleButtons() {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === this.currentTheme) {
        btn.classList.add('active');
      }
    });
  }

  // Set theme and update everything
  setTheme(theme) {
    if (!this.themes.includes(theme)) return;
    
    this.currentTheme = theme;
    this.setStoredTheme(theme);
    this.applyTheme(theme);
    this.updateToggleButtons();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { 
        theme: theme,
        actualTheme: theme === 'system' ? this.getSystemTheme() : theme
      }
    }));
  }

  // Create theme toggle HTML
  createToggle() {
    return `
      <div class="theme-toggle" role="group" aria-label="Theme selection">
        <button class="theme-btn" data-theme="light" title="Light mode" aria-label="Switch to light mode">
          <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
        </button>
        <button class="theme-btn" data-theme="dark" title="Dark mode" aria-label="Switch to dark mode">
          <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        <button class="theme-btn" data-theme="system" title="System mode" aria-label="Use system theme">
          <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
          </svg>
        </button>
      </div>
    `;
  }

  // Initialize theme system
  init() {
    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme === 'system') {
        this.applyTheme('system');
        // Dispatch event for system theme change
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { 
            theme: 'system',
            actualTheme: e.matches ? 'dark' : 'light'
          }
        }));
      }
    });

    // Add toggle to page when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.addToggleToPage());
    } else {
      this.addToggleToPage();
    }
  }

  // Add theme toggle to page
  addToggleToPage() {
    // Create toggle element
    const toggleDiv = document.createElement('div');
    toggleDiv.innerHTML = this.createToggle();
    const toggle = toggleDiv.firstElementChild;
    
    // Add to body
    document.body.appendChild(toggle);

    // Add click event listeners
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-btn');
      if (btn && btn.dataset.theme) {
        this.setTheme(btn.dataset.theme);
      }
    });

    // Update initial button state
    this.updateToggleButtons();

    // Add keyboard navigation
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const buttons = Array.from(toggle.querySelectorAll('.theme-btn'));
        const currentIndex = buttons.findIndex(btn => btn.classList.contains('active'));
        const nextIndex = e.key === 'ArrowRight' 
          ? (currentIndex + 1) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;
        
        buttons[nextIndex].focus();
        this.setTheme(buttons[nextIndex].dataset.theme);
      }
    });
  }
}

// Initialize theme manager when script loads
window.concillioTheme = new ThemeManager();

// Expose theme utilities globally
window.setTheme = (theme) => window.concillioTheme.setTheme(theme);
window.getCurrentTheme = () => window.concillioTheme.currentTheme;