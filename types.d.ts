export interface UserConfig {
  site: {
    title: string;
    description: string;
    url: string;
    rootCrumb: string;
  };
  author: { name: string; email: string; url: string };
  navigation?: Record<string, string>;
  locale?: {
    date?: string;
  };
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
  renderDrafts: boolean;
}

export interface Crumb {
  slug: string;
  url: string;
  current: boolean;
  isTag?: boolean;
}

export interface Heading {
  text: string;
  level: number;
  slug: string;
}

export interface Page {
  url: URL;
  isIndex: boolean;
  pinned: boolean;
  ignored: boolean;
  showToc: boolean;
  layout: "default" | "log";
  hideTitle: boolean;
  title?: string;
  body?: string;
  path?: string;
  description?: string;
  attrs?: Record<string, unknown>;
  links?: Array<URL>;
  datePublished?: Date;
  dateUpdated?: Date;
  html?: string;
  tags?: Array<string>;
  headings?: Array<Heading>;
}

export interface OutputFile {
  inputPath?: string;
  filePath: string;
  fileContent?: string;
}

// interface TagPage {
//   name: string;
//   pages: Array<Page>;
// }
