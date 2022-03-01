import { flagsParse, fs, path } from "./deps.ts";
import { createConfig, TerConfig } from "./config.ts";
import { checkRequiredFiles, init } from "./init.ts";
import { serve } from "./serve.ts";
import * as entries from "./entries.ts";
import * as pages from "./pages.ts";
import * as data from "./data.ts";
import * as files from "./files.ts";

async function getHeadInclude(viewsPath: string): Promise<string | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const headPath = path.join(Deno.cwd(), viewsPath, "head.eta");
    return decoder.decode(await Deno.readFile(headPath));
  } catch {
    return undefined;
  }
}

export async function generateSite(config: TerConfig) {
  const {
    inputPath,
    outputPath,
    viewsPath,
    assetsPath,
    ignoreKeys,
    staticExts,
    site: siteConf,
  } = config;

  await checkRequiredFiles(viewsPath, assetsPath)
    .catch(async (err: string) => {
      console.error(
        `%cMissing required file: ${path.relative(Deno.cwd(), err)}`,
        "color: red",
      );
      if (confirm("Initialize default views and assets?")) {
        await init(config);
      } else {
        Deno.exit(1);
      }
    });

  const START = performance.now();

  console.log("%cScanning input dir...", "font-weight: bold");
  const [contentEntries, staticEntries, assetEntries] = await Promise.all([
    entries.getContentEntries(inputPath),
    entries.getStaticEntries(inputPath, outputPath, staticExts),
    entries.getAssetEntries(assetsPath),
  ]);

  const unfilteredPages: pages.Page[] = [];

  console.log("%cRendering markdown...", "font-weight: bold");
  for (const entry of contentEntries) {
    const page = await pages.generatePage(entry, inputPath, siteConf).catch(
      (reason: string) => {
        console.log(`Can't generate page ${entry.path}: ${reason}`);
      },
    );
    page && unfilteredPages.push(page);
  }

  const contentPages = unfilteredPages.filter((page) =>
    !data.hasKey(page.data, ignoreKeys)
  );

  const tagPages: pages.TagPage[] = [];

  for (const tag of pages.getAllTags(contentPages)) {
    const pagesWithTag = pages.getPagesByTag(contentPages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  const pageViewPath = path.join(Deno.cwd(), viewsPath, "page.eta");
  const tagViewPath = path.join(Deno.cwd(), viewsPath, "page.eta");
  const headInclude = await getHeadInclude(viewsPath) ?? "";

  console.log("%cBuilding html files...", "font-weight: bold");

  const [contentFiles, tagFiles, staticFiles, assetFiles] = await Promise.all(
    [
      files.buildContentFiles(contentPages, {
        outputPath: outputPath,
        viewPath: pageViewPath,
        head: headInclude,
        conf: siteConf,
      }),
      files.buildTagFiles(tagPages, {
        outputPath: outputPath,
        viewPath: tagViewPath,
        head: headInclude,
        conf: siteConf,
      }),
      files.getStaticFiles(staticEntries, inputPath, outputPath),
      files.getStaticFiles(assetEntries, assetsPath, outputPath),
    ],
  );

  const deadLinks: [from: URL, to: URL][] = [];
  for (const page of contentPages) {
    if (page.links) {
      page.links.forEach((link: URL) =>
        pages.isDeadLink(contentPages, link) && deadLinks.push([page.url, link])
      );
    }
  }

  await fs.emptyDir(outputPath);

  if (contentPages.length > 0) {
    const feedViewPath = path.join(Deno.cwd(), viewsPath, "feed.xml.eta");
    const feedFile = await files.buildFeedFile(
      contentPages,
      feedViewPath,
      path.join(outputPath, "feed.xml"),
      siteConf,
    );
    if (feedFile && feedFile.fileContent) {
      await fs.ensureDir(path.dirname(feedFile.filePath));
      await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
    }
  }

  await files.writeFiles(tagFiles, "tag index pages");
  await files.writeFiles(contentFiles, "content pages");
  await files.copyFiles(staticFiles, "static files");
  await files.copyFiles(assetFiles, "site assets");

  const END = performance.now();
  const BUILD_SECS = (END - START);
  const totalFiles = contentFiles.length + tagFiles.length;

  console.log("%cResult:", "font-weight: bold");
  console.log(`\
  Built\t\t${totalFiles} pages
  Copied\t${staticFiles.length} static files and ${assetEntries.length} site assets
  In\t\t${Math.floor(BUILD_SECS)}ms`);

  if (deadLinks.length > 0) {
    console.log("%cFound dead links:", "font-weight: bold; color: red");
    deadLinks.forEach(([pageUrl, linkUrl]) => {
      console.log(
        `  ${pageUrl.pathname}\tlinks to %c${linkUrl.pathname}`,
        "color:red",
      );
    });
  }
}

async function main(args: string[]) {
  const flags = flagsParse(args, {
    boolean: ["serve"],
    string: ["input", "output", "port"],
    default: {
      input: ".",
      output: "_site",
      serve: false,
      port: 8080,
    },
  });

  const config = await createConfig(flags);
  await generateSite(config);

  if (flags.serve === true) {
    serve({
      port: flags.port,
      runner: generateSite,
      config: config,
    });
  } else {
    Deno.exit();
  }
}

main(Deno.args);
