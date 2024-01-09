/** @jsxImportSource https://esm.sh/preact */

import { IndexGrid, IndexList, IndexLog } from "./lists.tsx";
import { Crumb, Page } from "../types.d.ts";
import { Footer, Header } from "./chrome.tsx";
import Article from "./article.tsx";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  backlinkPages?: Page[];
  relatedPages?: Page[];
  pagesByTag?: Record<string, Page[]>;
  author?: { name: string; email: string; url: string };
  lang: Intl.LocalesArgument;
}

const PageIndex = ({
  pages,
  layout,
  lang,
}: {
  pages: Page[];
  layout: Page["layout"];
  lang: Intl.LocalesArgument;
}) => {
  switch (layout) {
    case "log":
      return <IndexLog items={pages} lang={lang} />;
    case "grid":
      return <IndexGrid items={pages} lang={lang} />;
    default:
      return (
        <IndexList title="Pages" items={pages} type={"pages"} lang={lang} />
      );
  }
};

const Body = ({
  page,
  crumbs,
  childPages,
  backlinkPages,
  relatedPages,
  pagesByTag,
  author,
  lang,
}: BodyProps) => (
  <body class="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-200 container my-0 p-4 md:p-8 min-h-screen flex flex-col gap-16 max-w-3xl font-sans font-book leading-normal antialiased">
    <Header crumbs={crumbs} />

    <main class="[&:has(article:empty)]:hidden">
      <Article lang={lang} page={page} />
    </main>

    <aside class="empty:hidden space-y-16">
      {childPages && childPages.length > 0 && (
        <PageIndex lang={lang} layout={page.layout} pages={childPages} />
      )}

      {page.index !== "tag" && relatedPages && relatedPages.length > 0 && (
        <IndexList
          title={`Related`}
          items={relatedPages}
          type={"pages"}
          lang={lang}
        />
      )}

      {page.index === "tag" &&
        pagesByTag &&
        Object.keys(pagesByTag).length > 0 &&
        Object.keys(pagesByTag).map((tag) => (
          <IndexList
            title={`#${tag}`}
            items={pagesByTag[tag]}
            type={"pages"}
            lang={lang}
          />
        ))}

      {page.index === "dir" &&
        pagesByTag &&
        Object.keys(pagesByTag).length > 0 && (
        <IndexList
          title="Tags"
          items={pagesByTag}
          type={"tags"}
          lang={lang}
        />
      )}

      {backlinkPages && backlinkPages.length > 0 && (
        <IndexList
          title="Links to this page"
          items={backlinkPages}
          type={"backlinks"}
          lang={lang}
        />
      )}
    </aside>

    <Footer author={author} />
  </body>
);

export default Body;
