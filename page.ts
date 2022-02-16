import { frontMatter, path, slugify, WalkEntry } from "./deps.ts";
import { render } from "./render.ts";
import * as attr from "./attr.ts";

const INDEX_FILENAME = "index.md";

export interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

export interface Page {
  isIndex: boolean;
  path: string;
  name: string;
  title: string;
  slug: string;
  date?: Date | null;
  description?: string;
  attributes?: unknown;
  tags?: Array<string>;
  headings?: Array<Heading>;
  body?: string;
  html?: string;
  links?: Array<string>;
}

export interface TagPage {
  name: string;
  pages: Array<Page>;
}

export function isDeadLink(allPages: Array<Page>, path: string): boolean {
  for (const page of allPages) {
    if (page.path === path) {
      return false;
    } else {
      continue;
    }
  }
  return true;
}

export function getAllTags(pages: Array<Page>): Array<string> {
  const tags: Set<string> = new Set();

  pages.forEach((page) => {
    attr.getTagsFromAttrs(page.attributes).forEach((tag) => tags.add(tag));
  });

  return [...tags];
}

export function getPagesByTag(allPages: Array<Page>, tag: string): Array<Page> {
  return allPages.filter((page) =>
    attr.getTagsFromAttrs(page.attributes).includes(tag)
  );
}

export function getBacklinkPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages: Array<Page> = [];

  for (const outPage of allPages) {
    if (outPage.links?.includes(current.path)) {
      pages.push(outPage);
    }
  }

  return pages;
}

export function getChildPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages = allPages.filter((p) =>
    current.path !== p.path && current.path === path.dirname(p.path)
  );

  return pages;
}

export function getChildTags(
  allPages: Array<Page>,
  current: Page,
): Array<string> {
  const tags: Set<string> = new Set();

  allPages.forEach((page) => {
    const relPath = path.relative(current.path, page.path);
    if (!relPath.startsWith("..") && relPath !== "") {
      attr.getTagsFromAttrs(page.attributes).forEach((tag) => tags.add(tag));
    }
  });

  return [...tags];
}

// const findIndexEntry = (
//   allEntries: Array<WalkEntry>,
//   current: WalkEntry,
// ): WalkEntry | undefined => {
//   for (const entry of allEntries) {
//     if (
//       entry.isFile && entry.name === "index.md" &&
//       path.dirname(entry.path) === current.path
//     ) {
//       return entry;
//     }
//   }
// };

export async function generatePage(
  entry: WalkEntry,
  inputPath: string,
): Promise<Page> {
  const decoder = new TextDecoder("utf-8");

  if (entry.isFile && entry.name !== INDEX_FILENAME) {
    const relPath = path.relative(inputPath, entry.path).replace(
      path.extname(entry.path),
      "",
    );
    const isIndex = false;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const { attributes, body } = frontMatter(content);

    const file = await Deno.open(entry.path);
    const date = attr.getDateFromAttrs(attributes) ||
      await Deno.fstat(file.rid).then((file) => file.mtime);
    file.close();

    const { html, links, headings } = render(body, relPath, isIndex);
    const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
    const title = attr.getTitleFromAttrs(attributes) ||
      attr.getTitleFromHeadings(headings) || entry.name;
    const description = attr.getDescriptionFromAttrs(attributes) || "";
    const tags = attr.getTagsFromAttrs(attributes);

    return {
      name: entry.name,
      path: relPath,
      attributes,
      body,
      html,
      links,
      headings,
      title,
      slug,
      description,
      tags,
      date,
      isIndex,
    };
  } else if (entry.isFile && entry.name === INDEX_FILENAME) {
    const relPath = path.relative(inputPath, path.dirname(entry.path)) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;
    const content = decoder.decode(await Deno.readFile(entry.path));
    const { attributes, body } = frontMatter(content);
    const { html, links, headings } = render(body, relPath, isIndex);
    const title = attr.getTitleFromAttrs(attributes) ||
      attr.getTitleFromHeadings(headings) || entry.name;
    const description = attr.getDescriptionFromAttrs(attributes) || "";
    const tags = attr.getTagsFromAttrs(attributes);

    return {
      name: entry.name,
      path: relPath,
      attributes,
      body,
      html,
      links,
      headings,
      title,
      slug,
      description,
      tags,
      isIndex,
    };
  } else if (entry.isDirectory) {
    const relPath = path.relative(inputPath, entry.path) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;

    return {
      name: entry.name,
      path: relPath,
      title: entry.name,
      slug,
      isIndex,
    };
  } else {
    return Promise.reject();
  }
}
