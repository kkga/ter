import { css, FC, h, tw } from "../deps.ts";
import { Body } from "../types.d.ts";

const IndexList: FC<{ title: string; items: Body[] }> = (
  { title, items },
) => {
  const itemDirStyle = css({ "&::after": { content: '"/.."' } });
  const itemPinnedStyle = css({ "&::before": { content: '"*"' } });

  return (
    <section class={tw`text(gray-600)`}>
      <h6 class={tw`text(xs) font-bold`}>{title}</h6>
      <ul class={tw`flex flex-col`}>
        {items.map((item: Body) => {
          return (
            <li
              class={tw`flex gap-2 justify-between ${
                item.isIndex && itemDirStyle
              } ${item.pinned && itemPinnedStyle}`}
            >
              <a
                className={tw`font-bold `}
                href={item.url.pathname}
              >
                {item?.title}
              </a>
              {item.isIndex && "/.."}
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
