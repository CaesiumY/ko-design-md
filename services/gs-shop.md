---
name: GS SHOP
slug: gs-shop
category: commerce
last_updated: "2026-09-03"
created_at: "2026-08-30"
sources:
  - https://m.gsshop.com
  - https://design.gsshop.com
  - https://m.gsshop.com/section/livetalk
  - https://apps.apple.com/kr/app/gs-shop/id365438600
  - https://play.google.com/store/apps/details?id=gsshop.mobile.v2&hl=ko
  - https://www.sedaily.com/NewsView/2GWSVGO6KY
  - https://www.joongangenews.com/news/articleView.html?idxno=445944
  - https://www.newswire.co.kr/newsRead.php?no=1017572
  - https://www.sedaily.com/article/14110006
  - https://gsretail.tistory.com/20
  - https://gsretail.tistory.com/16
  - https://hpsimg.gsretail.com/gsretail/ko/intro/ci-ri
  - https://ex-hubpage.grm.gsretail.com/_nuxt/entry.HxTB7rhz.css
  - https://news.nate.com/view/20240902n05010
  - https://zdnet.co.kr/view/?no=20240901100644
  - http://hpimg.gsretail.com/_ui/desktop/common/docs/GS+CIBI.zip
  - https://channel.brand.gsretail.com/26e6733fb
lang: ko
logo: https://getdesign.kr/logos/gs-shop.png
fonts:
  font-sans: '"Pretendard", -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", "Malgun Gothic", helvetica, sans-serif'
colors:
  ## Brand — Primary (Dynamic Blue)
  primary-default: oklch(0.600 0.219 258)   # #0F78FF · 헤더 로고 SVG 6개 path 의 fill 과 같은 값
  primary-middle: oklch(0.640 0.190 256)   # #2C8AFC
  primary-light: oklch(0.964 0.016 254)   # #ECF4FE · 파랑 계열 표면 틴트
  ## Brand — Secondary (Bright Pink)
  secondary-default: oklch(0.666 0.247 358)   # #FF2F93 · 구매·결제 CTA 실측값
  secondary-middle: oklch(0.722 0.206 351)   # #FF63B5
  secondary-light: oklch(0.970 0.017 344)   # #FEF1F8 · 분홍 계열 표면 틴트
  ## Semantic — Positive
  positive-dark: oklch(0.549 0.173 144)   # #12891D · 공식 문서와 라이브가 일치
  positive-middle: oklch(0.645 0.205 143)   # #17AB24
  positive-light: oklch(0.961 0.024 147)   # #E8F7E9 · 배경 용도
  ## Semantic — Negative
  negative-dark: oklch(0.507 0.208 29)   # #C00002 · 공식 문서와 라이브가 일치
  negative-middle: oklch(0.599 0.239 29)   # #ED1414
  negative-light: oklch(0.971 0.010 10)   # #FCF3F4 · 배경 용도
  ## Semantic — Notice
  # 공식 문서(2025-06 판)는 이 3색을 #FFF4E6 / #FD8F03 / #CA7202 로 발행한다 — 아래 세 값은 라이브 실측이고 문서와 어긋난다
  notice-dark: oklch(0.665 0.213 39)   # #F95401 · 라이브 실측 · 공식 문서와 불일치
  notice-middle: oklch(0.719 0.185 44)   # #FF7631 · 라이브 실측 · 공식 문서와 불일치
  notice-light: oklch(0.976 0.015 61)   # #FFF5ED · 라이브 실측 · 공식 문서와 불일치
  ## Semantic — Information
  information-dark: oklch(0.515 0.181 257)   # #0063CC · 공식 문서와 라이브가 일치
  information-middle: oklch(0.607 0.215 257)   # #007CFF
  information-light: oklch(0.956 0.022 250)   # #E6F2FF · 배경 용도
  ## Content
  content-primary: oklch(0.218 0.019 285)   # #191923 · 본문·제목 기본색
  content-secondary: oklch(0.385 0.027 285)   # #424252
  # 공식 문서는 이 토큰을 #76768E 로 발행한다 — 아래 값은 라이브 실측이다
  content-tertiary: oklch(0.561 0.037 285)   # #72728A · 라이브 실측 · 공식 문서와 불일치
  content-quaternary: oklch(0.680 0.042 285)   # #9595B2 · Gray 400, State Layer 의 기준색
  content-disabled: oklch(0.797 0.037 286)   # #BABAD4
  content-accent: oklch(0.612 0.245 2)   # #ED0777 · 할인율 라벨. 공식 문서에 없는 신규 토큰
  ## Background
  bg-primary: oklch(1.000 0.000 0)   # #FFFFFF · 기본 캔버스
  bg-secondary: oklch(0.985 0.003 265)   # #F9FAFC
  bg-tertiary: oklch(0.974 0.005 275)   # #F5F6FA · 입력 필드·Informational 배지 배경
  ## Border
  border-primary: oklch(0.874 0.023 281)   # #D2D4E5 · 아웃라인 버튼 보더
  border-secondary: oklch(0.944 0.012 276)   # #EAECF5
  border-tertiary: oklch(0.974 0.005 275)   # #F5F6FA · bg-tertiary 와 같은 값
  border-focus: oklch(0.218 0.019 285)   # #191923 · content-primary 와 같은 값
  ## Overlay (Gray 400 에 알파만 얹은 값)
  # overlay.tertiary 만 기준색이 다르다 — primary/secondary 는 Gray 400, tertiary 는 더 어두운 회색이다
  overlay-primary: oklch(0.680 0.042 285 / 30%)   # #9595B24D
  overlay-secondary: oklch(0.680 0.042 285 / 20%)   # #9595B233
  overlay-tertiary: oklch(0.482 0.032 285 / 8%)   # #5C5C7014 — 공식 문서는 Gray 400 의 10% 인데 라이브는 기준색부터 다르다
  ## Source — Aqua Blue (슬롯 이름은 유지된 채 값만 새 브랜드 블루로 덮인 램프)
  source-aquablue-dark: oklch(0.538 0.221 261)   # #0A61EB
  source-aquablue-middle: oklch(0.600 0.219 258)   # #0F78FF · primary-default 와 같은 값
  source-aquablue-light: oklch(0.964 0.016 254)   # #ECF4FE
  ## Source — Extended (공식 문서 2025-06 판 · 라이브 미대조)
  source-cyan: oklch(0.715 0.155 237)   # #10AFF7 · 현행 여부 미확인
  source-purple: oklch(0.594 0.222 298)   # #9253EE · vvip 배지 실추출값과 같은 값
  source-gold: oklch(0.599 0.102 95)   # #937F2F · 현행 여부 미확인
  source-yellow: oklch(0.856 0.173 88)   # #FFC70E · gold 배지 실추출값과 같은 값
  ## 멤버십 등급 배지 (홈 CSS 인라인 SVG 실추출)
  tier-welcome: oklch(0.833 0.181 118)   # #BED730 · 잎 마크. 2009~2025 BI 의 Leaf Green 과 같은 값
  tier-gold: oklch(0.856 0.173 88)   # #FFC70E · 별 마크
  tier-vip: oklch(0.735 0.114 204)   # #33BECA · 청록 왕관
  tier-vvip: oklch(0.594 0.222 298)   # #9253EE · 보라 왕관
  tier-diamond: oklch(0.669 0.180 253)   # #3396FF · 다이아몬드 마크
  ## 방송 플래그 (홈 CSS 인라인 SVG 실추출)
  live-flag-from: oklch(0.570 0.226 7)   # #D90961 · LIVE pill 그라디언트 시작
  live-flag-to: oklch(0.682 0.218 6)   # #FF4B83 · LIVE pill 그라디언트 끝
  live-flag-dot: oklch(0.843 0.176 104)   # #DFD00E · LIVE 인디케이터 점
  replay-flag-from: oklch(0.578 0.131 239)   # #0282BE · REPLAY 그라디언트 시작
  replay-flag-to: oklch(0.691 0.118 205)   # #02B0BE · REPLAY 그라디언트 끝
  replay-flag-dot: oklch(0.875 0.206 120)   # #C6E80E · REPLAY 인디케이터 점
