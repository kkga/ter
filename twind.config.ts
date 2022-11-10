import * as colors from "twind/colors";
import { virtualSheet } from "twind/sheets";
import { apply, Configuration } from "twind/";

export const sheet = virtualSheet();

export default {
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
  },
  preflight: {
    a: apply`
      no-underline
      text(blue-600)
      hover:(
        bg-pink-100
        text-pink-600
      )
      dark:(
        text-pink-300
        hover:(
          text-pink-100
          bg-pink-900
        )
      )
    `,
  },
  sheet,
} as Configuration;
