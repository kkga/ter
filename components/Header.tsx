/** @jsxImportSource npm:preact */

import { Crumb } from "../types.d.ts";

interface PageHeaderProps {
  crumbs: Crumb[];
}

const PageHeader = ({ crumbs }: PageHeaderProps) => {
  return (
    <header class="text(neutral-10) text-[13px] min-h-[20px] font(medium mono)">
      {crumbs && crumbs.length > 1 && (
        <nav class="divide-slash">
          {crumbs.map((crumb) => (
            <>
              {crumb.current ? (
                <span>{crumb.slug}</span>
              ) : (
                <a href={crumb.url}>{crumb.slug}</a>
              )}
            </>
          ))}
        </nav>
      )}
    </header>
  );
};

export default PageHeader;
