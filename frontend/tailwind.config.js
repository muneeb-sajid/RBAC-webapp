/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0B1220',
          900: '#0F172A',
          800: '#141F35',
          700: '#1C2A45',
          600: '#27395C',
        },
        surface: {
          DEFAULT: '#F6F7FB',
          card: '#FFFFFF',
          border: '#E6E8F0',
          muted: '#F0F2F7',
        },
        brand: {
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C6CAFE',
          300: '#A5ABFB',
          400: '#7C82F5',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#372DA6',
          800: '#2C2585',
          900: '#241F6B',
        },
        success: { 50: '#ECFDF5', 500: '#059669', 600: '#047857', 700: '#065F46' },
        warning: { 50: '#FFFBEB', 500: '#D97706', 600: '#B45309', 700: '#92400E' },
        danger: { 50: '#FEF2F2', 500: '#DC2626', 600: '#B91C1C', 700: '#991B1B' },
        info: { 50: '#EFF6FF', 500: '#2563EB', 600: '#1D4ED8', 700: '#1E40AF' },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
        popover: '0 4px 6px -2px rgba(16, 24, 40, 0.05), 0 12px 16px -4px rgba(16, 24, 40, 0.1)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: 0, transform: 'translateX(12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'slide-up': 'slide-up 0.22s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
