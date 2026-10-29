/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F4ECE0',
          300: '#E7D8C4',
        },
        wood: {
          50: '#F9F5F0',
          100: '#F0E6D6',
          200: '#DFCDB5',
          300: '#C7AC8A',
          400: '#A98358',
          500: '#8B5A2B',
          600: '#75471F',
          700: '#5E3717',
          800: '#46270E',
          900: '#2F1807',
        },
        charcoal: {
          700: '#3D4440',
          800: '#2A2E2C',
          900: '#1D211F',
          950: '#121514',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        queen: {
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'board': '0 8px 30px -4px rgba(78, 45, 18, 0.12), 0 4px 12px -2px rgba(78, 45, 18, 0.08)',
        'wood-inset': 'inset 0 2px 4px rgba(47, 24, 7, 0.25)',
      }
    },
  },
  plugins: [],
}

