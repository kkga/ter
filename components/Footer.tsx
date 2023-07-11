/** @jsxImportSource npm:preact */

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
    <footer class="mt-auto flex items-baseline text(sm neutral-10)">
      <ul class="divide-dot flex items-baseline">
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
