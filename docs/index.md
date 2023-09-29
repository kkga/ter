---
title: Ter
description: Tiny wiki-style site builder.
---

Ter takes a folder of markdown files and replicates its structure into a static
site with automatically [indexed](usage/2022-12-18-content.md) directories and
backlinks. [Zettelkasten](zettelkasten.md)-style.

Run this to compile all .md files in the current directory to HTML (requires
[Deno](https://deno.land) to be installed):

```
deno run -A https://deno.land/x/ter/main.ts
```

- see [usage](usage) for more details;
- [goals](goals) for some thinking behind Ter's approach;
- or feel free to just roam around.

Made with [Deno](https://deno.land). Deno is fun. Contribute or submit issues:
[github.com/kkga/ter](https://github.com/kkga/ter)
