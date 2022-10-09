import { apply, css, FC, h, tw } from "../deps.ts";
import { Crumb, Page } from "../types.d.ts";
import Article from "./Article.tsx";
import IndexList from "./IndexList.tsx";
import Header from "./Header.tsx";
import { parseAll } from "https://deno.land/std@0.159.0/encoding/yaml.ts";

interface BodyProps {
  page: Page;
  crumbs: Crumb[];
  childPages?: Page[];
  childTags?: string[];
  backlinkPages?: Page[];
  taggedPages?: Record<string, Page[]>;
  navItems?: Record<string, string>;
}

const styles = {
  siblingLink: css({
    "&::before": { opacity: 0.5, content: '"·"', margin: "0 1ch" },
  }),
  footer: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
  }),
};

// TODO
// - generate toc
// - figure out date format

const Body: FC<BodyProps> = (
  { page, crumbs, childPages, childTags, backlinkPages, taggedPages, navItems },
) => (
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
    <main>
      <Article
        title={page.title}
        description={page.description}
        datePublished={page.datePublished}
        tags={page.tags}
        toc={page.toc}
        dateFormat={page.dateFormat}
        html={page.html}
        hideTitle={page.hideTitle}
      />
    </main>
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

    <footer
      class={tw`flex align-baseline mt-auto text-xs text-gray-500 ${styles.footer}`}
    >
      <a href="/feed.xml">Feed</a>
      <span class={tw`${styles.siblingLink}`}>
        Made with <a href="https://ter.kkga.me">Ter</a>
      </span>
    </footer>
  </body>
);

export default Body;
