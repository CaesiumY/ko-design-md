import ReactMarkdown from "react-markdown"
import { markdownPlugins } from "@/lib/markdown-pipeline"

interface Props {
  body: string
}

export function MarkdownBody({ body }: Props) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={markdownPlugins.remarkPlugins}
        rehypePlugins={markdownPlugins.rehypePlugins}
      >
        {body}
      </ReactMarkdown>
    </article>
  )
}
