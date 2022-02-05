# Customize

Ter should work out of the box with zero configuration needed to get a decent
output.

However, it's possible to customize various aspects of the rendered website.

---

## Styles

### Page styles

Main page styles are defined in `.ter/assets/ter.css`. The CSS is mostly
classless to avoid depending on specific classes from the
[template](#templates).

### Code highlights

Code snippets are highlighted by [highlight.js](https://highlightjs.org) and use
the theme defined in `.ter/assets/hljs.css`, which can be replaced by any
highlight.js-compatible theme file.

---

## Templates

Ter uses [Eta](https://eta.js.org/) templates to build pages.

It’s possible to customize the output by changing the default Eta views.

By default, Ter uses a single layout template for both index and context files.

The `page.eta` layout template has a a few includes:

- `header.eta`: contains a list of [breadcrumbs](/features/breadcrumbs.md) and
  the last edit date for current page;
- `link-list.eta`: used for displaying both the index list and the list of
  [backlinks](/features/backlinks.md).

The following variables are available to use inside templates:

`it.page`: the top-level object for current page.

`it.body`: Eta’s default variable for nested page content.
