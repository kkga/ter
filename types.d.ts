export interface UserConfig {
  title: string;
  description: string;
  url: string;
  rootCrumb: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  codeHighlight: boolean;
  lang: Intl.LocalesArgument;
  head: string;
}

export interface BuildConfig {
  inputPath: string;
  outputPath: string;
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

export interface PageData {
  body?: string;
  attrs?: JSONValue;
  datePublished?: Date;
  dateUpdated?: Date;
  title?: string;
  description?: string;
  tags?: string[];
  pinned?: boolean;
  ignored?: boolean;
  unlisted?: boolean;
  layout?: "log" | "grid" | "list";
  showHeader?: boolean;
  showToc?: boolean;
  thumbnailUrl?: URL;
}

export interface Page extends PageData {
  url: URL;
  html?: string;
  headings?: Heading[];
  links?: URL[];
  index?: "dir" | "tag";
}

export interface JSONValue {
  [key: string]:
    | string
    | number
    | boolean
    | { [key: string]: JSONValue }
    | Array<JSONValue>;
}
