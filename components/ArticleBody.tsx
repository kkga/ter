import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";

interface ArticleBodyProps {
  html: string;
}

const styles = {
  content: css({
    a: apply`text-current hover:(text-accent-500)`,
    h1: apply`text-3xl   mt-12 mb-4 font-semibold tracking-tight`,
    h2: apply`text-2xl   mt-12 mb-4 font-semibold tracking-tight`,
    h3: apply`text-base  mt-8  mb-1 font-bold`,
    h4: apply`text-base  mt-8  mb-1 font-bold`,
    h5: apply`text-base  mt-8  mb-1 font-bold`,
    h6: apply`text-base  mt-8  mb-1 font-bold`,
    p: apply`mb-4`,
    img: apply`mb-4`,
    video: apply`mb-4`,
    figure: css(
      apply`mb-4`,
      { img: apply`m-0` },
      { video: apply`m-0` },
    ),
    figcaption: apply`text-center mt-1 text(sm)`,
    ul: apply`mb-4 pl-4 list(disc inside)`,
    ol: apply`mb-4 pl-4 list(decimal inside)`,
    hr: apply`my-8 border(gray-200) dark:(border(gray-700))`,
    pre:
      apply`mb-4 overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-900 text-gray-300)`,
    details:
      apply`mb-4 rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-500 dark:(bg-gray-800 text-gray-400)`,
    blockquote: apply`mb-4 mx-8 text-lg text-gray-500`,
    del: apply`opacity-50`,
  }),
};

const ArticleBody: FunctionComponent<ArticleBodyProps> = ({
  html,
}) => (
  <div
    class={tw(styles.content)}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export default ArticleBody;
