/** @jsxImportSource https://esm.sh/preact */

import { clsx } from "../deps/clsx.ts";
import { Heading, Page } from "../types.d.ts";

const Toc = ({ headings }: { headings: Heading[] }) => (
  <ol class="hidden sm:block lg:-mr-12 float-right w-1/3 lg:w-2/5 px-3 py-2 ml-4 my-0 text-dim not-prose list-none">
    <h6 class="mb-1 mt-0 smallcaps">Contents</h6>
    {headings.map((h: Heading) => {
      return (
        <li class="truncate text-sm">
          <a href={`#${h.slug}`}>{h.text}</a>
        </li>
      );
    })}
  </ol>
);

const Metadata = ({
  label,
  children,
}: {
  label?: string;
  children: preact.ComponentChildren;
}) => (
  <div class="inline-block">
    {label && <span>{label}&nbsp;</span>}
    <span>{children}</span>
  </div>
);

const Header = ({
  title,
  description,
  url,
  datePublished,
  dateUpdated,
  tags,
  lang,
}: {
  url: URL;
  lang: Intl.LocalesArgument;
  title?: string;
  description?: string;
  datePublished?: Date;
  dateUpdated?: Date;
  tags?: string[];
}) => {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <header class={clsx("empty:hidden mb-16 only-child:mb-0 only:mb-0")}>
      <h1 class={clsx("my-0")}>{title}</h1>
      {description && <p class="text-dim my-0">{description}</p>}

      {(datePublished || dateUpdated || tags) && (
        <div class="space-x-3 not-prose text-dim">
          {datePublished && (
            <Metadata>
              <a class="decoration-none text-inherit" href={url.toString()}>
                <time dateTime={datePublished.toISOString()}>
                  {datePublished.toLocaleDateString(lang, dateFormat)}
                </time>
              </a>
            </Metadata>
          )}
          {dateUpdated && (
            <Metadata label="Updated">
              <time dateTime={dateUpdated.toISOString()}>
                {dateUpdated.toLocaleDateString(lang, dateFormat)}
              </time>
            </Metadata>
          )}
          {tags && (
            <Metadata>
              <ul class="m-0 p-0 space-x-2">
                {tags.map((tag) => (
                  <li class="p-0 m-0 inline">
                    <a href={`/tags##${tag}`}>#{tag}</a>
                  </li>
                ))}
              </ul>
            </Metadata>
          )}
        </div>
      )}
    </header>
  );
};

const Article = ({
  page,
  children,
  lang,
}: {
  page: Page;
  lang: Intl.LocalesArgument;
  children?: preact.ComponentChildren;
}) => {
  const {
    showHeader,
    url,
    title,
    description,
    datePublished,
    dateUpdated,
    tags,
    headings,
    showToc,
    html,
  } = page;

  return html
    ? (
      <article>
        {showHeader && (
          <Header
            url={url}
            title={title}
            description={description}
            datePublished={datePublished}
            dateUpdated={dateUpdated}
            tags={tags}
            lang={lang}
          />
        )}

        {showToc && headings?.some((h) => h.level >= 2) && (
          <Toc headings={headings.filter((h) => h.level <= 2)} />
        )}

        {html && (
          <div
            class="prose prose-stone dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {children}
      </article>
    )
    : (
      showHeader
        ? (
          <Header
            url={url}
            title={title}
            description={description}
            datePublished={datePublished}
            dateUpdated={dateUpdated}
            tags={tags}
            lang={lang}
          />
        )
        : null
    );
};

export default Article;
