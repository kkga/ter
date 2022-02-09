import {
  basename,
  dirname,
  emptyDir,
  ensureDir,
  join,
  relative,
  WalkEntry,
} from "./deps.ts";
import { buildFeed, buildPage } from "./build.ts";
import { createConfig, SiteConfig } from "./config.ts";
import { generatePage, isDeadLink, Page } from "./page.ts";
import {
  getAssetEntries,
  getContentEntries,
  getStaticEntries,
} from "./entries.ts";
import { hasKey } from "./attr.ts";
import { init, requiredAssets, requiredViews } from "./init.ts";

interface OutputFile {
  inputPath: string;
  filePath: string;
  fileContent?: string;
}

function getBacklinkPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages: Array<Page> = [];

  for (const outPage of allPages) {
    if (outPage.links?.includes(current.path)) {
      pages.push(outPage);
    }
  }

  return pages;
}

function getChildPages(
  allPages: Array<Page>,
  current: Page,
): Array<Page> {
  const pages = allPages.filter((p) => {
    return current.path !== p.path && current.path === dirname(p.path);
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

  pages = pages.filter((page) => !hasKey(page.attributes, ignoredKeys));

  return pages;
}

async function getHeadInclude(viewsPath: string): Promise<string | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const path = join(Deno.cwd(), viewsPath, "head.eta");
    return decoder.decode(await Deno.readFile(path));
  } catch {
    return undefined;
  }
}

async function buildContentFiles(
  pages: Array<Page>,
  outputPath: string,
  pageViewPath: string,
  headInclude: string,
  siteConf: SiteConfig,
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
      headInclude,
      page.isIndex ? getChildPages(pages, page) : [],
      getBacklinkPages(pages, page),
      pageViewPath,
      siteConf,
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

async function buildFeedFile(
  pages: Array<Page>,
  feedViewPath: string,
  outputPath: string,
  siteConf: SiteConfig,
): Promise<OutputFile | undefined> {
  const xml = await buildFeed(
    pages,
    feedViewPath,
    siteConf,
  );

  if (typeof xml === "string") {
    return {
      inputPath: "",
      filePath: outputPath,
      fileContent: xml,
    };
  }
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

async function checkRequiredFiles(
  viewsPath: string,
  assetsPath: string,
  requiredViews: Array<string>,
  requiredAssets: Array<string>,
): Promise<boolean> {
  for (const file of requiredViews) {
    const path = join(Deno.cwd(), viewsPath, file);
    await Deno.stat(path).catch(() => Promise.reject(path));
  }
  for (const file of requiredAssets) {
    const path = join(Deno.cwd(), assetsPath, file);
    await Deno.stat(path).catch(() => Promise.reject(path));
  }
  return Promise.resolve(true);
}

async function main() {
  const config = await createConfig(Deno.args);
  const { inputPath, outputPath, viewsPath, assetsPath, ignoreKeys } = config;
  const deadLinks: [string, string][] = [];
  const { site: siteConf } = config;

  await checkRequiredFiles(viewsPath, assetsPath, requiredViews, requiredAssets)
    .catch(async (err) => {
      console.error(
        `%cMissing required file: ${relative(Deno.cwd(), err)}`,
        "color: red",
      );
      if (confirm("Initialize default views and assets?")) {
        await init();
      } else {
        Deno.exit(1);
      }
    });

  const START = performance.now();

  const contentEntries = await getContentEntries(inputPath);
  const staticEntries = await getStaticEntries(inputPath, config.staticExts);
  const assetEntries = await getAssetEntries(assetsPath);

  const pages = await generatePages(contentEntries, inputPath, ignoreKeys);
  const pageViewPath = join(Deno.cwd(), viewsPath, "page.eta");
  const headInclude = await getHeadInclude(viewsPath) ?? "";
  const htmlFiles = await buildContentFiles(
    pages,
    outputPath,
    pageViewPath,
    headInclude,
    siteConf,
  );
  const staticFiles = getStaticFiles(staticEntries, inputPath, outputPath);
  const assetFiles = getStaticFiles(assetEntries, assetsPath, outputPath);

  for (const page of pages) {
    if (page.links) {
      page.links.forEach((link) =>
        isDeadLink(pages, link) && deadLinks.push([page.path, link])
      );
    }
  }

  await emptyDir(outputPath);

  if (pages.length > 0) {
    const feedViewPath = join(Deno.cwd(), viewsPath, "feed.xml.eta");
    const feedFile = await buildFeedFile(
      pages,
      feedViewPath,
      join(config.outputPath, "feed.xml"),
      siteConf,
    );
    if (feedFile && feedFile.fileContent) {
      await ensureDir(dirname(feedFile.filePath));
      await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
    }
  }

  if (htmlFiles.length > 0) {
    console.log("%c\nWriting content pages:", "font-weight: bold");

    for (const file of htmlFiles) {
      if (file.fileContent) {
        console.log(
          `  ${file.inputPath}\t-> ${relative(outputPath, file.filePath)}`,
        );
        await ensureDir(dirname(file.filePath));
        await Deno.writeTextFile(file.filePath, file.fileContent);
      }
    }
  }

  if (staticFiles.length > 0) {
    console.log("%c\nCopying static files:", "font-weight: bold");

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

  if (assetFiles.length > 0) {
    console.log("%c\nCopying site assets:", "font-weight: bold");

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

  const END = performance.now();
  const BUILD_SECS = (END - START) / 1000;

  console.log("%c\nResult:", "font-weight: bold");
  console.log(`\
  Built ${Array.isArray(htmlFiles) && htmlFiles.length} pages
  Copied ${staticFiles.length} static files
  Copied ${assetFiles.length} site assets
  In ${BUILD_SECS} seconds`);

  if (deadLinks.length > 0) {
    console.log("\nFound dead links:");
    deadLinks.forEach(([path, link]) => {
      console.log(`  [${path}]\tlinks to [${link}] (dead)`);
    });
  }
}

await main();
