interface Props {
  shikiHtml: string
  filename: string
  raw: string
}

export function RawDesignMd({ shikiHtml, filename, raw }: Props) {
  const lineCount = raw.split("\n").length

  return (
    <figure
      className="border"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <header
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--rule-strong)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-meta-caps">Source</span>
          <span className="text-foreground truncate font-mono text-xs">
            {filename}
          </span>
        </div>
        <span className="text-meta-caps tabular-nums shrink-0">
          {lineCount} lines
        </span>
      </header>
      <div
        className="raw-design-md overflow-x-auto text-sm leading-relaxed [&>pre]:m-0 [&>pre]:px-5 [&>pre]:py-5"
        // shikiHtml is produced by Shiki's codeToHtml on our own controlled raw .md.
        // No untrusted input flows into this string.
        dangerouslySetInnerHTML={{ __html: shikiHtml }}
      />
    </figure>
  )
}
