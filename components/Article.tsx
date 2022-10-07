import { FC, h, tw } from "../deps.ts";

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
  return (
    <article>
      <header>
        <h1>{title}</h1>
        <p>{description}</p>
        {datePublished || tags && tags.length > 0 &&
            (
              <div class="articleHeader-meta">
                {datePublished && (
                  <div>
                    Published:{" "}
                    <time dateTime={datePublished.toString()}>
                      {datePublished.toLocaleDateString("pt", dateFormat)}
                    </time>
                  </div>
                )}
                <ul class="articleHeader-meta-tags">
                  {renderTags(tags)}
                </ul>
              </div>
            )}

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
        class="article-body"
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </article>
  );
};

export default Article;
