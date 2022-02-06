import { writableStreamFromWriter } from "https://deno.land/std@0.122.0/streams/mod.ts";
import { dirname, ensureDir, join, yamlStringify } from "./deps.ts";
import { createConfig, createDefaultSiteConfig } from "./config.ts";

const modUrl = "https://deno.land/x/ter";
const requiredViews = [
  "base.eta",
  "page.eta",
  "breadcrumbs.eta",
  "link-list.eta",
  "feed.xml.eta",
];
const requiredAssets = [
  "ter.css",
  "hljs.css",
];

const config = await createConfig(Deno.args);

async function initializeFile(filePath: string, url: URL) {
  const fileResponse = await fetch(url).catch((err) => {
    console.log(`Can't fetch file: ${url}, Error: ${err}`);
    Deno.exit(1);
  });
  if (fileResponse && fileResponse.body) {
    await ensureDir(dirname(filePath));
    const file = await Deno.open(filePath, {
      write: true,
      create: true,
    });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse.body.pipeTo(writableStream);
  }
}

try {
  await Deno.stat(join(Deno.cwd(), config.siteConfigPath));
  console.log("File exists, skipping\t", config.siteConfigPath);
} catch {
  const yaml = yamlStringify(
    createDefaultSiteConfig() as Record<string, unknown>,
  );
  await ensureDir(dirname(config.siteConfigPath));
  await Deno.writeTextFile(config.siteConfigPath, yaml);
  console.log("Initialized\t", config.siteConfigPath);
}

for await (const view of requiredViews) {
  const path = join(config.viewsPath, view);
  try {
    await Deno.stat(path);
    console.log("File exists, skipping\t", path);
  } catch {
    initializeFile(
      join(config.viewsPath, view),
      new URL(join(modUrl, config.viewsPath, view)),
    );
    console.log("Initialized\t", path);
  }
}

for await (const asset of requiredAssets) {
  const path = join(config.assetsPath, asset);
  try {
    await Deno.stat(path);
    console.log("File exists, skipping\t", path);
  } catch {
    initializeFile(
      join(config.assetsPath, asset),
      new URL(join(modUrl, config.assetsPath, asset)),
    );
    console.log("Initialized\t", path);
  }
}
