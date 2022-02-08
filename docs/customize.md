# Customize

Ter should work out of the box with zero configuration needed to get a decent
output.

However, it's possible to customize various aspects of the rendered website.

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

Ter uses [Eta](https://eta.js.org/) templates to build pages.

It’s possible to customize the output by changing the default view files in
`.ter/views/`.
