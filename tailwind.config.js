/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './hp12c/index.html',
    './termos/index.html',
    './obrigado/index.html',
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        anek: ['"Anek Latin"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-green-light': '#22c55e',
        'brand-green': '#166534',
        'brand-green-dark': '#0b4021',
        'brand-ink': '#4B4B4B',
        'brand-surface': '#F6F6F6',
        highlight: '#18181b',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
}