typography:
  display-large:   # 공식 문서는 Display 를 semibold~bold 로만 적어 단계별 weight 가 미상이다
    fontSize: 56px
    lineHeight: 1.25
  display-medium:   # weight 미상 (semibold~bold)
    fontSize: 44px
    lineHeight: 1.25
  display-small:   # weight 미상 (semibold~bold)
    fontSize: 38px
    lineHeight: 1.25
  headline-large:   # Top app bar · List heading · Dialog title · 홈 탭카드 Title
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.25
  headline-medium:   # 탭 섹션 Title · Carousel Title
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.25
  headline-small:   # 상품페이지 가격
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.25
  title-large:
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
  title-medium:
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.25
  title-small:   # Card title · Product Card 가격
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.25
  label-xlarge:   # Button · Menu · Chip · Snackbar · Tooltip
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
  label-large:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
  label-medium:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.25
  label-small:   # Product Card 평점 · Informational 배지 라벨
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.25
  label-xsmall:
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.25
  body-large:   # Product Card 상품명. Body 계열만 line-height 1.5 다
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-medium:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  space-1: 2px
  space-2: 4px
  space-3: 8px
  space-4: 12px   # 공식 문서가 명시한 기본값
  space-5: 16px
  space-6: 20px
  space-7: 24px
  space-8: 28px
  space-9: 32px
  space-10: 36px
  space-11: 40px
  space-12: 44px
  space-13: 48px
  space-14: 52px
  space-15: 56px
  space-16: 64px
  space-17: 72px
  space-18: 80px
rounded:
  radius-xs: 4px
  radius-s: 6px
  radius-m: 8px   # 라이브 기본 버튼의 고정 라운드와 같은 값
  radius-l: 12px   # 기록에서 l / lg 로 이름이 갈리는 단계. Banner·카드 상단 라운드
  radius-xl: 16px   # 공식 Card 기본 radius
  radius-xxl: 20px
---

# GS SHOP — design.md

## Brand & Style

GS SHOP은 TV 편성표와 모바일 라이브가 한 앱에 공존하는 홈쇼핑 커머스로, 2025년 BI 리뉴얼 뒤 계정 동선은 다이내믹 블루가, 구매 동선은 브라이트 핑크가 맡는 2색 대비 위에 서 있다 [src:1][src:6].

GS리테일의 TV·모바일 홈쇼핑 브랜드이며 [src:14], 2025년 9월 1일 자로 2009년 GS샵 통합 BI 출범 이후 16년 만의 전면 BI 리뉴얼을 시행했다 [src:6][src:7]. 9월 1일은 BI 시행일이지 개국일이 아니다 — GS SHOP 개국은 1995년이다 [src:6][src:7]. 리뉴얼 배경으로는 "TV·PC 중심으로 설계됐던 기존 BI를 TV와 모바일 중심으로 재편된 쇼핑 환경에 맞추기 위함"을 들었다 [src:6][src:7]. 주색상이 리프 그린에서 다이내믹 블루로, 보조색상이 신규 브라이트 핑크로 바뀌었고 각각 "모험과 활기", "감각적 표현"을 상징한다고 밝혔다 [src:6].

화면의 기본값은 밝은 배경 위의 커머스 그리드다. 마케팅 스크린샷은 브랜드 블루를 풀블리드 배경으로 깔고 그 위에 흰 로고 마크와 굵은 산세리프를 얹지만, 앱 내부는 흰 캔버스에 상품 카드가 촘촘히 놓이는 구조이고 "패션 Now" 같은 편집형 섹션에서만 짙은 배경 + 화이트 텍스트의 다크 서브섹션을 병행한다 [src:4]. 라이브 방송 배지와 구매 CTA에 분홍을 몰아 쓰는 것이 이 팔레트의 성격을 결정한다 — 파랑은 브랜드와 계정, 분홍은 액션과 긴급성이다 [src:1][src:4].

값의 생산 경로도 공개돼 있다. Figma에서 토큰을 뽑아 Style Dictionary로 플랫폼별 변환하고, 문서화는 Zeroheight, 컴포넌트 개발은 Storybook, 화면 구조는 Atomic Design을 쓴다 [src:10]. 같은 발표를 다른 저자가 요약한 글에서도 Figma 제작 → Zeroheight 정리 → Storybook 연결이 독립적으로 재확인된다 [src:11]. 토큰은 Material Design의 체계를 기반으로 Reference(전역 원시값) → System(테마·컨텍스트별 재정의) → Component(컴포넌트별 이름) 3계층으로 나누고 작업 시 각각 `ref`·`sys`·`comp`로 줄여 쓴다 [src:2][src:10].

BI 리뉴얼과는 별개로, 2024년 9월에는 행동 데이터를 분석해 앱 화면의 50%를 개인화하고 카테고리 노출 순서를 동적으로 재배치하는 기능 개편이 먼저 있었다 — 검색어·상세페이지 조회시간·장바구니·구매이력 등이 입력이다 [src:15][src:14]. 계열 차원에서는 방송 프로그램 하나하나가 별도 브랜드 페이지를 갖는 방식으로 관리되어, 홈쇼핑사가 프로그램 단위로 BI를 운용한다는 점이 드러난다 [src:17].

다크 테마는 없다. 사이트가 `prefers-color-scheme: dark`를 인식하기는 하나 별도의 다크 테마 클래스나 `data-theme` 속성이 없어 실질적으로 라이트 전용이다 [src:1].

## Colors

> **공식 문서·라이브 대조(2026-08-22).** design.gsshop.com의 Colors 페이지는 2025-06 판본이라 2025-09 BI 리뉴얼이 반영돼 있지 않다 [src:2]. 그래서 Brand(Primary/Secondary)는 m.gsshop.com의 렌더링된 `:root`를 정본으로 삼았고 [src:1], Positive·Negative·Information·Content·Background·Border 계열은 두 출처가 hex 단위까지 일치해 그대로 썼다. 어긋난 4건 — notice 3색 · content.tertiary · overlay.tertiary · 공식 문서에 없는 신규 content.accent — 은 각각 그 토큰 줄과 바로 위 주석에 남겼다.

팔레트의 값은 추정이 아니라 프로덕션에서 읽은 것이다. 서비스 중인 모바일 웹의 `:root`에서 `getComputedStyle`로 컬러 커스텀 프로퍼티 39개를 직접 읽었다(선언은 41개이나 `--vh`·`--max-width`는 색이 아니다) [src:1]. 이 중 `--body-background-color`·`--body-font-color` 둘은 각각 `bg-primary`·`content-secondary`와 값이 같은 레거시 별칭이라 중복을 빼면 37개이고, frontmatter에는 그 37개를 그대로 실었다.

