import { emptyDir, ensureDir, path, WalkEntry } from "./deps.ts";
import { buildFeed, buildPage, buildTagPage } from "./build.ts";
import { createConfig, SiteConfig } from "./config.ts";
import {
  generatePage,
  getAllTags,
  getBacklinkPages,
  getChildPages,
  getChildTags,
  getPagesByTag,
  isDeadLink,
  Page,
  TagPage,
} from "./page.ts";
import {
  getAssetEntries,
  getContentEntries,
  getStaticEntries,
} from "./entries.ts";
import { getTagsFromAttrs, hasKey } from "./attr.ts";
import { init, requiredAssets, requiredViews } from "./init.ts";

interface OutputFile {
  inputPath: string;
  name: string;
  filePath: string;
  fileContent?: string;
}

async function getHeadInclude(viewsPath: string): Promise<string | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const headPath = path.join(Deno.cwd(), viewsPath, "head.eta");
    return decoder.decode(await Deno.readFile(headPath));
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
    const filePath = path.join(
      outputPath,
      path.dirname(page.path),
      page.slug,
      "index.html",
    );

    const tags = getTagsFromAttrs(page.attributes);
    const pagesByTag: { [tag: string]: Array<Page> } = {};
    tags.forEach((tag) => {
      pagesByTag[tag] = getPagesByTag(pages, tag);
    });

    const html = await buildPage(
      page,
      headInclude,
      page.isIndex ? getChildPages(pages, page) : [],
      getBacklinkPages(pages, page),
      pagesByTag,
      getChildTags(pages, page),
      pageViewPath,
      siteConf,
    );

    if (typeof html === "string") {
      files.push({
        inputPath: page.path,
        filePath,
        name: page.slug,
        fileContent: html,
      });
    }
  }

  return files;
}

