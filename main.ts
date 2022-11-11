import { emptyDir } from "$std/fs/mod.ts";
import { parse as parseFlags } from "$std/flags/mod.ts";

import { getHelp, INDEX_FILENAME } from "./constants.ts";
import { getContentEntries, getStaticEntries } from "./entries.ts";
import {
  generateContentPage,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getDeadlinks,
  getTags,
} from "./pages.ts";
import {
  buildContentFiles,
  copyFiles,
  getStaticFiles,
  writeFiles,
} from "./files.ts";

import { createConfig } from "./config.ts";
import { serve } from "./serve.ts";

import { BuildConfig, Page } from "./types.d.ts";

export interface GenerateSiteOpts {
  config: BuildConfig;
  quiet: boolean;
  includeRefresh: boolean;
}

interface BuildStats {
  pageFiles: number;
  staticFiles: number;
  buildMillisecs: number;
}

async function generateSite(opts: GenerateSiteOpts) {
  const {
    inputPath,
    outputPath,
    staticExts,
    userConfig,
    renderDrafts,
  } = opts.config;

  performance.mark("total:start");

  /**
   * SCAN
   * scan the input directory for content and static files
   */

  performance.mark("scan:start");

  opts.quiet || console.log(`scan\t${inputPath}`);
  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries({ path: inputPath }),
    getStaticEntries({ path: inputPath, exts: staticExts }),
  ]);

  const [indexDirEntries, indexFileEntries, nonIndexEntries] = [
    contentEntries.filter((entry) => entry.isDirectory),
    contentEntries.filter((entry) =>
      entry.isFile && entry.name === INDEX_FILENAME
    ),
    contentEntries.filter((entry) =>
      entry.isFile && entry.name !== INDEX_FILENAME
    ),
  ];

  performance.mark("scan:end");

  /**
   * PARSE
   * parse the files and generate pages
   */

  performance.mark("parse:start");

  const indexPages: Page[] = [];
  const contentPages: Page[] = [];

  for (const entry of indexDirEntries) {
    const page = generateIndexPageFromDir({
      entry: entry,
      inputPath: inputPath,
      ignoreKeys: opts.config.ignoreKeys,
      siteUrl: new URL(userConfig.site.url),
    });
    if (renderDrafts) page && indexPages.push(page);
    else page && !page.ignored && indexPages.push(page);
  }

  for (const entry of indexFileEntries) {
    const page = await generateIndexPageFromFile({
      entry: entry,
      inputPath: inputPath,
      ignoreKeys: opts.config.ignoreKeys,
      siteUrl: new URL(userConfig.site.url),
    }).catch(
      (reason: string) =>
        console.error(`Can not render ${entry.path}\n\t${reason}`),
    );
    if (renderDrafts) page && indexPages.push(page);
    else page && !page.ignored && indexPages.push(page);
  }

  for (const entry of nonIndexEntries) {
    const page = await generateContentPage({
      entry: entry,
      inputPath: inputPath,
      ignoreKeys: opts.config.ignoreKeys,
      siteUrl: new URL(userConfig.site.url),
    }).catch((reason: string) =>
      console.error(`Can not render ${entry.path}\n\t${reason}`)
    );
    if (renderDrafts) page && contentPages.push(page);
    else page && !page.ignored && contentPages.push(page);
  }

  const tagIndexPage: Page = {
    url: new URL("/tags", userConfig.site.url),
    tags: getTags(contentPages),
    title: "Tags",
    index: "tag",
    unlisted: true,
  };

  const pages = [
    ...indexPages,
    ...contentPages,
    tagIndexPage,
  ];

  performance.mark("parse:end");

  /**
   * RENDER
   * render markdown to html
   */

  performance.mark("render:start");
  const [contentFiles, staticFiles] = await Promise.all([
    buildContentFiles({
      pages,
      outputPath,
      dev: opts.includeRefresh,
      userConfig,
    }),
    getStaticFiles({ entries: staticEntries, inputPath, outputPath }),
    // buildFeedFile(pages, feedView, join(outputPath, "feed.xml"), userConfig),
  ]);
  performance.mark("render:end");

  /**
   * WRITE
   * write rendered files and copy static files to output directory
   */

  performance.mark("write-copy:start");
  await emptyDir(outputPath);
  await writeFiles({ files: [...contentFiles], quiet: opts.quiet });
  await copyFiles({ files: staticFiles, quiet: opts.quiet });
  performance.mark("write-copy:end");

  // if (feedFile && feedFile.fileContent) {
  //   await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
  // }

  performance.mark("total:end");
  performance.measure("scan", "scan:start", "scan:end");
  performance.measure("parse", "parse:start", "parse:end");
  performance.measure("render", "render:start", "render:end");
  performance.measure("write-copy", "write-copy:start", "write-copy:end");
  performance.measure("total", "total:start", "total:end");
  performance.getEntriesByType("measure").forEach((entry) => {
    console.log(entry.name, entry.duration);
  });

  const deadLinks = getDeadlinks(pages);

  if (deadLinks.length > 0) {
    console.log("---");
    console.log("%cDead links:", "font-weight: bold; color: red");
    deadLinks.forEach(([pageUrl, linkUrl]) => {
      console.log(
        `${pageUrl.pathname} -> %c${linkUrl.pathname}`,
        "color:red",
      );
    });
  }

  if (!opts.quiet) {
    const stats: BuildStats = {
      pageFiles: contentFiles.length,
      staticFiles: staticFiles.length,
      buildMillisecs: Math.floor(
        performance.getEntriesByName("total")[0].duration,
      ),
    };

    console.log(
      `---\n${stats.pageFiles} pages\n${stats.staticFiles} static files\nDone in ${stats.buildMillisecs}ms`,
    );
  }

  performance.getEntries().forEach((entry) => {
    performance.clearMarks(entry.name);
    performance.clearMeasures(entry.name);
  });
}

async function main(args: string[]) {
  const flags = parseFlags(args, {
    boolean: ["serve", "help", "quiet", "local", "drafts"],
    string: ["config", "input", "output", "port", "modurl"],
  });

  if (flags.help) {
    console.log(getHelp(import.meta.url));
    Deno.exit();
  }

  const config = await createConfig({
    configPath: flags.config,
    inputPath: flags.input,
    outputPath: flags.output,
    renderDrafts: flags.drafts,
  });

  await generateSite({
    config: config,
    quiet: flags.quiet,
    includeRefresh: flags.serve,
  });

  if (flags.serve) {
    serve({
      port: flags.port ? Number(flags.port) : null,
      runner: generateSite,
      config,
    });
  }
}

main(Deno.args);
