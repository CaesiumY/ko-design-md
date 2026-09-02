---
name: 우리동네GS
slug: gs-retail
category: commerce
last_updated: "2026-09-02"
created_at: "2026-08-30"
sources:
  - https://apps.apple.com/KR/app/id426644449
  - https://hpsimg.gsretail.com/gsretail/ko/intro/ci-ri
  - https://www.digitaltoday.co.kr/news/articleView.html?idxno=462734
  - https://www.newswire.co.kr/newsRead.php?no=991485
  - https://sensortower.com/ko/blog/Our-Neighborhood-GS-continues-to-grow-ranking-1-in-downloads-and-usage
  - https://teamup.kr/information/gs25-홈페이지
  - https://gsretail.tistory.com/58
  - https://gsretail.tistory.com/67
  - http://gs25.gsretail.com/gscvs/ko/store-services/woodongs
  - https://www.eyesmag.com/posts/155567/gs25-app-my-refrigerator
  - https://weeklyuxuichallenge.oopy.io/8973ddee-7bf7-4a70-b889-59348e8d9bcf
  - https://play.google.com/store/apps/details?id=com.gsr.gs25&hl=ko
  - https://weeklyuxuichallenge.oopy.io/b4e6c734-dba4-4a35-af1e-60fa7ec45fdb
  - https://www.wanted.co.kr/wd/262586
  - http://www.gsretail.com/gsretail/ko/media/gsr-magazine-view?magazineId=8798517943753
  - http://hpimg.gsretail.com/_ui/desktop/common/docs/GS+CIBI.zip
  - https://unhngs.zeroheight.com/
  - https://ex-hubpage.grm.gsretail.com/_nuxt/entry.HxTB7rhz.css
  - https://service.brand.gsretail.com/144fcad43
  - https://brand.gsretail.com/065da11e3
  - https://platform.brand.gsretail.com/870687ee0/p/9238e4-gs
  - https://m.gsthefresh.com/assets/1785912250352/css/index-aV5UJRLx.css
  - https://m.woodongs.com/
  - http://web.archive.org/cdx/search/cdx?url=apps.apple.com/kr/app/id426644449&output=json
  - https://ex-hubpage.grm.gsretail.com/images/btn-logo-woodongs.png
  - https://woodongs.com/landing/asset/apple-touch-icon-180.6b5c8b16.png
lang: ko
logo: https://getdesign.kr/logos/gs-retail.png
colors:
  ## Core — 정확값 (1차 소스 + 독립 2차 출처 교차확인)
  primary-dark: oklch(0.263 0.023 259)   # #1E2530 — primary 버튼 배경이자 섹션 헤더 텍스트색. Dart 코드와 웹뷰 CSS 두 출처에서 확인
  signature-cyan: oklch(0.796 0.137 208)   # #00D4EA — GS25 시그니처 청록. 앱 아이콘 배경 실측과 같은 값
  white: oklch(1 0 0)   # #FFFFFF — 앱 기본 배경(흰 바탕 카드 레이아웃)이자 primary 버튼 전경색
  ## Neutral ramp — 앱 내부 웹뷰 .GS25 스코프 (용도 미공개, 이름은 명도순으로 부여)
  neutral-50: oklch(0.971 0.008 279)   # #F4F5FB — .GS25 스코프에서 4회로 최다 등장
  neutral-200: oklch(0.885 0.011 270)   # #D6D9E1
  neutral-300: oklch(0.820 0.013 267)   # #C0C4CD — 3회 등장
  neutral-400: oklch(0.788 0.023 254)   # #B0BBC9
  neutral-450: oklch(0.764 0.017 286)   # #B1B1BD
  neutral-600: oklch(0.441 0.024 285)   # #515160
  navy-deep: oklch(0.234 0.082 257)   # #001C43
  webview-blue: oklch(0.538 0.142 247)   # #0072BB — 기업 CI 의 GS Blue 와 sRGB 채널 1단위 차. 동일값으로 단정하지 말 것
  ## Service brands — 앱 내부 서비스의 공식 발행값 (네이티브 UI 토큰 아님)
  gs-all: oklch(0.377 0.104 259)   # #1C4078 — GS ALL 멤버십 · PANTONE 2154C. 웹뷰 CSS 에서도 실제 관찰됨
  gs-pay: oklch(0.607 0.215 257)   # #007CFF — GS Pay · PANTONE 285C. WINE25+ 팔레트의 파랑과 같은 발행값
  pop-yellow: oklch(0.945 0.202 106)   # #FFF400 — POP. 삼성증권 서비스표 통상사용권 계약 대상이라 참고값으로만 둘 것
  pop-black: oklch(0.244 0.006 1)   # #231F20 — POP. 위와 같은 계약 제약을 받는다
  wine25-red: oklch(0.610 0.206 29)   # #E43D30 — WINE25+ · PANTONE 179C
  wine25-green: oklch(0.629 0.159 143)   # #45A041 — WINE25+ · PANTONE 7738C
  wine25-yellow: oklch(0.871 0.178 93)   # #FDD000 — WINE25+ · PANTONE 7548C
  wine25-pink: oklch(0.838 0.089 27)   # #FFB4AB — WINE25+ · PANTONE 169C
  ## Corporate CI — 상표 규정 (인쇄/기업 아이덴티티 체계, UI 토큰 아님)
  gs-blue: oklch(0.538 0.143 248)   # #0072BC — PANTONE 300C
  gs-green: oklch(0.675 0.151 159)   # #18B273 — PANTONE 7482C
  gs-orange: oklch(0.708 0.177 50)   # #F57921 — PANTONE 166C
  gs-gray: oklch(0.606 0.005 258)   # #808285 — PANTONE Cool Gray 10C
typography:
  section-header:   # 홈 '많이 찾는 서비스' 섹션 헤더. 네이티브 Dart 코드에서 확인된 유일한 정확 타이포
    fontSize: 18px
    fontWeight: 700
