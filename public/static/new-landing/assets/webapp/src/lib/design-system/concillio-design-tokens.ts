// Design Tokens för Concillio - TypeScript/Hono kompatibel
export const concillioTokens = {
  // Färger - Brand Identity
  colors: {
    brand: {
      navy: '#0d1b3d',
      gold: '#caa134',
      ink: '#132047',
      paper: '#fffef9',
    },
    semantic: {
      primary: '#0d1b3d',
      accent: '#caa134',
      background: '#fffef9',
      surface: '#f8fafc',
      muted: '#64748b',
    },
    orbit: {
      perspective: '#123e6b',
      fast: '#0d2d4d', 
      exclusive: '#081e34',
    }
  },

  // Typography Scale - Fluid Responsive
  typography: {
    scale: {
      h1: 'clamp(2rem, 6.5vw, 5.5rem)',     // 32px → 88px
      h2: 'clamp(1.75rem, 5vw, 4rem)',      // 28px → 64px  
      h3: 'clamp(1.375rem, 3.2vw, 2.25rem)', // 22px → 36px
      subcopy: 'clamp(1rem, 2.2vw, 1.375rem)', // 16px → 22px
      body: 'clamp(0.9375rem, 1.8vw, 1.125rem)', // 15px → 18px
      small: 'clamp(0.8125rem, 1.6vw, 1rem)',    // 13px → 16px
      cta: 'clamp(1rem, 2vw, 1.125rem)',         // 16px → 18px
    },
    lineHeight: {
      tight: '1.08',
      normal: '1.1', 
      relaxed: '1.2',
      loose: '1.35',
      body: '1.6',
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.015em',
      wide: '0.025em',
    },
    families: {
      serif: '"Crimson Text", Georgia, ui-serif, serif',
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
    }
  },

  // Spacing System - Fluid Responsive  
  spacing: {
    fluid: {
      xs: 'clamp(0.5rem, 1.2vw, 0.875rem)',   // 8px → 14px
      sm: 'clamp(0.75rem, 2vw, 1.5rem)',      // 12px → 24px  
      md: 'clamp(1rem, 2.5vw, 2rem)',         // 16px → 32px
      lg: 'clamp(1.5rem, 3vw, 2.5rem)',       // 24px → 40px
      xl: 'clamp(2rem, 4vw, 4rem)',           // 32px → 64px
      '2xl': 'clamp(3rem, 6vw, 6rem)',        // 48px → 96px
      '3xl': 'clamp(4rem, 8vw, 8rem)',        // 64px → 128px
    },
    section: 'clamp(4rem, 10vw, 10rem)',      // Sektioner
    ceremonial: 'clamp(6rem, 12vw, 15rem)',   // Ceremoniella element
  },

  // Shadows & Effects
  shadows: {
    gold: {
      subtle: '0 2px 8px rgba(202, 161, 52, 0.1)',
      medium: '0 8px 25px rgba(202, 161, 52, 0.15)', 
      strong: '0 12px 35px rgba(202, 161, 52, 0.4)',
      glow: '0 0 20px rgba(202, 161, 52, 0.3)',
    },
    navy: {
      subtle: '0 4px 12px rgba(13, 27, 61, 0.08)',
      medium: '0 8px 20px rgba(13, 27, 61, 0.12)',
      strong: '0 16px 48px rgba(13, 27, 61, 0.16)',
    }
  },

  // Border Radius
  radius: {
    sm: '8px',
    md: '12px', 
    lg: '16px',
    full: '9999px',
  },

  // Animation Timings
  animation: {
    orbit: '48s',
    orbitMobile: '56s', 
    pulse: '4s',
    transition: '0.3s',
    hover: '0.2s',
  },

  // Breakpoints (för JavaScript/SSR logik)
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  }
} as const;

// Hjälpfunktioner för SSR/Hono JSX
export const theme = {
  // CSS Custom Properties generator
  getCSSVariables: () => `
    --concillio-navy: ${concillioTokens.colors.brand.navy};
    --concillio-gold: ${concillioTokens.colors.brand.gold};
    --concillio-paper: ${concillioTokens.colors.brand.paper};
    
    --fluid-h1: ${concillioTokens.typography.scale.h1};
    --fluid-h2: ${concillioTokens.typography.scale.h2};
    --fluid-h3: ${concillioTokens.typography.scale.h3};
    
    --space-sm: ${concillioTokens.spacing.fluid.sm};
    --space-md: ${concillioTokens.spacing.fluid.md};
    --space-lg: ${concillioTokens.spacing.fluid.lg};
  `,
  
  // Responsive checker för SSR
  isMobile: (userAgent: string) => {
    return /Mobile|Android|iPhone|iPad/i.test(userAgent);
  },
  
  // Tailwind klasser generator
  getUtilityClasses: () => ({
    // Typography
    'text-fluid-h1': 'text-[clamp(2rem,6.5vw,5.5rem)] leading-tight font-bold',
    'text-fluid-h2': 'text-[clamp(1.75rem,5vw,4rem)] leading-tight font-semibold', 
    'text-fluid-h3': 'text-[clamp(1.375rem,3.2vw,2.25rem)] leading-snug font-medium',
    
    // Colors  
    'text-concillio-navy': 'text-[#0d1b3d]',
    'text-concillio-gold': 'text-[#caa134]',
    'bg-concillio-paper': 'bg-[#fffef9]',
    
    // Spacing
    'p-fluid-sm': 'p-[clamp(0.75rem,2vw,1.5rem)]',
    'p-fluid-md': 'p-[clamp(1rem,2.5vw,2rem)]',
    'p-fluid-lg': 'p-[clamp(1.5rem,3vw,2.5rem)]',
  })
};

// Type exports för TypeScript
export type ConcillioColors = typeof concillioTokens.colors;
export type ConcillioTypography = typeof concillioTokens.typography;
export type ConcillioSpacing = typeof concillioTokens.spacing;