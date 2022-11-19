import { Heading, Page } from "../types.d.ts";
import { apply, css, screen, tw } from "../deps.ts";
import { styleUtils } from "./styleUtils.ts";

interface HeaderProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  url: URL;
  dateUpdated?: Date;
  tags?: string[];
  headings?: Heading[];
  lang: Intl.LocalesArgument;
  size: "small" | "default";
  showTitle: boolean;
  showMeta: boolean;
  showDescription: boolean;
  showToc: boolean;
}

interface ArticleProps {
  page: Page;
  lang: Intl.LocalesArgument;
  isInLog?: boolean;
  children?: preact.ComponentChildren;
}

const contentStyles = css({
  "> *": apply`
    mb-4 first-child:(mt-0)
  `,
  h1: apply`
    text-3xl mt-12 mb-6 font-semibold tracking-tight
  `,
  h2: apply`
    text-2xl mt-12 mb-6 font-semibold tracking-tight
  `,
  h3: apply`
    text-base mt-8 font-semibold tracking-tight
  `,
  "h4, h5, h6": apply`
    text(xs gray-700 dark:(gray-400)) uppercase mt-6 mb-2 font-semibold tracking-wide
  `,
  ":is(h1,h2,h3,h4,h5,h6):not(:hover) > a.anchor": apply`
    hidden
  `,
  ":is(h1,h2,h3,h4,h5,h6) > a.anchor:hover": apply`
    no-underline
  `,
  "hr + *": apply`
    mt-0
  `,
  "a[rel~='external']": css(
    apply`text-current underline`,
    { "&:not(:hover)": { textDecorationStyle: "dotted" } },
  ),
  p: apply``,
  img: apply``,
  video: apply``,
  figure: css(
    apply`my-6`,
    { img: apply`m-0` },
    { video: apply`m-0` },
    { figcaption: apply`mt-1 text(center sm gray-600 dark:gray-400)` },
  ),
  ul: apply`
    list(inside disc)
  `,
  ol: apply`
    list(inside decimal)
  `,
  "ul ul, ol ol": apply`
    pl-4
  `,
  hr: apply`
    my-10
    border(gray-200)
    dark:(border(gray-800))
  `,
  code: apply`
    font-mono
    text-sm
  `,
  ":not(pre) code": apply`
    px-1 py-px
    bg(gray-50 dark:(gray-900))
    rounded-sm
  `,
  pre: apply`
    overflow-x-scroll
    text(xs md:sm)
    font-mono
    leading-snug
  `,
  "pre:not(.hljs)": apply`
    text(green-700 dark:green-600)
  `,
  details: css(
    apply`
      text-sm leading-snug
      children:(
        my-2
        first-child:my-0
        last-child:mb-0
      )
      text(gray-500 dark:gray-400)
    `,
    {
      "summary": apply`font-semibold`,
      "&[open] summary": apply`mb-2`,
    },
  ),
  blockquote: apply`
    mb-4 mx-8 text(lg gray-500)
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
    border(b gray-100 dark:gray-900)
    text(xs gray-500)
    uppercase
    font(medium)
    py-1 pr-4
  `,
  td: apply`
    border(b gray-100 dark:gray-900)
    py-1 pr-3
    align-baseline
  `,
  dt: apply`
    font-semibold
  `,
  dd: apply`
    pl-4
  `,
  ".full-bleed": apply`
    lg:(-mx-24)
    xl:(-mx-32)
  `,
  ".cols-2": apply`sm:grid grid(cols-2) gap-4`,
  ".cols-3": apply`sm:grid grid(cols-3) gap-4`,
  ".cols-4": apply`grid grid(cols-2 md:cols-4) gap-4`,
});

function Toc({ headings }: { headings: Heading[] }) {
  const getColumnsCss = (hCount: number) =>
    hCount > 4
      ? css`
        ${screen("sm", css`columns: 2`)}
        ${screen("md", css`columns: 3`)}
      `
      : css`
        ${screen("sm", css`columns: 2`)}
      `;

  const tocHeadings = headings.filter((h) => h.level <= 2);

  return (
    <ol class={tw`mt-8 ${getColumnsCss(tocHeadings.length)}`}>
      {tocHeadings
        .map((h: Heading, i) => {
          return (
            <li
              class={tw`
                text-xs font-medium
                uppercase tracking-wide
              `}
            >
              <a
                href={`#${h.slug}`}
                class={tw`
                  block truncate
                  py-1.5 px-2
                  border(t dark:gray-900 )
                  hover:(no-underline bg(blue-400 opacity-10))
                `}
              >
                <span class={tw`font-mono mr-4 no-underline!`}>
                  {i + 1}
                </span>
                {h.text}
              </a>
            </li>
          );
        })}
    </ol>
  );
}

function Header({
  title,
  description,
  url,
  datePublished,
  dateUpdated,
  tags,
  headings,
  lang,
  showTitle,
  showDescription,
  showMeta,
  showToc,
  size = "default",
}: HeaderProps) {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <header
      class={tw`
      ${size === "small" ? "mb-4" : "mb-16"}
      flex flex-col ${size === "small" ? "gap-1" : "gap-2"}
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
          font-semibold tracking-tight
          ${size === "small" ? "text(lg)" : "text(2xl md:3xl)"}
        `}
        >
          {title}
        </h1>
      )}

      {showDescription && description && (
        <p class={tw`text(gray-500)`}>{description}</p>
      )}

      {showMeta && (datePublished || tags) && (
        <div
          class={tw`flex items-baseline text(sm gray-500) ${styleUtils.childrenDivider}`}
        >
          {datePublished && (
            <div>
              <a href={url.pathname}>
                <time dateTime={datePublished.toString()}>
                  {datePublished.toLocaleDateString(lang, dateFormat)}
                </time>
              </a>
            </div>
          )}
          {dateUpdated && (
            <div>
              <span>Upd:</span>{" "}
              <time dateTime={dateUpdated.toString()}>
                {dateUpdated.toLocaleDateString(lang, dateFormat)}
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

      {showToc && headings?.some((h) => h.level > 2) && (
        <Toc headings={headings} />
      )}
    </header>
  );
}

export default function Article({
  page,
  children,
  lang,
  isInLog = false,
}: ArticleProps) {
  return (
    <article
      class={tw`
        sibling:(
          mt-8 pt-8
          border(t dashed gray-200 dark:gray-800)
        )`}
    >
      {page.showHeader && (
        <Header
          url={page.url}
          title={page.title}
          description={page.description}
          datePublished={page.datePublished}
          dateUpdated={page.dateUpdated}
          tags={page.tags}
          headings={page.headings}
          lang={lang}
          size={isInLog ? "small" : "default"}
          showTitle={page.showTitle}
          showMeta={page.showMeta}
          showDescription={page.showDescription}
          showToc={page.showToc}
        />
      )}
      {page.html && (
        <div
          class={tw(contentStyles)}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      )}
      {children}
    </article>
  );
}
