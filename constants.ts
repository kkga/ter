export const INDEX_FILENAME = "index.md";
export const RE_HIDDEN_OR_UNDERSCORED = /^\.|^\_|\/\.|\/\_/;

export const HMR_CLIENT = `((l) => {
  let w, i;
  function d(m) { console.info("[refresh] ", m); }
  function r() { l.reload(); }
  function s(f) {
    w && w.close();
    w = new WebSocket(\`\${l.origin.replace("http", "ws")}/refresh\`);
    w.addEventListener("open", f);
    w.addEventListener("message", () => {
      d("reloading...");
      r();
    });
    w.addEventListener("close", () => {
      d("connection lost - reconnecting...");
      clearTimeout(i);
      i = setTimeout(() => s(r), 1000);
    });
  }
  s();
})(location)`;

export const getHelp = (mod_url: string) =>
  `ter
Tiny wiki-style site builder.

USAGE:
  deno run --allow-read --allow-write ${mod_url} [options]

OPTIONS:
  -i, --input\t\tSource directory (default: .)
  -o, --output\t\tOutput directory (default: _site)
  -c, --config\t\tPath to config file (default: .ter/config.json)
  -s, --serve\t\tServe locally and watch for changes (default: false)
  -d, --debug\t\tVerbose output and statistics (default: false)
  --port\t\tServe port (default: 8000)
  --drafts\t\tRender pages marked as drafts (default: false)`;

// highlight.js syntax highlighting from github primer
export const HIGHLIGHT_STYLE = `
.hljs {
  display: block;
  overflow-x: auto;
  color: #cdd9e5;
}

.hljs-comment,
.hljs-punctuation {
  color: #768390;
}

.hljs-attr,
.hljs-attribute,
.hljs-meta,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id {
  color: #6cb6ff;
}

.hljs-variable,
.hljs-literal,
.hljs-number,
.hljs-doctag {
  color: #f69d50;
}

.hljs-params {
  color: #cdd9e5;
}

.hljs-function {
  color: #dcbdfb;
}

.hljs-class,
.hljs-tag,
.hljs-title,
.hljs-built_in {
  color: #8ddb8c;
}

.hljs-keyword,
.hljs-type,
.hljs-builtin-name,
.hljs-meta-keyword,
.hljs-template-tag,
.hljs-template-variable {
  color: #f47067;
}

.hljs-string,
.hljs-undefined {
  color: #96d0ff;
}

.hljs-regexp {
  color: #96d0ff;
}

.hljs-symbol {
  color: #6cb6ff;
}

.hljs-bullet {
  color: #f69d50;
}

.hljs-section {
  color: #6cb6ff;
  font-weight: bold;
}

.hljs-quote,
.hljs-name,
.hljs-selector-tag,
.hljs-selector-pseudo {
  color: #8ddb8c;
}

.hljs-emphasis {
  color: #f69d50;
  font-style: italic;
}

.hljs-strong {
  color: #f69d50;
  font-weight: bold;
}

.hljs-deletion {
  color: #ff938a;
  background-color: #78191b;
}

.hljs-addition {
  color: #8ddb8c;
  background-color: #113417;
}

.hljs-link {
  color: #96d0ff;
  font-style: underline;
}

@media (prefers-color-scheme: light) {
  .hljs {
    display: block;
    overflow-x: auto;
    color: #24292e;
  }

  .hljs-comment,
  .hljs-punctuation {
    color: #6a737d;
  }

  .hljs-attr,
  .hljs-attribute,
  .hljs-meta,
  .hljs-selector-attr,
  .hljs-selector-class,
  .hljs-selector-id {
    color: #005cc5;
  }

  .hljs-variable,
  .hljs-literal,
  .hljs-number,
  .hljs-doctag {
    color: #e36209;
  }

  .hljs-params {
    color: #24292e;
  }

  .hljs-function {
    color: #6f42c1;
  }

  .hljs-class,
  .hljs-tag,
  .hljs-title,
  .hljs-built_in {
    color: #22863a;
  }

  .hljs-keyword,
  .hljs-type,
  .hljs-builtin-name,
  .hljs-meta-keyword,
  .hljs-template-tag,
  .hljs-template-variable {
    color: #d73a49;
  }

  .hljs-string,
  .hljs-undefined {
    color: #032f62;
  }

  .hljs-regexp {
    color: #032f62;
  }

  .hljs-symbol {
    color: #005cc5;
  }

  .hljs-bullet {
    color: #e36209;
  }

  .hljs-section {
    color: #005cc5;
    font-weight: bold;
  }

  .hljs-quote,
  .hljs-name,
  .hljs-selector-tag,
  .hljs-selector-pseudo {
    color: #22863a;
  }

  .hljs-emphasis {
    color: #e36209;
    font-style: italic;
  }

  .hljs-strong {
    color: #e36209;
    font-weight: bold;
  }

  .hljs-deletion {
    color: #b31d28;
    background-color: #ffeef0;
  }

  .hljs-addition {
    color: #22863a;
    background-color: #f0fff4;
  }

  .hljs-link {
    color: #032f62;
    font-style: underline;
  }
}`;
