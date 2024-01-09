/** @jsxImportSource https://esm.sh/preact */

import { Page } from "../types.d.ts";
import Article from "./Article.tsx";

const ListItemPage = ({
  title,
  description,
  url,
  isDirIndex,
}: {
  url: URL;
  title: string;
  description?: string;
  isDirIndex?: boolean;
}) => {
  return (
    <li class="max-w-full flex-1 flex items-baseline overflow-hidden whitespace-nowrap">
      <a href={url.pathname} class="font-bold">
        {title}
      </a>
      {/* {isDirIndex && <span class="mx-2">/..</span>} */}
      {description && (
        <span class="truncate text-dim">
          <span class="mx-2">&mdash;</span>
          {description}
        </span>
      )}
    </li>
  );
};

const TagItem = ({ name, pageCount }: { name: string; pageCount: number }) => {
  return (
    <li class="max-w-full inline-block mb-1 mr-3">
      <a href={`/tags##${name}`} class="">
        {name}
      </a>
    </li>
  );
};

const SectionHeading = ({ title }: { title: string }) => {
  return <h6 class="smallcaps text-dim mt-0 mb-2">{title}</h6>;
};

const IndexList = ({
  items,
  title,
  type,
}: {
  title: string;
  items: Page[] | Record<string, Page[]>;
  type: "pages" | "tags" | "backlinks";
  lang: Intl.LocalesArgument;
}) => {
  return (
    <section id={title} class="target:([&>h6]:(text-accent-10))">
      <SectionHeading title={title} />
      {/* {type !== "pages" && <SectionHeading title={title} />} */}
      {(type === "pages" || type === "backlinks") && Array.isArray(items) && (
        <ul class="m-0 p-0 list-none space-y-1">
          {items.map((item) => (
            <ListItemPage
              isDirIndex={item.index === "dir"}
              title={item.title || ""}
              description={item.description}
              url={item.url}
            />
          ))}
        </ul>
      )}
      {type === "tags" && (
        <ul class="m-0 p-0 list-none">
          {Object.entries(items).map((item) => (
            <TagItem name={item[0]} pageCount={item[1].length} />
          ))}
        </ul>
      )}
    </section>
  );
};

const IndexGrid = ({
  items,
}: {
  items: Page[];
  lang: Intl.LocalesArgument;
}) => {
  return (
    <section>
      {Array.isArray(items)
        ? (
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8 list-none p-0 m-0">
            {items.map((item) => (
              <li>
                {item.thumbnailUrl && (
                  <img
                    class="mb-2 w-full object-cover aspect-[4/3]"
                    src={item.thumbnailUrl.toString()}
                  />
                )}
                <a class="inline-block font-bold" href={item.url.pathname}>
                  {item.title}
                </a>
                {item.description && (
                  <span class="block text-dim text-sm hyphens-auto">
                    {item.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )
        : null}
    </section>
  );
};

const IndexLog = ({
  items,
  lang,
}: {
  items: Page[];
  lang: Intl.LocalesArgument;
}) => {
  return (
    <section>
      {Array.isArray(items) && (
        <ul class="list-none m-0 p-0 space-y-12">
          {items.map((item) => <Article page={item} lang={lang} />)}
        </ul>
      )}
    </section>
  );
};

export { IndexGrid, IndexList, IndexLog };
