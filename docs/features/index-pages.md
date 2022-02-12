---
description: Overview of index page generation
---

# Index pages

Ter recursively recreates the source file system on the rendered site and each
directory gets an index file listing its content.

For example, if the source looks like this:

```
content
├── index.md
├── about-me.md
└── life
    ├── failed-startup-ideas.md
    └── thoughts-on-life.md
```

... the `life` directory will get an `life/index.html` page with an index of its
content.

## Index sorting

Items in the index are sorted in the following order:

1. files with `pinned: true` in the [frontmatter](./frontmatter.md) are listed
   at the top and get an ★ symbol;
2. directories (child index pages);
3. rest of markdown files, sorted by [date](./content-dates.md).

## Markdown in index files

If the source directory contains an `index.md` file, its content will be
injected into the rendered `index.html` above the index list. This can be useful
for describing what the directory content is about or additionally calling out
individual pages from the index.
