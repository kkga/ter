# Frontmatter

Minmi extracts [YAML front matter](https://jekyllrb.com/docs/front-matter/)
delimited by `---` from markdown files.

Here's an example:

```
---
title: My page
description: Here's my description
date: 2022-01-29
property: value
tags:
 - one
 - two
 - three
---

## My content
```

## Special properties

Some properties are utilized when building a site.

- `title` -- used for page title, see [titles](titles.md)
- `description` -- used for page description
- `date` -- used for date, if exists
- `tags` -- used to display a list of tags on the index page

## Other properties

All other properties are ignored but can be used in
[custom templates](customize/templates.md).
