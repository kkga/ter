import { etaConfigure, etaRenderFile } from "./deps.ts";
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

export async function buildPage(page: Page): Promise<string | void> {
  const { title, html: body, backlinks } = page;
  const result = await etaRenderFile("./page", { title, body, backlinks });

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
