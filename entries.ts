import { common, join } from "$std/path/mod.ts";
import { expandGlob, walk, WalkEntry } from "$std/fs/mod.ts";
import { withoutTrailingSlash } from "ufo";
import { INDEX_FILENAME, RE_HIDDEN_OR_UNDERSCORED } from "./constants.ts";

const hasIgnoredPrefix = (path: string): boolean => {
  const pathChunks = path.split("/");
  for (const chunk of pathChunks) {
    if (/^\./.test(chunk) || /^_/.test(chunk)) return true;
  }
  return false;
};

export async function getStaticEntries(
  staticPath: string,
  outputPath: string,
  extensions?: Array<string>,
): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];
  let glob = "**/*";

  if (extensions && extensions.length > 0) {
    glob = `**/*.{${extensions.join(",")}}`;
  }

  for await (
    const entry of expandGlob(glob, {
      root: staticPath,
      includeDirs: false,
      caseInsensitive: true,
      exclude: [outputPath],
    })
  ) {
    if (hasIgnoredPrefix(entry.path)) continue;
    entries.push(entry);
  }

  return entries;
}

export async function getAssetEntries(
  assetPath: string,
): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];

  for await (
    const entry of walk(assetPath, { includeDirs: false, followSymlinks: true })
  ) {
    entries.push(entry);
  }

  return entries;
}

export async function getContentEntries(
  contentPath: string,
): Promise<Array<WalkEntry>> {
  const fileEntries: Array<WalkEntry> = [];
  let dirEntries: Array<WalkEntry> = [];

  for await (
    const entry of walk(contentPath, {
      includeDirs: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
      exts: ["md"],
    })
  ) {
    fileEntries.push(entry);
  }

  for await (
    const entry of walk(contentPath, {
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
