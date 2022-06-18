---
title: Usage
---

# Usage

## Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
installed. Once the `deno` command is available to run in your terminal, follow
along.

## Quick start

Navigate to a directory with some markdown files and run:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

This will recursively search for all `*.md` files in the current directory and
generate a site into the `_site` directory.

## Next steps

See [Command line usage](cli.md), [Overview](overview.md) and
[Deploy](deploy.md) for more details.
