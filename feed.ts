import { Feed } from "./deps/feed.ts";
import { Page, UserConfig } from "./types.d.ts";

interface FeedOpts {
  userConfig: UserConfig;
  pages: Page[];
}

export const generateFeed = (opts: FeedOpts): Feed => {
  const { userConfig, pages } = opts;
  const { title, description, url, lang, authorName, authorEmail, authorUrl } =
    userConfig;

  const feed = new Feed({
    title,
    description,
    id: url,
    link: url,
    language: lang?.toString() || "en",
    // image: site.url,
    // favicon: site.url,
    copyright: `Copyright ${new Date().getFullYear()} ${url}`,
    feedLinks: {
      atom: `${url}/feed`,
    },
    author: {
      name: authorName,
      email: authorEmail,
      link: authorUrl,
    },
  });

  pages.forEach((page) => {
    feed.addItem({
      title: page.title || "",
      id: page.url.toString(),
      link: page.url.toString(),
      description: page.description,
      content: page.html || "",
      date: page.datePublished || new Date(),
    });
  });

  return feed;
};
