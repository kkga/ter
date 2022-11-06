import { emptyDir } from "$std/fs/mod.ts";
import { relative } from "$std/path/mod.ts";
import { parse as parseFlags } from "$std/flags/mod.ts";

import { getHelp, INDEX_FILENAME } from "./constants.ts";

import { getContentEntries, getStaticEntries } from "./entries.ts";

import {
  generateContentPage,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getAllTags,
  isDeadLink,
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

  const START = performance.now();

  performance.mark("generate:start");

  opts.quiet || console.log(`scan\t${inputPath}`);

  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries({ path: inputPath }),
    getStaticEntries({ path: inputPath, exts: staticExts }),
  ]);

  const contentPages: Page[] = [];

  performance.mark("parse-markdown:start");
  for (const entry of contentEntries) {
    opts.quiet || console.log(`render\t${relative(inputPath, entry.path)}`);
    const isDirIndex = entry.isDirectory || entry.name === INDEX_FILENAME;

    let page: Page | void;

    if (!isDirIndex) {
      page = await generateContentPage({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      }).catch(
        (reason: string) =>
          console.error(`Can not render ${entry.path}\n\t${reason}`),
      );
    } else if (isDirIndex && entry.isFile) {
      page = await generateIndexPageFromFile({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      }).catch(
        (reason: string) =>
          console.error(`Can not render ${entry.path}\n\t${reason}`),
      );
    } else if (isDirIndex && entry.isDirectory) {
      page = generateIndexPageFromDir({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      });
    }

    if (renderDrafts) {
      page && contentPages.push(page);
    } else {
      page && !page.ignored && contentPages.push(page);
    }
  }
  performance.mark("parse-markdown:end");

  const pages = [
    ...contentPages,
    {
      url: new URL("/tags", userConfig.site.url),
      tags: getAllTags(contentPages),
      title: "Tags",
    },
  ];

  performance.mark("render-html:start");
  const [contentFiles, staticFiles] = await Promise.all([
    buildContentFiles({
      pages,
      outputPath,
      dev: opts.includeRefresh,
      userConfig,
    }),
    getStaticFiles(staticEntries, inputPath, outputPath),
    // buildFeedFile(pages, feedView, join(outputPath, "feed.xml"), userConfig),
  ]);
  performance.mark("render-html:end");

  performance.mark("write-files:start");
  await emptyDir(outputPath);
  await writeFiles([...contentFiles], opts.quiet);
  await copyFiles(staticFiles, opts.quiet);
  performance.mark("write-files:end");

  // if (feedFile && feedFile.fileContent) {
  //   await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
  // }

  const END = performance.now();
  const BUILD_SECS = (END - START);

  performance.mark("generate:end");

  performance.measure(
    "parse-markdown",
    "parse-markdown:start",
    "parse-markdown:end",
  );
  performance.measure("render-html", "render-html:start", "render-html:end");
  performance.measure("write-files", "write-files:start", "write-files:end");
  performance.measure("generate", "generate:start", "generate:end");

  console.log(
    `> render-markdown in ${
      performance.getEntriesByName("parse-markdown", "measure")[0].duration
    }ms`,
  );

  console.log(
    `> render-html in ${
      performance.getEntriesByName("render-html", "measure")[0].duration
    }ms`,
  );

  console.log(
    `> write-files in ${
      performance.getEntriesByName("write-files", "measure")[0].duration
    }ms`,
  );

  console.log(
    `> generate in ${
      performance.getEntriesByName("generate", "measure")[0].duration
    }ms`,
  );

  performance.clearMarks("generate:start");
  performance.clearMarks("generate:end");
  performance.clearMeasures("generate");

  const deadLinks: [from: URL, to: URL][] = [];
  for (const page of pages) {
    if (page.links) {
      page.links.forEach((link: URL) =>
        isDeadLink(pages, link) && deadLinks.push([page.url, link])
      );
    }
  }

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
      buildMillisecs: Math.floor(BUILD_SECS),
    };

    console.log(
      `---\n${stats.pageFiles} pages\n${stats.staticFiles} static files\nDone in ${stats.buildMillisecs}ms`,
    );
  }
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
