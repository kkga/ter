---
private: true
---

# Todos

- [ ] differentiate internal and external links
- [ ] sanitize markdown output
- [ ] stress-test with
      https://github.com/Zettelkasten-Method/10000-markdown-files
- [[wiki-style]] links?

- add config file

```javascript
export const config = {
  input: new URL("./docs/", git),
  output: new URL("./public/", git),
  git,
  gh,
  ghBlob: new URL("./blob/main/", gh),
  ghTree: new URL("./tree/main/", gh),
  site,
  twitter: new URL("https://twitter.com/mdx_js"),
  oc: new URL("https://opencollective.com/unified"),
  color: "#010409",
  title: "MDX",
  tags: ["mdx", "markdown", "jsx", "oss", "react"],
  author: "MDX contributors",
};
```
