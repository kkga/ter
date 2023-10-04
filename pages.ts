import { fm, path, fs } from "./deps/std.ts";

import { slug as slugify } from "./deps/slug.ts";

import * as attributes from "./attributes.ts";
import { parseMarkdown } from "./markdown.ts";

import type {
  Crumb,
  Heading,
  JSONValue,
  Page,
  PageData,
  UserConfig,
} from "./types.d.ts";

interface GeneratePageOpts {
  entry: fs.WalkEntry;
  inputPath: string;
  userConfig: UserConfig;
  ignoreKeys: string[];
}

const decoder = new TextDecoder("utf-8");

function generateCrumbs(page: Page, rootCrumb?: string): Crumb[] {
  const chunks = page.url.pathname.split("/").filter((ch) => !!ch);

  const crumbs: Crumb[] = chunks.map((chunk, i) => {
    const url = path.join("/", ...chunks.slice(0, i + 1));
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
  return path.basename(filePath).replace(path.extname(filePath), "");
}

function getDateFromFilename(filePath: string): Date | undefined {
  const match = path.basename(filePath).match(/\d{4}-\d{2}-\d{2}/)?.[0];
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
      if (current.url.pathname === path.dirname(p.url.pathname)) {
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
    .toSorted((a, b) => {
      if (a.datePublished && b.datePublished) {
        return b.datePublished.valueOf() - a.datePublished.valueOf();
      } else if (a.datePublished) {
        return -1;
      } else if (b.datePublished) {
        return 1;
      } else {
        return 0;
      }
    })
    .toSorted((page) => (page.index === "dir" ? -1 : 0))
    .toSorted((page) => (page.pinned ? -1 : 0));
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

function extractPageData(raw: string, ignoreKeys: string[]): PageData {
  const frontmatter = fm.extract(raw);
  const attrs = frontmatter.attrs as JSONValue;
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
    body: frontmatter.body,
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
    showToc: getBool(attrs, "toc") ?? false,
    thumbnailUrl: getVal(attrs, "thumbnailUrl") as URL | undefined,
  };
}

function generateIndexPageFromDir({
  entry,
  inputPath,
  userConfig,
}: GeneratePageOpts): Page {
  const { url } = userConfig;
  const relPath = path.relative(inputPath, entry.path) || ".";
  const slug = relPath === "." ? "." : slugify(entry.name);
  const pageUrl = new URL(path.join(path.dirname(relPath), slug), url);

  return {
    title: entry.name,
    url: pageUrl,
    index: "dir",
  };
}

function generateContentPage({
  entry,
  inputPath,
  userConfig,
  ignoreKeys,
}: GeneratePageOpts): Page {
  const { url } = userConfig;
  const relPath = path.relative(inputPath, entry.path);
  const raw = decoder.decode(Deno.readFileSync(entry.path));
  const name = entry.name
    .replace(/^\d{4}-\d{2}-\d{2}[-_]/, "")
    .replace(/\.md$/i, "");
  const slug = slugify(name, { lower: true });
  const pageUrl = new URL(path.join(path.dirname(relPath), slug), url);

  let page: Page = {
    url: pageUrl,
  };

  if (fm.test(raw)) {
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
  const relPath = path.relative(inputPath, path.dirname(entry.path)) || ".";
  const raw = decoder.decode(Deno.readFileSync(entry.path));
  const dirName = path.basename(path.dirname(entry.path));
  const slug = relPath === "." ? "." : slugify(dirName);
  const pageUrl = new URL(path.join(path.dirname(relPath), slug), url);

  let page: Page = {
    url: pageUrl,
    index: "dir",
  };

  if (fm.test(raw)) {
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
  getTitleFromHeadings,
  getTitleFromFilename,
  getChildPages,
  getDeadlinks,
  getPagesByTags,
  getPagesWithTag,
  getRelatedPages,
  getDateFromFilename,
  getTags,
  sortPages,
  sortTaggedPages,
  extractPageData,
};
