/* Dependencies */

import {
  basename,
  ensureFileSync,
  frontMatter,
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

/* -------------------------- */

/* Step 0: Grab CLI arguments */

const contentPath = Deno.args[0] || ".";
const buildPath = Deno.args[1] || "./build";

/* Step 1: Read files */

const paths: Array<string> = [];

for (
  const entry of walkSync(contentPath, {
    exts: ["md"],
    includeDirs: false,
  })
) {
  paths.push(entry.path);
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
  const cleanPath = path.replace(contentPath, "");
  const slug = slugify(basename(path).replace(/\.md$/i, ""));
  const backlinks: Array<{ title: string; slug: string }> = [];
  const title: string = getTitleFromAttrs(attributes) ||
    getTitleFromHeadings(headings) || slug;

  pages.push({
    path: cleanPath,
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
console.log(pages);

// const index = `
//   <div id="nav">
//   ${
//   pages.map(({ title, slug, attributes }) => {
//     const href = slug === INDEX_FILE ? "/" : `/${slug}`;
//     return `<a href=${href}>${title}</a>`;
//   }).join("\n")
// }</div>`;

// const getHtmlByPage = ({ attributes, title, html, backlinks }: Page) => `
// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <title>${title}</title>
//     <link href="https://unpkg.com/@primer/css@^16.0.0/dist/primer.css" rel="stylesheet" />
//     <link rel="icon" href="/favicon.svg">
//     <style>
//     	.markdown-body {
//     		box-sizing: border-box;
//     		min-width: 200px;
//     		max-width: 980px;
//     		margin: 0 auto;
//     		padding: 45px;
//     	}
//     	@media (max-width: 767px) {
//     		.markdown-body {
//     			padding: 15px;
//     		}
//     	}
//     </style>
//   </head>
//   <body>
//     ${index}
//     <article class="markdown-body">
//       ${title && "<h1 id='title'>" + title + "</h1>"}
//       ${html}
//       <hr />
//       <div>
//         <h4>Backlinks</h4>
//         ${getBacklinksHtml(backlinks)}
//       </div>
//     </article>
//   </body>
// </html>`;

/* Step 4: Build pages into .html files with appropriate paths */

for (const page of pages) {
  const { slug } = page;

  let outputPath: string;

  if (slug === INDEX_FILE) {
    outputPath = `${buildPath}/index.html`;
  } else {
    outputPath = `${buildPath}/${slug}/index.html`;
  }

  ensureFileSync(outputPath);

  const pageHtml = slug === INDEX_FILE
    ? await buildIndex(page, pages)
    : await buildPage(page);

  if (typeof pageHtml === "string") {
    Deno.writeTextFileSync(outputPath, pageHtml);
  }
}

// /* Step 5: Build additional asset files */
// Deno.writeTextFileSync(`${buildPath}/styles.css`, styles ? styles : "");
// Deno.writeTextFileSync(`${buildPath}/favicon.svg`, getFaviconSvg(favicon));
