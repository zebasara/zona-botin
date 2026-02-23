/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'slide-out-right': 'slideOutRight 0.35s ease-in forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(110%)', opacity: 0 },
          to:   { transform: 'translateX(0)',    opacity: 1 },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)',    opacity: 1 },
          to:   { transform: 'translateX(110%)', opacity: 0 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.8)', opacity: 0 },
          '60%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',   opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
