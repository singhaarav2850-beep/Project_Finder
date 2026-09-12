/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6EC",
        ink: "#1C1B1F",
        navy: {
          DEFAULT: "#24314F",
          light: "#3A4A72",
        },
        mustard: {
          DEFAULT: "#D99C2B",
          light: "#F0C878",
        },
        sage: "#5B7F5E",
        rust: "#B5533E",
        line: "#E4DCC8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        pin: "0 2px 0 rgba(28,27,31,0.08), 0 8px 16px -8px rgba(28,27,31,0.18)",
      },
    },
  },
  plugins: [],
};
