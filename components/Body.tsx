import { FC, h, tw } from "../deps.ts";
import { Crumb, Page } from "../types.d.ts";
import Article from "./Article.tsx";
import IndexList from "./IndexList.tsx";
import Header from "./Header.tsx";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  childTags?: string[];
  backlinkPages?: Page[];
  taggedPages?: { [tag: string]: Array<Page> };
}

// TODO
// - generate toc
// - figure out date format

const Body: FC<BodyProps> = (
  { page, crumbs, childPages, childTags, backlinkPages, taggedPages },
) => (
  <body class={tw`max-w-3xl mx-auto min-h-screen flex flex-col gap-12 p-8`}>
    {crumbs && <Header crumbs={crumbs} />}
    <main>
      <Article
        title={page.title}
        description={page.description}
        datePublished={page.datePublished}
        tags={page.tags}
        toc={page.toc}
        dateFormat={page.dateFormat}
        html={page.html}
      />
    </main>
    <aside class={tw`flex flex-col gap-8`}>
      {childPages && childPages.length > 0 && (
        <IndexList title="Child pages" items={childPages} />
      )}
      {backlinkPages && backlinkPages.length > 0 && (
        <IndexList title="Backlinks" items={backlinkPages} />
      )}
      {childTags && childTags.length > 0 && (
        <IndexList title="Child tags" items={childTags} />
      )}
      {taggedPages &&
        Object.keys(taggedPages).length > 0 &&
        Object.keys(taggedPages).map((tag) => {
          <IndexList title={`#{tag}`} items={taggedPages[tag]} />;
        })}
    </aside>
    <footer class={tw`mt-auto`}>heeey</footer>
  </body>
);

export default Body;
