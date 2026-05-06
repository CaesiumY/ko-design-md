import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import type { Options as ReactMarkdownOptions } from "react-markdown"

export const markdownPlugins: Pick<
  ReactMarkdownOptions,
  "remarkPlugins" | "rehypePlugins"
> = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: {
          className: ["heading-anchor"],
          "aria-label": "Link to this section",
        },
        content: { type: "text", value: "  #" },
      },
    ],
  ],
}
