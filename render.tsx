import { basename, dirname, join } from "./deps.ts";
import { eta } from "./deps.ts";
import {
  apply,
  colors,
  getStyleTag,
  h,
  renderToString,
  twSetup,
  virtualSheet,
} from "./deps.ts";
import { HMR_CLIENT } from "./constants.ts";
import { Crumb, Page, UserConfig } from "./types.d.ts";
import Body from "./components/Body.tsx";

const sheet = virtualSheet();

twSetup({
  theme: {
    fontFamily: {
      sans: ["system-ui", "-apple-system", "sans-serif"],
      mono: ["monospace", "ui-monospace", "Menlo", "Monaco"],
    },
    colors: {
      gray: colors.coolGray,
      accent: colors.blue,
    },
  },
  preflight: {
    a: apply`no-underline hover:underline text-accent-500 dark:(text-accent-400)`,
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
    .sort((page) => (page.pinned ? -1 : 0))
    .sort((page) => (page.isIndex ? -1 : 0));

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

export function renderPage(
  { page, dev, childPages, backlinkPages, taggedPages, childTags, userConfig }:
    {
      page: Page;
      dev: boolean;
      childPages?: Array<Page>;
      backlinkPages?: Array<Page>;
      taggedPages?: Record<string, Array<Page>>;
      childTags?: Array<string>;
      userConfig: UserConfig;
    },
): string {
  const crumbs = generateCrumbs(page, userConfig.site.rootCrumb);
  // const backlinkPages = opts.backlinkPages && sortPages(opts.backlinkPages);
  // const childPages = opts.childPages && sortPages(opts.childPages);
  // const taggedPages: { [tag: string]: Page[] } = {};

  sheet.reset();

  const body = renderToString(
    <Body
      page={page}
      crumbs={crumbs}
      childPages={childPages}
      childTags={childTags}
      backlinkPages={backlinkPages}
      taggedPages={taggedPages}
      navItems={userConfig.navigation}
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
  ${dev && `<script>${HMR_CLIENT}</script>`}
</head>
<html lang="en">
  ${body}
</html>`;

  // for (const tag of Object.keys(opts.taggedPages)) {
  //   const tagIndex = sortPages(
  //     opts.taggedPages[tag].filter((taggedPage) => taggedPage !== page),
  //   );
  //   if (tagIndex.length !== 0) {
  //     taggedPages[tag] = tagIndex;
  //   }
  // }

  // return await eta.render(opts.view, {
  //   page,
  //   crumbs,
  //   childPages,
  //   backlinkPages,
  //   pagesByTag: taggedPages,
  //   childTags: opts.childTags,
  //   userConfig: opts.userConfig,
  //   style: opts.style,
  //   includeRefresh: opts.includeRefresh,
  // });
}

export async function buildTagPage(
  tagName: string,
  opts: {
    headTemplate: string | undefined;
    footerTemplate: string | undefined;
    includeRefresh: boolean;
    taggedPages: Array<Page>;
    view: string;
    userConfig: UserConfig;
    style: string;
  },
): Promise<string | void> {
  opts.headTemplate &&
    eta.templates.define("headTemplate", eta.compile(opts.headTemplate));
  opts.footerTemplate &&
    eta.templates.define("footerTemplate", eta.compile(opts.footerTemplate));

  const crumbs: Array<Crumb> = [
    { slug: "index", url: "/", current: false },
    { slug: `#${tagName}`, url: "", current: true, isTag: true },
  ];

  const result = await eta.render(opts.view, {
    page: {
      title: `#${tagName}`,
      description: `Pages tagged #${tagName}`,
    },
    tagName,
    crumbs,
    childPages: sortPages(opts.taggedPages),
    userConfig: opts.userConfig,
    style: opts.style,
    includeRefresh: opts.includeRefresh,
  });
  return result;
}

export async function buildFeed(
  pages: Array<Page>,
  view: string,
  userConfig: UserConfig,
): Promise<string | void> {
  const result = await eta.render(view, {
    pages,
    site: userConfig.site,
    author: userConfig.author,
  });
  return result;
}
