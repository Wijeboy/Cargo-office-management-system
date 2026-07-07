/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LogiFlow Brand Palette (from Stitch design system)
        'primary': '#041627',
        'on-primary': '#ffffff',
        'primary-container': '#1a2b3c',
        'on-primary-container': '#8192a7',
        'primary-fixed': '#d2e4fb',
        'primary-fixed-dim': '#b7c8de',
        'on-primary-fixed': '#0b1d2d',
        'on-primary-fixed-variant': '#38485a',

        'secondary': '#505f76',
        'on-secondary': '#ffffff',
        'secondary-container': '#d0e1fb',
        'on-secondary-container': '#54647a',
        'secondary-fixed': '#d3e4fe',
        'secondary-fixed-dim': '#b7c8e1',
        'on-secondary-fixed': '#0b1c30',
        'on-secondary-fixed-variant': '#38485d',

        'tertiary': '#001726',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#002d43',
        'on-tertiary-container': '#009adb',
        'tertiary-fixed': '#c9e6ff',
        'tertiary-fixed-dim': '#89ceff',
        'on-tertiary-fixed': '#001e2f',
        'on-tertiary-fixed-variant': '#004c6e',

        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        'surface': '#fbf9fa',
        'surface-dim': '#dbd9db',
        'surface-bright': '#fbf9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f3f4',
        'surface-container': '#efedef',
        'surface-container-high': '#e9e7e9',
        'surface-container-highest': '#e4e2e3',
        'surface-variant': '#e4e2e3',
        'surface-tint': '#4f6073',

        'on-surface': '#1b1c1d',
        'on-surface-variant': '#44474c',
        'on-background': '#1b1c1d',
        'background': '#fbf9fa',

        'outline': '#74777d',
        'outline-variant': '#c4c6cd',

        'inverse-surface': '#303032',
        'inverse-on-surface': '#f2f0f2',
        'inverse-primary': '#b7c8de',

        // Accent (cyan) — key brand color
        'accent': '#009adb',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'numeric-kpi': ['40px', { lineHeight: '48px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-xl-mobile': ['28px', { lineHeight: '34px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      spacing: {
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'container-max': '1440px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        'accent-glow': '0 4px 14px 0 rgba(0, 154, 219, 0.39)',
        'accent-glow-lg': '0 6px 20px rgba(0, 154, 219, 0.3)',
        'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 24px -8px rgba(0,0,0,0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 1s linear infinite',
        'pulse-dot': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
