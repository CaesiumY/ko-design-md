export function HomeHero() {
  return (
    <section className="mx-auto max-w-[1400px] break-keep px-8 [container-type:inline-size]">
      {/* Issue mark — top divider */}
      <div
        className="text-meta-caps animate-fade-in-up flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b pt-12 pb-3.5 sm:gap-x-6 sm:pt-20"
        style={{ borderColor: "var(--rule-strong)" }}
      >
        <span>CATALOG</span>
        <span>KOREAN DESIGN</span>
        <span className="text-brand font-bold">— LLM CONTEXT</span>
        <span className="tabular-nums sm:ml-auto">№ 001 / 2026.05</span>
      </div>

      {/* Massive hero title */}
      <h1
        className="text-display-massive animate-fade-in-up mt-10 sm:mt-16"
        style={{
          fontSize: "clamp(2.25rem, 15cqi, 14rem)",
          animationDelay: "60ms",
        }}
      >
        ko<span className="text-brand">/</span>design.md
      </h1>

      {/* Lede */}
      <p
        className="animate-fade-in-up mt-12 text-base leading-relaxed sm:text-lg"
        style={{ animationDelay: "140ms" }}
      >
        한국 서비스의 시그니처 디자인을 LLM 컨텍스트로.
        <br />
        <strong className="text-brand font-bold">
          한 번의 클릭으로 design.md 전체를 복사
        </strong>
        해 그대로 붙여넣으세요.
      </p>

      {/* spacer */}
      <div className="pb-16 sm:pb-20" />
    </section>
  )
}
