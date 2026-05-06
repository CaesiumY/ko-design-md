interface Props {
  tokens: number
}

function formatTokens(n: number): string {
  if (n >= 1000) return `~${(n / 1000).toFixed(1)}k tokens`
  return `~${n} tokens`
}

export function TokenBadge({ tokens }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2">
        <span
          className="inline-block size-1.5 rounded-full bg-foreground/60"
          aria-hidden
        />
        <span className="font-medium text-foreground tabular-nums">
          {formatTokens(tokens)}
        </span>
      </span>
      <span className="text-meta-caps">CLAUDE · GPT-4</span>
    </div>
  )
}
