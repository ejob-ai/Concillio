// Concillio Design System Components för Hono JSX
import type { FC, PropsWithChildren } from 'hono/jsx'
import { concillioTokens, theme } from './concillio-design-tokens'

// Theme Provider - Injicerar CSS variabler i <head>
export const ConcillioThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${theme.getCSSVariables()}
            
            /* Theme system */
            --bg-primary: var(--concillio-paper);
            --text-primary: var(--concillio-navy);
            --accent-primary: var(--concillio-gold);
          }
          
          [data-theme="dark"] {
            --bg-primary: #050c20;
            --text-primary: #e8eaf6;
            --accent-primary: #ffd54f;
          }
          
          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              --bg-primary: #050c20;
              --text-primary: #e8eaf6; 
              --accent-primary: #ffd54f;
            }
          }
        `
      }} />
      {children}
    </>
  )
}

// Layout Container - Responsive max-width med fluid padding
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

// Typography Components
interface TypographyProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  variant?: 'hero' | 'section' | 'subsection' | 'body' | 'subcopy' | 'small' | 'cta'
  className?: string
}

export const Typography: FC<PropsWithChildren<TypographyProps>> = ({ 
  children, 
  as = 'p', 
  variant = 'body',
  className = '' 
}) => {
  const Component = as
  
  const variantClasses = {
    hero: 'concillio-hero-title text-concillio-navy font-concillio-serif',
    section: 'concillio-section-title text-concillio-navy font-concillio-serif',
    subsection: 'text-fluid-h3 font-semibold text-concillio-navy',
    body: 'text-fluid-body text-gray-700 leading-relaxed',
    subcopy: 'text-fluid-subcopy italic text-gray-600',
    small: 'text-fluid-small text-gray-500',
    cta: 'text-fluid-cta font-semibold tracking-wide'
  }
  
  return (
    <Component class={`${variantClasses[variant]} ${className}`}>
      {children}
    </Component>
  )
}

// Hero Section Component
interface HeroProps {
  title: string
  subtitle?: string
  cta?: {
    text: string
    href: string
    onClick?: () => void
  }
  className?: string
}

export const Hero: FC<HeroProps> = ({ title, subtitle, cta, className = '' }) => {
  return (
    <section class={`bg-hero-gradient py-section text-center ${className}`}>
      <Container>
        <Typography as="h1" variant="hero" className="mb-4">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="subcopy" className="mb-8 max-w-2xl mx-auto">
            {subtitle}
          </Typography>
        )}
        
        {cta && (
          <div class="mt-8">
            <a 
              href={cta.href}
              class="concillio-cta-button inline-flex items-center gap-3 no-underline"
              onClick={cta.onClick}
            >
              <span>{cta.text}</span>
              <span class="text-lg">→</span>
            </a>
          </div>
        )}
      </Container>
    </section>
  )
}

// Orbital Council Visualization
interface OrbitProps {
  centerContent?: string
  satellites?: Array<{
    icon: string
    label: string
    angle: number
  }>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const OrbitCouncil: FC<OrbitProps> = ({ 
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
  
  return (
    <div class={`orbit-container ${sizeClasses[size]} ${className}`}>
      {/* Orbital Ring */}
      <div class="absolute inset-0 rounded-full border border-concillio-gold/25 opacity-50 animate-orbit" />
      
      {/* Center Element */}
      <div class="w-20 h-20 rounded-full bg-orbit-center border-3 border-concillio-gold flex items-center justify-center z-10 font-concillio-serif text-2xl font-bold text-concillio-gold shadow-orbit">
        {centerContent}
      </div>
      
      {/* Satellites */}
      {satellites.map((satellite, i) => (
        <div
          key={i}
          class="orbit-satellite"
          style={{
            transform: `translate(-50%, -50%) rotate(${satellite.angle}deg) translateY(-${sizeClasses[size].includes('64') ? '8rem' : sizeClasses[size].includes('80') ? '10rem' : '12rem'}) rotate(-${satellite.angle}deg)`
          }}
        >
          <div class="w-12 h-12 rounded-full bg-orbit-center border-2 border-concillio-gold/70 flex items-center justify-center shadow-gold-medium">
            <span class="text-concillio-gold text-sm">{satellite.icon}</span>
          </div>
          <div class="text-xs text-concillio-navy mt-2 text-center font-medium bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-concillio-gold/40 hidden md:block">
            {satellite.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// Feature Card Component
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
    <div class={`bg-white border border-concillio-gold/20 rounded-concillio-lg p-fluid-lg text-center hover:shadow-gold-medium hover:border-concillio-gold/40 transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-orbit-center border-2 border-concillio-gold/70 flex items-center justify-center shadow-gold-medium">
        <span class="text-concillio-gold text-xl">{icon}</span>
      </div>
      
      <Typography as="h3" variant="subsection" className="mb-2">
        {title}
      </Typography>
      
      <Typography variant="body" className="text-gray-600">
        {description}
      </Typography>
    </div>
  )
}