브랜드색이 두 축으로 갈려 있고 그 분업이 실측으로 확인된다. 파랑은 계정·인증, 분홍은 커머스 전환이다.

| 역할 | 토큰 | 근거 |
| --- | --- | --- |
| 계정·인증 액션 (로그인 등) | `{colors.primary-default}` | `.gui-btn.accent` 배경 실측 [src:1] |
| 구매·결제 CTA | `{colors.secondary-default}` | `.gui-btn.red` 배경 실측 [src:1] |
| 2차 액션 아웃라인 | `{colors.border-primary}` | `.gui-btn.outline` 의 1px 보더 [src:1] |
| 할인율 라벨 | `{colors.content-accent}` | `.price-discount` 실측 [src:1] |
| 라이브 방송 배지 | `{colors.live-flag-from}` → `{colors.live-flag-to}` | 홈 CSS 인라인 SVG 실추출 [src:1] |

`{colors.primary-default}`가 브랜드색이라는 근거는 두 겹이다. 헤더의 `.gs-logo`는 `<img>`가 아니라 CSS `background-image`로 삽입된 인라인 SVG이고, 그 6개 path 전부가 이 값 하나를 `fill`로 쓴다 [src:1]. 별도로 GS ALL 멤버십 앱 웹뷰 스타일시트의 `.GSSHOP` 스코프에서도 같은 값이 `[class*=button-primary]` 배경으로 17회 나타나, 앱 웹뷰와 모바일 웹이 같은 토큰 체계를 공유한다는 방증이 된다 [src:13].

명도 스케일 규칙은 공식 문서에 있다 — "Color의 숫자가 낮을수록 밝고 클수록 어두운색"이며 50·100·200…900의 10단계를 기본으로 하되 Gray만 25·950을 더해 12단계로 만든다. Brand Color만 light/middle/default/dark의 4단계로 세분화하고 나머지 Semantic은 light/middle/dark의 3단계이며, light는 Background, middle·dark는 Content 용도로 권장한다 [src:2]. System Color의 모든 색상이 WCAG AA의 색상 최소 대비 요구사항을 충족한다고 문서가 밝히고, 스케일을 만들 때 미리 정의한 명암비를 기준으로 각 색을 미세 조정했다는 서술이 함께 있다 [src:2].

`source-aquablue` 램프는 리브랜딩이 값을 어떻게 갈아 끼웠는지 보여 준다. 공식 문서의 `sys.source.aquaBlue.middle`은 청록이었는데 지금 라이브의 같은 슬롯은 `{colors.primary-default}`와 동일한 값이다 — 즉 토큰 슬롯 이름은 유지한 채 값만 새 브랜드 블루로 덮어썼다 [src:2][src:1]. 같은 계열의 Cyan·Purple·Gold·Yellow는 라이브와 대조하지 않아 현행 여부가 미확인이지만, 이 중 두 값이 멤버십 등급 배지 SVG에서 실추출된 값과 일치한다 [src:2][src:1].

리브랜딩 이전 값은 이력 참고용이다. 공식 문서에 아직 남아 있는 Leaf Green `#BED730`(≈ `oklch(0.833 0.181 118)`)과 Sunset Pink `#EE1F60`(≈ `oklch(0.615 0.233 11)`)은 현재의 브랜드색이 아니다 [src:2][src:6]. 다만 Leaf Green과 같은 값이 `{colors.tier-welcome}` 배지에 남아 있어, 등급 배지 계열이 이전 세대의 색을 물려받은 상태로 보인다 [src:1][src:2].

값의 출처에 대해 두 가지를 분명히 해 둔다. 첫째, 리뉴얼 보도자료와 기사 어디에도 정확한 HEX·RGB 수치는 없다 — 색 이름만 발표됐다 [src:9][src:8]. 둘째, 로고 상표 규정의 2색은 PANTONE 4975C와 PANTONE 213C인데, 색공간이 달라 화면 토큰과 육안 변환으로 일치 여부를 단정할 수 없다 [src:12]. 참고로 앱스토어 스크린샷을 픽셀 샘플링해 얻었던 근사값은 정식 토큰과 채널당 1~2단위 오차 안에 들었다 [src:4][src:1].

## Typography

서체는 Pretendard 하나로 통일돼 있다. 리뉴얼 보도에 "프리텐다드(Pretendard) 글꼴을 적용해 모바일 앱과 TV 방송 등 모든 채널에서 시인성을 높였다"고 명시됐고 [src:7], 라이브에서 계산된 `font-family`도 Pretendard가 1순위이며 `Malgun Gothic`이 한글 폴백으로 명시 포함돼 있다. body 기본 크기는 16px다 [src:1]. 이 문서는 스택을 frontmatter `fonts:`에 그대로 기록하되 별도의 `font-display-src`를 두지 않는다 — Pretendard는 프리뷰 런타임에 기본 번들되어 있어 로드할 외부 웹폰트가 없다.

공식 스케일은 Display / Headline / Title / Label / Body 5개 레벨, 17단계다 [src:2]. 이 스케일의 핵심 구분은 line-height에 있다 — **Body 계열만 1.5이고 나머지 네 레벨은 전부 1.25**다. 굵기는 Headline·Title이 bold, Label의 xlarge·large가 semibold, Label의 medium 이하와 Body가 regular이며, Display만 문서가 "semibold~bold"라고만 적어 단계별 값이 미상이다. 앱 내부 서식은 regular·semibold·bold 3종만 쓴다 [src:2].

용도 규정도 문서에 함께 있다. Display는 "화면에서 가장 큰 텍스트로 짧고 중요한 텍스트", Headline은 Top app bar·List heading·Dialog title과 홈 시그니처 탭카드 Title·탭 섹션 Title·상품페이지 가격·Carousel Title, Label은 Button·Menu·Chip·Snackbar·Tooltip, Body는 상품 상세와 공지사항 같은 텍스트 블록이다 [src:2].

letter-spacing은 frontmatter에 싣지 않았다. 크기가 클수록 음수 폭이 커지는 방식이라고 서술돼 있고 표의 양 끝값(Display large −0.16, Label xsmall −0.3)만 잡혔는데 단위가 문서에서 해소되지 않았기 때문이다 [src:2]. 대신 라이브에서 CTA 버튼의 `letter-spacing`이 `-0.025em`으로 측정된다 [src:1]. 소비자는 값이 필요하면 이 라이브 측정치를 기준으로 삼는 편이 안전하다.

인쇄·영문 체계는 화면과 분리돼 있다. 브랜드 아이덴티티 가이드는 영문 Display용으로 Whitney(Light/Medium/Black), 한글은 윤고딕을 원칙으로 하고 "모바일 앱과 웹에서는 Pretendard를 사용한다"고 매체별로 나눠 규정한다 [src:2].

**신뢰 등급.** 위 17단계 스케일과 용도 규정은 공식 문서 단독 출처이며 라이브 요소별 대조를 하지 않았다. 라이브 대조를 거친 것은 폰트 스택·body 기본 크기·CTA letter-spacing 세 가지뿐이다 [src:1][src:2].

## Spacing

