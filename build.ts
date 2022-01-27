import { dirname, etaConfigure, etaRenderFile, join } from "./deps.ts";
import { Page } from "./page.ts";

etaConfigure({
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
  date: Date | null;
  readableDate: string | null;
}

const toReadableDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function generateIndexItems(pages: Array<Page>): Array<IndexItem> {
  const items: Array<IndexItem> = [];

  for (const p of pages) {
    const readableDate = p.date ? toReadableDate(p.date) : null;
    items.push({
      url: join("/", dirname(p.path), p.slug),
      title: p.title,
      date: p.date ? p.date : null,
      readableDate,
      isIndexPage: p.isIndex,
    });
  }

  items.sort((a, b) => {
    if (a.date && b.date) {
      return b.date.valueOf() - a.date.valueOf();
    } else {
      return 0;
    }
  }).sort((a) => a.isIndexPage ? -1 : 0);

  return items;
}

function generateBreadcrumbs(currentPage: Page): Array<Breadcrumb> {
  const dir: string = dirname(currentPage.path);
  const chunks = dir.split("/").filter((path) => path !== ".");
  const { slug } = currentPage;

  let breadcrumbs: Array<Breadcrumb> = chunks.map((chunk, index) => {
    const slug = chunk;
    const url = join("/", ...chunks.slice(0, index + 1));
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
  viewPath: string,
): Promise<string | void> {
  const { title, date, html: body } = page;
  const breadcrumbs = generateBreadcrumbs(page);
  const backlinkIndexItems = generateIndexItems(backLinkedPages);
  const childIndexItems = generateIndexItems(childPages);
  const readableDate = date ? toReadableDate(date) : null;
  const result = await etaRenderFile(viewPath, {
    breadcrumbs,
    date,
    readableDate,
    title,
    body,
    indexLinks: childIndexItems,
    backLinks: backlinkIndexItems,
  });

  return result;
}
