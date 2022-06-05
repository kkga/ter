import { dirname, extname, isAbsolute, join } from "./deps.ts";
import { hljs } from "./deps.ts";
import { marked } from "./deps.ts";
import {
  ParsedURL,
  parseURL,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "./deps.ts";
import { Heading } from "./pages.ts";

const renderer = new marked.Renderer();

function createExternalLink(
  href: string,
  title: string,
  text: string,
): string {
  return (
    `<a href="${href}" rel="external noopener noreferrer" "title=${title}">${text}</a>`
  );
}

function createInternalLink(
  title: string,
  text: string,
  parsed: ParsedURL,
  baseUrl: URL,
  internalUrls: Set<URL>,
  currentPath: string,
  isIndex: boolean,
): string {
  const cleanPathname = parsed.pathname === "" ? "" : withoutTrailingSlash(
    parsed.pathname.replace(extname(parsed.pathname), ""),
  );
  let internalHref: string;

  if (isAbsolute(cleanPathname)) {
    internalHref = cleanPathname + parsed.hash;
    internalUrls.add(new URL(internalHref, baseUrl));
  } else {
    let resolved: string;

    if (cleanPathname === "") {
      resolved = "";
    } else {
      const joined = isIndex
        ? join(dirname(currentPath + "/index"), cleanPathname)
        : join(dirname(currentPath), cleanPathname);
      resolved = withoutTrailingSlash(joined.replace(/\/index$/i, ""));
    }

    internalHref = resolved === ""
      ? resolved + parsed.hash
      : withLeadingSlash(resolved) + parsed.hash;

    if (resolved !== "") {
      internalUrls.add(
        new URL(withoutLeadingSlash(internalHref), baseUrl),
      );
    }
  }

  // TODO
  // const prefixedHref = isAbsolute(internalHref)
  //   ? joinURL(pathPrefix, internalHref)
  //   : internalHref;

  // console.log(prefixedHref);

  return (
    `<a href="${internalHref}" "title=${title}">${text}</a>`
  );
}

export function render(
  text: string,
  currentPath: string,
  isIndex: boolean,
  baseUrl: URL,
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
      return createInternalLink(
        title,
        text,
        parsed,
        baseUrl,
        internalUrls,
        currentPath,
        isIndex,
      );
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

  renderer.code = (code: string, lang: string): string => {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    const html = hljs.highlight(code, { language }).value;
    return `<div class="hljs language-${language}"><pre>${html}</pre></div>`;
  };

  marked.use({
    renderer,
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });

  const html = marked(text);

  return { html, links: Array.from(internalUrls), headings };
}