기본 단위는 4px 배수이고, 공식 문서가 `spacing.4`(=12px)를 **기본값**으로 지정한다 [src:2]. 18단계 중 `space-1`(2px)만 예외이고, `space-2`(4px)부터 `space-15`(56px)까지는 4px씩 고르게 오른다. 마지막 3단계는 4의 배수가 14→16→18→20으로 건너뛰어 64·72·80px이 된다 [src:2]. 큰 값에서 간격을 성기게 만든 셈이라, 섹션 사이 여백은 `{spacing.space-16}` 이상에서 고르고 컴포넌트 내부는 `{spacing.space-3}`~`{spacing.space-5}` 범위에서 고르면 축을 벗어나지 않는다.

라이브에서 관찰되는 고유 `gap`은 4·6·8·12·16px다 [src:1]. 이 중 6px은 공식 spacing 축에 없는 값이라 컴포넌트 단위의 하드코딩으로 보인다 — 소비자가 축을 그대로 옮길 때는 `{spacing.space-2}`나 `{spacing.space-3}`으로 흡수하는 편이 일관된다. 버튼 내부 여백은 축과 별개로 규정돼 있어, CTA 버튼의 `padding`은 `7px 1em`이고 작은 버튼은 `4px 12px`, 입력 필드는 `10px 2.2em 10px 16px`다 [src:1].

**신뢰 등급.** 18단계 spacing 축은 공식 문서 단독 출처이며 라이브 대조를 하지 않았다. 위 `gap`·`padding` 실측만 라이브에서 나온 값이다 [src:1][src:2].

## Rounded

곡률 축은 6단계뿐이고 xs·s·m·l·xl·xxl로 이름 붙는다 [src:2]. 커머스 화면 대부분은 `{rounded.radius-m}`(버튼)과 `{rounded.radius-l}`~`{rounded.radius-xl}`(카드·배너)의 좁은 구간 안에서 처리된다 — 공식 Card의 기본 radius가 16, Banner가 12이고, 라이브 기본 버튼은 8px로 고정돼 있다 [src:2][src:1].

**12단계의 이름은 기록에서 갈린다.** 크롤된 토큰 표가 `borderRadius.l12`이므로 위 토큰 맵은 `l`을 따랐고, `lg` 표기가 나온 출처 위치는 미확인이다 — BorderRadius 전용 페이지가 수집 중 레이트리밋에 막혀 빈 셸만 남았기 때문이다 [src:2].

라이브의 고유 `border-radius`는 2·6·8·10·12·14·16·20·32·36·40·50·88px과 `50%`로 훨씬 넓다 [src:1]. 이 중 base 토큰과 겹치는 것은 6·8·12·16·20px뿐이고 나머지는 컴포넌트별 조합이거나 하드코딩이다. 카드가 상단만 `12px 12px 0 0`, 하단만 `0 0 12px 12px`으로 잘려 붙는 조합도 관찰된다 [src:1]. 별도로 공식 Button은 `shape` 속성으로 기본 8dp와 round 40dp 두 값을 갖는데, 이 40dp는 축의 단계가 아니라 컴포넌트 속성이라 `rounded:` 맵에 넣지 않았다 [src:2].

**신뢰 등급.** 6단계 축과 Button `shape` 값은 공식 문서 단독 출처이며 라이브 대조를 하지 않았다. 위 실측 radius 목록만 라이브에서 나온 값이다 [src:1][src:2].

## Elevation & Depth

공식 elevation은 8단계이고, 이름과 용도 매핑까지 문서에 있다 [src:2].

| 단계 | 용도 |
| --- | --- |
| 01dp | App bar · 스크롤 시 Bottom Navigation · App Icon |
| 02dp | 캐러셀 내 작은 콘텐츠나 카드 |
| 03dp | 캐러셀 내 2단 카드 |
| 04dp | (이름만 확보, 용도 서술 미확보) |
| 06dp | Snackbar · menu 등 피드백 요소 |
| 08dp | 1단 카드 · sheet · 기본 modal |
| 12dp | (이름만 확보, 용도 서술 미확보) |
| 24dp | (이름만 확보, 용도 서술 미확보) |

**그림자 실수치는 공식 문서에서 얻지 못했다** — 값이 "Loading..."으로 지연 로드돼 텍스트로 잡히지 않는다 [src:2]. 그래서 아래 6종은 라이브에서 실측한 고유 `box-shadow`이고, 위 8단계와의 매핑은 미확인이다. 나열 순서도 브랜드가 정한 순서가 아니다 — `shadow-1`~`shadow-5`를 blur 오름차순(8→22px)으로 두고, 오프셋이 없는 `shadow-ambient`(15px)만 성격이 달라 맨 뒤로 뺐다 [src:1].

```yaml
shadow-1: 0 1px 8px oklch(0 0 0 / 8%)   # 라이브 실측 · 공식 dp 단계와의 매핑 미확인
shadow-2: 0 2px 12px oklch(0 0 0 / 12%)   # 라이브 실측
shadow-3: 0 3px 16px oklch(0 0 0 / 8%)   # 라이브 실측
shadow-4: 0 3px 20px oklch(0 0 0 / 8%)   # 라이브 실측
shadow-5: 0 4px 22px oklch(0 0 0 / 16%)   # 라이브 실측
shadow-ambient: 0 0 15px oklch(0 0 0 / 30%)   # 라이브 실측 · 오프셋 없는 전방위 글로우
```

깊이 언어는 얕다. 여섯 값 중 다섯이 y 오프셋 1~4px에 불투명도 8~16%로, 상품 그리드가 흰 캔버스 위에 거의 평평하게 놓이고 카드는 그림자보다 보더(`{colors.border-secondary}`)와 배경 틴트(`{colors.bg-secondary}`)로 구분된다 [src:1]. 짙은 값은 `shadow-ambient` 하나인데, 오프셋이 없고 불투명도가 30%라 부양이 아니라 전방위 확산에 가깝다. **용도는 적지 않는다** — 위에서 밝혔듯 이 6종과 공식 8단계의 매핑이 미확인이라, 어느 표면에 쓰이는지는 이 문서가 말할 수 없다.

## Motion

이름 붙은 easing 곡선이 5종 정의돼 있다 [src:2].

```yaml
standard: cubic-bezier(0.68, 0, 0.28, 1)   # 300~600ms · 이동·전진후진 전환 등 범용 기본값
decelerate: cubic-bezier(0.23, 1, 0.5, 1)   # 300~500ms · 모달·시트·메뉴 진입(화면 밖 → 안)
accelerate: cubic-bezier(0.32, 0, 0.67, 0)   # 200~400ms · 모달·시트 닫기(화면 안 → 밖)
emphasized: cubic-bezier(0.21, 1.28, 0.23, 1.09)   # 300~500ms · 찜하기·장바구니 담기 강조 피드백(오버슈트)
linear: cubic-bezier(0, 0, 1, 1)   # 100~200ms · 토글·체크박스·버튼 색상·투명도 변경
```

Duration 원칙은 1초 미만, 보통 200~500ms이고 요소가 크거나 이동거리가 길수록 늘린다. 방향에 따라 비대칭인 것이 이 체계의 특징이다 — **Exit(닫기)는 300ms 이하로 짧게, Enter(진입)는 300ms 이상으로 Exit보다 길게** 두어 새로 등장한 요소에 주의를 붙잡아 둔다. `emphasized`는 오버슈트가 있어 "특정 목적이 있는 몇몇 요소에서만 제한적으로 사용"하라는 단서가 붙어 있다 [src:2]. 라이브 버튼의 전이는 이와 별개로 `all .2s ease-in-out`으로 측정된다 [src:1].

