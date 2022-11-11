import { FunctionComponent as FC, h } from "preact";
import { apply, tw } from "twind";
import { css } from "twind/css";
import { styleUtils } from "@components/styleUtils.ts";
import { Heading, Page } from "../types.d.ts";

interface HeaderProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  dateUpdated?: Date;
  tags?: string[];
  headings?: Heading[];
  dateFormat?: Intl.DateTimeFormatOptions;
  locale?: string;
  size?: "small" | "default";
  showTitle?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
  showToc?: boolean;
}

interface ArticleProps {
  page: Page;
  dateFormat?: Intl.DateTimeFormatOptions;
  locale?: string;
  headerSize?: "small" | "default";
}

const contentStyles = css({
  "> *": apply`
    mb-4 first-child:(mt-0)
  `,
  h1: apply`
    text-3xl mt-12 font-semibold tracking-tight
  `,
  h2: apply`
    text-xl mt-12 font-semibold tracking-tight
  `,
  h3: apply`
    text-base mt-6 mb-2 font-semibold tracking-tight
  `,
  h4: apply`
    text-base mt-6 mb-2 font-semibold tracking-tight
  `,
  h5: apply`
    text-base mt-6 mb-2 font-semibold
  `,
  h6: apply`
    text-base mt-6 mb-2 font-semibold
  `,
  // a: apply`
  //   text-accent-700
  //   no-underline
  //   hover:(
  //     bg-accent-100 text-accent-900
  //   )
  //   dark:(
  //     text-accent-300
  //     hover:(bg-accent-900 text-accent-100)
  //   )
  // `,
  "a[rel~='external']": css(
    apply`
      not-hover:text-current 
      underline  hover:(no-underline)
    `,
    {
      textDecorationStyle: "dotted",
      textDecorationThickness: "1px",
    },
  ),
  p: apply``,
  img: apply``,
  video: apply``,
  figure: css(
    apply`my-6`,
    { img: apply`m-0` },
    { video: apply`m-0` },
    { figcaption: apply`mt-1 text(center sm gray-500)` },
  ),
  ul: apply`
    list(inside disc)
  `,
  ol: apply`
    list(inside decimal)
  `,
  hr: apply`
    my-8
    border(gray-200)
    dark:(border(gray-800))
  `,
  pre: apply`
    overflow-x-scroll
    text-xs
    font-mono
    py-2 px-4
    leading-snug
    text-pink-700
    border(l gray-300)
    dark:(
      border(l gray-800)
      text-pink-300
    )
    md:(
      text-sm
    )
  `,
  details: apply`
    rounded
    p-2
    text-sm
    children:(my-2
    first-child:my-0
    last-child:mb-0)
    bg-gray-100
    text-gray-600
    dark:(bg-gray-900
    text-gray-400)
  `,
  blockquote: apply`
    mb-4 mx-8 text-lg text-gray-500
  `,
  del: apply`
    opacity-60
  `,
  table: apply`
    text(left sm)
    table-auto
    w-full
    overflow-scroll
  `,
  th: apply`
    border(b gray-300)
    dark:(border-gray-700)
    text(gray-500)
    font(medium)
    py-1
  `,
  td: apply`
    border(b gray-200)
    dark:(border-gray-800)
    py-1
    pr-3
    align-baseline
  `,
  ".full-bleed": apply`
    lg:(-mx-24)
    xl:(-mx-32)
  `,
});

const Header: FC<HeaderProps> = ({
  title,
  description,
  datePublished,
  dateUpdated,
  tags,
  headings,
  locale,
  dateFormat = { year: "numeric", month: "short", day: "numeric" },
  showTitle,
  showDescription,
  showMeta,
  showToc,
  size = "default",
}) => (
  <header
    class={tw`
      ${size === "small" ? "mb-4" : "mb-16"} 
      flex flex-col ${size === "small" ? "gap-0.5" : "gap-2"} 
      only-child:(m-0) 
      empty:hidden 
      tracking-tight
      ${styleUtils.linkDimmer}
    `}
  >
    {showTitle && (
      <h1
        class={tw`
          mt-0
          ${size === "small" ? "text" : "text-2xl md:(text-3xl)"}
          font-semibold tracking-tight
        `}
      >
        {title}
      </h1>
    )}

    {showMeta && (datePublished || tags) && (
      <div
        class={tw`flex items-baseline text(sm gray-500) ${styleUtils.childrenDivider}`}
      >
        {datePublished && (
          <div>
            <time dateTime={datePublished.toString()}>
              {datePublished.toLocaleDateString(locale, dateFormat)}
            </time>
          </div>
        )}
        {dateUpdated && (
          <div>
            Updated:{" "}
            <time dateTime={dateUpdated.toString()}>
              {dateUpdated.toLocaleDateString(locale, dateFormat)}
            </time>
          </div>
        )}
        {tags && (
          <ul class={tw`space-x-2`}>
            {tags.map((tag) => (
              <li class={tw`inline`}>
                <a href={`/tags##${tag}`}>#{tag}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
    {showDescription && description && (
      <p class={tw`text(sm gray-500)`}>{description}</p>
    )}

    {showToc && headings?.some((h) => h.level > 2) && (
      <details
        class={tw`
          pl-4
          border(l gray-300)
          mt-4
          text-sm
          text-gray-500
        `}
      >
        <summary class={tw`text-current`}>Contents</summary>
        <ol class={tw`mt-2`}>
          {headings
            .filter((h) => h.level < 4)
            .map((h: Heading) => {
              return (
                <li class={h.level > 2 ? tw`pl-3` : tw`font-medium`}>
                  <a href={`#${h.slug}`}>{h.text}</a>
                </li>
              );
            })}
        </ol>
      </details>
    )}
  </header>
);

const Article: FC<ArticleProps> = ({
  page,
  dateFormat,
  locale,
  children,
  headerSize = "default",
}) => (
  <article
    class={tw`sibling:(
      mt-6 pt-6 border(t dashed gray-300)
      dark:(border(gray-700))
    )`}
  >
    {page.showHeader && (
      <Header
        title={page.title}
        description={page.description}
        datePublished={page.datePublished}
        dateUpdated={page.dateUpdated}
        tags={page.tags}
        headings={page.headings}
        dateFormat={dateFormat}
        locale={locale}
        size={headerSize}
        showTitle={page.showTitle}
        showMeta={page.showMeta}
        showDescription={page.showDescription}
        showToc={page.showToc}
      />
    )}
    {page.html && (
      <div
        class={tw`${contentStyles}`}
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    )}
    {children}
  </article>
);

export default Article;
