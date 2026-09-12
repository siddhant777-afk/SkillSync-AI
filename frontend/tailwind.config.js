/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        secondary: "#F4F4FF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        dark: "#111827",
        light: "#F9FAFB",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.08)",
      },

      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
}

