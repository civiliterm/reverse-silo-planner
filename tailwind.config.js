import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // ensures all TS/TSX/JS/JSX files are scanned
  ],
  theme: {
    extend: {
      // Optional: customize your theme here
      colors: {
        brand: {
          light: '#6366f1', // optional: a "brand" color
          dark: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
