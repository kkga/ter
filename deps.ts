export { parse as parseFlags } from "https://deno.land/std@0.142.0/flags/mod.ts";

export {
  copy,
  emptyDir,
  ensureDir,
  expandGlob,
  walk,
} from "https://deno.land/std@0.142.0/fs/mod.ts";
export type { WalkEntry } from "https://deno.land/std@0.142.0/fs/mod.ts";

export {
  basename,
  common,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  toFileUrl,
} from "https://deno.land/std@0.142.0/path/mod.ts";

export {
  parse,
  stringify,
} from "https://deno.land/std@0.142.0/encoding/yaml.ts";

export {
  readableStreamFromReader,
  writableStreamFromWriter,
} from "https://deno.land/std@0.142.0/streams/mod.ts";

export { serve } from "https://deno.land/std@0.142.0/http/server.ts";

export {
  normalizeURL,
  parseURL,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
  withTrailingSlash,
} from "https://esm.sh/ufo@0.8.4";
export type { ParsedURL } from "https://esm.sh/ufo@0.8.4";

export {
  compile,
  configure,
  render,
  templates,
} from "https://deno.land/x/eta@v1.12.3/mod.ts";

export { marked } from "https://esm.sh/marked@4.0.16";
export { HighlightJS as hljs } from "https://cdn.skypack.dev/highlight.js";
export { default as fm } from "https://esm.sh/front-matter@4.0.2";
export { default as slugify } from "https://esm.sh/slugify@1.6.5";
export { minify } from "https://esm.sh/html-minifier-terser@7.0.0-beta.0";
export type { Options as MinifyOpts } from "https://esm.sh/html-minifier-terser@7.0.0-beta.0";
// export { default as sanitizeHtml } from "https://esm.sh/sanitize-html@2.7.0"
