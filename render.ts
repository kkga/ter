import marked from "https://esm.sh/marked@3.0.7";

const renderer = {
  link(href: string, title: string, text: string) {
    if (href.endsWith(".md")) {
      const link = href.replace(/\.md$/i, "")
      return `<a href="${link}" title="${title}">${text}</a>`;
    }
    return `<a href="${href}" title="${title}" rel="noopener noreferrer">${text}</a>`;
  },
};

marked.use({
  renderer: renderer,
  baseUrl: "",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

export function render(text: string): any {
  return marked.parse(text);
}
