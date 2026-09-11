import { createFileRoute } from "@tanstack/react-router"
import { ExternalLink, Section, StaticPage } from "./-static-page"
import { buildStaticPageSeo } from "@/lib/seo"
import { GITHUB_REPO_URL } from "@/lib/site-config"

const DESCRIPTION =
  "getdesign.kr 은 계정도 로그인도 폼도 없습니다. 이 문서는 사이트가 무엇을 수집하지 않는지, 그리고 페이지를 여는 것만으로 어떤 외부 요청이 나가는지를 설명합니다."

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildStaticPageSeo({
      path: "/privacy",
      title: "개인정보 처리방침",
      description: DESCRIPTION,
    }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <StaticPage eyebrow="PRIVACY" title="개인정보 처리방침">
      <Section heading="수집하지 않는 것">
        <p>
          이 사이트에는 계정도, 로그인도, 입력 폼도 없습니다.
          이름·이메일·전화번호 같은 개인정보를 받는 자리가 아예 없으므로
          수집하지 않습니다. 결제 수단을 다루지 않고, 광고 네트워크나 리타게팅
          픽셀을 심지 않으며, 방문자를 식별하는 쿠키를 설정하지 않습니다.
        </p>
        <p>
          카테고리 필터와 검색어는 주소창의{" "}
          <code className="font-mono">?cat=</code> 과{" "}
          <code className="font-mono">?q=</code> 에만 담기고 어디에도 저장되지
          않습니다. 페이지를 닫으면 남지 않습니다.
        </p>
      </Section>

      <Section heading="페이지를 열면 나가는 요청">
        <p>
          정직하게 말하면, 아무것도 나가지 않는 것은 아닙니다. 세 가지가
          있습니다.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>호스팅(Vercel).</strong> 사이트가 Vercel 에서 서빙되므로,
            다른 웹사이트와 마찬가지로 요청이 서버 로그에
            남습니다(IP·User-Agent·요청 경로 등). 이 로그는 Vercel 이 보유하며
            이 프로젝트가 따로 내려받거나 보관하지 않습니다.
          </li>
          <li>
            <strong>Vercel Analytics.</strong> 어떤 항목이 읽히는지 파악하기
            위해 페이지뷰를 집계합니다. 쿠키를 쓰지 않고 개인을 식별하지 않는
            방식입니다.
          </li>
          <li>
            <strong>조회수 배지(hits.sh).</strong> 항목 상세 페이지에는 조회수
            배지가 이미지로 들어갑니다. 그 이미지를 불러오는 과정에서 브라우저가{" "}
            <code className="font-mono">hits.sh</code> 에 직접 요청하므로, 해당
            서비스는 그 요청을 볼 수 있습니다. 이 사이트가 받아 오는 것은 숫자가
            그려진 이미지뿐이고, 방문자 정보를 그쪽에 따로 넘기지 않습니다.
          </li>
        </ul>
      </Section>

      <Section heading="브라우저에 남는 것">
        <p>
          프리뷰의 라이트/다크 전환 같은 화면 상태는 브라우저 안에만 저장되며
          서버로 전송되지 않습니다. 브라우저 저장소를 비우면 함께 사라집니다.
        </p>
      </Section>

      <Section heading="문서 바깥의 링크">
        <p>
          각 항목은 공개 출처를 인용하고 그 URL 로 링크합니다. 그 링크를
          따라가면 해당 사이트의 방침이 적용되며, 이 문서가 미치지 않습니다.
        </p>
      </Section>

      <Section heading="변경과 문의">
        <p>
          이 문서가 바뀌면 저장소 커밋 기록에 남습니다. 내용에 대한 질문이나
          정정 요청은{" "}
          <ExternalLink href={`${GITHUB_REPO_URL}/issues`}>
            GitHub 이슈
          </ExternalLink>{" "}
          로 보내 주세요.
        </p>
      </Section>
    </StaticPage>
  )
}
