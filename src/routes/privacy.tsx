import { createFileRoute } from "@tanstack/react-router"
import { ExternalLink, Section, StaticPage } from "./-static-page"
import { buildStaticPageSeo } from "@/lib/seo"
import { GITHUB_REPO_URL } from "@/lib/site-config"

const DESCRIPTION =
  "getdesign.kr 은 계정도 로그인도 폼도 없습니다. 이 문서는 사이트가 무엇을 수집하지 않는지, 그리고 페이지를 열 때 어떤 외부 요청이 나가는지를 설명합니다."

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
        {/* 한때 이 문단은 검색어가 "어디에도 저장되지 않고 페이지를 닫으면
            남지 않는다"고 썼다. 사실이 아니다 — `?q=` 는 URL 의 일부라 그 주소로
            직접 들어오거나 새로고침하면 요청 라인에 실려 서버 로그에 남고(바로
            아래 항에서 우리 스스로 그렇게 적고 있다), 브라우저 방문 기록에도
            남는다. 개인정보 문서의 절대 표현은 지킬 수 있는 범위로만 쓴다. */}
        <p>
          카테고리 필터와 검색어는 주소창의{" "}
          <code className="font-mono">?cat=</code> 과{" "}
          <code className="font-mono">?q=</code> 에 담깁니다. 이 값을 따로
          수집하거나 저장하지 않고, 분석 도구나 외부로 보내지도 않습니다.
        </p>
        <p>
          다만 URL 의 일부이므로, 그 주소로 직접 들어오거나 새로고침하면 요청에
          함께 실려 아래에 적은 서버 로그에 남고 브라우저 방문 기록에도
          남습니다. 검색창은 브랜드 이름을 찾는 용도이니 민감한 내용을 입력하지
          마세요.
        </p>
      </Section>

      <Section heading="사이트를 쓰면 나가는 요청">
        <p>
          정직하게 말하면, 아무것도 나가지 않는 것은 아닙니다. 세 가지가
          있습니다.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            {/* 근거는 Cloudflare 문서다(2026-11-14 조회). Workers Logs 는
                무료 요금제 3일, 유료 7일 보관하고, 새 Worker 는 기본으로 켜져
                있다. wrangler.jsonc 의 observability 를 끄거나 요금제를 바꾸면
                이 문단도 함께 고칠 것. */}
            <strong>호스팅(Cloudflare).</strong> 사이트가 Cloudflare Workers
            에서 서빙되므로, 다른 웹사이트와 마찬가지로 요청 정보(IP,
            User-Agent, 요청 주소 등)가 Cloudflare 를 거칩니다. 이때 남는 서버
            로그는 이 프로젝트의 Cloudflare 계정에 최대 7일 남고 관리자가
            대시보드에서 오류를 살필 때 볼 수 있습니다. 따로 내려받거나 그보다
            오래 보관하지 않습니다.
          </li>
          <li>
            {/* 근거는 Cloudflare Web Analytics 문서(about, FAQ)다(2026-11-14
                조회). 자동 설정은 같은 도메인의 /cdn-cgi/rum 으로 보내고,
                쿼리 문자열은 기록하지 않으며, 커스텀 이벤트는 지원하지 않는다.
                복사나 다운로드를 다시 계측하게 되면 이 문단을 먼저 고칠 것. */}
            <strong>Cloudflare Web Analytics.</strong> 어떤 항목이 읽히는지
            파악하기 위해 페이지뷰를 집계합니다. Cloudflare 가 페이지에 넣는
            측정 스크립트는 브라우저가{" "}
            <code className="font-mono">static.cloudflareinsights.com</code>{" "}
            에서 내려받고, 로딩 성능과 방문한 페이지를 이 사이트 주소로
            보냅니다. Cloudflare 는 이 기능이 방문자의 개인정보를 수집하거나
            쓰지 않고, 주소의 쿼리 문자열(검색어가 담기는{" "}
            <code className="font-mono">?q=</code> 등)도 기록하지 않는다고
            밝히고 있습니다. 복사 버튼이나 다운로드 버튼을 누른 것은 따로 보내지
            않습니다.
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
