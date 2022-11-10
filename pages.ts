import { WalkEntry } from "$std/fs/mod.ts";
import { basename, dirname, extname, join, relative } from "$std/path/mod.ts";
import * as frontmatter from "$std/encoding/front_matter.ts";
import { default as slugify } from "slugify";

import { parseMarkdown } from "./markdown.ts";
import * as attributes from "./attributes.ts";

import type { Crumb, Heading, Page } from "./types.d.ts";

interface GeneratePageOpts {
  entry: WalkEntry;
  inputPath: string;
  siteUrl: URL;
  ignoreKeys: string[];
}

interface PageData {
  body?: string;
  attrs?: Record<string, unknown>;
  datePublished?: Date;
  dateUpdated?: Date;
  title?: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
  ignored?: boolean;
  log?: boolean;
  showHeader: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showMeta: boolean;
  showToc: boolean;
}

const decoder = new TextDecoder("utf-8");

function generateCrumbs(page: Page, rootCrumb?: string): Crumb[] {
  const dir = dirname(page.url.pathname);
  const chunks: string[] = dir.split("/").filter((ch) => !!ch);
  const slug = basename(page.url.pathname);

  let crumbs: Crumb[] = chunks.map((chunk, i) => {
    const url = join("/", ...chunks.slice(0, i + 1));
    return {
      slug: chunk,
      url,
      current: false,
    };
  });

  crumbs = [{
    slug: rootCrumb ?? "index",
    url: "/",
    current: false,
  }, ...crumbs];

  if (slug !== "") crumbs = [...crumbs, { slug, url: "", current: true }];

  return crumbs;
}

function getTitleFromHeadings(headings: Array<Heading>): string | undefined {
  return headings.find((h) => h.level === 1)?.text;
}

function getTitleFromFilename(filePath: string): string {
  return basename(filePath).replace(extname(filePath), "");
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
  pages.forEach((p) => p.tags && p.tags.forEach((tag) => tagSet.add(tag)));
  return [...tagSet];
}

function getPagesWithTag(pages: Page[], tag: string, exclude?: Page[]): Page[] {
  return pages.filter(
    (page) => page.tags && page.tags.includes(tag) && !exclude?.includes(page),
  );
}

function getRelatedPages(pages: Page[], current: Page): Page[] {
  return pages.filter((page) =>
    page?.tags?.some((tag) => current?.tags?.includes(tag))
  );
}

function getChildPages(pages: Page[], current: Page): Page[] {
  return pages.filter((p) =>
    current.url.pathname !== p.url.pathname &&
    current.url.pathname === dirname(p.url.pathname)
  );
}

function getPagesByTags(
  pages: Page[],
  tags: string[],
  exclude?: Page[],
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
  taggedPages: Record<string, Page[]>,
): Record<string, Page[]> {
  return Object.keys(taggedPages)
    .sort((a, b) => taggedPages[b].length - taggedPages[a].length)
    .reduce((acc: Record<string, Page[]>, key) => {
      acc[key] = taggedPages[key];
      return acc;
    }, {});
}

function extractPageData(raw: string, ignoreKeys: string[]): PageData {
  const fm = frontmatter.extract(raw);
  const attrs = fm.attrs as Record<string, unknown>;
  const {
    getTitle,
    getDescription,
    getDate,
    getDateUpdated,
    getBool,
    getTags,
    hasKey,
  } = attributes;

  return {
    attrs: attrs,
    body: fm.body,
    title: getTitle(attrs),
    datePublished: getDate(attrs),
    dateUpdated: getDateUpdated(attrs),
    description: getDescription(attrs),
    tags: getTags(attrs),
    pinned: getBool(attrs, "pinned") ?? false,
    ignored: hasKey(attrs, ignoreKeys),
    log: getBool(attrs, "log") ?? true,
    showHeader: getBool(attrs, "showHeader") ?? true,
    showTitle: getBool(attrs, "showTitle") ?? true,
    showDescription: getBool(attrs, "showDescription") ?? true,
    showMeta: getBool(attrs, "showMeta") ?? true,
    showToc: getBool(attrs, "toc") ?? false,
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

function generateIndexPageFromDir(
  { entry, inputPath, siteUrl }: GeneratePageOpts,
): Page {
  const relPath = relative(inputPath, entry.path) || ".";
  const slug = relPath === "." ? "." : slugify(entry.name);
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  return {
    title: entry.name,
    url: pageUrl,
    index: "dir",
  };
}

async function generateContentPage(
  { entry, inputPath, siteUrl, ignoreKeys }: GeneratePageOpts,
): Promise<Page> {
  const relPath = relative(inputPath, entry.path);
  const raw = decoder.decode(await Deno.readFileSync(entry.path));
  const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  let page: Page = {
    url: pageUrl,
  };

  if (frontmatter.test(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = parseMarkdown({
    text: page.body ?? raw,
    currentPath: relPath,
    baseUrl: new URL(siteUrl),
    isDirIndex: page.index === "dir",
  });

  page = { ...page, html, links, headings };

  page.title ??= getTitleFromHeadings(headings) ||
    getTitleFromFilename(relPath);

  return page;
}

async function generateIndexPageFromFile(
  { entry, inputPath, siteUrl, ignoreKeys }: GeneratePageOpts,
): Promise<Page> {
  const relPath = relative(inputPath, dirname(entry.path)) || ".";
  const raw = decoder.decode(await Deno.readFile(entry.path));
  const dirName = basename(dirname(entry.path));
  const slug = relPath === "." ? "." : slugify(dirName);
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  let page: Page = {
    url: pageUrl,
    index: "dir",
  };

  if (frontmatter.test(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = parseMarkdown({
    text: page.body ?? raw,
    currentPath: relPath,
    baseUrl: new URL(siteUrl),
  });

  page = { ...page, html, links, headings };

  page.title ??= getTitleFromHeadings(headings) ||
    getTitleFromFilename(dirName);

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
  getTags,
  sortPages,
  sortTaggedPages,
};
