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
    <section class="text(sm)">
      <h6 class="text(xs neutral-10) uppercase font-semibold tracking-wide mb-3">
        Pages
      </h6>
      {Array.isArray(props.items) &&
        (
          <ul class="grid sm:grid-cols-2 md:grid-cols-3 gap-1.5">
            {props.items.map((item) => (
              <a
                href={item.url.pathname}
                class="box p-2"
              >
                {item.thumbnailUrl && (
                  <img
                    class="mb-2 w-full object-cover aspect-[4/3]"
                    src={item.thumbnailUrl.toString()}
                  />
                )}
                <span class="block leading-tight mb-1.5 text-sm font-semibold">
                  {item.title}
                </span>

                <p class="leading-tight text-neutral-9">
                  {item.description}
                </p>
              </a>
            ))}
          </ul>
        )}
    </section>
  );
}
