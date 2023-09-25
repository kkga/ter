import {
  basename,
  dirname,
  extname,
  fmExtract,
  fmTest,
  join,
  relative,
  WalkEntry,
} from "./deps/std.ts";

import { slug as slugify } from "./deps/slug.ts";

import * as attributes from "./attributes.ts";
import { parseMarkdown } from "./markdown.ts";

import type { Crumb, Heading, JSONValue, Page, UserConfig } from "./types.d.ts";

interface GeneratePageOpts {
  entry: WalkEntry;
  inputPath: string;
  userConfig: UserConfig;
  ignoreKeys: string[];
}

interface PageData {
  body?: string;
  attrs?: JSONValue;
  datePublished?: Date;
  dateUpdated?: Date;
  title?: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
  ignored?: boolean;
  unlisted?: boolean;
  layout?: "log" | "grid" | "list";
  showHeader: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showMeta: boolean;
  showToc: boolean;
  thumbnailUrl?: URL;
}

const decoder = new TextDecoder("utf-8");

function generateCrumbs(page: Page, rootCrumb?: string): Crumb[] {
  const chunks = page.url.pathname.split("/").filter((ch) => !!ch);

  const crumbs: Crumb[] = chunks.map((chunk, i) => {
    const url = join("/", ...chunks.slice(0, i + 1));
    return {
      slug: chunk,
      url,
      current: url === page.url.pathname,
    };
  });

  crumbs.unshift({
    slug: rootCrumb ?? "index",
    url: "/",
    current: page.url.pathname === "/",
  });

  return crumbs;
}

function getTitleFromHeadings(headings: Array<Heading>): string | undefined {
  return headings.find((h) => h.level === 1)?.text;
}

function getTitleFromFilename(filePath: string): string {
  return basename(filePath).replace(extname(filePath), "");
}

function getDateFromFilename(filePath: string): Date | undefined {
  const match = basename(filePath).match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (!match) {
    return;
  }
  const [year, month, day] = match.split("-");
  const date = new Date(`${year}-${month}-${day}`);

  if (date instanceof Date && !isNaN(date.valueOf())) {
    return date;
  }
}

function getBacklinkPages(pages: Page[], current: Page): Page[] {
  const pageSet: Set<Page> = new Set();

  for (const outPage of pages) {
    if (outPage.links) {
      for (const url of outPage.links) {
        if (
          outPage.url.pathname !== current.url.pathname &&
          url.pathname === current.url.pathname
        ) {
          pageSet.add(outPage);
        }
      }
    }
  }

  return [...pageSet];
}

function getTags(pages: Page[]): string[] {
  const tagSet: Set<string> = new Set();
  pages.forEach((p) => p.tags?.forEach((tag) => tagSet.add(tag)));
  return [...tagSet];
}

function getPagesWithTag(pages: Page[], tag: string, exclude?: Page[]): Page[] {
  return pages.filter(
    (page) => page.tags?.includes(tag) && !exclude?.includes(page)
  );
}

function getRelatedPages(pages: Page[], current: Page): Page[] {
  return pages.filter(
    (page) =>
      page.url.pathname !== current.url.pathname &&
      page?.tags?.some((tag) => current?.tags?.includes(tag))
  );
}

function getChildPages(
  pages: Page[],
  current: Page
): { childPages: Page[]; allChildPages: Page[] } {
  const childPages: Page[] = [];
  const allChildPages: Page[] = [];
  pages.forEach((p) => {
    if (current.url.pathname !== p.url.pathname) {
      if (current.url.pathname === dirname(p.url.pathname)) {
        childPages.push(p);
      } else if (p.url.pathname.startsWith(current.url.pathname)) {
        allChildPages.push(p);
      }
    }
  });
  return { childPages, allChildPages };
}

function getPagesByTags(
  pages: Page[],
  tags: string[],
  exclude?: Page[]
): Record<string, Page[]> {
  const pageMap: Record<string, Page[]> = {};
  tags.forEach((tag) => {
    pageMap[tag] = getPagesWithTag(pages, tag, exclude);
  });
  return pageMap;
}

function sortPages(pages: Page[]): Page[] {
  return pages
    .sort((a, b) => {
      if (a.datePublished && b.datePublished) {
        return b.datePublished.valueOf() - a.datePublished.valueOf();
      } else return 0;
    })
    .sort((page) => (page.index === "dir" ? -1 : 0))
    .sort((page) => (page.pinned ? -1 : 0));
}

function sortTaggedPages(
  taggedPages: Record<string, Page[]>
): Record<string, Page[]> {
  return Object.keys(taggedPages)
    .sort((a, b) => taggedPages[b].length - taggedPages[a].length)
    .reduce((acc: Record<string, Page[]>, key) => {
      acc[key] = taggedPages[key];
      return acc;
    }, {});
}

