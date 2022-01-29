# Index pages

Ter recursively recreates the source file system on the rendered site and each
directory gets an index file listing its content.

For example, if the source looks like this:

```
content
├── index.md
├── about-me.md
└── life
    ├── failed-startup-ideas.md
    └── thought-on-life.md
```

... the `life` directory will get an `life/index.html` page with an index of its
content.

If the source directory contains an `index.md` file, its content will be
injected into the rendered `index.html` above the index list. This can be useful
for describing what the folder content is about or additionally calling out
individual pages from the index.
