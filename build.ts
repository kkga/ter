import { dateFormat, etaConfigure, etaRenderFile, path } from "./deps.ts";
import { Page } from "./main.ts";

const viewPath = `${Deno.cwd()}/_views/`;
etaConfigure({
  views: viewPath,
  autotrim: true,
});

interface Breadcrumb {
  title: string;
  path: string;
}

interface IndexItem {
  dirname: string;
  title: string;
  readableDate: string | null;
  slug: string;
}

function generateIndexItems(pages: Array<Page>): Array<IndexItem> {
  const items: Array<IndexItem> = [];

  for (const p of pages) {
    const readableDate = p.date ? dateFormat(p.date, "dd-MM-yyyy") : null;
    const dir = path.dirname(p.slug);

    items.push({
      dirname: dir !== "." ? dir : "",
      title: p.title,
      slug: p.slug === "index" ? "" : p.slug,
      readableDate,
    });
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
  childPages: Array<Page>,
  backLinkedPages: Array<Page>,
): Promise<string | void> {
  const { title, date, slug, html: body } = page;
  const breadcrumbs = generateBreadcrumbs(slug);
  const backlinkIndexItems = generateIndexItems(backLinkedPages);
  const childIndexItems = generateIndexItems(childPages);
  const readableDate = date ? dateFormat(date, "dd-MM-yyyy") : null;
  const result = await etaRenderFile("./page", {
    breadcrumbs,
    readableDate,
    title,
    body,
    indexLinks: childIndexItems,
    backLinks: backlinkIndexItems,
  });

  return result;
}
