const REPO_URL = "https://github.com/caesiumy/ko-design-md"

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 py-12 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <p className="text-meta-caps">CATALOG</p>
          <p className="mt-3 leading-relaxed">
            한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs sm:items-end sm:text-right">
          <p className="text-meta-caps">License</p>
          <p>코드 MIT (잠정) · 콘텐츠 CC-BY 4.0 (잠정)</p>
          <p className="max-w-xs leading-relaxed">
            각 서비스명 · 로고는 해당 권리자 소유. 분석 목적 fair use에 한함.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            GitHub <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
