import { etaConfigure, etaRenderFile } from "./deps.ts";
import { Page } from "./main.ts";

const viewPath = `${Deno.cwd()}/views/`;

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
  const { title } = page;
  const body = page.html;

  const result = await etaRenderFile("./template", { title, body });

  return result;
}

export async function buildIndex(pages: Array<Page>): Promise<string | void> {
  const result = await etaRenderFile("./index", { pages });

  return result;
}
