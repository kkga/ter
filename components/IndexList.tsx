import { FunctionComponent as FC, h, VNode } from "preact";
import { tw } from "twind/";
import { Page } from "../types.d.ts";
import { styleUtils } from "@components/styleUtils.ts";

const ArrowRightIcon: FC = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
      </path>
    </svg>
  );
};

const ArrowLeftIcon: FC = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
      </path>
    </svg>
  );
};

const StarIcon: FC = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.97942 1.25171L6.9585 1.30199L5.58662 4.60039C5.54342 4.70426 5.44573 4.77523 5.3336 4.78422L1.7727 5.0697L1.71841 5.07405L1.38687 5.10063L1.08608 5.12475C0.820085 5.14607 0.712228 5.47802 0.914889 5.65162L1.14406 5.84793L1.39666 6.06431L1.43802 6.09974L4.15105 8.42374C4.23648 8.49692 4.2738 8.61176 4.24769 8.72118L3.41882 12.196L3.40618 12.249L3.32901 12.5725L3.25899 12.866C3.19708 13.1256 3.47945 13.3308 3.70718 13.1917L3.9647 13.0344L4.24854 12.861L4.29502 12.8326L7.34365 10.9705C7.43965 10.9119 7.5604 10.9119 7.6564 10.9705L10.705 12.8326L10.7515 12.861L11.0354 13.0344L11.2929 13.1917C11.5206 13.3308 11.803 13.1256 11.7411 12.866L11.671 12.5725L11.5939 12.249L11.5812 12.196L10.7524 8.72118C10.7263 8.61176 10.7636 8.49692 10.849 8.42374L13.562 6.09974L13.6034 6.06431L13.856 5.84793L14.0852 5.65162C14.2878 5.47802 14.18 5.14607 13.914 5.12475L13.6132 5.10063L13.2816 5.07405L13.2274 5.0697L9.66645 4.78422C9.55432 4.77523 9.45663 4.70426 9.41343 4.60039L8.04155 1.30199L8.02064 1.25171L7.89291 0.944609L7.77702 0.665992C7.67454 0.419604 7.32551 0.419604 7.22303 0.665992L7.10715 0.944609L6.97942 1.25171ZM7.50003 2.60397L6.50994 4.98442C6.32273 5.43453 5.89944 5.74207 5.41351 5.78103L2.84361 5.98705L4.8016 7.66428C5.17183 7.98142 5.33351 8.47903 5.2204 8.95321L4.62221 11.461L6.8224 10.1171C7.23842 9.86302 7.76164 9.86302 8.17766 10.1171L10.3778 11.461L9.77965 8.95321C9.66654 8.47903 9.82822 7.98142 10.1984 7.66428L12.1564 5.98705L9.58654 5.78103C9.10061 5.74207 8.67732 5.43453 8.49011 4.98442L7.50003 2.60397Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
      </path>
    </svg>
  );
};

interface ItemProps {
  url: URL;
  title: string;
  description?: string;
  pinned?: boolean;
  isDirIndex?: boolean;
  date?: Date;
  dateFormat?: Record<string, string>;
  tags?: string[];
  locale?: string;
  icon?: VNode;
}

const Item: FC<ItemProps> = ({
  title,
  description,
  url,
  pinned,
  isDirIndex,
  date,
  dateFormat = { year: "2-digit", day: "2-digit", month: "short" },
  tags,
  locale,
  icon,
}) => {
  return (
    <li>
      <a
        href={url.pathname}
        class={tw`
          relative
          flex flex-row items-center gap-2
          py-2
          text-gray-600
          hover:(
            bg-transparent
          )
          dark:(
            text(gray-400) 
            hover:(
              text-pink-200
            )
          )
        `}
      >
        {pinned && (
          <div
            class={tw`
              md:(absolute top-[9px] left-[-20px])
            `}
          >
            <StarIcon />
          </div>
        )}
        <div
          class={tw`flex-1 flex overflow-hidden whitespace-nowrap font-medium ${styleUtils.childrenDivider}`}
        >
          <span class={tw`flex-shrink-0 truncate`}>
            {title}
            {isDirIndex && <span class={tw`select-none`}>/..</span>}
          </span>
          {description && (
            <span
              class={tw`
                truncate font-normal opacity-70
              `}
            >
              {description}
            </span>
          )}
        </div>

        {date && (
          <time
            class={tw`text(xs) tabular-nums slashed-zero flex-shrink-0`}
            dateTime={date.toString()}
          >
            {date.toLocaleDateString(locale, dateFormat)}
          </time>
        )}
        <div class={tw`flex-shrink-0`}>{icon}</div>
      </a>
    </li>
  );
};

const IndexList: FC<{
  title: string;
  items: Page[] | Record<string, Page[]>;
  type: "pages" | "tags" | "backlinks";
}> = ({ title, items, type }) => {
  const renderItem = (item: Page | [string, Page[]]) => {
    if (typeof item === "object" && "url" in item) {
      return (
        <Item
          title={item.title || ""}
          description={item.description}
          url={item.url}
          isDirIndex={item.index === "dir"}
          pinned={item.pinned}
          date={item.datePublished}
          tags={item.tags}
          icon={type === "backlinks" ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        />
      );
    } else {
      const tag = item[0];
      const count = item[1].length;
      return (
        <li>
          <a
            class={tw`
            leading-6 
            text-gray-600
            dark:(
              text(gray-400) 
            )
          `}
            href={`/tags##${tag}`}
          >
            {item} <span class={tw`opacity-60`}>{count}</span>
          </a>
        </li>
      );
    }
  };

  return (
    <section
      id={title}
      class={tw`
        text(sm) tracking-tight leading-4
        target:(
          ring ring-offset-8
          dark:(ring-offset-black)
        )
      `}
    >
      <h6
        class={tw`
          pb-2
          text(gray-500)
          border(b gray-200)
          dark:(
            border(gray-800)
          )
        `}
      >
        {title}
        <span class={tw`font-normal opacity-60`}>
          {" "}: {Object.keys(items).length}
        </span>
      </h6>
      <ul
        class={tw`
          flex 
          tracking-tight
          ${
          (type === "backlinks" || type === "pages") &&
          "flex-col divide-y divide-gray-200 dark:(divide-gray-800)"
        }
          ${type === "tags" && `flex-wrap pt-1`}
          ${type === "tags" && styleUtils.childrenDivider}
        `}
      >
        {Array.isArray(items)
          ? items.map((item) => renderItem(item))
          : Object.entries(items).map((item) => renderItem(item))}
      </ul>
    </section>
  );
};

export default IndexList;
