/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens
        concillio: {
          gold: '#d4af37',
          petrol: '#0b3b3c',
          purple: '#5a3e85',
        },
        // Base
        background: '#ffffff',
        foreground: '#111111',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
        crimson: ['"Crimson Text"', 'serif'],
      },
      spacing: {
        // Spacing scale tuned for premium feel
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          '2xl': '1200px',
        }
      }
    },
  },
  plugins: [],
}
