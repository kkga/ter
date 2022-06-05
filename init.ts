import { fs, path, writableStreamFromWriter, yamlStringify } from "./deps.ts";
import { TerConfig } from "./config.ts";

const MOD_URL = new URL("https://deno.land/x/ter");
const requiredViews = ["base.eta", "feed.xml.eta"];
const requiredAssets = ["ter.css", "hljs.css"];

async function initializeFile(filePath: string, url: URL) {
  const fileResponse = await fetch(url.toString()).catch((err) => {
    console.log(`Can't fetch file: ${url}, Error: ${err}`);
    Deno.exit(1);
  });
  if (fileResponse.ok && fileResponse.body) {
    await fs.ensureDir(path.dirname(filePath));
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

export async function init(config: TerConfig) {
  console.log("%cInitializing site config:", "font-weight: bold");
  try {
    await Deno.stat(path.join(Deno.cwd(), config.siteConfigPath));
    console.log(`  File exists, skipping:\t${config.siteConfigPath}`);
  } catch {
    const yaml = yamlStringify(
      config.site as unknown as Record<string, unknown>,
    );
    await fs.ensureDir(path.dirname(config.siteConfigPath));
    await Deno.writeTextFile(config.siteConfigPath, yaml);
    console.log(`  ${config.siteConfigPath}`);
  }

  console.log("%cInitializing views and assets:", "font-weight: bold");
  for await (const view of requiredViews) {
    const viewPath = path.join(config.viewsPath, view);
    try {
      await Deno.stat(viewPath);
      console.log(`  File exists, skipping:\t${viewPath}`);
    } catch {
      const url = new URL(
        path.join(MOD_URL.href, path.basename(config.viewsPath), view),
      );
      await initializeFile(path.join(config.viewsPath, view), url);
      console.log(`  Initialized:\t${viewPath}`);
    }
  }
  for await (const asset of requiredAssets) {
    const assetPath = path.join(config.assetsPath, asset);
    try {
      await Deno.stat(assetPath);
      console.log("  File exists, skipping:\t", assetPath);
    } catch {
      const url = new URL(
        path.join(MOD_URL.href, path.basename(config.assetsPath), asset),
      );
      await initializeFile(path.join(config.assetsPath, asset), url);
      console.log(`  Initialized:\t${assetPath}`);
    }
  }
}
