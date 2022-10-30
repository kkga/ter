import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Page } from "../types.d.ts";

const styles = {
  section: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-black dark:(text-white)` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};

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
    <li
      class={tw`
        flex
        gap-1
        items-baseline
        justify-between
        leading-6`}
    >
      <a className={tw`truncate`} href={url.pathname}>
        {pinned && <span>★</span>} {title}
      </a>
      {isDirIndex && <div class={tw`opacity-50 select-none`}>/ ..</div>}
      <span
        class={tw`
        flex-1
        border(b solid gray-300)
        dark:(border(gray-700))`}
      />
      {date && (
        <time
          class={tw`font-mono text(xs gray-500) tabular-nums`}
          dateTime={date.toString()}
        >
          {date.toLocaleDateString(locale, dateFormat)}
        </time>
      )}
    </li>
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
               dark:(ring-offset-black))
             ${styles.section}`}
    >
      <h6
        class={tw`
               mb-2
               text(xs gray-500)
               font-mono
               font-medium uppercase
               `}
      >
        {title}
      </h6>
      <ul class={tw`text-sm leading-6`}>
        {items.map((item) => renderItem(item))}
      </ul>
    </section>
  );
};

export default IndexList;
