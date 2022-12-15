import { deepmerge, dirname, ensureDirSync, isAbsolute, join } from "./deps.ts";
import { BuildConfig, UserConfig } from "./types.d.ts";

const defaultUserConfig: UserConfig = {
  title: "Your Blog Name",
  description: "I am writing about my experiences as a naval navel-gazer",
  url: "https://example.com/",
  rootCrumb: "index",
  authorName: "Your Name Here",
  authorEmail: "youremailaddress@example.com",
  authorUrl: "https://example.com/about-me/",
  lang: "en",
  codeHighlight: false,
  navLinks: {},
  head: "",
};

const defaultBuildConfig: BuildConfig = {
  inputPath: Deno.cwd(),
  outputPath: join(Deno.cwd(), "_site"),
  userConfigPath: join(Deno.cwd(), ".ter/config.json"),
  ignoreKeys: ["draft"],
  staticExts: [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
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

function initUserConfig(config: UserConfig, configPath: string) {
  ensureDirSync(dirname(configPath));
  Deno.writeTextFileSync(configPath, JSON.stringify(config, null, 2));
}

interface CreateConfigOpts {
  configPath: string | undefined;
  inputPath: string | undefined;
  outputPath: string | undefined;
  renderDrafts: boolean;
}

export async function createConfig(
  opts: CreateConfigOpts
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

  await checkUserConfig(conf.userConfigPath).catch(() => {
    console.warn(
      `Config file missing, initializing default config at ${conf.userConfigPath}`
    );
    initUserConfig(conf.userConfig, conf.userConfigPath);
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
