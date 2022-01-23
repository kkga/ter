import { dateFormat, etaConfigure, etaRenderFile, path } from "./deps.ts";
import { Page } from "./main.ts";

const VIEWS_PATH = `${Deno.cwd()}/_views/`;

etaConfigure({
  views: VIEWS_PATH,
  autotrim: true,
});

interface Breadcrumb {
  slug: string;
  url: string;
  current: boolean;
}

interface IndexItem {
  url: string;
  title: string;
  isIndexPage: boolean;
  readableDate: string | null;
}

function generateIndexItems(pages: Array<Page>): Array<IndexItem> {
  const items: Array<IndexItem> = [];

  for (const p of pages) {
    const readableDate = p.date ? dateFormat(p.date, "dd-MM-yyyy") : null;
    items.push({
      url: path.join("/", path.dirname(p.path), p.slug),
      title: p.title,
      readableDate,
      isIndexPage: p.isIndex,
    });
  }

  items.sort((a, b) => a.isIndexPage ? -1 : 1);

  return items;
}

function generateBreadcrumbs(currentPage: Page): Array<Breadcrumb> {
  const dirname: string = path.dirname(currentPage.path);
  const chunks = dirname.split("/").filter((path) => path !== ".");
  const { slug } = currentPage;

  let breadcrumbs: Array<Breadcrumb> = chunks.map((chunk, index) => {
    const slug = chunk;
    const url = path.join("/", ...chunks.slice(0, index + 1));
    return {
      slug,
      url,
      current: false,
    };
  });

  breadcrumbs = [
    { slug: "index", url: "/", current: false },
    ...breadcrumbs,
  ];

  if (slug !== "") {
    breadcrumbs = [
      ...breadcrumbs,
      { slug, url: "", current: true },
    ];
  }

  return breadcrumbs;
}

export async function buildPage(
  page: Page,
  childPages: Array<Page>,
  backLinkedPages: Array<Page>,
): Promise<string | void> {
  const { title, date, html: body } = page;
  const breadcrumbs = generateBreadcrumbs(page);
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
