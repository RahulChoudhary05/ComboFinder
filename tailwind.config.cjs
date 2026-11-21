/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Dark-only product: no light theme, so no `dark:` variants are needed.
  theme: {
    extend: {
      colors: {
        // Neutral (not blue-tinted) near-blacks. Elevation = one step lighter.
        ink: {
          950: "#0a0a0b",
          900: "#111113",
          850: "#161618",
          800: "#1c1c1f",
          700: "#26262a",
        },
        // Signature accent: acid lime on black. Used only where it carries meaning
        // (primary action, active state, "within budget", match totals).
        accent: { DEFAULT: "#cdf54b", hover: "#dbff6b", dim: "#9cbc2e" },
        // Secondary warm note: discounts & savings only.
        coral: { DEFAULT: "#ff8a65" },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      keyframes: {
        drift1: { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(8%,6%,0) scale(1.15)" } },
        drift2: { "0%,100%": { transform: "translate3d(0,0,0) scale(1.1)" }, "50%": { transform: "translate3d(-10%,4%,0) scale(0.95)" } },
        drift3: { "0%,100%": { transform: "translate3d(0,0,0) scale(1)" }, "50%": { transform: "translate3d(4%,-8%,0) scale(1.2)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        drift1: "drift1 26s ease-in-out infinite",
        drift2: "drift2 32s ease-in-out infinite",
        drift3: "drift3 38s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
}
