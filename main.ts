import { parseFlags } from "./deps.ts";
import { emptyDir, ensureDir } from "./deps.ts";
import { dirname, join, relative, toFileUrl } from "./deps.ts";
import { withTrailingSlash } from "./deps.ts";

import * as entries from "./entries.ts";
import {
  generatePage,
  getAllTags,
  getPagesByTag,
  isDeadLink,
} from "./pages.ts";
import type { Page, TagPage } from "./pages.ts";

import {
  buildContentFiles,
  buildFeedFile,
  buildTagFiles,
  copyFiles,
  getStaticFiles,
  writeFiles,
} from "./files.ts";

import { createConfig, TerConfig } from "./config.ts";
import { serve } from "./serve.ts";
import { hasKey } from "./attributes.ts";

const MOD_URL = new URL("https://deno.land/x/ter/");

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
    console.log(`Can't fetch file: ${url}, Error: ${err}`);
    Deno.exit(1);
  });
  if (fileResponse.ok && fileResponse.body) {
    return await fileResponse.text();
  } else {
    console.error(`Fetch response error: ${url}`);
    Deno.exit(1);
  }
}

async function generateSite(config: TerConfig, includeRefresh: boolean) {
  const {
    inputPath,
    outputPath,
    pageView,
    feedView,
    style,
    viewsPath,
    ignoreKeys,
    staticExts,
    site: siteConf,
  } = config;

  const START = performance.now();

  console.log(`scan\t${inputPath}`);
  const [contentEntries, staticEntries] = await Promise.all([
    entries.getContentEntries(inputPath),
    entries.getStaticEntries(inputPath, outputPath, staticExts),
  ]);

  const pages: Page[] = [];

  for (const entry of contentEntries) {
    config.quiet ||
      console.log(`render\t${relative(inputPath, entry.path)}`);
    const page = await generatePage(entry, inputPath, siteConf).catch(
      (reason: string) => {
        console.log(`Can not render ${entry.path}\n\t${reason}`);
      },
    );
    page && pages.push(page);
  }

  const filteredPages = config.renderDrafts
    ? pages
    : pages.filter((page) => !hasKey(page.attrs, ignoreKeys));

  const tagPages: TagPage[] = [];

  for (const tag of getAllTags(filteredPages)) {
    const pagesWithTag = getPagesByTag(filteredPages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  const headInclude = await getHeadInclude(viewsPath) ?? "";

  const [contentFiles, tagFiles, staticFiles] = await Promise.all(
    [
      buildContentFiles(filteredPages, {
        outputPath: outputPath,
        view: pageView,
        head: headInclude,
        includeRefresh,
        conf: siteConf,
        style,
      }),
      buildTagFiles(tagPages, {
        outputPath: outputPath,
        view: pageView,
        head: headInclude,
        includeRefresh,
        conf: siteConf,
        style,
      }),
      getStaticFiles(staticEntries, inputPath, outputPath),
    ],
  );

  const deadLinks: [from: URL, to: URL][] = [];
  for (const page of filteredPages) {
    if (page.links) {
      page.links.forEach((link: URL) =>
        isDeadLink(filteredPages, link) && deadLinks.push([page.url, link])
      );
    }
  }

  await emptyDir(outputPath);

  if (filteredPages.length > 0) {
    const feedFile = await buildFeedFile(
      filteredPages,
      feedView,
      join(outputPath, "feed.xml"),
      siteConf,
    );
    if (feedFile && feedFile.fileContent) {
      await ensureDir(dirname(feedFile.filePath));
      await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
    }
  }

  await writeFiles(
    [...tagFiles, ...contentFiles],
    config.quiet,
  );
  await copyFiles(
    [...staticFiles],
    config.quiet,
  );

  const END = performance.now();
  const BUILD_SECS = (END - START);
  const totalFiles = contentFiles.length + tagFiles.length;

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

  console.log("---");
  console.log(`${totalFiles} pages`);
  console.log(`${staticFiles.length} static files`);
  console.log(`Done in ${Math.floor(BUILD_SECS)}ms`);
}

async function main(args: string[]) {
  const flags = parseFlags(args, {
    boolean: ["serve", "help", "quiet", "local", "drafts"],
    string: ["config", "input", "output", "port"],
    default: {
      config: ".ter/config.yml",
      input: ".",
      output: "_site",
      serve: false,
      port: 8080,
      quiet: false,
      local: false,
      drafts: false,
    },
  });

  if (flags.help) {
    printHelp();
    Deno.exit();
  }

  const moduleUrl = withTrailingSlash(
    flags.local ? toFileUrl(Deno.cwd()).toString() : MOD_URL.toString(),
  );

  const [pageView, feedView, baseStyle] = await Promise.all([
    getRemoteAsset(new URL("views/base.eta", moduleUrl)),
    getRemoteAsset(new URL("views/feed.xml.eta", moduleUrl)),
    getRemoteAsset(new URL("assets/ter.css", moduleUrl)),
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
  --config\t\tPath to config file (default: .ter/config.yml)
  --serve\t\tServe locally and watch for changes (default: false)
  --port\t\tServe port (default: 8080)
  --drafts\t\tRender pages marked as drafts (default: false)
  --quiet\t\tDo not list generated files (default: false)`);
}

main(Deno.args);
