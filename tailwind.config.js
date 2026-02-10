/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'avengers-red': '#B82E3E',
        'avengers-blue': '#002D5C',
        'avengers-gold': '#C5A059',
        'hulk-green': '#5A9446',
        'thor-silver': '#C0C0C0',
        'thor-lightning': '#00BFFF', // Deep Sky Blue
        'widow-black': '#111111',
        'widow-red': '#FF0000', // Black Widow hourglass red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Bangers', 'cursive'],
      },
    },
  },
  plugins: [],
}
