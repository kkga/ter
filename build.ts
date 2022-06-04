import { eta, path } from "./deps.ts";
import { Page } from "./pages.ts";
import { SiteConfig } from "./config.ts";
import { hasKey } from "./attributes.ts";

eta.configure({
  autotrim: true,
});

interface Breadcrumb {
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
  viewPath: string;
  siteConf: SiteConfig;
}

interface TagPageOpts {
  headInclude: string;
  includeRefresh: boolean;
  taggedPages: Array<Page>;
  viewPath: string;
  siteConf: SiteConfig;
}

const sortPages = (pages: Page[]): Page[] =>
  pages
    .sort((a, b) => {
      if (a.date && b.date) return b.date.valueOf() - a.date.valueOf();
      else return 0;
    })
    .sort((page) => page.isIndex ? -1 : 0)
    .sort((page) => hasKey(page.attrs, ["pinned"]) ? -1 : 0);

function generateBreadcrumbs(
  currentPage: Page,
  homeSlug?: string,
): Array<Breadcrumb> {
  const dir = path.dirname(currentPage.url.pathname);
  const chunks: string[] = dir.split("/").filter((ch: string) => !!ch);
  const slug = path.basename(currentPage.url.pathname);

  let breadcrumbs: Array<Breadcrumb> = chunks.map((chunk, i) => {
    const slug = chunk;
    const url = path.join("/", ...chunks.slice(0, i + 1));
    return {
      slug,
      url,
      current: false,
    };
  });

  if (currentPage.url.pathname !== "/") {
    breadcrumbs = [
      { slug: homeSlug ?? "index", url: "/", current: false },
      ...breadcrumbs,
    ];
  }

  if (slug !== "") {
    breadcrumbs = [
      ...breadcrumbs,
      { slug, url: "", current: true },
    ];
  }

  return breadcrumbs;
}

export async function buildPage(
  page: Page,
  opts: PageOpts,
): Promise<string | void> {
  const breadcrumbs = generateBreadcrumbs(page, opts.siteConf.rootName);
  const backlinkPages = sortPages(opts.backlinkPages);
  const childPages = sortPages(opts.childPages);
  const useLogLayout = hasKey(page.attrs, ["log"]) && page.attrs?.log === true;
  const showToc = hasKey(page.attrs, ["toc"]) && page.attrs?.toc === true;
  const taggedPages: { [tag: string]: Array<Page> } = {};

  for (const tag of Object.keys(opts.taggedPages)) {
    const tagIndex = sortPages(
      opts.taggedPages[tag].filter((taggedPage) => taggedPage !== page),
    );
    if (tagIndex.length !== 0) {
      taggedPages[tag] = tagIndex;
    }
  }

  eta.templates.define("head", eta.compile(opts.headInclude));

  return await eta.renderFile(opts.viewPath, {
    page,
    indexLayout: useLogLayout ? "log" : "default",
    toc: showToc,
    breadcrumbs,
    childPages,
    backlinkPages,
    pagesByTag: taggedPages,
    childTags: opts.childTags,
    site: opts.siteConf,
    includeRefresh: opts.includeRefresh,
  });
}

export async function buildTagPage(
  tagName: string,
  opts: TagPageOpts,
): Promise<string | void> {
  eta.templates.define("head", eta.compile(opts.headInclude));
  const breadcrumbs: Array<Breadcrumb> = [
    { slug: "index", url: "/", current: false },
    { slug: `#${tagName}`, url: "", current: true, isTag: true },
  ];

  const result = await eta.renderFile(opts.viewPath, {
    page: {
      title: `#${tagName}`,
      description: `Pages tagged #${tagName}`,
    },
    tagName,
    breadcrumbs,
    childPages: sortPages(opts.taggedPages),
    site: opts.siteConf,
    includeRefresh: opts.includeRefresh,
  });
  return result;
}

export async function buildFeed(
  pages: Array<Page>,
  viewPath: string,
  siteConf: SiteConfig,
): Promise<string | void> {
  const result = await eta.renderFile(viewPath, {
    pages,
    site: siteConf,
  });
  return result;
}
