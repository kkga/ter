import { getContentEntries, getStaticEntries } from "./entries.ts";
import { defaultBuildConfig } from "./config.ts";
import { assertEquals } from "./deps/std.ts";

const testPath = `${Deno.cwd()}/test/entries/`;
const config = defaultBuildConfig;

Deno.test(
  "getContentEntries should return an array of WalkEntry objects",
  async () => {
    const entries = await getContentEntries({ path: testPath });
    assertEquals(Array.isArray(entries) && entries.length > 0, true);
    assertEquals(typeof entries[0].path, "string");
  }
);

Deno.test(
  "getContentEntries should include only directories and markdown files",
  async () => {
    const entries = await getContentEntries({ path: testPath });
    assertEquals(
      entries.every((entry) => entry.path.endsWith(".md") || entry.isDirectory),
      true
    );
  }
);

Deno.test(
  "getContentEntries should exclude hidden and underscored files",
  async () => {
    const entries = await getContentEntries({ path: testPath });
    assertEquals(
      entries.every(
        (entry) => !entry.name.startsWith("_") && !entry.name.startsWith(".")
      ),
      true
    );
  }
);

Deno.test(
  "getStaticEntries should return an array of WalkEntry objects with static extensions",
  async () => {
    const entries = await getStaticEntries({
      path: testPath,
      exts: config.staticExts,
    });
    assertEquals(Array.isArray(entries) && entries.length > 0, true);
    assertEquals(typeof entries[0].path, "string");
    assertEquals(
      entries.every((entry) => entry.path.endsWith(".jpg")),
      true
    );
  }
);
