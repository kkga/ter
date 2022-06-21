import { WalkEntry } from "./deps.ts";
import { basename, dirname, extname, join, relative } from "./deps.ts";
import { fm } from "./deps.ts";
import { slugify } from "./deps.ts";
import { render } from "./render.ts";
import * as attrs from "./attributes.ts";
import { SiteConfig } from "./config.ts";
import { INDEX_FILENAME } from "./entries.ts";

const decoder = new TextDecoder("utf-8");

export interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

export interface Page {
  url: URL;
  path?: string;
  title: string;
  attrs: attrs.PageAttributes;
  links: Array<URL>;
  isIndex: boolean;
  description?: string;
  date?: Date | undefined;
  body?: string;
  html?: string;
  tags?: Array<string>;
  headings?: Array<Heading>;
}

export interface TagPage {
  name: string;
  pages: Array<Page>;
}

async function _getLastCommitDate(path: string): Promise<Date | undefined> {
  const opts: Deno.RunOptions = {
    cmd: ["git", "log", "-1", "--format=%as", "--", path],
    stdout: "piped",
    stderr: "piped",
  };

  const process = Deno.run(opts);
  const { success } = await process.status();

  if (success) {
    const timestamp = Date.parse(decoder.decode(await process.output()));
    if (!isNaN(timestamp)) return new Date(timestamp);
  }
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
  const tags: Set<string> = new Set();

  pages.forEach((page) => {
    attrs.getTags(page.attrs).forEach((tag: string) => tags.add(tag));
  });

  return [...tags];
}

export function getPagesByTag(allPages: Array<Page>, tag: string): Array<Page> {
  return allPages.filter((page) => attrs.getTags(page.attrs).includes(tag));
}

export function getBacklinkPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages: Set<Page> = new Set();

  for (const outPage of allPages) {
    for (const url of outPage.links) {
      if (
        outPage.url.pathname !== current.url.pathname &&
        url.pathname === current.url.pathname
      ) {
        pages.add(outPage);
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

export async function generatePage(
  entry: WalkEntry,
  inputPath: string,
  site: SiteConfig,
): Promise<Page> {
  if (entry.isFile && entry.name !== INDEX_FILENAME) {
    const relPath = relative(inputPath, entry.path);
    const isIndex = false;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const parsed = fm(content);
    const pageAttrs = parsed.attributes as attrs.PageAttributes;
    const body = parsed.body;
    const date = attrs.getDate(pageAttrs);
    const { html, links, headings } = render({
      text: body,
      currentPath: relPath,
      isIndex,
      baseUrl: new URL(site.url),
    });
    const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
    const title = attrs.getTitle(pageAttrs) ||
      getTitleFromHeadings(headings) || getTitleFromFilename(relPath);
    const description = attrs.getDescription(pageAttrs) || "";
    const tags = attrs.getTags(pageAttrs);
    const url = new URL(join(dirname(relPath), slug), site.url);

    return {
      attrs: pageAttrs,
      path: relPath,
      url,
      body,
      html,
      links,
      headings,
      title,
      description,
      tags,
      date,
      isIndex,
    };
  } else if (entry.isFile && entry.name === INDEX_FILENAME) {
    const relPath = relative(inputPath, dirname(entry.path)) || ".";
    const name = basename(dirname(entry.path));
    const slug = relPath === "." ? "." : slugify(name);
    const isIndex = true;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const parsed = fm(content);
    const pageAttrs = parsed.attributes as attrs.PageAttributes;
    const body = parsed.body;
    const { html, links, headings } = render({
      text: body,
      currentPath: relPath,
      isIndex,
      baseUrl: new URL(site.url),
    });
    const title = attrs.getTitle(pageAttrs) || getTitleFromHeadings(headings) ||
      name;
    const description = attrs.getDescription(pageAttrs) || "";
    const tags = attrs.getTags(pageAttrs);
    const url = new URL(join(dirname(relPath), slug), site.url);

    return {
      attrs: pageAttrs,
      url,
      body,
      html,
      links,
      headings,
      title,
      description,
      tags,
      isIndex,
    };
  } else if (entry.isDirectory) {
    const relPath = relative(inputPath, entry.path) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;
    const url = new URL(join(dirname(relPath), slug), site.url);

    return {
      title: entry.name,
      attrs: {},
      url,
      isIndex,
      links: [],
    };
  } else return Promise.reject();
}
