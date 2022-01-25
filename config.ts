export interface TerConfig {
  inputPath: string;
  outputPath: string;
  staticPath: string;
  viewsPath: string;
  title: string;
  ignoreKeys: Array<string>;
}

export const defaultConfig: TerConfig = {
  inputPath: Deno.cwd(),
  outputPath: `${Deno.cwd()}/_site/`,
  staticPath: `${Deno.cwd()}/_static/`,
  viewsPath: `${Deno.cwd()}/_views/`,
  title: "Ter wiki",
  ignoreKeys: ["private", "draft"],
};
