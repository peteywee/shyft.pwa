/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // ... your other extensions like colors ...

      // ADD THIS SECTION
      fontFamily: {
        body: ['"Inter"', 'sans-serif'], // Or whatever font you want
      },
    },
  },
  plugins: [],
};
