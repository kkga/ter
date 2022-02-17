---
description: Adding metadata to pages
---

# Frontmatter

Ter extracts [YAML frontmatter](https://jekyllrb.com/docs/front-matter/)
delimited by `---` from markdown files.

Here's an example:

```
---
title: My page
description: Here's my description
date: 2022-01-29
tags:
  - myTag
  - otherTag
property: value
---

## My content
```

## Special properties

Some properties are utilized when building a site.

| Property      | Description                                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| `title`       | used for page title, see [titles](titles.md)                                   |
| `description` | used for page description                                                      |
| `date`        | used for date, if exists                                                       |
| `tags`        | used for [tags](./tags.md)                                                     |
| `pinned`      | if set to `true`, page is listed at the top of [index lists](./index-pages.md) |
| `draft`       | if set to `true`, file is [ignored](./ignored-files.md) during site generation |
| `private`     | same as `draft`                                                                |

## Other properties

All other properties are ignored but can be used in
[templates](/customize.md#templates).
