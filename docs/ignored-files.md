# Ignored files

Ter automatically ignores any files and directories that start with an `_` or `.` (hidden).

For example, if there is a `_drafts` folder in the [content directory](comtent.md), it will be skipped during site generation.

In addition, it’s also possible to ignore individual markdown files by setting either `private: true` or `draft: true` in the [YAML frontmatter](frontmatter.md).