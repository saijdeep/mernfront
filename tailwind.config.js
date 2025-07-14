import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
 
    daisyui: {
      themes: [
        {
          mytheme: {
            "primary": "#9A0680",
            "secondary": "#79018C",
            "accent": "#4C0070",
            "neutral": "#160040",
            "base-100": "#160040",
            "info": "#9A0680",
            "success": "#79018C",
            "warning": "#4C0070",
            "error": "#9A0680",
          },
        },
      ],
    },
    plugins: [daisyui],
};
