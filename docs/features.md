---
pinned: true
---

# Features

## Index pages

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

### Index sorting

Items in the index are sorted in the following order:

1. files with `pinned: true` in the [frontmatter](features#frontmatter) are
   listed at the top and get an ★ symbol;
2. directories (child index pages);
3. rest of markdown files, sorted by [date](features#content-dates).

### Markdown in index files

If the source directory contains an `index.md` file, its content will be
injected into the rendered `index.html` above the index list. This can be useful
for describing what the directory content is about or additionally calling out
individual pages from the index.

## Backlinks

Ter adheres to the [Zettelksten](/zettelkasten.md) method and tracks connections
between pages.

All internal references to the current page are listed in the Backlinks section
at the bottom.

## Frontmatter

Ter extracts [YAML frontmatter](https://jekyllrb.com/docs/front-matter/)
delimited by `—` from markdown files.

Here’s an example:

```
—
title: My page
description: Here’s my description
date: 2022-01-29
tags:
  - myTag
  - otherTag
property: value
—

## My content
```

### Special properties

Some properties are utilized when building a site.

| Property      | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `title`       | used for page title, see [titles](#titles)                                  |
| `description` | used for page description                                                   |
| `date`        | used for date, if exists                                                    |
| `tags`        | used for [tags](#tags)                                                      |
| `pinned`      | if set to `true`, page is listed at the top of [index lists](#index-pages)  |
| `draft`       | if set to `true`, file is [ignored](#ignoring-files) during site generation |
| `unlisted`    | same as `draft`                                                             |

### Other properties

All other properties are ignored but can be used in
[templates](/customize.md#templates).

## Ignoring files

Any files and folders that start with an `_` or `.` (hidden) are ignored.

For example, if there is a `_drafts` folder in the content directory, it will be
skipped during site generation.

In addition, it’s also possible to ignore individual markdown files by setting
either `unlisted: true` or `draft: true` in the
[YAML frontmatter](#frontmatter).

## Content dates

Ter tries to replicate the content file system on the generated site. And with
that philosophy, the dates displayed on pages and in the
[index lists](#index-pages) default to file creation date.

To use a custom date, set the `date` key in the [YAML frontmatter](#frontmatter)
in `YYYY-MM-DD` format.

### Date example

```
—
date: 1995-12-31
—

# My page
```

## Breadcrumbs

TODO

## Tags

TODO

## Page titles

TODO
