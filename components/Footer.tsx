import { FunctionComponent as FC } from "preact";
import { tw } from "twind/";
import { styleUtils } from "@components/styleUtils.ts";

interface FooterProps {
  author?: { name: string; email: string; url: string };
}

const Footer: FC<FooterProps> = ({ author }) => {
  let items = [
    ["Feed", "/feed.xml"],
    ["Made with Ter", "https://ter.kkga.me"],
  ];

  if (author) items = [[author.name, author.url], ...items];

  return (
    <footer
      class={tw`
        mt-auto py-4
        flex items-baseline
        text(xs gray-500)
        ${styleUtils.linkDimmer}
      `}
    >
      <ul class={tw`flex items-baseline ${styleUtils.childrenDivider}`}>
        {items.map(([label, path]) => (
          <li>
            <a href={path}>{label}</a>
          </li>
        ))}
      </ul>
    </footer>
  );
};
export default Footer;
