import { dirname, extname, isAbsolute, join } from "path/mod.ts";
import { marked } from "marked";
import Prism from "prism";
import {
  ParsedURL,
  parseURL,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "ufo";

import { Heading } from "./pages.ts";

interface RenderOpts {
  text: string;
  currentPath: string;
  isIndex: boolean;
  baseUrl: URL;
}

interface InternalLinkOpts {
  title: string;
  text: string;
  parsed: ParsedURL;
  baseUrl: URL;
  internalUrls: Set<URL>;
  currentPath: string;
  isIndex: boolean;
}

const renderer = new marked.Renderer();

function createExternalLink(href: string, title: string, text: string): string {
  return `<a href="${href}" rel="external noopener noreferrer" title="${
    title || text
  }">${text}</a>`;
}

function createInternalLink(opts: InternalLinkOpts): string {
  const cleanPathname = opts.parsed.pathname === "" ? "" : withoutTrailingSlash(
    opts.parsed.pathname.replace(extname(opts.parsed.pathname), ""),
  );
  let internalHref: string;

  if (isAbsolute(cleanPathname)) {
    internalHref = cleanPathname + opts.parsed.hash;
    opts.internalUrls.add(new URL(internalHref, opts.baseUrl));
  } else {
    let resolved: string;

    if (cleanPathname === "") {
      resolved = "";
    } else {
      const joined = opts.isIndex
        ? join(dirname(opts.currentPath + "/index"), cleanPathname)
        : join(dirname(opts.currentPath), cleanPathname);
      resolved = withoutTrailingSlash(joined.replace(/\/index$/i, ""));
    }

    internalHref = resolved === ""
      ? resolved + opts.parsed.hash
      : withLeadingSlash(resolved) + opts.parsed.hash;

    if (resolved !== "") {
      opts.internalUrls.add(
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
}

export function render(
  { text, currentPath, isIndex, baseUrl }: RenderOpts,
): { html: string; links: Array<URL>; headings: Array<Heading> } {
  const internalUrls: Set<URL> = new Set();
  const headings: Array<Heading> = [];

  // TODO: use path prefix from site config url to properly
  // handle cases when site is published in a sub directory on domain
  // const pathPrefix = baseUrl.pathname;

  renderer.link = (href: string, title: string, text: string) => {
    const parsed = parseURL(href);
    if (
      parsed.protocol !== undefined || parsed.pathname.startsWith("mailto")
    ) {
      return createExternalLink(href, title, text);
    } else {
      return createInternalLink({
        title,
        text,
        parsed,
        baseUrl,
        internalUrls,
        currentPath,
        isIndex,
      });
    }
  };

  renderer.heading = (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger,
  ): string => {
    const slug = slugger.slug(raw);
    headings.push({ text, level, slug });
    return `<h${level} id="${slug}">${text}<a href="#${slug}"></a></h${level}>`;
  };

  renderer.image = (href: string, title: string, text: string) => {
    const parsed = parseURL(href);

    if (isAbsolute(parsed.pathname)) {
      return `<img src="${parsed.pathname}" alt="${text || ""}" title="${
        title || ""
      }"/>`;
    } else {
      const href = isIndex
        ? join(dirname(currentPath + "/index"), parsed.pathname)
        : join(dirname(currentPath), parsed.pathname);
      return `<img src="${href}" alt="${text || ""}" title="${title || ""}"/>`;
    }
  };

  // renderer.code = (code: string, lang: string): string => {
  //   const language = hljs.getLanguage(lang) ? lang : "plaintext";
  //   const html = hljs.highlight(code, { language }).value;
  //   return `<div class="hljs language-${language}"><pre>${html}</pre></div>`;
  // };

  renderer.code = (code: string, language?: string): string => {
    const grammar = language ? Prism.languages[language] : undefined;
    if (grammar === undefined) {
      return `<pre><code>${code}</code></pre>`;
    }
    const html = Prism.highlight(code, grammar, language!);
    return `<div class="highlight highlight-source-${language}"><pre>${html}</pre></div>`;
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

  const html = marked(text);

  return { html, links: Array.from(internalUrls), headings };
}
