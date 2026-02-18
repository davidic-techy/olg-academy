/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olg: {
          blue: '#2D6A9F',
          btn: '#3B7DAD',
          green: '#9DE38D',
          dark: '#1e4b6e',
        }
      }
    },
  },
  plugins: [],
}