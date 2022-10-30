import { FunctionComponent, h } from "preact";
import { tw } from "twind/";
import { styleUtils } from "@components/styleUtils.ts";

interface FooterProps {
  author?: { name: string; email: string; url: string };
}

const Footer: FunctionComponent<FooterProps> = ({ author }) => (
  <footer
    class={tw`
      mt-auto py-2
      flex items-baseline
      text-xs text-gray-500
      ${styleUtils.linkDimmer}
    `}
  >
    <ul class={tw`flex items-baseline ${styleUtils.childrenDivider}`}>
      {author && (
        <li>
          <a href={author.url}>{author.name}</a>
        </li>
      )}

      <li>
        <a href="/feed.xml">Feed</a>
      </li>

      <li>
        <a href="https://ter.kkga.me">Made with Ter</a>
      </li>
    </ul>
  </footer>
);

export default Footer;
