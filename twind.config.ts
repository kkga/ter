import * as colors from "twind/colors";
import { virtualSheet } from "twind/sheets";
import { Configuration } from "twind/";

export const sheet = virtualSheet();

export default {
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
    colors: {
      gray: colors.warmGray,
      accent: colors.blue,
      current: "currentColor",
      white: colors.white,
      black: colors.black,
    },
  },
  sheet,
} as Configuration;
