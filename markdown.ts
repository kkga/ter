import { hljs } from "./deps/hljs.ts";
import { marked, admonition } from "./deps/marked.ts";
import { slug as slugify } from "./deps/slug.ts";
import { dirname, extname, isAbsolute, join } from "./deps/std.ts";

import {
  ParsedURL,
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

interface InternalLinkOpts {
  title: string;
  text: string;
  parsed: ParsedURL;
  baseUrl: URL;
  internalLinks: Set<URL>;
  currentPath: string;
  isDirIndex?: boolean;
}

const toExternalLink = (href: string, title: string, text: string): string =>
  `<a href="${href}" rel="external noopener noreferrer" title="${
    title || ""
  }">${text}</a>`;

const toInternalLink = ({
  title,
  text,
  parsed,
  baseUrl,
  internalLinks,
  currentPath,
  isDirIndex,
}: InternalLinkOpts): string => {
  const cleanPathname =
    parsed.pathname === ""
      ? ""
      : withoutTrailingSlash(
          parsed.pathname.replace(extname(parsed.pathname), "")
        );
  let internalHref: string;

  if (isAbsolute(cleanPathname)) {
    internalHref = cleanPathname + parsed.hash;
    internalLinks.add(new URL(internalHref, baseUrl));
  } else {
    let resolved: string;

    if (cleanPathname === "") {
      resolved = "";
    } else {
      const joined = isDirIndex
        ? join(dirname(`${currentPath}/index`), cleanPathname)
        : join(dirname(currentPath), cleanPathname);
      resolved = withoutTrailingSlash(joined.replace(/\/index$/i, ""));
    }

    internalHref =
      resolved === ""
        ? resolved + parsed.hash
        : withLeadingSlash(resolved) + parsed.hash;

    if (resolved !== "") {
      internalLinks.add(new URL(withoutLeadingSlash(internalHref), baseUrl));
    }
  }

  // TODO
  // const prefixedHref = isAbsolute(internalHref)
  //   ? joinURL(pathPrefix, internalHref)
  //   : internalHref;

  // console.log(prefixedHref);

  return `<a href="${internalHref}" title="${title || ""}">${text}</a>`;
};

export const parseMarkdown = ({
  text,
  currentPath,
  isDirIndex,
  baseUrl,
  codeHighlight,
}: ParseOpts): {
  html: string;
  links: Array<URL>;
  headings: Array<Heading>;
} => {
  const internalLinks: Set<URL> = new Set();
  const headings: Array<Heading> = [];
  const renderer = new marked.Renderer();
  const tokens = marked.lexer(text);

  for (const [_index, token] of tokens.entries()) {
    if (token.type === "heading") {
      headings.push({
        text: token.text,
        level: token.depth,
        slug: slugify(token.text),
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
    return parsed.protocol !== undefined || parsed.pathname.startsWith("mailto")
      ? toExternalLink(href, title, text)
      : toInternalLink({
          title,
          text,
          parsed,
          baseUrl,
          internalLinks,
          currentPath,
          isDirIndex,
        });
  };

  renderer.heading = (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    _raw: string
  ): string => {
    const slug = slugify(text);
    return `<h${level} id="${slug}"><a class="h-anchor" href="#${slug}">#</a>${text}</h${level}>`;
  };

  renderer.image = (href: string, title: string, text: string) => {
    const parsed = parseURL(href);

    if (isAbsolute(parsed.pathname)) {
      return `<img src="${parsed.pathname}" alt="${text || ""}" title="${
        title || ""
      }"/>`;
    } else {
      const href = isDirIndex
        ? join(dirname(`${currentPath}/index`), parsed.pathname)
        : join(dirname(currentPath).replace(/\./, "/"), parsed.pathname);
      return `<img src="${href}" alt="${text || ""}" title="${title || ""}"/>`;
    }
  };

  if (codeHighlight) {
    renderer.code = (code: string, lang: string): string => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      const html = hljs.highlight(code, { language }).value;
      return `<pre class="hljs language-${language}">${html}</pre>`;
    };
  }

  marked.use({
    renderer,
  });

  admonition.setConfig({
    className: "prose-sm admonition",
    nodeName: "div",
    title: { nodeName: "h4" },
  });

  marked.use(admonition.default);

  const html = marked.parser(tokens);

  return { html, links: [...internalLinks], headings };
};
