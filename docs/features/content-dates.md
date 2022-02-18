---
description: Using custom dates in markdown files
---

# Content dates

Ter tries to replicate the content file system on the generated site. And with
that philosophy, the dates displayed on pages and in the
[index lists](index-pages.md) default to file creation date.

To use a custom date, set the `date` key in the
[YAML frontmatter](frontmatter.md) in `YYYY-MM-DD` format.

### Date example

```
---
date: 1995-12-31
---

# My page
```
