import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#5de0ef",
          DEFAULT: "#4dd9e8",
          dark: "#38c7d6",
        },
        accent: {
          pink: "#f472b6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        mobile: "430px",
      },
    },
  },
  plugins: [],
};

export default config;