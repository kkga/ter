import { FunctionComponent, h } from "preact";
import { tw } from "twind/";
import { Page } from "../types.d.ts";
import { styleUtils } from "@components/styleUtils.ts";

const FileIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 2.5C3 2.22386 3.22386 2 3.5 2H9.08579C9.21839 2 9.34557 2.05268 9.43934 2.14645L11.8536 4.56066C11.9473 4.65443 12 4.78161 12 4.91421V12.5C12 12.7761 11.7761 13 11.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5ZM3.5 1C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V4.91421C13 4.51639 12.842 4.13486 12.5607 3.85355L10.1464 1.43934C9.86514 1.15804 9.48361 1 9.08579 1H3.5ZM4.5 4C4.22386 4 4 4.22386 4 4.5C4 4.77614 4.22386 5 4.5 5H7.5C7.77614 5 8 4.77614 8 4.5C8 4.22386 7.77614 4 7.5 4H4.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5ZM4.5 10C4.22386 10 4 10.2239 4 10.5C4 10.7761 4.22386 11 4.5 11H10.5C10.7761 11 11 10.7761 11 10.5C11 10.2239 10.7761 10 10.5 10H4.5Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    >
    </path>
  </svg>
);

const Item: FunctionComponent<{
  url: URL;
  title: string;
  pinned?: boolean;
  isDirIndex?: boolean;
  date?: Date;
  dateFormat?: Record<string, string>;
  locale?: string;
}> = (
  {
    title,
    url,
    pinned,
    isDirIndex,
    date,
    dateFormat = { year: "2-digit", month: "2-digit" },
    locale,
  },
) => {
  return (
    <a
      href={url.pathname}
      class={tw`
        flex
        gap-1
        items-baseline
        justify-between
        rounded
        py-0.5 px-1
        -mx-1
        hover:(
         bg-gray-100
         decoration-none
        )
      `}
    >
      <div class={tw`self-center`}>
        <FileIcon />
      </div>
      <span class={tw`truncate !no-underline`}>
        {pinned && <span>★</span>} {title}
      </span>
      {isDirIndex && <div class={tw`opacity-50 select-none`}>/ ..</div>}
      <span
        class={tw`
          flex-1
          border(b solid gray-300)
          dark:(border(gray-700))
        `}
      />
      {date && (
        <time
          class={tw`font-mono text(xs gray-500) tabular-nums`}
          dateTime={date.toString()}
        >
          {date.toLocaleDateString(locale, dateFormat)}
        </time>
      )}
    </a>
  );
};

const IndexList: FunctionComponent<
  { title: string; items: Page[] | string[] }
> = (
  { title, items },
) => {
  const renderItem = (item: Page | string) => {
    if (typeof item === "object") {
      return (
        <Item
          title={item.title || ""}
          url={item.url}
          isDirIndex={item.index === "dir"}
          pinned={item.pinned}
          date={item.datePublished}
        />
      );
    } else {
      return (
        <a class={tw`inline-block mr-3`} href={`/tags##${item}`}>
          #{item}
        </a>
      );
    }
  };
  return (
    <section
      id={title}
      class={tw`
        target:(
          ring ring-offset-8
          dark:(ring-offset-black)
        )
        ${styleUtils.linkDimmer}
      `}
    >
      <h6
        class={tw`
          mb-2
          text(xs gray-500)
          font-semibold
        `}
      >
        {title}
      </h6>
      <ul class={tw`flex flex-col gap-1 text-sm`}>
        {items.map((item) => renderItem(item))}
      </ul>
    </section>
  );
};

export default IndexList;