spacing:
  screen-horizontal: 16px   # 홈 화면 좌우 공통 여백. EdgeInsets.symmetric(horizontal: 16)
  icon-hit-area: 40px   # 헤더 아이콘 버튼의 40×40 정사각 hit-area 컨테이너
fonts:
  font-sans: "\"Pretendard Variable\", Pretendard, -apple-system, \"Apple SD Gothic Neo\", system-ui, sans-serif"   # 네이티브 확정값 아님 — 웹뷰 @font-face 와 GS ALL BI 규정에서 취한 작업 기준선
---

# 우리동네GS — design.md

> 이 항목은 **Flutter 네이티브 앱**이 대상이라 라이브 CSS 를 읽어 토큰을 걷는 기법이 통하지 않는다. 그래서 값의 근거 강도가 고르지 않고, 이 문서는 그 편차를 지우는 대신 **네 등급으로 갈라 표기**한다 — (A) 정확값, (B) 근사 관찰, (C) 앱 내부 서비스 브랜드의 발행값, (D) 상표 규정. 등급을 무시하고 한 팔레트로 뭉뚱그리는 순간 이 문서는 근거보다 많은 것을 주장하게 된다.

## Brand & Style

우리동네GS는 GS25·GS더프레시·와인25플러스를 한 앱에 모은 GS리테일의 O4O 앱이고, 흰 바탕 카드 위에 청록 브랜드면과 근접 검정 CTA 를 짝지어 쓰는 것이 시각 시그니처다 [src:1][src:3][src:18]. 2022년 10월 11일 출시하면서 흩어져 있던 GS25 '나만의 냉장고', GS더프레시 공식 앱, 멤버십 앱 '더팝', 배달 앱 '우딜 주문하기' 넷을 하나로 합쳤다 [src:3]. App Store 부제가 그 범위를 그대로 적는다 — "나와 가까운 GS25, GS더프레시의 상품, 배달, 결제, 택배 등 종합 서비스" [src:1].

앱은 Flutter 로 개발되며 담당 조직은 GS리테일 DX본부 O4O개발팀이다 — 공식 기술블로그에 소속 매니저가 쓴 1차 글로 확인되고 [src:7], 같은 블로그의 다른 글과 채용공고가 "기존 앱들을 Flutter 로 통합 재개발했다"는 사실을 교차 확인해 준다 [src:8][src:14]. 이 선택이 이 문서의 형태를 결정한다. 웹 표면이 없으므로 시각 사양은 네이티브 코드 조각·스토어 캡처·앱 안에서 열리는 웹뷰 세 경로에서만 새어 나온다.

타깃은 특정 세그먼트가 아니라 편의점을 일상적으로 쓰는 대중 전체다. 누적 다운로드는 약 1,500만 건으로 보도됐고 [src:5], 론칭 2년 만에 MAU 가 244만 명 늘어 역대 최고치를 기록했다는 보도도 있다 [src:4]. Android 패키지는 `com.gsr.gs25` 이고 Play 리스팅 기준 다운로드 1,000만 이상이다 [src:12]. GS ALL 멤버십으로 GS25·GS SHOP·GS THE FRESH 세 브랜드의 등급 혜택을 묶는 계열 통합 구조도 이 앱이 짊어진다 [src:6].

정서적 톤은 '친근한 생활밀착'이다. 앱 워드마크가 둥글둥글한 손글씨풍 라운드 서체이고, 서브 브랜드마다 고유 마스코트 일러스트(GS25 는 호랑이 캐릭터, GS더프레시는 배달원 캐릭터)를 카드에 얹어 정보 밀도가 높은 커머스 화면의 긴장을 낮춘다 [src:1]. 반대편에는 커머스 앱다운 건조함이 있다 — 스토어 캡처에서 커머스 CTA 는 다크 네이비/블랙 계열로 관찰되고, 청록은 CTA 가 아니라 브랜드 표면(아이콘 배경·마스코트·원형 아이콘)에 머문다 [src:1][src:18].

브랜드 자산의 층위도 특이하다. 우리동네GS 는 **자체 등록 CI 를 갖지 않는다.** GS25 공식 사이트의 소개 페이지에는 전용 워드마크 이미지가 없고 페이지 로고는 사이트 공통 헤더 로고뿐이며 [src:9], GS리테일 공식 CI/BI 다운로드 킷에도 우리동네GS 전용 마크가 없다(GS그룹·GS Retail·GS25·GS SHOP·GS THE FRESH 만 들어 있다) [src:16]. 즉 이 브랜드의 시각 정체성은 **앱 아이콘과 앱 안 워드마크 레벨에만 존재한다.** 정본 아이콘은 평면 청록 배경 위 흰 손글씨풍 워드마크이고, 공식 앱 랜딩 도메인의 `apple-touch-icon` 배경 실측이 `{colors.signature-cyan}` 과 정확히 같다 [src:26]. 평면 형태가 더 오래·더 넓게 쓰인다. Wayback 이 보존한 App Store 캡처는 2023-08-09 과 2024-12-20 두 시점뿐인데 둘 다 평면이고 [src:24], Play 리스팅과 앱 랜딩 도메인은 지금도 평면이다 [src:12][src:26]. App Store 가 그라디언트로 갈린 것은 **Wayback 이 아니라 2026-08 라이브 관측에서 확인한 것**이다 — 그 사이 구간의 아카이브 캡처가 없어 전환 시점은 특정하지 못한다 [src:1]. 2026-08-22 에 관측된 수박 일러스트 아이콘은 **시즌 변형**이며 8일 뒤 App Store 아이콘에서 사라졌다 [src:1][src:24]. 가로형 워드마크 자산은 앱 안에서 열리는 웹뷰가 참조하는 277×84 흰색·투명 PNG 다 [src:25].

## Colors

