/** @jsxImportSource https://esm.sh/preact */

import { Page } from "../types.d.ts";
import Article from "./Article.tsx";

interface IndexGridProps {
  items: Page[];
  lang: Intl.LocalesArgument;
}

export default function IndexGrid(props: IndexGridProps) {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    day: "2-digit",
    month: "short",
  };
  return (
    <section class="
        text(sm)
        target:(
          ring ring-primary-500 ring-offset-8 ring-offset-white
          dark:(ring-primary-700 ring-offset-gray-800)
        )
      ">
      <h6 class="text(xs gray-500) uppercase font-semibold tracking-wide mb-3">
        Pages
      </h6>
      {Array.isArray(props.items) &&
        (
          <ul class="grid sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {props.items.map((item) => (
              <a
                href={item.url.pathname}
                class="box px-2 py-1.5"
              >
                <span class="block mb-1.5 text-sm font-semibold">
                  {item.title}
                </span>

                <p class="leading-tight text(gray-500 dark:gray-400)">
                  {item.description}
                </p>
              </a>
            ))}
          </ul>
        )}
    </section>
  );
}
