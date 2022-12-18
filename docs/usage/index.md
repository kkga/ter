---
title: Usage
description: How to use and configure Ter.
date: 2022-09-26
dateUpdated: 2022-12-18
pinned: true
layout: grid
---

### Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
[installed](https://deno.land/manual/getting_started/installation).

### Build a site

Default command will recursively search for `*.md` files in the current
directory and generate a site into the `_site` directory:

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

Use `--input` and `--output` flags for custom source/destination directories:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --input pages --output _dist
```

To start a local server with live refresh, pass the `--serve` flag:

```
deno run -A --unstable https://deno.land/x/ter/main.ts --serve
```
