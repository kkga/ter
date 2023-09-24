/** @jsxImportSource npm:preact */

import { Page } from "../types.d.ts";

interface PageItemProps {
  url: URL;
  title: string;
  description?: string;
}

const PageItem = ({ title, description, url }: PageItemProps) => {
  return (
    <li class="max-w-full">
      <a
        href={url.pathname}
        class="
          box
          px-2 py-1
          flex flex-row items-baseline gap-1.5
          ring-offset-4 ring-offset-neutral-3
          leading-tight
        "
      >
        <div class="flex-1 flex items-baseline overflow-hidden whitespace-nowrap">
          <span class="flex-shrink-0 font-medium truncate">{title}</span>
          {description && (
            <span class="truncate text-neutral-10">
              <span class="text-neutral-8 mx-2">&mdash;</span>
              {description}
            </span>
          )}
        </div>
      </a>
    </li>
  );
};

interface TagItemProps {
  name: string;
  pageCount: number;
}

const TagItem = ({ name, pageCount }: TagItemProps) => {
  return (
    <li class="max-w-full">
      <a href={`/tags##${name}`} class="box px-2 py-1 leading-tight">
        {name} <span class="text-neutral-9">{pageCount}</span>
      </a>
    </li>
  );
};

interface IndexListProps {
  title: string;
  items: Page[] | Record<string, Page[]>;
  type: "pages" | "tags" | "backlinks";
  lang: Intl.LocalesArgument;
}

const IndexList = ({ items, title, type }: IndexListProps) => {
  return (
    <section id={title} class="target:([&>h6]:(text-accent-10))">
      <h6 class="section-heading">{title}</h6>
      {(type === "pages" || type === "backlinks") && Array.isArray(items) && (
        <ul class="-mx-2 flex flex-col items-start">
          {items.map((item) => (
            <PageItem
              title={item.title || ""}
              description={item.description}
              url={item.url}
            />
          ))}
        </ul>
      )}
      {type === "tags" && (
        <ul class="-mx-2 flex flex-wrap">
          {Object.entries(items).map((item) => (
            <TagItem name={item[0]} pageCount={item[1].length} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default IndexList;
