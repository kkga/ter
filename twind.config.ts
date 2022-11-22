import {
  defineConfig,
  presetAutoprefix,
  presetExt,
  presetTailwind,
  presetTypography,
} from "./deps.ts";

export const twindConfig = defineConfig({
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
  },
  presets: [
    presetAutoprefix(),
    presetTailwind(),
    presetExt(),
    presetTypography({
      colors: {
        "pre-bg": "50",
        "pre-code": "900",
        dark: {
          "pre-bg": "900",
          "pre-code": "100",
        },
      },
      extend: {
        "a": {
          "@apply": `
            text(sky-600 dark:sky-400)
            no-underline
            font-normal
          `,
          "&:hover": {
            "@apply": "underline decoration-dashed",
          },
        },
        "a[rel~='external']": {
          "@apply":
            "text(current dark:current) underline decoration(dotted hover:solid)",
        },
        "h1,h2,h3,h4,h5,h6": {
          "@apply": "relative -ml-4 pl-4 hover:([&>.h-anchor]:opacity-100)",
        },
        ".h-anchor": {
          "@apply": `
              -ml-9
              transition-opacity
              absolute my-auto top-0 bottom-0
              hidden sm:flex
              justify-center items-center
              w-6 h-6 rounded
              text(base gray-600 dark:gray-400) !no-underline
              border(1 solid gray-300 dark:gray-700)
              opacity(0 hover:100)) 
              bg(hover:(gray-200 dark:gray-800))
            `,
        },
      },
    }),
  ],
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
  // preflight: {
  //   "& a": {
  //     "@apply": `
  //       text(blue-600 dark:blue-300)
  //       decoration(blue-400 dark:blue-600)
  //       hover:(underline decoration-current)
  //     `,
  //   },
  // },
});
