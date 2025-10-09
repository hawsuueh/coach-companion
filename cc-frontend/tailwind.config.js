/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  // @ts-ignore
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ['InterRegular', 'sans-serif'],
        'inter-light': ['InterLight', 'sans-serif'],
        'inter-medium': ['InterMedium', 'sans-serif'],
        'inter-bold': ['InterBold', 'sans-serif'],
        poetsen: ['PoetsenOne', 'sans-serif']
      },
      colors: {
        primary: '#F0F0F0',
        accent: '#EC1D25',
        success: '#008659',
        error: '#F62121',
        warning: '#FACC15',
        info: '#2563EB',
        black: '#000000',
        white: '#FFFFFF'
      }
    }
  },
  plugins: []
};
