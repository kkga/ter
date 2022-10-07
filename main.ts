import {
  emptyDir,
  groupBy,
  join,
  parseFlags,
  relative,
  toFileUrl,
  withTrailingSlash,
} from "./deps.ts";

import {
  BASE_STYLE_PATH,
  BASE_VIEW_PATH,
  FEED_VIEW_PATH,
  HELP,
  INDEX_FILENAME,
  MOD_URL,
} from "./constants.ts";

import { getContentEntries, getStaticEntries } from "./entries.ts";

import {
  generateContentPage,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getAllTags,
  getPagesByTag,
  isDeadLink,
} from "./pages.ts";

import {
  buildContentFiles,
  buildFeedFile,
  buildTagFiles,
  copyFiles,
  getStaticFiles,
  writeFiles,
} from "./files.ts";

import { createConfig } from "./config.ts";
import { serve } from "./serve.ts";

import { BuildConfig, Page, TagPage } from "./types.d.ts";

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

async function readTemplate(path: string): Promise<string | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(await Deno.readFile(path));
  } catch {
    return undefined;
  }
}

async function getRemoteAsset(url: URL) {
  const fileResponse = await fetch(url.toString()).catch((err) => {
    console.error(`Error fetching file: ${url}, ${err}`);
    Deno.exit(1);
  });
  if (fileResponse.ok && fileResponse.body) {
    return await fileResponse.text();
  } else {
    console.error(`Fetch response error: ${url}`);
    Deno.exit(1);
  }
}

async function generateSite(opts: GenerateSiteOpts) {
  const {
    inputPath,
    outputPath,
    pageView,
    feedView,
    style,
    viewsPath,
    staticExts,
    userConfig,
    renderDrafts,
  } = opts.config;

  const START = performance.now();

  performance.mark("generate:start");

  opts.quiet || console.log(`scan\t${inputPath}`);

  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries(inputPath),
    getStaticEntries(inputPath, outputPath, staticExts),
  ]);

  const [headTemplate, footerTemplate] = await Promise.all([
    readTemplate(join(viewsPath, "head.eta")),
    readTemplate(join(viewsPath, "footer.eta")),
  ]);

  const pages: Page[] = [];

  performance.mark("render-markdown:start");
  for (const entry of contentEntries) {
    opts.quiet || console.log(`render\t${relative(inputPath, entry.path)}`);
    const isIndex = entry.isDirectory || entry.name === INDEX_FILENAME;

    let page: Page | void;

    if (!isIndex) {
      page = await generateContentPage({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      }).catch(
        (reason: string) =>
          console.error(`Can not render ${entry.path}\n\t${reason}`),
      );
    } else if (isIndex && entry.isFile) {
      page = await generateIndexPageFromFile({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      }).catch(
        (reason: string) =>
          console.error(`Can not render ${entry.path}\n\t${reason}`),
      );
    } else if (isIndex && entry.isDirectory) {
      page = generateIndexPageFromDir({
        entry: entry,
        inputPath: inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        siteUrl: new URL(userConfig.site.url),
      });
    }

    if (renderDrafts) {
      page && pages.push(page);
    } else {
      page && !page.ignored && pages.push(page);
    }
  }
  performance.mark("render-markdown:end");

  // TODO: use groupBy
  // const taggedPages: Record<string, Page[]> = groupBy(
  //   pages,
  //   (it: Page) => {},
  // );
  const tagPages: TagPage[] = [];
  for (const tag of getAllTags(pages)) {
    const pagesWithTag = getPagesByTag(pages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  performance.mark("render-html:start");
  const [contentFiles, tagFiles, staticFiles, feedFile] = await Promise.all([
    buildContentFiles(pages, {
      outputPath,
      view: pageView,
      headTemplate: headTemplate,
      footerTemplate: footerTemplate,
      includeRefresh: opts.includeRefresh,
      userConfig,
      style,
    }),

    buildTagFiles(tagPages, {
      outputPath,
      view: pageView,
      headTemplate: headTemplate,
      footerTemplate: footerTemplate,
      includeRefresh: opts.includeRefresh,
      userConfig,
      style,
    }),
    getStaticFiles(staticEntries, inputPath, outputPath),
    buildFeedFile(pages, feedView, join(outputPath, "feed.xml"), userConfig),
  ]);
  performance.mark("render-html:end");

  performance.mark("write-files:start");
  await emptyDir(outputPath);
  await writeFiles([...contentFiles, ...tagFiles], opts.quiet);
  await copyFiles(staticFiles, opts.quiet);
  performance.mark("write-files:end");

  if (feedFile && feedFile.fileContent) {
    await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
  }

  const END = performance.now();
  const BUILD_SECS = (END - START);

  performance.mark("generate:end");

  performance.measure(
    "render-markdown",
    "render-markdown:start",
    "render-markdown:end",
  );
  performance.measure("render-html", "render-html:start", "render-html:end");
  performance.measure("write-files", "write-files:start", "write-files:end");
  performance.measure("generate", "generate:start", "generate:end");

  console.log(
    `> render-markdown in ${
      performance.getEntriesByName("render-markdown", "measure")[0].duration
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
      pageFiles: contentFiles.length + tagFiles.length,
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
    console.log(HELP);
    Deno.exit();
  }

  const moduleUrl = withTrailingSlash(
    flags.local
      ? toFileUrl(flags.modurl ? flags.modurl : Deno.cwd()).toString()
      : MOD_URL.toString(),
  );

  const [pageView, baseStyle, feedView] = await Promise.all([
    getRemoteAsset(new URL(BASE_VIEW_PATH, moduleUrl)),
    getRemoteAsset(new URL(BASE_STYLE_PATH, moduleUrl)),
    getRemoteAsset(new URL(FEED_VIEW_PATH, moduleUrl)),
  ]);

  const config = await createConfig({
    configPath: flags.config,
    inputPath: flags.input,
    outputPath: flags.output,
    renderDrafts: flags.drafts,
    pageView: pageView,
    feedView: feedView,
    style: baseStyle,
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