function extractPageData(raw: string, ignoreKeys: string[]): PageData {
  const fm = fmExtract(raw);
  const attrs = fm.attrs as JSONValue;
  const {
    getTitle,
    getDescription,
    getDate,
    getDateUpdated,
    getBool,
    getTags,
    getVal,
    hasKey,
  } = attributes;

  return {
    attrs,
    body: fm.body,
    title: getTitle(attrs),
    datePublished: getDate(attrs),
    dateUpdated: getDateUpdated(attrs),
    description: getDescription(attrs),
    tags: getTags(attrs),
    pinned: getBool(attrs, "pinned") ?? false,
    ignored: hasKey(attrs, ignoreKeys),
    unlisted: getBool(attrs, "unlisted") ?? false,
    layout: (getVal(attrs, "layout") as "log" | "grid" | "list") || undefined,
    showHeader: getBool(attrs, "showHeader") ?? true,
    showTitle: getBool(attrs, "showTitle") ?? true,
    showDescription: getBool(attrs, "showDescription") ?? true,
    showMeta: getBool(attrs, "showMeta") ?? true,
    showToc: getBool(attrs, "toc") ?? false,
    thumbnailUrl: getVal(attrs, "thumbnailUrl") as URL | undefined,
  };
}

function getDeadlinks(pages: Page[]): [from: URL, to: URL][] {
  return pages.reduce((deadlinks: [from: URL, to: URL][], page) => {
    if (page.links) {
      page.links.forEach((link) => {
        !pages.some((page) => page.url.pathname === link.pathname) &&
          deadlinks.push([page.url, link]);
      });
    }
    return deadlinks;
  }, []);
}

function generateIndexPageFromDir({
  entry,
  inputPath,
  userConfig,
}: GeneratePageOpts): Page {
  const { url } = userConfig;
  const relPath = relative(inputPath, entry.path) || ".";
  const slug = relPath === "." ? "." : slugify(entry.name);
  const pageUrl = new URL(join(dirname(relPath), slug), url);

  return {
    title: entry.name,
    url: pageUrl,
    index: "dir",
    pinned: false,
    ignored: false,
    unlisted: false,
    showHeader: true,
    showTitle: true,
    showDescription: true,
    showMeta: true,
    showToc: false,
  };
}

function generateContentPage({
  entry,
  inputPath,
  userConfig,
  ignoreKeys,
}: GeneratePageOpts): Page {
  const { url } = userConfig;
  const relPath = relative(inputPath, entry.path);
  const raw = decoder.decode(Deno.readFileSync(entry.path));
  const name = entry.name
    .replace(/^\d{4}-\d{2}-\d{2}[-_]/, "")
    .replace(/\.md$/i, "");
  const slug = slugify(name, { lower: true });
  const pageUrl = new URL(join(dirname(relPath), slug), url);

  let page: Page = {
    url: pageUrl,
    pinned: false,
    ignored: false,
    unlisted: false,
    showHeader: true,
    showTitle: true,
    showDescription: true,
    showMeta: true,
    showToc: false,
  };

  if (fmTest(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = parseMarkdown({
    text: page.body ?? raw,
    currentPath: relPath,
    baseUrl: new URL(url),
    isDirIndex: page.index === "dir",
    codeHighlight: userConfig.codeHighlight,
  });

  page = { ...page, html, links, headings };

  page.title ??=
    getTitleFromHeadings(headings) || getTitleFromFilename(relPath);
  page.datePublished ??= getDateFromFilename(entry.name);

  return page;
}

function generateIndexPageFromFile({
  entry,
  inputPath,
  userConfig,
  ignoreKeys,
}: GeneratePageOpts): Page {
  const { url } = userConfig;
  const relPath = relative(inputPath, dirname(entry.path)) || ".";
  const raw = decoder.decode(Deno.readFileSync(entry.path));
  const dirName = basename(dirname(entry.path));
  const slug = relPath === "." ? "." : slugify(dirName);
  const pageUrl = new URL(join(dirname(relPath), slug), url);

  let page: Page = {
    url: pageUrl,
    index: "dir",
    pinned: false,
    ignored: false,
    unlisted: false,
    showHeader: true,
    showTitle: true,
    showDescription: true,
    showMeta: true,
    showToc: false,
  };

  if (fmTest(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = parseMarkdown({
    text: page.body ?? raw,
    currentPath: relPath,
    baseUrl: new URL(url),
    codeHighlight: userConfig.codeHighlight,
  });

  page = { ...page, html, links, headings };

  page.title ??=
    getTitleFromHeadings(headings) || getTitleFromFilename(dirName);
  page.datePublished ??= getDateFromFilename(entry.name);

  return page;
}

export {
  generateContentPage,
  generateCrumbs,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getBacklinkPages,
  getChildPages,
  getDeadlinks,
  getPagesByTags,
  getPagesWithTag,
  getRelatedPages,
  getDateFromFilename,
  getTags,
  sortPages,
  sortTaggedPages,
};
