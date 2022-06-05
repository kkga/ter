import { parse } from "./deps.ts";
import { emptyDir, ensureDir } from "./deps.ts";
import { dirname, join, relative, toFileUrl } from "./deps.ts";
import { withTrailingSlash } from "./deps.ts";
import * as entries from "./entries.ts";
import * as pages from "./pages.ts";
import * as attrs from "./attributes.ts";
import * as files from "./files.ts";
import { createConfig, TerConfig } from "./config.ts";
import { serve } from "./serve.ts";

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

export async function getRemoteAsset(url: URL) {
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

export async function generateSite(config: TerConfig, includeRefresh: boolean) {
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

  const unfilteredPages: pages.Page[] = [];

  for (const entry of contentEntries) {
    config.quiet ||
      console.log(`render\t${relative(inputPath, entry.path)}`);
    const page = await pages.generatePage(entry, inputPath, siteConf).catch(
      (reason: string) => {
        console.log(`Can't render page ${entry.path}: ${reason}`);
      },
    );
    page && unfilteredPages.push(page);
  }

  const contentPages = unfilteredPages.filter((page) =>
    !attrs.hasKey(page.attrs, ignoreKeys)
  );

  const tagPages: pages.TagPage[] = [];

  for (const tag of pages.getAllTags(contentPages)) {
    const pagesWithTag = pages.getPagesByTag(contentPages, tag);
    tagPages.push({ name: tag, pages: pagesWithTag });
  }

  const headInclude = await getHeadInclude(viewsPath) ?? "";

  const [contentFiles, tagFiles, staticFiles] = await Promise.all(
    [
      files.buildContentFiles(contentPages, {
        outputPath: outputPath,
        view: pageView,
        head: headInclude,
        includeRefresh,
        conf: siteConf,
        style,
      }),
      files.buildTagFiles(tagPages, {
        outputPath: outputPath,
        view: pageView,
        head: headInclude,
        includeRefresh,
        conf: siteConf,
        style,
      }),
      files.getStaticFiles(staticEntries, inputPath, outputPath),
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

  await emptyDir(outputPath);

  if (contentPages.length > 0) {
    const feedFile = await files.buildFeedFile(
      contentPages,
      feedView,
      join(outputPath, "feed.xml"),
      siteConf,
    );
    if (feedFile && feedFile.fileContent) {
      await ensureDir(dirname(feedFile.filePath));
      await Deno.writeTextFile(feedFile.filePath, feedFile.fileContent);
    }
  }

  await files.writeFiles(
    [...tagFiles, ...contentFiles],
    config.quiet,
  );
  await files.copyFiles(
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
  const flags = parse(args, {
    boolean: ["serve", "help", "quiet", "local"],
    string: ["config", "input", "output", "port"],
    default: {
      config: ".ter/config.yml",
      input: ".",
      output: "_site",
      serve: false,
      port: 8080,
      quiet: false,
      local: false,
    },
  });

  if (flags.help) {
    printHelp();
    Deno.exit();
  }

  const moduleUrl = withTrailingSlash(
    flags.local ? toFileUrl(Deno.cwd()).toString() : MOD_URL.toString(),
  );

  const [pageView, feedView, baseStyle, hljsStyle] = await Promise.all([
    getRemoteAsset(new URL("views/base.eta", moduleUrl)),
    getRemoteAsset(new URL("views/feed.xml.eta", moduleUrl)),
    getRemoteAsset(new URL("assets/ter.css", moduleUrl)),
    getRemoteAsset(new URL("assets/hljs.css", moduleUrl)),
  ]);

  const config = await createConfig({
    configPath: flags.config,
    inputPath: flags.input,
    outputPath: flags.output,
    quiet: flags.quiet,
    pageView: pageView,
    feedView: feedView,
    style: [baseStyle, hljsStyle].join("\n"),
  });

  await generateSite(config, flags.serve);

  if (flags.serve === true) {
    serve({
      port: flags.port,
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
  --quiet\t\tDon't list filenames (default: false)`);
}

main(Deno.args);
