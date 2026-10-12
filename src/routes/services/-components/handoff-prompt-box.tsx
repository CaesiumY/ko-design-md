import { InlineCopyButton } from "./inline-copy-button"
import { buildHandoffPrompt } from "@/lib/handoff-prompt"

interface Props {
  name: string
  slug: string
}

// The skill-free way to hand an entry to a coding agent: the prompt is shown in
// full, so the reader sees exactly what lands on the clipboard. The copy button
// is the same labelled one the tab bar uses ("복사" → "복사됨"), set on the
// label row rather than inside the box so the prompt keeps the box's full
// width. Two lines wrap instead of scrolling; Korean words stay whole
// (`break-keep`) while the long URL may break anywhere, which keeps it inside
// the narrow sidebar.
export function HandoffPromptBox({ name, slug }: Props) {
  const prompt = buildHandoffPrompt(name, slug)

  return (
    <div className="mt-6 min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        {/* No brand-red word here: that emphasis marks the page's one primary
            action ("Primary Action" above), and this is a secondary path. */}
        <p className="text-meta-caps">— Handoff Prompt</p>
        <InlineCopyButton
          raw={prompt}
          filename="핸드오프 프롬프트"
          surface="handoff-prompt"
          slug={slug}
        />
      </div>
      <code className="block min-w-0 border border-rule-strong bg-muted px-3 py-2 font-mono text-xs leading-relaxed [overflow-wrap:anywhere] break-keep whitespace-pre-wrap">
        {prompt}
      </code>
    </div>
  )
}
