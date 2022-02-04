import { isAbsolute, join, yamlParse } from "./deps.ts";

export interface SiteConfig {
  title?: string;
  shortTitle?: string;
  description?: string;
  author?: { name?: string; email?: string; url?: string };
}

type TerConfig = {
  inputPath: string;
  outputPath: string;
  assetsPath: string;
  viewsPath: string;
  siteConfigPath: string;
  ignoreKeys: Array<string>;
  staticExts: Array<string>;
} & SiteConfig;

const defaultConfig: TerConfig = {
  inputPath: Deno.cwd(),
  outputPath: "_site",
  assetsPath: ".ter/assets",
  viewsPath: ".ter/views",
  siteConfigPath: ".ter/site.yml",
  ignoreKeys: ["private", "draft"],
  staticExts: ["png", "jpg", "jpeg", "gif", "webp", "webm", "mp4"],
};

async function parseSiteConfig(path: string): Promise<SiteConfig | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const data = decoder.decode(await Deno.readFile(path));

    const conf = yamlParse(data) as SiteConfig;
    return conf;
  } catch (err) {
    console.log(String(err));
  }
}

export async function createConfig(
  args?: Array<string>,
): Promise<TerConfig> {
  const conf = defaultConfig;
  const siteConf = await parseSiteConfig(conf.siteConfigPath);

  if (siteConf) {
    if (typeof siteConf.title === "string") {
      conf.title = siteConf.title;
    }
    if (typeof siteConf.shortTitle === "string") {
      conf.shortTitle = siteConf.shortTitle;
    }
    if (typeof siteConf.description === "string") {
      conf.description = siteConf.description;
    }
    if (typeof siteConf.author?.name === "string") {
      conf.author = { ...conf.author, name: siteConf.author.name };
    }
    if (typeof siteConf.author?.email === "string") {
      conf.author = { ...conf.author, email: siteConf.author.email };
    }
    if (typeof siteConf.author?.url === "string") {
      conf.author = { ...conf.author, url: siteConf.author.url };
    }
  }

  if (args && args[0]) {
    const inputPath = Deno.args[0];
    conf.inputPath = isAbsolute(inputPath)
      ? inputPath
      : join(Deno.cwd(), inputPath);
  }

  if (args && args[1]) {
    const outputPath = Deno.args[1];
    conf.outputPath = isAbsolute(outputPath)
      ? outputPath
      : join(Deno.cwd(), outputPath);
  }

  console.log(conf);
  // Deno.exit();

  return conf;
}
