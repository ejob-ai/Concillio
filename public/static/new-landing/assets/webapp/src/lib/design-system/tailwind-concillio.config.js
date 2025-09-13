// Tailwind Config för Concillio Design System
// Importera i din befintliga tailwind.config.js

const concillioConfig = {
  theme: {
    extend: {
      // Färger - Concillio Brand Palette
      colors: {
        // Brand colors
        'concillio-navy': '#0d1b3d',
        'concillio-gold': '#caa134', 
        'concillio-ink': '#132047',
        'concillio-paper': '#fffef9',
        
        // Semantic aliases
        'brand-primary': '#0d1b3d',
        'brand-accent': '#caa134',
        
        // Orbit colors
        'orbit-perspective': '#123e6b',
        'orbit-fast': '#0d2d4d',
        'orbit-exclusive': '#081e34',
        
        // Extended palette för olika states
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
          900: '#0d1b3d', // Brand navy
          950: '#070f1f',
        },
        'gold': {
          50: '#fef9e7',
          100: '#fdf3cf',
          200: '#fbe79f', 
          300: '#f9db6f',
          400: '#f7cf3f',
          500: '#caa134', // Brand gold
          600: '#b8941f',
          700: '#8a6f17',
          800: '#5c4a0f',
          900: '#2e2508',
          950: '#171204',
        }
      },

      // Typography - Fluid Responsive Scale
      fontSize: {
        // Concillio fluid typography
        'fluid-h1': ['clamp(2rem, 6.5vw, 5.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'fluid-h2': ['clamp(1.75rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],  
        'fluid-h3': ['clamp(1.375rem, 3.2vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'fluid-subcopy': ['clamp(1rem, 2.2vw, 1.375rem)', { lineHeight: '1.35', fontStyle: 'italic' }],
        'fluid-body': ['clamp(0.9375rem, 1.8vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-small': ['clamp(0.8125rem, 1.6vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-cta': ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.1', letterSpacing: '0.025em' }],
      },

      // Font Families
      fontFamily: {
        'concillio-serif': ['"Crimson Text"', 'Georgia', 'ui-serif', 'serif'],
        'concillio-sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // Spacing - Fluid System
      spacing: {
        // Fluid spacing tokens
        'fluid-xs': 'clamp(0.5rem, 1.2vw, 0.875rem)',
        'fluid-sm': 'clamp(0.75rem, 2vw, 1.5rem)', 
        'fluid-md': 'clamp(1rem, 2.5vw, 2rem)',
        'fluid-lg': 'clamp(1.5rem, 3vw, 2.5rem)',
        'fluid-xl': 'clamp(2rem, 4vw, 4rem)',
        'fluid-2xl': 'clamp(3rem, 6vw, 6rem)',
        'fluid-3xl': 'clamp(4rem, 8vw, 8rem)',
        
        // Special spacing
        'section': 'clamp(4rem, 10vw, 10rem)',
        'ceremonial': 'clamp(6rem, 12vw, 15rem)',
      },

      // Shadows - Concillio Premium Effects  
      boxShadow: {
        'gold-subtle': '0 2px 8px rgba(202, 161, 52, 0.1)',
        'gold-medium': '0 8px 25px rgba(202, 161, 52, 0.15)',
        'gold-strong': '0 12px 35px rgba(202, 161, 52, 0.4)',
        'gold-glow': '0 0 20px rgba(202, 161, 52, 0.3)',
        'navy-subtle': '0 4px 12px rgba(13, 27, 61, 0.08)',
        'navy-medium': '0 8px 20px rgba(13, 27, 61, 0.12)',
        'navy-strong': '0 16px 48px rgba(13, 27, 61, 0.16)',
        'orbit': '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(202, 161, 52, 0.4)',
      },

      // Border Radius
      borderRadius: {
        'concillio': '12px',
        'concillio-lg': '16px',
      },

      // Animations & Keyframes
      keyframes: {
        'orbit-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.95)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' }
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      
      animation: {
        'orbit': 'orbit-spin 48s linear infinite',
        'orbit-mobile': 'orbit-spin 56s linear infinite', 
        'pulse-gold': 'pulse-gold 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },

      // Gradients  
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #fefeff 0%, #faf9f6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #caa134 0%, #b8941f 100%)',
        'navy-gradient': 'linear-gradient(135deg, #0d1b3d 0%, #1e2761 100%)',
        'orbit-center': 'radial-gradient(circle at 30% 30%, #0d1b3d 85%, #081a33 100%)',
        'storytelling': 'linear-gradient(135deg, #0d1b3d 0%, #050c20 100%)',
      },

      // Container Sizes
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem', 
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    }
  },

  // Plugins för custom utilities
  plugins: [
    // Custom Concillio utilities
    function({ addUtilities, theme }) {
      addUtilities({
        // Typography utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty', 
        },
        
        // Orbit utilities
        '.orbit-container': {
          'position': 'relative',
          'display': 'grid',
          'place-items': 'center',
          'isolation': 'isolate',
        },
        '.orbit-satellite': {
          'position': 'absolute',
          'left': '50%',
          'top': '50%',
          'transform': 'translate(-50%, -50%)',
        },
        
        // Fluid utilities
        '.fluid-padding': {
          'padding': 'clamp(1rem, 2.5vw, 2rem)',
        },
        '.fluid-margin': {
          'margin': 'clamp(1rem, 2.5vw, 2rem)',
        },
        
        // Premium effects
        '.gold-ring': {
          'box-shadow': '0 0 0 1px rgba(202, 161, 52, 0.4)',
        },
        '.gold-glow': {
          'box-shadow': '0 0 20px rgba(202, 161, 52, 0.3)',
        }
      })
    },

    // Responsive typography plugin
    function({ addComponents, theme }) {
      addComponents({
        '.concillio-hero-title': {
          'font-size': 'clamp(2rem, 6.5vw, 5.5rem)',
          'line-height': '1.08',
          'font-weight': '700',
          'letter-spacing': '-0.02em',
          'text-wrap': 'balance',
          'font-family': theme('fontFamily.concillio-serif'),
        },
        '.concillio-section-title': {
          'font-size': 'clamp(1.75rem, 5vw, 4rem)', 
          'line-height': '1.1',
          'font-weight': '600',
          'letter-spacing': '-0.015em',
          'text-wrap': 'balance',
        },
        '.concillio-cta-button': {
          'font-size': 'clamp(1rem, 2vw, 1.125rem)',
          'font-weight': '600',
          'letter-spacing': '0.025em',
          'padding': 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
          'border-radius': theme('borderRadius.concillio'),
          'background': theme('backgroundImage.gold-gradient'),
          'color': 'white',
          'transition': 'all 0.3s ease',
          'box-shadow': theme('boxShadow.gold-medium'),
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': theme('boxShadow.gold-strong'),
          }
        }
      })
    }
  ],
}

// Export för användning i din befintliga config
module.exports = concillioConfig;

// Alternativ export som merge-funktion  
module.exports.mergeConcillioConfig = (existingConfig = {}) => {
  return {
    ...existingConfig,
    theme: {
      ...existingConfig.theme,
      extend: {
        ...existingConfig.theme?.extend,
        ...concillioConfig.theme.extend
      }
    },
    plugins: [
      ...(existingConfig.plugins || []),
      ...concillioConfig.plugins
    ]
  }
}