import { dirname, extname, isAbsolute, join } from "$std/path/mod.ts";
import hljs from "hljs";
import { marked } from "marked";
import {
  ParsedURL,
  parseURL,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "ufo";

import { Heading } from "./types.d.ts";

const toExternalLink = (href: string, title: string, text: string): string =>
  `<a href="${href}" rel="external noopener noreferrer" title="${
    title || text
  }">${text}</a>`;

const toInternalLink = (opts: {
  title: string;
  text: string;
  parsed: ParsedURL;
  baseUrl: URL;
  internalLinks: Set<URL>;
  currentPath: string;
  isDirIndex?: boolean;
}): string => {
  const cleanPathname = opts.parsed.pathname === "" ? "" : withoutTrailingSlash(
    opts.parsed.pathname.replace(extname(opts.parsed.pathname), ""),
  );
  let internalHref: string;

  if (isAbsolute(cleanPathname)) {
    internalHref = cleanPathname + opts.parsed.hash;
    opts.internalLinks.add(new URL(internalHref, opts.baseUrl));
  } else {
    let resolved: string;

    if (cleanPathname === "") {
      resolved = "";
    } else {
      const joined = opts.isDirIndex
        ? join(dirname(opts.currentPath + "/index"), cleanPathname)
        : join(dirname(opts.currentPath), cleanPathname);
      resolved = withoutTrailingSlash(joined.replace(/\/index$/i, ""));
    }

    internalHref = resolved === ""
      ? resolved + opts.parsed.hash
      : withLeadingSlash(resolved) + opts.parsed.hash;

    if (resolved !== "") {
      opts.internalLinks.add(
        new URL(withoutLeadingSlash(internalHref), opts.baseUrl),
      );
    }
  }

  // TODO
  // const prefixedHref = isAbsolute(internalHref)
  //   ? joinURL(pathPrefix, internalHref)
  //   : internalHref;

  // console.log(prefixedHref);

  return (
    `<a href="${internalHref}" title="${
      opts.title || opts.text
    }">${opts.text}</a>`
  );
};

export const parseMarkdown = (
  { text, currentPath, isDirIndex, baseUrl }: {
    text: string;
    currentPath: string;
    baseUrl: URL;
    isDirIndex?: boolean;
  },
): { html: string; links: Array<URL>; headings: Array<Heading> } => {
  const internalLinks: Set<URL> = new Set();
  const headings: Array<Heading> = [];
  const renderer = new marked.Renderer();
  const tokens = marked.lexer(text);
  const slugger = new marked.Slugger();

  for (const [_index, token] of tokens.entries()) {
    if (token.type === "heading") {
      headings.push({
        text: token.text,
        level: token.depth,
        slug: slugger.slug(token.text),
      });
    }
  }

  if (
    tokens.length > 0 &&
    tokens[0].type === "heading" &&
    tokens[0].depth === 1
  ) {
    tokens.shift();
  }

  // TODO: use path prefix from site config url to properly
  // handle cases when site is published in a sub directory on domain
  // const pathPrefix = baseUrl.pathname;

  renderer.link = (href: string, title: string, text: string) => {
    const parsed = parseURL(href);
    if (
      parsed.protocol !== undefined || parsed.pathname.startsWith("mailto")
    ) {
      return toExternalLink(href, title, text);
    } else {
      return toInternalLink({
        title,
        text,
        parsed,
        baseUrl,
        internalLinks,
        currentPath,
        isDirIndex,
      });
    }
  };

  renderer.heading = (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    _raw: string,
    slugger: marked.Slugger,
  ): string => {
    const slug = slugger.slug(text);
    return `<h${level} id="${slug}">${text}<a class="anchor" href="#${slug}"></a></h${level}>`;
  };

  renderer.image = (href: string, title: string, text: string) => {
    const parsed = parseURL(href);

    if (isAbsolute(parsed.pathname)) {
      return `<img src="${parsed.pathname}" alt="${text || ""}" title="${
        title || ""
      }"/>`;
    } else {
      const href = isDirIndex
        ? join(dirname(currentPath + "/index"), parsed.pathname)
        : join(dirname(currentPath), parsed.pathname);
      return `<img src="${href}" alt="${text || ""}" title="${title || ""}"/>`;
    }
  };

  renderer.code = (code: string, lang: string): string => {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    const html = hljs.highlight(code, { language }).value;
    return `<pre class="hljs language-${language}">${html}</pre>`;
  };

  marked.use({
    renderer,
    pedantic: false,
    gfm: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });

  const html = marked.parser(tokens);

  return { html, links: [...internalLinks], headings };
};
