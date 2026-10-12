import { CheckIcon, CopyIcon } from "@/components/ui/icons"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
import { buildHandoffPrompt } from "@/lib/handoff-prompt"

interface Props {
  name: string
  slug: string
}

// The skill-free way to hand an entry to a coding agent: the prompt is shown in
// full, so the reader sees exactly what lands on the clipboard. Same shape as
// the home page's skill-install hint — a muted, input-like box with an
// icon-only copy button — but two lines, so the text wraps instead of
// scrolling. Korean words stay whole (`break-keep`) while the long URL may break
// anywhere, which keeps it inside the narrow sidebar.
export function HandoffPromptBox({ name, slug }: Props) {
  const prompt = buildHandoffPrompt(name, slug)
  const { copied, copy } = useCopyFeedback(prompt, {
    surface: "handoff-prompt",
    slug,
  })

  return (
    <div className="mt-6 min-w-0">
      <p className="text-meta-caps mb-3">
        — <span className="font-extrabold text-brand">Handoff</span> Prompt
      </p>
      <div className="flex min-w-0 items-start gap-1 border border-rule-strong bg-muted py-2 pr-1 pl-3">
        <code className="min-w-0 flex-1 font-mono text-xs leading-relaxed [overflow-wrap:anywhere] break-keep whitespace-pre-wrap">
          {prompt}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="핸드오프 프롬프트 복사"
          className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
        {/* Icon-only with a fixed aria-label, so the result rides a live
            region. Outside the button because a button makes its descendants
            presentational, which would strip role="status". */}
        <span role="status" className="sr-only">
          {copied ? "핸드오프 프롬프트 복사됨" : ""}
        </span>
      </div>
    </div>
  )
}
