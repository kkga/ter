/* Dependencies */

import { ensureFileSync } from "https://deno.land/std@0.121.0/fs/mod.ts";
import { walkSync } from "https://deno.land/std@0.121.0/fs/mod.ts";
// import { slugify } from "https://deno.land/x/slugify/mod.ts";
import { parse } from "https://deno.land/std@0.121.0/encoding/yaml.ts";
import { basename } from "https://deno.land/std/path/mod.ts";
import { render } from "./render.ts";

/* Constants */

const INDEX_FILE = "index";
// const FRONTMATTER_DELIMITER = "---";
const reFrontmatter = /(?<!\s+)^---$([\s\S]*?)^---$([\s\S]*?)/m;

/* Interfaces and Globals */

interface Page {
  slug: string;
  meta: unknown;
  content: string;
  html: string;
}

interface Frontmatter {
  [key: string]: unknown;
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

function parseFrontmatter(text: string): unknown {
  if (reFrontmatter.test(text)) {
    const [_, yaml] = text.match(reFrontmatter)!;
    const data = parse(yaml.trim());

    if (data && typeof data === "object") {
      return data;
    }
  }
}

function hasOwnProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const decoder = new TextDecoder("utf-8");

for (const path of paths) {
  const content = decoder.decode(Deno.readFileSync(path));
  const meta = parseFrontmatter(content);
  const html = render(content.replace(reFrontmatter, "").trim());
  const slug = basename(path).replace(/\.md$/i, "");
  pages.push({ slug, meta, content, html });
}

console.log(pages);

/* Step 3: Generate templates for html content */

// const isHomePath = (path: string) => path === HOME_PATH;

// const getStylesheetHref = (path: string) => {
//   return isHomePath(path) ? STYLESHEET_PATH : `../${STYLESHEET_PATH}`;
// };

// const getFaviconSvg = (favicon: string) => `
//   <svg xmlns="http://www.w3.org/2000/svg">
//     <text y="32" font-size="32">${favicon ? favicon : "🦕"}</text>
//   </svg>
// `;

const index = `
  <div id="nav">
  ${
  pages.map(({ slug, meta }) => {
    const title = meta && hasOwnProperty(meta, "title") ? meta.title : "";
    const href = slug === INDEX_FILE ? "/" : `/${slug}`;
    return `<a href=${href}>${title}</a>`;
  }).join("\n")
}</div>`;

const getHtmlByPage = ({ meta, html }: Page) => {
  const title = meta && hasOwnProperty(meta, "title") ? meta.title : "";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>${title}</title>
  <link href="https://unpkg.com/@primer/css@^16.0.0/dist/primer.css" rel="stylesheet" />
  <link rel="icon" href="/favicon.svg">
  <style>
  	.markdown-body {
  		box-sizing: border-box;
  		min-width: 200px;
  		max-width: 980px;
  		margin: 0 auto;
  		padding: 45px;
  	}

  	@media (max-width: 767px) {
  		.markdown-body {
  			padding: 15px;
  		}
  	}
  </style>
</head>
  <body>
    ${index}
    <article class="markdown-body">
    {title && <h1 id="title">${title}</h1>}
    ${html}
    </article>
  </body>
</html>
`;
};

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
  Deno.writeTextFileSync(outputPath, getHtmlByPage(page));
}

// /* Step 5: Build additional asset files */
// Deno.writeTextFileSync(`${buildPath}/styles.css`, styles ? styles : "");
// Deno.writeTextFileSync(`${buildPath}/favicon.svg`, getFaviconSvg(favicon));
