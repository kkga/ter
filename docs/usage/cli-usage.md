---
title: Command line usage
description: How to use Ter from the command line.
date: 2022-22-18
tags:
    - usage
---

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
