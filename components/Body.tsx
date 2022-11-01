import { FunctionComponent, h } from "preact";
import { tw } from "twind/";

import Article from "@components/Article.tsx";
import IndexList from "@components/IndexList.tsx";
import Header from "@components/Header.tsx";
import Footer from "@components/Footer.tsx";

import { Crumb, Page } from "../types.d.ts";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  childTags?: string[];
  backlinkPages?: Page[];
  taggedPages?: Record<string, Page[]>;
  navItems?: Record<string, string>;
  author?: { name: string; email: string; url: string };
  dateFormat?: Record<string, string>;
  locale?: string;
}

// TODO
// x generate toc
// - figure out date format, use config
// - implement log layout

const Body: FunctionComponent<BodyProps> = ({
  page,
  crumbs,
  childPages,
  childTags,
  backlinkPages,
  taggedPages,
  navItems,
  author,
  dateFormat,
  locale,
}) => {
  return (
    <body
      class={tw`
             min-h-screen
             mx-auto max-w-4xl
             px-4
             flex flex-col gap-16
             bg-white text-gray-900
             text-sm md:(text-base)
             dark:(
               bg-black text-gray-300
             )`}
    >
      {crumbs && <Header navItems={navItems} crumbs={crumbs} />}

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

      <aside
        class={tw`
               grid grid-cols-1
               gap-8
               md:(grid-cols-2)
               `}
      >
        {childPages && childPages.length > 0 && (
          <IndexList title="Pages" items={childPages} />
        )}
        {backlinkPages && backlinkPages.length > 0 && (
          <IndexList title="Backlinks" items={backlinkPages} />
        )}
        {taggedPages &&
          Object.keys(taggedPages).length > 0 &&
          Object.keys(taggedPages).map((tag) => (
            <IndexList title={`#${tag}`} items={taggedPages[tag]} />
          ))}
        {childTags && childTags.length > 0 && (
          <IndexList title="Tags" items={childTags} />
        )}
      </aside>
      <Footer author={author} />
    </body>
  );
};

export default Body;
