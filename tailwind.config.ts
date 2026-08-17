import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#243028",
        moss: "#58705d",
        cream: "#f7f3e9",
        apricot: "#e98b5b",
        leaf: "#dce6d8",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(47, 59, 49, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
