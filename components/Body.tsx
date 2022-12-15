/** @jsxImportSource https://esm.sh/preact */

import Article from "./Article.tsx";
import IndexList from "./IndexList.tsx";
import IndexLog from "./IndexLog.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

import { Crumb, Page } from "../types.d.ts";
import IndexGrid from "./IndexGrid.tsx";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  backlinkPages?: Page[];
  relatedPages?: Page[];
  pagesByTag?: Record<string, Page[]>;
  author?: { name: string; email: string; url: string };
  lang: Intl.LocalesArgument;
  navItems: Record<string, string>;
}

function renderPageIndex(
  pages: Page[],
  title: string,
  layout: Page["layout"],
  lang: Intl.LocalesArgument,
) {
  switch (layout) {
    case "log":
      return (
        <IndexLog
          items={pages}
          lang={lang}
        />
      );
    case "grid":
      return (
        <IndexGrid
          items={pages}
          lang={lang}
        />
      );
    default:
      return (
        <IndexList
          title={title}
          items={pages}
          type={"pages"}
          lang={lang}
        />
      );
  }
}

export default function Body({
  page,
  crumbs,
  childPages,
  backlinkPages,
  relatedPages,
  pagesByTag,
  navItems,
  author,
  lang,
}: BodyProps) {
  return (
    <body class="
      antialiased
      tracking-[-0.015em]
      min-h-screen
      mx-auto max-w-3xl
      p-4
      flex flex-col gap-16
      text(gray-900 dark:gray-300)
      bg(white dark:black) 
    ">
      {crumbs && (
        <Header
          currentPath={page.url.pathname}
          navItems={navItems}
          crumbs={crumbs}
        />
      )}

      <main class="[&:has(article:empty)]:hidden">
        <Article
          lang={lang}
          page={page}
        >
          {
            /* {page.layout === "log" &&
            childPages &&
            childPages?.length > 0 &&
            childPages.map(
              (p: Page) =>
                p.html && (
                  <Article
                    page={p}
                    lang={lang}
                    isInLog={true}
                  />
                ),
            )} */
          }
        </Article>
      </main>

      <aside class="empty:hidden flex flex-col gap-12">
        {childPages && childPages.length > 0 && (
          renderPageIndex(childPages, "Pages", page.layout, lang)
        )}

        {page.index !== "tag" && relatedPages && relatedPages.length > 0 && (
          <IndexList
            title={`Related`}
            items={relatedPages}
            type={"pages"}
            lang={lang}
          />
        )}

        {page.index === "tag" && pagesByTag &&
          Object.keys(pagesByTag).length > 0 &&
          Object.keys(pagesByTag).map((tag) => (
            <IndexList
              title={`#${tag}`}
              items={pagesByTag[tag]}
              type={"pages"}
              lang={lang}
            />
          ))}

        {page.index === "dir" && pagesByTag &&
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
}
