/* Dependencies */

import {
  ensureDirSync,
  ensureFileSync,
  frontMatter,
  path,
  slugify,
  walkSync,
} from "./deps.ts";

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
  slug: string;
  path: string;
  title: string;
  description?: string;
  attributes?: unknown;
  date: Date | null;
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

const paths: Array<string> = [];

for (
  const entry of walkSync(contentPath, {
    includeDirs: false,
  })
) {
  path.extname(entry.path) === ".md"
    ? paths.push(entry.path)
    : staticPaths.push(entry.path);
}

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

for (const p of paths) {
  const file = await Deno.open(p);
  // TODO: don't open/read the file twice
  const content = decoder.decode(Deno.readFileSync(p));
  const { attributes, body } = frontMatter(content);
  const [html, links, headings] = render(body);
  const relativePath = path.relative(contentPath, p);
  const slug = path.join(
    path.dirname(relativePath),
    slugify(path.basename(relativePath).replace(/\.md$/i, "")),
  );
  const title: string = getTitleFromAttrs(attributes) ||
    getTitleFromHeadings(headings) || slug;
  const description = getDescriptionFromAttrs(attributes) || "";
  const tags = getTagsFromAttrs(attributes);
  const date = Deno.fstatSync(file.rid).mtime;
  const isIndex = path.basename(p) === "index.md";

  file.close();

  pages.push({
    path: relativePath,
    slug,
    attributes,
    title,
    description,
    isIndex,
    date,
    tags,
    headings,
    body,
    html,
    links,
  });
}

/* Step 3: Build pages into .html files with appropriate paths */

function getBackLinkedPages(allPages: Array<Page>, inPage: Page): Array<Page> {
  const bl: Array<Page> = [];

  for (const outPage of allPages) {
    const { links } = outPage;

    if (links && links.length > 0) {
      if (links.includes(inPage.path)) {
        // const slug = outPage.slug === INDEX_FILE ? "" : outPage.slug;
        bl.push(outPage);
      }
    }
  }

  return bl;
}

for (const page of pages) {
  if (page.isIndex) {
    continue;
  }
  const { slug } = page;
  const outputPath = path.join(buildPath, slug, "index.html");
  const html = await buildPage(
    page,
    [],
    getBackLinkedPages(pages, page),
  );

  if (typeof html === "string") {
    ensureFileSync(outputPath);
    Deno.writeTextFileSync(outputPath, html);
  }
}

/* Step 4: Build index pages for directories */

function existingIndexPage(pages: Array<Page>, dir: string): Page | null {
  for (const page of pages) {
    if (
      path.basename(page.path) === "index.md" && path.dirname(page.path) === dir
    ) {
      return page;
    }
  }
  return null;
}

const dirs: Set<string> = new Set();

pages.map((page) => {
  const dir = path.normalize(path.dirname(page.path));
  dirs.add(dir);
});

for (const dir of dirs) {
  const dirPages = pages.filter((page) =>
    path.dirname(page.path).startsWith(dir)
  );
  // const dirPages = pages;
  const indexPage: Page = existingIndexPage(pages, dir) || {
    slug: dir,
    path: dir,
    title: dir,
    date: new Date(),
    isIndex: true,
  };

  const outputPath = path.join(buildPath, dir, "index.html");
  const html = await buildPage(
    indexPage,
    dirPages,
    [],
  );

  console.log("Building index for:", dir, " at:", outputPath);

  if (typeof html === "string") {
    ensureFileSync(outputPath);
    Deno.writeTextFileSync(outputPath, html);
  } else {
    throw new Error("can not build dir index");
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

  ensureDirSync(path.dirname(outputPath));
  Deno.copyFileSync(p, outputPath);
}
