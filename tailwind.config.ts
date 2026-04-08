import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb1d5',
          300: '#7892c4',
          400: '#5a7ab8',
          500: '#3c62ac',
          600: '#345aa5',
          700: '#2a509b',
          800: '#1a365d',
          900: '#1a202c',
        },
        disaster: {
          earthquake: '#e53e3e',
          tsunami: '#3182ce',
          typhoon: '#6b46c1',
          flood: '#2b6cb0',
          landslide: '#744210',
          volcano: '#c05621',
          fire: '#e53e3e',
          snowstorm: '#4a5568',
          heatwave: '#d69e2e',
          other: '#718096',
        },
      },
    },
  },
  plugins: [],
};
export default config;
