/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#742CFF',
          50: '#f3eeff',
          100: '#e4d9ff',
          200: '#c9b3ff',
          300: '#a580ff',
          400: '#8c55ff',
          500: '#742CFF',
          600: '#5f10f0',
          700: '#4e0acc',
          800: '#3d0a9e',
          900: '#2d0975',
          950: '#1a0047',
        },
        accent: {
          DEFAULT: '#00FFB6',
          50: '#e6fff6',
          100: '#b3ffdf',
          200: '#80ffc8',
          300: '#4dffb6',
          400: '#1affa5',
          500: '#00FFB6',
          600: '#00cc92',
          700: '#00996d',
          800: '#006649',
          900: '#003324',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    }
  },
  plugins: []
};
