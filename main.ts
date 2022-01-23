/* Dependencies */

import { frontMatter, fs, path, slugify } from "./deps.ts";

import { render } from "./render.ts";
import { buildPage } from "./build.ts";

/* Constants */

// const INDEX_FILE = "index";

/* Interfaces and Globals */

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
  description?: string;
  attributes?: unknown;
  date?: Date | null;
  tags?: Array<string>;
  headings?: Array<Heading>;
  body?: string;
  html?: string;
  links?: Array<string>;
}

const pages: Array<Page> = [];
const staticPaths: Array<string> = [];
const decoder = new TextDecoder("utf-8");

/* -------------------------- */

/* Step 0.2: Grab CLI arguments */

const contentPath = Deno.args[0] || ".";
const buildPath = Deno.args[1] || "_site";

/* Step 1: Read files */

/* Step 2: Construct page data */

function hasOwnProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const getTitleFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "title") &&
    typeof attrs.title === "string"
  ) {
    return attrs.title;
  }
};

const getDescriptionFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "description") &&
    typeof attrs.description === "string"
  ) {
    return attrs.description;
  }
};

const getTagsFromAttrs = (attrs: unknown): Array<string> => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "tags") &&
    Array.isArray(attrs.tags)
  ) {
    return attrs.tags;
  }
  return [];
};

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) {
      return h.text;
    }
  }
};

const walkEntries: Array<fs.WalkEntry> = [];
for (const entry of fs.walkSync(contentPath)) {
  walkEntries.push(entry);
}

for (const entry of walkEntries) {
  if (entry.isFile && path.extname(entry.name) !== ".md") {
    staticPaths.push(entry.path);
    continue;
  }

  if (entry.isFile && entry.name !== "index.md") {
    const file = await Deno.open(entry.path);
    const relPath = path.relative(contentPath, entry.path);
    const content = decoder.decode(Deno.readFileSync(entry.path));
    const { attributes, body } = frontMatter(content);
    const [html, links, headings] = render(body);
    const slug = slugify(entry.name.replace(/\.md$/i, ""));
    const title = getTitleFromAttrs(attributes) ||
      getTitleFromHeadings(headings) || entry.name;
    const description = getDescriptionFromAttrs(attributes) || "";
    const tags = getTagsFromAttrs(attributes);
    const date = Deno.fstatSync(file.rid).mtime;
    const isIndex = false;
    file.close();

    const contentPage: Page = {
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

    pages.push(contentPage);
  } else if (entry.isDirectory) {
    const findIndexEntryPath = (dirPath: string): string | undefined => {
      for (const entry of walkEntries) {
        if (
          entry.isFile && entry.name === "index.md" &&
          path.dirname(entry.path) === dirPath
        ) {
          return entry.path;
        }
      }
    };

    const relPath = path.relative(contentPath, entry.path);
    const slug = relPath === "" ? "" : slugify(entry.name);
    const isIndex = true;
    const indexEntry = findIndexEntryPath(entry.path);
    let indexPage: Page;

    if (indexEntry) {
      const content = decoder.decode(Deno.readFileSync(indexEntry));
      const { attributes, body } = frontMatter(content);
      const [html, links, headings] = render(body);
      const title = getTitleFromAttrs(attributes) ||
        getTitleFromHeadings(headings) || entry.name;
      const description = getDescriptionFromAttrs(attributes) || "";
      const tags = getTagsFromAttrs(attributes);

      indexPage = {
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
      indexPage = {
        name: entry.name,
        path: relPath,
        title: entry.name,
        slug,
        isIndex,
      };
    }

    pages.push(indexPage);
  }
}

// pages.forEach((p) => console.log(p.slug));

/* Step 3: Build pages into .html files with appropriate paths */

function getBackLinkedPages(allPages: Array<Page>, inPage: Page): Array<Page> {
  const bl: Array<Page> = [];

  for (const outPage of allPages) {
    const { links } = outPage;

    if (links && links.length > 0) {
      if (links.includes(inPage.path)) {
        bl.push(outPage);
      }
    }
  }

  return bl;
}

function getChildPages(allPages: Array<Page>, current: Page): Array<Page> {
  const pages = allPages.filter((p) => {
    const relative = path.relative(current.path, p.path);
    return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
  });

  return pages;
}

for (const page of pages) {
  const outputPath = path.join(
    buildPath,
    path.dirname(page.path),
    page.slug,
    "index.html",
  );

  const html = await buildPage(
    page,
    page.isIndex ? getChildPages(pages, page) : [],
    getBackLinkedPages(pages, page),
  );

  if (typeof html === "string") {
    fs.ensureFileSync(outputPath);
    Deno.writeTextFileSync(outputPath, html);
  }
}

/* Step 5: Copy additional static files */

for (const p of staticPaths) {
  const relPath = path.relative(contentPath, p);
  const outputPath = path.join(
    buildPath,
    path.dirname(relPath),
    path.basename(relPath),
  );

  fs.ensureDirSync(path.dirname(outputPath));
  Deno.copyFileSync(p, outputPath);
}
