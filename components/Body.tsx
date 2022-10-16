import { Fragment, FunctionComponent, h } from "preact";
import { tw } from "twind/";

import ArticleHeader from "@components/ArticleHeader.tsx";
import ArticleBody from "@components/ArticleBody.tsx";
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
  const renderHeader = (page: Page, small?: boolean) => {
    return (
      <ArticleHeader
        title={page.title}
        description={page.description}
        datePublished={page.datePublished}
        tags={page.tags}
        headings={page.headings}
        hideTitle={page.hideTitle}
        dateFormat={dateFormat}
        locale={locale}
        size={small && "small" || "default"}
        showToc={page.showToc}
      />
    );
  };

  return (
    <body
      class={tw`
      max-w-3xl mx-auto min-h-screen
      flex flex-col
      gap-12 p-4
      bg-white text-gray-900
      dark:(
        bg-gray-900 text-gray-300
      )`}
    >
      {crumbs && <Header navItems={navItems} crumbs={crumbs} />}

      {page.index !== "tag" && (
        <main>
          {page.layout === "log" && childPages && childPages?.length > 0 && (
            <>
              {renderHeader(page)}
              {page.html && <ArticleBody html={page.html} />}

              {childPages.map((p: Page) => (
                <article>
                  {renderHeader(p, true)}
                  {p.html && <ArticleBody html={p.html} />}
                  <hr
                    class={tw`
                   last-child:(hidden)
                   my-8
                   border(gray-200 dashed)
                   dark:(border-gray-700)`}
                  />
                </article>
              ))}
            </>
          )}

          {page.layout === undefined && (
            <article>
              {renderHeader(page)}
              {page.html && <ArticleBody html={page.html} />}
            </article>
          )}
        </main>
      )}

      <aside class={tw`flex flex-col gap-8`}>
        {childPages && childPages.length > 0 && (
          <IndexList title="Child pages" items={childPages} />
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
          <IndexList title="Child tags" items={childTags} />
        )}
      </aside>
      <Footer author={author} />
    </body>
  );
};

export default Body;
