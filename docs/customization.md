---
date: 2022-09-26
---

# Customization

Ter should work out of the box with zero configuration needed to get a decent
output. However, it's possible to customize various aspects of the rendered
website.

## Custom \<head\> template

If a file at `.ter/views/head.eta` exists, its content will be injected at the
bottom of HTML `<head>` tag for all pages. This can be used for adding things
like analytics integration.

---

<details open>
<summary>Important note</summary>

The following customization options are outdated as Ter currently automatically
fetches its default template and styles from the Deno module URL.

This is done to avoid having any extra files in the directory by default and to
avoid potentially having outdated templates/styles. Simplicity > customization.

I might add an option to use local assets in future.

</details>

## Styles

### Page styles

Main page styles are defined in `.ter/assets/ter.css`. The content-related CSS
is mostly classless to avoid depending on specific classes from the
[template](#templates).

### Code highlights

Code snippets are highlighted by [highlight.js](https://highlightjs.org) and use
the theme defined in `.ter/assets/hljs.css`, which can be replaced by any
highlight.js-compatible theme file.

## Templates

### Page template

Ter uses [Eta](https://eta.js.org/) templates to build pages. It’s possible to
customize the output by changing the default view files in `.ter/views/`.
