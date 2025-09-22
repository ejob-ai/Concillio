/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./public/**/*.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        concillio: {
          gold: "#d4af37",
          petrol: "#0f766e",
          purple: "#6d28d9",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Crimson Text"', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
    },
  },
  plugins: [],
}
