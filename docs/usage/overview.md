---
toc: true
---

# Overview

## Site configuration

Before building, Ter checks for configuration file at `.ter/config.yml`. If it
doesn't exist, an example configuration file will be initialized before
building.

At the moment, the following configuration options are available:

```yaml
# Site title: used in HTML title tags and in feeds
title: Ter

# Site description: used in HTML description tags and in feeds
description: A tiny wiki-style site builder with Zettelkasten flavor.

# Root name: used for root breadcrumb label
rootName: index

# URL: used in feed
url: https://ter.kkga.me/

# Author name: used in feeds
author:
  name: Gadzhi Kharkharov
  email: x@kkga.me
  url: https://kkga.me
```

## Index pages

Ter recursively recreates the source file system on the rendered site and each
directory gets an index file listing its content. For example, if the source
looks like this:

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

### Index sorting

Items in the index are sorted in the following order:

1. files with `pinned: true` in the [frontmatter](#frontmatter) are listed at
   the top and get an ★ symbol;
2. directories (child index pages);
3. rest of markdown files, sorted by [date](#dates).

### Markdown in index files

If the source directory contains an `index.md` file, its content will be
injected into the rendered `index.html` above the index list. This can be useful
for describing what the directory content is about or additionally calling out
individual pages from the index.

## Backlinks

Ter adheres to the [Zettelkasten](/zettelkasten.md) method and tracks
connections between pages. All internal references to the current page are
listed in the Backlinks section at the bottom.

## Frontmatter

Ter extracts [YAML frontmatter](https://jekyllrb.com/docs/front-matter/)
delimited by `---` from markdown files. Here’s an example:

```
---
title: My page
description: Here’s my description
date: 2022-01-29
tags:
  - myTag
  - otherTag
property: value
---

## My content
```

### Special properties

Some properties are utilized when building a site.

| Property      | Description                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| `title`       | used for [page title](#titles)                                                      |
| `description` | used for page description                                                           |
| `tags`        | used for [tags](#tags)                                                              |
| `date`        | date in YYYY-MM-DD format                                                           |
| `pinned`      | if set to `true`, page is listed at the top of [index lists](#index-pages)          |
| `draft`       | if set to `true`, file is [ignored](#ignoring-files) during site generation         |
| `toc`         | if set to `true`, page renders table of contents at the top                         |
| `log`         | if set to `true` on an index page (`index.md`), all child pages are rendered inline |

### Other properties

All other properties are ignored but can be used in
[templates](customize.md#templates).

## Ignoring files

Any files and folders that start with an `_` or `.` (hidden) are ignored. For
example, if there is a `_drafts` folder in the content directory, it will be
skipped during site generation.

### Draft pages

In addition, any markdown file with `draft: true` in the
[frontmatter](#frontmatter) will be ignored.

### Rendering draft pages

To render files with `draft: true`, pass `--drafts` flag to the main command.
For example:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve --drafts
```

## Tags

### Tags example

```
---
title: My page
tags:
  - myTag
  - otherTag
---

## My content
```

## Dead internal links

Ter automatically finds non-working internal links and lets you know about them
after building a site. Here's an example output:

```
[...]
---
Dead links:
/overview -> /non-existent-page-name
/overview -> /some-dead-link
---
20 pages
2 static files
Done in 29ms
```

## Breadcrumbs

TODO

## Titles

TODO
