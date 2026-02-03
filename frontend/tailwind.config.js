/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff9e6",
          100: "#fff3cc",
          200: "#ffe699",
          300: "#ffd966",
          400: "#ffcc33",
          500: "#f5b800",
          600: "#c99400",
          700: "#9c7000",
          800: "#6f4c00",
          900: "#422800"
        }
      }
    }
  },
  plugins: []
}
