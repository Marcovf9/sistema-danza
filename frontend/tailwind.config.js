/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-dark': '#16082A',
        'brand-dark-hover': '#220C3A',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 100%)',
      },
    },
  },
  plugins: [],
}