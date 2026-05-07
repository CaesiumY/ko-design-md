interface Props {
  tokens: number
}

function formatTokens(n: number): string {
  if (n >= 1000) return `~${(n / 1000).toFixed(1)}k`
  return `~${n}`
}

export function TokenBadge({ tokens }: Props) {
  return (
    <div className="text-center">
      <span
        className="text-display block text-3xl font-black tabular-nums"
        style={{ letterSpacing: "-0.04em" }}
      >
        {formatTokens(tokens)}
      </span>
      <span className="text-meta-caps mt-1 inline-block">
        TOKENS · GPT-4 / CLAUDE
      </span>
    </div>
  )
}
