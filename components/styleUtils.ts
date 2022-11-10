import { css } from "twind/css";
import { apply } from "twind/";

export const styleUtils = {
  childrenDivider: css({
    "& > * + *::before": {
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
  }),
};
