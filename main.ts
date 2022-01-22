/* Dependencies */

import {
  basename,
  dirname,
  ensureDirSync,
  ensureFileSync,
  extname,
  frontMatter,
  join,
  normalize,
  relative,
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
  path: string;
  slug: string;
  attributes: unknown;
  title: string;
  headings: Array<Heading>;
  body: string;
  html: string;
  links: Array<string>;
  backlinks: Array<{ title: string | undefined; slug: string }>;
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
  extname(entry.path) === ".md"
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

const decoder = new TextDecoder("utf-8");

const getTitleFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "title") &&
    typeof attrs.title === "string"
  ) {
    return attrs.title;
  }
};

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) {
      return h.text;
    }
  }
};

for (const path of paths) {
  const content = decoder.decode(Deno.readFileSync(path));
  const { attributes, body } = frontMatter(content);
  const [html, links, headings] = render(body);
  const relativePath = relative(contentPath, path);
  console.log(relativePath);
  const slug = normalize(
    dirname(relativePath) + "/" +
      slugify(basename(relativePath).replace(/\.md$/i, "")),
  );
  const backlinks: Array<{ title: string; slug: string }> = [];
  const title: string = getTitleFromAttrs(attributes) ||
    getTitleFromHeadings(headings) || slug;

  pages.push({
    path: relativePath,
    slug,
    attributes,
    title,
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
        const slug = outPage.slug === INDEX_FILE ? "" : outPage.slug;
        const title = outPage.slug === INDEX_FILE ? "index" : outPage.title;
        inPage.backlinks.push({ title, slug });
      }
    });
  }
}

/* Step 4: Build pages into .html files with appropriate paths */

for (const page of pages) {
  const { slug } = page;

  let outputPath: string;

  if (slug === INDEX_FILE) {
    outputPath = join(buildPath, "index.html");
  } else {
    outputPath = join(buildPath, slug, "index.html");
  }

  ensureFileSync(outputPath);

  const pageHtml = slug === INDEX_FILE
    ? await buildIndex(page, pages.filter((p) => p !== page))
    : await buildPage(page);

  if (typeof pageHtml === "string") {
    Deno.writeTextFileSync(outputPath, pageHtml);
  }
}

// /* Step 5: Build additional asset files */

for (const path of staticPaths) {
  const relPath = relative(contentPath, path);
  const outputPath = join(buildPath, dirname(relPath), basename(relPath));

  ensureDirSync(dirname(outputPath));
  console.log(relPath, outputPath);

  Deno.copyFileSync(path, outputPath);
}

// Deno.writeTextFileSync(`${buildPath}/styles.css`, styles ? styles : "");
// Deno.writeTextFileSync(`${buildPath}/favicon.svg`, getFaviconSvg(favicon));
