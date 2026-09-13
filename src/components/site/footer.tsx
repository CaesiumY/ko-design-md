import { Link } from "@tanstack/react-router"

import { STATIC_PAGE_PATHS } from "@/lib/site-config"

// Keyed by the path list rather than written out as three links: adding a page
// to STATIC_PAGE_PATHS without a label here is a type error, not a page that
// the sitemap lists and no link on the site reaches.
const STATIC_PAGE_LABELS: Record<(typeof STATIC_PAGE_PATHS)[number], string> = {
  "/about": "소개",
  "/contact": "문의·정정",
  "/privacy": "개인정보 처리방침",
}

export function SiteFooter() {
  return (
    <footer
      className="mt-32 border-t py-10 text-xs"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="mx-auto max-w-[1400px] px-8 text-center">
        {/* The standing pages were once reachable only through sitemap.xml,
            llms.txt and a typed URL - /privacy had no inbound link at all. A
            crawler that follows HTML links, and every visitor, needs an entry
            point on each page, and the footer is the one every page renders. */}
        <nav
          aria-label="사이트 정보"
          className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-1"
        >
          {STATIC_PAGE_PATHS.map((path) => (
            <Link
              key={path}
              to={path}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              {STATIC_PAGE_LABELS[path]}
            </Link>
          ))}
        </nav>
        <p className="leading-relaxed text-muted-foreground">
          코드 MIT · 콘텐츠 CC BY 4.0 — 이 저장소가 저작한 부분에 한하며 범위와
          예외는 LICENSE-CONTENT 를 따릅니다. 각 서비스명·로고를 비롯한 제3자
          자산은 해당 권리자 소유이며 식별·참조 목적으로만 사용합니다. 이
          사이트는 어떤 브랜드와도 제휴·후원 관계가 없습니다.
        </p>
        <p className="text-meta-caps mt-4 tabular-nums">
          — Issue <span className="font-bold text-brand">001</span> / May 2026 —
        </p>
      </div>
    </footer>
  )
}
