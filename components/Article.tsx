import { apply, css, FC, h, tw } from "../deps.ts";

interface ArticleProps {
  title?: string;
  description?: string;
  datePublished?: Date;
  tags?: string[];
  dateFormat?: unknown;
  toc?: string[];
  html?: string;
}

const renderTags = (tags: string[]) =>
  tags.map((tag) => (
    <li>
      <a href={`/tag/${tag}`}>#{tag}</a>
    </li>
  ));

const Article: FC<ArticleProps> = ({
  title,
  description,
  datePublished,
  tags,
  toc,
  dateFormat = { year: "numeric", month: "short", day: "numeric" },
  html,
}) => {
  const contentStyles = css({
    h1: apply`text-4xl   mt-8 mb-4 font-bold tracking-tight`,
    h2: apply`text-3xl   mt-8 mb-4 font-bold tracking-tight`,
    h3: apply`text-2xl   mt-8 mb-3 font-bold tracking-tight`,
    h4: apply`text-xl    mt-8 mb-2 font-bold tracking-tight`,
    h5: apply`text-lg    mt-8 mb-2 font-bold tracking-tight`,
    h6: apply`text-base  mt-8 mb-2 font-bold tracking-tight`,
  });

  return (
    <article>
      <header class={tw`mb-8 flex flex-col gap-2`}>
        <h1 class={tw`text-4xl font-extrabold tracking-tight`}>{title}</h1>
        <div class={tw`text-sm text-gray-500`}>
          <p>{description}</p>
          {datePublished && (
            <div>
              Published:{" "}
              <time dateTime={datePublished.toString()}>
                {datePublished.toLocaleDateString("pt", dateFormat)}
              </time>
            </div>
          )}
          <ul class="articleHeader-meta-tags">
            {/*renderTags(tags)*/}
          </ul>
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
        class={tw(contentStyles)}
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </article>
  );
};

export default Article;
