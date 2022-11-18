import { apply, css } from "../deps.ts";

export const styleUtils = {
  childrenDivider: css({
    "& > *:not(:last-child)::after": {
      content: '"·"',
      margin: "0 0.5em",
      opacity: 0.6,
    },
  }),

  childrenBreadcrumbDivider: css({
    "& > * + *::before": {
      content: '"/"',
      margin: "0 0.5em",
      opacity: 0.6,
    },
  }),

  linkDimmer: css({
    "&:not(:hover)": {
      a: apply`text-gray-500!`,
    },
    a: apply`transition-colors`,
  }),
};
