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

For [Deno Deploy](https://deno.com/deploy), we can use a GitHub Action to
automatically build the site and then deploy it with Deno's
[deployctl](https://github.com/denoland/deployctl/blob/main/action/README.md).

### Create a new project on Deno Deploy

Select "Deploy from GitHub", link the repository, and use the production branch.
For deployment mode, select “GitHub Actions”.

### Set up a GitHub Action

Create a `.github/workflows/deno-deploy.yml` file in site source directory, make
changes according to your setup and commit it:

```yaml
name: Deploy to Deno Deploy

on:
  push:
    # Change if using a different production branch
    branches: [ main ]
  pull_request:
    # ^ same here
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
