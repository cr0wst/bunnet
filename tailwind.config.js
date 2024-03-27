/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        logo: ['"Shadows Into Light"', 'cursive']
      },
      colors: {
        primary: {
          50: '#f5f6f6',
          100: '#e4e9e9',
          200: '#cdd4d2',
          300: '#a9b7b5',
          400: '#7f918e',
          500: '#647673',
          600: '#556563',
          700: '#495555',
          800: '#414949',
          900: '#394040',
          950: '#1a1e1e'
        }
      }
    }
  },
  plugins: []
}
