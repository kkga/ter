import { copy, ensureDir, WalkEntry } from "$std/fs/mod.ts";
import { basename, dirname, join, relative } from "$std/path/mod.ts";
import { renderPage } from "./render.tsx";
import {
  getBacklinkPages,
  getChildPages,
  getChildTags,
  getPagesByTag,
} from "./pages.ts";

import type { OutputFile, Page, UserConfig } from "./types.d.ts";

export function buildContentFiles(
  { pages, outputPath, userConfig, dev }: {
    pages: Page[];
    outputPath: string;
    userConfig: UserConfig;
    dev: boolean;
  },
): OutputFile[] {
  const files: OutputFile[] = [];

  for (const page of pages) {
    const filePath = join(
      outputPath,
      page.url.pathname,
      "index.html",
    );

    let pagesByTag: Record<string, Page[]> = {};

    if (page.index === "tag" && page.title) {
      pagesByTag[page.title] = getPagesByTag(pages, page.title);
    } else if (page.tags) {
      pagesByTag = page.tags.reduce(
        (acc, tag) => {
          return {
            ...acc,
            [tag]: getPagesByTag(pages, tag).filter((p) => p.url !== page.url),
          };
        },
        {},
      );

      pagesByTag = Object.entries(pagesByTag).reduce(
        (acc, [k, v]) => v.length > 0 ? { ...acc, [k]: v } : acc,
        {},
      );
    }

    const html = renderPage({
      page: page,
      dev: dev,
      childPages: getChildPages(pages, page),
      backlinkPages: getBacklinkPages(pages, page),
      taggedPages: pagesByTag,
      childTags: getChildTags(pages, page),
      userConfig: userConfig,
    });

    if (typeof html === "string") {
      files.push({
        filePath,
        fileContent: html,
      });
    }
  }

  return files;
}

// export function buildTagFiles(
//   { tagPages, outputPath, userConfig, dev }: {
//     tagPages: Record<string, Page[]>[];
//     outputPath: string;
//     userConfig: UserConfig;
//     dev: boolean;
//   },
// ): OutputFile[] {
//   const files: Array<OutputFile> = [];

//   for (const tag of tagPages) {
//     const { name, pages } = tag;
//     const filePath = join(
//       outputPath,
//       "tag",
//       name,
//       "index.html",
//     );

//     const html = renderPage({
//       tagName: tag,
//       taggedPages: tag.pages,
//       dev: opts.dev,
//       userConfig: opts.userConfig,
//     });

//     if (typeof html === "string") {
//       files.push({
//         inputPath: "",
//         filePath,
//         fileContent: html,
//       });
//     }
//   }

//   return files;
// }

// export async function buildFeedFile(
//   pages: Page[],
//   view: string,
//   outputPath: string,
//   userConfig: UserConfig,
// ): Promise<OutputFile | undefined> {
//   const xml = await buildFeed(
//     pages,
//     view,
//     userConfig,
//   );

//   if (typeof xml === "string") {
//     return {
//       inputPath: "",
//       filePath: outputPath,
//       fileContent: xml,
//     };
//   }
// }

export function getStaticFiles(
  entries: Array<WalkEntry>,
  inputPath: string,
  outputPath: string,
): OutputFile[] {
  const files: Array<OutputFile> = [];

  for (const entry of entries) {
    const relPath = relative(inputPath, entry.path);
    const filePath = join(
      outputPath,
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

export async function writeFiles(
  files: OutputFile[],
  quiet = false,
) {
  for (const file of files) {
    if (file.fileContent) {
      quiet ||
        console.log(`write\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await Deno.writeTextFile(file.filePath, file.fileContent);
    }
  }
}

export async function copyFiles(
  files: OutputFile[],
  quiet = false,
) {
  for (const file of files) {
    if (file.inputPath) {
      quiet ||
        console.log(`copy\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await copy(file.inputPath, file.filePath);
    }
  }
}
