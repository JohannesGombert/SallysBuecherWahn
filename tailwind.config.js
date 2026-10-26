/** @type {import('tailwindcss').Config} */
// Designs (Nacht-Grimoire, Verwunschener Wald) definieren die Farben in src/index.css.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`
const shades = (name, steps) => Object.fromEntries(steps.map((n) => [n, v(`${name}-${n}`)]))

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: shades('night', [950, 900, 800, 700, 600, 500]),
        gold: shades('gold', [100, 200, 300, 400, 500, 600, 700]),
        ivory: shades('ivory', [50, 100, 200, 300]),
        moon: shades('moon', [200, 300, 400]),
        flame: v('flame'),
        rose: v('rose'),
        moss: v('moss'),
        danger: v('danger'),
        veil: v('veil'), // feine Linien/Flächen: hell auf dunklen Designs, dunkel auf hellen
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