// Premium Button Component
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-concillio transition-all duration-300 no-underline'
  
  const variantClasses = {
    primary: 'concillio-cta-button',
    secondary: 'bg-white text-concillio-navy border-2 border-concillio-gold/30 hover:border-concillio-gold hover:shadow-gold-subtle',
    ghost: 'text-concillio-navy hover:text-concillio-gold hover:bg-concillio-gold/5'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-fluid-md py-3 text-fluid-cta',
    lg: 'px-fluid-lg py-4 text-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`
  
  if (href) {
    return (
      <a href={href} class={classes} onClick={onClick}>
        {children}
      </a>
    )
  }
  
  return (
    <button class={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// Section Wrapper  
interface SectionProps {
  background?: 'default' | 'secondary' | 'navy' | 'storytelling'
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
    default: 'bg-concillio-paper',
    secondary: 'bg-gray-50',
    navy: 'bg-navy-gradient text-white',
    storytelling: 'bg-storytelling text-white'
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

// Theme Toggle Button
export const ThemeToggle: FC = () => {
  return (
    <button 
      class="fixed top-4 right-4 w-12 h-12 rounded-full border-2 border-concillio-gold bg-concillio-paper text-concillio-gold hover:scale-110 hover:shadow-gold-glow transition-all duration-300 flex items-center justify-center z-50"
      onClick={() => {
        // Theme toggle logik - ska implementeras i client-side JS
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          const current = root.getAttribute('data-theme') || 'system';
          const themes = ['system', 'light', 'dark'];
          const next = themes[(themes.indexOf(current) + 1) % themes.length];
          
          if (next === 'system') {
            root.removeAttribute('data-theme');
          } else {
            root.setAttribute('data-theme', next);
          }
          
          localStorage.setItem('theme', next);
        }
      }}
      title="Toggle theme"
    >
      <span class="text-lg">🌓</span>
    </button>
  )
}

// Form Components
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  value?: string
  name?: string
  required?: boolean
  className?: string
}

export const Input: FC<InputProps> = ({ 
  type = 'text',
  placeholder,
  value,
  name,
  required = false,
  className = ''
}) => {
  const baseClasses = 'w-full p-4 border-2 border-concillio-gold/30 rounded-concillio bg-white/95 text-concillio-navy placeholder:text-gray-400 focus:border-concillio-gold focus:outline-none focus:shadow-gold-medium transition-all duration-300'
  
  if (type === 'textarea') {
    return (
      <textarea
        class={`${baseClasses} resize-y min-h-[120px] ${className}`}
        placeholder={placeholder}
        name={name}
        required={required}
        value={value}
      />
    )
  }
  
  return (
    <input
      type={type}
      class={`${baseClasses} ${className}`}
      placeholder={placeholder}
      name={name}
      required={required}
      value={value}
    />
  )
}

// Export all components och utilities
export const ConcillioUI = {
  ConcillioThemeProvider,
  Container,
  Typography,
  Hero,
  OrbitCouncil,
  FeatureCard,
  Button,
  Section,
  ThemeToggle,
  Input,
  
  // Utility exports
  tokens: concillioTokens,
  theme
}

// Type exports
export type { 
  ContainerProps, 
  TypographyProps, 
  HeroProps, 
  OrbitProps, 
  FeatureCardProps, 
  ButtonProps, 
  SectionProps,
  InputProps 
}