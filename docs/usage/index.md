---
title: Usage
---

# Usage

## Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed. Once the `deno` command is available to run in your terminal, follow
along.

## Quick start

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

## Next steps

See [Command line usage](cli.md), [Overview](overview.md) and
[Deploy](deploy.md) for more details.
