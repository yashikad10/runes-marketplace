

const customColors = {
  primary: {
    DEFAULT: "#04020E",
    dark: "#1F1D3E",
  },
  secondary: {
    DEFAULT: "#0A041D",
    dark: "#A8A4A4",
  },
  accent: {
    DEFAULT: "#4c94f3",
  },
  accent_primary: {
    DEFAULT: "#9C23ED",
  },
  accent_secondary: {
    DEFAULT: "#7600C5",
  },
  accent_dark: "#3D0263",
  light_gray: "#84848A",
  black: "#0C0D0C",
  bitcoin: "#EAB308",
  dark_gray: "#A6A6A6",
  violet: "#0B071E",
  dark_violet_700: "#0C082A",
  dark_violet_600: "#161232",
  bitcoin_orange: "#FFA800",
  bitcoin_apes_bg: " #3A3C41",
  custom_bg: "#FFFFFF14",
  mint_bg: "#04020E",
  gradient_bg_second: "#53018A",
  bg_gradient_1: "#181621",
  bg_gradient_2: "#110F18",
  green: "#85FF3A",
  mint_blur_bg: "#ffffff1a",
};
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false,
  theme: {
    fontFamily: {
      sans: ['"Facebook Sans"', "sans-serif"], //
    },
    extend: {
      colors: customColors,
      height: {
        "vh-10": "10vh",
        "vh-20": "20vh",
        "vh-30": "30vh",
        "vh-40": "40vh",
        "vh-50": "50vh",
        "vh-60": "60vh",
        "vh-70": "70vh",
        "vh-80": "80vh",
        "vh-90": "90vh",
        "vh-100": "100vh",
        "vh-110": "110vh",
        "vh-120": "120vh",
        "vh-130": "130vh",
        "vh-140": "140vh",
        "vh-150": "150vh",
        "vh-175": "175vh",
      },
      screens: {
        "3xl": "2048px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};