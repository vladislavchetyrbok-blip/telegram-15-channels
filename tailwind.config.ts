import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: "#0d1324",
        panelSoft: "#111a2f",
        line: "rgba(148, 163, 184, 0.16)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 238, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
