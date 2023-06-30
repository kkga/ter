/** @jsxImportSource https://esm.sh/preact */

import { Crumb } from "../types.d.ts";

interface PageHeaderProps {
  currentPath: string;
  crumbs?: Crumb[];
}

function PageHeader({ crumbs }: PageHeaderProps) {
  return (
    <header class="text(sm neutral-10)">
      {crumbs && crumbs.length > 1 && (
        <ul class="divide-slash flex">
          {crumbs.map((crumb) => (
            <li>
              {crumb.current && crumb.slug}
              {!crumb.current && <a href={crumb.url}>{crumb.slug}</a>}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

export default PageHeader;
