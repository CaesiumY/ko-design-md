interface Props {
  shikiHtml: string
  filename: string
  raw: string
}

export function RawDesignMd({ shikiHtml, filename, raw }: Props) {
  const lineCount = raw.split("\n").length

  return (
    <figure className="border" style={{ borderColor: "var(--rule-strong)" }}>
      <header
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--rule-strong)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-meta-caps">Source</span>
          <span className="truncate font-mono text-xs text-foreground">
            {filename}
          </span>
        </div>
        <span className="text-meta-caps shrink-0 tabular-nums">
          {lineCount} lines
        </span>
      </header>
      {/* Shiki's <pre> takes tabindex=0 so the code can be scrolled by
          keyboard, so it is the scroller itself rather than this wrapper:
          with the wrapper scrolling, the focused <pre> slid sideways with the
          content and took its focus outline off screen. The outline is drawn
          inside because the <pre> fills the figure edge to edge. */}
      <div
        className="raw-design-md min-w-0 text-sm leading-relaxed [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:px-5 [&>pre]:py-5 [&>pre:focus-visible]:-outline-offset-3"
        // shikiHtml is produced by Shiki's codeToHtml on our own controlled raw .md.
        // No untrusted input flows into this string.
        dangerouslySetInnerHTML={{ __html: shikiHtml }}
      />
    </figure>
  )
}
