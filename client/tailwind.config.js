/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdba5',
          300: '#ffc06d',
          400: '#ff9d33',
          500: '#ff820b',
          600: '#f06400',
          700: '#c74a02',
          800: '#9e3a0b',
          900: '#7f320c',
        },
        forest: {
          50: '#f0f9f1',
          100: '#dcf0de',
          200: '#bbe1c0',
          300: '#8dca97',
          400: '#57ab66',
          500: '#348c45',
          600: '#246f34',
          700: '#1d592b',
          800: '#1a4724',
          900: '#163a1f',
        },
        cream: {
          50: '#fffdf7',
          100: '#fdf6e9',
          200: '#faedd0',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