> **교차 대조(2026-08-30).** 정확값 색 2종은 서로 독립된 두 표면에서 확인됐다 — `{colors.primary-dark}` 는 공식 기술블로그의 Dart 코드와 앱 내부 웹뷰 CSS 의 `[class*=button-primary]` 규칙 양쪽에 나오고 [src:7][src:18], `{colors.signature-cyan}` 은 그 웹뷰 CSS 값과 공식 앱 랜딩 도메인 `apple-touch-icon` 배경 실측이 일치한다 [src:18][src:26]. 나머지는 등급이 다르다 — `.GS25` 스코프의 무채색 램프는 용도가 공개되지 않았고, 서비스 브랜드·기업 CI 값은 발행값이되 네이티브 UI 토큰이 아니다 [src:19][src:20]. 이번 대조로 용도 서술도 정정됐다. `{colors.primary-dark}` 를 "섹션 헤더 텍스트색"으로만 적던 종전 서술과 달리, 웹뷰 CSS 는 이 색을 **primary 버튼 배경**으로 쓴다 [src:18].

공개된 디자인 토큰 표는 존재하지 않는다. 그래서 이 절의 값은 하나의 팔레트가 아니라 **근거 강도가 다른 네 묶음**이며, frontmatter 의 그룹 라벨이 그 경계를 그대로 따른다.

| 등급 | 근거 | 해당 토큰 | 차용 시 취급 |
| --- | --- | --- | --- |
| (A) 정확값 | 네이티브 Dart 코드 + 앱 내부 웹뷰 CSS 교차확인 [src:7][src:18] | `{colors.primary-dark}` · `{colors.signature-cyan}` · `{colors.white}` | 그대로 써도 되는 유일한 층 |
| (B) 근사 관찰 | 스토어 마케팅 캡처의 픽셀 인상 [src:1] | 없음 — 토큰으로 승격하지 않았다 | 산문 서술로만 참고 |
| (C) 서비스 브랜드 발행값 | GS리테일 서비스 브랜드 아카이브 [src:19] | `{colors.gs-all}` · `{colors.gs-pay}` · `{colors.pop-yellow}` · `{colors.pop-black}` · `wine25-*` 4종 | 앱 내부 기능의 색이지 앱 자체의 색이 아니다 |
| (D) 상표 규정 | GS리테일 기업 브랜드 아카이브 [src:20] | `{colors.gs-blue}` · `{colors.gs-green}` · `{colors.gs-orange}` · `{colors.gs-gray}` | UI 토큰이 아니다. 인쇄/기업 아이덴티티 체계 |

**(A) 정확값.** `{colors.primary-dark}` 는 두 경로에서 같은 값이 나왔다. 공식 기술블로그 원문의 Dart 코드가 섹션 헤더 텍스트를 이 색으로 그리고 [src:7], 앱 안 GS ALL 웹뷰 CSS 의 `.GS25` 스코프는 `[class*=button-primary]` 배경을 이 색으로, 전경을 `{colors.white}` 로 고정한다 [src:18]. 즉 이 색은 텍스트 전용이 아니라 **브랜드의 기본 어두운색**이고, 1차 액션 채움이 그 대표 용도다. `{colors.signature-cyan}` 은 같은 `.GS25` 스코프에서 얻은 정확값이며 [src:18], 앱 아이콘 배경 실측과 일치한다 [src:26].

**(B) 근사 관찰.** 스토어 마케팅 캡처는 화면마다 원색에 가까운 단색 배경을 서브 브랜드별로 갈라 쓴다 — GS25 는 청록, GS더프레시는 채도 높은 초록, 와인25플러스는 진분홍/마젠타 포인트와 베이지 배너, 나만의 냉장고는 주황 만료 카운트다운 배지다 [src:1]. **이 인상값들은 색 토큰으로 승격하지 않았다.** 픽셀 샘플에서 얻은 근사치를 OKLCH 로 확정할 근거가 없기 때문이며, 근사법 자체의 정밀도는 나쁘지 않다는 방증은 있다 — 캡처에서 뽑았던 청록 근사치가 나중에 확인된 정확값과 sRGB 채널 1단위 차였다 [src:1][src:18]. 그래도 차이는 차이다.

**(C) 서비스 브랜드 발행값.** 우리동네GS 는 GS ALL 멤버십·POP·WINE25+·GS Pay 를 내부 기능으로 품고, 이들의 색은 서비스 브랜드 아카이브에 CMYK·PANTONE 까지 붙은 공식 수치로 발행돼 있다 [src:19]. `{colors.gs-all}` 은 발행값과 웹뷰 CSS 관찰이 일치한다 [src:18][src:19]. WINE25+ 팔레트의 파랑은 `{colors.gs-pay}` 와 같은 발행값이라 별도 토큰으로 중복 선언하지 않았다 [src:19].

**(D) 상표 규정.** 기업 CI 4색은 "GS리테일의 색상군은 3색형 심볼마크의 색상을 응용합니다"라는 규정과 함께 발행된다 [src:20]. 이 값들은 제품 표면 토큰이 아니다. 다만 완전히 무관하지도 않아서, 웹뷰의 `{colors.webview-blue}` 가 `{colors.gs-blue}` 와 sRGB 채널 1단위만 다르다 — 기업 색이 제품 표면으로 내려온 정황으로 보이나 **동일값으로 단정하지 말 것** [src:18][src:20]. 구 CI/BI 페이지의 표는 RGB 열과 HEX 열이 서로 어긋나는 오류를 갖고 있어 [src:2], 기업 색은 hex 와 rgb 가 자체 일치하는 브랜드 아카이브 쪽을 정본으로 삼았다 [src:20]. 같은 구 페이지가 서브 브랜드 로고 색 규정(GS25 = PANTONE 285C·311C, GS THE FRESH = PANTONE 7484C)을 갖고 있고, 접근성용 숨김 텍스트에 2019년 개명 이전 표기가 잔존한다 [src:2].

