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
    console.log(parsed);

    if (
      parsed.protocol !== undefined ||
      typeof parsed.pathname === "string" &&
        parsed.pathname.startsWith("mailto")
    ) {
      const externalHref = ufo.normalizeURL(
        `${parsed.protocol}//${
          ufo.joinURL(parsed.host, parsed.pathname)
        }${parsed.search}${parsed.hash}`,
      );
      return `<a href="${externalHref}" rel="external noopener noreferrer" ${
        title ? "title=${title}" : ""
      }">${text}</a>`;
    } else {
      const cleanPathname = parsed.pathname === ""
        ? ""
        : ufo.withoutTrailingSlash(
          parsed.pathname.replace(/\.md$/i, ""),
        );
      let internalHref: string;

      if (path.isAbsolute(href)) {
        internalHref = cleanPathname + parsed.hash;
        internalUrls.add(new URL(internalHref, baseUrl));
      } else {
        let resolved: string;

        if (cleanPathname === "") {
          resolved = "";
        } else if (isIndex) {
          resolved = ufo.withoutTrailingSlash(
            path.join(path.dirname(currentPath + "/index"), cleanPathname)
              .replace(
                /\/index$/i,
                "",
              ),
          );
        } else {
          resolved = ufo.withoutTrailingSlash(
            path.join(path.dirname(currentPath), cleanPathname).replace(
              /\/index$/i,
              "",
            ),
          );
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
      }">${text}</a>`;
    }
  };

  marked.use({
    renderer,
    highlight: function (code, lang) {
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