**신뢰 등급.** 위 5종 곡선과 duration 규정은 공식 문서 단독 출처이며 라이브 대조를 하지 않았다.

## Shapes

브랜드의 형태 모티프는 괄호다. 공식 문서가 "GS SHOP의 로고의 괄호(Brackets)는 브랜드의 기본 그래픽 요소이며 핵심가치인 'Real(진정성)'이 괄호 안에 담겨있음을 형상화한 것"이라고 밝히고, 이 brackets를 앱 아이콘으로 활용한다고 명시한다 [src:2]. GS리테일 공식 CI/BI 킷에서도 워드마크가 "GS SH()P" 형태로 O 자리를 괄호가 대신하는 처리를 확인할 수 있다 [src:16]. 리뉴얼에서는 이 O 자리 브래킷을 기존보다 두텁게 처리해 작은 화면에서 형태가 뭉개지지 않도록 단순화했다 [src:7][src:6]. 실제 심볼 마크는 파란 배경 위에서 흰 두 곡선이 가운데서 세로로 갈라지는 형태이고, favicon과 앱 아이콘이 같은 마크를 쓴다 [src:4][src:2].

아이콘 제작 규정은 수치까지 내려가 있다 [src:2].

- 그리드 **48×48px**, 패딩 **4px**, 라이브 영역은 **20dp×20dp**로 제한하되 필요하면 패딩까지 확장을 허용
- 기본 **stroke 3px** — 내부 stroke도 같은 3px
- 모서리 라운드 **6px 일관**, 변형은 6px의 배수·반올림 기준으로 **3·4·6·12px**만 권장
- 각도는 **45° 기본**, 추가로 필요하면 15° 증분, 미세조정은 5° 증분
- 타입 2종 — Stroke(탐색·기본 액션 기본값) / Fill(상태 표시·강조·작은 크기)
- Keyline shapes 4종(원·정사각형·세로/가로 직사각형), 비대칭 아이콘은 시각 보정으로 정렬을 조정

설계 원칙으로는 Clarity·Personality·Simplicity·Composition·Perspective·Consistency 6개가 각각 서술돼 있다 [src:2]. 아이콘은 SVG 다운로드와 아이콘 폰트 두 형태로 제공되며, 라이브에는 `[class^="gis-"]`가 참조하는 792자 규모의 자체 아이콘 폰트가 실제로 실려 있다 — 커머스(장바구니·쿠폰·배송·상품권), 결제/소셜, UI 크롬(화살표·셰브런), 회원 카테고리를 전부 덮는다 [src:1].

전체 인상은 각지지 않은 직사각형이다. 카드와 배너는 12~16px 라운드, 버튼은 8px, 방송 플래그와 필터는 완전 pill로 처리되어 곡률이 세 단계로 층화된다 [src:1][src:2]. 원형이 쓰이는 자리는 로그인 화면의 소셜 로그인 배지와 캐러셀의 원형 "+" 버튼처럼 개수가 적고 역할이 뚜렷한 지점에 한정된다 [src:1][src:4].

## Interaction States

상태를 8종으로 정의한다 — Default / Hover / Focus / Pressed / Selected / Active / Dragged / Disabled [src:2]. 상태 표현의 축은 색 교체가 아니라 **State Layer의 불투명도**이고, 수치가 규정돼 있다 [src:2].

| 상태 | State Layer |
| --- | --- |
| Hover | Gray 400의 10% |
| Focus · Pressed | Gray 400의 20% |
| Dragged | Gray 400의 30% |
| Disabled | Gray 50 |

여기서 Gray 400은 `{colors.content-quaternary}`이고, 대응 토큰인 `sys.state.primary`/`secondary`/`tertiary`는 전부 이 한 색에 알파만 달리 얹은 값이다 [src:2]. "상태별 하나의 상태값만을 가지는 것을 원칙"으로 한다는 서술이 함께 있다 [src:2].

**신뢰 등급.** 이 절의 값은 라이브 실측이 아니다 — 캡처한 프로덕션 CSS 전체에서 `--state-*` 커스텀 프로퍼티는 0건이라, State Layer 계열은 공식 문서 단독 출처이고 대조 대상이 되지 못했다 [src:1][src:2]. 라이브에서 확인된 상태 표현은 활성 탭이 `{colors.content-primary}` + `font-weight 600`으로 바뀌는 것과, 버튼 전이가 `all .2s ease-in-out`이라는 것 두 가지다 [src:1]. `{colors.overlay-primary}`·`{colors.overlay-secondary}`는 같은 기준색을 쓰지만 State가 아니라 Overlay 계열로 라이브에 실재하는 토큰이다 [src:1].

## Components

공식 컴포넌트 카탈로그는 34종이다 — Accordion · Avatar · Badge · Banner · Button · Card · Carousel · Checkbox · Chip · Counter · Datepicker · Dialog · Divider · FAB · Image · List · Menu · Navigation Bar · Page Control · Product Card · Product List · Progress · Radio Button · Rating · Search Bar · Sheet-Bottom · Slider · Snackbar · Switch · Textfield · Top App Bar · Tab · Tooltip · ToggleButton. Patterns는 Loading·Modality 2종이다 [src:2]. 라이브 CSS의 클래스 체계는 `gui-` 접두로 일관돼 있어 Style Dictionary 파이프라인의 산출물과 이름 체계가 맞아떨어진다 [src:1][src:10].

이름 자체가 규정 대상이라는 점도 특징이다. iOS/Android 명칭 불일치가 "디자이너와 개발자 등 내부 인원 간 커뮤니케이션의 혼란"과 비용 문제로 이어진다는 이유로 자체 명칭을 정하는데, 대체로 Material(Android) 쪽을 정본으로 삼는다 — Tab(iOS의 Segmented Control), Navigation Bar(iOS의 Tab Bar), Top App Bar(iOS의 Navigation Bar), Divider(iOS의 Separator). 다만 Counter(iOS는 Stepper, Android 미정의)와 Modal Sheet처럼 자체 명칭을 만든 경우도 있다 [src:2].

공식 Button은 `variant`(contained|outlined|text, 기본 text) · `type`(primary|CTA|default, 기본 primary) · `size`(small|medium|large, 기본 medium) · `icon`(none|startIcon|endIcon) · `shape`(default=8dp|round=40dp) · `state`(enabled|pressed|disabled|loading)를 갖고, 아이콘 기본 크기는 20dp다. 위계는 CTA > Primary > Default 순이며 "화면에서 작업에 대한 눈에 띄는 한 개의 버튼"만 두라고 규정한다. 배치 위치는 Modal·Form·Card·Toolbar·Dialog다 [src:2]. 아래 `###` 항목들은 라이브에서 실제로 측정된 세 가지 색 변형을 축으로 나눈 것이다.

### button-primary

`.gui-btn.accent`. 배경 `{colors.primary-default}`, 텍스트는 흰색, radius `{rounded.radius-m}` 고정. 로그인 등 **계정·인증 액션**에 쓰인다 [src:1]. 크기는 `.small`(67×32px, padding `4px 12px`), 기본(높이 40px, 글자 14px), `.big`(높이 48px, 글자 16~17px), `.block`(width 100%) 4종이고, 전이는 `all .2s ease-in-out`이다 [src:1].

```tsx
<Button variant="contained" type="primary" size="large" block>
  로그인
</Button>
// background: {colors.primary-default} · radius: {rounded.radius-m} · height 48px
```

