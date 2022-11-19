import { tw } from "../deps.ts";
import { Crumb } from "../types.d.ts";
import { styleUtils } from "./styleUtils.ts";

interface PageHeaderProps {
  currentPath: string;
  crumbs?: Crumb[];
  navItems?: Record<string, string>;
}

function PageHeader({ currentPath, crumbs, navItems }: PageHeaderProps) {
  return (
    <header
      class={tw`
        flex flex(col md:row) 
        divide(y md:none gray-100 dark:gray-900) 
        justify-between md:(items-baseline) 
        text(sm gray-500)
        ${styleUtils.linkDimmer}
      `}
    >
      {crumbs && (
        <ul class={tw`pb(2 md:0) flex ${styleUtils.childrenBreadcrumbDivider}`}>
          {crumbs.map((crumb) => (
            <li>
              {crumb.current && crumb.slug}
              {!crumb.current && <a href={crumb.url}>{crumb.slug}</a>}
            </li>
          ))}
        </ul>
      )}
      {navItems && (
        <ul
          class={tw`pt(2 md:0) md:(place-self-end) flex ${styleUtils.childrenDivider}`}
        >
          {Object.entries(navItems).map(([label, path]) => (
            <li>
              {currentPath === path
                ? <span>{label}</span>
                : <a href={path}>{label}</a>}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

export default PageHeader;
