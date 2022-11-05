import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Heading, Page } from "../types.d.ts";
import { styleUtils } from "@components/styleUtils.ts";

interface HeaderProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  dateUpdated?: Date;
  tags?: string[];
  headings?: Heading[];
  dateFormat?: Record<string, string>;
  locale?: string;
  size?: "small" | "default";
  showTitle?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
  showToc?: boolean;
}

interface ArticleProps {
  page: Page;
  dateFormat?: Record<string, string>;
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
    text-base mt-6 mb-1 font-semibold
  `,
  h4: apply`
    text-base mt-6 mb-1 font-semibold
  `,
  h5: apply`
    text-base mt-6 mb-1 font-semibold
  `,
  h6: apply`
    text-base mt-6 mb-1 font-semibold
  `,
  a: apply`
    text-accent-700 dark:(text-accent-400) no-underline hover:underline
  `,
  "a[rel~='external']": apply`
    text-current underline
  `,
  p: apply``,
  img: apply``,
  video: apply``,
  figure: css(
    apply`my-6`,
    { img: apply`m-0` },
    { video: apply`m-0` },
    { figcaption: apply`mt-1 text(center sm gray-500)` }
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
    dark:(border(gray-700))
  `,
  pre: apply`
    overflow-x-scroll
    text-sm
    font-mono
    p-2
    rounded
    leading-snug
    bg-gray-100
    dark:(bg-gray-800 text-gray-300)
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
    border
    border-gray-300
    border-collapse
    dark:(border-gray-700)
  `,
  th: apply`
    border
    border-gray-300
    dark:(border-gray-700)
    py-1
    px-2
  `,
  td: apply`
    border
    border-gray-300
    dark:(border-gray-700)
    py-1
    px-2
  `,
  ".full-bleed": apply`lg:(-mx-24)`,
});

const Header: FunctionComponent<HeaderProps> = ({
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
    class={tw`${
      size === "small" ? "mb-8" : "mb-16"
    } only-child:(m-0) flex flex-col gap-4 empty:hidden ${
      styleUtils.linkDimmer
    }`}
  >
    {showMeta && (datePublished || tags) && (
      <div
        class={tw`flex font-mono items-baseline text(xs gray-500) ${styleUtils.childrenDivider}`}
      >
        {datePublished && (
          <div>
            Published:{" "}
            <time class={tw`font-medium`} dateTime={datePublished.toString()}>
              {datePublished.toLocaleDateString(locale, dateFormat)}
            </time>
          </div>
        )}
        {dateUpdated && (
          <div>
            Updated:{" "}
            <time class={tw`font-medium`} dateTime={dateUpdated.toString()}>
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

    {showTitle && (
      <h1
        class={tw`
          mt-0
          ${size === "small" ? "text-xl" : "text-2xl md:(text-4xl)"}
          font-extrabold tracking-tight
        `}
      >
        {title}
      </h1>
    )}

    {showDescription && description && (
      <p class={tw`text-xl text-gray-500`}>{description}</p>
    )}

    {showToc && headings?.some((h) => h.level > 2) && (
      <details
        open
        class={tw`
          mt-4
          text-sm
          text-gray-600
          dark:(text-gray-400)
        `}
      >
        <summary>Contents</summary>
        <ol class={tw`mt-2`}>
          {headings
            .filter((h) => h.level < 4)
            .map((h: Heading) => {
              return (
                <li
                  class={
                    h.level > 2 ? tw`py-px pl-3` : tw`py-0.5 font-semibold`
                  }
                >
                  <a href={`#${h.slug}`}>{h.text}</a>
                </li>
              );
            })}
        </ol>
      </details>
    )}
  </header>
);

const Article: FunctionComponent<ArticleProps> = ({
  page,
  dateFormat,
  locale,
  children,
  headerSize = "default",
}) => (
  <article
    class={tw`sibling:(
      mt-8 pt-8 border(t dashed gray-400)
      dark:(border(gray-700))
    )`}
  >
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