### button-cta

`.gui-btn.red`. 배경 `{colors.secondary-default}`, 텍스트는 흰색. **구매·결제 등 커머스 전환**에만 쓰이며, 라이브 시청 화면의 "구매하기"도 `.gui-btn.small.red`다 [src:1][src:3]. 공식 위계에서 CTA가 Primary보다 위에 있는 것과 라이브의 색 분업이 같은 방향을 가리킨다 — 화면에 파랑 버튼과 분홍 버튼이 함께 있으면 분홍이 최종 전환이다 [src:2][src:1].

```tsx
<Button variant="contained" type="CTA" size="medium">
  구매하기
</Button>
// background: {colors.secondary-default} · label: {typography.label-large}
// letter-spacing 은 라이브 CTA 실측값 -0.025em
```

### button-outline

`.gui-btn.outline`. 배경 transparent에 `1px solid {colors.border-primary}`. 2차 액션 자리이고, `.red.outline` 조합은 텍스트·보더가 `{colors.content-accent}` 틴트로 바뀐다 [src:1]. 로그인 화면의 "회원가입"이 이 형태다 [src:1].

### textfield

`.gui-input`. `.gui-input.lg > input`은 높이 48px에 padding `10px 2.2em 10px 16px`이고, 배경은 `{colors.bg-tertiary}` 계열의 연회색이며 안내는 placeholder로 준다 [src:1]. 공식 스펙은 `variant`(filled|outlined|standard, 기본 outlined) · `size`(medium|large, 기본 medium — large는 로그인/회원가입 등 강조 화면 한정) · `state` **9종**(enabled|focus|active|filled|complete|error|positive|negative|disabled)이다. 아이콘은 InputAdornment로 별도 컴포넌트화돼 `position`(start|end)을 갖고, 필수 필드는 Label 옆 asterisk로 표시하며, 여러 줄이 필요하면 Textarea를 쓰라고 규정한다 [src:2].

```tsx
<TextField
  variant="outlined"
  size="large"
  state="error"
  label="비밀번호"
  required
  endAdornment={<Icon name="eye" size={20} />}
/>
// height 48px · padding 10px 2.2em 10px 16px · background {colors.bg-tertiary}
```

### tab-line

`.gui-tab__line`. 활성 항목(`a.on`)은 `{colors.content-primary}` + `font-weight 600`으로 바뀌고 밑줄 인디케이터가 붙는다. 상품 상세의 "상세설명 | 필수정보 | 리뷰 | 상품문의"에서 측정했다 [src:1]. 공식 Tab 스펙은 `variant`(default|sub|avatar|avatarSmall) · `scrollable`(false|true)이고, `scrollable=false`면 각 Tab Item의 폭이 동일해진다. 홈 탭 전용 AddOn이 별도로 있다 [src:2].

### product-card

상품 그리드의 기본 단위다. 공식 스펙은 title `{typography.body-large}`, price `{typography.title-small}`, rating `{typography.label-small}`이고 안내 배지는 높이 36dp에 배경이 `sys/background/inverseTertiary`다 — 이 inverse 계열은 라이브 `:root`에 없어 토큰 맵에 싣지 못했다 [src:2][src:1]. `variant`는 default|tvDefault|tvSquare|tvCTA|deal 5종으로, **tv·deal 변형이 홈쇼핑 도메인 특유의 갈래**다 [src:2].

라이브·스크린샷에서 관찰되는 구성은 원가 취소선 + 퍼센트 할인 배지 + 굵은 판매가, "내일도착" 배지, 별점과 리뷰수, 그리고 분홍 계열 "구매하기"다 [src:4]. 할인율 라벨(`.price-discount`)은 `{colors.content-accent}`를 쓴다 [src:1].

```tsx
<ProductCard variant="deal">
  <ProductCard.Thumb ratio="1:1" radius="{rounded.radius-l}" />
  <ProductCard.Title>{/* {typography.body-large} */}</ProductCard.Title>
  <ProductCard.Price discount="{colors.content-accent}" />
  <ProductCard.Rating />
</ProductCard>
```

### card

공식 Card는 title `{typography.title-small}`, subtitle `{typography.label-xlarge}`, radius `{rounded.radius-xl}`을 기본으로 하고, Full Card 변형은 title이 `{typography.title-large}`로 커진다 [src:2]. 라이브에서는 상단만 `12px 12px 0 0`으로 잘린 카드가 관찰되어, 이미지가 카드 상단에 밀착하는 구성에서 곡률을 반쪽만 적용한다 [src:1].

### banner

높이 90dp, radius `{rounded.radius-l}`, 아이콘 20dp. 텍스트 역할이 세 겹으로 나뉘어 title은 `{colors.content-primary}`, content는 `{colors.content-secondary}`, subtitle은 `{colors.content-tertiary}`를 쓴다 [src:2].

### accordion

행 높이 56dp, 좌우 padding 16dp. `type`(compact|standard) · `state`(collapsed|expended) · `visual` · `body` 속성을 갖는다 [src:2].

### avatar

xsmall 18 / small 24 / medium 32 / **large 40(기본)** / xlarge 48 / xxlarge 56dp의 6단계이고 `shape`는 default|round다. 사용처로 Product Carousel·Banner·Tabs·List·Chips가 명시돼 있다 [src:2].

### badge-notification

높이 **18dp**, 배경 `{colors.secondary-default}`. 개수·점 표시용의 가장 작은 배지다 [src:2].

### badge-informational

높이 **24dp**, 배경 `{colors.bg-tertiary}`, 아이콘 16dp, 라벨 `{typography.label-small}`. `color` enum이 11종인데 그 안에 이전 세대 브랜드색 이름인 leafgreen·sunsetpink가 남아 있어, 이 페이지 역시 리브랜딩 이전 판본임이 드러난다 [src:2].

### badge-ranking

높이 **28dp**, 배경 `sys/background/inverseSecondary`. 순위 표시 전용이며 배경 토큰은 라이브 `:root`에 없다 [src:2][src:1].

### tier-badge

멤버십 등급을 **색과 형태로 함께** 구분하는 5단계 배지다. welcome은 잎(`{colors.tier-welcome}`), gold는 별(`{colors.tier-gold}`), vip는 청록 왕관(`{colors.tier-vip}`), vvip는 보라 왕관(`{colors.tier-vvip}`), diamond는 다이아몬드(`{colors.tier-diamond}`)이고, 전부 홈 CSS에 하드코딩된 인라인 SVG에서 실추출했다 [src:1].

### live-flag

라이브 방송 카드에 붙는 pill 플래그. `{colors.live-flag-from}` → `{colors.live-flag-to}`의 그라디언트 배경에 `{colors.live-flag-dot}` 인디케이터 점을 얹는다. 다시보기용 replay 플래그는 같은 형태에 청록 계열(`{colors.replay-flag-from}` → `{colors.replay-flag-to}`, 점은 `{colors.replay-flag-dot}`)로 갈린다 [src:1].

### livetalk-overlay

라이브 시청 화면(`/section/livetalk`)은 로그인 없이 열린다. 헤더에 흰 로고와 분홍 "라이브톡" 배지, 우상단 닫기가 놓이고, **방송 종료 타이머와 시청자수가 비디오 위에 직접 렌더링되는 오버레이**로 올라간다 [src:3]. 하단에는 "전체 라이브톡 보기" 드롭다운, `.gui-btn.small.red` 구매 버튼, 공유 아이콘이 한 줄에 놓이고, 채팅 피드에서 호스트 응답에는 역할 라벨이 붙으며, 로그인 전에는 입력창이 `disabled` pill 상태다 [src:1][src:3].

