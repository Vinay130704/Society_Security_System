/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2C3E50",   
        secondary: "#3498DB", 
        background: "#F5F7FA",
        text: "#333333",      
      }
    },
  },
  plugins: [],
};
