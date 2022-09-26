---
title: Usage
date: 2022-09-26
toc: true
---

# Usage

## Quick start

### Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed. Once the `deno` command is available to run in your terminal, follow
along.

### Build a site

Navigate to a directory with some markdown files and run Ter to build a site.

This command will recursively search for all `*.md` files in the current
directory and generate a site into the `_site` directory:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
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
  --config    Path to config file (default: .ter/config.yml)
  --serve     Serve locally and watch for changes (default: false)
  --port      Serve port (default: 8080)
  --drafts    Render pages marked as drafts (default: false)
  --quiet     Do not list generated files (default: false)
```

### Changing input and output paths

Ter takes 2 optional arguments:

- `--input` (default: `.`)
- `--output` (default: `_site`)

If your markdown files are in some other directory, or if you want a different
name for the output directory, adjust accordingy, for example:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --input pages --output _dist
```

### Local server with live refresh

Passing `--serve` flag will start a local server. Ter will automatically rebuild
the site and refresh the browser on any file changes.

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```

---

## Deploy

Ter generates a static site which can be deployed anywhere.

### Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration:

```sh
# build command
deno run -A --unstable https://deno.land/x/ter/main.ts

# output directory
_site

# install command
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh
```

If you're using non-default input and output folders, update the build command
and output directory accordingly, e.g.:

```sh
# build command
deno run -A --unstable https://deno.land/x/ter/main.ts --input content --output _dist

# output directory
_dist
```

### Deno Deploy (via GitHub Actions)

For [Deno Deploy](https://deno.com/deploy), we can use a GitHub Action to
automatically build the site and then deploy it with Deno's
[deployctl](https://github.com/denoland/deployctl/blob/main/action/README.md).

#### Create a new project on Deno Deploy

Select "Deploy from GitHub", link the repository, and use the production branch.
For deployment mode, select “GitHub Actions”.

#### Set up a GitHub Action

Create a `.github/workflows/deno-deploy.yml` file in site source directory, make
changes according to your setup and commit it:

```yaml
name: Deploy to Deno Deploy

on:
  push:
    # Change if using a different production branch
    branches: [ main ]
  pull_request:
    # ^ same here
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

## Next steps

See [Overview](overview.md) and [Deploy](deploy.md) for more details.
