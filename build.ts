import { dateFormat, etaConfigure, etaRenderFile, path } from "./deps.ts";
import { Page } from "./main.ts";

const viewPath = `${Deno.cwd()}/_views/`;

interface Breadcrumb {
  title: string;
  path: string;
}

interface IndexItem {
  title: string;
  readableDate: string | null;
  slug: string;
}

etaConfigure({
  views: viewPath,
});

function generateIndexItems(
  paths: Array<string>,
  pages: Array<Page>,
): Array<IndexItem> {
  const items: Array<IndexItem> = [];

  for (const path of paths) {
    const page = pages.find((p) => p.path === path);

    if (typeof page === "object") {
      const readableDate = page.date
        ? dateFormat(page.date, "dd-MM-yyyy")
        : null;

      items.push({
        title: page.title,
        slug: page.slug === "index" ? "" : page.slug,
        readableDate,
      });
    }
  }

  return items;
}

function generateBreadcrumbs(slug: string): Array<Breadcrumb> {
  const chunks = slug.split("/");

  const breadcrumbs = chunks.map((chunk, index) => {
    const title = chunk;
    const filePath = path.join(...chunks.slice(0, index + 1));
    return {
      title,
      path: filePath,
    };
  });

  return [{ title: "home", path: "" }, ...breadcrumbs];
}

export async function buildPage(
  page: Page,
  pages: Array<Page>,
): Promise<string | void> {
  const { title, date, slug, html: body, backlinks } = page;
  const breadcrumbs = generateBreadcrumbs(slug);
  const backlinkIndexItems = generateIndexItems(backlinks, pages);
  const readableDate = date ? dateFormat(date, "dd-MM-yyyy") : null;
  const result = await etaRenderFile("./page", {
    title,
    readableDate,
    breadcrumbs,
    body,
    backlinks: backlinkIndexItems,
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
