import { Link, createFileRoute } from "@tanstack/react-router"
import { ExternalLink, Section, StaticPage } from "./-static-page"
import { buildStaticPageSeo } from "@/lib/seo"
import { GITHUB_REPO_URL, SKILL_INSTALL_CMD } from "@/lib/site-config"

const DESCRIPTION =
  "ko/design.md 는 한국 서비스의 디자인 시스템을 공개 출처에서 확인해 design.md 한 장으로 정리하는 오픈 카탈로그입니다. 목적, 두 포맷을 함께 발행하는 이유, 인용·프로비넌스 정책을 설명합니다."

export const Route = createFileRoute("/about")({
  head: () =>
    buildStaticPageSeo({
      path: "/about",
      title: "소개",
      description: DESCRIPTION,
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <StaticPage eyebrow="ABOUT" title="이 카탈로그에 대하여">
      <Section heading="무엇을 하는 곳인가">
        <p>
          ko/design.md 는 한국 서비스의 디자인 언어를{" "}
          <code className="font-mono">design.md</code> 한 장으로 정리해 공개하는
          오픈 카탈로그입니다. 한 항목은 그 브랜드의
          색·타이포그래피·간격·라운드·그림자와 시그니처 컴포넌트, 그리고 지켜야
          할 것과 피해야 할 것을 담습니다.
        </p>
        <p>
          읽는 쪽은 사람만이 아닙니다. 각 항목은 브라우저용 페이지이면서 동시에{" "}
          <code className="font-mono">/services/&#123;slug&#125;/llms.txt</code>{" "}
          에서 평문 마크다운으로, <code className="font-mono">/llms.txt</code>{" "}
          에서 전체 색인으로 제공됩니다. 코딩 에이전트에게는{" "}
          <code className="font-mono">use-design-md</code> 스킬(
          <code className="font-mono">{SKILL_INSTALL_CMD}</code>)이 호출
          규약입니다.
        </p>
      </Section>

      <Section heading="왜 포맷이 둘인가">
        <p>
          원본은 Stitch v0.1 형식으로 씁니다. 산문과 인용을 함께 담을 수 있어,
          값 옆에 그 값이 어디서 왔는지를 붙여 둘 수 있기 때문입니다. 같은
          항목은{" "}
          <code className="font-mono">
            /services/&#123;slug&#125;/DESIGN.md
          </code>{" "}
          에서 Google Labs 가 발행한 DESIGN.md 표준 형식으로도 받을 수 있습니다
          — 토큰이 YAML frontmatter 에 담긴 형태라 기계가 바로 파싱합니다.
        </p>
        <p>
          둘 중 하나가 정본인 것이 아니라 청중이 다릅니다. 표준 스키마에는
          인용과 프로비넌스를 담을 자리가 없어서, 그 정보는 원본 쪽에만
          남습니다.
        </p>
      </Section>

      <Section heading="값은 어디서 오는가">
        <p>
          구체적인 주장에는 전부 <code className="font-mono">[src:N]</code>{" "}
          인용이 붙고, 문서 끝의 References 목록이 그 N 번째 출처입니다. 출처는
          공식 디자인 시스템 문서, 배포된 패키지 번들, 브랜드가 직접 공개한
          가이드처럼 누구나 확인할 수 있는 것만 씁니다. 확인되지 않은 것은
          지어내지 않고 Known Gaps 에 공백으로 남깁니다.
        </p>
        {/* "매 커밋마다" 라고 썼다가 고쳤다. CI 는 `pull_request` 와 main 푸시에
            돌아서, 커밋 세 개를 한 번에 밀면 한 번 돈다. 지킬 수 있는 범위는
            "병합되기 전에 한 번은" 이다. 이 페이지는 카탈로그를 믿어도 되는지
            판단하려고 읽는 자리라, 검증 가능하게 틀린 절대 표현을 두면 안 된다. */}
        <p>
          색은 전부 OKLCH 로 정규화하고 원본 hex 를 주석으로 병기합니다. 모든
          변경은 병합되기 전에 기계 검증을 거칩니다 — OKLCH 와 병기 hex 가
          일치하는지, 인용 번호가 실재하는 출처를 가리키는지, 프리뷰가 문서의
          값과 어긋나지 않는지를 확인합니다.
        </p>
      </Section>

      <Section heading="무엇이 아닌가">
        <p>
          공식 문서를 대체하지 않습니다. 각 항목은 출처를 가리키고 있고,
          상충하면 출처가 정본입니다. 브랜드 자산(로고·서체)의 배포처도 아니며,
          각 자산의 권리는 해당 브랜드에 있습니다. 카탈로그에 없는 브랜드의
          디자인을 추정하는 근거로도 쓰지 마세요 — 없으면 없다고 말하는 편이
          그럴듯한 값을 만들어 내는 것보다 낫습니다.
        </p>
        <p>
          카탈로그 콘텐츠와 코드의 이용 조건은 저장소의{" "}
          <ExternalLink href={`${GITHUB_REPO_URL}/blob/main/LICENSE-CONTENT`}>
            LICENSE-CONTENT
          </ExternalLink>
          {" 와 "}
          <ExternalLink href={`${GITHUB_REPO_URL}/blob/main/NOTICE`}>
            NOTICE
          </ExternalLink>{" "}
          가 단일 기준입니다. 이 문단은 그 내용을 요약하지 않고 가리키기만
          합니다 — 같은 조건을 여러 곳에 적어 두면 한쪽만 고쳐지는 날이 오기
          때문입니다.
        </p>
      </Section>

      <Section heading="기여하기">
        <p>
          값이 틀렸거나, 넣었으면 하는 브랜드가 있다면{" "}
          <Link to="/contact" className="underline underline-offset-4">
            문의·정정
          </Link>{" "}
          문서를 보세요. 저장소는{" "}
          <ExternalLink href={GITHUB_REPO_URL}>GitHub</ExternalLink> 에 공개돼
          있고, 항목을 만드는 파이프라인과 검증기도 함께 들어 있습니다.
        </p>
      </Section>
    </StaticPage>
  )
}
