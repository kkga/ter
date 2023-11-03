import { hljs } from "./deps/hljs.ts";
import { marked } from "./deps/marked.ts";
import { slug as slugify } from "./deps/slug.ts";
import { path } from "./deps/std.ts";

import {
  parseURL,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "./deps/ufo.ts";

import { Heading } from "./types.d.ts";

interface ParseOpts {
  text: string;
  currentPath: string;
  baseUrl: URL;
  isDirIndex?: boolean;
  codeHighlight?: boolean;
}

export const parseMarkdown = ({
  text,
  currentPath,
  isDirIndex,
  baseUrl,
  codeHighlight,
}: ParseOpts): {
  html: string;
  links: URL[];
  headings: Heading[];
} => {
  const internalLinks: Set<URL> = new Set();
  const headings: Heading[] = [];
  const renderer = new marked.Renderer();
  const tokens = marked.lexer(text);
  const { extname } = path;

  // collect headings
  for (const [, token] of tokens.entries()) {
    if (token.type === "heading") {
      headings.push({
        text: token.text,
        level: token.depth,
        slug: slugify(token.text),
      });
    }
  }

  // remove the first heading if it's an h1, since we'll be using the page title
  if (
    tokens.length > 0 &&
    tokens[0].type === "heading" &&
    tokens[0].depth === 1
  ) {
    tokens.shift();
  }

  renderer.link = (
    href: string,
    title: string | null | undefined,
    text: string
  ) => {
    const { protocol, pathname, hash } = parseURL(href);
    const titleAttr = title ? ` title="${title}"` : "";

    if (protocol !== undefined || pathname.startsWith("mailto")) {
      const hrefAttr = ` href="${href}"`;
      const relAttr = href.startsWith("http")
        ? ` rel="external noopener noreferrer"`
        : "";

      return `<a${hrefAttr}${relAttr}${titleAttr}>${text}</a>`;
    }

    let url: URL | undefined;

    const cleanPath = path.join(
      path.dirname(pathname),
      path
        .basename(pathname)
        .replace(/^\d{4}-\d{2}-\d{2}[-_]/, "")
        .replace(/\.md$/, "")
    );

    if (path.isAbsolute(cleanPath)) {
      href = cleanPath + hash;
      url = new URL(href, baseUrl);
    } else {
      let resolved: string;

      if (cleanPath === ".") {
        resolved = "";
      } else {
        const joined = isDirIndex
          ? path.join(path.dirname(`${currentPath}/index`), cleanPath)
          : path.join(path.dirname(currentPath), cleanPath);
        resolved = withoutTrailingSlash(joined.replace(/\/index$/i, ""));
      }

      href =
        resolved === "" ? resolved + hash : withLeadingSlash(resolved) + hash;

      if (resolved !== "") {
        url = new URL(withoutLeadingSlash(href), baseUrl);
      }
    }

    if (url !== undefined && extname(url.pathname) === "") {
      internalLinks.add(url);
    }

    return `<a href="${href}"${titleAttr}>${text}</a>`;
  };

  renderer.heading = (text: string, level: number): string => {
    const slug = slugify(text);
    const idAttr = ` id="${slug}"`;
    return `<h${level}${idAttr}><a class="h-anchor" href="#${slug}">#</a>${text}</h${level}>`;
  };

  renderer.image = (href: string, title: string | null, text: string) => {
    const { join, dirname, isAbsolute } = path;
    const { pathname } = parseURL(href);
    const titleAttr = title ? ` title="${title}"` : "";
    const altAttr = text ? ` alt="${text}"` : "";
    const srcAttr = isAbsolute(pathname)
      ? ` src="${pathname}"`
      : isDirIndex
      ? ` src="${join(dirname(`${currentPath}/index`), pathname)}"`
      : ` src="${join(dirname(currentPath).replace(/\./, "/"), pathname)}"`;

    return `<img${srcAttr}${titleAttr}${altAttr}/>`;
  };

  if (codeHighlight) {
    renderer.code = (code: string, lang: string): string => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      const html = hljs.highlight(code, { language }).value;
      const classAttr = ` class="hljs language-${language}"`;
      return `<pre${classAttr}>${html}</pre>`;
    };
  }

  marked.use({ renderer });

  const html = marked.parser(tokens);

  return { html, links: Array.from(internalLinks), headings };
};