`.GS25` 스코프의 무채색 램프 6종과 `{colors.navy-deep}` 은 값만 확인됐고 **용도가 공개되지 않았다** [src:18]. `neutral-` 이라는 이름과 번호는 명도순으로 이 문서가 부여한 것이지 발행된 토큰명이 아니다.

**범위 주의.** 이 CSS 는 우리동네GS 앱 **안에서 열리는 GS ALL 멤버십 웹뷰**의 것이고, `.GS25` 는 그 웹뷰가 GS25 브랜드 문맥에서 쓰는 스코프 테마다 [src:18]. Flutter 네이티브 화면이 같은 값을 쓴다는 직접 증거는 아니다. `{colors.primary-dark}` 가 네이티브 코드와 웹뷰 양쪽에 나온다는 점이 두 표면의 팔레트 공유를 시사할 뿐이다 [src:7][src:18].

## Typography

**네이티브 UI 서체 패밀리명은 확인되지 않았다.** 이 절에서 확정된 것은 값 하나뿐이다 — 홈 화면 '많이 찾는 서비스' 섹션 헤더가 `{typography.section-header}`, 즉 18px / FontWeight 700 이고 색은 `{colors.primary-dark}` 다 [src:7]. 이 값은 공식 기술블로그 원문의 Dart 코드에서 그대로 나온다.

패밀리 쪽은 정황 증거만 있다. 첫째, 앱 내부 기능인 GS ALL 멤버십의 BI 규정이 국·영문 모두 Pretendard Variable 로 지정돼 있다 [src:19]. 둘째, 앱 안에서 열리는 그 웹뷰가 Pretendard 를 자체 호스팅하며 `@font-face` 로 Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700 다섯 굵기를 모두 로드한다 [src:18]. **그러나 이 둘은 웹뷰와 BI 규정이지 Flutter 네이티브 화면의 근거가 아니다.** "정황상 Pretendard 계열일 가능성이 높으나 네이티브 UI 서체는 미확인"이 정확한 선이고, 이 문서는 그 선을 넘지 않는다. frontmatter 의 `font-sans` 스택은 확정이 아니라 소비자가 출발점으로 쓸 작업 기준선이며, 그 사실을 토큰 주석에 적어 두었다.

오귀속을 부르는 후보가 둘 있으니 미리 잘라 둔다. GS25 데스크톱 웹사이트 CSS 의 `NanumBarunGothic` 은 **데스크톱 사이트 전용**이며 앱 서체 근거가 아니다 [src:9]. 같은 사이트의 다른 번들에 Pretendard 가 100~900 전 굵기로 `@font-face` 선언돼 있지만 실제 렌더링된 `body` 의 font-family 는 여전히 `NanumBarunGothic` 이었다 — **선언만 있고 미적용**이므로 어느 쪽도 앱 서체 근거가 못 된다 [src:9]. 웹뷰 CSS 에 `Roboto, sans-serif` 가 43건 등장하는 것도 Vuetify 기본값이지 브랜드 지정이 아니다 [src:18]. 기업 CI 서체인 영문 Whitney·국문 윤고딕 100 은 인쇄/기업 아이덴티티 체계이고 앱 UI 체계가 아니다 [src:20].

굵기 운용은 토큰이 아니라 서술로만 남긴다. 네이티브에서 확인된 굵기는 700 하나이고, 웹뷰가 실제로 적재하는 단계는 300 · 400 · 500 · 600 · 700 다섯이다 [src:7][src:18]. 확증 경로는 두 개인데 둘 다 막혀 있다 — 비밀번호가 걸린 플랫폼 브랜드 아카이브 [src:21], 그리고 사용자가 배제한 APK 디컴파일이다. 공식 채용공고와 사보 인터뷰 전문에는 서체·font-family 언급이 아예 없다 [src:14][src:15].

## Spacing

확인된 정확 치수는 두 개이고, 둘 다 공식 기술블로그 원문의 Dart 코드에서 나온다 [src:7]. 홈 화면의 좌우 공통 여백은 `{spacing.screen-horizontal}` 16px 이며 `EdgeInsets.symmetric(horizontal: 16)` 한 줄로 표현된다. 헤더 아이콘 버튼의 hit-area 컨테이너는 `{spacing.icon-hit-area}` 40px 정사각이다.

두 값이 모두 4의 배수이지만 **여기서 4px 베이스 스케일을 역산하지 않는다.** 그 외 수치 규정은 공개된 것이 없고, 두 점만으로 스케일을 일반화할 근거가 없기 때문이다 [src:7]. 좌우 여백이 단일 값으로 고정된다는 사실 자체는 구조적으로 의미가 있다 — 접근성 구현에서 이 공통 여백을 하나의 `Padding` 위젯으로 묶고 그것을 `Semantics(explicitChildNodes: true)` 로 감싸기 때문에, 여백 컨테이너가 곧 접근성 트리의 경계 노릇을 한다 [src:7].

## Rounded

**radius 의 수치는 하나도 공개돼 있지 않다** [src:7]. 스토어 캡처에서 읽히는 것은 곡률의 성격뿐이다 — 카드 코너는 대략 16px 하한, 20px 상한 사이의 중간~큰 라운드로 보이고, 하단 탭바 중앙의 결제 버튼은 완전한 원형이다 [src:1].

그 폭을 하나의 값으로 좁힐 근거가 없어 **radius 토큰을 선언하지 않았다.** 범위를 단일 값으로 확정하면 없는 정밀도를 만들어 내고, 범위를 그대로 토큰에 넣으면 기계 소비자가 읽지 못한다. 차용할 때는 카드에 16~20px 대의 한 값을 제품 쪽에서 고르고, 원형 컨트롤만 완전 라운드로 두면 이 문서가 실제로 관찰한 것과 어긋나지 않는다.

## Elevation & Depth

