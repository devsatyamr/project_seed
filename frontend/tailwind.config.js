/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0B0014',
          800: '#130025',
          700: '#1A0033',
        },
        neon: {
          purple: '#A855F7',
          glow: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
};