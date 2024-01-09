import {
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
  UserConfig,
} from "./deps/unocss.ts";

export default {
  shortcuts: {
    smallcaps: "text-xs uppercase tracking-wider",
    "text-dim": "text-stone-500 dark:text-stone-400",
    // "full-bleed": "lg:-mx-8! [&>figcaption]:lg:mx-8!",
    "full-bleed": "lg:-mr-40 xl:-mr-80",
    "cols-4": "md:grid md:grid-cols-4 gap-x-4",
    "cols-3": "md:grid md:grid-cols-3 gap-x-4",
    "cols-2": "md:grid md:grid-cols-2 gap-x-4",
    "span-2": "md:col-span-2",
    "span-3": "md:col-span-3",
    "span-4": "md:col-span-4",
    "span-5": "md:col-span-5",
    "span-6": "md:col-span-6",
    "span-full": "md:col-span-full",
  },
  rules: [
    ["font-book", { "font-weight": "450" }],
  ],
  preflights: [
    {
      getCSS: () => {
        return `
          html {
            scroll-behavior: smooth;
          }
          a {
            color: inherit;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          pre {
            font-size: 14px;
          }
          img {
            max-width: 100%;
          }
          h1,h2,h3,h4,h5,h6 {
            font-size: inherit;
            line-height: inherit;
            font-stretch: expanded;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
        `;
      },
    },
  ],
  presets: [
    presetUno({
      dark: "media",
    }),
    // presetWebFonts({
    //   provider: "fontshare",
    //   fonts: {
    //     sans: {
    //       name: "Sora",
    //       weights: ["400", "600"],
    //     },
    //   },
    // }),
    presetTypography({
      cssExtend: () => {
        return {
          "p, ul, ol, pre": {
            "line-height": "1.5",
          },
          a: {
            color: "inherit",
            "font-weight": "inherit",
            "text-decoration-color": "var(--un-prose-lists, currentColor)",
          },
          "h1,h2,h3,h4,h5,h6": {
            "font-size": "inherit !important",
            "line-height": "inherit",
            "font-stretch": "semi-expanded",
            margin: "2rem 0 1rem !important",
          },
          ".h-anchor": {
            "font-weight": "inherit",
            "text-decoration": "none",
          },
          "figure img, figure video": {
            "vertical-align": "middle",
          },
          "figure figcaption": {
            "margin-top": "0.5rem",
          },
          table: {
            "font-size": "0.875rem",
          },
          "td,th": {
            border: "1px solid var(--un-prose-borders)",
            padding: "0.375em 0.75em",
            "text-align": "left",
            "vertical-align": "top",
          },
          "tr": {
            "background-color": "transparent !important",
          },
          "dd + dt": {
            "margin-top": "1rem",
          },
          dd: {
            "margin": "0",
          },
          dt: {
            "font-weight": "600",
          },
          pre: {
            "font-size": "13px",
            padding: "0.75rem 1rem",
            "background-color": "var(--un-prose-bg-soft) !important",
            "border-radius": "0",
          },
          code: {
            "font-size": "0.9em",
            "font-weight": "400",
          },
          "code::before, code::after": {
            content: "none",
          },
          "details": {
            margin: "1em 0",
            padding: "0.75rem 1rem",
            border: "1px solid var(--un-prose-borders)",
            background: "transparent",
            "font-size": "0.875rem",
          },
          "summary": {
            "cursor": "pointer",
            "font-weight": "600",
            "font-size": "0.875rem",
          },
        };
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
} satisfies UserConfig;
