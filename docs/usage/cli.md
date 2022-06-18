# Command line usage

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
