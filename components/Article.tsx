import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Heading, Page } from "../types.d.ts";

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
    "&:hover": { a: apply`text-black dark:(text-white)` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
  dotDivider: css({
    "&::before": { content: '"·"', margin: "0 1ch" },
  }),
  content: css({
    "> *": apply`mb-4 first-child:(mt-0)`,
    h1: apply`text-3xl   mt-12 font-semibold tracking-tight`,
    h2: apply`text-xl    mt-12 font-semibold tracking-tight`,
    h3: apply`text-base  mb-1  font-semibold`,
    h4: apply`text-base  mb-1  font-semibold`,
    h5: apply`text-base  mb-1  font-semibold`,
    h6: apply`text-base  mb-1  font-semibold`,
    a: apply`text-current`,
    p: apply``,
    img: apply``,
    video: apply``,
    figure: css(
      { img: apply`m-0` },
      { video: apply`m-0` },
      { figcaption: apply`mt-1 text(center sm gray-500)` },
    ),
    ul: apply`list(inside disc)`,
    ol: apply`list(inside decimal)`,
    hr: apply`my-8 border(gray-200) dark:(border(gray-700))`,
    pre:
      apply` overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-800 text-gray-300)`,
    details:
      apply`rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-600 dark:(bg-gray-900 text-gray-400)`,
    blockquote: apply`mb-4 mx-8 text-lg text-gray-500`,
    del: apply`opacity-50`,
    table:
      apply`text(left sm) table-auto w-full overflow-scroll border border-collapse`,
    th: apply`border py-1 px-2`,
    td: apply`border py-1 px-2`,
  }),
};

const Header: FunctionComponent<HeaderProps> = ({
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
    class={tw`mb-16 only-child:(m-0) flex flex-col gap-2 ${styles.header}`}
  >
    <div class={tw`flex items-baseline text(xs gray-500) font-mono`}>
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
    {!hideTitle && size === "default" &&
      <h1 class={tw`mt-0 text-4xl font-semibold tracking-tight`}>{title}</h1>}
    {!hideTitle && size === "small" &&
      <h1 class={tw`mt-0 text-xl font-bold tracking-tight`}>{title}</h1>}
    {description && (
      <p class={tw`text-gray-500`}>
        {description}
      </p>
    )}

    {showToc && headings?.some((h) => h.level > 2) && (
      <details
        open
        class={tw`
               mt-4
               text-sm
               text-gray-600
               dark:(text-gray-400)`}
      >
        <summary>Contents</summary>
        <ol class={tw`mt-2`}>
          {headings.filter((h) => h.level < 4).map((h: Heading) => {
            return (
              <li
                class={h.level > 2 ? tw`py-px pl-3` : tw`py-0.5 font-medium`}
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
}) => (
  <article
    class={tw`sibling:(
      mt-4 pt-4 border(t dashed white)
    )`}
  >
    <Header
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
    {page.html &&
      (
        <div
          class={tw`${styles.content}`}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      )}
    {children}
  </article>
);

export default Article;
