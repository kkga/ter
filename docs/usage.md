# Usage

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed.

Once the `deno` command is available to run in your terminal, proceed to the
initial setup.

## Initial setup

If you want to use an existing folder of markdown files, navigate to it.
Otherwise, create a new directory, go inside, and run Ter's init script:

```
deno run -A --unstable https://deno.land/x/ter/init.ts
```

This will create 2 folders:

- `_views`, which contains the [templates](/templates.md) for rendering the
  site;
- `_assets`, which contains the default CSS stylesheet.

All files inside `_assets` are copied to the output directory as is, so it's a
good place to store any static files that you want to be accessible.

## Build

Once, the initial setup is done, build the site:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

This script takes 2 optional arguments: `input` (default: `.`) and `output`
(default: `_site`).

By default, it will recursively search for all `*.md` files in the current
directory and output the generated site into the `_site` directory.

If your markdown content is in some other directory, or you want a different
name for the output directory, adjust accordingy, for example:
