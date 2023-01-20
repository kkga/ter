/** @jsxImportSource https://esm.sh/preact */

import { Heading, Page } from "../types.d.ts";
import { cx } from "../deps.ts";

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol class="hidden sm:block float-right max-w-xs px-3 py-2 ml-4 my-0 rounded-sm border border(neutral-6) text(sm neutral-11) font-medium list(disc inside) not-prose">
      {headings
        .map((h: Heading) => {
          return (
            <li class="truncate">
              <a href={`#${h.slug}`}>{h.text}</a>
            </li>
          );
        })}
    </ol>
  );
}

function Metadata(
  { label, children, row }: {
    label: string;
    children: preact.ComponentChildren;
    row?: boolean;
  },
) {
  return (
    <div class={cx("flex flex-col", { "flex-row": row })}>
      <span class="text-neutral-9">{label}</span>
      {row && <span>&nbsp;</span>}
      <div class="text-neutral-11">{children}</div>
    </div>
  );
}

interface HeaderProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  url: URL;
  dateUpdated?: Date;
  tags?: string[];
  lang: Intl.LocalesArgument;
  compact: boolean;
  showTitle: boolean;
  showMeta: boolean;
  showDescription: boolean;
}

function Header({
  title,
  description,
  url,
  datePublished,
  dateUpdated,
  tags,
  lang,
  showTitle,
  showDescription,
  showMeta,
  compact,
}: HeaderProps) {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <header
      class={cx(
        "flex flex-col gap-2 empty:hidden only-child:(m-0)",
        { "gap-6 mb-12": !compact },
      )}
    >
      {showTitle && (
        <h1
          class={cx("tracking-tight my-0", {
            "text-xl": compact,
          })}
        >
          {title}
        </h1>
      )}

      {showDescription && description && (
        <p class="text(lg neutral-11) m-0">
          {description}
        </p>
      )}

      {showMeta && (datePublished || tags) && (
        <div class="not-prose flex gap-8 items-baseline text(sm neutral-10)">
          {datePublished && (
            <Metadata row={compact} label="Published">
              <a href={url.toString()}>
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
            <Metadata label="Tags">
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
}

interface Props {
  page: Page;
  lang: Intl.LocalesArgument;
  isInLog?: boolean;
  children?: preact.ComponentChildren;
  compact?: boolean;
}

export default function Article({
  page,
  children,
  lang,
  compact = false,
}: Props) {
  return (
    <article class="prose prose-neutral max-w-none">
      {page.showHeader && (
        <Header
          url={page.url}
          title={page.title}
          description={page.description}
          datePublished={page.datePublished}
          dateUpdated={page.dateUpdated}
          tags={page.tags}
          lang={lang}
          compact={compact}
          showTitle={page.showTitle}
          showMeta={page.showMeta}
          showDescription={page.showDescription}
        />
      )}

      {!compact && page.showToc && page.headings?.some((h) => h.level > 2) && (
        <Toc headings={page.headings.filter((h) => h.level <= 2)} />
      )}

      {page.html && <div dangerouslySetInnerHTML={{ __html: page.html }} />}

      {children}
    </article>
  );
}
