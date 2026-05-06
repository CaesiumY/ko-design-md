import { Link } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"

const SITE_NAME = "ko/design.md"
const SITE_TAGLINE = "korean design — llm context"
const REPO_URL = "https://github.com/caesiumy/ko-design-md"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group inline-flex items-center gap-2.5">
          <span
            className="inline-block size-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:bg-[var(--accent-glow)] group-hover:shadow-[0_0_12px_var(--accent-glow)]"
            aria-hidden
          />
          <span className="text-display text-sm font-bold tracking-tight">
            {SITE_NAME}
          </span>
          <span className="text-meta-caps hidden sm:inline">— {SITE_TAGLINE}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            aria-label="GitHub repository"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
