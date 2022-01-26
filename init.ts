import { writableStreamFromWriter } from "https://deno.land/std@0.122.0/streams/mod.ts";
import { dirname, ensureDirSync, join } from "./deps.ts";
import { defaultConfig as conf } from "./config.ts";

const modUrl = "file:///home/kkga/projects/ter";
const requiredViews = ["base.eta", "page.eta", "link-list.eta"];
const requiredAssets = ["ter.css", "hljs.css"];

async function initializeFile(filePath: string, url: URL) {
  try {
    Deno.statSync(filePath);
    console.log("File exists, skipping:", filePath);
  } catch {
    const fileResponse = await fetch(url);
    if (fileResponse.body) {
      ensureDirSync(dirname(filePath));
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
    join(conf.viewsPath, view),
    new URL(join(modUrl, conf.viewsPath, view)),
  );
}

for await (const asset of requiredAssets) {
  initializeFile(
    join(conf.staticPath, asset),
    new URL(join(modUrl, conf.staticPath, asset)),
  );
}
