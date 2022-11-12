import { Feed } from "feed";
import { Page, UserConfig } from "./types.d.ts";

interface FeedOpts {
  userConfig: UserConfig;
  pages: Page[];
}

export function generateFeed(opts: FeedOpts): Feed {
  const { userConfig, pages } = opts;
  const {
    title,
    description,
    url,
    lang,
    author_name,
    author_email,
    author_url,
  } = userConfig;

  const feed = new Feed({
    title: title,
    description: description,
    id: url,
    link: url,
    language: lang || "en",
    // image: site.url,
    // favicon: site.url,
    copyright: `Copyright ${new Date().getFullYear()} ${url}`,
    feedLinks: {
      atom: `${url}/feed`,
    },
    author: {
      name: author_name,
      email: author_email,
      link: author_url,
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
}
