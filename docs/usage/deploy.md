---
title: Deploy
description: How to deploy Ter sites.
date: 2022-12-18
tags:
    - usage
---

Ter generates a static site which can be deployed anywhere.

<details open>
<summary>Note</summary>
If using non-default input and output folders, update the build command
and output directory accordingly.
</details>

### Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration.

#### Build command

```
deno run -A --unstable https://deno.land/x/ter/main.ts
```

#### Output directory

```
_site
```

#### Install command

```
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh
```

### Deno Deploy

For [Deno Deploy](https://deno.com/deploy), we can use a GitHub Action to
automatically build the site and then deploy it with Deno's
[deployctl](https://github.com/denoland/deployctl/blob/main/action/README.md).

Firstly, create a new project on Deno Deploy. Select "Deploy from GitHub", link
the repository, and use the production branch. For deployment mode, select
“GitHub Actions”.

Next, create a `.github/workflows/deno-deploy.yml` file in the repository and
make changes according to your setup.

#### GitHub Action (deno-deploy.yml)

```yaml
name: Deploy to Deno Deploy

on:
  push:
    # Change if using a different production branch
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Clone repository
        uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1.1.0

      - name: Build site
        # Change if using non-default input/output directories
        run: deno run -A --unstable main.ts

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          # Replace with the project name on Deno Deploy
          project: my-ter-site
          entrypoint: https://deno.land/std/http/file_server.ts
          # Change if using non-default output directory
          root: _site
```
