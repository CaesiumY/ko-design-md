export function HomeHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
      <p className="text-meta-caps animate-fade-in-up">
        CATALOG · KOREAN DESIGN — LLM CONTEXT
      </p>
      <h1
        className="text-display mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        한국 서비스의<br />
        시그니처 디자인을<br />
        <span className="text-muted-foreground">LLM 컨텍스트로,</span>{" "}
        <span className="font-light italic">사람이 읽기 즐겁게.</span>
      </h1>
      <p
        className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground animate-fade-in-up"
        style={{ animationDelay: "140ms" }}
      >
        각 카드 상세 페이지에서{" "}
        <strong className="text-foreground">한 번의 클릭으로 design.md 전체를 복사</strong>해
        Claude · Cursor · v0 같은 도구에 그대로 붙여넣으세요.
      </p>
    </section>
  )
}
