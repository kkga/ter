import { basename, dirname, expandGlob, WalkEntry } from "./deps.ts";

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
  path: string,
) {
  const entries: Array<WalkEntry> = [];
  const glob = "**/*";

  for await (
    const entry of expandGlob(glob, {
      root: path,
      includeDirs: false,
      caseInsensitive: true,
    })
  ) {
    entries.push(entry);
  }

  return entries;
}

export async function getStaticEntries(
  path: string,
  extensions?: Array<string>,
): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];
  let glob = "**/*";

  if (extensions && extensions.length > 0) {
    glob = `**/*.{${extensions.join(",")}}`;
  }

  for await (
    const entry of expandGlob(glob, {
      root: path,
      includeDirs: false,
      caseInsensitive: true,
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
  path: string,
): Promise<Array<WalkEntry>> {
  const fileEntries: Array<WalkEntry> = [];

  for await (
    const entry of expandGlob("**/*.md", {
      root: path,
      caseInsensitive: true,
    })
  ) {
    if (!hasIgnoredPrefix(entry.path)) {
      fileEntries.push(entry);
    }
  }

  const dirEntries: Array<WalkEntry> = [];
  const indexDirs: Set<string> = new Set();
  for (const entry of fileEntries) {
    const dirPath = dirname(entry.path);
    indexDirs.add(dirPath);
  }
  for (const dir of indexDirs) {
    dirEntries.push({
      path: dir,
      name: basename(dir),
      isFile: false,
      isDirectory: true,
      isSymlink: false,
    });
  }

  const entries = [...fileEntries, ...dirEntries];

  return entries;
}
