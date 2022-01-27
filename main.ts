import {
  basename,
  dirname,
  emptyDir,
  ensureDir,
  join,
  relative,
  WalkEntry,
} from "./deps.ts";
import { buildPage } from "./build.ts";
import { createConfig } from "./config.ts";
import { generatePage, Page } from "./page.ts";
import {
  getAssetEntries,
  getContentEntries,
  getStaticEntries,
} from "./entries.ts";
import { hasIgnoredKey } from "./attr.ts";

interface OutputFile {
  inputPath: string;
  filePath: string;
  fileContent?: string;
}

function getBackLinkPages(
  allPages: Array<Page>,
  inPage: Page,
): Array<Page> {
  const pages: Array<Page> = [];
  for (const outPage of allPages) {
    if (outPage.links?.includes(inPage.path)) {
      pages.push(outPage);
    }
  }

  return pages;
}

function getChildPages(
  allPages: Array<Page>,
  current: Page,
  inputPath: string,
): Array<Page> {
  const pages = allPages.filter((p) => {
    const curDir = current.isIndex
      ? basename(
        dirname(join(inputPath, current.path, "index")),
      )
      : basename(dirname(join(inputPath, current.path)));
    const pDir = basename(
      dirname(join(inputPath, p.path)),
    );
    // console.log(curDir, pDir);
    return curDir === pDir;
  });

  return pages;
}

async function generatePages(
  entries: Array<WalkEntry>,
  inputPath: string,
  ignoredKeys: Array<string>,
): Promise<Page[]> {
  let pages: Array<Page> = [];

  for (const entry of entries) {
    const page = await generatePage(entry, inputPath, entries).catch(
      (reason) => {
        console.log(`Can't generate page ${entry}: ${reason}`);
      },
    );
    page && pages.push(page);
  }

  pages = pages.filter((page) => !hasIgnoredKey(page.attributes, ignoredKeys));

  return pages;
}

async function buildContentFiles(
  pages: Array<Page>,
  inputPath: string,
  outputPath: string,
  pageViewPath: string,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for (const page of pages) {
    const filePath = join(
      outputPath,
      dirname(page.path),
      page.slug,
      "index.html",
    );

    const html = await buildPage(
      page,
      page.isIndex ? getChildPages(pages, page, inputPath) : [],
      getBackLinkPages(pages, page),
      pageViewPath,
    );

    if (typeof html === "string") {
      files.push({
        inputPath: page.path,
        filePath,
        fileContent: html,
      });
    }
  }

  return files;
}

function getStaticFiles(
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

async function main() {
  const startDate = new Date();
  const config = createConfig(Deno.args);
  const { inputPath, outputPath, viewsPath, assetsPath, ignoreKeys } = config;
  const pageViewPath = join(Deno.cwd(), viewsPath, "page.eta");

  const assetEntries = await getAssetEntries(assetsPath);
  const contentEntries = await getContentEntries(inputPath);
  const staticEntries = await getStaticEntries(
    inputPath,
    config.staticExts,
  );

  await Deno.stat(pageViewPath).catch(() => {
    console.log(
      "Can't find the 'page.eta' view. Did you forget to run 'init.ts'?",
    );
    Deno.exit(1);
  });

  const htmlFiles = await generatePages(
    contentEntries,
    inputPath,
    ignoreKeys,
  ).then((pages) =>
    buildContentFiles(
      pages,
      inputPath,
      outputPath,
      join(Deno.cwd(), viewsPath, "page.eta"),
    )
  ).catch((err) => {
    throw new Error(err);
  });

  await emptyDir(outputPath);

  if (htmlFiles && htmlFiles.length > 0) {
    console.log("\nWriting content pages:");

    for (const file of htmlFiles) {
      if (file.fileContent) {
        console.log(
          `  ${file.inputPath || "."}\t-> ${
            relative(outputPath, file.filePath)
          }`,
        );
        await ensureDir(dirname(file.filePath));
        await Deno.writeTextFile(file.filePath, file.fileContent);
      }
    }
  }

  const staticFiles = getStaticFiles(
    staticEntries,
    inputPath,
    outputPath,
  );

  if (staticFiles.length > 0) {
    console.log("\nCopying static files:");

    for (const file of staticFiles) {
      console.log(
        `  ${relative(inputPath, file.inputPath)}\t-> ${
          relative(outputPath, file.filePath)
        }`,
      );
      await ensureDir(dirname(file.filePath));
      await Deno.copyFile(file.inputPath, file.filePath);
    }
  }

  const assetFiles = getStaticFiles(assetEntries, assetsPath, outputPath);

  if (assetFiles.length > 0) {
    console.log("\nCopying site assets:");

    for (const file of assetFiles) {
      console.log(
        `  ${relative(assetsPath, file.inputPath)}\t-> ${
          relative(outputPath, file.filePath)
        }`,
      );
      await ensureDir(dirname(file.filePath));
      await Deno.copyFile(file.inputPath, file.filePath);
    }
  }

  const endDate = new Date();
  const buildSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

  console.log(
    `\nResult:
  Built ${Array.isArray(htmlFiles) && htmlFiles.length} pages
  Copied ${staticFiles.length} static files
  Copied ${assetFiles.length} site assets
  In ${buildSeconds} seconds`,
  );
}

await main();
