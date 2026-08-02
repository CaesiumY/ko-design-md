export function SiteFooter() {
  return (
    <footer
      className="mt-32 border-t py-10 text-xs"
      style={{ borderColor: "var(--rule-strong)" }}
    >
      <div className="mx-auto max-w-[1400px] px-8 text-center">
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
