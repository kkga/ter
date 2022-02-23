import { fm, fs, path, slugify } from "./deps.ts";
import { render } from "./render.ts";
import * as data from "./data.ts";
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
  data: data.PageData;
  links: Array<URL>;
  isIndex: boolean;
  description?: string;
  date?: Date | null;
  body?: string;
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
    if (page.url.pathname === linkUrl.pathname) {
      return false;
    } else {
      continue;
    }
  }
  return true;
}

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) {
      return h.text;
    }
  }
};

const getTitleFromFilename = (filePath: string): string => {
  return path.basename(filePath).replace(path.extname(filePath), "");
};

async function getLastCommitDate(path: string): Promise<Date | undefined> {
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

export function getAllTags(pages: Array<Page>): Array<string> {
  const tags: Set<string> = new Set();

  pages.forEach((page) => {
    data.getTags(page.data).forEach((tag: string) => tags.add(tag));
  });

  return [...tags];
}

export function getPagesByTag(allPages: Array<Page>, tag: string): Array<Page> {
  return allPages.filter((page) => data.getTags(page.data).includes(tag));
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
    current.url.pathname === path.dirname(p.url.pathname)
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
  entry: fs.WalkEntry,
  inputPath: string,
  site: SiteConfig,
): Promise<Page> {
  if (entry.isFile && entry.name !== INDEX_FILENAME) {
    const relPath = path.relative(inputPath, entry.path);
    const isIndex = false;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const parsed = fm(content);
    const pageData = parsed.attributes as data.PageData;
    const body = parsed.body;
    const date = data.getDate(pageData) || await getLastCommitDate(entry.path);
    const { html, links, headings } = render(body, relPath, isIndex, site.url);
    const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
    const title = data.getTitle(pageData) ||
      getTitleFromHeadings(headings) || getTitleFromFilename(relPath);
    const description = data.getDescription(pageData) || "";
    const tags = data.getTags(pageData);
    const url = new URL(path.join(path.dirname(relPath), slug), site.url);

    return {
      data: pageData,
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
    const relPath = path.relative(inputPath, path.dirname(entry.path)) || ".";
    const name = path.basename(path.dirname(entry.path));
    const slug = relPath === "." ? "." : slugify(name);
    const isIndex = true;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const parsed = fm(content);
    const pageData = parsed.attributes as data.PageData;
    const body = parsed.body;
    const { html, links, headings } = render(body, relPath, isIndex, site.url);
    const title = data.getTitle(pageData) || getTitleFromHeadings(headings) ||
      name;
    const description = data.getDescription(pageData) || "";
    const tags = data.getTags(pageData);
    const url = new URL(path.join(path.dirname(relPath), slug), site.url);

    return {
      data: pageData,
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
    const relPath = path.relative(inputPath, entry.path) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;
    const url = new URL(path.join(path.dirname(relPath), slug), site.url);

    return {
      title: entry.name,
      data: {},
      url,
      isIndex,
      links: [],
    };
  } else {
    return Promise.reject();
  }
}
