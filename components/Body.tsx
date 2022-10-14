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
// - generate toc
// - figure out date format
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
}) => (
  <body
    class={tw`
      bg-gray-100
      text-gray-900
      max-w-3xl
      mx-auto
      min-h-screen
      flex
      flex-col
      gap-12
      p-8
      bg-gray-50
      text-gray-900
      dark:(
        bg-gray-900
        text-gray-300
      )`}
  >
    {crumbs && <Header navItems={navItems} crumbs={crumbs} />}
    {page.index !== "tag" && (
      <main>
        <Article
          title={page.title}
          description={page.description}
          datePublished={page.datePublished}
          tags={page.tags}
          toc={page.toc}
          html={page.html}
          hideTitle={page.hideTitle}
          dateFormat={dateFormat}
          locale={locale}
        />
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
      {
        /* childTags && childTags.length > 0 && (
        <IndexList title="Child tags" items={childTags} />
      ) */
      }
    </aside>
    <Footer author={author} />
  </body>
);

export default Body;
