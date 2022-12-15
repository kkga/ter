/** @jsxImportSource https://esm.sh/preact */

import { Page } from "../types.d.ts";
import Article from "./Article.tsx";

interface IndexLogProps {
  items: Page[];
  lang: Intl.LocalesArgument;
}

export default function IndexList(props: IndexLogProps) {
  return (
    <section class="
        text(sm)
        target:(
          ring ring-primary-500 ring-offset-8 ring-offset-white
          dark:(ring-primary-700 ring-offset-gray-800)
        )
      ">
      {Array.isArray(props.items) &&
        (
          <ul class="flex flex-col gap-4">
            {props.items.map((item) => (
              <div class="box p-4">
                <Article page={item} compact={true} />
              </div>
            ))}
          </ul>
        )}
    </section>
  );
}
