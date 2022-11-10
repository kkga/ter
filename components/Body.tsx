import { FunctionComponent as FC, h } from "preact";
import { tw } from "twind";

import Article from "@components/Article.tsx";
import IndexList from "@components/IndexList.tsx";
import Header from "@components/Header.tsx";
import Footer from "@components/Footer.tsx";

import { Crumb, Page } from "../types.d.ts";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  backlinkPages?: Page[];
  relatedPages?: Page[];
  pagesByTag?: Record<string, Page[]>;
  navItems?: Record<string, string>;
  author?: { name: string; email: string; url: string };
  dateFormat?: Intl.DateTimeFormatOptions;
  locale?: string;
}

// TODO
// x generate toc
// - figure out date format, use config
// - implement log layout

const Body: FC<BodyProps> = ({
  page,
  crumbs,
  childPages,
  backlinkPages,
  relatedPages,
  pagesByTag,
  navItems,
  author,
  dateFormat,
  locale,
}) => {
  return (
    <body
      class={tw`
        antialiased 
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
        <Article page={page} dateFormat={dateFormat} locale={locale}>
          {page.layout === "log" &&
            childPages &&
            childPages?.length > 0 &&
            childPages.map(
              (p: Page) =>
                p.html && (
                  <Article
                    page={p}
                    dateFormat={dateFormat}
                    locale={locale}
                    headerSize={"small"}
                  />
                ),
            )}
        </Article>
      </main>

      <aside class={tw`flex flex-col gap-12`}>
        {childPages && childPages.length > 0 && (
          <IndexList title="Pages" items={childPages} type={"pages"} />
        )}

        {page.index !== "tag" && relatedPages && relatedPages.length > 0 && (
          <IndexList
            title={`Related (${page.tags?.join(", ")})`}
            items={relatedPages}
            type={"pages"}
          />
        )}

        {page.index === "tag" && pagesByTag &&
          Object.keys(pagesByTag).length > 0 &&
          Object.keys(pagesByTag).map((tag) => (
            <IndexList
              title={`#${tag}`}
              items={pagesByTag[tag]}
              type={"pages"}
            />
          ))}

        {page.index === "dir" && pagesByTag &&
          Object.keys(pagesByTag).length > 0 && (
          <IndexList
            title="Tags"
            items={pagesByTag}
            type={"tags"}
          />
        )}

        {backlinkPages && backlinkPages.length > 0 && (
          <IndexList
            title="Links to this page"
            items={backlinkPages}
            type={"backlinks"}
          />
        )}
      </aside>
      <Footer author={author} />
    </body>
  );
};

export default Body;
