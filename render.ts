import { hljs, marked, path, ufo } from "./deps.ts";
import { Heading } from "./pages.ts";

const renderer = new marked.Renderer();

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
  //
  // const pathPrefix = baseUrl.pathname;

  renderer.heading = function (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger,
  ): string {
    const slug = slugger.slug(raw);
    headings.push({ text, level, slug });
    return `<h${level} id="${slug}">${text}<a href="#${slug}"></a></h${level}>`;
  };

  renderer.link = function (href: string, title: string, text: string) {
    const parsed = ufo.parseURL(href);

    if (
      parsed.protocol !== undefined ||
      typeof parsed.pathname === "string" &&
        parsed.pathname.startsWith("mailto")
    ) {
      const url = new URL(parsed.pathname, parsed.protocol + parsed.host);
      url.hash = parsed.hash;
      url.search = parsed.search;
      return `<a href="${url.href}" rel="external noopener noreferrer" ${
        title ? "title=${title}" : ""
      }>${text}</a>`;
    } else {
      const cleanPathname = parsed.pathname === ""
        ? ""
        : ufo.withoutTrailingSlash(
          parsed.pathname.replace(path.extname(parsed.pathname), ""),
        );
      let internalHref: string;

      if (path.isAbsolute(cleanPathname)) {
        internalHref = cleanPathname + parsed.hash;
        internalUrls.add(new URL(internalHref, baseUrl));
      } else {
        let resolved: string;

        if (cleanPathname === "") {
          resolved = "";
        } else {
          const joined = isIndex
            ? path.join(path.dirname(currentPath + "/index"), cleanPathname)
            : path.join(path.dirname(currentPath), cleanPathname);
          resolved = ufo.withoutTrailingSlash(joined.replace(/\/index$/i, ""));
        }

        internalHref = resolved === ""
          ? resolved + parsed.hash
          : ufo.withLeadingSlash(resolved) + parsed.hash;

        if (resolved !== "") {
          internalUrls.add(
            new URL(ufo.withoutLeadingSlash(internalHref), baseUrl),
          );
        }
      }

      return `<a href="${internalHref}" ${
        title ? "title=${title}" : ""
      }>${text}</a>`;
    }
  };

  marked.use({
    renderer,
    highlight: (code: string, lang: string) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-",
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
