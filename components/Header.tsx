import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Crumb } from "../types.d.ts";

const styles = {
  siblingCrumb: css({
    "&::before": { content: '"/"', opacity: 0.75, margin: "0 0.5em" },
  }),
  siblingLink: css({
    "&::before": { content: '"·"', opacity: 0.75, margin: "0 0.5em" },
  }),
  header: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-black dark:(text-white)` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};

const PageHeader: FunctionComponent<
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
             flex flex-col md:(flex-row)
             justify-between items-baseline gap-2 md:(gap-4)
             text(sm gray-500)
             py-2
             ${styles.header}`}
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
        <ul class={tw`order-first md:(order-last place-self-end) flex`}>
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
