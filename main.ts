/* Dependencies */

import { basename, ensureFileSync, frontMatter, walkSync } from "./deps.ts";
import { render } from "./render.ts";

/* Constants */

const INDEX_FILE = "index";

/* Interfaces and Globals */

interface Page {
  path: string;
  slug: string;
  attributes: unknown;
  body: string;
  html: string;
  links: Array<string>;
  backlinks: Array<string>;
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

for (const path of paths) {
  const content = decoder.decode(Deno.readFileSync(path));
  const { attributes, body } = frontMatter(content);
  const [html, links] = render(body);
  const slug = basename(path).replace(/\.md$/i, "");
  const backlinks: Array<string> = [];
  const cleanPath = path.replace(contentPath, "");

  pages.push({
    path: cleanPath,
    slug,
    attributes,
    body,
    html,
    links,
    backlinks,
  });
}

for (const outPage of pages) {
  const { links } = outPage;

  if (links.length > 0) {
    pages.forEach((inPage) => {
      if (links.includes(inPage.path)) {
        inPage.backlinks.push(outPage.path);
      }
    });
  }
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
  pages.map(({ slug, attributes }) => {
    const title = attributes && hasOwnProperty(attributes, "title")
      ? attributes.title
      : "";
    const href = slug === INDEX_FILE ? "/" : `/${slug}`;
    return `<a href=${href}>${title}</a>`;
  }).join("\n")
}</div>`;

const getBacklinksHtml = (backlinks: Array<string>): string => {
  return `
  <ul>${
    backlinks.map((link) =>
      `<li><a href="/${link.replace(".md", "")}">${link}</a></li>`
    ).join(
      "\n",
    )
  }</ul> `;
};

const getHtmlByPage = ({ attributes, html, backlinks }: Page) => {
  const title = attributes && hasOwnProperty(attributes, "title")
    ? attributes.title
    : "";
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
      ${title && "<h1 id='title'>" + title + "</h1>"}
      ${html}
      <hr />
      <div>
        <h4>Backlinks</h4>
        ${getBacklinksHtml(backlinks)}
      </div>
    </article>
  </body>
</html>`;
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