```tsx
<LiveOverlay>
  <LiveOverlay.Timer value="55:03" />        {/* 비디오 위 직접 렌더 */}
  <LiveOverlay.Viewers icon="eye" count={85} />
</LiveOverlay>
```

### size-chip

옵션 표기용 칩. `<span class="size-chip">`으로 13px / line-height 20px이고, **클릭 컨트롤이 아니라 보유 사이즈를 나열하는 정적 텍스트**다. 자켓·니트 두 카테고리에서 같은 구조가 확인된다 [src:1]. 소비자가 이 형태를 가져갈 때 선택 가능한 칩으로 오해하지 않도록 상호작용을 붙이지 않는 편이 원본에 맞다.

### bottom-navigation-web

모바일 웹 하단에 고정되는 5탭이다 — 홈 / 패션Now / 마이쇼핑 / 찜 / 최근본상품 [src:1].

### top-tab-app

네이티브 앱 상단의 밑줄 인디케이터 탭이다 — 모바일 라이브 | TV | 홈 | 매직딜데이 | 특가 [src:4]. **바로 위 `bottom-navigation-web`과 다른 표면이다.** 웹의 하단 5탭과 앱의 상단 5탭은 구성도 위치도 다르므로 한 컴포넌트나 한 화면으로 합치지 말 것. 라이브 채널명은 리뉴얼에서 "샤피라이브"에서 "모바일 라이브"로 바뀌었고, TV홈쇼핑 'GS샵'과 데이터홈쇼핑 'GS마이샵' 명칭은 유지됐다 [src:6].

### schedule-pill

"편성표" 아웃라인 pill(캘린더 아이콘 포함)이 라이브 홈 우상단에 고정된다 [src:4]. TV 편성 기반 판매라는 도메인이 UI 표면에 그대로 남아 있는 지점이다.

### login-form

아이디/비밀번호 입력, "아이디저장" 체크박스, `.gui-btn.big.accent`의 전체폭 로그인 버튼, 원형 소셜 로그인 배지 4종, 아웃라인 회원가입 버튼, "비회원 배송조회" 링크로 구성된다. 이메일 도메인 자동완성이 7종 제공된다 [src:1].

## Do's and Don'ts

**Do** — 계정·인증 동선은 `{colors.primary-default}`, 구매·결제 동선은 `{colors.secondary-default}`로 갈라 쓴다. 이 분업은 라이브 실측으로 확인된 규칙이고, 두 색이 한 화면에 있으면 분홍이 최종 전환이다 [src:1][src:2].

**Do** — 화면당 눈에 띄는 주요 버튼은 하나만 둔다. 위계는 CTA > Primary > Default 순이다 [src:2].

**Do** — 본문 블록에는 `{typography.body-large}`·`{typography.body-medium}`·`{typography.body-small}`만 line-height 1.5로 쓰고, 제목·라벨 계열은 1.25를 유지한다. 이 두 값의 대비가 이 스케일의 리듬을 만든다 [src:2].

**Do** — 여백은 `{spacing.space-4}`를 기본값으로 잡고 4px 배수 축 안에서 고른다 [src:2].

**Do** — 진입 모션은 300ms 이상, 닫기 모션은 300ms 이하로 두어 방향을 비대칭으로 만든다. 오버슈트가 있는 `emphasized`는 찜하기·장바구니 담기처럼 목적이 분명한 지점에만 쓴다 [src:2].

**Do** — 문안은 원인이 아니라 결과를 말하고("전국적 통신장애로…" 대신 "시스템 오류로 배송이 지연되고 있습니다"), 사용자가 할 수 있는 것을 말하며("인증 오류가 발생했습니다" 대신 "입력한 비밀번호가 잘못되었습니다"), '정말·참·매우·성공적으로' 같은 부사어와 중복 표현을 뺀다 [src:2].

**Do** — 날짜는 년·월 뒤와 '일'을 나타내는 마침표 뒤를 띄어 쓰고 연월일 축약은 마침표로 통일하며, 시간은 12시간 표기법을 기본으로 한다 [src:2].

**Don't** — 리브랜딩 이전 브랜드색을 현재 값으로 쓰지 말 것. 공식 디자인 시스템 문서가 2025-06 판본이라 Primary·Secondary 자리에 아직 이전 세대 값이 남아 있고, Informational 배지의 `color` enum에도 이전 색 이름이 남아 있다 [src:2][src:6].

**Don't** — 웹 하단 5탭과 앱 상단 탭을 한 컴포넌트나 한 화면으로 합치지 말 것. 서로 다른 표면이고 항목 구성도 다르다 [src:1][src:4].

**Don't** — State Layer 불투명도를 라이브에서 검증된 값처럼 소개하지 말 것. 프로덕션 CSS에 `--state-*`는 0건이고, 이 계열은 공식 문서 단독 출처다 [src:1][src:2].

**Don't** — `size-chip`처럼 정적 텍스트로 설계된 요소에 선택 상호작용을 붙이지 말 것. 원본은 클릭 컨트롤이 아니라 보유 사이즈 나열이다 [src:1].

**Don't (도메인 경계)** — TV 편성표·"ON AIR" 카운트다운·방송 종료 타이머·라이브톡 채팅·멤버십 5등급 배지·자사 페이 우대 혜택 라인은 한국 홈쇼핑 산업의 편성·규제 구조에서 나온 도메인 개념이다. 이 문서에서 가져갈 것은 파랑/분홍의 역할 분리, 얕은 그림자와 12~16px 카드 리듬, Body만 1.5인 타입 스케일 같은 **시각 처리**이지, 방송 편성 플로우나 등급 체계 자체가 아니다. 커머스가 아닌 제품에 편성표·ON AIR 같은 개념을 옮겨 붙이면 근거 없는 긴급성만 남는다.

**Don't (벤더 중립)** — GS SHOP의 식별자를 생성물 표면에 노출하지 말 것. `gui-*` 클래스 접두, `gis-*` 아이콘 클래스, `gsicons` 폰트 이름, "GS SHOP"·"GS SH()P" 워드마크와 괄호 심볼은 이 브랜드의 자산이다. 차용할 것은 시각 언어이지 시스템의 이름이 아니다.

## Responsive Behavior

공식 breakpoint는 4단계다. 다만 공식 표의 "Breakpoint" 열은 large와 x-large가 둘 다 "1008px 이상"으로 겹쳐 보이는 추출 오류가 있어, **Size class range 열만** 인용한다 [src:2].

| Size class | 범위 | 확인된 변화 |
| --- | --- | --- |
| small | 320~599px | 모바일 웹의 기본 표면. 하단 고정 5탭이 뷰포트에 붙는다 [src:1] |
| medium | 600~1023px | (전환 지점만 공식 문서에 있고 레이아웃 변화는 미실측) |
| large | 1024~1439px | (레이아웃 변화 미실측. 콘텐츠 상한 1080px이 이 구간 안의 값이다) |
| x-large | 1440~1919px | 뷰포트 1440×900 실측 — 카테고리 아이콘 6열, 상품 그리드 2~3열로 실제 재배치 [src:1] |

