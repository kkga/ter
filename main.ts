import {
  basename,
  dirname,
  emptyDir,
  ensureDir,
  extname,
  frontMatter,
  join,
  relative,
  slugify,
  walk,
  WalkEntry,
} from "./deps.ts";
import { render } from "./render.ts";
import { buildPage } from "./build.ts";
import { createConfig } from "./config.ts";

export interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

export interface Page {
  isIndex: boolean;
  path: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
  attributes?: unknown;
  date?: Date | null;
  tags?: Array<string>;
  headings?: Array<Heading>;
  body?: string;
  html?: string;
  links?: Array<string>;
}

interface OutputFile {
  inputPath: string;
  filePath: string;
  fileContent?: string;
}

function hasOwnProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

async function getFileEntries(path: string): Promise<Array<WalkEntry>> {
  const entries: Array<WalkEntry> = [];

  const hasIgnoredPrefix = (path: string): boolean => {
    const pathChunks = path.split("/");
    for (const chunk of pathChunks) {
      if (/^\./.test(chunk) || /^\_/.test(chunk)) {
        return true;
      }
    }
    return false;
  };

  for await (const entry of walk(path)) {
    if (!hasIgnoredPrefix(entry.path)) {
      entries.push(entry);
    }
  }
  return entries;
}

const getTitleFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "title") &&
    typeof attrs.title === "string"
  ) {
    return attrs.title;
  }
};

const getDescriptionFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "description") &&
    typeof attrs.description === "string"
  ) {
    return attrs.description;
  }
};

const getTagsFromAttrs = (attrs: unknown): Array<string> => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "tags") &&
    Array.isArray(attrs.tags)
  ) {
    return attrs.tags;
  }
  return [];
};

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) {
      return h.text;
    }
  }
};

const hasIgnoredKey = (attrs: unknown, ignoreKeys: Array<string>): boolean => {
  if (attrs && typeof attrs === "object") {
    for (const key of Object.keys(attrs)) {
      const keyTyped = key as keyof typeof attrs;
      if (ignoreKeys.includes(keyTyped) && attrs[keyTyped] === true) {
        return true;
      }
    }
  }
  return false;
};

async function generatePages(
  entries: Array<WalkEntry>,
  inputPath: string,
  ignoredKeys: Array<string>,
): Promise<Page[]> {
  const pages: Array<Page> = [];
  const decoder = new TextDecoder("utf-8");

  for await (const entry of entries) {
    if (entry.isFile && entry.name !== "index.md") {
      // TODO: use opened file for reading content
      const file = await Deno.open(entry.path);
      const relPath = relative(inputPath, entry.path);
      const content = decoder.decode(Deno.readFileSync(entry.path));
      const { attributes, body } = frontMatter(content);
      const [html, links, headings] = render(body);
      const slug = slugify(entry.name.replace(/\.md$/i, ""), { lower: true });
      const title = getTitleFromAttrs(attributes) ||
        getTitleFromHeadings(headings) || entry.name;
      const description = getDescriptionFromAttrs(attributes) || "";
      const tags = getTagsFromAttrs(attributes);
      const date = Deno.fstatSync(file.rid).mtime;
      const isIndex = false;
      file.close();

      if (hasIgnoredKey(attributes, ignoredKeys)) {
        continue;
      }

      const contentPage: Page = {
        name: entry.name,
        path: relPath,
        attributes,
        body,
        html,
        links,
        headings,
        title,
        slug,
        description,
        tags,
        date,
        isIndex,
      };

      pages.push(contentPage);
    } else if (entry.isDirectory) {
      const findIndexEntryPath = (dirPath: string): string | undefined => {
        for (const entry of entries) {
          if (
            entry.isFile && entry.name === "index.md" &&
            dirname(entry.path) === dirPath
          ) {
            return entry.path;
          }
        }
      };

      const relPath = relative(inputPath, entry.path);
      const slug = relPath === "" ? "" : slugify(entry.name);
      const isIndex = true;
      const indexEntry = findIndexEntryPath(entry.path);
      let indexPage: Page;

      if (indexEntry) {
        const content = decoder.decode(Deno.readFileSync(indexEntry));
        const { attributes, body } = frontMatter(content);
        const [html, links, headings] = render(body);
        const title = getTitleFromAttrs(attributes) ||
          getTitleFromHeadings(headings) || entry.name;
        const description = getDescriptionFromAttrs(attributes) || "";
        const tags = getTagsFromAttrs(attributes);

        indexPage = {
          name: entry.name,
          path: relPath,
          attributes,
          body,
          html,
          links,
          headings,
          title,
          slug,
          description,
          tags,
          isIndex,
        };
      } else {
        indexPage = {
          name: entry.name,
          path: relPath,
          title: entry.name,
          slug,
          isIndex,
        };
      }

      pages.push(indexPage);
    }
  }
  return pages;
}

