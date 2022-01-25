# Templates

Ter uses [Eta](https://eta.js.org/) templates to build pages.

It’s possible to customize the output by changing the default Eta views.

By default, Ter uses a single layout template for both index and context files.

The `page.eta` layout template has a a few includes:

- `header.eta`: contains a list of [breadcrumbs](breadcrumbs.md) and the last
  edit date for current page;
- `link-list.eta`: used for displaying both the index list and the list of
  [backlinks](backlinks.md).

The following variables are available to use inside templates:

`it.page`: the top-level object for current page.

`it.body`: Eta’s default variable for nested page content.
