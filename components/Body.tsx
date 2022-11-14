/** @jsxImportSource https://esm.sh/preact */

import { tw } from "../deps.ts";

import Article from "./Article.tsx";
import IndexList from "./IndexList.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

import { Crumb, Page } from "../types.d.ts";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  backlinkPages?: Page[];
  relatedPages?: Page[];
  pagesByTag?: Record<string, Page[]>;
  author?: { name: string; email: string; url: string };
  dateFormat?: Intl.DateTimeFormatOptions;
  lang: Intl.LocalesArgument;
  navItems?: Record<string, string>;
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
  dateFormat,
  lang,
}: BodyProps) {
  return (
    <body
      class={tw`
        antialiased
        tracking-[-0.01em]
        min-h-screen
        mx-auto max-w-3xl
        px-4
        flex flex-col gap-16
        text-sm md:(text-base)
        bg-white text-gray-900
        dark:(
          bg-black text-gray-300
        )`}
    >
      {crumbs && (
        <Header
          currentPath={page.url.pathname}
          navItems={navItems}
          crumbs={crumbs}
        />
      )}

      <main>
        <Article page={page} dateFormat={dateFormat} lang={lang}>
          {page.layout === "log" &&
            childPages &&
            childPages?.length > 0 &&
            childPages.map(
              (p: Page) =>
                p.html && (
                  <Article
                    page={p}
                    dateFormat={dateFormat}
                    lang={lang}
                    headerSize={"small"}
                  />
                ),
            )}
        </Article>
      </main>

      <aside class={tw`flex flex-col gap-12`}>
        {childPages && childPages.length > 0 && (
          <IndexList
            title="Pages"
            items={childPages}
            type={"pages"}
            lang={lang}
          />
        )}

        {page.index !== "tag" && relatedPages && relatedPages.length > 0 && (
          <IndexList
            title={`Related (${page.tags?.join(", ")})`}
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
