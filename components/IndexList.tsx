/** @jsxImportSource npm:preact */

import { Page } from "../types.d.ts";
import { ChevronLeft, ChevronRight } from "./icons.tsx";

interface PageItemProps {
  url: URL;
  title: string;
  description?: string;
  pinned?: boolean;
  isDirIndex?: boolean;
  date?: Date;
  lang?: Intl.LocalesArgument;
  icon?: preact.VNode;
}

function PageItem({
  title,
  description,
  url,
  pinned,
  isDirIndex,
  icon,
}: PageItemProps) {
  return (
    <li class="max-w-full">
      <a
        href={url.pathname}
        class="
          box
          px-2 py-1
          flex flex-row items-baseline gap-1.5
          ring-offset-4 ring-offset-neutral-3
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
}

interface TagItemProps {
  name: string;
  pageCount: number;
}

function TagItem({ name, pageCount }: TagItemProps) {
  return (
    <li class="max-w-full">
      <a href={`/tags##${name}`} class="box px-2 py-1">
        {name} <span class="text-neutral-9">{pageCount}</span>
      </a>
    </li>
  );
}

interface IndexListProps {
  title: string;
  items: Page[] | Record<string, Page[]>;
  type: "pages" | "tags" | "backlinks";
  lang: Intl.LocalesArgument;
}

export default function IndexList(props: IndexListProps) {
  return (
    <section
      id={props.title}
      class="
        text(sm)
        target:([&>h6]:(text-accent-10))))
      "
    >
      <h6 class="section-heading text(xs neutral-10) uppercase font-semibold tracking-wide mb-3">
        {props.title}
      </h6>
      {(props.type === "pages" || props.type === "backlinks") &&
        Array.isArray(props.items) && (
          <ul class="-mx-2 flex flex-col items-start">
            {props.items.map((item) => (
              <PageItem
                title={item.title || ""}
                description={item.description}
                url={item.url}
                isDirIndex={item.index === "dir"}
                pinned={item.pinned}
                date={item.datePublished}
                lang={props.lang}
                icon={
                  props.type === "backlinks" ? (
                    <ChevronLeft />
                  ) : (
                    <ChevronRight />
                  )
                }
              />
            ))}
          </ul>
        )}
      {props.type === "tags" && (
        <ul class="-mx-2 flex flex-wrap">
          {Object.entries(props.items).map((item) => (
            <TagItem name={item[0]} pageCount={item[1].length} />
          ))}
        </ul>
      )}
    </section>
  );
}
