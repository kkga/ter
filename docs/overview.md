---
pinned: true
toc: true
---

# Overview

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed.

Once the `deno` command is available to run in your terminal, follow along.

## Building a site

Run the following command inside a directory with markdown files.

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

This command will recursively search for all `*.md` files in the current
directory and generate a site into the `_site` directory.

## Changing input and output paths

Ter takes 2 optional arguments:

- `--input` (default: `.`)
- `--output` (default: `_site`)

If your markdown files are in some other directory, or if you want a different
name for the output directory, adjust accordingy, for example:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --input pages --output _dist
```

## Local server with live refresh

Passing `--serve` flag will start a local server. Ter will automatically rebuild
the site and refresh the browser on any file changes.

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```

## Deploy

If you want to publish the site, see the [Deploy](deploy.md) page. If you're
looking to customize the output, see the docs on [Customization](customize.md).

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

## Command line usage

Run Ter with the `--help` flag to see usage reference.

```
deno run https://deno.land/x/ter/main.ts --help
```

```
Ter -- tiny wiki-style site builder.

USAGE:
  ter [options]

OPTIONS:
  --input     Source directory (default: ./)
  --output    Output directory (default: ./_site)
  --serve     Serve locally and watch for changes (default: false)
  --port      Serve port (default: 8080)
  --quiet     Don't list filenames (default: false)
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

Ter adheres to the [Zettelksten](zettelkasten.md) method and tracks connections
between pages. All internal references to the current page are listed in the
Backlinks section at the bottom.

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

| Property      | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `title`       | used for [page title](#titles)                                              |
| `description` | used for page description                                                   |
| `date`        | used for [date](#dates)                                                     |
| `tags`        | used for [tags](#tags)                                                      |
| `pinned`      | if set to `true`, page is listed at the top of [index lists](#index-pages)  |
| `toc`         | if set to `true`, page renders table of contents at the top                 |
| `draft`       | if set to `true`, file is [ignored](#ignoring-files) during site generation |
| `unlisted`    | same as `draft`                                                             |

### Other properties

All other properties are ignored but can be used in
[templates](customize.md#templates).

## Ignoring files

Any files and folders that start with an `_` or `.` (hidden) are ignored. For
example, if there is a `_drafts` folder in the content directory, it will be
skipped during site generation.

In addition, it’s possible to ignore individual markdown files by setting either
`unlisted: true` or `draft: true` in the [YAML frontmatter](#frontmatter).

## Dates

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

## Tags

TODO

## Titles

TODO
