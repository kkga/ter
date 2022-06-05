import { copy, ensureDir, WalkEntry } from "./deps.ts";
import { basename, dirname, join, relative } from "./deps.ts";
import { buildFeed, buildPage, buildTagPage } from "./build.ts";
import { SiteConfig } from "./config.ts";
import { getTags } from "./attributes.ts";
import {
  getBacklinkPages,
  getChildPages,
  getChildTags,
  getPagesByTag,
  Page,
  TagPage,
} from "./pages.ts";

export interface OutputFile {
  inputPath?: string;
  filePath: string;
  fileContent?: string;
}

interface BuildOpts {
  outputPath: string;
  view: string;
  head: string;
  conf: SiteConfig;
  style: string;
  includeRefresh: boolean;
}

export async function buildContentFiles(
  pages: Array<Page>,
  opts: BuildOpts,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for (const page of pages) {
    const filePath = join(
      opts.outputPath,
      page.url.pathname,
      "index.html",
    );

    const tags = getTags(page.attrs);
    const pagesByTag: { [tag: string]: Array<Page> } = {};
    tags.forEach((tag: string) => {
      pagesByTag[tag] = getPagesByTag(pages, tag);
    });

    const html = await buildPage(page, {
      headInclude: opts.head,
      includeRefresh: opts.includeRefresh,
      childPages: page.isIndex ? getChildPages(pages, page) : [],
      backlinkPages: getBacklinkPages(pages, page),
      taggedPages: pagesByTag,
      childTags: page.isIndex ? getChildTags(pages, page) : [],
      view: opts.view,
      siteConf: opts.conf,
      style: opts.style,
    });

    if (typeof html === "string") {
      files.push({
        filePath,
        fileContent: html,
      });
    }
  }

  return files;
}

export async function buildTagFiles(
  tagPages: Array<TagPage>,
  opts: BuildOpts,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for (const tag of tagPages) {
    const filePath = join(
      opts.outputPath,
      "tag",
      tag.name,
      "index.html",
    );

    const html = await buildTagPage(tag.name, {
      taggedPages: tag.pages,
      view: opts.view,
      headInclude: opts.head,
      includeRefresh: opts.includeRefresh,
      siteConf: opts.conf,
      style: opts.style,
    });

    if (typeof html === "string") {
      files.push({
        inputPath: "",
        filePath,
        fileContent: html,
      });
    }
  }

  return files;
}

export async function buildFeedFile(
  pages: Array<Page>,
  view: string,
  outputPath: string,
  siteConf: SiteConfig,
): Promise<OutputFile | undefined> {
  const xml = await buildFeed(
    pages,
    view,
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

export function getStaticFiles(
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

export async function writeFiles(
  files: OutputFile[],
  quiet = false,
) {
  quiet && console.log(`writing files...`);
  for (const file of files) {
    if (file.fileContent) {
      quiet ||
        console.log(`write\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await Deno.writeTextFile(file.filePath, file.fileContent);
    }
  }
}

export async function copyFiles(
  files: OutputFile[],
  quiet = false,
) {
  quiet && console.log(`copying files...`);
  for (const file of files) {
    if (file.inputPath) {
      quiet ||
        console.log(`copy\t${relative(Deno.cwd(), file.filePath)}`);
      await ensureDir(dirname(file.filePath));
      await copy(file.inputPath, file.filePath);
    }
  }
}
