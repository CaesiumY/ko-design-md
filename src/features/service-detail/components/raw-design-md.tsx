interface Props {
  shikiHtml: string
}

export function RawDesignMd({ shikiHtml }: Props) {
  return (
    <div
      className="raw-design-md overflow-x-auto text-sm leading-relaxed"
      // shikiHtml is produced by Shiki's codeToHtml on our own controlled raw .md.
      // No untrusted input flows into this string.
      dangerouslySetInnerHTML={{ __html: shikiHtml }}
    />
  )
}