**공개된 elevation 체계가 없다.** shadow 수치는 1차 소스·웹뷰 CSS·스토어 캡처 어느 쪽에서도 확보되지 않았고, 이 브랜드가 그림자 토큰을 발행한 흔적 자체가 없다 [src:7][src:18].

캡처에서 읽히는 깊이 언어는 그림자가 아니라 **면 분리**다 — 흰 배경 위에 카드를 얹고, 서브 브랜드 섹션은 카드 자체의 배경색으로 층을 가른다 [src:1]. 유일하게 명확히 떠 있는 요소는 하단 탭바 중앙의 원형 플로팅 결제 버튼이며, 이때도 부양의 근거는 형태와 위치이지 측정된 그림자 값이 아니다 [src:1]. 차용 시 그림자를 쓰겠다면 이 문서가 아니라 소비자 쪽 체계에서 값을 가져와야 한다.

## Shapes

전반적으로 **둥근 쪽**이다. 앱 워드마크부터 둥글둥글한 손글씨풍 라운드 서체이고, 카테고리 내비게이션은 원형 아이콘 + 라벨 그리드이며, 하단 탭바 중앙 결제 버튼은 완전 원형이다 [src:1]. 픽업/배달 같은 이항 선택은 필(pill) 형태의 버튼 쌍으로, 배송지 표시는 pill 형태의 행으로 나타난다 [src:1].

기하 언어는 **직사각 카드 + 원형 액션**의 두 축으로 정리된다. 정보는 모서리가 둥근 직사각 카드에 담고, 액션·아이콘·상태 표시는 원 또는 필로 처리해 두 층을 형태로 구분한다 [src:1]. 여기에 마스코트 일러스트라는 유기적 요소가 얹히는데 — GS25 의 호랑이 캐릭터, GS더프레시의 배달원 캐릭터, 빈 장바구니 화면의 청록 마스코트가 그것이다 [src:1][src:13]. 기하 형태가 구조를 잡고 일러스트가 정서를 담당하는 분업이며, 이 분업이 밀도 높은 커머스 화면을 딱딱해 보이지 않게 만드는 장치다.

아이콘 자산 쪽은 오래된 방식이다. GS25 데스크톱 사이트 CSS 4개 파일 전체에서 `data:image/svg+xml` 패턴이 0건이었다 — 구형 래스터 스프라이트 기반이라 인라인 SVG 아이콘 세트를 역추출할 수 없었다 [src:9].

## Components

아래 항목은 리서치가 실제로 관찰한 것만 담는다. 색·radius·상태별 스타일이 규칙 수준으로 확인된 컨트롤은 `{component.button-primary}` 하나뿐이고, 나머지는 **구성과 배치**의 관찰이다 [src:1][src:7][src:18].

### button-primary

앱 안 웹뷰의 `.GS25` 스코프에서 유일하게 규칙까지 확인된 컨트롤이다. 배경 `{colors.primary-dark}`, 전경 `{colors.white}` 로 고정된다 [src:18]. **이 값은 웹뷰 스코프의 값이고 네이티브 버튼의 확인값이 아니다.**

```tsx
<ButtonPrimary onPress={submit}>결제하기</ButtonPrimary>
// background: {colors.primary-dark} · color: {colors.white}
// 출처 범위: 앱 내부 GS ALL 웹뷰 .GS25 스코프 [src:18]
```

### button-primary-full-width

브랜드 선택 카드 아래에 전체폭으로 놓이는 '사전예약' 액션이다 [src:1]. 캡처상 커머스 CTA 는 다크 네이비/블랙 계열이라 `{component.button-primary}` 와 같은 층으로 읽히지만, 이 폭 변형에 대한 별도 발행 규칙은 없다 [src:1].

### bottom-tab-bar

5구성이다 — 홈 / 검색 / QR·상품권결제 / 주문내역 / MY [src:1]. 중앙 슬롯이 일반 라벨 탭이 아니라 결제 진입점이라는 점이 이 앱의 구조를 드러낸다. 오프라인 매장에서 꺼내 드는 화면이 앱의 중심이기 때문이다.

### tab-bar-fab

중앙 슬롯의 원형 결제 버튼이다. 블랙 채움에 완전 원형이며 탭바 위로 떠 있다 [src:1]. 같은 블로그 캡처에 QR 결제·혜택 화면이 함께 실려 있고 버튼 라벨도 결제를 가리키지만, **이 버튼이 그 화면으로 이동한다는 것을 직접 보여 주는 출처는 없다** — 라벨과 인접 캡처에서 읽은 추론이다 [src:1][src:13].

### home-header-actions

공식 확인 항목이다. 헤더 버튼 구성은 주소·챗봇·알림·장바구니 4개이고 [src:7], 캡처에서는 챗봇 상담(로봇 아이콘)·알림·장바구니(뱃지 카운트)가 확인된다 [src:1]. 각 버튼의 hit-area 컨테이너는 `{spacing.icon-hit-area}` 40px 정사각이며, 알림 버튼에는 `Semantics(label: '알림함 바로가기', button: true)` 로 접근성 라벨이 붙는다 [src:7].

```tsx
<HeaderAction
  label="알림함 바로가기"
  hitArea={40} // {spacing.icon-hit-area}
  badgeCount={unread}
/>
```

### banner-carousel

홈 상단 배너 캐러셀은 자동재생하되, 스크린리더가 켜져 있으면(`MediaQuery.of(context).accessibleNavigation`) **자동재생이 꺼지도록** 구현돼 있다 [src:7]. 이 소스에 시각 사양은 없다.

### brand-selector-card

"GS25(재미있는 편의점)"와 "GS더프레시(맛 신선 No.1 마트)"를 2열로 놓는 진입 카드다 [src:1]. 각 카드는 서브 브랜드의 배경색과 마스코트를 갖고, 카드 안에 픽업/배달 필 버튼 두 개를 품는다 [src:1].

### action-pill

