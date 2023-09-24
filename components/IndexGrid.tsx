/** @jsxImportSource npm:preact */

import { Page } from "../types.d.ts";

interface IndexGridProps {
  items: Page[];
  lang: Intl.LocalesArgument;
}

const IndexGrid = ({ items }: IndexGridProps) => {
  return (
    <section>
      <h6 class="section-heading">Pages</h6>
      {Array.isArray(items) ? (
        <ul class="-mx-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {items.map((item) => (
            <a href={item.url.pathname} class="box p-2 flex flex-col gap-1">
              {item.thumbnailUrl && (
                <img
                  class="mb-2 w-full object-cover aspect-[4/3]"
                  src={item.thumbnailUrl.toString()}
                />
              )}
              <span class="block leading-tight font-medium">{item.title}</span>

              {item.description && (
                <span class="leading-tight text-sm text-neutral-9 hyphens-auto">
                  {item.description}
                </span>
              )}
            </a>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default IndexGrid;
