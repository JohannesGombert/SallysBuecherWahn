/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tiefes Pflaumen-Lila – Primärfarbe
        brand: {
          50: '#f6f4fb',
          100: '#ece7f7',
          200: '#d9cfef',
          300: '#bda9e2',
          400: '#9b7cd0',
          500: '#7d55bd',
          600: '#663fa3',
          700: '#533385',
          800: '#452c6b',
          900: '#3a2758',
          950: '#241636',
        },
        // Warmes Bernstein/Koralle – Akzent
        ember: {
          50: '#fef6ee',
          100: '#fde9d3',
          200: '#fbcfa5',
          300: '#f8ac6d',
          400: '#f4823a',
          500: '#f06418',
          600: '#e14a0e',
          700: '#ba360f',
          800: '#942c14',
          900: '#782714',
        },
        // Cremefarbenes Papier – heller Hintergrund
        paper: {
          50: '#fdfbf7',
          100: '#faf5ea',
          200: '#f3e9d6',
          300: '#e9d9bd',
        },
        // Warmes Nacht-Schwarz – Dark Mode
        night: {
          700: '#2a2230',
          800: '#211b26',
          900: '#1a141f',
          950: '#120d16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        book: '0 18px 40px -16px rgba(58, 39, 88, 0.45)',
        'book-lg': '0 30px 60px -20px rgba(58, 39, 88, 0.55)',
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px -24px rgba(240, 100, 24, 0.5)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
