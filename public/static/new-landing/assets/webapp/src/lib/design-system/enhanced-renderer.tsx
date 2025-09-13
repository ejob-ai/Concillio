import { jsxRenderer } from 'hono/jsx-renderer'
import { concillioTokens, theme } from './concillio-design-tokens'

// Enhanced renderer med integrerat Concillio design system
export const concillioRenderer = jsxRenderer(({ children }) => {
  return (
    <html lang="sv" data-theme="system">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>Concillio – Där visdom sammanträder</title>
        <meta name="description" content="Ditt personliga råd av experter. Exklusivt. Endast på inbjudan." />
        
        {/* Favicon med Concillio C */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23caa134'/><text x='50' y='65' text-anchor='middle' font-size='40' font-family='serif' fill='%230d1b3d' font-weight='bold'>C</text></svg>" />
        <meta name="theme-color" content="#caa134" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preconnect för fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        
        {/* Concillio Fonts - Crimson Text Serif + Inter Sans */}
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* FontAwesome för ikoner */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Concillio Design System - CSS Variables */}
        <style dangerouslySetInnerHTML={{__html: `
          /* === CONCILLIO DESIGN SYSTEM TOKENS === */
          :root {
            /* Brand Colors - Light Mode */
            --concillio-navy: ${concillioTokens.colors.brand.navy};
            --concillio-gold: ${concillioTokens.colors.brand.gold};
            --concillio-ink: ${concillioTokens.colors.brand.ink};
            --concillio-paper: ${concillioTokens.colors.brand.paper};
            
            /* Semantic Colors - Light Mode */
            --bg-primary: var(--concillio-paper);
            --bg-secondary: #f8fafc;
            --text-primary: var(--concillio-navy);
            --text-secondary: color-mix(in oklab, var(--concillio-navy) 80%, white 20%);
            --text-muted: color-mix(in oklab, var(--concillio-navy) 70%, white 30%);
            --accent-primary: var(--concillio-gold);
            
            /* Typography Scale - Fluid Responsive */
            --fluid-h1: ${concillioTokens.typography.scale.h1};
            --fluid-h2: ${concillioTokens.typography.scale.h2};
            --fluid-h3: ${concillioTokens.typography.scale.h3};
            --fluid-subcopy: ${concillioTokens.typography.scale.subcopy};
            --fluid-body: ${concillioTokens.typography.scale.body};
            --fluid-small: ${concillioTokens.typography.scale.small};
            --fluid-cta: ${concillioTokens.typography.scale.cta};
            
            /* Spacing System - Fluid */
            --space-xs: ${concillioTokens.spacing.fluid.xs};
            --space-sm: ${concillioTokens.spacing.fluid.sm};
            --space-md: ${concillioTokens.spacing.fluid.md};
            --space-lg: ${concillioTokens.spacing.fluid.lg};
            --space-xl: ${concillioTokens.spacing.fluid.xl};
            --space-2xl: ${concillioTokens.spacing.fluid['2xl']};
            --space-3xl: ${concillioTokens.spacing.fluid['3xl']};
            --space-section: ${concillioTokens.spacing.section};
            --space-ceremonial: ${concillioTokens.spacing.ceremonial};
            
            /* Font Families */
            --font-serif: ${concillioTokens.typography.families.serif};
            --font-sans: ${concillioTokens.typography.families.sans};
            
            /* Animation Timings */
            --orbit-duration: ${concillioTokens.animation.orbit};
            --orbit-mobile-duration: ${concillioTokens.animation.orbitMobile};
            --transition-fast: ${concillioTokens.animation.hover};
            --transition-normal: ${concillioTokens.animation.transition};
            
            /* Legacy compatibility */
            --pad-sm: var(--space-sm);
            --pad-md: var(--space-md);
            --pad-lg: var(--space-lg);
            --serif: var(--font-serif);
            --sans: var(--font-sans);
          }
          
          /* Dark Mode */
          [data-theme="dark"] {
            --concillio-navy: #e8eaf6;
            --concillio-gold: #ffd54f;
            --concillio-ink: #ffffff;
            --concillio-paper: #050c20;
            
            --bg-primary: #050c20;
            --bg-secondary: #0d1b3d;
            --text-primary: #e8eaf6;
            --text-secondary: color-mix(in oklab, #e8eaf6 85%, black 15%);
            --text-muted: color-mix(in oklab, #e8eaf6 65%, black 35%);
            --accent-primary: #ffd54f;
          }
          
          /* System Dark Mode */
          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              --concillio-navy: #e8eaf6;
              --concillio-gold: #ffd54f;
              --concillio-ink: #ffffff;
              --concillio-paper: #050c20;
              --bg-primary: #050c20;
              --bg-secondary: #0d1b3d;
              --text-primary: #e8eaf6;
              --text-secondary: color-mix(in oklab, #e8eaf6 85%, black 15%);
              --text-muted: color-mix(in oklab, #e8eaf6 65%, black 35%);
              --accent-primary: #ffd54f;
            }
          }
          
          /* Critical Above-the-fold CSS */
          body {
            font-family: var(--font-sans);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            margin: 0;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          
          /* Hero Section Critical CSS */
          .concillio-hero {
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            padding: var(--space-section) var(--space-md);
            text-align: center;
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            contain: layout paint;
          }
          
          .concillio-hero-title {
            font-size: var(--fluid-h1);
            line-height: 1.08;
            font-weight: 700;
            color: var(--text-primary);
            font-family: var(--font-serif);
            text-wrap: balance;
            margin-bottom: var(--space-sm);
            letter-spacing: -0.02em;
          }
          
          .concillio-hero-subtitle {
            font-size: var(--fluid-subcopy);
            font-style: italic;
            color: var(--text-secondary);
            font-family: var(--font-serif);
            margin: var(--space-sm) auto var(--space-lg);
            max-width: 60ch;
            text-wrap: pretty;
          }
          
          .concillio-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem);
            background: linear-gradient(135deg, var(--concillio-gold) 0%, #b8941f 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-size: var(--fluid-cta);
            font-weight: 600;
            letter-spacing: 0.025em;
            transition: all var(--transition-normal) ease;
            box-shadow: 0 8px 25px rgba(202, 161, 52, 0.15);
            will-change: transform, box-shadow;
          }
          
          .concillio-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(202, 161, 52, 0.4);
          }
          
          /* Orbital System Critical CSS */
          .orbit-system {
            position: relative;
            display: grid;
            place-items: center;
            width: clamp(240px, 40vh, 400px);
            height: clamp(240px, 40vh, 400px);
            margin: var(--space-2xl) auto;
            contain: layout paint;
          }
          
          .orbit-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1px solid color-mix(in oklab, var(--concillio-gold) 25%, transparent 75%);
            opacity: 0.5;
            animation: orbit-spin var(--orbit-duration) linear infinite;
          }
          
          .orbit-center {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, var(--concillio-navy) 85%, #081a33 100%);
            border: 3px solid var(--concillio-gold);
            display: grid;
            place-items: center;
            font-family: var(--font-serif);
            font-size: 2rem;
            font-weight: bold;
            color: var(--concillio-gold);
            z-index: 10;
            position: relative;
            box-shadow: 
              0 8px 25px rgba(0,0,0,0.3),
              0 0 20px color-mix(in oklab, var(--concillio-gold) 40%, transparent 60%),
              inset 0 2px 6px rgba(255,255,255,0.15);
          }
          
          @keyframes orbit-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Reduced Motion */
          @media (prefers-reduced-motion: reduce) {
            .orbit-ring {
              animation: none !important;
            }
            .concillio-cta {
              transition: none !important;
            }
            * {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Performance optimizations */
          .orbit-system, .orbit-ring, .orbit-center, .concillio-cta {
            backface-visibility: hidden;
            transform: translateZ(0);
          }
        `}} />
        
        {/* TailwindCSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Enhanced Tailwind Config med Concillio Design System */}
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  'concillio-serif': ['Crimson Text', 'Georgia', 'serif'],
                  'concillio-sans': ['Inter', 'system-ui', 'sans-serif'],
                  'serif': ['Crimson Text', 'Georgia', 'serif'],
                  'sans': ['Inter', 'system-ui', 'sans-serif']
                },
                colors: {
                  'concillio-navy': '#0d1b3d',
                  'concillio-gold': '#caa134',
                  'concillio-ink': '#132047', 
                  'concillio-paper': '#fffef9',
                  
                  // Extended palette
                  'navy': {
                    50: '#f0f2f9',
                    100: '#e1e5f3',
                    200: '#c3cce6',
                    300: '#a5b2da', 
                    400: '#8799cd',
                    500: '#6980c1',
                    600: '#4a5a9a',
                    700: '#354374',
                    800: '#1f2d4d',
                    900: '#0d1b3d',
                    950: '#070f1f'
                  },
                  'gold': {
                    50: '#fef9e7',
                    100: '#fdf3cf',
                    200: '#fbe79f',
                    300: '#f9db6f',
                    400: '#f7cf3f',
                    500: '#caa134',
                    600: '#b8941f',
                    700: '#8a6f17',
                    800: '#5c4a0f',
                    900: '#2e2508'
                  },
                  
                  // Legacy compatibility
                  'ivory': '#fdfcf8'
                },
                fontSize: {
                  'fluid-h1': ['clamp(2rem, 6.5vw, 5.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
                  'fluid-h2': ['clamp(1.75rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
                  'fluid-h3': ['clamp(1.375rem, 3.2vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
                  'fluid-subcopy': ['clamp(1rem, 2.2vw, 1.375rem)', { lineHeight: '1.35', fontStyle: 'italic' }],
                  'fluid-body': ['clamp(0.9375rem, 1.8vw, 1.125rem)', { lineHeight: '1.6' }],
                  'fluid-small': ['clamp(0.8125rem, 1.6vw, 1rem)', { lineHeight: '1.5' }],
                  'fluid-cta': ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.1', letterSpacing: '0.025em' }]
                },
                spacing: {
                  'fluid-xs': 'clamp(0.5rem, 1.2vw, 0.875rem)',
                  'fluid-sm': 'clamp(0.75rem, 2vw, 1.5rem)',
                  'fluid-md': 'clamp(1rem, 2.5vw, 2rem)',
                  'fluid-lg': 'clamp(1.5rem, 3vw, 2.5rem)',
                  'fluid-xl': 'clamp(2rem, 4vw, 4rem)',
                  'fluid-2xl': 'clamp(3rem, 6vw, 6rem)',
                  'fluid-3xl': 'clamp(4rem, 8vw, 8rem)',
                  'section': 'clamp(4rem, 10vw, 10rem)',
                  'ceremonial': 'clamp(6rem, 12vw, 15rem)'
                },
                boxShadow: {
                  'gold-subtle': '0 2px 8px rgba(202, 161, 52, 0.1)',
                  'gold-medium': '0 8px 25px rgba(202, 161, 52, 0.15)',
                  'gold-strong': '0 12px 35px rgba(202, 161, 52, 0.4)',
                  'gold-glow': '0 0 20px rgba(202, 161, 52, 0.3)',
                  'navy-subtle': '0 4px 12px rgba(13, 27, 61, 0.08)',
                  'navy-medium': '0 8px 20px rgba(13, 27, 61, 0.12)',
                  'orbit': '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(202, 161, 52, 0.4)'
                },
                backgroundImage: {
                  'hero-gradient': 'linear-gradient(135deg, #fefeff 0%, #faf9f6 100%)',
                  'gold-gradient': 'linear-gradient(135deg, #caa134 0%, #b8941f 100%)',
                  'navy-gradient': 'linear-gradient(135deg, #0d1b3d 0%, #1e2761 100%)',
                  'orbit-center': 'radial-gradient(circle at 30% 30%, #0d1b3d 85%, #081a33 100%)'
                },
                animation: {
                  'orbit': 'spin 48s linear infinite',
                  'orbit-mobile': 'spin 56s linear infinite',
                  'pulse-gold': 'pulse 4s ease-in-out infinite'
                }
              }
            },
            plugins: [
              function({ addComponents }) {
                addComponents({
                  '.concillio-hero-title': {
                    fontSize: 'clamp(2rem, 6.5vw, 5.5rem)',
                    lineHeight: '1.08',
                    fontWeight: '700',
                    letterSpacing: '-0.02em',
                    textWrap: 'balance',
                    fontFamily: 'var(--font-serif)'
                  },
                  '.concillio-cta-button': {
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    fontWeight: '600', 
                    letterSpacing: '0.025em',
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #caa134 0%, #b8941f 100%)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(202, 161, 52, 0.15)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(202, 161, 52, 0.4)'
                    }
                  }
                })
              }
            ]
          }
        `}} />
        
        {/* Custom styles - non-critical CSS */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* Theme toggle functionality */}
        <script src="/static/theme-toggle.js" defer></script>
      </head>
      <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        {children}
      </body>
    </html>
  )
})