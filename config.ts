export interface TerConfig {
  inputPath: string;
  outputPath: string;
  staticPath: string;
  viewsPath: string;
  title: string;
  description: string;
  ignoreKeys: Array<string>;
}

export const defaultConfig: TerConfig = {
  inputPath: ".",
  outputPath: "_site",
  staticPath: "_static",
  viewsPath: "_views",
  title: "Ter wiki",
  description: "A tiny wiki-style site builder with Zettelkasten flavor",
  ignoreKeys: ["private", "draft"],
};
