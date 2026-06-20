export function SiteFooter() {
  return (
    <footer
      className="mt-32 border-t py-10 text-xs"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="mx-auto max-w-[1400px] px-8 text-center">
        <p className="leading-relaxed text-muted-foreground">
          코드 MIT (잠정) · 콘텐츠 CC-BY 4.0 (잠정) · 각 서비스명·로고는 해당
          권리자 소유, 분석 목적 fair use에 한함.
        </p>
        <p className="text-meta-caps mt-4 tabular-nums">
          — Issue <span className="font-bold text-brand">001</span> / May 2026 —
        </p>
      </div>
    </footer>
  )
}
