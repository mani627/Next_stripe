/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        md: { 'max': '786px' }, // Custom max-width for 'md' breakpoint
      },
      fontFamily: {
        body: 'var(--font-dm-sans)',
        heading: 'var(--font-dm-serif)',
      },
    },
  },
  plugins: [],
};
