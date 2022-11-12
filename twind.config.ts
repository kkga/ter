import { virtualSheet } from "twind/sheets";
import { apply, Configuration } from "twind/";
import { css } from "twind/css";

export const sheet = virtualSheet();

export default {
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
  },
  preflight: {
    a: css(
      apply`
        no-underline
        text(pink-600 dark:pink-300)
        hover:(underline)
      `,
      {
        textUnderlineOffset: "4px",
      },
    ),
  },
  sheet,
} as Configuration;
