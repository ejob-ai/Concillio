// Concillio UI Components - Integrerat med befintligt projekt
import type { FC, PropsWithChildren } from 'hono/jsx'

// ===== LAYOUT COMPONENTS =====

interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export const Container: FC<PropsWithChildren<ContainerProps>> = ({ 
  children, 
  size = 'lg', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl', 
    xl: 'max-w-7xl',
    full: 'max-w-none'
  }
  
  return (
    <div class={`${sizeClasses[size]} mx-auto px-fluid-md ${className}`}>
      {children}
    </div>
  )
}

// ===== HERO SECTION =====

interface ConcillioHeroProps {
  title: string
  subtitle?: string
  cta?: {
    text: string
    href: string
  }
  className?: string
}

export const ConcillioHero: FC<ConcillioHeroProps> = ({ 
  title, 
  subtitle, 
  cta, 
  className = '' 
}) => {
  return (
    <section class={`concillio-hero ${className}`}>
      <Container>
        <h1 class="concillio-hero-title">
          {title}
        </h1>
        
        {subtitle && (
          <p class="concillio-hero-subtitle">
            {subtitle}
          </p>
        )}
        
        {cta && (
          <div class="mt-8">
            <a href={cta.href} class="concillio-cta group">
              <span>{cta.text}</span>
              <span class="text-lg transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        )}
      </Container>
    </section>
  )
}

// ===== ORBITAL COUNCIL VISUALIZATION =====

interface OrbitSatellite {
  icon: string
  label: string
  angle: number
  description?: string
}

interface ConcillioOrbitProps {
  centerContent?: string
  satellites?: OrbitSatellite[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ConcillioOrbit: FC<ConcillioOrbitProps> = ({ 
  centerContent = 'C',
  satellites = [],
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-80 h-80',
    lg: 'w-96 h-96'
  }
  
  const radiusMap = {
    sm: '8rem',
    md: '10rem', 
    lg: '12rem'
  }
  
  return (
    <div class={`orbit-system ${sizeClasses[size]} mx-auto ${className}`}>
      {/* Orbital Ring */}
      <div class="orbit-ring" />
      
      {/* Center Element */}
      <div class="orbit-center">
        {centerContent}
      </div>
      
      {/* Satellites */}
      {satellites.map((satellite, i) => (
        <div
          key={i}
          class="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${satellite.angle}deg)`
          }}
        >
          <div
            class="absolute flex flex-col items-center -translate-y-full"
            style={{
              transform: `translateY(-${radiusMap[size]}) rotate(-${satellite.angle}deg)`
            }}
          >
            {/* Satellite Badge */}
            <div class="w-12 h-12 rounded-full bg-orbit-center border-2 border-concillio-gold/70 flex items-center justify-center shadow-gold-medium z-10">
              <span class="text-concillio-gold text-sm">{satellite.icon}</span>
            </div>
            
            {/* Label - only show on desktop */}
            {satellite.label && (
              <div class="hidden md:block text-xs text-concillio-navy mt-2 text-center font-medium bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-concillio-gold/40 max-w-20">
                {satellite.label}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ===== INVITE FORM COMPONENT =====

interface ConcillioInviteFormProps {
  onSubmit?: (data: any) => void
  className?: string
}

export const ConcillioInviteForm: FC<ConcillioInviteFormProps> = ({ 
  onSubmit,
  className = '' 
}) => {
  return (
    <form 
      class={`space-y-6 ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())
        onSubmit?.(data)
      }}
    >
      {/* Name Field */}
      <div>
        <label class="block text-sm font-medium text-concillio-navy mb-2">
          Fullständigt namn
        </label>
        <input
          type="text"
          name="name"
          required
          class="w-full px-4 py-3 border-2 border-concillio-gold/30 rounded-xl bg-white/95 text-concillio-navy placeholder:text-gray-400 focus:border-concillio-gold focus:outline-none focus:shadow-gold-medium transition-all duration-300"
          placeholder="Ditt fullständiga namn"
        />
      </div>
      
      {/* Email Field */}
      <div>
        <label class="block text-sm font-medium text-concillio-navy mb-2">
          E-postadress
        </label>
        <input
          type="email"
          name="email"
          required
          class="w-full px-4 py-3 border-2 border-concillio-gold/30 rounded-xl bg-white/95 text-concillio-navy placeholder:text-gray-400 focus:border-concillio-gold focus:outline-none focus:shadow-gold-medium transition-all duration-300"
          placeholder="din@email.com"
        />
      </div>
      
      {/* Role Field */}
      <div>
        <label class="block text-sm font-medium text-concillio-navy mb-2">
          Professionell bakgrund
        </label>
        <select
          name="role" 
          required
          class="w-full px-4 py-3 border-2 border-concillio-gold/30 rounded-xl bg-white/95 text-concillio-navy focus:border-concillio-gold focus:outline-none focus:shadow-gold-medium transition-all duration-300"
        >
          <option value="">Välj din roll</option>
          <option value="ceo">VD/Grundare</option>
          <option value="executive">Ledning</option>
          <option value="manager">Mellanchef</option>
          <option value="consultant">Konsult</option>
          <option value="entrepreneur">Entreprenör</option>
          <option value="investor">Investerare</option>
          <option value="other">Annat</option>
        </select>
      </div>
      
      {/* Challenge Field */}
      <div>
        <label class="block text-sm font-medium text-concillio-navy mb-2">
          Beskriv ditt största strategiska dilemma
        </label>
        <textarea
          name="challenge"
          rows={4}
          class="w-full px-4 py-3 border-2 border-concillio-gold/30 rounded-xl bg-white/95 text-concillio-navy placeholder:text-gray-400 focus:border-concillio-gold focus:outline-none focus:shadow-gold-medium transition-all duration-300 resize-y"
          placeholder="Vilken typ av strategiska beslut behöver du hjälp med? Ju mer specifik, desto bättre kan vi matcha dig med rätt expertråd."
        />
      </div>
      
      {/* Submit Button */}
      <div class="text-center">
        <button
          type="submit"
          class="concillio-cta group w-full sm:w-auto"
        >
          <span>Begär Inbjudan</span>
          <span class="text-lg transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
      
      {/* Privacy Note */}
      <p class="text-xs text-gray-500 text-center">
        Vi behandlar din information med största diskretion. Läs mer om vår{' '}
        <a href="/privacy" class="text-concillio-gold hover:underline">
          integritetspolicy
        </a>
        .
      </p>
    </form>
  )
}

// ===== SECTION WRAPPER =====

interface SectionProps {
  background?: 'default' | 'secondary' | 'navy' | 'gradient'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Section: FC<PropsWithChildren<SectionProps>> = ({ 
  children,
  background = 'default',
  spacing = 'lg',
  className = '' 
}) => {
  const backgroundClasses = {
    default: 'bg-[var(--bg-primary)]',
    secondary: 'bg-[var(--bg-secondary)]',
    navy: 'bg-navy-gradient text-white',
    gradient: 'bg-hero-gradient'
  }
  
  const spacingClasses = {
    sm: 'py-fluid-lg',
    md: 'py-fluid-xl',
    lg: 'py-section',
    xl: 'py-ceremonial'
  }
  
  return (
    <section class={`${backgroundClasses[background]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  )
}

// ===== FEATURE CARDS =====

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  className?: string
}

export const FeatureCard: FC<FeatureCardProps> = ({ 
  icon,
  title, 
  description,
  className = ''
}) => {
  return (
    <div class={`bg-white border border-concillio-gold/20 rounded-2xl p-fluid-lg text-center hover:shadow-gold-medium hover:border-concillio-gold/40 hover:-translate-y-1 transition-all duration-300 ${className}`}>
      {/* Icon */}
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-orbit-center border-2 border-concillio-gold/70 flex items-center justify-center shadow-gold-medium">
        <span class="text-concillio-gold text-xl">{icon}</span>
      </div>
      
      {/* Title */}
      <h3 class="text-fluid-h3 font-semibold text-concillio-navy mb-3">
        {title}
      </h3>
      
      {/* Description */}
      <p class="text-fluid-body text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// ===== TESTIMONIAL CARD =====

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company?: string
  className?: string
}

export const Testimonial: FC<TestimonialProps> = ({ 
  quote,
  author,
  role, 
  company,
  className = ''
}) => {
  return (
    <div class={`bg-white/95 border border-concillio-gold/20 rounded-2xl p-fluid-lg shadow-gold-subtle ${className}`}>
      {/* Quote */}
      <blockquote class="text-fluid-subcopy italic text-concillio-navy mb-4 font-concillio-serif">
        "{quote}"
      </blockquote>
      
      {/* Author */}
      <div class="border-t border-concillio-gold/20 pt-4">
        <div class="font-semibold text-concillio-navy">
          {author}
        </div>
        <div class="text-sm text-gray-600">
          {role}{company && `, ${company}`}
        </div>
      </div>
    </div>
  )
}

// ===== THEME TOGGLE =====

export const ThemeToggle: FC = () => {
  return (
    <button 
      id="theme-toggle"
      class="fixed top-4 right-4 w-12 h-12 rounded-full border-2 border-concillio-gold bg-[var(--bg-primary)] text-concillio-gold hover:scale-110 hover:shadow-gold-glow transition-all duration-300 flex items-center justify-center z-50"
      title="Växla tema"
    >
      <span class="text-lg">🌓</span>
    </button>
  )
}

// ===== UTILITY COMPONENTS =====

interface BadgeProps {
  variant?: 'gold' | 'navy' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({ 
  children,
  variant = 'gold',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    gold: 'bg-concillio-gold text-white',
    navy: 'bg-concillio-navy text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-gray-900'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  return (
    <span class={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}

// ===== STATS COMPONENT =====

interface StatProps {
  value: string
  label: string
  description?: string
}

interface StatsGridProps {
  stats: StatProps[]
  columns?: 2 | 3 | 4
  className?: string
}

export const StatsGrid: FC<StatsGridProps> = ({ 
  stats,
  columns = 3,
  className = ''
}) => {
  return (
    <div class={`grid grid-cols-1 md:grid-cols-${columns} gap-8 ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} class="text-center">
          <div class="text-fluid-h2 font-bold text-concillio-gold font-concillio-serif">
            {stat.value}
          </div>
          <div class="text-fluid-body font-semibold text-concillio-navy mt-2">
            {stat.label}
          </div>
          {stat.description && (
            <div class="text-fluid-small text-gray-600 mt-1">
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Export all components
export const ConcillioUI = {
  Container,
  ConcillioHero,
  ConcillioOrbit, 
  ConcillioInviteForm,
  Section,
  FeatureCard,
  Testimonial,
  ThemeToggle,
  Badge,
  StatsGrid
}