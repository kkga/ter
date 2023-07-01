import {
  basename,
  dirname,
  emptyDirSync,
  ensureDir,
  flagsParse,
  join,
  relative,
} from "./deps/std.ts";

import { getHelp, INDEX_FILENAME } from "./constants.ts";
import { getContentEntries, getStaticEntries } from "./entries.ts";
import {
  generateContentPage,
  generateCrumbs,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getBacklinkPages,
  getChildPages,
  getDeadlinks,
  getPagesByTags,
  getRelatedPages,
  getTags,
} from "./pages.ts";

import { createConfig } from "./config.ts";
import { serve } from "./serve.ts";

import { BuildConfig, Page } from "./types.d.ts";
import { renderPage } from "./render.tsx";
import { generateFeed } from "./feed.ts";

export interface GenerateSiteOpts {
  config: BuildConfig;
  includeRefresh?: boolean;
  logLevel?: 0 | 1 | 2;
}

interface BuildStats {
  pageFiles: number;
  staticFiles: number;
  buildMillisecs: number;
}

async function generateSite(opts: GenerateSiteOpts) {
  const { inputPath, outputPath, staticExts, userConfig, renderDrafts } =
    opts.config;

  const logLevel = opts.logLevel || 0;

  performance.mark("total:start");

  /**
   * SCAN
   * scan the input directory for content and static files
   */

  performance.mark("scan:start");

  console.log(`scan\t${inputPath}`);
  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries({ path: inputPath }),
    getStaticEntries({ path: inputPath, exts: staticExts }),
  ]);

  const [indexDirEntries, indexFileEntries, nonIndexEntries] = [
    contentEntries.filter((entry) => entry.isDirectory),
    contentEntries.filter(
      (entry) => entry.isFile && entry.name === INDEX_FILENAME,
    ),
    contentEntries.filter(
      (entry) => entry.isFile && entry.name !== INDEX_FILENAME,
    ),
  ];

  performance.mark("scan:end");

  /**
   * PARSE
   * parse file attributes and generate pages
   */

  performance.mark("parse:start");

  const [indexPages, contentPages] = [
    [
      ...indexDirEntries.map((entry) =>
        generateIndexPageFromDir({
          entry: entry,
          inputPath: inputPath,
          ignoreKeys: opts.config.ignoreKeys,
          userConfig: userConfig,
        })
      ),
      ...indexFileEntries.map((entry) =>
        generateIndexPageFromFile({
          entry: entry,
          inputPath: inputPath,
          ignoreKeys: opts.config.ignoreKeys,
          userConfig: userConfig,
        })
      ),
    ],

    nonIndexEntries.map((entry) =>
      generateContentPage({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        userConfig: userConfig,
      })
    ),
  ];

  const tagIndex: Page = {
    url: new URL("/tags", userConfig.url),
    tags: getTags(contentPages),
    title: "Tags",
    index: "tag",
    unlisted: true,
    ignored: false,
    pinned: false,
    showHeader: false,
    showTitle: false,
    showDescription: false,
    showToc: false,
    showMeta: false,
  };

  const pages = [...indexPages, ...contentPages, tagIndex].filter((page) =>
    renderDrafts ? true : !page.ignored
  );

  performance.mark("parse:end");

  /**
   * RENDER
   * render markdown to html
   */

  performance.mark("render:start");

  const files: { writePath: string; content: string }[] = [
    ...pages.map((page) => {
      const writePath = join(outputPath, page.url.pathname, "index.html");
      const listedPages = pages.filter((p) => !p.unlisted);
      const { childPages, allChildPages } = getChildPages(listedPages, page);
      const backlinkPages = getBacklinkPages(listedPages, page);
      const childTags = getTags(allChildPages);
      const childPagesByTag = getPagesByTags(listedPages, childTags);
      const allPagesByTag = getPagesByTags(listedPages, getTags(listedPages));
      const crumbs = generateCrumbs(page, userConfig.rootCrumb);
      const relatedPages = getRelatedPages(listedPages, page);

      logLevel > 1 && console.log(`render\t${relative(Deno.cwd(), writePath)}`);

      return {
        writePath,
        content: renderPage({
          page: page,
          crumbs: crumbs,
          childPages: childPages,
          relatedPages: relatedPages,
          backlinkPages: backlinkPages,
          pagesByTag: page.index === "tag" ? allPagesByTag : childPagesByTag,
          userConfig: userConfig,
          dev: opts.includeRefresh,
        }),
      };
    }),
    {
      writePath: join(outputPath, "feed.xml"),
      content: generateFeed({ userConfig: userConfig, pages: pages }).atom1(),
    },
  ];

  performance.mark("render:end");

  /**
   * WRITE
   * write rendered files and copy static files to output directory
   */

  performance.mark("write:start");

  emptyDirSync(outputPath);
  const writeTasks: Promise<void>[] = [];

  files.forEach(({ writePath, content }) => {
    writeTasks.push((async () => {
      logLevel > 1 && console.log(`write\t${relative(Deno.cwd(), writePath)}`);
      await ensureDir(dirname(writePath));
      await Deno.writeTextFile(writePath, content);
    })());
  });

  staticEntries.forEach(({ path }) => {
    writeTasks.push((async () => {
      const relPath = relative(inputPath, path);
      const writePath = join(outputPath, dirname(relPath), basename(relPath));
      logLevel > 1 && console.log(`copy\t${relative(Deno.cwd(), writePath)}`);
      await ensureDir(dirname(writePath));
      await Deno.copyFile(path, writePath);
    })());
  });

  await Promise.all(writeTasks);
  performance.mark("write:end");

  /**
   * PERF & STATS
   */

  performance.mark("total:end");
  console.log(`done\t${relative(Deno.cwd(), outputPath)}`);

  const deadLinks = getDeadlinks(pages);

  if (deadLinks.length > 0) {
    console.log("---");
    console.log("%cDead links:", "font-weight: bold; color: red");
    deadLinks.forEach(([pageUrl, linkUrl]) => {
      console.log(`${pageUrl.pathname} -> %c${linkUrl.pathname}`, "color:red");
    });
  }

  if (logLevel > 1) {
    console.log("---");
    console.log("Build stats:");
    performance.measure("scan", "scan:start", "scan:end");
    performance.measure("parse", "parse:start", "parse:end");
    performance.measure("render", "render:start", "render:end");
    performance.measure("write", "write:start", "write:end");
    performance.measure("total", "total:start", "total:end");
    performance.getEntriesByType("measure").forEach((entry) => {
      console.log("=>", entry.name, "(ms)", "\t", Math.floor(entry.duration));
    });

    const stats: BuildStats = {
      pageFiles: files.length,
      staticFiles: staticEntries.length,
      buildMillisecs: Math.floor(
        performance.getEntriesByName("total")[0].duration,
      ),
    };

    console.log("=> pages", "\t", stats.pageFiles);
    console.log("=> assets", "\t", stats.staticFiles);
    console.log("---");
  }

  performance.getEntries().forEach((entry) => {
    performance.clearMarks(entry.name);
    performance.clearMeasures(entry.name);
  });
}

async function main(args: string[]) {
  const flags = flagsParse(args, {
    boolean: ["serve", "help", "debug", "drafts"],
    string: ["config", "input", "output", "port"],
    unknown: (flag) => {
      console.error(`%cUnknown flag: ${flag}`, "color: red");
      Deno.exit(1);
    },
    alias: {
      s: "serve",
      h: "help",
      d: "debug",
      c: "config",
      i: "input",
      o: "output",
    },
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
    logLevel: flags.debug ? 2 : 0,
    includeRefresh: flags.serve,
  });

  if (flags.serve) {
    serve({
      port: flags.port ? Number(flags.port) : null,
      runner: generateSite,
      config,
      logLevel: flags.debug ? 2 : 0,
    });
  }
}

main(Deno.args);
