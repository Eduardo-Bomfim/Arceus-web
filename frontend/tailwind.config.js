/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      colors: {
        ide: {
          bg: "#0f141c",
          surface: "#182232",
          panel: "#131b27",
          border: "#243247",
          accent: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
}
