import { Link, createFileRoute } from "@tanstack/react-router"
import { ExternalLink, Section, StaticPage } from "./-static-page"
import { buildStaticPageSeo } from "@/lib/seo"
import { GITHUB_REPO_URL } from "@/lib/site-config"

const DESCRIPTION =
  "ko/design.md 에 값 정정을 신고하거나, 새 브랜드를 제안하거나, 브랜드 권리자로서 문의하는 방법. 모든 연락은 GitHub 이슈로 받습니다."

export const Route = createFileRoute("/contact")({
  head: () =>
    buildStaticPageSeo({
      path: "/contact",
      title: "문의·정정",
      description: DESCRIPTION,
    }),
  component: ContactPage,
})

function ContactPage() {
  return (
    <StaticPage eyebrow="CONTACT" title="문의하기">
      <Section heading="연락 창구는 하나입니다">
        <p>
          모든 문의는{" "}
          <ExternalLink href={`${GITHUB_REPO_URL}/issues`}>
            GitHub 이슈
          </ExternalLink>
          로 받습니다. 공개된 자리에서 주고받아야 같은 질문이 두 번 오지 않고,
          어떤 근거로 값이 바뀌었는지가 기록으로 남기 때문입니다. 이슈를 열 수
          없는 사정이 있다면 저장소의{" "}
          <ExternalLink href={`${GITHUB_REPO_URL}/discussions`}>
            Discussions
          </ExternalLink>{" "}
          도 같은 창구입니다.
        </p>
      </Section>

      <Section heading="값이 틀렸을 때">
        <p>
          가장 반가운 제보입니다. 다만 고치려면 근거가 필요하니 아래 세 가지를
          함께 적어 주세요.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            어느 항목의 어떤 토큰인지 (예:{" "}
            <code className="font-mono">toss</code> 의{" "}
            <code className="font-mono">blue-500</code>)
          </li>
          <li>맞는 값과, 그 값이 적힌 공개 URL</li>
          <li>그 URL 을 확인한 날짜</li>
        </ul>
        <p>
          날짜를 받는 이유는 상류가 조용히 바뀌는 일이 잦아서입니다. 값이 언제
          기준으로 맞았는지가 남아 있어야, 다음에 다시 대조할 때 무엇이
          달라졌는지 알 수 있습니다. 카탈로그 쪽 대조 결과도 같은 방식으로 해당
          섹션 첫머리에 날짜와 함께 남깁니다.
        </p>
      </Section>

      <Section heading="새 브랜드 제안">
        <p>
          한국 서비스이고, 디자인 시스템이나 그에 준하는 값이 공개돼 있다면
          후보입니다. 제안할 때 공개 문서·디자인 시스템 사이트·배포된 패키지처럼
          값을 확인할 수 있는 출처를 함께 알려 주시면 검토가 훨씬 빠릅니다. 출처
          없이 스크린샷만으로는 항목을 만들지 않습니다 — 그러면 카탈로그가
          추정값을 싣게 됩니다.
        </p>
      </Section>

      <Section heading="브랜드 권리자이신 경우">
        <p>
          이 카탈로그는 공개된 출처만 인용해 정리하며, 로고와 서체 같은 자산의
          권리는 각 브랜드에 있습니다. 표기·인용·자산 사용에 관해 정정이나
          요청이 있으시면 이슈로 알려 주세요. 어떤 부분인지 특정해 주시면 확인
          후 조치하고, 무엇을 어떻게 고쳤는지는 공개 기록으로 남깁니다. 이용
          조건에 대해서는{" "}
          <Link to="/about" className="underline underline-offset-4">
            소개
          </Link>{" "}
          문서가 가리키는 저장소의 라이선스 문서가 기준입니다.
        </p>
      </Section>
    </StaticPage>
  )
}
