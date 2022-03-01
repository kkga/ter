---
description: How to build a Ter site
pinned: true
---

# Usage

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed.

Once the `deno` command is available to run in your terminal, follow along.

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
```

## Initial setup and build

If you want to use an existing folder of markdown files, navigate to it.
Otherwise, create a new directory, go inside, and run Ter for the first time:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

Ter will check for required views and assets. If it can't find any, it will
prompt to fetch required files and create default site configuration:

- `.ter/config.yml`: site [configuration](configuration.md) file;
- `.ter/views`: [templates](customize.md#templates) for rendering the site;
- `.ter/assets`: [stylesheets](customize.md#styles) for the site and code
  syntax.

Once the initialization is done, Ter will carry on building the site.

## Changing input and output paths

The build script takes 2 optional arguments: `--input` (default: `.`) and
`--output` (default: `_site`).

By default, it recursively searches for all `*.md` files in the current
directory and outputs the generated site into the `_site` directory.

If your markdown content is in some other directory, or you want a different
name for the output directory, adjust accordingy, for example:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --input content --output _dist
```

## Local server with live refresh

Passing `--serve` flag will start a local server. Ter will automatically rebuild
the site and refresh the browser on any file changes.

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```

## Next steps

If you want to publish the site, see the [Deploy](/deploy.md) page. If you're
looking to customize the output, see the docs on [Customization](/customize).
