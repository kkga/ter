import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Heading, Page } from "../types.d.ts";

interface BodyProps {
  html: string;
}

interface HeaderProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  tags?: string[];
  headings?: Heading[];
  showToc?: boolean;
  hideTitle?: boolean;
  dateFormat?: Record<string, string>;
  locale?: string;
  size?: "small" | "default";
}

interface ArticleProps {
  page: Page;
  dateFormat?: Record<string, string>;
  locale?: string;
}

const styles = {
  header: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-black` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
  dotDivider: css({
    "&::before": { content: '"·"', margin: "0 1ch" },
  }),
  content: css({
    "*": apply`col-start-2 col-end-5`,
    h1: apply`col-start-1 text-3xl   mt-12 font-semibold tracking-tight`,
    h2: apply`col-start-1 text-2xl   mt-12 font-semibold tracking-tight`,
    h3: apply`col-start-1 text-base  mt-8  font-bold`,
    h4: apply`col-start-1 text-base  mt-8  font-bold`,
    h5: apply`col-start-1 text-base  mt-8  font-bold`,
    h6: apply`col-start-1 text-base  mt-8  font-bold`,
    a: apply`text-current hover:(text-accent-500)`,
    p: apply``,
    img: apply`col-start-2 col-end-6`,
    video: apply`col-start-2 col-end-6`,
    figure: css(
      apply`col-start-2 col-end-6`,
      { img: apply`m-0` },
      { video: apply`m-0` },
    ),
    figcaption: apply`text-center mt-1 text(sm)`,
    ul: apply`list(disc)`,
    ol: apply`list(decimal)`,
    hr: apply`my-8 border(gray-200) dark:(border(gray-700))`,
    pre:
      apply`mb-4 overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-800 text-gray-300)`,
    details:
      apply`mb-4 rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-500 dark:(bg-gray-800 text-gray-400)`,
    blockquote: apply`mb-4 mx-8 text-lg text-gray-500`,
    del: apply`opacity-50`,
  }),
};

const ArticleHeader: FunctionComponent<HeaderProps> = ({
  title,
  description,
  datePublished,
  tags,
  headings,
  showToc,
  locale,
  dateFormat = { year: "numeric", month: "short", day: "numeric" },
  hideTitle,
  size = "default",
}) => (
  <header
    class={tw`col-span-6 mb-8 only-child:(m-0) flex flex-col gap-2 ${styles.header}`}
  >
    {!hideTitle && size === "default" &&
      <h1 class={tw`mt-0 text-3xl font-semibold tracking-tight`}>{title}</h1>}
    {!hideTitle && size === "small" &&
      <h1 class={tw`mt-0 text-2xl font-bold tracking-tight`}>{title}</h1>}
    <div class={tw`text-sm text-gray-500`}>
      <span>{description}</span>
      <div class={tw`flex align-baseline`}>
        {datePublished && (
          <div>
            <time dateTime={datePublished.toString()}>
              {datePublished.toLocaleDateString(locale, dateFormat)}
            </time>
          </div>
        )}
        {tags && (
          <ul class={tw`flex ${styles.dotDivider}`}>
            {tags.map((tag) => (
              <li class={tw`mr-2`}>
                <a href={`/tag/${tag}`}>#{tag}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {showToc && headings?.some((h) => h.level > 2) && (
      <details class={tw`mt-4 text-sm text-gray-500 dark:(text-gray-400)`}>
        <summary>Contents</summary>
        <ol class={tw`mt-2`}>
          {headings.filter((h) =>
            h.level < 4
          ).map((h: Heading) => {
            return (
              <li class={h.level > 2 ? tw`ml-4` : tw`font-semibold`}>
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
}) => (
  <article
    class={tw`
           grid grid-cols-6 gap-4
           px-4 py-12`}
  >
    <ArticleHeader
      title={page.title}
      description={page.description}
      datePublished={page.datePublished}
      tags={page.tags}
      headings={page.headings}
      hideTitle={page.hideTitle}
      dateFormat={dateFormat}
      locale={locale}
      showToc={page.showToc}
    />
    <div
      class={tw`contents ${styles.content}`}
      dangerouslySetInnerHTML={{ __html: page.html }}
    />
  </article>
);

export default Article;
