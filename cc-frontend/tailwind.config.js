/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  // @ts-ignore
  presets: [require('nativewind/preset')],
  theme: {
    extend: {}
  },
  plugins: []
};
