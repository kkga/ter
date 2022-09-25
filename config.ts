import { deepmerge } from "./deps.ts";
import { ensureDir } from "./deps.ts";
import { dirname, isAbsolute, join } from "./deps.ts";

export interface UserConfig {
  site: {
    title: string;
    description: string;
    url: string;
    rootCrumb: string;
  };
  navigation: Record<string, string>;
  author: { name: string; email: string; url: string };
}

export interface BuildConfig {
  inputPath: string;
  outputPath: string;
  pageView: string;
  feedView: string;
  style: string;
  assetsPath: string;
  viewsPath: string;
  userConfigPath: string;
  ignoreKeys: string[];
  staticExts: string[];
  userConfig: UserConfig;
  quiet: boolean;
  renderDrafts: boolean;
}

const defaultUserConfig: UserConfig = {
  site: {
    title: "Your Blog Name",
    description: "I am writing about my experiences as a naval navel-gazer",
    url: "https://example.com/",
    rootCrumb: "index",
  },
  navigation: {},
  author: {
    name: "Your Name Here",
    email: "youremailaddress@example.com",
    url: "https://example.com/about-me/",
  },
};

const defaultBuildConfig: BuildConfig = {
  inputPath: Deno.cwd(),
  outputPath: "_site",
  assetsPath: ".ter/assets",
  viewsPath: ".ter/views",
  pageView: "",
  feedView: "",
  style: "",
  userConfigPath: ".ter/config.yml",
  ignoreKeys: ["draft"],
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
  userConfig: defaultUserConfig,
  quiet: false,
  renderDrafts: false,
};

async function checkUserConfig(path: string): Promise<boolean> {
  const filepath = isAbsolute(path) ? path : join(Deno.cwd(), path);
  await Deno.stat(filepath).catch(() => Promise.reject(filepath));
  return Promise.resolve(true);
}

async function initUserConfig(config: UserConfig, configPath: string) {
  await ensureDir(dirname(configPath));
  await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
}

interface CreateConfigOpts {
  configPath: string | undefined;
  inputPath: string | undefined;
  outputPath: string | undefined;
  pageView: string;
  feedView: string;
  style: string;
  quiet: boolean;
  renderDrafts: boolean;
}

export async function createConfig(
  opts: CreateConfigOpts,
): Promise<BuildConfig> {
  const conf = defaultBuildConfig;

  if (opts.configPath && opts.configPath != "") {
    conf.userConfigPath = isAbsolute(opts.configPath)
      ? opts.configPath
      : join(Deno.cwd(), opts.configPath);
  }

  if (opts.inputPath && opts.inputPath != "") {
    conf.inputPath = isAbsolute(opts.inputPath)
      ? opts.inputPath
      : join(Deno.cwd(), opts.inputPath);
  }

  if (opts.outputPath && opts.outputPath != "") {
    conf.outputPath = isAbsolute(opts.outputPath)
      ? opts.outputPath
      : join(Deno.cwd(), opts.outputPath);
  }

  conf.pageView = opts.pageView;
  conf.feedView = opts.feedView;
  conf.style = opts.style;
  conf.quiet = opts.quiet;
  conf.renderDrafts = opts.renderDrafts;

  await checkUserConfig(conf.userConfigPath)
    .catch(async () => {
      console.warn(
        `Config file missing, initializing default config at ${conf.userConfigPath}`,
      );
      await initUserConfig(conf.userConfig, conf.userConfigPath);
    });

  try {
    const parsedConf = JSON.parse(await Deno.readTextFile(conf.userConfigPath));
    conf.userConfig = deepmerge(conf.userConfig, parsedConf);
  } catch {
    console.error("Configuration file error in", conf.userConfigPath);
    Deno.exit(1);
  }

  return conf;
}
