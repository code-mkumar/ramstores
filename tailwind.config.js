/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E2A16F",   // warm accent (buttons, highlights)
        background: "#FFF0DD", // main page background
        secondary: "#D1D3D4",  // borders, gray text
        accent: "#86B0BD",     // headings, active elements
      },
    },
  },
  plugins: [],
};
