import {
  dirname,
  extname,
  frontMatter,
  relative,
  slugify,
  WalkEntry,
} from "./deps.ts";
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

const findIndexEntry = (
  allEntries: Array<WalkEntry>,
  current: WalkEntry,
): WalkEntry | undefined => {
  for (const entry of allEntries) {
    if (
      entry.isFile && entry.name === "index.md" &&
      dirname(entry.path) === current.path
    ) {
      return entry;
    }
  }
};

export async function generatePage(
  entry: WalkEntry,
  inputPath: string,
  allEntries: Array<WalkEntry>,
): Promise<Page | undefined> {
  const decoder = new TextDecoder("utf-8");
  let page: Page;

  if (entry.isFile && entry.name !== INDEX_FILENAME) {
    const relPath = relative(inputPath, entry.path).replace(
      extname(entry.path),
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

    page = {
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
  } else if (entry.isDirectory) {
    const relPath = relative(inputPath, entry.path) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;
    const indexEntry = findIndexEntry(allEntries, entry);

    if (indexEntry) {
      const content = decoder.decode(await Deno.readFile(indexEntry.path));
      const { attributes, body } = frontMatter(content);
      const { html, links, headings } = render(body, relPath, isIndex);
      const title = attr.getTitleFromAttrs(attributes) ||
        attr.getTitleFromHeadings(headings) || entry.name;
      const description = attr.getDescriptionFromAttrs(attributes) || "";
      const tags = attr.getTagsFromAttrs(attributes);

      page = {
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
    } else {
      page = {
        name: entry.name,
        path: relPath,
        title: entry.name,
        slug,
        isIndex,
      };
    }
  } else {
    return;
  }

  return page;
}
