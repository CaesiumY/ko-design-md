import { Link } from "@tanstack/react-router"

import { ContributeDialog } from "./contribute-dialog"

const REPO_URL = "https://github.com/caesiumy/ko-design-md"

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.66.79.55C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12.5.5h-.5z" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-8">
        <Link to="/" className="group inline-flex items-baseline">
          <span className="text-display text-base font-extrabold tracking-tight">
            ko<span className="text-brand">/</span>design.md
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <ContributeDialog />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand inline-flex items-center gap-1.5 text-muted-foreground transition-colors"
            aria-label="GitHub repository"
          >
            <GithubMark className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
