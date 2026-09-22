import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";

/** The same Markdown interchange format as sync-hub-v2; raw HTML is never executed. */
export function RichText({ value }: { value: string }) {
  return (
    <div className="rich-text">
      <Markdown
        remarkPlugins={[remarkBreaks]}
        allowedElements={[
          "p",
          "br",
          "strong",
          "em",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
        ]}
        unwrapDisallowed
        skipHtml
      >
        {value}
      </Markdown>
    </div>
  );
}
