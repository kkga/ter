import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { setup as twSetup } from "twind/";
import { getStyleTag } from "twind/sheets";

import twindConfig, { sheet } from "./twind.config.ts";
import { HMR_CLIENT } from "./constants.ts";
import { Crumb, Page, UserConfig } from "./types.d.ts";
import Body from "@components/Body.tsx";
import { sortPages, sortTaggedPages } from "./pages.ts";

twSetup(twindConfig);

interface RenderOpts {
  page: Page;
  crumbs: Crumb[];
  dev?: boolean;
  childPages?: Page[];
  backlinkPages?: Page[];
  relatedPages?: Page[];
  pagesByTag?: Record<string, Page[]>;
  userConfig: UserConfig;
}

export function renderPage({
  page,
  crumbs,
  dev,
  childPages,
  backlinkPages,
  relatedPages,
  pagesByTag,
  userConfig,
}: RenderOpts): string {
  sheet.reset();
  const body = renderToString(
    <Body
      page={page}
      crumbs={crumbs}
      childPages={childPages && sortPages(childPages)}
      backlinkPages={backlinkPages && sortPages(backlinkPages)}
      relatedPages={relatedPages && sortPages(relatedPages)}
      pagesByTag={pagesByTag && sortTaggedPages(pagesByTag)}
      navItems={userConfig.nav_links}
      lang={userConfig.lang}
      author={{
        name: userConfig.author_name,
        email: userConfig.author_email,
        url: userConfig.author_url,
      }}
    />,
  );

  const styleTag = getStyleTag(sheet);
  const pageTitle = page.title === userConfig.title
    ? page.title
    : `${page.title} &middot; ${userConfig.title}`;
  const pageDescription = `${page.description || userConfig.description}`;

  return `
<!doctype html>
<html lang="${userConfig.lang || "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="$${pageDescription}">
  <meta property="og:url" content="${page.url}">
  <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
  <link rel="alternate" type="application/atom+xml" href="/feed.xml" title="${userConfig.title}" />
  ${styleTag}
  ${userConfig.head || ""}
  ${dev ? `<script>${HMR_CLIENT}</script>` : ""}
  ${body}
</html>`;
}
