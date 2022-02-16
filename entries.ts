import { expandGlob, path, walk, WalkEntry } from "./deps.ts";

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
  const entries: Array<WalkEntry> = [];
  const glob = "**/*";

  for await (
    const entry of expandGlob(glob, {
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
    if (hasIgnoredPrefix(entry.path)) {
      continue;
    }
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

  // TODO: filter dirs that aren't included in filePaths (i.e. empty)
  dirEntries = dirEntries.filter((dir) => {
    return !filePaths.includes(path.join(dir.path, "index.md"));
  });

  console.log(fileEntries);

  const entries = [...fileEntries, ...dirEntries];

  return entries;
}