브랜드 선택 카드 안의 픽업/배달 이항 선택이다 [src:1]. 필 형태 두 개가 나란히 놓이며, 선택 상태의 시각 처리는 확인되지 않았다.

### segmented-tab

밑줄 인디케이터 방식의 세그먼트 탭이다. GS더프레시의 "매장수령 | 택배수령 | 배달신청", 나만의 냉장고의 "사용 가능 | 사용 내역"이 같은 패턴을 쓴다 [src:1].

### category-icon-grid

원형 아이콘 + 라벨 그리드다. GS더프레시는 "농산물직송/수산물직송/축산물직송/캠핑용품/생활가전", 와인25플러스는 "와인/양주/맥주/전통주/기타주"로 채운다 [src:1].

### my-fridge-card

'나만의 냉장고' 카드는 보관 상품 썸네일과 주황 "N일 남음" 카운트다운 배지를 함께 노출한다 [src:1]. 진입 플로우는 2차 자료 두 건이 교차 확인해 준다 — 메인화면 결제·적립 버튼 → 바코드 페이지의 "나만의 냉장고에 보관하기" → 보관 후 인근 매장 조회로 타 지점 픽업이며, 1+1/2+1 프로모션 상품 보관이 핵심 용도다 [src:10][src:11].

```tsx
<MyFridgeCard
  thumbnail={item.image}
  expiry={<CountdownBadge>{`${days}일 남음`}</CountdownBadge>}
/>
// 카운트다운 배지는 주황 계열로 관찰됨 — 정확값 미확인이라 색 토큰 없음 [src:1]
```

### wine25-card

와인25플러스 진입 카드는 핑크 테두리 강조와 와인잔 아이콘으로 다른 카드와 구분된다 [src:1]. 이 서비스의 발행 팔레트는 `wine25-*` 4종이다 [src:19]. **둘을 같은 값으로 읽지 말 것** — 카드에서 관찰된 진분홍은 등급 (B) 의 캡처 인상이고, 발행값 `{colors.wine25-pink}` 은 실제로는 연한 살구빛이라 서로 다른 색이다.

### location-pill

"우리집(서울 강남구)로 배송 예정" 같은 배송지 표시 pill 과 그 아래 매장 정보 chevron 행이 짝을 이룬다 [src:1].

### promo-tag

주황 "무료배송" 배지가 상품 카드 좌상단에 부착된다 [src:1]. 마감할인·사전예약 같은 프로모션 문구도 같은 층에서 카드 위에 얹힌다 [src:1].

### quantity-stepper-sheet

상품상세에서 수량을 고르는 바텀시트다. 상품상세 화면은 실시간 재고 수량을 함께 표기한다 [src:13].

```tsx
<QuantityStepperSheet
  stock={item.realtimeStock} // 상품상세가 실시간 재고를 함께 노출한다 [src:13]
  min={1}
  onChange={setQty}
/>
```

### empty-cart-state

빈 장바구니는 청록 마스코트 일러스트로 채워진다 [src:13].

### home-widget

홈스크린 위젯은 "결제/적립, 픽업, 주류검색, 상품찾기" 네 개를 묶는다 [src:1].

## Do's and Don'ts

**Do** 1차 액션은 `{colors.primary-dark}` 채움 + `{colors.white}` 전경으로 두고, `{colors.signature-cyan}` 은 브랜드 표면(아이콘 배경·마스코트·원형 아이콘)에 남긴다 — 이 역할 분리가 실제로 관찰된 배치다 [src:1][src:18].

**Do** 화면 좌우 여백을 `{spacing.screen-horizontal}` 하나로 묶고, 그 컨테이너를 접근성 트리의 경계로도 함께 쓴다 [src:7].

**Do** 아이콘 버튼의 hit-area 를 `{spacing.icon-hit-area}` 정사각으로 확보하고, 아이콘만 있는 버튼에는 텍스트 접근성 라벨을 반드시 붙인다 [src:7].

**Do** 자동재생 캐러셀은 스크린리더가 활성일 때 정지시킨다. 이 앱이 실제로 그렇게 구현했으므로 반대 사례를 만들 이유가 없다 [src:7].

**Do** 흰색 가로형 워드마크를 쓸 때는 `{colors.signature-cyan}` 계열 면 위에 올린다. 앱 아이콘 자체가 그 배치이므로 재현이지 발명이 아니다 [src:25][src:26].

**Don't** 이 문서의 색을 네이티브 확정값으로 승격하지 말 것. `.GS25` 스코프 값은 **앱 안에서 열리는 웹뷰**의 테마이고, Flutter 네이티브 화면이 같은 값을 쓴다는 직접 증거는 없다 [src:18].

**Don't** 서체를 "우리동네GS 는 Pretendard 를 쓴다"로 단정하지 말 것. 근거는 웹뷰 `@font-face` 와 GS ALL BI 규정뿐이고 네이티브 UI 서체는 미확인이다 [src:18][src:19].

**Don't** GS25 데스크톱 사이트의 `NanumBarunGothic` 을 앱 서체 근거로 인용하지 말 것. 데스크톱 전용이며, 같은 사이트의 Pretendard 선언은 선언만 있고 렌더링에 적용되지 않았다 [src:9].

**Don't** 자매 브랜드 GS THE FRESH 의 웹 팔레트를 우리동네GS 값으로 옮겨 적지 말 것. 앱이 그 브랜드를 프론트할 뿐 같은 팔레트를 쓴다는 근거가 없다 [src:22].

**Don't** POP 색상을 리소스로 재배포하지 말 것. 삼성증권과의 서비스표 통상사용권 계약이 걸려 있어 활용 전 협의가 필요한 값이다 [src:19].

**Don't** 표기 규정을 흘리지 말 것 — `GS Pay` 는 `GS` 와 `P` 사이를 띄우고, 전체 대문자 `GS PAY` 와 소문자 `gs pay` 는 금지다. GS ALL 은 국문 표기 원칙이며 기본형은 `GS ALL 포인트`·`GS ALL 멤버십`·`GS ALL 패밀리` 다 [src:19]. 2024년 캡처에 남아 있는 "더팝 리워즈"는 현행 명칭이 아니다 [src:13][src:19].

