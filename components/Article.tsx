/** @jsxImportSource https://esm.sh/preact */

import { Heading, Page } from "../types.d.ts";
import { css, cx, tx } from "../deps.ts";

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol class="not-prose p-0 list-none mt-8 text-gray-500 gap-4 columns-3xs">
      {headings
        .map((h: Heading, i) => {
          return (
            <li class="text-xs font-medium uppercase tracking-wide">
              <a
                href={`#${h.slug}`}
                class="
                  block truncate
                  py-1.5 px-2
                  border(t dark:gray-900)
                  hover:(no-underline bg(blue-50 dark:blue-900/25))
                "
              >
                <span class="font-mono mr-4">{i + 1}</span>
                {h.text}
              </a>
            </li>
          );
        })}
    </ol>
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
  size: "small" | "default";
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
  size = "default",
}: HeaderProps) {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <header class="
      dim-links mb-8 only-child:(m-0) empty:hidden tracking-tight
    ">
      {showTitle && (
        <h1
          // class={tx(
          //   "mt-0 font-semibold tracking-tight",
          //   size === "small" ? "text(lg)" : "text(2xl md:3xl)",
          // )}
        >
          {title}
        </h1>
      )}

      {showDescription && description && (
        <p class="lead">{description}</p>
        // <p class="text(gray-500)">{description}</p>
      )}

      {showMeta && (datePublished || tags) && (
        <div class="divide-dot flex items-baseline text(sm gray-500)">
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
            <ul class="space-x-2">
              {tags.map((tag) => (
                <li class="inline">
                  <a href={`/tags##${tag}`}>#{tag}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showToc && headings?.some((h) => h.level > 2) && (
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
}

// const contentStyle = css({
//   "label": "content",

//   // headings
//   "& >*": { "@apply": "mb-4 first-child:(mt-0)" },
//   "& h1": { "@apply": "text-3xl mt-12 mb-6 font-semibold tracking-tight" },
//   "& h2": { "@apply": "text-2xl mt-12 mb-6 font-semibold tracking-tight" },
//   "& h3": { "@apply": "text-base mt-8 font-semibold tracking-tight" },
//   "& :is(h4,h5,h6)": {
//     "@apply":
//       "text(xs gray-700 dark:(gray-400)) uppercase mt-6 mb-2 font-semibold tracking-wide",
//   },

//   // anchors
//   "& :is(h1,h2,h3,h4,h5,h6)": {
//     "& > a.anchor": { "@apply": "invisible" },
//     "&:hover > a.anchor": {
//       "@apply": "visible no-underline text(gray-500) hover:(text(blue-500))",
//     },
//   },

//   // links
//   "& a[rel~='external']": {
//     "@apply": "text-current underline hover:(decoration-solid) ",
//   },

//   // rule
//   "& hr": {
//     "@apply": "my-10 border(gray-200) dark:(border(gray-800)) ",
//   },
//   "& hr+*": {
//     "@apply": "mt-0 ",
//   },

//   // lists
//   "& ul": {
//     "@apply": "list(inside disc)",
//     "& :is(ul,ol)": { "@apply": "pl-4" },
//   },
//   "& ol": {
//     "@apply": "list(inside decimal)",
//     "& :is(ul,ol)": { "@apply": "pl-4" },
//   },

//   // media
//   "& figure": {
//     "@apply": "my-6",
//     "& figcaption": {
//       "@apply": "mt-1 text(center sm gray-600 dark:gray-400)",
//     },
//     "& :is(img,video)": {
//       "@apply": "my-0",
//     },
//   },
//   "& blockquote": { "@apply": "mb-4 mx-8 text(lg gray-500)" },
//   "& del": { "@apply": "opacity-60" },

//   // code
//   "& pre": {
//     "@apply": "overflow-x-scroll text(xs md:sm) font-mono leading-snug",
//   },
//   "& pre:not(.hljs)": {
//     "@apply": "text(green-700 dark:green-600)",
//   },
//   "& code": {
//     "@apply": "font-mono text-sm",
//   },
//   "& :not(pre) code": {
//     "@apply": "px-1 py-px bg(gray-50 dark:(gray-900)) rounded-sm ",
//   },

//   // table
//   "& table": {
//     "@apply": "text(left sm) table-auto w-full overflow-scroll ",
//   },
//   "& th": {
//     "@apply":
//       "border(b gray-100 dark:gray-900) text(xs gray-500) uppercase font(medium) py-1 pr-4",
//   },
//   "& td": {
//     "@apply": "border(b gray-100 dark:gray-900) py-1 pr-3 align-baseline ",
//   },

//   // definiton list
//   "& dt": { "@apply": "font-semibold" },
//   "& dd": { "@apply": "pl-4" },

//   // helpers
//   "& .full-bleed": { "@apply": "lg:(-mx-24) xl:(-mx-32)" },
//   "& .cols-2": { "@apply": "sm:grid grid(cols-2) gap-4" },
//   "& .cols-3": { "@apply": "sm:grid grid(cols-3) gap-4" },
//   "& .cols-4": { "@apply": "grid grid(cols-2 md:cols-4) gap-4" },
// });

export default function Article({
  page,
  children,
  lang,
  isInLog = false,
}: Props) {
  return (
    <article class="
        prose prose-sm md:prose-base dark:prose-invert
        max-w-none
        sibling:(
          mt-8 pt-8
          border(t dashed gray-200 dark:gray-800)
        )">
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
          // class={contentStyle}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      )}

      {children}
    </article>
  );
}
