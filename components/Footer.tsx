import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";

const styles = {
  siblingItem: css({
    "&::before": { content: '"·"', margin: "0 1ch" },
  }),
  footer: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-black dark:(text-white)` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};

interface FooterProps {
  author?: { name: string; email: string; url: string };
}

const Footer: FunctionComponent<FooterProps> = ({ author }) => (
  <footer
    class={tw`
           mt-auto py-2
           flex items-baseline
           text-xs text-gray-500
           ${styles.footer}`}
  >
    <ul class={tw`col-start-2 col-span-3 flex`}>
      <li class={tw`sibling:${styles.siblingItem}`}>
        {author && <a href={author.url}>{author.name}</a>}
      </li>

      <li class={tw`sibling:${styles.siblingItem}`}>
        <a href="/feed.xml">Feed</a>
      </li>

      <li class={tw`sibling:${styles.siblingItem}`}>
        <a href="https://ter.kkga.me">Made with Ter</a>
      </li>
    </ul>
  </footer>
);

export default Footer;
