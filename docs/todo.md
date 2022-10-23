---
draft: true
---

# Todos

## preact rendering

- [ ] fix log layout
- [ ] improve tag labels
- [x] tag pages
- [x] content pages
- [x] integrate twind

## feeds

- [ ] use feed module for atom/rss: https://esm.sh/feed

---

## log layout

- [x] add `log: true` option in frontmatter
- [x] render page content inline if log true is set
- [x] simplify styles for metadata in header and inline articles
- [x] pass the same data structure to page view for both page content and index
      links

## misc

- [x] differentiate internal and external links
- [x] resolve relative paths in content
- [x] sort index by date edited with folders first
- [x] consolidate how paths and links are stored on pages independetly of input
      path
- [x] fix backLinks not working with `.` input
- [x] add config file
- [x] strip index/index.md from internal links when they point to index pages
- [x] add twitter and og metadata in base view
- [x] automatically run init from main script if req files missing
- [x] check for head.eta in views path and append if exists
- [x] simplify css, the reset stuff is not needed
- [x] dirs that contain only nested dirs and no markdown files aren't indexed
- [ ] 404 page
- [ ] add og image
- [ ] add favicon
- [ ] use streams to open and write markdown files
- [ ] sanitize markdown output
- [x] stress-test with
      https://github.com/Zettelkasten-Method/10000-markdown-files

## maybe

- [[wiki-style]] links?
