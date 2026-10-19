import { downloadFilename } from "./download-button"
import type { ReactNode } from "react"

// How to hand the copied or downloaded DESIGN.md to an AI. It names no tools -
// the steps are told by where the reader works (a chat box or a project
// folder), which stays true whatever the reader uses. Closed by default so the
// sidebar still opens on the two buttons above it, and a native <details> like
// the token sections' `MoreDetails`, so it needs no client JS. The example
// request has no copy button on purpose: a paste-this prompt is what the sidebar
// dropped (ADR 0010).
export function UsageGuide({ slug }: { slug: string }) {
  const file = downloadFilename(slug)

  return (
    <details className="group/guide mt-4">
      <summary
        className="flex h-10 w-full cursor-pointer list-none items-center justify-between gap-2 border px-4 text-sm font-medium tracking-tight text-muted-foreground transition-colors outline-none hover:bg-ghost hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
        style={{ borderColor: "var(--rule-strong)" }}
      >
        {/* Same height, padding, icon size and gap as the copy and download
            buttons above, so the three labels start on one line. The chevron
            stays where they have an arrow: this opens, it does not act. */}
        <span className="inline-flex items-center gap-2.5">
          <BookIcon className="size-4" />
          어떻게 사용하나요?
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-3.5 shrink-0 transition-transform duration-200 group-open/guide:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      {/* An <ol> numbers 1, 2, 3 and cannot say 2-A, so the labels are written
          out - but it stays a list, so a screen reader still hears how many
          steps there are and which one it is on. role="list" because Safari
          drops the list role once the markers are hidden. */}
      <ol
        role="list"
        className="mt-3 list-none space-y-3 text-xs leading-relaxed break-keep"
      >
        <Step label="1">DESIGN.md 를 복사하거나 다운로드합니다.</Step>
        <Step label="2-A">
          AI 대화창에 요청 한 줄을 쓰고, 복사한 내용을 붙여 넣거나 파일을
          첨부합니다.
          {/* Darker than the step text: it is the line the reader types. */}
          <span className="mt-1.5 block text-foreground">
            예: 아래 DESIGN.md 대로 지금 화면을 다시 디자인해 줘. 기능은 그대로
            둬.
          </span>
        </Step>
        <Step label="2-B">
          프로젝트 폴더에서 작업하는 AI 라면, 다운로드한 {file} 를 프로젝트에
          넣고 &ldquo;이 {file} 대로 구현해 줘&rdquo; 라고 요청합니다.
        </Step>
      </ol>
    </details>
  )
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

function Step({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="w-6 shrink-0 font-mono font-semibold text-foreground">
        {label}
      </span>{" "}
      {/* Invisible in the flex row, but it keeps "1" and the text apart when
          the item is read as one string. */}
      <span className="min-w-0 text-muted-foreground">{children}</span>
    </li>
  )
}
