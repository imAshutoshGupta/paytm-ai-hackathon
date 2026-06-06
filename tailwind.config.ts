import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        ink: { DEFAULT: '#0A0A0A', soft: '#171717' },
        muted: '#6B7280',
        subtle: '#9CA3AF',
        line: { DEFAULT: '#E5E5E5', soft: '#F0F0F0' },
        accent: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          soft: '#EEF2FF',
          ring: '#C7D2FE',
        },
        success: { DEFAULT: '#16A34A', soft: '#F0FDF4' },
        warning: { DEFAULT: '#B45309', soft: '#FFFBEB' },
        danger: { DEFAULT: '#DC2626', soft: '#FEF2F2' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgba(220,38,38,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
