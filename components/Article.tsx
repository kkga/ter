/** @jsxImportSource https://esm.sh/preact */

import { Heading, Page } from "../types.d.ts";
import { cx } from "../deps.ts";
import { VNode } from "https://esm.sh/v99/preact@10.11.3/src/index";

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol class="not-prose p-0 list-none m-0 gap-4 columns-3xs">
      {headings
        .map((h: Heading, i) => {
          return (
            <li class="font-medium uppercase tracking-wide">
              <a
                href={`#${h.slug}`}
                class="text(xs neutral-11) block truncate py-2 border(t neutral-7)"
              >
                <span class="font-mono mr-2">{i + 1}</span>
                {h.text}
              </a>
            </li>
          );
        })}
    </ol>
  );
}

function Metadata({ label, children }: { label: string; children: VNode }) {
  return (
    <div class="flex flex-col">
      <span class="text(neutral-9) font-medium">{label}</span>
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
  headings?: Heading[];
  lang: Intl.LocalesArgument;
  compact: boolean;
  showTitle: boolean;
  showMeta: boolean;
  showDescription: boolean;
  showToc: boolean;
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
        "flex flex-col gap-6 empty:hidden only-child:(m-0)",
        { "mb-12": !compact },
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
            <Metadata label="Published">
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

      {!compact && showToc && headings?.some((h) => h.level > 2) && (
        <Toc headings={headings.filter((h) => h.level <= 2)} />
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
          headings={page.headings}
          lang={lang}
          compact={compact}
          showTitle={page.showTitle}
          showMeta={page.showMeta}
          showDescription={page.showDescription}
          showToc={page.showToc}
        />
      )}

      {page.html && <div dangerouslySetInnerHTML={{ __html: page.html }} />}

      {children}
    </article>
  );
}
