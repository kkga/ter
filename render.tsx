import { basename, dirname, join } from "$std/path/mod.ts";
import * as colors from "twind/colors";
import { apply, setup as twSetup } from "twind/";
import { getStyleTag, virtualSheet } from "twind/sheets";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";

import { HMR_CLIENT } from "./constants.ts";
import { Crumb, Page, UserConfig } from "./types.d.ts";
import Body from "@components/Body.tsx";

const sheet = virtualSheet();

twSetup({
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
    colors: {
      gray: colors.blueGray,
      accent: colors.blue,
      current: "currentColor",
      white: colors.white,
      black: colors.black,
    },
  },
  preflight: {
    a: apply`text-current`,
  },
  variants: {
    "not-hover": "&:not(:hover)",
  },
  sheet,
});

const sortPages = (pages: Page[]): Page[] =>
  pages
    .sort((a, b) => {
      if (a.datePublished && b.datePublished) {
        return b.datePublished.valueOf() - a.datePublished.valueOf();
      } else return 0;
    })
    .sort((page) => (page.index === "dir" ? -1 : 0))
    .sort((page) => (page.pinned ? -1 : 0));

const generateCrumbs = (currentPage: Page, homeSlug?: string): Crumb[] => {
  const dir = dirname(currentPage.url.pathname);
  const chunks: string[] = dir.split("/").filter((ch: string) => !!ch);
  const slug = basename(currentPage.url.pathname);

  let crumbs: Crumb[] = chunks.map((chunk, i) => {
    const slug = chunk;
    const url = join("/", ...chunks.slice(0, i + 1));
    return {
      slug,
      url,
      current: false,
    };
  });

  crumbs = [{ slug: homeSlug ?? "index", url: "/", current: false }, ...crumbs];

  if (slug !== "") {
    crumbs = [...crumbs, { slug, url: "", current: true }];
  }

  return crumbs;
};

// TODO
// - render user head snippet

export function renderPage({
  page,
  dev,
  childPages,
  backlinkPages,
  taggedPages,
  childTags,
  userConfig,
}: {
  page: Page;
  dev: boolean;
  childPages?: Page[];
  backlinkPages?: Page[];
  taggedPages?: Record<string, Page[]>;
  childTags?: string[];
  userConfig: UserConfig;
}): string {
  sheet.reset();
  const body = renderToString(
    <Body
      page={page}
      crumbs={generateCrumbs(page, userConfig.site.rootCrumb)}
      childPages={childPages && sortPages(childPages)}
      backlinkPages={backlinkPages && sortPages(backlinkPages)}
      childTags={childTags}
      taggedPages={taggedPages}
      navItems={userConfig.navigation}
      author={userConfig.author}
    />,
  );

  const styleTag = getStyleTag(sheet);

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${
    page.description || userConfig.site.description
  }">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="<%= title ? title : site.title %>">
  <meta name="twitter:description" content="<%= description ? description : site.description %>">
  <meta property="og:type" content="article">
  <meta property="og:title" content="<%= title ? title : site.title %>">
  <meta property="og:description" content="<%= description ? description : site.description %>">
  <meta property="og:url" content="<%= site.url %>">
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <link rel="alternate" type="application/atom+xml" href="/feed.xml" title="" />
  ${styleTag}
  ${userConfig.head || ""}
  ${dev && `<script>${HMR_CLIENT}</script>`}
</head>
<html lang="en">
  ${body}
</html>`;
}

// export async function buildFeed(
//   pages: Array<Page>,
//   view: string,
//   userConfig: UserConfig,
// ): Promise<string | void> {
//   return await eta.render(view, {
//     pages,
//     site: userConfig.site,
//     author: userConfig.author,
//   });
// }
