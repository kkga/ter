---
title: Usage
description: How to use and configure Ter.
date: 2022-09-26
dateUpdated: 2022-10-30
pinned: true
toc: true
---

## Quick start

### Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed. Once the `deno` command is available to run in your terminal, follow
along.

### Build a site

Navigate to a directory with some markdown files and run Ter to build a site.

This command will recursively search for all `*.md` files in the current
directory and generate a site into the `_site` directory:

```sh
deno run -A --unstable https://deno.land/x/ter/main.ts
```

If your markdown files are not in root directory, or if you want a different
name for the output directory, adjust accordingy, for example:

```sh
deno run -A --unstable https://deno.land/x/ter/main.ts --input pages --output _dist
```

To start a local server with live refresh, pass the `--serve` flag:

```sh
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```

## Command line usage

Run Ter with the `--help` flag to see usage reference.

```sh
deno run https://deno.land/x/ter/main.ts --help
```

```sh
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
  --quiet     Do not list generated files (default: false)
```

## Configuration

Configuration options can be specified in `.ter/config.json` from the root
directory or in any `json` file specified with `--config` flag when running Ter.

If the file does not exist, an example configuration file is created before
building.

### Options

| Key                | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `site.title`       | Title of your site.                                            |
| `site.description` | Description of your site.                                      |
| `site.url`         | Published URL address of your site.                            |
| `site.rootCrumb`   | Label used for root crumb label (default: "index").            |
| `author.name`      | Your name.                                                     |
| `author.email`     | Your email.                                                    |
| `author.url`       | Your home page.                                                |
| `navigation`       | Optional. Object of navigation items in form of `label: path`. |
| `locale.date`      | Optional. Locale used for formatting dates.                    |

### Example

```json
{
  "site": {
    "title": "Your Blog Name",
    "description": "I am writing about my experiences as a naval navel-gazer",
    "url": "https://example.com/",
    "rootCrumb": "index"
  },
  "author": {
    "name": "Your Name Here",
    "email": "youremailaddress@example.com",
    "url": "https://example.com/about-me/"
  },
  "navigation": {
    "about": "/about",
    "contact": "/contact"
  },
  "locale": {
    "date": "en-US"
  }
}
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

1. files with `pinned: true` in the [frontmatter](#markdown-frontmatter) are
   listed at the top and get an ★ symbol;
2. directories (child index pages);
3. rest of markdown files, sorted by [date](#dates).

If the source directory contains an `index.md` file, its content will be
injected into the rendered `index.html` above the index list. This can be useful
for describing what the directory content is about or calling out individual
pages.

## Markdown frontmatter

Ter extracts [YAML frontmatter](https://jekyllrb.com/docs/front-matter/)
delimited by `---` from markdown files. Here’s an example:

```markdown
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

...
```

Some properties are utilized when building a site. All of them are optional.

| Property      | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `title`       | used for page title                                                          |
| `description` | used for page description                                                    |
| `tags`        | used for tags                                                                |
| `date`        | publish date in YYYY-MM-DD format                                            |
| `dateUpdated` | update date in YYYY-MM-DD format                                             |
| `pinned`      | if `true`, page is listed at the top of [index lists](#index-pages)          |
| `draft`       | if `true`, file is [ignored](#ignoring-files) during site generation         |
| `log`         | if `true` on an index page (`index.md`), all child pages are rendered inline |
| `toc`         | if `true`, page renders table of contents at the top                         |

[//]: # "TODO: rename hideTitle"

All other properties are ignored but can be used in
[templates](customization.md#templates).

## Ignoring files

Any files and folders that start with an `_` or `.` (hidden) are ignored. For
example, if there is a `_drafts` folder in the content directory, it will be
skipped during site generation.

In addition, any markdown file with `draft: true` in the
[frontmatter](#markdown-frontmatter) will be ignored. To render files with
`draft: true`, pass `--drafts` flag to the main command. For example:

```sh
deno run -A --unstable https://deno.land/x/ter/main.ts --serve --drafts
```

## Dead internal links

Ter automatically finds non-working internal links and lets you know about them
after building a site. Here's an example output:

```sh
[...]
Dead links:
/overview -> /non-existent-page-name
/overview -> /some-dead-link
```

## Deploy

Ter generates a static site which can be deployed anywhere.

### Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration.

<details open>
<summary>Note</summary>
If using non-default input and output folders, update the build command
and output directory accordingly.
</details>

```sh
# Build command
deno run -A --unstable https://deno.land/x/ter/main.ts

# Output directory
_site

# Install command
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

GitHub Action (deno-deploy.yml):

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
