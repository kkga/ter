---
title: Configuration
description: How to configure Ter.
---

Ter reads a JSON configuration file at `.ter/config.json` before building a
site.

Alternative location can be specified with with the `--config` CLI flag. If the
file does not exist, Ter will create it with default options on first build.

#### Options

| Key           | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| title         | Title of your site.                                                |
| description   | Description of your site.                                          |
| url           | Published URL address of your site.                                |
| rootCrumb     | Label used for root crumb label (default: "index").                |
| authorName    | Your name.                                                         |
| authorEmail   | Your email.                                                        |
| authorUrl     | Your home page.                                                    |
| lang          | Optional. [Locale][locale] used for formatting dates.              |
| codeHighlight | Optional. Use syntax highlighting in code blocks (default: false). |
| head          | Optional. String to inject at the bottom of `<head>` tag.          |

[locale]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument

#### Example

```json
{
  "title": "Your Blog Name",
  "description": "I am writing about my experiences as a naval navel-gazer",
  "url": "https://example.com/",
  "rootCrumb": "index",
  "authorName": "Your Name Here",
  "authorEmail": "youremailaddress@example.com",
  "authorUrl": "https://example.com/about-me/",
  "lang": "en",
  "codeHighlight": true,
  "head": "<script src='https://microanalytics.io/js/script.js' id='XXXXXXXX'></script>"
}
```
