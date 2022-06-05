import { fs, path, ufo, yamlParse, yamlStringify } from "./deps.ts";

export interface SiteConfig {
  title: string;
  description: string;
  rootName: string;
  url: string;
  author: { name: string; email: string; url: string };
}

export interface TerConfig {
  inputPath: string;
  outputPath: string;
  pageView: string;
  feedView: string;
  style: string;
  assetsPath: string;
  viewsPath: string;
  siteConfigPath: string;
  ignoreKeys: Array<string>;
  staticExts: Array<string>;
  site: SiteConfig;
  quiet: boolean;
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
  pageView: "",
  feedView: "",
  style: "",
  siteConfigPath: ".ter/config.yml",
  ignoreKeys: ["unlisted", "draft"],
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
  quiet: false,
};

async function checkSiteConfig(configPath: string): Promise<boolean> {
  const filepath = path.join(Deno.cwd(), configPath);
  await Deno.stat(filepath).catch(() => Promise.reject(filepath));
  return Promise.resolve(true);
}

async function initSiteConfig(config: SiteConfig, configPath: string) {
  const yaml = yamlStringify(
    config as unknown as Record<string, unknown>,
  );
  await fs.ensureDir(path.dirname(configPath));
  await Deno.writeTextFile(configPath, yaml);
}

async function parseSiteConfig(path: string): Promise<SiteConfig | undefined> {
  try {
    const decoder = new TextDecoder("utf-8");
    const data = decoder.decode(await Deno.readFile(path));
    const conf = yamlParse(data) as SiteConfig;
    return conf;
  } catch {
    return undefined;
  }
}

interface CreateConfigOpts {
  configPath: string | undefined;
  inputPath: string | undefined;
  outputPath: string | undefined;
  pageView: string;
  feedView: string;
  style: string;
  quiet: boolean;
}

export async function createConfig(opts: CreateConfigOpts): Promise<TerConfig> {
  const conf = defaultConfig;
  console.log(opts);

  if (opts.configPath && opts.configPath != "") {
    conf.siteConfigPath = path.isAbsolute(opts.configPath)
      ? opts.configPath
      : path.join(Deno.cwd(), opts.configPath);
  }

  if (opts.inputPath && opts.inputPath != "") {
    conf.inputPath = path.isAbsolute(opts.inputPath)
      ? opts.inputPath
      : path.join(Deno.cwd(), opts.inputPath);
  }

  if (opts.outputPath && opts.outputPath != "") {
    conf.outputPath = path.isAbsolute(opts.outputPath)
      ? opts.outputPath
      : path.join(Deno.cwd(), opts.outputPath);
  }

  conf.pageView = opts.pageView;
  conf.feedView = opts.feedView;
  conf.style = opts.style;
  conf.quiet = opts.quiet;

  await checkSiteConfig(conf.siteConfigPath)
    .catch(async () => {
      console.log(
        `Config file missing, initializing default config at ${conf.siteConfigPath}`,
      );
      await initSiteConfig(conf.site, conf.siteConfigPath);
    });

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
      conf.site.url = ufo.withTrailingSlash(ufo.normalizeURL(siteConf.url));
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

  return conf;
}
