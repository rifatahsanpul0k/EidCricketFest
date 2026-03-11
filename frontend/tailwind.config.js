/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        space: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#E51A1A", // ECF Red
          hover: "#C41515",
          light: "rgba(229, 26, 26, 0.15)",
        },
        secondary: {
          DEFAULT: "#1E40AF", // Deep Blue
          hover: "#1D4ED8",
          light: "rgba(30, 64, 175, 0.15)",
        },
        neutral: {
          900: "#000000",
          800: "#0A0A0A",
          700: "#171717",
          600: "#262626",
          500: "#404040",
          400: "#737373",
          300: "#A3A3A3",
          200: "#E5E5E5",
          100: "#F5F5F5",
        },
        white: {
          DEFAULT: "#FFFFFF",
          10: "rgba(255, 255, 255, 0.10)",
          20: "rgba(255, 255, 255, 0.20)",
          40: "rgba(255, 255, 255, 0.40)",
          50: "rgba(255, 255, 255, 0.50)",
          60: "rgba(255, 255, 255, 0.60)",
          70: "rgba(255, 255, 255, 0.70)",
        },
        black: {
          DEFAULT: "#000000",
          10: "rgba(0, 0, 0, 0.10)",
          90: "rgba(0, 0, 0, 0.90)",
        },
      },
      letterSpacing: {
        "wide-sm": "0.7px",
        "wide-md": "1.2px",
        "wide-lg": "3.2px",
        mega: "4px",
        ultra: "6px",
      },
    },
  },
  plugins: [],
};
