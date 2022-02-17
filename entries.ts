import { fs, path, withoutTrailingSlash } from "./deps.ts";

const RE_HIDDEN_OR_UNDERSCORED = /^\.|^_|\/\.|\/\_/;

const hasIgnoredPrefix = (path: string): boolean => {
  const pathChunks = path.split("/");
  for (const chunk of pathChunks) {
    if (/^\./.test(chunk) || /^\_/.test(chunk)) {
      return true;
    }
  }
  return false;
};

export async function getAssetEntries(
  assetPath: string,
) {
  const entries: Array<fs.WalkEntry> = [];
  const glob = "**/*";

  for await (
    const entry of fs.expandGlob(glob, {
      root: assetPath,
      includeDirs: false,
      caseInsensitive: true,
    })
  ) {
    entries.push(entry);
  }

  return entries;
}

export async function getStaticEntries(
  staticPath: string,
  outputPath: string,
  extensions?: Array<string>,
): Promise<Array<fs.WalkEntry>> {
  const entries: Array<fs.WalkEntry> = [];
  let glob = "**/*";

  if (extensions && extensions.length > 0) {
    glob = `**/*.{${extensions.join(",")}}`;
  }

  for await (
    const entry of fs.expandGlob(glob, {
      root: staticPath,
      includeDirs: false,
      caseInsensitive: true,
      exclude: [outputPath],
    })
  ) {
    if (hasIgnoredPrefix(entry.path)) {
      continue;
    }
    entries.push(entry);
  }

  return entries;
}

export async function getContentEntries(
  contentPath: string,
): Promise<Array<fs.WalkEntry>> {
  const fileEntries: Array<fs.WalkEntry> = [];
  let dirEntries: Array<fs.WalkEntry> = [];

  for await (
    const entry of fs.walk(contentPath, {
      includeDirs: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
      exts: ["md"],
    })
  ) {
    fileEntries.push(entry);
  }

  for await (
    const entry of fs.walk(contentPath, {
      includeDirs: true,
      includeFiles: false,
      skip: [RE_HIDDEN_OR_UNDERSCORED],
    })
  ) {
    dirEntries.push(entry);
  }

  const filePaths = fileEntries.map((file) => file.path);

  // filter dirs that are already in fileEntries as "index.md"
  dirEntries = dirEntries.filter((dir) => {
    return !filePaths.includes(path.join(dir.path, "index.md"));
  });

  // filter dirs that don't have any fileEntries
  dirEntries = dirEntries.filter((dir) => {
    const commonPaths = fileEntries.map((file) =>
      withoutTrailingSlash(path.common([dir.path, file.path]))
    );
    return commonPaths.includes(withoutTrailingSlash(dir.path));
  });

  const entries = [...fileEntries, ...dirEntries];

  return entries;
}
