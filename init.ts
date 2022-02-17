import {
  ensureDir,
  path,
  writableStreamFromWriter,
  yamlStringify,
} from "./deps.ts";
import { createConfig } from "./config.ts";

const MOD_URL = "https://deno.land/x/ter";

export const requiredViews = [
  "base.eta",
  "feed.xml.eta",
  "header.eta",
  "page.eta",
  "pagelist.eta",
  "taglist.eta",
];
export const requiredAssets = [
  "ter.css",
  "hljs.css",
];

async function initializeFile(filePath: string, url: URL) {
  const fileResponse = await fetch(url).catch((err) => {
    console.log(`Can't fetch file: ${url}, Error: ${err}`);
    Deno.exit(1);
  });
  if (fileResponse.ok && fileResponse.body) {
    await ensureDir(path.dirname(filePath));
    const file = await Deno.open(filePath, {
      write: true,
      create: true,
    });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse.body.pipeTo(writableStream);
  } else {
    console.error(`Fetch response error`);
    Deno.exit(1);
  }
}

export async function init() {
  const config = await createConfig(Deno.args);

  try {
    await Deno.stat(path.join(Deno.cwd(), config.siteConfigPath));
    console.log("File exists, skipping\t", config.siteConfigPath);
  } catch {
    const yaml = yamlStringify(config.site as Record<string, unknown>);
    await ensureDir(path.dirname(config.siteConfigPath));
    await Deno.writeTextFile(config.siteConfigPath, yaml);
    console.log("Initialized\t", config.siteConfigPath);
  }

  for await (const view of requiredViews) {
    const viewPath = path.join(config.viewsPath, view);
    try {
      await Deno.stat(viewPath);
      console.log("File exists, skipping\t", path);
    } catch {
      const url = new URL(
        path.join(MOD_URL, path.basename(config.viewsPath), view),
      );
      await initializeFile(path.join(config.viewsPath, view), url);
      console.log("Initialized\t", path);
    }
  }

  for await (const asset of requiredAssets) {
    const assetPath = path.join(config.assetsPath, asset);
    try {
      await Deno.stat(assetPath);
      console.log("File exists, skipping\t", path);
    } catch {
      const url = new URL(
        path.join(MOD_URL, path.basename(config.assetsPath), asset),
      );
      await initializeFile(path.join(config.assetsPath, asset), url);
      console.log("Initialized\t", path);
    }
  }
}
