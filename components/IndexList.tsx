import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Page } from "../types.d.ts";

const styles = {
  section: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-accent-500` },
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
    dateFormat = { year: "2-digit", month: "numeric" },
    locale,
  },
) => {
  return (
    <li
      class={tw`
        relative
        flex
        gap-1
        items-baseline
        justify-between
        leading-6`}
    >
      <a className={tw`truncate`} href={url.pathname}>
        {pinned && <span class={tw`mr-1`}>★</span>}
        {title}
      </a>
      {isDirIndex && <div class={tw`opacity-50 select-none`}>/ ..</div>}
      <span
        class={tw`
        flex-1
        border(b dashed gray-200)
        dark:(border(gray-700))`}
      />
      {date && (
        <time
          class={tw`text(xs gray-500) tabular-nums`}
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
        <a class={tw`inline-block mr-3`} href={`/tag/${item}`}>
          #{item}
        </a>
      );
    }
  };
  return (
    <section class={tw`${styles.section}`}>
      <h6
        class={tw`
          flex
          items-baseline
          gap-2
          text-xs
          leading-6
          font-medium
          uppercase
          tracking-wide
          text-gray-500`}
      >
        {title}
        <span
          class={tw`flex-1 border(b solid gray-200) dark:(border-gray-700)`}
        />
      </h6>
      <ul>
        {items.map((item) => renderItem(item))}
      </ul>
    </section>
  );
};

export default IndexList;