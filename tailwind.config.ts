import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        pitch: { 950: "#04170F", 900: "#06231A", 800: "#0B3B2C", 700: "#115239", 600: "#1A6B4A", 500: "#23895E" },
        gold: { DEFAULT: "#D4A93C", light: "#E8C873", dark: "#A8841F" },
        chalk: { DEFAULT: "#F4F5EF", dim: "#C9D1C8", mute: "#8FA397" },
        live: "#E5484D",
        win: "#3DDC84",
        navy: { 900: "#0A1428", 800: "#101C38" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-bn)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: ".4", transform: "scale(.8)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { pulseDot: "pulseDot 1.6s ease-in-out infinite", shimmer: "shimmer 1.6s infinite" },
    },
  },
  plugins: [],
};
export default config;
