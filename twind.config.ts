import {
  defineConfig,
  presetAutoprefix,
  presetExt,
  presetTailwind,
  presetTypography,
} from "./deps.ts";

import { neutral, neutralDark, accent, accentDark, darkColor } from "./deps.ts";

export const twindConfig = defineConfig({
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
  },
  presets: [
    presetAutoprefix(),
    presetTailwind({
      colors: {
        neutral,
        neutralDark,
        accent,
        accentDark,
      },
    }),
    presetExt(),
    presetTypography({
      defaultColor: "neutral",
      colors: {
        body: "12",
        headings: "12",
        lead: "10",
        links: "12",
        bold: "12",
        counters: "9",
        bullets: "9",
        hr: "7",
        quotes: "12",
        "quote-borders": "6",
        captions: "11",
        code: "11",
        "pre-code": "11",
        "pre-bg": "1",
        "th-borders": "7",
        "td-borders": "6",
      },
      extend: {
        ".lead": { "@apply": "m-0" },
        a: {
          "@apply": `
            px-0.5
            -mx-0.5
            font-normal
            no-underline
            text-accent-11
            rounded-sm
            hover:(bg-accent-6 text-accent-12 decoration-current)
          `,
        },
        "a[rel~='external']": {
          "@apply":
            "after:(content-['↗'] no-underline text-xs ml-0.5 align-text-top)",
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
              text(base neutral-9 hover:(accent-12)) !no-underline
              opacity(0 hover:100)) 
            `,
          },
          "@apply": "relative -ml-4 pl-4 hover:([&>.h-anchor]:opacity-100)",
        },
        pre: { "@apply": "border border(neutral-7) bg-transparent rounded-sm" },
        del: { "@apply": "opacity-60" },
        small: { "@apply": "text-neutral-11" },
        details: { "@apply": "text-neutral-11" },

        "& dt": { "@apply": "font-semibold" },
        "& *:last-child": { "@apply": "mb-0" },

        "& .full-bleed": { "@apply": "lg:(-mx-24) xl:(-mx-32)" },
        "& .cols-2": { "@apply": "sm:grid grid(cols-2) gap-x-4" },
        "& .cols-3": { "@apply": "sm:grid grid(cols-3) gap-x-4" },
        "& .cols-4": { "@apply": "grid grid(cols-2 md:cols-4) gap-x-4" },
      },
    }),
  ],
  rules: [
    [
      "box",
      {
        "@apply": `
          block
          bg(neutral-1)
          rounded-sm
          shadow-sm
        `,
        "&:is(a)": {
          "@apply":
            "text(neutral-11) hover:(bg(accent-2) shadow text-accent-12)",
        },
      },
    ],
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
          content: "'·'",
          "@apply": "mx-1.5 text(neutral-9)",
        },
      },
    ],
    [
      "divide-slash",
      {
        "& > *:not(:last-child)::after": {
          content: "'/'",
          "@apply": "mx-1.5 text(neutral-9)",
        },
      },
    ],
  ],
  preflight: {
    a: { "@apply": "hover:text-accent-12)" },
  },
  darkColor,
});
