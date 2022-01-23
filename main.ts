/* Dependencies */

import { frontMatter, fs, path, slugify } from "./deps.ts";
import { render } from "./render.ts";
import { buildPage } from "./build.ts";

/* Constants */

export const STATIC_PATH = `${Deno.cwd()}/_static/`;
export const DEFAULT_INPUT_PATH = `${Deno.cwd()}`;
export const DEFAULT_OUTPUT_PATH = `${Deno.cwd()}/_site`;
const reDotOrUnderscorePrefix = /^[\._].+/ig;

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

/* LET'S BUILD A SITE */

const startDate = new Date();

/* Step 0: Grab CLI arguments */

const contentPath = Deno.args[0] || DEFAULT_INPUT_PATH;
const buildPath = Deno.args[1] || DEFAULT_OUTPUT_PATH;

/* Step 1: Grab files */

const walkEntries: Array<fs.WalkEntry> = [];

for (const entry of fs.walkSync(contentPath)) {
  walkEntries.push(entry);
}

const hasDotOrUnderscorePrefix = (path: string): boolean => {
  const pathChunks = path.split("/");
  for (const chunk of pathChunks) {
    if (reDotOrUnderscorePrefix.test(chunk)) {
      return true;
    }
  }
  return false;
};

const filteredEntries = walkEntries.filter((entry) =>
  !hasDotOrUnderscorePrefix(entry.path)
);

/* Step 2: Read files and construct page data */

const pages: Array<Page> = [];
const staticContentPaths: Array<string> = [];
const decoder = new TextDecoder("utf-8");

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

for (const entry of filteredEntries) {
  if (entry.isFile && path.extname(entry.name) !== ".md") {
    staticContentPaths.push(entry.path);
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
      for (const entry of filteredEntries) {
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
    const curDir = current.isIndex
      ? path.basename(
        path.dirname(path.join(contentPath, current.path, "index")),
      )
      : path.basename(path.dirname(path.join(contentPath, current.path)));
    const pDir = path.basename(path.dirname(path.join(contentPath, p.path)));
    return curDir === pDir;
  });

  return pages;
}

console.log("Building content files...");
let pageCount = 0;

for (const page of pages) {
  const outputPath = path.join(
    buildPath,
    path.dirname(page.path),
    page.slug,
    "index.html",
  );

  console.log(
    `  ${page.path} -> ${path.dirname(path.relative(buildPath, outputPath))}\
${page.isIndex ? "/" : ""}`,
  );

  const html = await buildPage(
    page,
    page.isIndex ? getChildPages(pages, page) : [],
    getBackLinkedPages(pages, page),
  );

  if (typeof html === "string") {
    fs.ensureFileSync(outputPath);
    Deno.writeTextFileSync(outputPath, html);
    pageCount++;
  }
}

/* Step 4: Copy static content files */

console.log("\nCopying static content...");
let staticCount = 0;

for (const p of staticContentPaths) {
  const relPath = path.relative(contentPath, p);
  const outputPath = path.join(
    buildPath,
    path.dirname(relPath),
    path.basename(relPath),
  );

  console.log(
    `  ${relPath} -> ${path.relative(buildPath, outputPath)}`,
  );

  fs.ensureDirSync(path.dirname(outputPath));
  Deno.copyFileSync(p, outputPath);
  staticCount++;
}

/* Step 5: Copy static site assets */

console.log("\nCopying site assets...");
let assetCount = 0;

for (const entry of fs.walkSync(STATIC_PATH, { includeDirs: false })) {
  const relPath = path.relative(STATIC_PATH, entry.path);
  const outputPath = path.join(
    buildPath,
    path.dirname(relPath),
    path.basename(relPath),
  );

  console.log(
    `  ${relPath} -> ${path.relative(buildPath, outputPath)}`,
  );

  fs.ensureDirSync(path.dirname(outputPath));
  Deno.copyFileSync(entry.path, outputPath);
  assetCount++;
}

const endDate = new Date();
const buildSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

console.log(
  `\nResult:
  Built ${pageCount} pages
  Copied ${staticCount} static assets
  Copied ${assetCount} site assets
  In ${buildSeconds} seconds`,
);
