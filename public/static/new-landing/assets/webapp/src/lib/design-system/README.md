# Concillio Design System

Modulärt designsystem optimerat för Hono + Tailwind + Cloudflare Pages stack.

## 🚀 Snabbstart

### Installation
```bash
# Kopiera filerna till ditt projekt
cp -r concillio-design-system/* src/lib/design-system/
```

### 1. Design Tokens Setup
```typescript
// src/lib/design-tokens.ts
import { concillioTokens, theme } from './design-system/concillio-design-tokens'

// Använd i Hono routes
app.get('/', (c) => {
  return c.html(
    <ConcillioThemeProvider>
      <Hero title="Din Titel" />
    </ConcillioThemeProvider>
  )
})
```

### 2. Tailwind Config
```javascript
// tailwind.config.js
const { mergeConcillioConfig } = require('./src/lib/design-system/tailwind-concillio.config.js')

module.exports = mergeConcillioConfig({
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // Din befintliga config
})
```

### 3. Komponenter
```typescript
import { Hero, OrbitCouncil, Button } from './lib/design-system/concillio-components'

// Använd i JSX
<Hero 
  title="Intelligent Beslutsstöd"
  subtitle="AI-experter analyserar ditt dilemma" 
  cta={{ text: "Kom igång", href: "/signup" }}
/>
```

## 📦 Innehåll

### Design Tokens (`concillio-design-tokens.ts`)
- ✅ Färgsystem (Navy, Gold, Paper)
- ✅ Typografi-skala (Fluid responsive)
- ✅ Spacing-system (Fluid spacing)
- ✅ Animationer & Timings
- ✅ TypeScript-typer

### Tailwind Config (`tailwind-concillio.config.js`)
- ✅ Concillio-specifika färger
- ✅ Fluid typography utilities
- ✅ Custom komponenter (`.concillio-hero-title`, etc.)
- ✅ Premium effekter (shadows, gradients)
- ✅ Plugins för orbital system

### Komponenter (`concillio-components.tsx`)
- ✅ `ConcillioThemeProvider` - Theme system
- ✅ `Hero` - Hero sections med CTA
- ✅ `OrbitCouncil` - Orbital visualization
- ✅ `FeatureCard` - Feature cards
- ✅ `Button` - Premium buttons
- ✅ `Typography` - Typografi komponenter
- ✅ `Container` - Layout containers
- ✅ `Section` - Section wrappers
- ✅ `Input` - Form components

## 🎯 Stack Integration

### Hono SSR
```typescript
app.get('/page', (c) => {
  const userAgent = c.req.header('user-agent') || ''
  const isMobile = theme.isMobile(userAgent)
  
  return c.html(
    <Layout mobile={isMobile}>
      <Hero title="Responsive Title" />
    </Layout>
  )
})
```

### Cloudflare D1 Integration
```typescript
// Spara tema-preferenser
await c.env.DB.prepare(`
  INSERT OR REPLACE INTO user_themes (user_id, theme) 
  VALUES (?, ?)
`).bind(userId, theme).run()
```

### Feature Flags via KV
```typescript
const useNewDesign = await c.env.FLAGS_KV.get('concillio_design')
if (useNewDesign === 'true') {
  // Använd Concillio design system
}
```

## 🎨 Design Principles

### Fluid Responsive
- Alla storlekar använder `clamp()` för fluid scaling
- Optimerat för 360px → 2000px+ screens
- Mobile-first approach

### Performance
- CSS containment för animationer
- GPU-accelererade transforms
- Minimal bundle size
- Tree-shakeable komponenter

### Accessibility  
- WCAG AA-compliant kontrast
- Keyboard navigation
- Screen reader support
- Reduced motion support

### Theme System
- Light/Dark/System modes
- CSS custom properties
- Server-side theme detection
- Persistent via localStorage/cookies

## 📱 Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: 640,   // Tailwind 'sm'
  tablet: 768,   // Tailwind 'md'  
  desktop: 1024, // Tailwind 'lg'
  wide: 1280,    // Tailwind 'xl'
}
```

## 🔧 Development

### Local Development
```bash
cd /home/user/webapp 
npm run build
pm2 start ecosystem.config.cjs
```

### Testing
```bash
curl http://localhost:3000  # Testa att design laddas
```

### Build för Produktion
```bash
npm run build
wrangler pages deploy dist --project-name webapp
```

## 📐 Usage Examples

### Basic Page
```typescript
export default function LandingPage() {
  return (
    <ConcillioThemeProvider>
      <Section>
        <Container>
          <Typography variant="hero" as="h1">
            Välkommen till Concillio
          </Typography>
          
          <OrbitCouncil
            satellites={[
              { icon: "⚖️", label: "Juridik", angle: 0 },
              { icon: "🔧", label: "Teknik", angle: 90 },
              { icon: "❤️", label: "Etik", angle: 180 },
              { icon: "📊", label: "Affär", angle: 270 }
            ]}
          />
          
          <Button href="/signup" variant="primary">
            Kom igång
          </Button>
        </Container>
      </Section>
    </ConcillioThemeProvider>
  )
}
```

### Features Grid
```typescript
const features = [
  { icon: "⚡", title: "Snabbt", description: "Svar på minuter" },
  { icon: "🎯", title: "Exakt", description: "AI-driven precision" },
  { icon: "🔒", title: "Säkert", description: "Enterprise-grade säkerhet" }
]

return (
  <Section background="secondary">
    <Container>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </div>
    </Container>
  </Section>
)
```

### Form Integration
```typescript
<form onSubmit={handleSubmit}>
  <Input 
    type="email" 
    placeholder="Din e-postadress"
    name="email"
    required 
  />
  
  <Input 
    type="textarea"
    placeholder="Beskriv ditt dilemma..." 
    name="message"
  />
  
  <Button type="submit" variant="primary" size="lg">
    Skicka Till Rådet
  </Button>
</form>
```

## 🚀 Migration Guide

Se detaljerad guide i `integration-guide.md` för steg-för-steg migration från befintligt system.

## 📄 License

MIT License - Se LICENSE för detaljer.