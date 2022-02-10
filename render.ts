import {
  dirname,
  hljs,
  isAbsolute,
  join,
  joinURL,
  marked,
  normalizeURL,
  parseURL,
  // sanitizeHtml,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from "./deps.ts";
import { Heading } from "./page.ts";

const renderer = new marked.Renderer();

// const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
//   "img",
//   "video",
//   "svg",
//   "path",
//   "iframe",
// ]);

// const _sanitize = (html: string) => {
//   return sanitizeHtml(html, {
//     allowedTags,
//     allowedAttributes: {
//       ...sanitizeHtml.defaults.allowedAttributes,
//       img: ["src", "alt", "height", "width", "align"],
//       video: [
//         "src",
//         "alt",
//         "height",
//         "width",
//         "autoplay",
//         "muted",
//         "loop",
//         "playsinline",
//       ],
//       a: ["id", "aria-hidden", "href", "tabindex", "rel"],
//       svg: ["viewbox", "width", "height", "aria-hidden"],
//       path: ["fill-rule", "d"],
//       h1: ["id"],
//       h2: ["id"],
//       h3: ["id"],
//       h4: ["id"],
//       h5: ["id"],
//       h6: ["id"],
//       iframe: ["src", "width", "height"], // Only used when iframe tags are allowed in the first place.
//     },
//     allowedClasses: {
//       div: ["hljs"],
//       span: [
//         "token",
//         "keyword",
//         "operator",
//         "number",
//         "boolean",
//         "function",
//         "string",
//         "comment",
//         "class-name",
//         "regex",
//         "regex-delimiter",
//         "tag",
//         "attr-name",
//         "punctuation",
//         "script-punctuation",
//         "script",
//         "plain-text",
//         "property",
//       ],
//       a: ["anchor"],
//       svg: ["octicon", "octicon-link"],
//     },
//     allowProtocolRelative: false,
//   });
// };

export function render(
  text: string,
  currentPath: string,
  isIndex: boolean,
): { html: string; links: Array<string>; headings: Array<Heading> } {
  const internalLinks: Set<string> = new Set();
  const headings: Array<Heading> = [];

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
    const parsed = parseURL(href);
    let url: string;

    if (
      parsed.protocol !== undefined ||
      typeof parsed.pathname === "string" &&
        parsed.pathname.startsWith("mailto")
    ) {
      url = normalizeURL(
        `${parsed.protocol}//${
          joinURL(parsed.host, parsed.pathname)
        }${parsed.search}${parsed.hash}`,
      );
      return `<a href="${url}" rel="external noopener noreferrer" ${
        title ? "title=${title}" : ""
      }">${text}</a>`;
    } else {
      const cleanPathname = parsed.pathname === "" ? "" : withoutTrailingSlash(
        parsed.pathname.replace(/\.md$/i, ""),
      );

      if (isAbsolute(href)) {
        url = cleanPathname + parsed.hash;
        internalLinks.add(withoutLeadingSlash(cleanPathname));
      } else {
        let resolved: string;

        if (cleanPathname === "") {
          resolved = "";
        } else if (isIndex) {
          resolved = withoutTrailingSlash(
            join(dirname(currentPath + "/index"), cleanPathname)
              .replace(
                /\/index$/i,
                "",
              ),
          );
        } else {
          resolved = withoutTrailingSlash(
            join(dirname(currentPath), cleanPathname).replace(
              /\/index$/i,
              "",
            ),
          );
        }

        url = resolved === ""
          ? resolved + parsed.hash
          : withLeadingSlash(resolved) + parsed.hash;

        if (resolved !== "") {
          internalLinks.add(withoutLeadingSlash(withoutLeadingSlash(resolved)));
        }
      }

      return `<a href="${url}" ${title ? "title=${title}" : ""}">${text}</a>`;
    }
  };

  marked.use({
    renderer,
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-",
    baseUrl: "/",
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });

  const html = marked(text);

  // return [sanitize(html), links, headings];
  return { html, links: Array.from(internalLinks), headings };
}
