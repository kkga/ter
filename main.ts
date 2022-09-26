import { parseFlags } from "./deps.ts";
import { emptyDir } from "./deps.ts";
import { join, relative, toFileUrl } from "./deps.ts";
import { withTrailingSlash } from "./deps.ts";

import { getContentEntries, getStaticEntries } from "./entries.ts";

import {
  generatePage,
  getAllTags,
  getPagesByTag,
  isDeadLink,
  Page,
  TagPage,
} from "./pages.ts";

import {
  buildContentFiles,
  buildFeedFile,
  buildTagFiles,
  copyFiles,
  getStaticFiles,
  writeFiles,
} from "./files.ts";

import { BuildConfig, createConfig } from "./config.ts";
import { serve } from "./serve.ts";
import { hasKey } from "./attributes.ts";

interface BuildStats {
  pageFiles: number;
  staticFiles: number;
  buildMillisecs: number;
}

const MOD_URL = new URL("https://deno.land/x/ter/");
const BASE_VIEW_PATH = "views/base.eta";
const BASE_STYLE_PATH = "assets/ter.css";
const FEED_VIEW_PATH = "views/feed.xml.eta";

async function getHeadInclude(viewsPath: string): Promise<string | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const headPath = join(Deno.cwd(), viewsPath, "head.eta");
    return decoder.decode(await Deno.readFile(headPath));
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

async function generateSite(config: BuildConfig, includeRefresh: boolean) {
  const {
    outputPath,
    pageView,
    feedView,
    style,
    viewsPath,
    ignoreKeys,
    staticExts,
    userConfig,
  } = config;

  const START = performance.now();

  config.quiet || console.log(`scan\t${config.inputPath}`);
  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries(config.inputPath),
    getStaticEntries(config.inputPath, outputPath, staticExts),
  ]);

  const headInclude = await getHeadInclude(viewsPath) ?? "";

  const pages: Page[] = [];
  for (const entry of contentEntries) {
    config.quiet ||
      console.log(`render\t${relative(config.inputPath, entry.path)}`);
    const page = await generatePage(entry, config.inputPath, userConfig).catch(
      (reason: string) => {
        console.log(`Can not render ${entry.path}\n\t${reason}`);
      },
    );

    if (config.renderDrafts) {
      page && pages.push(page);
    } else {
      page && !hasKey(page.attrs, ignoreKeys) && pages.push(page);
    }
  }

  const tagPages: TagPage[] = [];
  for (const tag of getAllTags(pages)) {
    const pagesWithTag = getPagesByTag(pages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  const [contentFiles, tagFiles, staticFiles, feedFile] = await Promise.all([
    buildContentFiles(pages, {
      outputPath,
      view: pageView,
      head: headInclude,
      includeRefresh,
      userConfig,
      style,
    }),

    buildTagFiles(tagPages, {
      outputPath,
      view: pageView,
      head: headInclude,
      includeRefresh,
      userConfig,
      style,
    }),

    getStaticFiles(staticEntries, config.inputPath, outputPath),
    buildFeedFile(pages, feedView, join(outputPath, "feed.xml"), userConfig),
  ]);

  await emptyDir(outputPath);
  await writeFiles([...contentFiles, ...tagFiles], config.quiet);
  await copyFiles(staticFiles, config.quiet);

  if (feedFile && feedFile.fileContent) {
    await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
  }

  const END = performance.now();
  const BUILD_SECS = (END - START);

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

  if (!config.quiet) {
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
    default: {
      config: ".ter/config.json",
      input: ".",
      output: "_site",
      serve: false,
      port: 8080,
      quiet: false,
      local: false,
      drafts: false,
      modurl: "",
    },
  });

  if (flags.help) {
    printHelp();
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
    quiet: flags.quiet,
    renderDrafts: flags.drafts,
    pageView: pageView,
    feedView: feedView,
    style: baseStyle,
  });

  await generateSite(config, flags.serve);

  if (flags.serve === true) {
    serve({
      port: Number(flags.port),
      runner: generateSite,
      config,
    });
  }
}

function printHelp() {
  console.log(`Ter -- tiny wiki-style site builder.\n
USAGE:
  ter [options]\n
OPTIONS:
  --input\t\tSource directory (default: .)
  --output\t\tOutput directory (default: _site)
  --config\t\tPath to config file (default: .ter/config.json)
  --local\t\tUse local assets (default: false)
  --serve\t\tServe locally and watch for changes (default: false)
  --port\t\tServe port (default: 8080)
  --drafts\t\tRender pages marked as drafts (default: false)
  --quiet\t\tDo not list generated files (default: false)`);
}

main(Deno.args);
