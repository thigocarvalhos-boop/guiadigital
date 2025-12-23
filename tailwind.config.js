
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./constants.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00f2ff',
        secondary: '#10b981',
        dark: '#020617',
        surface: '#0f172a',
      },
      fontFamily: {
        archivo: ['Archivo Black', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
