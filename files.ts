import { copy, ensureDir, WalkEntry } from "$std/fs/mod.ts";
import { basename, dirname, join, relative } from "$std/path/mod.ts";
import { renderPage } from "./render.tsx";
import {
  getBacklinkPages,
  getChildPages,
  getPagesByTags,
  getRelatedPages,
  getTags,
} from "./pages.ts";

import type { OutputFile, Page, UserConfig } from "./types.d.ts";

function buildContentFiles({ pages, outputPath, userConfig, dev }: {
  pages: Page[];
  outputPath: string;
  userConfig: UserConfig;
  dev: boolean;
}): OutputFile[] {
  const files: OutputFile[] = [];

  for (const page of pages) {
    const filePath = join(
      outputPath,
      page.url.pathname,
      "index.html",
    );

    const childPages = getChildPages(pages, page);
    const backlinkPages = getBacklinkPages(pages, page);
    const childTags = getTags(childPages);
    const childPagesByTag = getPagesByTags(pages, childTags);
    const allPagesByTag = getPagesByTags(pages, getTags(pages));

    const html = renderPage({
      page: page,
      dev: dev,
      childPages: childPages,
      backlinkPages: backlinkPages,
      pagesByTag: page.index === "tag" ? allPagesByTag : childPagesByTag,
      relatedPages: getRelatedPages(pages, page),
      userConfig: userConfig,
    });

    files.push({
      filePath,
      fileContent: html,
    });
  }

  return files;
}

function getStaticFiles(opts: {
  entries: Array<WalkEntry>;
  inputPath: string;
  outputPath: string;
}): OutputFile[] {
  const files: Array<OutputFile> = [];

  for (const entry of opts.entries) {
    const relPath = relative(opts.inputPath, entry.path);
    const filePath = join(
      opts.outputPath,
      dirname(relPath),
      basename(relPath),
    );

    files.push({
      inputPath: entry.path,
      filePath,
    });
  }

  return files;
}

async function writeFiles(opts: {
  files: OutputFile[];
  quiet: boolean;
}) {
  for (const file of opts.files) {
    if (file.fileContent) {
      opts.quiet ||
        console.log(`write\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await Deno.writeTextFile(file.filePath, file.fileContent);
    }
  }
}

async function copyFiles(opts: {
  files: OutputFile[];
  quiet: boolean;
}) {
  for (const file of opts.files) {
    if (file.inputPath) {
      opts.quiet || console.log(`copy\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await copy(file.inputPath, file.filePath);
    }
  }
}

export { buildContentFiles, copyFiles, getStaticFiles, writeFiles };
