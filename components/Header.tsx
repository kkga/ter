import { apply, css, FC, h, tw } from "../deps.ts";
import { Crumb } from "../types.d.ts";

const styles = {
  siblingCrumb: css({
    "&::before": { opacity: 0.5, content: '"/"', margin: "0 0.5ch" },
  }),
  siblingLink: css({
    "&::before": { opacity: 0.5, content: '"·"', margin: "0 0.5ch" },
  }),
  header: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};

const PageHeader: FC<
  {
    crumbs?: Crumb[];
    navItems?: Record<string, string>;
  }
> = (
  { crumbs, navItems },
) => {
  return (
    <header
      class={tw`
        flex
        justify-between
        align-baseline
        text-sm
        ${styles.header}
`}
    >
      {crumbs &&
        (
          <ul class={tw`flex`}>
            {crumbs.map((crumb) => (
              <li class={tw`sibling:${styles.siblingCrumb}`}>
                {crumb.current &&
                  crumb.slug}
                {!crumb.current &&
                  <a href={crumb.url}>{crumb.slug}</a>}
              </li>
            ))}
          </ul>
        )}
      {navItems && (
        <ul class={tw`flex`}>
          {Object.entries(navItems).map(([label, path]) => (
            <li class={tw`sibling:${styles.siblingLink}`}>
              <a href={path}>{label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};

export default PageHeader;
