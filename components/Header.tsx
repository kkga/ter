import { css, FC, h, tw } from "../deps.ts";
import { Crumb } from "../types.d.ts";

const PageHeader: FC<
  {
    crumbs?: Crumb[];
    navItems?: { string: string }[];
  }
> = (
  { crumbs, navItems },
) => {
  const itemSiblingStyle = css({
    "&::before": { opacity: 0.5, content: '"/"' },
  });

  return (
    <header>
      {crumbs &&
        (
          <ul class={tw`flex`}>
            {crumbs.map((crumb) => (
              <li class={tw`sibling:${itemSiblingStyle}`}>
                {crumb.current &&
                  crumb.slug}
                {!crumb.current &&
                  <a href={crumb.url}>{crumb.slug}</a>}
              </li>
            ))}
          </ul>
        )}
      {navItems && navItems.map((item) => <div>{item}</div>)}
    </header>
  );
};

export default PageHeader;
