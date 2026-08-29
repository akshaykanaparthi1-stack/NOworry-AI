/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          600: "#2563eb",
          700: "#1d4ed8",
        }
      }
    },
  },
  plugins: [],
}
