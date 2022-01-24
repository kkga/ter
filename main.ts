/* Dependencies */

import { frontMatter, fs, path, slugify } from "./deps.ts";
import { render } from "./render.ts";
import { buildPage } from "./build.ts";

/* Constants */

const STATIC_PATH = `${Deno.cwd()}/_static/`;
const DEFAULT_CONTENT_PATH = `${Deno.cwd()}`;
const DEFAULT_BUILD_PATH = `${Deno.cwd()}/_site`;

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

export const contentPath = Deno.args[0] || DEFAULT_CONTENT_PATH;
export const buildPath = Deno.args[1] || DEFAULT_BUILD_PATH;

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
    const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
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

/* Step 5: Prepare files for output */

interface OutputFile {
  inputPath: string;
  outputPath: string;
  fileContent?: string;
}

async function buildContentFiles(pages: Array<Page>): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

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
      files.push({
        inputPath: page.path,
        outputPath,
        fileContent: html,
      });
    }
  }

  return files;
}

function getStaticFiles(paths: Array<string>): OutputFile[] {
  const files: Array<OutputFile> = [];

  for (const p of paths) {
    const relPath = path.relative(contentPath, p);
    const outputPath = path.join(
      buildPath,
      path.dirname(relPath),
      path.basename(relPath),
    );
    files.push({
      inputPath: p,
      outputPath,
    });
  }

  return files;
}

function getSiteAssets(assetsPath: string): OutputFile[] {
  const files: Array<OutputFile> = [];
  for (const entry of fs.walkSync(assetsPath, { includeDirs: false })) {
    const relPath = path.relative(assetsPath, entry.path);
    const outputPath = path.join(
      buildPath,
      path.dirname(relPath),
      path.basename(relPath),
    );

    files.push({
      inputPath: entry.path,
      outputPath,
    });
  }
  return files;
}

console.log("Building content pages...");
const contentFiles = await buildContentFiles(pages);

console.log("Getting static files...");
const staticFiles = getStaticFiles(staticContentPaths);

console.log("Getting site assets...");
const siteAssetFiles = getSiteAssets(STATIC_PATH);

/* Step 6: Write output */

fs.emptyDirSync(buildPath);

if (contentFiles.length > 0) {
  console.log("\nWriting content pages:");

  for (const file of contentFiles) {
    console.log(
      `  ${file.inputPath || "."}\t-> ${
        path.relative(buildPath, file.outputPath)
      }`,
    );
    if (file.fileContent) {
      fs.ensureDirSync(path.dirname(file.outputPath));
      Deno.writeTextFileSync(file.outputPath, file.fileContent);
    }
  }
}

if (staticFiles.length > 0) {
  console.log("\nCopying static files:");

  for (const file of staticFiles) {
    console.log(
      `  ${path.relative(contentPath, file.inputPath)}\t-> ${
        path.relative(buildPath, file.outputPath)
      }`,
    );
    fs.ensureDirSync(path.dirname(file.outputPath));
    Deno.copyFileSync(file.inputPath, file.outputPath);
  }
}

if (siteAssetFiles.length > 0) {
  console.log("\nCopying site assets:");

  for (const file of siteAssetFiles) {
    console.log(
      `  ${path.relative(STATIC_PATH, file.inputPath)}\t-> ${
        path.relative(buildPath, file.outputPath)
      }`,
    );
    fs.ensureDirSync(path.dirname(file.outputPath));
    Deno.copyFileSync(file.inputPath, file.outputPath);
  }
}

/* Step 7: Print out result stats */

const endDate = new Date();
const buildSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

console.log(
  `\nResult:
  Built ${contentFiles.length} pages
  Copied ${staticFiles.length} static files
  Copied ${siteAssetFiles.length} site assets
  In ${buildSeconds} seconds`,
);
