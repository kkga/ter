/* Dependencies */

import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { ensureFileSync } from "https://deno.land/std@0.121.0/fs/mod.ts";
import { walkSync } from "https://deno.land/std@0.121.0/fs/mod.ts";
import { slugify } from "https://deno.land/x/slugify/mod.ts";

/* Constants */

const INDEX_PATH = "index";
const STYLESHEET_PATH = "styles.css";

/* Interfaces and Globals */

interface Page {
  path: string;
  title: string;
  html: string;
}

let pages: Array<Page> = [];

/* -------------------------- */

/* Step 0: Grab CLI arguments */

const contentPath = Deno.args[0] || ".";
const buildPath = Deno.args[1] || "./build";

// if (!filename) {
//   console.log("Please specify .md file");
//   Deno.exit(1);
// } else {
//   console.log(`Building site with '${filename}' into '${buildPath}'`);
// }

/* Step 1: Read files */

let paths: Array<string> = [];
const decoder = new TextDecoder("utf-8");

for (const entry of walkSync(contentPath)) {
  if (entry.isFile && entry.name.endsWith(".md")) {
    paths.push(entry.path);
  }
}

/* Step 2: Construct page data */

for (const path of paths) {
  const fileContent = decoder.decode(Deno.readFileSync(path));
  const { meta: frontMatter, content } = Marked.parse(fileContent);
  const { title } = frontMatter;
  const slug = slugify(title, { lower: true });
  pages.push({ path: slug, title, html: content });
}

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

// const getNavigation = (currentPath: string) => `
//   <div id="nav">
//     ${
//   pages.map(({ path, name }) => {
//     const href = path === HOME_PATH ? "/" : path;
//     const isSelectedPage = path === currentPath;
//     const classes = `nav-item ${isSelectedPage ? "selected" : ""}`;
//     return `<a class="${classes}" href=${href}>${name}</a>`;
//   }).join("\n")
// }
//   </div>
// `;

// const footer = layout.footer ? `<div id="footer">${layout.footer}</div>` : "";

const getHtmlByPage = ({ path, title, html }: Page) => `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <link rel="stylesheet" href="${""}">
  <link rel="icon" href="/favicon.svg">
</head>
  <body>
    <div id="title">
      ${title}
    </div>
    <div id="main">
      ${html}
    </div>
  </body>
</html>
`;

/* Step 4: Build pages into .html files with appropriate paths */

for (const page of pages) {
  const { path } = page;
  console.log(path)

  let outputPath: string;

  if (path === INDEX_PATH) {
    outputPath = `${buildPath}/index.html`;
  } else {
    outputPath = `${buildPath}/${path}/index.html`;
  }

  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, getHtmlByPage(page));
}

// /* Step 5: Build additional asset files */
// Deno.writeTextFileSync(`${buildPath}/styles.css`, styles ? styles : "");
// Deno.writeTextFileSync(`${buildPath}/favicon.svg`, getFaviconSvg(favicon));
