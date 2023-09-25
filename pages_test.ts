import { assertEquals } from "./deps/std.ts";
import {
  extractPageData,
  generateCrumbs,
  getBacklinkPages,
  getChildPages,
  getDateFromFilename,
  getDeadlinks,
  getPagesByTags,
  getPagesWithTag,
  getRelatedPages,
  getTags,
  getTitleFromFilename,
  getTitleFromHeadings,
  sortPages,
  sortTaggedPages,
} from "./pages.ts";
import { Heading, JSONValue, Page } from "./types.d.ts";

Deno.test(
  "generateCrumbs should return an array of crumbs for a given page",
  () => {
    const page: Page = {
      url: new URL("https://example.com/blog/category/post"),
    };
    const crumbs = generateCrumbs(page);

    assertEquals(crumbs, [
      {
        slug: "index",
        url: "/",
        current: false,
      },
      {
        slug: "blog",
        url: "/blog",
        current: false,
      },
      {
        slug: "category",
        url: "/blog/category",
        current: false,
      },
      {
        slug: "post",
        url: "/blog/category/post",
        current: true,
      },
    ]);
  }
);

Deno.test("generateCrumbs should us a custom root crumb if provided", () => {
  const page: Page = {
    url: new URL("https://example.com/post"),
  };
  const crumbs = generateCrumbs(page, "custom");

  assertEquals(crumbs, [
    {
      slug: "custom",
      url: "/",
      current: false,
    },
    {
      slug: "post",
      url: "/post",
      current: true,
    },
  ]);
});

Deno.test(
  "generateCrumbs should return a single crumb if the page is the root",
  () => {
    const page: Page = {
      url: new URL("https://example.com/"),
    };
    const crumbs = generateCrumbs(page);

    assertEquals(crumbs, [
      {
        slug: "index",
        url: "/",
        current: true,
      },
    ]);
  }
);

Deno.test(
  "getTitleFromHeadings should return the first heading with a level of 1",
  () => {
    const headings: Heading[] = [
      {
        level: 1,
        text: "Title",
        slug: "title",
      },
      {
        level: 2,
        text: "Subtitle",
        slug: "subtitle",
      },
    ];
    const title = getTitleFromHeadings(headings);

    assertEquals(title, "Title");
  }
);

Deno.test(
  "getTitleFromHeadings should return undefined if no headings are present",
  () => {
    const headings: Heading[] = [];
    const title = getTitleFromHeadings(headings);

    assertEquals(title, undefined);
  }
);

Deno.test(
  "getTitleFromHeadings should return undefined if no heading with a level of 1 is present",
  () => {
    const headings: Heading[] = [
      {
        level: 2,
        text: "Subtitle",
        slug: "subtitle",
      },
    ];
    const title = getTitleFromHeadings(headings);

    assertEquals(title, undefined);
  }
);

Deno.test(
  "getTitleFromFilename should return the title from a filename",
  () => {
    const title = getTitleFromFilename("test-name-here.md");
    assertEquals(title, "test-name-here");
  }
);

Deno.test("getDateFromFilename should return a date from a filename", () => {
  const date = getDateFromFilename("2021-01-01-test.md");
  assertEquals(date, new Date("2021-01-01"));
});

Deno.test(
  "getDateFromFilename should return undefined if no date is present",
  () => {
    const date = getDateFromFilename("test.md");
    assertEquals(date, undefined);
  }
);

Deno.test(
  "getDateFromFilename should return undefined if date is invalid",
  () => {
    const date = getDateFromFilename("2021-20-00-test.md");
    assertEquals(date, undefined);
  }
);

Deno.test(
  "getBacklinkPages should return an array of pages that link to the current page",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        links: [new URL("https://example.com/page2")],
      },
      {
        url: new URL("https://example.com/page2"),
        links: [new URL("https://example.com/page1")],
      },
      {
        url: new URL("https://example.com/page3"),
        links: [new URL("https://example.com/page1")],
      },
    ];
    const backlinks = getBacklinkPages(pages, pages[0]);

    assertEquals(backlinks, [pages[1], pages[2]]);
  }
);

