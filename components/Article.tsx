import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";

interface ArticleProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  tags?: string[];
  toc?: string[];
  hideTitle?: boolean;
  html?: string;
  dateFormat?: Record<string, string>;
  locale?: string;
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
    figure: apply`my-4`,
    img: apply`my-4`,
    video: apply`my-4`,
    ul: apply`list-disc list-inside`,
    ol: apply`list-disc list-inside`,
    hr: apply`my-8 border(gray-100) dark:(border(gray-700))`,
    pre:
      apply`my-4 overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-800 text-gray-300)`,
    details:
      apply`rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-500 dark:(bg-gray-800 text-gray-400)`,
    blockquote: apply`mx-8 text-lg text-gray-500`,
    figcaption: apply`text-center mt-1 text(sm gray-500)`,
  }),
};

const Article: FunctionComponent<ArticleProps> = ({
  title,
  description,
  datePublished,
  tags,
  toc,
  locale,
  dateFormat = { year: "numeric", month: "short", day: "numeric" },
  html,
  hideTitle,
}) => (
  <article>
    <header class={tw`mb-8 flex flex-col gap-2 ${styles.header}`}>
      {!hideTitle && (
        <h1 class={tw`text-4xl font-extrabold tracking-tight`}>{title}</h1>
      )}
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

      {toc &&
        (
          <details class="articleHeader-toc">
            <summary>Contents</summary>
            <ol class="articleHeader-toc-list">
              {toc.map((h) => (
                // <%   filteredHeadings.forEach((h, i) => { %>
                // <%     if (h.level === 2) { %>
                //               <li>
                //                 <a href="#<%= h.slug %>"><%= h.text %></a>
                // <%       if (filteredHeadings[i+1]?.level === 3) { %>
                //                 <ul>
                // <%         for (let j = i+1; j < filteredHeadings.length; j++) { %>
                // <%            const subH = filteredHeadings[j] %>
                // <%            if (subH.level === 3) { %>
                //                   <li><a href="#<%= subH?.slug %>"><%= subH.text %></a></li>
                // <%            } else { break } %>
                // <%         } %>
                //                 </ul>
                // <%       } %>
                //               </li>
                // <%     } %>
                // <%   }) %>
                { h }
              ))}
            </ol>
          </details>
        )}
    </header>
    <div
      class={tw(styles.content)}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  </article>
);

export default Article;
