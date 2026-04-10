export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkBg: "#0b1120",
        darkCard: "#1e293b",
        darkText: "#e2e8f0",
      },
    },
  },
  plugins: [require("daisyui")],
};