**Don't** 수박 일러스트가 들어간 앱 아이콘을 브랜드 자산으로 쓰지 말 것. 2026-08-22 에 받은 아이콘에는 있었고 2026-08-30 재조회에서는 사라졌다 — 8일 간격의 라이브 관측 두 번이 근거이고, 아카이브가 그 구간을 보존하지 않아 교체 시점은 그 안이라는 것까지만 말할 수 있다 [src:1].

**Don't (도메인 경계)** '나만의 냉장고'(구매 상품을 매장에 맡겨 두고 다른 지점에서 찾는 기능)·'마감할인'·픽업과 배달을 카드 안에서 가르는 이원 진입 같은 **한국형 편의점 O4O 도메인 개념과 플로우, 그리고 그 카피를 그대로 가져오지 말 것** [src:1][src:10]. 차용할 것은 흰 바탕 카드 + 어두운 1차 액션 + 청록 브랜드 표면이라는 **시각 처리**이지, 이 브랜드가 편의점 생태계를 전제로 설계한 제품 개념이 아니다. 도메인을 함께 복사하면 소비자 제품에 존재하지 않는 오프라인 매장 흐름이 UI 에 남는다.

## Responsive Behavior

모바일 전용 앱이고 **공개된 브레이크포인트 체계가 없다.** 데스크톱/반응형 웹 버전 자체가 존재하지 않으므로, 아래 표는 폭 구간이 아니라 확인된 표면 단위로 적는다.

| 표면 | 확인 내용 | Key Changes |
| --- | --- | --- |
| iOS 핸드셋 (앱) | iOS 15.0 이상, 171.3MB [src:1] | 유일한 1급 표면. 2열 브랜드 카드 + 5구성 하단 탭바 [src:1] |
| Android 핸드셋 (앱) | 패키지 `com.gsr.gs25` [src:12] | 스토어 캡처가 iOS 판과 동일 [src:12] |
| 태블릿·데스크톱 | (공개된 브레이크포인트 체계 없음) | 근거 없음 — 소비자가 직접 정의할 구간 |
| 웹 (`m.woodongs.com`) | 앱 다운로드 랜딩과 약관 라우트뿐 [src:23] | 앱 UI 가 아니므로 토큰 소스로 쓸 수 없다 |

터치 타깃은 `{spacing.icon-hit-area}` 40px 정사각이 확인된 유일한 값이다 [src:7]. 이 값은 카탈로그가 기준선으로 삼는 44×44 보다 작으므로, 웹이나 다른 플랫폼으로 옮길 때는 44 이상으로 키우고 40px 은 원본 관찰값으로만 남길 것.

컴포넌트별 축소 전략은 관찰에서 역산할 수 있는 만큼만 적는다. `{component.brand-selector-card}` 의 2열은 좁은 폭에서 1열로 접는 것이 자연스럽고, `{component.category-icon-grid}` 는 원형 아이콘 + 라벨 단위가 등폭이라 열 수만 줄이면 된다 [src:1]. `{component.segmented-tab}` 은 밑줄 인디케이터 방식이라 항목이 늘면 가로 스크롤로 흘려야 하며, 원자적 컨트롤 그룹으로 묶어 고정폭을 주면 중간 폭에서 넘친다. `{component.bottom-tab-bar}` 는 중앙 FAB 이 슬롯을 차지하므로 항목 수를 줄이는 방향으로는 접히지 않는다 [src:1]. 상품 카드 이미지의 비율 규정은 확인되지 않았으므로, 좁은 폭에서의 크롭 정책은 소비자가 직접 정해야 한다.

## Known Gaps

- **네이티브 UI 서체 패밀리명 — 미확인.** 두 차례 심층 리서치로도 확인에 실패했고, 확증 경로 둘(비밀번호가 걸린 플랫폼 브랜드 아카이브 [src:21], APK 디컴파일)이 모두 막혀 있다. 지금 있는 것은 웹뷰 `@font-face` 와 BI 규정이라는 정황뿐이다 [src:18][src:19].
- **radius·shadow·상태별 스타일이 전무하다.** 확보된 정확값은 색 2종·타이포 1종·치수 2종이 전부이고, hover/disabled/selected/error 같은 상태 스타일은 어느 소스에도 없다 [src:7][src:18].
- **(B) 근사 관찰색을 토큰으로 승격하지 않았다.** GS더프레시 섹션의 초록 배경, 만료 카운트다운 배지의 주황, 와인25플러스의 진분홍 포인트는 캡처 인상으로만 남는다 [src:1]. 그 자리를 채우려면 소비자가 자체 값을 정해야 한다.
- **로그인 게이트 뒤 화면을 확보하지 못했다.** 로그인/온보딩, 마이페이지 탭 구성, 주문내역 상세가 여기 해당한다.
- **매장 지도 기반 재고찾기 화면을 싣지 못했다.** 화면이 실재하는 것은 확인했으나 그 근거가 공개 URL 이 아니라(사용자 실기기 캡처) 인용할 수 없어 컴포넌트에서 뺐다. 사유가 앞 항목과 다르다 — 접근이 막힌 게 아니라 인용 가능한 출처가 없는 경우다.
- **우리동네GS 전용 디자인 문서는 실재하나 비공개다.** Zeroheight 테넌트가 존재하고 [src:17] 브랜드 페이지 주소까지 확인됐지만 "This page is private" 이며 우회로가 없다 [src:21]. 이 항목의 값이 두꺼워지려면 그 문이 열려야 한다.

## References

