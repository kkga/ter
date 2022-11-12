export interface UserConfig {
  title: string;
  description: string;
  url: string;
  rootCrumb: string;
  lang?: string;
  author_name: string;
  author_email: string;
  author_url: string;
  nav_links?: Record<string, string>;
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
  html?: string;
  links?: URL[];
  headings?: Heading[];
  index?: "dir" | "tag";
  layout?: "log";
  pinned?: boolean;
  ignored?: boolean;
  unlisted?: boolean;
  showHeader?: boolean;
  showToc?: boolean;
  showTitle?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
}
