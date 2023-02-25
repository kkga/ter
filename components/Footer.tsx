/** @jsxImportSource https://esm.sh/preact */

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
    <footer class="mt-auto flex items-baseline text(xs neutral-10)">
      <ul class="flex items-baseline space-x-4">
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
