# Concillio Design Integration Guide för Din Stack

## 🎯 Integrationsstrategi för Hono + Tailwind + SSR

### 1. **Design Tokens Setup (TypeScript)**

Lägg `concillio-design-tokens.ts` i ditt projekt:
```typescript
// src/lib/design-tokens.ts
import { concillioTokens, theme } from './concillio-design-tokens'

// Använd i Hono routes
app.get('/', (c) => {
  const userAgent = c.req.header('user-agent') || ''
  const isMobile = theme.isMobile(userAgent)
  
  return c.html(
    <Layout mobile={isMobile}>
      <Hero title="Intelligent Beslutsstöd" />
    </Layout>
  )
})
```

### 2. **Tailwind Config Integration** 

Uppdatera din befintliga `tailwind.config.js`:
```javascript
const { mergeConcillioConfig } = require('./tailwind-concillio.config.js')

module.exports = mergeConcillioConfig({
  // Din befintliga config
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // ... andra inställningar
})
```

Eller merge manuellt:
```javascript  
const concillioConfig = require('./tailwind-concillio.config.js')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      ...concillioConfig.theme.extend,
      // Dina egna tillägg
    }
  },
  plugins: [
    ...concillioConfig.plugins,
    // Dina egna plugins
  ]
}
```

### 3. **Hono JSX Components Integration**

Sätt upp komponentsystemet i ditt projekt:
```typescript
// src/components/index.ts
export * from './concillio-components'

// src/routes/landing.tsx
import { Hero, OrbitCouncil, FeatureCard } from '../components'

app.get('/', (c) => {
  return c.html(
    <ConcillioThemeProvider>
      <html lang="sv">
        <head>
          <title>Concillio - Intelligent Beslutsstöd</title>
          <link rel="stylesheet" href="/static/tailwind.css" />
        </head>
        <body>
          <Hero 
            title="Få Expertråd på Minuter"
            subtitle="AI-drivna specialister analyserar ditt dilemma från alla vinklar"
            cta={{ text: "Testa Gratis", href: "/signup" }}
          />
          
          <Section background="secondary">
            <Container>
              <OrbitCouncil 
                satellites={[
                  { icon: "⚖️", label: "Juridik", angle: 0 },
                  { icon: "🔧", label: "Teknik", angle: 90 },
                  { icon: "❤️", label: "Etik", angle: 180 },
                  { icon: "📊", label: "Affär", angle: 270 }
                ]}
              />
            </Container>
          </Section>
        </body>
      </html>
    </ConcillioThemeProvider>
  )
})
```

### 4. **CSS Custom Properties för Dynamiska Teman**

Injicera CSS-variabler baserat på server-side logik:
```typescript
// src/middleware/theme.ts
export const themeMiddleware = async (c: Context, next: Next) => {
  // Läs tema från cookie/database/user preference
  const userTheme = c.req.cookie('theme') || 'system'
  
  // Sätt CSS variabler baserat på tema
  const cssVariables = theme.getCSSVariables(userTheme)
  
  // Lägg till i response context
  c.set('themeCSS', cssVariables)
  
  await next()
}
```

### 5. **Integration med Din Befintliga Arkitektur**

#### **A) Med D1 Database - Användarspecifika Teman**
```typescript
// Spara tema-preferenser i D1
app.post('/api/user/theme', async (c) => {
  const { theme } = await c.req.json()
  const userId = c.get('userId')
  
  await c.env.DB.prepare(`
    INSERT OR REPLACE INTO user_preferences (user_id, theme, updated_at) 
    VALUES (?, ?, datetime('now'))
  `).bind(userId, theme).run()
  
  return c.json({ success: true })
})
```