function getBackLinkedPages(allPages: Array<Page>, inPage: Page): Array<Page> {
  const bl: Array<Page> = [];

  for (const outPage of allPages) {
    const { links } = outPage;

    if (links && links.length > 0) {
      if (links.includes(inPage.path)) {
        bl.push(outPage);
      }
    }
  }

  return bl;
}

function getChildPages(
  allPages: Array<Page>,
  current: Page,
  inputPath: string,
): Array<Page> {
  const pages = allPages.filter((p) => {
    const curDir = current.isIndex
      ? basename(
        dirname(join(inputPath, current.path, "index")),
      )
      : basename(dirname(join(inputPath, current.path)));
    const pDir = basename(
      dirname(join(inputPath, p.path)),
    );
    return curDir === pDir;
  });

  return pages;
}

async function buildContentFiles(
  pages: Array<Page>,
  inputPath: string,
  outputPath: string,
  pageViewPath: string,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for (const page of pages) {
    const filePath = join(
      outputPath,
      dirname(page.path),
      page.slug,
      "index.html",
    );

    const html = await buildPage(
      page,
      page.isIndex ? getChildPages(pages, page, inputPath) : [],
      getBackLinkedPages(pages, page),
      pageViewPath,
    );

    if (typeof html === "string") {
      files.push({
        inputPath: page.path,
        filePath,
        fileContent: html,
      });
    }
  }

  return files;
}

function getStaticFiles(
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

async function getAssetFiles(
  assetsPath: string,
  outputPath: string,
): Promise<OutputFile[]> {
  const files: Array<OutputFile> = [];

  for await (const entry of walk(assetsPath, { includeDirs: false })) {
    const relPath = relative(assetsPath, entry.path);
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

async function main() {
  const startDate = new Date();
  const config = createConfig(Deno.args);
  const { inputPath, outputPath, viewsPath, assetsPath, ignoreKeys } = config;
  const entries = await getFileEntries(inputPath);

  const markdownEntries = entries.filter((entry) =>
    entry.isDirectory || entry.isFile && extname(entry.path) === ".md"
  );

  const staticEntries = entries.filter((entry) =>
    entry.isFile && extname(entry.path) !== ".md"
  );

  // console.log(markdownEntries);
  // console.log(staticEntries);

  const htmlFiles = await generatePages(
    markdownEntries,
    inputPath,
    ignoreKeys,
  ).then((pages) =>
    buildContentFiles(
      pages,
      inputPath,
      outputPath,
      join(Deno.cwd(), viewsPath, "page.eta"),
    )
  ).catch((err) => {
    console.log(err);
  });

  await emptyDir(outputPath);

  if (htmlFiles && htmlFiles.length > 0) {
    console.log("\nWriting content pages:");

    for (const file of htmlFiles) {
      console.log(
        `  ${file.inputPath || "."}\t-> ${relative(outputPath, file.filePath)}`,
      );
      if (file.fileContent) {
        await ensureDir(dirname(file.filePath));
        Deno.writeTextFileSync(file.filePath, file.fileContent);
      }
    }
  }

  const staticFiles = getStaticFiles(
    staticEntries,
    inputPath,
    outputPath,
  );

  if (staticFiles.length > 0) {
    console.log("\nCopying static files:");

    for (const file of staticFiles) {
      console.log(
        `  ${relative(inputPath, file.inputPath)}\t-> ${
          relative(outputPath, file.filePath)
        }`,
      );
      await ensureDir(dirname(file.filePath));
      Deno.copyFileSync(file.inputPath, file.filePath);
    }
  }

  const assetFiles = await getAssetFiles(assetsPath, outputPath);

  if (assetFiles.length > 0) {
    console.log("\nCopying site assets:");

    for (const file of assetFiles) {
      console.log(
        `  ${relative(assetsPath, file.inputPath)}\t-> ${
          relative(outputPath, file.filePath)
        }`,
      );
      ensureDir(dirname(file.filePath));
      Deno.copyFileSync(file.inputPath, file.filePath);
    }
  }

  const endDate = new Date();
  const buildSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

  console.log(
    `\nResult:
  Built ${Array.isArray(htmlFiles) && htmlFiles.length} pages
  Copied ${staticFiles.length} static files
  Copied ${assetFiles.length} site assets
  In ${buildSeconds} seconds`,
  );
}

main();
