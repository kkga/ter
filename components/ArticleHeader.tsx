import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Heading } from "../types.d.ts";

interface ArticleHeaderProps {
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

const styles = {
  header: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-accent-500` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
  dotDivider: css({
    "&::before": { content: '"·"', margin: "0 1ch" },
  }),
};

const ArticleHeader: FunctionComponent<ArticleHeaderProps> = ({
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
    class={tw`mb-8 only-child:(m-0) flex flex-col gap-2 ${styles.header}`}
  >
    {!hideTitle && size === "default" &&
      <h1 class={tw`text-4xl font-extrabold tracking-tight`}>{title}</h1>}
    {!hideTitle && size === "small" &&
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

    {showToc && headings?.some((h) => h.level > 2) && (
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
);

export default ArticleHeader;
