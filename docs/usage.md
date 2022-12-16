---
title: Usage
description: How to use and configure Ter.
date: 2022-09-26
dateUpdated: 2022-11-13
pinned: true
toc: true
---

## Quick start

### Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
[installed](https://deno.land/manual/getting_started/installation).

### Build a site

This command will recursively search for `*.md` files in the current directory
and generate a site into the `_site` directory:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

Use `--input`/`--output` flags for custom source/destination directories:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --input pages --output _dist
```

To start a local server with live refresh, pass the `--serve` flag:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```

---

## Command line usage

Run Ter with the `--help` flag to see usage reference.

```
deno run https://deno.land/x/ter/main.ts --help
```

```
Ter -- tiny wiki-style site builder

USAGE:
  ter [options]

OPTIONS:
  --input     Source directory (default: .)
  --output    Output directory (default: _site)
  --config    Path to config file (default: .ter/config.json)
  --serve     Serve locally and watch for changes (default: false)
  --port      Serve port (default: 8080)
  --drafts    Render pages marked as drafts (default: false)
  --debug     Verbose output and statistics (default: false)
```

---

## Configuration

Ter reads a JSON configuration file at `.ter/config.json` before building a
site.

Alternative location can be specified with with the `--config` CLI flag. If the
file does not exist, Ter will create it with default options on first build.

#### Options

| Key           | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| title         | Title of your site.                                                   |
| description   | Description of your site.                                             |
| url           | Published URL address of your site.                                   |
| rootCrumb     | Label used for root crumb label (default: "index").                   |
| authorName    | Your name.                                                            |
| authorEmail   | Your email.                                                           |
| authorUrl     | Your home page.                                                       |
| lang          | Optional. [Locale][locale] used for formatting dates.                 |
| navLinks      | Optional. Object of navigation links in form of `{label: path, ...}`. |
| codeHighlight | Optional. Use syntax highlighting in code blocks (default: false).    |
| head          | Optional. String to inject at the bottom of `<head>` tag.             |

[locale]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument

#### Example

```json
{
  "title": "Your Blog Name",
  "description": "I am writing about my experiences as a naval navel-gazer",
  "url": "https://example.com/",
  "rootCrumb": "index",
  "authorName": "Your Name Here",
  "authorEmail": "youremailaddress@example.com",
  "authorUrl": "https://example.com/about-me/",
  "lang": "en",
  "navLinks": { "about": "/about", "contact": "/contact" },
  "codeHighlight": true,
  "head": "<script src='https://microanalytics.io/js/script.js' id='XXXXXXXX'></script>"
}
```

---

## Content

### Index pages

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

If a directory contains an `index.md` file, its content will be injected into
the rendered `index.html` above the index list. This can be useful for
describing what the directory content is about or calling out individual pages.

#### Index sorting

Items in the index are sorted in the following order:

1. files with `pinned: true` in the [frontmatter](#markdown-frontmatter) are
   listed at the top and get an ★ symbol;
2. directories (child index pages);
3. rest of markdown files, sorted by [date](#dates).

### Markdown frontmatter

Ter extracts [YAML frontmatter](https://jekyllrb.com/docs/front-matter/)
delimited by `---` from markdown files. Here’s an example:

```yaml
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

Some properties are utilized when building a site. All of them are optional.

| Property        | Default  | Description                                                              |
| --------------- | -------- | ------------------------------------------------------------------------ |
| title           |          | Page title                                                               |
| description     |          | Page description                                                         |
| tags            |          | Page tags                                                                |
| date            |          | Page publish date in YYYY-MM-DD format                                   |
| dateUpdated     |          | Page last update date in YYYY-MM-DD format                               |
| pinned          | `false`  | Page is listed at the top of [index lists](#index-pages)                 |
| unlisted        | `false`  | Page is excluded from all [index lists](#index-pages)                    |
| draft           | `false`  | File is [ignored](#ignoring-files) during site generation                |
| layout          | `"list"` | Layout of the [index list](#index-pages); can be `list`, `log` or `grid` |
| toc             | `false`  | Table of contents                                                        |
| showHeader      | `true`   | Page header with title, description, date and tags                       |
| showTitle       | `true`   | Page title                                                               |
| showDescription | `true`   | Page description                                                         |
| showMeta        | `true`   | Page date and tags                                                       |

### Ignoring files

Any files and folders that start with an `_` or `.` (hidden) are ignored. For
example, if there is a `_drafts` folder in the content directory, it will be
skipped during site generation.

In addition, any markdown file with `draft: true` in the
[frontmatter](#markdown-frontmatter) will be ignored. To render files with
`draft: true`, pass `--drafts` flag to the main command. For example:

```sh
deno run -A --unstable https://deno.land/x/ter/main.ts --serve --drafts
```

### Dead internal links

Ter automatically finds non-working internal links and lets you know about them
after building a site. Here's an example output:

```
[...]
Dead links:
/overview -> /non-existent-page-name
/overview -> /some-dead-link
```

---

## Deploy

Ter generates a static site which can be deployed anywhere.

<details open>
<summary>Note</summary>
If using non-default input and output folders, update the build command
and output directory accordingly.
</details>

### Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration.

#### Build command

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

#### Output directory

```
_site
```

#### Install command

```
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh
```

### Deno Deploy

For [Deno Deploy](https://deno.com/deploy), we can use a GitHub Action to
automatically build the site and then deploy it with Deno's
[deployctl](https://github.com/denoland/deployctl/blob/main/action/README.md).

Firstly, create a new project on Deno Deploy. Select "Deploy from GitHub", link
the repository, and use the production branch. For deployment mode, select
“GitHub Actions”.

Next, create a `.github/workflows/deno-deploy.yml` file in the repository and
make changes according to your setup.

#### GitHub Action (deno-deploy.yml)

```yaml
name: Deploy to Deno Deploy

on:
  push:
    # Change if using a different production branch
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Clone repository
        uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1.1.0

      - name: Build site
        # Change if using non-default input/output directories
        run: deno run -A --unstable main.ts

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          # Replace with the project name on Deno Deploy
          project: my-ter-site
          entrypoint: https://deno.land/std/http/file_server.ts
          # Change if using non-default output directory
          root: _site
```
