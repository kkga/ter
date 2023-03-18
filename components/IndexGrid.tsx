/** @jsxImportSource https://esm.sh/preact */

import { Page } from "../types.d.ts";

interface IndexGridProps {
  items: Page[];
  lang: Intl.LocalesArgument;
}

export default function IndexGrid(props: IndexGridProps) {
  const _dateFormat: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    day: "2-digit",
    month: "short",
  };
  return (
    <section class="text(sm)">
      <h6 class="section-heading text(xs neutral-10) uppercase font-semibold tracking-wide mb-3">
        Pages
      </h6>
      {Array.isArray(props.items) && (
        <ul class="-mx-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {props.items.map((item) => (
            <a href={item.url.pathname} class="box p-2 flex flex-col gap-1.5">
              {item.thumbnailUrl && (
                <img
                  class="mb-2 w-full object-cover aspect-[4/3]"
                  src={item.thumbnailUrl.toString()}
                />
              )}
              <span class="block leading-tight text-sm font-semibold">
                {item.title}
              </span>

              {item.description && (
                <span class="leading-tight text-neutral-9">
                  {item.description}
                </span>
              )}
            </a>
          ))}
        </ul>
      )}
    </section>
  );
}
