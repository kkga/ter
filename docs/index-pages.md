# Index pages

Minmi recursively creates pages for all nested directories in the base content
directory.

Each directory gets an index file listing its content.

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
injected into the rendered `index.html` above the index list.
