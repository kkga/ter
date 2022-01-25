import { hljs, marked, sanitizeHtml } from "./deps.ts";
import { Heading } from "./main.ts";
import { parseURL } from "https://unpkg.com/ufo/dist/index.mjs";

const renderer = new marked.Renderer();

const isExternalLink = (href: string): boolean => {
  const { protocol } = parseURL(href);
  return protocol !== undefined;
};

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "video",
  "svg",
  "path",
  "iframe",
]);

const sanitize = (html: string) => {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "height", "width", "align"],
      video: [
        "src",
        "alt",
        "height",
        "width",
        "autoplay",
        "muted",
        "loop",
        "playsinline",
      ],
      a: ["id", "aria-hidden", "href", "tabindex", "rel"],
      svg: ["viewbox", "width", "height", "aria-hidden"],
      path: ["fill-rule", "d"],
      h1: ["id"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      h5: ["id"],
      h6: ["id"],
      iframe: ["src", "width", "height"], // Only used when iframe tags are allowed in the first place.
    },
    allowedClasses: {
      div: ["hljs"],
      span: [
        "token",
        "keyword",
        "operator",
        "number",
        "boolean",
        "function",
        "string",
        "comment",
        "class-name",
        "regex",
        "regex-delimiter",
        "tag",
        "attr-name",
        "punctuation",
        "script-punctuation",
        "script",
        "plain-text",
        "property",
      ],
      a: ["anchor"],
      svg: ["octicon", "octicon-link"],
    },
    allowProtocolRelative: false,
  });
};

export function render(text: string): [string, Array<string>, Array<Heading>] {
  const links: Array<string> = [];
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
    if (isExternalLink(href)) {
      return `<a href="${href}" rel="external noopener noreferrer" ${
        title ? "title=${title}" : ""
      }">${text}</a>`;
    } else if (href.endsWith(".md")) {
      links.push(href);
      const localHref = "/" + href.replace(/\.md$/i, "");
      return `<a href="${localHref}" ${
        title ? "title=${title}" : ""
      }">${text}</a>`;
    }
    return `<a href="${href}" ${title ? "title=${title}" : ""}">${text}</a>`;
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

  const html = marked.parse(text);

  // return [sanitize(html), links, headings];
  return [html, links, headings];
}
