import { WalkEntry } from "./deps.ts";
import { basename, dirname, extname, join, relative } from "./deps.ts";
import { frontmatter } from "./deps.ts";
import { slugify } from "./deps.ts";
import { render } from "./render.ts";
import * as attributes from "./attributes.ts";
const decoder = new TextDecoder("utf-8");

export interface Heading {
  text: string;
  level: number;
  slug: string;
}

export interface Page {
  url: URL;
  isIndex: boolean;
  pinned: boolean;
  ignored: boolean;
  showToc: boolean;
  logLayout: boolean;
  title?: string;
  body?: string;
  path?: string;
  description?: string;
  attrs?: attributes.PageAttributes;
  links?: Array<URL>;
  datePublished?: Date;
  dateUpdated?: Date;
  html?: string;
  tags?: Array<string>;
  headings?: Array<Heading>;
}

export interface TagPage {
  name: string;
  pages: Array<Page>;
}

export function isDeadLink(allPages: Array<Page>, linkUrl: URL): boolean {
  for (const page of allPages) {
    if (page.url.pathname === linkUrl.pathname) return false;
    else continue;
  }
  return true;
}

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) return h.text;
  }
};

const getTitleFromFilename = (filePath: string): string => {
  return basename(filePath).replace(extname(filePath), "");
};

export function getAllTags(pages: Array<Page>): Array<string> {
  const allTags: Set<string> = new Set();
  pages.forEach((page) => {
    if (page.attrs) {
      const tags = attributes.getTags(page.attrs);
      if (tags) tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  return [...allTags];
}

export function getPagesByTag(allPages: Array<Page>, tag: string): Array<Page> {
  const filtered = allPages.filter((page) => {
    if (page.attrs) {
      const pageTags = attributes.getTags(page.attrs);
      return pageTags && pageTags.includes(tag);
    }
  });
  return filtered;
}

export function getBacklinkPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages: Set<Page> = new Set();

  for (const outPage of allPages) {
    if (outPage.links) {
      for (const url of outPage.links) {
        if (
          outPage.url.pathname !== current.url.pathname &&
          url.pathname === current.url.pathname
        ) {
          pages.add(outPage);
        }
      }
    }
  }

  return [...pages];
}

export function getChildPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages = allPages.filter((p) =>
    current.url.pathname !== p.url.pathname &&
    current.url.pathname === dirname(p.url.pathname)
  );

  return pages;
}

export function getChildTags(
  allPages: Array<Page>,
  current: Page,
): Array<string> {
  const tags: Set<string> = new Set();

  allPages.forEach((page) => {
    if (page.url.pathname.startsWith(current.url.pathname)) {
      page.tags?.forEach((tag) => tags.add(tag));
    }
  });

  return [...tags];
}

interface PageData {
  body?: string;
  attrs?: attributes.PageAttributes;
  datePublished?: Date;
  title?: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
  ignored?: boolean;
  logLayout?: boolean;
}

const extractPageData = (raw: string, ignoreKeys: string[]): PageData => {
  const fm = frontmatter.extract(raw);
  const pageAttrs = fm.attrs as attributes.PageAttributes;
  const title = attributes.getTitle(pageAttrs);
  const datePublished = attributes.getDate(pageAttrs);
  const description = attributes.getDescription(pageAttrs);
  const tags = attributes.getTags(pageAttrs);
  const pinned = attributes.hasKey(pageAttrs, ["pinned"]);
  const ignored = attributes.hasKey(pageAttrs, ignoreKeys);
  const showToc = attributes.hasKey(pageAttrs, ["toc"]);
  const logLayout = attributes.hasKey(pageAttrs, ["log"]);
  const data: PageData = {};

  return Object.assign(
    data,
    {
      attrs: pageAttrs,
      body: fm.body,
    },
    title ? { title: title } : {},
    datePublished ? { datePublished: datePublished } : {},
    description ? { description: description } : {},
    tags ? { tags: tags } : {},
    ignored ? { ignored: ignored } : {},
    pinned ? { pinned: pinned } : {},
    showToc ? { showToc: showToc } : {},
    logLayout ? { logLayout: logLayout } : {},
  );
};

interface GeneratePageOpts {
  entry: WalkEntry;
  inputPath: string;
  siteUrl: URL;
  ignoreKeys: string[];
}

export async function generateContentPage(
  { entry, inputPath, siteUrl, ignoreKeys }: GeneratePageOpts,
): Promise<Page> {
  const relPath = relative(inputPath, entry.path);
  const raw = decoder.decode(await Deno.readFile(entry.path));
  const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  let page: Page = {
    url: pageUrl,
    isIndex: false,
    pinned: false,
    ignored: false,
    showToc: false,
    logLayout: false,
  };

  if (frontmatter.test(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = render({
    text: page.body ?? raw,
    currentPath: relPath,
    isIndex: false,
    baseUrl: new URL(siteUrl),
  });

  page = { ...page, html, links, headings };

  page.title ??= getTitleFromHeadings(headings) ||
    getTitleFromFilename(relPath);

  return page;
}

export async function generateIndexPageFromFile(
  { entry, inputPath, siteUrl, ignoreKeys }: GeneratePageOpts,
): Promise<Page> {
  const relPath = relative(inputPath, dirname(entry.path)) || ".";
  const raw = decoder.decode(await Deno.readFile(entry.path));
  const dirName = basename(dirname(entry.path));
  const slug = relPath === "." ? "." : slugify(dirName);
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  let page: Page = {
    url: pageUrl,
    isIndex: true,
    pinned: false,
    ignored: false,
    showToc: false,
    logLayout: false,
  };

  if (frontmatter.test(raw)) {
    page = { ...page, ...extractPageData(raw, ignoreKeys) };
  }

  const { html, links, headings } = render({
    text: page.body ?? raw,
    currentPath: relPath,
    isIndex: false,
    baseUrl: new URL(siteUrl),
  });

  page = { ...page, html, links, headings };

  page.title ??= getTitleFromHeadings(headings) ||
    getTitleFromFilename(dirName);

  return page;
}

export function generateIndexPageFromDir(
  { entry, inputPath, siteUrl }: GeneratePageOpts,
): Page {
  const relPath = relative(inputPath, entry.path) || ".";
  const slug = relPath === "." ? "." : slugify(entry.name);
  const pageUrl = new URL(join(dirname(relPath), slug), siteUrl);

  const page: Page = {
    title: entry.name,
    url: pageUrl,
    isIndex: true,
    pinned: false,
    ignored: false,
    showToc: false,
    logLayout: false,
  };

  return page;
}
