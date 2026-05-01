/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#aa3bff",
      },
      fontFamily: {
        sans: ["system-ui", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["system-ui", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
