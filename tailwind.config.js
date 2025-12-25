
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
        hyper: '#00f2ff',
        electric: '#7000ff',
        hot: '#ff007a',
        darker: '#030014',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '48px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