콘텐츠 컨테이너(`.gs-contents`)는 `max-width: 1080px`로 캡핑되고, 이 값은 커스텀 프로퍼티 `--max-width`와 정확히 일치한다 [src:1]. **breakpoint(레이아웃 전환 시점)와 max-width(콘텐츠 상한)는 별개 개념**이라 1080px이 large 구간 안의 값인 것은 모순이 아니다.

터치 타깃은 컨트롤별로 나뉜다 — 기본 버튼 40px, `.big` 48px, `.gui-input.lg` 48px, `.small` 32px(67×32) [src:1]. **`.small`(32px)이 이 스케일에서 가장 작다** — 소비자가 이 크기를 그대로 옮길 때는 히트 영역을 패딩으로 넓히는 편이 안전하다. 공식 문서에서 최소 터치 타깃 수치는 확보하지 못했고, 이 문서는 외부 접근성 권고 수치를 대신 끌어오지 않는다.

컴포넌트별 축소 전략으로 확인된 것은 상품 그리드의 열 수 변화(데스크톱 폭 2~3열)와 카테고리 아이콘 행의 6열 배치이며 [src:1], 그 밖의 축소 규칙은 공개된 breakpoint 체계만으로는 확정할 수 없다. 이미지 종횡비는 공식 콘텐츠 규정에 크기로 못박혀 있다 — 대표 이미지 550×550(1:1), 모바일 매장 이미지 640×320(2:1) [src:2]. 앱 배포 요건은 iOS 13.0 이상 / 163.3MB이고 [src:4], Android 패키지는 `gsshop.mobile.v2`로 스크린샷 구성이 iOS와 동일하다 [src:5].

## Known Gaps

- **State Layer 라이브 미대조** — `--state-*`는 프로덕션 CSS에 0건이라 `## Interaction States`의 수치는 전부 공식 문서 단독 출처이고, 라이브와 대조된 적이 없다 [src:1][src:2].
- **Elevation 실수치 미확보** — 8단계 이름과 용도 매핑은 얻었으나 그림자 값이 문서에서 지연 로드라 텍스트로 잡히지 않는다. 본문의 라이브 실측 6종과 공식 8단계의 매핑은 미확인이고, 04dp·12dp·24dp는 용도 서술도 못 얻었다 [src:2][src:1].
- **Typography 세부 2건** — letter-spacing은 표의 양 끝값만 잡혔고 단위가 해소되지 않아 토큰에 싣지 못했다. Display 계열은 문서가 "semibold~bold"라고만 적어 단계별 weight가 미상이다 [src:2].
- **리브랜딩 반영본 문서 부재** — 공식 문서가 2025-06 판본이라 새 Primary/Secondary의 **공식 토큰명**은 여전히 미상이다(값만 라이브에서 확보). Wayback에도 이 사이트의 콘텐츠 스냅샷이 없어 아카이브에서 꺼낼 경로가 없다. Extended/Source 램프의 Cyan·Gold 두 값도 라이브 대조를 못 해 현행 여부가 미확인이다 [src:2][src:1].
- **로그인 게이트 화면·네이티브 앱·미수집 3페이지** — 장바구니 상세, 결제/주문, 마이페이지 탭 구성은 로그인 없이 접근할 수 없었다. 위 값들은 모바일 웹 실측이지 App Store 배포본을 뜯은 것이 아니다. 공식 문서 88페이지 중 자산 다운로드 목록·Contents Guide 개요·**Counter(수량 스테퍼)** 3페이지는 호스트 레이트리밋으로 수집하지 못했다 — 커머스 소비자에게 필요한 스테퍼 규격이 여기에 걸려 있다 [src:1][src:4][src:2].

## References

1. https://m.gsshop.com — 서비스 중인 모바일 웹. `:root` 컬러 커스텀 프로퍼티, 헤더 로고 인라인 SVG의 fill, `.gui-*` 클래스 CSS, 폰트 스택, radius·gap·box-shadow 스케일, 인라인 SVG 배지 자산의 실측 출처
2. https://design.gsshop.com — GS SHOP 공식 디자인 시스템(Zeroheight 기반, 로그인 불필요 공개). Foundation·Components 34종·Patterns·Contents Guide·UX Writing 수록. 2025-06 판본이라 Primary/Secondary는 리브랜딩 이전 값이고 브랜드색의 정본은 [src:1]이다. 정본 share URL은 zeroheight.com/0d176b887. SPA 지연 렌더링이라 렌더 뒤에 텍스트를 읽어야 내용이 잡힌다
3. https://m.gsshop.com/section/livetalk — 로그인 없이 열리는 라이브 방송 시청 화면. 비디오 위 오버레이는 텍스트 노드로 잡히지 않아 DOM 대조만으로 부재를 단정할 수 없다
4. https://apps.apple.com/kr/app/gs-shop/id365438600 — iOS App Store 리스팅. 마케팅 스크린샷과 앱 아이콘, 배포 요건·용량의 출처
5. https://play.google.com/store/apps/details?id=gsshop.mobile.v2&hl=ko — Android 리스팅. 스크린샷 구성은 App Store와 동일하다
6. https://www.sedaily.com/NewsView/2GWSVGO6KY — 2025년 BI 리뉴얼 보도. 주·보조색 명칭과 상징, 채널명 변경·유지 내역
7. https://www.joongangenews.com/news/articleView.html?idxno=445944 — 같은 리뉴얼 보도. Pretendard 적용과 로고 브래킷 처리 서술
8. https://www.newswire.co.kr/newsRead.php?no=1017572 — 리뉴얼 보도자료 원 소스 격. 다수 매체가 이를 재인용했다
9. https://www.sedaily.com/article/14110006 — 리브랜딩 기사. 색 이름만 있고 HEX·RGB 수치는 실려 있지 않다
10. https://gsretail.tistory.com/20 — GS SHOP 기술블로그(이인영). 디자인 토큰 파이프라인과 ref/sys/comp 3계층
11. https://gsretail.tistory.com/16 — GS리테일 DX블로그(박이슬). 같은 사내 발표를 다른 저자가 요약해 파이프라인을 독립적으로 재확인한다
12. https://hpsimg.gsretail.com/gsretail/ko/intro/ci-ri — GS리테일 CI/RI 안내. 로고 PANTONE 규정이며 색공간이 달라 화면 토큰과 직접 대응하지 않는다
13. https://ex-hubpage.grm.gsretail.com/_nuxt/entry.HxTB7rhz.css — GS ALL 멤버십 앱 웹뷰 스타일시트. `.GSSHOP` 스코프에서 브랜드 토큰이 교차 확인된다
14. https://news.nate.com/view/20240902n05010 — GS SHOP의 GS리테일 소속과 2024년 앱 개편을 다룬 2차 보도
15. https://zdnet.co.kr/view/?no=20240901100644 — 2024년 AI 라이프스타일 커머스 개편 보도. 개인화 비중과 카테고리 재배치 메커니즘
16. http://hpimg.gsretail.com/_ui/desktop/common/docs/GS+CIBI.zip — GS리테일 공식 CI/BI 킷(벡터 + JPG). GS SHOP 워드마크의 괄호 처리를 확인할 수 있는 원본 자산
17. https://channel.brand.gsretail.com/26e6733fb — GS리테일 브랜드 아카이브 CHANNEL 워크스페이스. 방송 프로그램 BI를 개별 브랜드 페이지로 관리한다
