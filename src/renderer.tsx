import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="sv" data-app-root>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Concillio – Council of Minds</title>
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var m = document.documentElement;
            try{
              var mql = window.matchMedia('(prefers-color-scheme: dark)');
              if (mql.matches) m.classList.add('dark'); else m.classList.remove('dark');
            }catch(e){}
          })();
        ` }} />
      </head>
      <body class="bg-[#0b0d10] text-neutral-100">{children}</body>
    </html>
  )
})
