/** @type {import('tailwindcss').Config} */
// Nacht-Grimoire: Mitternacht, Blattgold, Mondlicht, Elfenbein.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#060916',
          900: '#0b1024',
          800: '#0f1630',
          700: '#18224a',
          600: '#24305f',
          500: '#34437a',
        },
        gold: {
          100: '#f8ecc9',
          200: '#f0d99a',
          300: '#e6c67a',
          400: '#d9b25f',
          500: '#b98f3e',
          600: '#94702c',
          700: '#6b4f1e',
        },
        ivory: {
          50: '#fbf6ea',
          100: '#efe6d2',
          200: '#d9cdb2',
          300: '#b3a88f',
        },
        moon: { 200: '#cfe0ff', 300: '#a9c6ff', 400: '#8fb8ff' },
        flame: '#f2a65a',
        rose: '#e8a0c4',
        moss: '#84d1a5',
        danger: '#ef7a68',
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
