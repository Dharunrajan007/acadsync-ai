/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1B1F2A',
          soft: '#4A5163',
          // 4.87:1 on white, 4.55:1 on canvas — passes WCAG AA for body text.
          muted: '#6B7183',
          // Non-text only (icons, dividers, decorative glyphs).
          faint: '#9AA0B0',
        },
        canvas: '#F6F7FB',
        brand: {
          50: '#EEF1FF',
          100: '#E0E5FF',
          200: '#C6CFFF',
          300: '#A2B0FC',
          400: '#7C8AF6',
          500: '#5B65EC',
          600: '#4444D6',
          700: '#3736AE',
          800: '#2E308C',
          900: '#282A6F',
        },
        violetx: {
          50: '#F6F2FF',
          100: '#EDE6FF',
          200: '#DCCFFF',
          300: '#C3ADFB',
          400: '#A784F4',
          500: '#8B5CF0',
          600: '#7642DA',
          700: '#6233B4',
          800: '#512D92',
          900: '#442976',
        },
        // DEFAULT is the text tone: every one clears 4.5:1 on white, on canvas and
        // on its own tint. `mark` is the fill used for bars, dots and rings — kept
        // lighter because the darkened text tones collapse to deltaE 2.9 under
        // deuteranopia and stop being tellable apart as chart marks.
        safe: { DEFAULT: '#0B7A5A', mark: '#10906B' },
        warn: { DEFAULT: '#9A6700', mark: '#C3820B' },
        risk: { DEFAULT: '#C33A3A', mark: '#D14343' },
        info: { DEFAULT: '#2166BC', mark: '#2A72CC' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,24,40,0.04), 0 1px 3px rgba(20,24,40,0.04)',
        lift: '0 4px 12px -2px rgba(20,24,40,0.08), 0 12px 28px -8px rgba(20,24,40,0.10)',
        pop: '0 20px 48px -12px rgba(27,31,42,0.24)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.25s ease-out both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
