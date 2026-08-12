/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080b",
          900: "#0c0e13",
          800: "#12151c",
          700: "#1a1e28",
          600: "#242936",
        },
        gold: {
          200: "#f3e2c6",
          300: "#e4c79a",
          400: "#d4b084",
          500: "#c4965c",
          700: "#8a6432",
        },
        moss: "#8faf8a",
        ember: "#c9844a",
        rose: "#d98980",
        mist: "#a8b0bd",
        paper: "#ece6dc",
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        window: "0 30px 80px -28px rgba(0,0,0,0.72), 0 0 0 1px rgba(212,176,132,0.08)",
        glow: "0 0 40px -8px rgba(212,176,132,0.35)",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
