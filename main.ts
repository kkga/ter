/* Section: Dependencies */

import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { ensureFileSync } from "https://deno.land/std@0.121.0/fs/mod.ts";

/* Section: Constants */

const FIRST_ITEM_INDEX = 0;
const SECOND_ITEM_INDEX = 1;
const COMPONENT_DELIMITER = "+++";
const COMPONENT_TYPE_PATTERN = /<\S>(.*?)\:(.*?)<\/\S>/g;
const HTML_CONTENT_PATTERN = /\n(.*)/gs;
const LAYOUT_PREFIX = "layout";
const HOME_PATH = "/home";
const STYLESHEET_PATH = "styles.css";

/* Section: Interfaces and Globals */

interface Page {
  path: string;
  name: string;
  html: string;
}

interface Layout {
  [key: string]: any;
}

let pages: Array<Page> = [];
let layout: Layout = {};

/* Step 0: Grab CLI arguments */

const filename = Deno.args[FIRST_ITEM_INDEX];
const buildPath = Deno.args[SECOND_ITEM_INDEX] || "./build";

if (!filename) {
  console.log("Please specify .md file");
  Deno.exit(1);
} else {
  console.log(`Building site with '${filename}' into '${buildPath}'`);
}

/* Step 1: Parse metadata and components from markdown file */

const decoder = new TextDecoder("utf-8");
const fileContent = decoder.decode(Deno.readFileSync(filename));

const components = fileContent.split(COMPONENT_DELIMITER);
const { meta: frontMatter } = Marked.parse(components[FIRST_ITEM_INDEX]);
const { title, styles, favicon } = frontMatter;
// console.log({ title, styles, favicon });

/* Step 2: Construct page data from components */

for (const component of components) {
  const { content } = Marked.parse(component);

  const [matchedComponentType] = content.matchAll(COMPONENT_TYPE_PATTERN);
  const [, path, name] = matchedComponentType;

  const [matchedHtml] = content.matchAll(HTML_CONTENT_PATTERN);
  const [, html] = matchedHtml;

  const isLayoutComponent = path === LAYOUT_PREFIX;

  if (isLayoutComponent) {
    layout[name] = html;
  } else {
    pages.push({ path, name, html });
  }
}

/* Step 3: Generate templates for html content */

const isHomePath = (path: string) => path === HOME_PATH;

const getStylesheetHref = (path: string) => {
  return isHomePath(path) ? STYLESHEET_PATH : `../${STYLESHEET_PATH}`;
};

const getFaviconSvg = (favicon: string) => `
  <svg xmlns="http://www.w3.org/2000/svg">
    <text y="32" font-size="32">${favicon ? favicon : "🦕"}</text>
  </svg>
`;

const getNavigation = (currentPath: string) => `
  <div id="nav">
    ${
  pages.map(({ path, name }) => {
    const href = path === HOME_PATH ? "/" : path;
    const isSelectedPage = path === currentPath;
    const classes = `nav-item ${isSelectedPage ? "selected" : ""}`;
    return `<a class="${classes}" href=${href}>${name}</a>`;
  }).join("\n")
}
  </div>
`;

const footer = layout.footer ? `<div id="footer">${layout.footer}</div>` : "";

const getHtmlByPage = ({ path, name, html }: Page) => `
<!DOCTYPE html>
<html>
<head>
<title>${name} | ${title}</title>
<link rel="stylesheet" href="${getStylesheetHref(path)}">
<link rel="icon" href="/favicon.svg">
</head>
  <body>
    <div id="title">
      ${title}
    </div>
    ${getNavigation(path)}
    <div id="main">
      ${html}
    </div>
    ${footer}
  </body>
</html>
`;

/* Step 4: Build pages into .html files with appropriate paths */

for (const page of pages) {
  const { path } = page;

  let outputPath: string;

  if (path === HOME_PATH) {
    outputPath = `${buildPath}/index.html`;
  } else {
    outputPath = `${buildPath}${path}/index.html`;
  }

  ensureFileSync(outputPath);
  Deno.writeTextFileSync(outputPath, getHtmlByPage(page));
}

/* Step 5: Build additional asset files */
Deno.writeTextFileSync(`${buildPath}/styles.css`, styles ? styles : "");
Deno.writeTextFileSync(`${buildPath}/favicon.svg`, getFaviconSvg(favicon));
