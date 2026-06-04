import { Dialog } from "@base-ui/react/dialog"

import { GITHUB_REPO_URL } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const PROPOSE_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new?template=new-catalog-entry.yml`
const CONTRIBUTE_GUIDE_URL = `${GITHUB_REPO_URL}/blob/main/CONTRIBUTING.md#1-새-항목-추가-권장-design-md-스킬-사용`

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  )
}

export function ContributeDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="hover:text-brand focus-visible:text-brand inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors focus-visible:outline-none"
        aria-label="새 항목 제안하기"
      >
        <PlusIcon className="size-4" />
        <span className="hidden sm:inline">새 항목 제안</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border bg-background p-6 shadow-2xl outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
          style={{ borderColor: "var(--rule-strong)" }}
        >
          <Dialog.Close
            className="hover:bg-muted hover:text-foreground focus-visible:text-foreground absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors focus-visible:outline-none"
            aria-label="닫기"
          >
            <CloseIcon className="size-4" />
          </Dialog.Close>
          <Dialog.Title className="text-display text-lg font-extrabold tracking-tight">
            새 항목 추가하기
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            두 경로 중 편한 쪽을 선택하세요.
          </Dialog.Description>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ChoiceCard
              href={PROPOSE_ISSUE_URL}
              title="제안만 할게요"
              description="브랜드명·URL만 알려주시면 메인테이너가 검토합니다."
              hint="GitHub Issue Template으로 이동"
            />
            <ChoiceCard
              href={CONTRIBUTE_GUIDE_URL}
              title="직접 추가할래요"
              description="Claude Code의 /design-md 스킬로 PR까지 자동화합니다."
              hint="CONTRIBUTING 가이드로 이동"
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ChoiceCard({
  href,
  title,
  description,
  hint,
}: {
  href: string
  title: string
  description: string
  hint: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col gap-2 rounded-xl border p-4 transition-colors",
        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
      )}
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <span
          className="group-hover:text-brand text-xs text-muted-foreground transition-colors"
          aria-hidden
        >
          →
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      <p className="text-xs tracking-wide text-muted-foreground/70 uppercase">
        {hint}
      </p>
    </a>
  )
}
