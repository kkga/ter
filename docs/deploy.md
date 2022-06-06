---
pinned: true
---

# Deploy

Learn how to publish your site.

## Vercel

To deploy on [Vercel](https://vercel.com), use the following build and output
configuration:

```sh
# build command
deno run -A --unstable https://deno.land/x/ter/main.ts

# output directory
_site

# install command
curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL=/usr/local sh
```

If you're using non-default input and output folders, update the build command
and output directory accordingly, e.g.:

```sh
# build command
deno run -A --unstable https://deno.land/x/ter/main.ts --input content --output _dist

# output directory
_dist
```

## Deno Deploy (via GitHub Actions)

1. Create a new project on [Deno Deploy](https://deno.com/deploy). Select
   "Deploy from GitHub", link the repository, and use the production branch. For
   deployment mode, select “GitHub Actions”, because we want to use GitHub
   Actions to first build the site then deploy it to Deno Deploy.
2. Add a `.github/workflows/deno-deploy.yml` file in site source directory, make
   changes according to your setup and commit it:

```yaml
name: Deploy to Deno Deploy

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Allows authentication with Deno Deploy.
      contents: read # Allows cloning the repo.

    steps:
      - name: Clone repository
        uses: actions/checkout@v2

      - name: Setup Deno
        uses: denoland/setup-deno@v1.1.0

      - name: Build site
        run: deno run -A --unstable main.ts # Change if using non-default input/output directories

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: my-ter-site # Replace with the project name on Deno Deploy
          entrypoint: https://deno.land/std@0.131.0/http/file_server.ts
          root: _site # Change if your output directory is different
```
