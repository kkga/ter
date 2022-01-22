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
import { buildIndex, buildPage } from "./build.ts";

/* Constants */

const INDEX_FILE = "index";

/* Interfaces and Globals */

export interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

export interface Page {
  slug: string;
  path: string;
  attributes: unknown;
  title: string;
  description: string;
  date: Date | null;
  tags: Array<string>;
  headings: Array<Heading>;
  body: string;
  html: string;
  links: Array<string>;
  backlinks: Array<string>;
}

const pages: Array<Page> = [];
const staticPaths: Array<string> = [];

/* -------------------------- */

/* Step 0: Grab CLI arguments */

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

const decoder = new TextDecoder("utf-8");

for (const p of paths) {
  const file = await Deno.open(p);
  const content = decoder.decode(Deno.readFileSync(p));
  const { attributes, body } = frontMatter(content);
  const [html, links, headings] = render(body);
  const relativePath = path.relative(contentPath, p);
  const slug = path.join(
    path.dirname(relativePath),
    slugify(path.basename(relativePath).replace(/\.md$/i, "")),
  );
  const backlinks: Array<string> = [];
  const title: string = getTitleFromAttrs(attributes) ||
    getTitleFromHeadings(headings) || slug;
  const description = getDescriptionFromAttrs(attributes) || "";
  const tags = getTagsFromAttrs(attributes);
  const date = Deno.fstatSync(file.rid).mtime;

  file.close();

  pages.push({
    path: relativePath,
    slug,
    attributes,
    title,
    description,
    date,
    tags,
    headings,
    body,
    html,
    links,
    backlinks,
  });
}

// Populate backlinks
for (const outPage of pages) {
  const { links } = outPage;

  if (links.length > 0) {
    pages.forEach((inPage) => {
      if (links.includes(inPage.path)) {
        // const slug = outPage.slug === INDEX_FILE ? "" : outPage.slug;
        inPage.backlinks.push(outPage.path);
      }
    });
  }
}

/* Step 3: Build pages into .html files with appropriate paths */

for (const page of pages) {
  const { slug } = page;

  let outputPath: string;

  if (slug === INDEX_FILE) {
    outputPath = path.join(buildPath, "index.html");
  } else {
    outputPath = path.join(buildPath, slug, "index.html");
  }

  const pageHtml = slug === INDEX_FILE
    ? await buildIndex(page, pages.filter((p) => p !== page))
    : await buildPage(page, pages.filter((p) => p !== page));

  if (typeof pageHtml === "string") {
    ensureFileSync(outputPath);
    Deno.writeTextFileSync(outputPath, pageHtml);
  }
}

/* Step 4: Copy additional static files */

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
