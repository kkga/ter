import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { parseMarkdown } from "./markdown.ts";

Deno.test("parseMarkdown should return html, links, and headings", () => {
  const markdown = `## Hello World\nThis is a [link](some-file.md).`;
  const expected = `<h2 id="hello-world"><a class="h-anchor" href="#hello-world">#</a>Hello World</h2><p>This is a <a href="/some-file">link</a>.</p>\n`;

  const { html, links, headings } = parseMarkdown({
    text: markdown,
    currentPath: "/some-page",
    baseUrl: new URL("https://example.com/"),
  });

  assertEquals(html, expected);
  assertEquals(links, [new URL("https://example.com/some-file")]);
  assertEquals(headings, [
    { text: "Hello World", level: 2, slug: "hello-world" },
  ]);
});

Deno.test("Markdown with external links", () => {
  const markdown = `This is a [link](https://example.com).`;
  const expected = `<p>This is a <a href="https://example.com" rel="external noopener noreferrer">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: ".",
    baseUrl: new URL("https://example.com/"),
  });

  assertEquals(html, expected);
});

Deno.test("Markdown with internal links", () => {
  const markdown = `This is a [link](/notes).`;
  const expected = `<p>This is a <a href="/notes">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: ".",
    baseUrl: new URL("https://example.com/"),
  });

  assertEquals(html, expected);
});

Deno.test("Markdown with a relative link on an index page", () => {
  const markdown = `This is a [link](some-page).`;
  const expected = `<p>This is a <a href="/pages/notes/some-page">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: "/pages/notes",
    baseUrl: new URL("https://example.com/"),
    isDirIndex: true,
  });

  assertEquals(html, expected);
});

Deno.test("Markdown with an absolute link on an index page", () => {
  const markdown = `This is a [link](/top-level-page).`;
  const expected = `<p>This is a <a href="/top-level-page">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: "/pages/notes",
    baseUrl: new URL("https://example.com/"),
    isDirIndex: true,
  });

  assertEquals(html, expected);
});

Deno.test("Markdown with a relative link on a non-index page", () => {
  const markdown = `This is a [link](some-page).`;
  const expected = `<p>This is a <a href="/pages/notes/some-page">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: "/pages/notes/another-page",
    baseUrl: new URL("https://example.com/"),
    isDirIndex: false,
  });

  assertEquals(html, expected);
});

Deno.test("Markdown with a relative link to a parent directory", () => {
  const markdown = `This is a [link](../some-page.md).`;
  const expected = `<p>This is a <a href="/pages/some-page">link</a>.</p>\n`;

  const { html } = parseMarkdown({
    text: markdown,
    currentPath: "/pages/notes/another-page",
    baseUrl: new URL("https://example.com/"),
  });

  assertEquals(html, expected);
});

Deno.test(
  "Markdown with a relative link to a parent directory on an index page",
  () => {
    const markdown = `This is a [link](../some-page.md).`;
    const expected = `<p>This is a <a href="/pages/some-page">link</a>.</p>\n`;

    const { html } = parseMarkdown({
      text: markdown,
      currentPath: "/pages/notes",
      baseUrl: new URL("https://example.com/"),
      isDirIndex: true,
    });

    assertEquals(html, expected);
  }
);

Deno.test(
  "Links to non-markdown files should not have the extension removed",
  () => {
    const markdown = `This is a [link](some-file.pdf).`;
    const expected = `<p>This is a <a href="/some-file.pdf">link</a>.</p>\n`;

    const { html } = parseMarkdown({
      text: markdown,
      currentPath: "/some-page",
      baseUrl: new URL("https://example.com/"),
    });

    assertEquals(html, expected);
  }
);

Deno.test(
  "Relative links to markdown files with date prefixes should have the prefix removed",
  () => {
    const markdown = `This is a [link](./2020-01-01-some-file.md).`;
    const expected = `<p>This is a <a href="/some-file">link</a>.</p>\n`;

    const { html } = parseMarkdown({
      text: markdown,
      currentPath: "/some-page",
      baseUrl: new URL("https://example.com/"),
    });

    assertEquals(html, expected);
  }
);

Deno.test(
  "Absolute links to markdown files with date prefixes should have the prefix removed",
  () => {
    const markdown = `This is a [link](/2020-01-01-some-file.md).`;
    const expected = `<p>This is a <a href="/some-file">link</a>.</p>\n`;

    const { html } = parseMarkdown({
      text: markdown,
      currentPath: "/some-page",
      baseUrl: new URL("https://example.com/"),
    });

    assertEquals(html, expected);
  }
);
