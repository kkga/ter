import { assertEquals } from "./deps/std.ts";
import { generateCrumbs, getDateFromFilename } from "./pages.ts";
import { Page } from "./types.d.ts";

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