Deno.test(
  "getBacklinkPages should return an empty array if no backlinks are present",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        links: [new URL("https://example.com/page2")],
      },
      {
        url: new URL("https://example.com/page2"),
        links: [new URL("https://example.com/page1")],
      },
      {
        url: new URL("https://example.com/page3"),
        links: [new URL("https://example.com/page1")],
      },
    ];
    const backlinks = getBacklinkPages(pages, pages[2]);

    assertEquals(backlinks, []);
  }
);

Deno.test(
  "getBacklinkPages should return an empty array if no pages are present",
  () => {
    const pages: Page[] = [];
    const backlinks = getBacklinkPages(pages, pages[0]);

    assertEquals(backlinks, []);
  }
);

Deno.test("getTags should return an array of tags", () => {
  const pages: Page[] = [
    {
      url: new URL("https://example.com/page1"),
      tags: ["tag1", "tag2"],
    },
    {
      url: new URL("https://example.com/page2"),
      tags: ["tag1", "tag3"],
    },
    {
      url: new URL("https://example.com/page3"),
      tags: ["tag2", "tag3"],
    },
  ];
  const tags = getTags(pages);

  assertEquals(tags, ["tag1", "tag2", "tag3"]);
});

Deno.test("getTags should return an empty array if no tags are present", () => {
  const pages: Page[] = [
    {
      url: new URL("https://example.com/page1"),
    },
    {
      url: new URL("https://example.com/page2"),
    },
    {
      url: new URL("https://example.com/page3"),
    },
  ];
  const tags = getTags(pages);

  assertEquals(tags, []);
});

Deno.test("getPagesWithTag should return an array of pages", () => {
  const pages: Page[] = [
    {
      url: new URL("https://example.com/page1"),
      tags: ["tag1", "tag2"],
    },
    {
      url: new URL("https://example.com/page2"),
      tags: ["tag1", "tag3"],
    },
    {
      url: new URL("https://example.com/page3"),
      tags: ["tag2", "tag3"],
    },
  ];
  const pagesWithTag = getPagesWithTag(pages, "tag1");

  assertEquals(pagesWithTag, [pages[0], pages[1]]);
});

Deno.test(
  "getPagesWithTag should return an empty array if no pages are present",
  () => {
    const pages: Page[] = [];
    const pagesWithTag = getPagesWithTag(pages, "tag1");

    assertEquals(pagesWithTag, []);
  }
);

Deno.test(
  "getPagesWithTag should return an empty array if no pages have the tag",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        tags: ["tag1", "tag2"],
      },
      {
        url: new URL("https://example.com/page2"),
        tags: ["tag1", "tag3"],
      },
      {
        url: new URL("https://example.com/page3"),
        tags: ["tag2", "tag3"],
      },
    ];
    const pagesWithTag = getPagesWithTag(pages, "tag4");

    assertEquals(pagesWithTag, []);
  }
);

Deno.test("getPagesWithTag should exclude pages if provided", () => {
  const pages: Page[] = [
    {
      url: new URL("https://example.com/page1"),
      tags: ["tag1", "tag2"],
    },
    {
      url: new URL("https://example.com/page2"),
      tags: ["tag1", "tag3"],
    },
    {
      url: new URL("https://example.com/page3"),
      tags: ["tag2", "tag3"],
    },
  ];
  const pagesWithTag = getPagesWithTag(pages, "tag1", [pages[0]]);

  assertEquals(pagesWithTag, [pages[1]]);
});

Deno.test(
  "getRelatedPages should return an array of pages that share a tag with the current page",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        tags: ["tag1", "tag2"],
      },
      {
        url: new URL("https://example.com/page2"),
        tags: ["tag1", "tag3"],
      },
      {
        url: new URL("https://example.com/page3"),
        tags: ["tag3", "tag4"],
      },
    ];
    const relatedPages = getRelatedPages(pages, pages[0]);

    assertEquals(relatedPages, [pages[1]]);
  }
);

Deno.test(
  "getChildPages should return an array of pages that are children of the current page",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
      },
      {
        url: new URL("https://example.com/page1/page2"),
      },
      {
        url: new URL("https://example.com/page1/page3"),
      },
      {
        url: new URL("https://example.com/page4"),
      },
    ];
    const { childPages } = getChildPages(pages, pages[0]);

    assertEquals(childPages, [pages[1], pages[2]]);
  }
);

