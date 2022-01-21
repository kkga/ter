import { marked } from "./deps.ts";

export function render(text: string): [string, Array<string>] {
  const links: Array<string> = [];

  const renderer = {
    heading(
      text: string,
      level: 1 | 2 | 3 | 4 | 5 | 6,
      raw: string,
      slugger: marked.Slugger,
    ): string {
      const slug = slugger.slug(raw);
      return `<h${level} id="${slug}">${text}<a href="#${slug}"></a></h${level}>`;
    },

    link(
      href: string,
      title: string,
      text: string,
    ) {
      if (href.endsWith(".md")) {
        links.push(href);
        const link = "/" + href.replace(/\.md$/i, "");
        return `<a href="${link}" title="${title}">${text}</a>`;
      }
      return `<a href="${href}" title="${title}" rel="noopener noreferrer">${text}</a>`;
    },
  };

  marked.use({
    renderer,
    baseUrl: "/",
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });

  return [marked.parse(text), links];
}
