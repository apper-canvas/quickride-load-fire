/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8'
        },
        secondary: {
          DEFAULT: '#64748b',
          light: '#94a3b8',
          dark: '#475569'
        },
        accent: '#f59e0b',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'neu-light': 'inset 5px 5px 10px #d1d5db, inset -5px -5px 10px #ffffff',
        'neu-dark': 'inset 5px 5px 10px #111827, inset -5px -5px 10px #374151'
      },
borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'expand': 'expand 0.3s ease-out',
        'collapse': 'collapse 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'matching-dots': 'matchingDots 1.2s ease-in-out infinite',
        'matching-pulse-3min': 'matchingPulse3Min 180s linear infinite',
      },
      keyframes: {
        expand: {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'auto', opacity: '1' }
        },
        collapse: {
          '0%': { height: 'auto', opacity: '1' },
          '100%': { height: '0', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        matchingDots: {
          '0%, 20%': { opacity: '0.3' },
          '50%': { opacity: '1' },
          '80%, 100%': { opacity: '0.3' }
        }
      }
    },
  },
  plugins: [],
}