Deno.test(
  "getPagesByTags should return an object with an array of pages for each tag",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        tags: ["tag1", "tag2"],
      },
      {
        url: new URL("https://example.com/page2"),
        tags: ["tag1", "tag3"],
      },
      {
        url: new URL("https://example.com/page3"),
        tags: ["tag3", "tag4"],
      },
    ];
    const pagesByTags = getPagesByTags(pages, ["tag1", "tag3"]);

    assertEquals(pagesByTags, {
      tag1: [pages[0], pages[1]],
      tag3: [pages[1], pages[2]],
    });
  }
);

Deno.test(
  "sortPages should return an array of pages sorted by datePublished (reverse) with pinned pages and directories first",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page2"),
        datePublished: new Date("2021-01-02"),
      },
      {
        url: new URL("https://example.com/page1"),
        datePublished: new Date("2021-01-01"),
      },
      {
        url: new URL("https://example.com/page3"),
        datePublished: new Date("2021-01-03"),
      },
      {
        url: new URL("https://example.com/page4"),
      },
      {
        url: new URL("https://example.com/page5"),
        index: "dir",
      },
      {
        url: new URL("https://example.com/page6"),
        pinned: true,
      },
    ];
    const sortedPages = sortPages(pages);

    assertEquals(sortedPages, [
      pages[4],
      pages[5],
      pages[2],
      pages[0],
      pages[1],
      pages[3],
    ]);
  }
);

Deno.test(
  "sortTaggedPages should return an object with an array of pages for each tag sorted by count of pages",
  () => {
    const pages: Page[] = [
      {
        url: new URL("https://example.com/page1"),
        tags: ["tag1", "tag2"],
      },
      {
        url: new URL("https://example.com/page2"),
        tags: ["tag1", "tag3"],
      },
      {
        url: new URL("https://example.com/page3"),
        tags: ["tag3", "tag4"],
      },
    ];
    const tags = getTags(pages);
    const pagesByTags = getPagesByTags(pages, tags);
    const sortedPages = sortTaggedPages(pagesByTags);

    assertEquals(sortedPages, {
      tag1: [pages[0], pages[1]],
      tag3: [pages[1], pages[2]],
      tag2: [pages[0]],
      tag4: [pages[2]],
    });
  }
);

Deno.test("getDeadlinks should return an array of deadlinks in pages", () => {
  const pages: Page[] = [
    {
      url: new URL("https://example.com/page1"),
      links: [new URL("https://example.com/non-existent-page")],
    },
    {
      url: new URL("https://example.com/page2"),
      links: [new URL("https://example.com/page1")],
    },
    {
      url: new URL("https://example.com/page3"),
      links: [new URL("https://example.com/other-non-existent-page")],
    },
  ];
  const deadlinks = getDeadlinks(pages);

  assertEquals(deadlinks, [
    [pages[0].url, new URL("https://example.com/non-existent-page")],
    [pages[2].url, new URL("https://example.com/other-non-existent-page")],
  ]);
});

Deno.test("extractPageData should return an object with page data", () => {
  const raw = `---
title: Test Page
description: This is a test page
date: 2021-01-01
dateUpdated: 2021-02-01
tags: [tag1, tag2]
---
# Test Page
`;
  const ignoreKeys = ["datePublished"];
  const pageData = extractPageData(raw, ignoreKeys);

  assertEquals(pageData, {
    title: "Test Page",
    datePublished: new Date("2021-01-01"),
    dateUpdated: new Date("2021-02-01"),
    description: "This is a test page",
    tags: ["tag1", "tag2"],
    body: "# Test Page\n",
    attrs: {
      title: "Test Page",
      description: "This is a test page",
      date: new Date("2021-01-01") as unknown as number,
      dateUpdated: new Date("2021-02-01") as unknown as number,
      tags: ["tag1" as unknown as JSONValue, "tag2" as unknown as JSONValue],
    },
    showDescription: true,
    showHeader: true,
    showTitle: true,
    pinned: false,
    unlisted: false,
    ignored: false,
    showMeta: true,
    showToc: false,
    layout: undefined,
    thumbnailUrl: undefined,
  });
});
