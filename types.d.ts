export interface UserConfig {
  site: {
    title: string;
    description: string;
    url: string;
    rootCrumb: string;
  };
  author: { name: string; email: string; url: string };
  navigation?: Record<string, string>;
  locale?: { date?: string };
  head?: string;
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

export interface JSONValue {
  [key: string]:
    | string
    | number
    | boolean
    | { [key: string]: JSONValue }
    | Array<JSONValue>;
}

export interface Page {
  url: URL;
  title?: string;
  description?: string;
  attrs?: JSONValue;
  datePublished?: Date;
  dateUpdated?: Date;
  tags?: string[];
  body?: string;
  path?: string;
  html?: string;
  links?: URL[];
  headings?: Heading[];
  index?: "dir" | "tag";
  layout?: "log";
  pinned?: boolean;
  ignored?: boolean;
  showHeader?: boolean;
  showToc?: boolean;
  showTitle?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
}

export interface OutputFile {
  inputPath?: string;
  filePath: string;
  fileContent?: string;
}
