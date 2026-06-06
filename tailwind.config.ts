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
        // Paytm for Business palette
        navy: { DEFAULT: '#00204A', soft: '#0A2E5C' },
        brand: { DEFAULT: '#00B9F5', dark: '#0098CC', tint: '#E6F7FE' },
        amber: { DEFAULT: '#F5A623', dark: '#D98E0F', soft: '#FEF6E7' },
        danger: { DEFAULT: '#E53935', soft: '#FDECEA' },
        success: { DEFAULT: '#26A65B', soft: '#E8F6EE' },
        warn: { DEFAULT: '#F5A623', soft: '#FEF6E7' },
        ink: '#00204A',
        slate: '#33475B',
        muted: '#6B8099',
        canvas: '#F0F6FA',
        surface: '#FFFFFF',
        line: 'rgba(0,185,245,0.15)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '11px',
        xs: '12px',
        sm: '13px',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,32,74,0.04)',
        pop: '0 8px 30px rgba(0,32,74,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 1.1s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,185,245,0.35)' },
          '70%': { boxShadow: '0 0 0 10px rgba(0,185,245,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,185,245,0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