async function buildTagFiles(
  tagPages: Array<TagPage>,
  outputPath: string,
  tagViewPath: string,
  headInclude: string,
  siteConf: SiteConfig,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for (const tag of tagPages) {
    const filePath = path.join(
      outputPath,
      "tag",
      tag.name,
      "index.html",
    );

    const html = await buildTagPage(
      tag.name,
      tag.pages,
      tagViewPath,
      headInclude,
      siteConf,
    );

    if (typeof html === "string") {
      files.push({
        inputPath: "",
        filePath,
        name: tag.name,
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
      name: siteConf.title ?? "",
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
    const relPath = path.relative(inputPath, entry.path);
    const filePath = path.join(
      outputPath,
      path.dirname(relPath),
      path.basename(relPath),
    );
    files.push({
      inputPath: entry.path,
      name: entry.name,
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
    const filepath = path.join(Deno.cwd(), viewsPath, file);
    await Deno.stat(filepath).catch(() => Promise.reject(path));
  }
  for (const file of requiredAssets) {
    const filepath = path.join(Deno.cwd(), assetsPath, file);
    await Deno.stat(filepath).catch(() => Promise.reject(path));
  }
  return Promise.resolve(true);
}

async function writeFiles(
  files: OutputFile[],
  outputPath: string,
  description: string,
) {
  files.length > 0 &&
    console.log(`%c\nWriting ${description}:`, "font-weight: bold");

  for (const file of files) {
    if (file.fileContent) {
      console.log(
        `  ${file.inputPath || file.name}\t-> ${
          path.relative(outputPath, file.filePath)
        }`,
      );
      await ensureDir(path.dirname(file.filePath));
      await Deno.writeTextFile(file.filePath, file.fileContent);
    }
  }
}

async function copyFiles(
  files: OutputFile[],
  inputPath: string,
  outputPath: string,
  description: string,
) {
  files.length > 0 &&
    console.log(`%c\nCopying ${description}:`, "font-weight: bold");

  for (const file of files) {
    console.log(
      `  ${path.relative(inputPath, file.inputPath)}\t-> ${
        path.relative(outputPath, file.filePath)
      }`,
    );
    await ensureDir(path.dirname(file.filePath));
    await Deno.copyFile(file.inputPath, file.filePath);
  }
}

async function main() {
  const {
    inputPath,
    outputPath,
    viewsPath,
    assetsPath,
    ignoreKeys,
    staticExts,
    site: siteConf,
  } = await createConfig(Deno.args);

  await checkRequiredFiles(viewsPath, assetsPath, requiredViews, requiredAssets)
    .catch(async (err) => {
      console.error(
        `%cMissing required file: ${path.relative(Deno.cwd(), err)}`,
        "color: red",
      );
      if (confirm("Initialize default views and assets?")) {
        await init();
      } else {
        Deno.exit(1);
      }
    });

  const START = performance.now();

  console.log("%c\nScanning input dir...", "font-weight: bold");
  const contentEntries = await getContentEntries(inputPath);
  const staticEntries = await getStaticEntries(
    inputPath,
    outputPath,
    staticExts,
  );
  const assetEntries = await getAssetEntries(assetsPath);

  let contentPages: Page[] = [];

  console.log("%c\nGenerating pages...", "font-weight: bold");
  for await (const entry of contentEntries) {
    const page = await generatePage(entry, inputPath).catch(
      (reason) => {
        console.log(`Can't generate page ${entry.path}: ${reason}`);
      },
    );
    page && contentPages.push(page);
  }

  contentPages = contentPages.filter((page) =>
    !hasKey(page.attributes, ignoreKeys)
  );

  const tagPages: TagPage[] = [];

  for (const tag of getAllTags(contentPages)) {
    const pagesWithTag = getPagesByTag(contentPages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  const pageViewPath = path.join(Deno.cwd(), viewsPath, "page.eta");
  const tagViewPath = path.join(Deno.cwd(), viewsPath, "tag-page.eta");
  const headInclude = await getHeadInclude(viewsPath) ?? "";

  console.log("%c\nRendering pages...", "font-weight: bold");
  const contentFiles = await buildContentFiles(
    contentPages,
    outputPath,
    pageViewPath,
    headInclude,
    siteConf,
  );
  const tagFiles = await buildTagFiles(
    tagPages,
    outputPath,
    tagViewPath,
    headInclude,
    siteConf,
  );
  const staticFiles = getStaticFiles(staticEntries, inputPath, outputPath);
  const assetFiles = getStaticFiles(assetEntries, assetsPath, outputPath);

  const deadLinks: [string, string][] = [];
  for (const page of contentPages) {
    if (page.links) {
      page.links.forEach((link) =>
        isDeadLink(contentPages, link) && deadLinks.push([page.path, link])
      );
    }
  }

  await emptyDir(outputPath);

  if (contentPages.length > 0) {
    const feedViewPath = path.join(Deno.cwd(), viewsPath, "feed.xml.eta");
    const feedFile = await buildFeedFile(
      contentPages,
      feedViewPath,
      path.join(outputPath, "feed.xml"),
      siteConf,
    );
    if (feedFile && feedFile.fileContent) {
      await ensureDir(path.dirname(feedFile.filePath));
      await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
    }
  }

  await writeFiles(tagFiles, outputPath, "tag index pages");
  await writeFiles(contentFiles, outputPath, "content pages");
  await copyFiles(staticFiles, inputPath, outputPath, "static files");
  await copyFiles(assetFiles, assetsPath, outputPath, "site assets");

  const END = performance.now();
  const BUILD_SECS = (END - START) / 1000;
  const totalFiles = contentFiles.length + tagFiles.length;

  console.log("%c\nResult:", "font-weight: bold");
  console.log(`\
  Built\t\t${totalFiles} pages
  Copied\t${staticFiles.length} static files
  Copied\t${assetFiles.length} site assets
  In\t\t${BUILD_SECS} seconds`);

  if (deadLinks.length > 0) {
    console.log("\nFound dead links:");
    deadLinks.forEach(([path, link]) => {
      console.log(`  [${path}]\tlinks to [${link}] (dead)`);
    });
  }
}

await main();
