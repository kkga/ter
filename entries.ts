import {
  INDEX_FILENAME,
  RE_DATE_PREFIX,
  RE_HIDDEN_OR_UNDERSCORED,
} from "./constants.ts";
import { path, fs } from "./deps/std.ts";
import { withoutTrailingSlash } from "./deps/ufo.ts";

export const getStaticEntries = async (opts: {
  path: string;
  exts?: string[];
}): Promise<fs.WalkEntry[]> => {
  const entries: fs.WalkEntry[] = [];

  for await (const entry of fs.walk(opts.path, {
    includeDirs: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
    exts: opts.exts,
  })) {
    entries.push(entry);
  }

  return entries;
};

export const getContentEntries = async (opts: {
  path: string;
}): Promise<fs.WalkEntry[]> => {
  const fileEntries: fs.WalkEntry[] = [];
  const dirEntries: fs.WalkEntry[] = [];

  for await (const entry of fs.walk(opts.path, {
    includeDirs: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
    exts: ["md"],
  })) {
    fileEntries.push(entry);
  }

  const filePaths = fileEntries.map((file) => file.path);

  for await (const entry of fs.walk(opts.path, {
    includeDirs: true,
    includeFiles: false,
    skip: [RE_HIDDEN_OR_UNDERSCORED],
  })) {
    const commonPaths = fileEntries.map((file) =>
      withoutTrailingSlash(path.common([entry.path, file.path]))
    );

    // skip dirs that are already in fileEntries as "[2021-01-01-]index.md"
    if (
      filePaths.some(
        (filepath) =>
          filepath.replace(RE_DATE_PREFIX, "") ===
          path.join(entry.path, INDEX_FILENAME)
      )
    )
      continue;

    // skip dirs that don't have any fileEntries
    if (!commonPaths.includes(withoutTrailingSlash(entry.path))) continue;

    dirEntries.push(entry);
  }

  return [...fileEntries, ...dirEntries];
};
