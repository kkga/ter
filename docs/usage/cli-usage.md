---
title: Command line usage
description: How to use Ter from the command line.
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
  -i, --input     Source directory (default: .)
  -o, --output    Output directory (default: _site)
  -c, --config    Path to config file (default: .ter/config.json)
  -s, --serve     Serve locally and watch for changes (default: false)
  -d, --debug     Verbose output and statistics (default: false)
  --port          Serve port (default: 8000)
  --drafts        Render pages marked as drafts (default: false)`;
```