#### **B) Med KV för Feature Flags**
```typescript
// Aktivera/inaktivera Concillio design features
app.use('*', async (c, next) => {
  const concillioEnabled = await c.env.FLAGS_KV.get('concillio_design')
  
  if (concillioEnabled === 'true') {
    // Använd Concillio design system
    c.set('useDesignSystem', 'concillio')
  } else {
    // Fallback till befintlig design
    c.set('useDesignSystem', 'legacy')
  }
  
  await next()
})
```

#### **C) Med Rate Limiting - Premium Themes**
```typescript
// Premium tema-features med rate limiting
app.post('/api/theme/premium', rateLimitMiddleware('premium-theme', 10), async (c) => {
  // Premium tema-funktioner för betalande användare
})
```

### 6. **Vite Build Integration**

Uppdatera din `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    rollupOptions: {
      external: ['@cloudflare/workers-types']
    }
  }
})
```

### 7. **TypeScript Type Integration**

Lägg till types för ditt projekt:
```typescript
// src/types/concillio.ts
import type { ConcillioColors, ConcillioTypography } from '../lib/concillio-design-tokens'

export interface ConcillioTheme {
  colors: ConcillioColors
  typography: ConcillioTypography
  isDark: boolean
  isMobile: boolean
}

// Extend Hono context med design system
declare module 'hono' {
  interface ContextVariableMap {
    concillioTheme: ConcillioTheme
    useDesignSystem: 'concillio' | 'legacy'
    themeCSS: string
  }
}
```

### 8. **Performance Optimizations**

#### **A) CSS Purging för Produktion**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './concillio-components.tsx'  // Inkludera design system
  ],
  
  // Purge unused Concillio classes i production
  safelist: [
    /^concillio-/,
    /^text-fluid-/,
    /^orbit-/,
  ]
}
```

#### **B) Critical CSS för SSR**
```typescript
// Extrahera critical CSS för above-the-fold content
const criticalCSS = `
  ${theme.getCSSVariables()}
  .concillio-hero-title { font-size: clamp(2rem, 6.5vw, 5.5rem); }
  .concillio-cta-button { /* ... */ }
`

app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      {/* ... */}
    </html>
  )
})
```

### 9. **Migration Strategy - Steg för Steg**

#### **Fas 1: Setup (1-2 dagar)**
1. ✅ Lägg till design tokens i projektet
2. ✅ Uppdatera Tailwind config
3. ✅ Testa grundläggande komponenter

#### **Fas 2: Core Pages (3-5 dagar)**
1. 🔄 Migrera hero section med `Hero` component
2. 🔄 Implementera orbital visualization med `OrbitCouncil`
3. 🔄 Uppdatera formulär med `Input` komponenter

#### **Fas 3: Advanced Features (5-7 dagar)**
1. ⏳ Integrera tema-system med D1/KV
2. ⏳ Lägg till responsiva animationer
3. ⏳ Optimera performance och bundling

#### **Fas 4: Testing & Polish (2-3 dagar)**
1. ⏳ Testa på alla devices (mobile, tablet, desktop)
2. ⏳ Accessibility audit
3. ⏳ Performance optimization

### 10. **Development Workflow**

```bash
# 1. Utvecklingsmiljö
cd /home/user/webapp && npm run build
cd /home/user/webapp && pm2 start ecosystem.config.cjs

# 2. Testa design system lokalt
curl http://localhost:3000  # Verifiera att Concillio design laddas

# 3. Uppdatera design tokens
# Editera concillio-design-tokens.ts
# Restart development server

# 4. Deploy till Cloudflare Pages
cd /home/user/webapp && npm run build && wrangler pages deploy dist
```

## 🚀 Nästa Steg

1. **Starta med tokens**: Kopiera `concillio-design-tokens.ts` till ditt projekt
2. **Uppdatera Tailwind**: Merge `tailwind-concillio.config.js` med din config  
3. **Testa en komponent**: Implementera `Hero` på en testsida
4. **Iterera steg för steg**: Migrera sida för sida till det nya design systemet

Vill du att jag hjälper dig med någon specifik del av integrationen?