import { writableStreamFromWriter } from "https://deno.land/std@0.122.0/streams/mod.ts";
import { dirname, ensureDir, join } from "./deps.ts";
import { createConfig } from "./config.ts";

const modUrl = "https://deno.land/x/ter";
const requiredViews = [
  "base.eta",
  "page.eta",
  "breadcrumbs.eta",
  "link-list.eta",
];
const requiredAssets = [
  "ter.css",
  "hljs.css",
];

const config = createConfig(Deno.args);

async function initializeFile(filePath: string, url: URL) {
  try {
    await Deno.stat(filePath);
    console.log("File exists, skipping:", filePath);
  } catch {
    const fileResponse = await fetch(url);
    if (fileResponse.body) {
      await ensureDir(dirname(filePath));
      const file = await Deno.open(filePath, {
        write: true,
        create: true,
      });
      const writableStream = writableStreamFromWriter(file);
      await fileResponse.body.pipeTo(writableStream);
    }
    console.log("Initialized:", filePath);
  }
}

for await (const view of requiredViews) {
  initializeFile(
    join(config.viewsPath, view),
    new URL(join(modUrl, config.viewsPath, view)),
  );
}

for await (const asset of requiredAssets) {
  initializeFile(
    join(config.assetsPath, asset),
    new URL(join(modUrl, config.assetsPath, asset)),
  );
}
