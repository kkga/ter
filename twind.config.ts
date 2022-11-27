import {
  colors,
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
    colors: {
      gray: colors.stone,
      transparent: "transparent",
      white: colors.white,
      black: colors.black,
      primary: colors.sky,
      current: "currentColor",
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
            text(primary-600 dark:(primary-300))
            font-normal
            no-underline
            hover:(bg(primary-100 dark:primary-900))
          `,
        },
        "a[rel~='external']": {
          "@apply": "hover:(bg(transparent dark:transparent) underline)",
        },
        "h1,h2,h3,h4,h5,h6": {
          "& > .h-anchor": {
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
          "del": { "@apply": "text-gray-500" },
          "@apply": "relative -ml-4 pl-4 hover:([&>.h-anchor]:opacity-100)",
        },

        "& dt": { "@apply": "font-semibold" },

        "& .full-bleed": { "@apply": "lg:(-mx-24) xl:(-mx-32)" },
        "& .cols-2": { "@apply": "sm:grid grid(cols-2) gap-x-4" },
        "& .cols-3": { "@apply": "sm:grid grid(cols-3) gap-x-4" },
        "& .cols-4": { "@apply": "grid grid(cols-2 md:cols-4) gap-x-4" },
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
  //       text(primary-600 dark:primary-300)
  //       decoration(primary-400 dark:primary-600)
  //       hover:(underline decoration-current)
  //     `,
  //   },
  // },
});
