import { tw } from "../deps.ts";
import { styleUtils } from "./styleUtils.ts";

interface FooterProps {
  author?: { name: string; email: string; url: string };
}

function Footer({ author }: FooterProps) {
  let items = [
    ["Feed", "/feed.xml"],
    ["Made with Ter", "https://ter.kkga.me"],
  ];

  if (author) items = [[author.name, author.url], ...items];

  return (
    <footer
      class={tw`
        mt-auto
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
}
export default Footer;
