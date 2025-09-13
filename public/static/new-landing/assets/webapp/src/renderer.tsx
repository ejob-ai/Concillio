import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>Concillio – Where wisdom convenes</title>
        <meta name="description" content="Your personal council of minds. Exclusive. Invitation only." />
        
        {/* Favicon and mobile icons */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23d4af37'/><text x='50' y='65' text-anchor='middle' font-size='40' font-family='serif' fill='%23132047'>C</text></svg>" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* TailwindCSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Google Fonts - Premium serif and sans-serif */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        
        {/* FontAwesome for icons */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Critical CSS inline for faster loading */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Critical above-the-fold CSS */
          :root{
            --pad-sm:clamp(10px,1.2vw,14px);--pad-md:clamp(16px,2vw,24px);
            --pad-lg:clamp(24px,3vw,40px);--serif:"Georgia",ui-serif,serif;
          }
          .hero{background:linear-gradient(180deg,var(--bg-primary) 0%,var(--bg-secondary) 100%);
            padding:clamp(40px,8vw,100px) var(--pad-md);text-align:center;
            min-height:60vh;display:flex;flex-direction:column;justify-content:center;
          }
          .hero__title{font-size:clamp(32px,6.5vw,88px);line-height:1.08;
            font-weight:700;color:var(--text-primary);font-family:var(--serif);
            text-wrap:balance;margin-bottom:var(--pad-sm);
          }
          body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;
            background-color:var(--bg-primary);color:var(--text-primary);margin:0;
            -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
          }
        `}} />
        
        {/* Custom styles - loaded async for non-critical CSS */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* TailwindCSS Custom Configuration */}
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  'serif': ['Crimson Text', 'serif'],
                  'sans': ['Inter', 'sans-serif'],
                },
                colors: {
                  'navy': {
                    800: '#1e3a8a',
                    900: '#1e2761'
                  },
                  'gold': {
                    500: '#d4af37',
                    600: '#b8941f'
                  },
                  'ivory': '#fdfcf8'
                }
              }
            }
          }
        `}} />
        
        {/* Theme Toggle Script - Load after TailwindCSS config */}
        <script src="/static/theme-toggle.js" defer></script>
      </head>
      <body class="bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">{children}</body>
    </html>
  )
})
