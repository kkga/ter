import {
  defineConfig,
  presetAutoprefix,
  presetExt,
  presetTailwind,
  presetTypography,
} from "./deps.ts";

import { accent, accentDark, darkColor, neutral, neutralDark } from "./deps.ts";

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
        quotes: "11",
        captions: "11",
        code: "12",
        "pre-code": "11",
        "pre-bg": "2",
        "quote-borders": "6",
        hr: "6",
        "th-borders": "6",
        "td-borders": "5",
      },
      extend: {
        ".lead": { "@apply": "m-0" },
        a: {
          "@apply": `
            underline
            underline-offset-2
            decoration-neutral-9
            font-normal
            hover:(decoration-current)
          `,
        },
        "a[rel~='external']": {
          "@apply": `
            after:content-[' ↗']
          `,
        },
        "h1,h2,h3,h4,h5,h6": {
          "& > .h-anchor": {
            "@apply": `
              -ml-9
              transition-opacity
              absolute my-auto top-0 bottom-0
              hidden sm:flex
              justify-center items-center
              w-6 h-6 rounded-sm
              text(base neutral-9 hover:(accent-12)) !no-underline
              opacity(0 hover:100))
            `,
          },
          "font-stretch": "condensed",
          "@apply":
            "relative tracking-tight -ml-4 pl-4 hover:([&>.h-anchor]:opacity-100)",
        },
        pre: {
          "@apply": "leading-normal rounded-md",
        },
        del: { "@apply": "opacity-60" },
        small: { "@apply": "text-neutral-11" },
        details: { "@apply": "text-neutral-11" },

        "& dt": { "@apply": "font-semibold" },
        "& dd": { "@apply": "ml-4 text-neutral-11" },
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
          bg(transparent)
          rounded
        `,
        "&:is(a)": {
          "@apply": "text(neutral-11) hover:(bg(accent-3) text-neutral-12)",
        },
      },
    ],
    [
      "divide-dot",
      {
        "& > *:not(:last-child)::after": {
          content: "'·'",
          "@apply": "mx-1.5 text(neutral-8)",
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
    [
      "section-heading",
      {
        "@apply": "flex gap-2 items-baseline",
        "&::after": { content: "", "@apply": "flex-1 h-px bg-neutral-4" },
      },
    ],
  ],
  preflight: {
    a: { "@apply": "hover:text-accent-12" },
  },
  darkColor,
});
