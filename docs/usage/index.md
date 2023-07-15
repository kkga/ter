---
title: Usage
description: How to use and configure Ter.
date: 2022-09-26
dateUpdated: 2022-12-18
pinned: true
---

## Install deno

Ter is built with [Deno](https://deno.land/), so you'll need to have it
[installed](https://deno.land/manual/getting_started/installation).

## Build a site

Default command will recursively search for `*.md` files in the current
directory and generate a site into the `_site` directory:

```
deno run -A https://deno.land/x/ter/main.ts
```

Use `--input` and `--output` (or `-i` and `-o`) flags for custom
source/destination directories:

```
deno run -A https://deno.land/x/ter/main.ts -i pages -o _dist
```

To start a local server with live refresh, pass the `--serve` (or `-s`) flag:

```
deno run -A https://deno.land/x/ter/main.ts -s
```
