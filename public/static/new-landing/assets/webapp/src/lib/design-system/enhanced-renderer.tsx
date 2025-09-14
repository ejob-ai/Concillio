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
            .orbit-ring { animation: none !important; }
            .concillio-cta { transition: none !important; }
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
          
          /* Performance optimizations */
          .orbit-system, .orbit-ring, .orbit-center, .concillio-cta {
            backface-visibility: hidden;
            transform: translateZ(0);
          }
        `}} />
        
        {/* Local TailwindCSS stylesheet (no CDN) */}
        <link rel="stylesheet" href="/static/tailwind.css" />
        
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
