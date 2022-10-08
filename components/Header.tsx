import { apply, css, FC, h, tw } from "../deps.ts";
import { Crumb } from "../types.d.ts";

const styles = {
  sibling: css({
    "&::before": { opacity: 0.25, content: '"/"', margin: "0 0.5ch" },
  }),
  header: css({
    "&:not(:hover)": {
      a: apply`text-gray-500!`,
    },
  }),
};

const PageHeader: FC<
  {
    crumbs?: Crumb[];
    navItems?: { string: string }[];
  }
> = (
  { crumbs, navItems },
) => {
  return (
    <header class={tw`text-gray-500 text-xs font-mono ${styles.header}`}>
      {crumbs &&
        (
          <ul class={tw`flex`}>
            {crumbs.map((crumb) => (
              <li class={tw`sibling:${styles.sibling}`}>
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
