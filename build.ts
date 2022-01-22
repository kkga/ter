import { dateFormat, etaConfigure, etaRenderFile, join } from "./deps.ts";
import { Page } from "./main.ts";

const viewPath = `${Deno.cwd()}/_views/`;

// Set Eta's configuration
etaConfigure({
  // This tells Eta to look for templates
  // In the /views directory
  views: viewPath,
});

// Eta assumes the .eta extension if you don't specify an extension
// You could also write renderFile("template.eta"),
// renderFile("/template"), etc.

interface Breadcrumb {
  title: string;
  path: string;
}

function generateBreadcrumbs(slug: string): Array<Breadcrumb> {
  const chunks = slug.split("/");

  const breadcrumbs = chunks.map((chunk, index) => {
    const title = chunk;
    const path = join(...chunks.slice(0, index + 1));
    return {
      title,
      path,
    };
  });

  return [{ title: "home", path: "" }, ...breadcrumbs];
}

export async function buildPage(
  page: Page,
  pages: Array<Page>,
): Promise<string | void> {
  const { title, description, readableDate, slug, html: body, backlinks } =
    page;
  const breadcrumbs = generateBreadcrumbs(slug);
  const result = await etaRenderFile("./page", {
    title,
    readableDate,
    breadcrumbs,
    body,
    backlinks,
  });

  return result;
}

export async function buildIndex(
  page: Page,
  pages: Page[],
): Promise<string | void> {
  const { title, html: body, backlinks } = page;
  const result = await etaRenderFile("./index", {
    title,
    body,
    backlinks,
    pages,
  });

  return result;
}
