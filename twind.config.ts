import { apply, css, TwindConfiguration, virtualSheet } from "./deps.ts";

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
        text(blue-600 dark:blue-300)
        no-underline
        hover:(underline)
      `,
      {
        textUnderlineOffset: "4px",
      },
    ),
  },
  sheet,
} as TwindConfiguration;
