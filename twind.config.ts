import { defineConfig, presetExt, presetTailwind } from "./deps.ts";

export const twindConfig = defineConfig({
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
  },
  presets: [presetTailwind(), presetExt()],
  rules: [
    [
      "dim-links",
      {
        "&:not(:hover) a": { "@apply": "text-current" },
      },
    ],
    [
      "divide-dot",
      {
        "& > *:not(:last-child)::after": {
          "content": "'•'",
          "@apply": "mx-1.5 text(gray-400 dark:gray-600",
        },
      },
    ],
    [
      "divide-slash",
      {
        "& > *:not(:last-child)::after": {
          "content": "'/'",
          "@apply": "mx-1.5 text(gray-400 dark:gray-600)",
        },
      },
    ],
  ],
  preflight: {
    "& a": {
      "@apply":
        "text(blue-600 dark:blue-300) decoration(blue-400 dark:blue-600) hover:(underline decoration-current) ",
    },
  },
});

//   details: css(
//     apply`
//       text-sm leading-snug
//       children:(
//         my-2
//         first-child:my-0
//         last-child:mb-0
//       )
//       text(gray-500 dark:gray-400)
//     `,
//     {
//       "summary": apply`font-semibold`,
//       "&[open] summary": apply`mb-2`,
//     },
//   ),
// });
// `
