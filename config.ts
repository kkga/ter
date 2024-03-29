import { deepmerge } from "./deps/deepmerge.ts";
import { path, fs } from "./deps/std.ts";
import { BuildConfig, UserConfig } from "./types.d.ts";

const defaultUserConfig: UserConfig = {
  title: "Your Blog Name",
  description: "I am writing about my experiences as a naval navel-gazer",
  url: "https://example.com/",
  rootCrumb: "~",
  authorName: "Your Name Here",
  authorEmail: "youremailaddress@example.com",
  authorUrl: "https://example.com/about-me/",
  lang: "en",
  codeHighlight: false,
  head: "",
};

export const defaultBuildConfig: BuildConfig = {
  inputPath: Deno.cwd(),
  outputPath: path.join(Deno.cwd(), "_site"),
  userConfigPath: path.join(Deno.cwd(), ".ter/config.json"),
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

const checkUserConfig = async (configPath: string): Promise<boolean> => {
  const filepath = path.isAbsolute(configPath)
    ? configPath
    : path.join(Deno.cwd(), configPath);
  await Deno.stat(filepath).catch(() => Promise.reject(filepath));
  return Promise.resolve(true);
};

const initUserConfig = (config: UserConfig, configPath: string) => {
  fs.ensureDirSync(path.dirname(configPath));
  Deno.writeTextFileSync(configPath, JSON.stringify(config, null, 2));
};

interface CreateConfigOpts {
  configPath: string | undefined;
  inputPath: string | undefined;
  outputPath: string | undefined;
  renderDrafts: boolean;
}

export const createConfig = async (
  opts: CreateConfigOpts
): Promise<BuildConfig> => {
  const { isAbsolute, join } = path;

  if (opts.configPath && opts.configPath != "") {
    defaultBuildConfig.userConfigPath = isAbsolute(opts.configPath)
      ? opts.configPath
      : join(Deno.cwd(), opts.configPath);
  }

  if (opts.inputPath && opts.inputPath != "") {
    defaultBuildConfig.inputPath = isAbsolute(opts.inputPath)
      ? opts.inputPath
      : join(Deno.cwd(), opts.inputPath);
  }

  if (opts.outputPath && opts.outputPath != "") {
    defaultBuildConfig.outputPath = isAbsolute(opts.outputPath)
      ? opts.outputPath
      : join(Deno.cwd(), opts.outputPath);
  }

  defaultBuildConfig.renderDrafts = opts.renderDrafts;

  await checkUserConfig(defaultBuildConfig.userConfigPath).catch(() => {
    console.warn(
      `Config file missing, initializing default config at ${defaultBuildConfig.userConfigPath}`
    );
    initUserConfig(
      defaultBuildConfig.userConfig,
      defaultBuildConfig.userConfigPath
    );
  });

  try {
    const parsedConf = JSON.parse(
      await Deno.readTextFile(defaultBuildConfig.userConfigPath)
    );
    defaultBuildConfig.userConfig = deepmerge(
      defaultBuildConfig.userConfig,
      parsedConf
    );
  } catch (err) {
    console.error(
      "Possibly error in config file:",
      defaultBuildConfig.userConfigPath
    );
    console.error(err);
    Deno.exit(1);
  }

  return defaultBuildConfig;
};
