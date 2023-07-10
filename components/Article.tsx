/** @jsxImportSource npm:preact */

import { cx } from "../deps/twind.ts";
import { Heading, Page } from "../types.d.ts";

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol class="hidden sm:block float-right w-1/3 px-3 py-2 ml-4 my-0 rounded-sm bg-neutral-2 text(sm neutral-11) font-medium list(inside) not-prose">
      <span class="block text-xs text-neutral-10 mb-2">Contents</span>
      {headings.map((h: Heading) => {
        return (
          <li class="truncate">
            <a href={`#${h.slug}`}>{h.text}</a>
          </li>
        );
      })}
    </ol>
  );
}

function Metadata({
  label,
  children,
}: {
  label?: string;
  children: preact.ComponentChildren;
}) {
  return (
    <div class={cx("flex flex-row text-neutral-9")}>
      {label && <span>{label}&nbsp;</span>}
      <div>{children}</div>
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
      class={cx("flex flex-col gap-2 empty:hidden only-child:(m-0)", {
        "gap-2 mb-12": !compact,
      })}
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

      {showDescription && description && <p class="lead">{description}</p>}

      {showMeta && (datePublished || tags) && (
        <div class="divide-dot not-prose flex items-baseline text(sm neutral-10)">
          {datePublished && (
            <Metadata>
              <a href={url.toString()}>
                <time dateTime={datePublished.toISOString()}>
                  {datePublished.toLocaleDateString(lang, dateFormat)}
                </time>
              </a>
            </Metadata>
          )}
          {dateUpdated && (
            <Metadata label="Upd:">
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
