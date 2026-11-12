/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#05060a',
          900: '#0a0c12',
          850: '#10131b',
          800: '#171b26',
          700: '#242a38',
          500: '#5b6478',
          400: '#8a93a6',
          300: '#b3bbcc',
          100: '#eef1f7',
        },
        neon: {
          red: '#ff2d55',
          green: '#39ff88',
          blue: '#2de2ff',
        },
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
      },
      keyframes: {
        'rgb-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45, 226, 255, 0.35)' },
          '50%': { boxShadow: '0 0 28px 4px rgba(45, 226, 255, 0.25)' },
        },
      },
      animation: {
        'rgb-flow': 'rgb-flow 6s linear infinite',
        'rise-in': 'rise-in 0.6s ease-out both',
        'glow-pulse': 'glow-pulse 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
