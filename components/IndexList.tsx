import { css, FC, h, tw } from "../deps.ts";
import { Page } from "../types.d.ts";

const IndexList: FC<{ title: string; items: Page[] }> = (
  { title, items },
) => {
  const itemDirStyle = css({ "&::after": { content: '"/.."' } });
  const itemPinnedStyle = css({ "&::before": { content: '"*"' } });

  return (
    <section class={tw`text(gray-600)`}>
      <h6
        class={tw`flex items-baseline gap-2 text-xs leading-6 font-medium`}
      >
        {title}
        <span class={tw`flex-1 border(b solid gray-300)`} />
      </h6>
      <ul class={tw`flex flex-col`}>
        {items.map((item: Page) => {
          return (
            <li class={tw`flex gap-2 items-baseline justify-between leading-6`}>
              <a
                className={tw`font-medium ${item.isIndex && itemDirStyle} ${
                  item.pinned && itemPinnedStyle
                }`}
                href={item.url.pathname}
              >
                {item?.title}
              </a>
              <span class={tw`flex-1 border(b solid)`} />
              {item.datePublished && (
                <time dateTime={item.datePublished.toString()}>
                  {item?.datePublished.toLocaleDateString()}
                </time>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default IndexList;
