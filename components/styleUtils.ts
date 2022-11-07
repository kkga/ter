import { css } from "twind/css";
import { apply } from "twind/";

export const styleUtils = {
  childrenDivider: css({
    "& > * + *::before": { content: '"·"', margin: "0 0.5em" },
  }),

  childrenBreadcrumbDivider: css({
    "& > * + *::before": { content: '"/"', margin: "0 0.5em" },
  }),

  linkDimmer: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-gray-900 dark:(text-gray-100)` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};