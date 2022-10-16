import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";

interface ArticleBodyProps {
  html: string;
}

const styles = {
  content: css({
    h1: apply`text-3xl   mt-8 mb-4 font-bold tracking-tight`,
    h2: apply`text-2xl   mt-8 mb-4 font-bold tracking-tight`,
    h3: apply`text-xl    mt-8 mb-3 font-bold tracking-tight`,
    h4: apply`text-lg    mt-8 mb-2 font-bold tracking-tight`,
    h5: apply`text-lg    mt-8 mb-2 font-bold tracking-tight`,
    h6: apply`text-base  mt-8 mb-2 font-bold tracking-tight`,
    p: apply`my-4`,
    img: apply`my-6`,
    video: apply`my-6`,
    figure: css(
      apply`my-6`,
      { img: apply`m-0` },
      { video: apply`m-0` },
    ),
    figcaption: apply`text-center mt-1 text(sm)`,
    ul: apply`list(disc inside)`,
    ol: apply`list(inside)`,
    hr: apply`my-8 border(gray-200) dark:(border(gray-700))`,
    pre:
      apply`my-4 overflow-x-scroll text-sm font-mono p-2 rounded leading-snug bg-gray-100 dark:(bg-gray-900 text-gray-300)`,
    details:
      apply`rounded p-2 text-sm children:(my-2 first-child:my-0 last-child:mb-0) bg-gray-100 text-gray-500 dark:(bg-gray-800 text-gray-400)`,
    blockquote: apply`mx-8 text-lg text-gray-500`,
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
