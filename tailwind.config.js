/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: "#004B87",     // синий Газпромбанка
          positive: "#27AE60",  // зелёный
          neutral: "#95A5A6",   // серый
          negative: "#C0392B",  // красный
          warning: "#F39C12",   // жёлто-оранжевый
        },
      },
    },
    plugins: [],
  }
  