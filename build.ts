import { basename, dirname, join } from "./deps.ts";
import { compile, configure, render, templates } from "./deps.ts";
import { Page } from "./pages.ts";
import { UserConfig } from "./config.ts";
configure({ autotrim: true });

interface Crumb {
  slug: string;
  url: string;
  current: boolean;
  isTag?: boolean;
}

interface PageOpts {
  headInclude: string;
  includeRefresh: boolean;
  childPages: Array<Page>;
  backlinkPages: Array<Page>;
  taggedPages: { [tag: string]: Array<Page> };
  childTags: Array<string>;
  view: string;
  userConfig: UserConfig;
  style: string;
}

interface TagPageOpts {
  headInclude: string;
  includeRefresh: boolean;
  taggedPages: Array<Page>;
  view: string;
  userConfig: UserConfig;
  style: string;
}

const sortPages = (pages: Page[]): Page[] =>
  pages
    .sort((a, b) => {
      if (a.datePublished && b.datePublished) {
        return b.datePublished.valueOf() - a.datePublished.valueOf();
      } else return 0;
    })
    .sort((page) => page.isIndex ? -1 : 0)
    .sort((page) => page.pinned ? -1 : 0);

function generateCrumbs(
  currentPage: Page,
  homeSlug?: string,
): Array<Crumb> {
  const dir = dirname(currentPage.url.pathname);
  const chunks: string[] = dir.split("/").filter((ch: string) => !!ch);
  const slug = basename(currentPage.url.pathname);

  let crumbs: Array<Crumb> = chunks.map((chunk, i) => {
    const slug = chunk;
    const url = join("/", ...chunks.slice(0, i + 1));
    return {
      slug,
      url,
      current: false,
    };
  });

  crumbs = [
    { slug: homeSlug ?? "index", url: "/", current: false },
    ...crumbs,
  ];

  if (slug !== "") {
    crumbs = [
      ...crumbs,
      { slug, url: "", current: true },
    ];
  }

  return crumbs;
}

export async function buildPage(
  page: Page,
  opts: PageOpts,
): Promise<string | void> {
  const crumbs = generateCrumbs(page, opts.userConfig.site.rootCrumb);
  const backlinkPages = sortPages(opts.backlinkPages);
  const childPages = sortPages(opts.childPages);
  const taggedPages: { [tag: string]: Array<Page> } = {};

  for (const tag of Object.keys(opts.taggedPages)) {
    const tagIndex = sortPages(
      opts.taggedPages[tag].filter((taggedPage) => taggedPage !== page),
    );
    if (tagIndex.length !== 0) {
      taggedPages[tag] = tagIndex;
    }
  }

  templates.define("head", compile(opts.headInclude));

  return await render(opts.view, {
    page,
    crumbs,
    childPages,
    backlinkPages,
    pagesByTag: taggedPages,
    childTags: opts.childTags,
    site: opts.userConfig.site,
    author: opts.userConfig?.author,
    locale: opts.userConfig?.locale,
    navigation: opts.userConfig?.navigation,
    style: opts.style,
    includeRefresh: opts.includeRefresh,
  });
}

export async function buildTagPage(
  tagName: string,
  opts: TagPageOpts,
): Promise<string | void> {
  templates.define("head", compile(opts.headInclude));
  const crumbs: Array<Crumb> = [
    { slug: "index", url: "/", current: false },
    { slug: `#${tagName}`, url: "", current: true, isTag: true },
  ];

  const result = await render(opts.view, {
    page: {
      title: `#${tagName}`,
      description: `Pages tagged #${tagName}`,
    },
    tagName,
    crumbs,
    childPages: sortPages(opts.taggedPages),
    site: opts.userConfig.site,
    author: opts.userConfig.author,
    navigation: opts.userConfig.navigation,
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
  const result = await render(view, {
    pages,
    site: userConfig.site,
    author: userConfig.author,
  });
  return result;
}
