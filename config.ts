import { deepmerge } from "deepmerge";
import { ensureDir } from "$std/fs/ensure_dir.ts";
import { dirname, isAbsolute, join } from "$std/path/mod.ts";
import { BuildConfig, UserConfig } from "./types.d.ts";

const defaultUserConfig: UserConfig = {
  title: "Your Blog Name",
  description: "I am writing about my experiences as a naval navel-gazer",
  url: "https://example.com/",
  rootCrumb: "index",
  author_name: "Your Name Here",
  author_email: "youremailaddress@example.com",
  author_url: "https://example.com/about-me/",
  nav_links: {},
};

const defaultBuildConfig: BuildConfig = {
  inputPath: Deno.cwd(),
  outputPath: join(Deno.cwd(), "_site"),
  assetsPath: join(Deno.cwd(), ".ter/assets"),
  viewsPath: join(Deno.cwd(), ".ter/views"),
  userConfigPath: join(Deno.cwd(), ".ter/config.json"),
  pageView: "",
  feedView: "",
  style: "",
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
