/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,vue,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-beige': '#FDFBF7',
        'brand-olive': '#6B6B4F', // Lighter olive from button screenshot
        'brand-cream': '#FDFBF7',
        'brand-peach': '#FADDC6', // For image placeholder
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
