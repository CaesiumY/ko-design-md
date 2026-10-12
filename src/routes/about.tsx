import { Link, createFileRoute } from "@tanstack/react-router"
import { ExternalLink, Section, StaticPage } from "./-static-page"
import { buildStaticPageSeo } from "@/lib/seo"
import { GITHUB_REPO_URL, SKILL_INSTALL_CMD } from "@/lib/site-config"

const DESCRIPTION =
  "ko/design.md 는 한국 서비스의 디자인 시스템을 공개 출처에서 확인해 DESIGN.md 문서 한 장으로 정리하는 오픈 카탈로그입니다. 목적, 한 문서가 명세 문서이자 카탈로그 항목인 이유, 인용·프로비넌스 정책을 설명합니다."

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
          ko/design.md 는 한국 서비스의 디자인 언어를 DESIGN.md 문서 한 장으로
          정리해 공개하는 오픈 카탈로그입니다. 한 항목은 그 브랜드의
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

      <Section heading="명세 문서이자 카탈로그 항목">
        <p>
          항목은 DESIGN.md 한 장으로 씁니다. Stitch 의 섹션 구조를 따르면서
          토큰은 Google Labs 가 발행한 DESIGN.md 명세의 YAML frontmatter 형태로
          담아 공식 도구가 그대로 읽고, 명세에는 없는 산문과 인용을 함께 담아 값
          옆에 그 값이 어디서 왔는지를 붙여 둡니다.
        </p>
        <p>
          그래서 변환본을 따로 두지 않습니다. 같은 문서가{" "}
          <code className="font-mono">
            /services/&#123;slug&#125;/DESIGN.md
          </code>{" "}
          에서도 명세의 파일명으로 그대로 나갑니다. 날짜·로고 같은 항목
          메타데이터와 인용도 함께 실리며, 공식 린터는 이를 문제 삼지 않습니다.
        </p>
        {/* 항목별 목록은 일부러 두지 않는다 — 어느 항목이 어느 값을 갖는지는
            항목이 바뀔 때마다 낡는다. `%` 라운드 수의 정본은
            `KNOWN_SPEC_LIMITATIONS` 이고, 별도 키는 각 항목의 frontmatter 가
            정본이다(`gradients`·`elevation`·`fonts`·`opacity`·`grid` 등).
            `%` 를 "읽지 않는다" 가 아니라 "오류로 보고한다" 로 쓴 것은 린터가
            값 자체는 읽기 때문이다(`{ value: 50, unit: "%" }` 와 에러를 함께
            낸다). 반대로 별도 키는 에러 없이 모르는 키로 지나가므로 "읽지 않고
            넘어간다" 가 맞다. 그림자를 "명세에 자리가 없다" 고 쓰지 말 것 —
            명세에는 `Elevation & Depth` 섹션이 있고, 없는 것은 토큰 맵이다.
            이 문단을 "표준 준수" 로 올려 쓰지 말 것 — 카탈로그는 명세를
            만족하되 명세로 대체되지 않는다(#382). */}
        <p>
          다만 명세가 아직 담지 못하는 값이 있습니다. 명세의 치수 단위는
          px·em·rem 뿐이라 <code className="font-mono">%</code> 로 적은 라운드는
          공식 린터가 오류로 보고합니다. 그래도 명세의 단위로 옮기지 않는 것은
          뜻이 달라지기 때문입니다 — <code className="font-mono">50%</code> 는
          직사각형을 타원으로, <code className="font-mono">9999px</code> 는 알약
          모양으로 깎습니다. 또 그라디언트·그림자·크기 없이 발행된 폰트
          패밀리처럼 명세의 토큰 맵에 자리가 없는 값은 명세가 모르는 별도 키(
          <code className="font-mono">gradients</code>·
          <code className="font-mono">elevation</code>·
          <code className="font-mono">fonts</code> 등)에 두므로, 표준 도구는
          이를 토큰으로 읽지 않고 넘어갑니다. 어느 쪽이든 카탈로그의 실수가
          아니라 명세의 표현력이 미치지 않는 자리이고, 브랜드가 발행한 값을
          지키려고 그대로 둡니다.
        </p>
      </Section>

      <Section heading="값은 어디서 오는가">
        <p>
          공개 자료로 뒷받침되는 주장에는{" "}
          <code className="font-mono">[src:N]</code> 인용이 붙고, 문서 끝의
          References 목록이 그 N 번째 출처입니다. 출처는 공식 디자인 시스템
          문서, 배포된 패키지, 브랜드가 직접 공개한 가이드처럼 누구나 확인할 수
          있는 것만 씁니다. 공개 자료로 대조할 수 없는 것은 지어내지 않고 Known
          Gaps 에 그렇다고 밝힙니다.
        </p>
        {/* "매 커밋마다" 라고 썼다가 고쳤다. CI 는 `pull_request` 와 main 푸시에
            돌아서, 커밋 세 개를 한 번에 밀면 한 번 돈다. 지킬 수 있는 범위는
            "병합되기 전에 한 번은" 이다. 이 페이지는 카탈로그를 믿어도 되는지
            판단하려고 읽는 자리라, 검증 가능하게 틀린 절대 표현을 두면 안 된다.
            hex 병기도 같은 이유로 좁혔다. 병기가 없는 색 토큰이 적지 않고
            `audit:oklch` 는 병기된 줄만 대조하므로, 모든 색이 대조된다고 읽히면
            안 된다. */}
        <p>
          색은 OKLCH 로 적습니다. 항목이 옮겨 온 브랜드 hex 가 있으면 곁에
          주석으로 병기합니다. 모든 변경은 병합되기 전에 기계 검증을 거칩니다 —
          병기된 hex 가 OKLCH 와 일치하는지, 인용 번호가 실재하는 출처를
          가리키는지, 프리뷰가 문서의 값과 어긋나지 않는지를 확인합니다. hex 가
          병기되지 않은 토큰은 이 중 첫 번째 대조를 거치지 않습니다.
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
