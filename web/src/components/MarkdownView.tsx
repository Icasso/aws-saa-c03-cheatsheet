import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function MarkdownView({ content }: Props) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
