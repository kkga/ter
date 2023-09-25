import { assertEquals } from "./deps/std.ts";
import { getDateFromFilename } from "./pages.ts";

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
