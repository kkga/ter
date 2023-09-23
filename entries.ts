import { INDEX_FILENAME, RE_HIDDEN_OR_UNDERSCORED } from "./constants.ts";
import { WalkEntry, common, join, walk } from "./deps/std.ts";
import { withoutTrailingSlash } from "./deps/ufo.ts";

export async function getStaticEntries(opts: {
  path: string;
  exts?: Array<string>;
}): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];

  for await (const entry of walk(opts.path, {
    includeDirs: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
    exts: opts.exts,
  })) {
    entries.push(entry);
  }

  return entries;
}

export async function getContentEntries(opts: {
  path: string;
}): Promise<Array<WalkEntry>> {
  const fileEntries: Array<WalkEntry> = [];
  const dirEntries: Array<WalkEntry> = [];

  for await (const entry of walk(opts.path, {
    includeDirs: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
    exts: ["md"],
  })) {
    fileEntries.push(entry);
  }

  const filePaths = fileEntries.map((file) => file.path);

  for await (const entry of walk(opts.path, {
    includeDirs: true,
    includeFiles: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
  })) {
    const commonPaths = fileEntries.map((file) =>
      withoutTrailingSlash(common([entry.path, file.path]))
    );

    // skip dirs that are already in fileEntries as "[2021-01-01-]index.md"
    if (
      filePaths.some(
        (path) =>
          path.replace(/\d{4}-\d{2}-\d{2}[-_]/, "") ===
          join(entry.path, INDEX_FILENAME)
      )
    )
      continue;

    // skip dirs that don't have any fileEntries
    if (!commonPaths.includes(withoutTrailingSlash(entry.path))) continue;

    dirEntries.push(entry);
  }

  return [...fileEntries, ...dirEntries];
}
