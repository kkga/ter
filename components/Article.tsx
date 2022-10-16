import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Heading } from "../types.d.ts";

interface ArticleProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  tags?: string[];
  headings?: Heading[];
  hideTitle?: boolean;
  html?: string;
  dateFormat?: Record<string, string>;
  locale?: string;
  headerSize?: "small" | "default";
}

const styles = {
  dotDivider: css({
    "&::before": { content: '"·"', margin: "0 1ch" },
  }),
  header: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-accent-500` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
  content: css({
    h1: apply`text-3xl   mt-8 mb-4 font-bold tracking-tight`,
    h2: apply`text-2xl   mt-8 mb-4 font-bold tracking-tight`,
    h3: apply`text-xl    mt-8 mb-3 font-bold tracking-tight`,
    h4: apply`text-lg    mt-8 mb-2 font-bold tracking-tight`,
    h5: apply`text-lg    mt-8 mb-2 font-bold tracking-tight`,
    h6: apply`text-base  mt-8 mb-2 font-bold tracking-tight`,
    p: apply`my-4`,
    img: apply`my-6`,
    video: apply`my-6`,
    figure: css(
      apply`my-6`,
      { img: apply`m-0` },
      { video: apply`m-0` },
    ),
    figcaption: apply`text-center mt-1 text(sm)`,
    ul: apply`list(disc inside)`,
    ol: apply`list(inside)`,
    hr: apply`my-8 border(gray-200) dark:(border(gray-700))`,
    pre:
      apply`my-4 overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-900 text-gray-300)`,
    details:
      apply`rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-500 dark:(bg-gray-800 text-gray-400)`,
    blockquote: apply`mx-8 text-lg text-gray-500`,
    del: apply`opacity-50`,
  }),
};

const Article: FunctionComponent<ArticleProps> = ({
  title,
  description,
  datePublished,
  tags,
  headings,
  locale,
  dateFormat = { year: "numeric", month: "short", day: "numeric" },
  html,
  hideTitle,
  headerSize = "default",
}) => (
  <article>
    <header
      class={tw`mb-8 only-child:(m-0) flex flex-col gap-2 ${styles.header}`}
    >
      {!hideTitle && headerSize === "default" &&
        <h1 class={tw`text-4xl font-extrabold tracking-tight`}>{title}</h1>}
      {!hideTitle && headerSize === "small" &&
        <h1 class={tw`text-2xl font-extrabold tracking-tight`}>{title}</h1>}
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

      {headings?.some((h) => h.level > 2) && (
        <details class={tw`mt-4 text-sm text-gray-500 dark:(text-gray-400)`}>
          <summary>Contents</summary>
          <ol class={tw`mt-2`}>
            {headings.filter((h) =>
              h.level < 4
            ).map((h: Heading) => {
              return (
                <li class={h.level > 2 ? tw`ml-4` : tw`font-bold`}>
                  <a href={`#${h.slug}`}>{h.text}</a>
                </li>
              );
            })}
          </ol>
        </details>
      )}
    </header>
    {html &&
      (
        <div
          class={tw(styles.content)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
  </article>
);

export default Article;
