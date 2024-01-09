/** @jsxImportSource https://esm.sh/preact */

import { Crumb } from "../types.d.ts";

const Header = ({ crumbs }: { crumbs: Crumb[] }) => {
  return (
    <header class="text-dim text-sm min-h-[20px]">
      {crumbs && (
        <nav class="flex items-baseline list-none">
          {crumbs.map((crumb) => (
            <li class="after:content-['/'] after:mx-1 last:after:content-['']">
              {crumb.current
                ? <span>{crumb.slug}</span>
                : <a href={crumb.url}>{crumb.slug}</a>}
            </li>
          ))}
        </nav>
      )}
    </header>
  );
};

const Footer = ({
  author,
}: {
  author?: { name: string; email: string; url: string };
}) => {
  let items = [
    ["Feed", "/feed.xml"],
    ["Made with Ter", "https://ter.kkga.me"],
  ];

  if (author) items = [[author.name, author.url], ...items];

  return (
    <footer class="mt-auto">
      <ul class="m-0 p-0 space-x-4 list-none smallcaps text-dim">
        {items.map(([label, path]) => (
          <li class="inline-block">
            <a href={path}>{label}</a>
          </li>
        ))}
      </ul>
    </footer>
  );
};

export { Footer, Header };
