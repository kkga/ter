---
description: How to publish on the web
pinned: true
tags:
  - haha
  - yo
---

# Deploy

Learn how to publish the output on the web.

## Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration:

```
Build Command:
deno run -A --unstable https://deno.land/x/ter/main.ts

Output Directory:
_site

Install Command:
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh
```

If you're using non-default input and output folders, update the build command
and output directory accordingly, e.g.:

```
Build Command:
deno run -A --unstable https://deno.land/x/ter/main.ts content _dist

Output Directory:
_dist
```
