import { path, yamlParse } from "./deps.ts";

export interface SiteConfig {
  title?: string;
  description?: string;
  rootName?: string;
  url?: string;
  author?: { name?: string; email?: string; url?: string };
}

interface TerConfig {
  inputPath: string;
  outputPath: string;
  assetsPath: string;
  viewsPath: string;
  siteConfigPath: string;
  ignoreKeys: Array<string>;
  staticExts: Array<string>;
  site: SiteConfig;
}

const defaultSiteConfig: SiteConfig = {
  title: "Your Blog Name",
  rootName: "index",
  description: "I am writing about my experiences as a naval navel-gazer",
  url: "https://example.com/",
  author: {
    name: "Your Name Here",
    email: "youremailaddress@example.com",
    url: "https://example.com/about-me/",
  },
};

const defaultConfig: TerConfig = {
  inputPath: Deno.cwd(),
  outputPath: "_site",
  assetsPath: ".ter/assets",
  viewsPath: ".ter/views",
  siteConfigPath: ".ter/config.yml",
  ignoreKeys: ["private", "draft"],
  staticExts: [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "pdf",
    "ico",
    "webm",
    "mp4",
  ],
  site: defaultSiteConfig,
};

async function parseSiteConfig(path: string): Promise<SiteConfig | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const data = decoder.decode(await Deno.readFile(path));
    const conf = yamlParse(data) as SiteConfig;
    console.log(`Found configuration: ${path}`);
    return conf;
  } catch {
    console.log("Configuration file not found: using defaults");
  }
}

export async function createConfig(
  args?: Array<string>,
): Promise<TerConfig> {
  const conf = defaultConfig;
  const siteConf = await parseSiteConfig(conf.siteConfigPath);

  if (siteConf) {
    if (typeof siteConf.title === "string") {
      conf.site.title = siteConf.title;
    }
    if (typeof siteConf.rootName === "string") {
      conf.site.rootName = siteConf.rootName;
    }
    if (typeof siteConf.description === "string") {
      conf.site.description = siteConf.description;
    }
    if (typeof siteConf.url === "string") {
      conf.site.url = siteConf.url;
    }
    if (typeof siteConf.author?.name === "string") {
      conf.site.author = { ...conf.site.author, name: siteConf.author.name };
    }
    if (typeof siteConf.author?.email === "string") {
      conf.site.author = { ...conf.site.author, email: siteConf.author.email };
    }
    if (typeof siteConf.author?.url === "string") {
      conf.site.author = { ...conf.site.author, url: siteConf.author.url };
    }
  }

  if (args && args[0]) {
    const inputPath = Deno.args[0];
    conf.inputPath = path.isAbsolute(inputPath)
      ? inputPath
      : path.join(Deno.cwd(), inputPath);
  }

  if (args && args[1]) {
    const outputPath = Deno.args[1];
    conf.outputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(Deno.cwd(), outputPath);
  }

  return conf;
}
