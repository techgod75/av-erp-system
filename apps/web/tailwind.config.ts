import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          500: '#0f766e',
          600: '#0d5b57',
          700: '#0d3b42',
        },
      },
    },
  },
  plugins: [],
};

export default config;
