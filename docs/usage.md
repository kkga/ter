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
  --quiet     Don't list filenames (default: false)
```

## Initial setup and build

Run the following command inside a directory with markdown files.

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

Before building, Ter checks for [configuration](configuration.md) file at
`.ter/config.yml`. If it doesn't exist, ter will initialize an example
configuration file which you can edit.

## Changing input and output paths

The takes 2 optional arguments: `--input` (default: `.`) and `--output`
(default: `_site`).

By default, it recursively searches for all `*.md` files in the current
directory and outputs the generated site into the `_site` directory.

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

## Next steps

If you want to publish the site, see the [Deploy](deploy.md) page. If you're
looking to customize the output, see the docs on [Customization](customize.md).
