import { common, join, walk, WalkEntry, withoutTrailingSlash } from "./deps.ts";
import { INDEX_FILENAME, RE_HIDDEN_OR_UNDERSCORED } from "./constants.ts";

export async function getStaticEntries(opts: {
  path: string;
  exts?: Array<string>;
}): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];

  for await (
    const entry of walk(opts.path, {
      includeDirs: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
      exts: opts.exts,
    })
  ) {
    entries.push(entry);
  }

  return entries;
}

export async function getContentEntries(opts: {
  path: string;
}): Promise<Array<WalkEntry>> {
  const fileEntries: Array<WalkEntry> = [];
  let dirEntries: Array<WalkEntry> = [];

  for await (
    const entry of walk(opts.path, {
      includeDirs: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
      exts: ["md"],
    })
  ) {
    fileEntries.push(entry);
  }

  for await (
    const entry of walk(opts.path, {
      includeDirs: true,
      includeFiles: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
    })
  ) {
    dirEntries.push(entry);
  }

  const filePaths = fileEntries.map((file) => file.path);

  // filter out dirs that are already in fileEntries as "index.md"
  dirEntries = dirEntries.filter((dir) => {
    return !filePaths.includes(join(dir.path, INDEX_FILENAME));
  });

  // filter out dirs that don't have any fileEntries
  dirEntries = dirEntries.filter((dir) => {
    const commonPaths = fileEntries.map((file) =>
      withoutTrailingSlash(common([dir.path, file.path]))
    );
    return commonPaths.includes(withoutTrailingSlash(dir.path));
  });

  return [...fileEntries, ...dirEntries];
}
