export function HomeHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 break-keep sm:pt-32 sm:pb-24">
      <p className="text-meta-caps animate-fade-in-up">
        CATALOG · KOREAN DESIGN — LLM CONTEXT
      </p>
      <h1
        className="text-display animate-fade-in-up mt-6 text-5xl font-black leading-[1.05] tracking-tighter sm:text-7xl lg:text-8xl"
        style={{ animationDelay: "60ms" }}
      >
        ko/design.md
      </h1>
      <p
        className="text-muted-foreground animate-fade-in-up mt-8 max-w-2xl text-base leading-relaxed"
        style={{ animationDelay: "140ms" }}
      >
        한국 서비스의 시그니처 디자인을 LLM 컨텍스트로.{" "}
        <strong className="text-foreground">한 번의 클릭으로 design.md 전체를 복사</strong>해
        Claude · Cursor · v0 같은 도구에 그대로 붙여넣으세요.
      </p>
    </section>
  )
}
