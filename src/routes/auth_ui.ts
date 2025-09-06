// src/routes/auth_ui.ts
import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'

const ui = new Hono()

// Local renderer to keep pages minimal (uses global Tailwind in base layout)
ui.use('*', jsxRenderer())

function Layout({ title, children }: { title: string; children: JSX.Element }) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-neutral-950 text-neutral-100">
        <main class="max-w-md mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}

ui.get('/login', (c) => {
  const csrf = 'js' // the API issues real csrf cookie on login success
  return c.html(
    <Layout title="Login">
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 space-y-4">
        <h1 class="text-xl font-semibold">Logga in</h1>
        <form id="login-form" class="space-y-3" method="post" action="/api/auth/login">
          <label class="block">
            <span class="block text-sm text-neutral-300 mb-1">Email</span>
            <input name="email" type="email" required class="w-full px-3 py-2 rounded bg-neutral-950/60 border border-neutral-800" />
          </label>
          <label class="block">
            <span class="block text-sm text-neutral-300 mb-1">Lösenord</span>
            <input name="password" type="password" required class="w-full px-3 py-2 rounded bg-neutral-950/60 border border-neutral-800" />
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" name="remember" class="accent-[var(--concillio-gold)]" /> Kom ihåg mig
          </label>
          <button type="submit" class="w-full px-4 py-2 rounded bg-[var(--gold)] text-black">Logga in</button>
          <div id="login-msg" class="text-sm text-red-400 hidden"></div>
        </form>
        <p class="text-sm text-neutral-400">Har du inget konto? <a class="text-[var(--concillio-gold)]" href="/signup">Skapa konto</a></p>
      </section>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var form = document.getElementById('login-form');
          var msg = document.getElementById('login-msg');
          form.addEventListener('submit', async function(e){
            e.preventDefault();
            msg.classList.add('hidden');
            var fd = new FormData(form);
            var body = { email: fd.get('email'), password: fd.get('password'), remember: fd.get('remember')==='on' };
            try{
              var res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
              var j = await res.json().catch(()=>({}));
              if (!res.ok || !j.ok) throw new Error(j.error || ('HTTP '+res.status));
              location.href = '/';
            }catch(err){ msg.textContent = (err && err.message) || 'Fel'; msg.classList.remove('hidden'); }
          });
        })();
      `}} />
    </Layout>
  )
})

ui.get('/signup', (c) => {
  return c.html(
    <Layout title="Signup">
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 space-y-4">
        <h1 class="text-xl font-semibold">Skapa konto</h1>
        <form id="signup-form" class="space-y-3" method="post" action="/api/auth/signup">
          <label class="block">
            <span class="block text-sm text-neutral-300 mb-1">Email</span>
            <input name="email" type="email" required class="w-full px-3 py-2 rounded bg-neutral-950/60 border border-neutral-800" />
          </label>
          <label class="block">
            <span class="block text-sm text-neutral-300 mb-1">Lösenord (min 12 tecken)</span>
            <input name="password" type="password" required minlength={12} class="w-full px-3 py-2 rounded bg-neutral-950/60 border border-neutral-800" />
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" name="remember" class="accent-[var(--concillio-gold)]" /> Kom ihåg mig
          </label>
          <button type="submit" class="w-full px-4 py-2 rounded bg-[var(--gold)] text-black">Skapa konto</button>
          <div id="signup-msg" class="text-sm text-red-400 hidden"></div>
        </form>
        <p class="text-sm text-neutral-400">Har du redan konto? <a class="text-[var(--concillio-gold)]" href="/login">Logga in</a></p>
      </section>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var form = document.getElementById('signup-form');
          var msg = document.getElementById('signup-msg');
          form.addEventListener('submit', async function(e){
            e.preventDefault();
            msg.classList.add('hidden');
            var fd = new FormData(form);
            var body = { email: fd.get('email'), password: fd.get('password'), remember: fd.get('remember')==='on' };
            try{
              var res = await fetch('/api/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
              var j = await res.json().catch(()=>({}));
              if (!res.ok || !j.ok) throw new Error(j.error || ('HTTP '+res.status));
              location.href = '/';
            }catch(err){ msg.textContent = (err && err.message) || 'Fel'; msg.classList.remove('hidden'); }
          });
        })();
      `}} />
    </Layout>
  )
})

export default ui
