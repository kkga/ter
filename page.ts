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

export async function generatePage(
  entry: WalkEntry,
  inputPath: string,
  allEntries: Array<WalkEntry>,
): Promise<Page | undefined> {
  const decoder = new TextDecoder("utf-8");

  if (entry.isFile && entry.name !== "index.md") {
    // TODO: use opened file for reading content
    const file = await Deno.open(entry.path);
    const relPath = relative(inputPath, entry.path).replace(
      extname(entry.path),
      "",
    );
    const content = decoder.decode(await Deno.readFile(entry.path));
    const { attributes, body } = frontMatter(content);
    const [html, links, headings] = render(body, relPath);
    const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
    const title = attr.getTitleFromAttrs(attributes) ||
      attr.getTitleFromHeadings(headings) || entry.name;
    const description = attr.getDescriptionFromAttrs(attributes) || "";
    const tags = attr.getTagsFromAttrs(attributes);
    const date = attr.getDateFromAttrs(attributes) ||
      await Deno.fstat(file.rid).then((file) => file.mtime);
    const isIndex = false;
    file.close();

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
  } else if (entry.isDirectory) {
    const findIndexEntryPath = (dirPath: string): string | undefined => {
      for (const entry of allEntries) {
        if (
          entry.isFile && entry.name === "index.md" &&
          dirname(entry.path) === dirPath
        ) {
          return entry.path;
        }
      }
    };

    const relPath = relative(inputPath, entry.path) || ".";
    const slug = relPath === "." ? "." : slugify(entry.name);
    const isIndex = true;
    const indexEntry = findIndexEntryPath(entry.path);

    if (indexEntry) {
      const content = decoder.decode(await Deno.readFile(indexEntry));
      const { attributes, body } = frontMatter(content);
      const [html, links, headings] = render(body, relPath);
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
    } else {
      return {
        name: entry.name,
        path: relPath,
        title: entry.name,
        slug,
        isIndex,
      };
    }
  }
}