1. https://apps.apple.com/KR/app/id426644449 — App Store 리스팅. 부제·개발사·iOS 요구 버전·용량·업데이트 노트와 마케팅 스크린샷 4장의 근거
2. https://hpsimg.gsretail.com/gsretail/ko/intro/ci-ri — GS리테일 구 CI/BI 페이지. RGB 열과 HEX 열이 어긋나는 오류가 있어 기업 색은 [src:20] 을 정본으로 쓴다. 서브 브랜드 PANTONE 규정은 이 페이지에만 있다
3. https://www.digitaltoday.co.kr/news/articleView.html?idxno=462734 — 2022년 출시와 4개 앱 통합 보도
4. https://www.newswire.co.kr/newsRead.php?no=991485 — MAU 관련 보도자료
5. https://sensortower.com/ko/blog/Our-Neighborhood-GS-continues-to-grow-ranking-1-in-downloads-and-usage — 누적 다운로드 규모 분석
6. https://teamup.kr/information/gs25-홈페이지 — GS ALL 멤버십의 계열 통합 등급 설명. 2차 자료이며 1차 공식 페이지는 미확인
7. https://gsretail.tistory.com/58 — GS리테일 공식 기술블로그, O4O개발팀 작성. Flutter 접근성 구현 글이며 정확한 색·타이포·spacing 수치의 1차 출처다
8. https://gsretail.tistory.com/67 — 같은 블로그. 조직과 통합 재개발 맥락의 교차 확인용
9. http://gs25.gsretail.com/gscvs/ko/store-services/woodongs — GS25 공식 사이트의 우리동네GS 소개 페이지. NanumBarunGothic 이 데스크톱 전용임을 가리는 데 쓰였고, 전용 워드마크와 인라인 SVG 가 없음을 확인한 페이지다
10. https://www.eyesmag.com/posts/155567/gs25-app-my-refrigerator — '나만의 냉장고' 사용법 매거진 기사. 2차 자료
11. https://weeklyuxuichallenge.oopy.io/8973ddee-7bf7-4a70-b889-59348e8d9bcf — 개인 UX 리뷰. '나만의 냉장고' 플로우 교차 확인용이며 색·치수는 없다
12. https://play.google.com/store/apps/details?id=com.gsr.gs25&hl=ko — Play 리스팅. 패키지명·다운로드 규모와 아이콘 512×512 PNG 의 출처
13. https://weeklyuxuichallenge.oopy.io/b4e6c734-dba4-4a35-af1e-60fa7ec45fdb — 실제 앱 스크린샷이 실린 2024-01 게시글. 캡처 시점이 오래돼 화면 라벨이 현행과 다를 수 있다
14. https://www.wanted.co.kr/wd/262586 — GS리테일 DX본부 채용공고. Flutter 전제의 재확인용이며 서체 언급은 없다
15. http://www.gsretail.com/gsretail/ko/media/gsr-magazine-view?magazineId=8798517943753 — 사보 인터뷰 전문. 조직 연혁 확인용이며 서체·프레임워크명 언급이 없다
16. http://hpimg.gsretail.com/_ui/desktop/common/docs/GS+CIBI.zip — 공식 CI/BI 킷(AI+JPG). 우리동네GS 전용 마크가 들어 있지 않음을 확인한 자산이다
17. https://unhngs.zeroheight.com/ — 우리동네GS 로 추정되는 Zeroheight 워크스페이스. 로그인이 필요해 실재 여부만 확인된다
18. https://ex-hubpage.grm.gsretail.com/_nuxt/entry.HxTB7rhz.css — 앱 안에서 열리는 GS ALL 멤버십 웹뷰의 스타일시트. `.GS25` 브랜드 스코프 테마와 Pretendard 자체 호스팅 `@font-face` 가 여기 있다. 파일명 해시는 2026-08-22 시점 빌드다
19. https://service.brand.gsretail.com/144fcad43 — GS리테일 서비스 브랜드 아카이브. GS ALL·GS Pay·POP·WINE25+ 의 색·서체·표기 규정이 발행돼 있고 로그인이 필요 없다
20. https://brand.gsretail.com/065da11e3 — GS리테일 기업 브랜드 아카이브. 기업 CI 4색이 hex·rgb·CMYK·PANTONE 으로 자체 일치하게 발행돼 있다
21. https://platform.brand.gsretail.com/870687ee0/p/9238e4-gs — 우리동네GS 공식 브랜드 페이지. 실재하지만 "This page is private" 로 잠겨 있다
22. https://m.gsthefresh.com/assets/1785912250352/css/index-aV5UJRLx.css — GS THE FRESH 모바일몰 스타일시트. 별도 브랜드이므로 값을 옮겨 쓰지 않는다
23. https://m.woodongs.com/ — 우리동네GS 공개 웹 표면. 앱 다운로드 랜딩과 약관 라우트뿐이고 앱 UI 가 아니다
24. http://web.archive.org/cdx/search/cdx?url=apps.apple.com/kr/app/id426644449&output=json — Wayback CDX API. 이 쿼리가 돌려주는 캡처는 2023-08-09 과 2024-12-20 두 건뿐이고 2026 년 캡처는 없다. Play 쪽은 `url=play.google.com/store/apps/details?id=com.gsr.gs25` 로 같은 API 를 쓴다. 아카이브된 HTML 은 gzip 이라 `curl --compressed` 가 필요하고, 아이콘 URL 은 `og:image` 메타로 추출한다
25. https://ex-hubpage.grm.gsretail.com/images/btn-logo-woodongs.png — 앱 내부 웹뷰가 참조하는 가로형 워드마크 277×84. 흰색·투명이라 밝은 배경에서는 보이지 않는다
26. https://woodongs.com/landing/asset/apple-touch-icon-180.6b5c8b16.png — 공식 앱 랜딩 도메인의 apple-touch-icon 180×180. 배경 실측이 시그니처 청록과 같다. 관례 경로 `/apple-touch-icon.png` 는 SPA catch-all 이라 HTML 을 돌려주므로 해시 경로를 써야 한다
