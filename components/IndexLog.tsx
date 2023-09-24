/** @jsxImportSource npm:preact */

import { Page } from "../types.d.ts";
import Article from "./Article.tsx";

interface IndexLogProps {
  items: Page[];
  lang: Intl.LocalesArgument;
}

const IndexLog = ({ items, lang }: IndexLogProps) => {
  return (
    <section>
      {Array.isArray(items) && (
        <ul class="-mx-4 flex flex-col gap-4">
          {items.map((item) => (
            <div class="box rounded-xl p-4">
              <Article page={item} lang={lang} compact={true} />
            </div>
          ))}
        </ul>
      )}
    </section>
  );
};

export default IndexLog;
