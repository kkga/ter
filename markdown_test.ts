import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { parseMarkdown } from "./markdown.ts";

Deno.test("Basic markdown", () => {
  const markdown = `## Hello World\nThis is a test of the markdown parser.`;
  const expected = `<h2 id="hello-world"><a class="h-anchor" href="#hello-world">#</a>Hello World</h2><p>This is a test of the markdown parser.</p>\n`;

  const { html, links, headings } = parseMarkdown({
    text: markdown,
    currentPath: ".",
    baseUrl: new URL("https://localhost:8080/"),
  });

  assertEquals(html, expected);
  assertEquals(links, []);
  assertEquals(headings, [
    { text: "Hello World", level: 2, slug: "hello-world" },
  ]);
});
