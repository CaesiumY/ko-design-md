---
name: 직방
design_system_name: ZUIX
slug: zigbang
category: etc
last_updated: "2026-10-02"
created_at: "2026-10-01"
lang: ko
logo: https://getdesign.kr/logos/zigbang.png
colors:
  ## Gray — 잉크와 무채색 램프
  gray10: oklch(0.218 0.000 0) # #1A1A1A — Text 기본색 · 그림자·스크림의 기준 잉크
  gray30: oklch(0.420 0.000 0) # #4D4D4D — 보조 글자 · SnackBar 배경
  gray40: oklch(0.510 0.000 0) # #666666
  gray50: oklch(0.600 0.000 0) # #808080 — 부제·메타 글자
  gray70: oklch(0.767 0.000 0) # #B3B3B3 — 미선택 컨트롤 · 비활성 글자
  gray80: oklch(0.845 0.000 0) # #CCCCCC — 작은 버튼의 비활성 글자 · Switch 꺼짐
  gray90: oklch(0.925 0.000 0) # #E6E6E6 — 1px 기본 테두리
  gray95: oklch(0.961 0.000 0) # #F2F2F2 — Divider · Tab 트랙
  gray97: oklch(0.976 0.000 0) # #F7F7F7 — 입력·카드 채움 · 작은 버튼 비활성 채움
  gray99: oklch(0.991 0.000 0) # #FCFCFC — Radio 내부 점
  white: oklch(1.000 0.000 0) # #FFFFFF
  ## Orange — 강조
  orange1: oklch(0.700 0.202 44) # #FF6905 — 관측상의 단일 강조색(브랜드가 primary 로 지정한 것은 아니다) · 흰 글자 대비 2.89:1
  orange2: oklch(0.980 0.013 64) # #FFF7F0 — 틴트 배경
  orange3: oklch(0.946 0.032 55) # #FFE8D9 — 48/44/40 버튼 비활성 채움 · Switch 비활성 켜짐
  ## Red
  red1: oklch(0.664 0.211 29) # #FA4E3E — 오류 테두리·문구
  red2: oklch(0.958 0.021 21) # #FFECEB — 틴트 배경
  ## Blue — 번호순과 명도가 단조롭지 않다
  blue1: oklch(0.671 0.170 252) # #3798FA — 전세 시리즈 · 틴트 글자
  blue2: oklch(0.966 0.017 248) # #EBF5FF — 틴트 배경
  blue3: oklch(0.512 0.193 259) # #025FD2
  blue4: oklch(0.549 0.136 248) # #1C75BC
  blue5: oklch(0.554 0.170 255) # #1A71D3
  ## Navy
  navy1: oklch(0.298 0.090 257) # #092C59 — TabFilter 선택 글자 · Switch navy 테마
  navy2: oklch(0.937 0.012 248) # #E4EBF2 — TabBox gray 테마 배경
  navy3: oklch(0.839 0.033 254) # #BCCCE0
  navy4: oklch(0.975 0.005 258) # #F5F7FA
  ## Green
  green1: oklch(0.618 0.167 150) # #0BA04B — 월세 시리즈
  green2: oklch(0.957 0.019 163) # #E6F5ED
  green3: oklch(0.607 0.173 149) # #009D41
  green4: oklch(0.968 0.008 157) # #F0F6F2
  green5: oklch(0.683 0.182 145) # #3AB54B
  green6: oklch(0.723 0.099 178) # #55BAA6
  ## Purple
  purple1: oklch(0.526 0.219 279) # #584DE4
  purple2: oklch(0.951 0.020 289) # #EEEDFC
  ## Alpha — gray10·white 기반
  grayOpacity05: oklch(0.218 0.000 0 / 5%) # rgba(26, 26, 26, 0.05)
  grayOpacity08: oklch(0.218 0.000 0 / 8%) # rgba(26, 26, 26, 0.08) — 누름 오버레이 기본값
  grayOpacity16: oklch(0.218 0.000 0 / 16%) # rgba(26, 26, 26, 0.16) — 헤더 0.5 구분선
  grayOpacity60: oklch(0.218 0.000 0 / 60%) # rgba(26, 26, 26, 0.6) — Dialog·BottomSheet 배경막
  grayOpacity80: oklch(0.218 0.000 0 / 80%) # rgba(26, 26, 26, 0.8)
  whiteOpacity04: oklch(1.000 0.000 0 / 40%) # rgba(255, 255, 255, 0.4) — 이름과 달리 알파 0.4 · 흰 누름 오버레이
gradients:
  button-orange1G: linear-gradient(135deg, oklch(0.700 0.202 44) 0%, oklch(0.614 0.214 29) 100%) # #FF6905 → #E9382E — Button orange1G 테마 · 끝색은 enum 밖 · 비활성에서는 그리지 않는다
  tag-hug: linear-gradient(to right, oklch(0.927 0.021 241) 0%, oklch(0.937 0.024 147) 100%) # #DBE9F4 → #E0EFE1 — Tag hug 테마
typography:
  text-8: # Text size="8"
    fontFamily: Pretendard
    fontSize: 8px
    lineHeight: 10px
  text-10: # Text size="10"
    fontFamily: Pretendard
    fontSize: 10px
    lineHeight: 12px
  text-11: # Text size="11" — Text 기본 크기
    fontFamily: Pretendard
    fontSize: 11px
    lineHeight: 14px
  text-12: # Text size="12"
    fontFamily: Pretendard
    fontSize: 12px
    lineHeight: 16px
  text-13: # Text size="13"
    fontFamily: Pretendard
    fontSize: 13px
    lineHeight: 18px
  text-14: # Text size="14"
    fontFamily: Pretendard
    fontSize: 14px
    lineHeight: 20px
  text-16: # Text size="16"
    fontFamily: Pretendard
    fontSize: 16px
    lineHeight: 24px
  text-18: # Text size="18"
    fontFamily: Pretendard
    fontSize: 18px
    lineHeight: 28px
  text-20: # Text size="20"
    fontFamily: Pretendard
    fontSize: 20px
    lineHeight: 30px
  text-22: # Text size="22"
    fontFamily: Pretendard
    fontSize: 22px
    lineHeight: 32px
  text-24: # Text size="24"
    fontFamily: Pretendard
    fontSize: 24px
    lineHeight: 36px
  text-26: # Text size="26"
    fontFamily: Pretendard
    fontSize: 26px
    lineHeight: 40px
elevation:
  ## Shadow 유틸 — 웹
  level1: 0px 1px 4px oklch(0.218 0 0 / 0.2) # rgba(26, 26, 26, 0.2) — iOS offset 1 · radius 2 / Android elevation 3
  level2: 0px 4px 8px oklch(0.218 0 0 / 0.06) # rgba(26, 26, 26, 0.06) — iOS offset 4 · radius 4 / Android elevation 6
  level3: 0px 6px 12px oklch(0.218 0 0 / 0.12) # rgba(26, 26, 26, 0.12) — iOS offset 6 · radius 6 / Android elevation 10
  level4: 0px 8px 20px oklch(0.218 0 0 / 0.1) # rgba(26, 26, 26, 0.1) — iOS offset 8 · radius 10 / Android elevation 16 · 소비자 웹 홈 카테고리 패널과 같은 값
---

## Brand & Style

직방 ZUIX는 순흑 대신 짙은 회색 잉크로 짠 무채색 램프 위에 따뜻한 오렌지 한 색만 강조로 올리고, 4px 안팎의 작은 모서리와 Pretendard로 조밀한 모바일 화면을 짜는 부동산 플랫폼의 공통 컴포넌트 언어다 [src:5][src:6][src:8].

이 항목의 범위는 직방 앱 전체가 아니라 직방 CTO실 ZUIX파트가 만든 공통 React Native 컴포넌트 라이브러리 ZUIX(패키지 `@zigbang/zuix2`)다 [src:71][src:66]. 발표 자료는 목적을 "직방의 모든 서비스에 디자인 시스템화를 하기 위함이다"로, 풀려는 문제를 "똑같은 디자인인데 코드가 다르게 만들어져 있지?"로 적고 서비스운영디자인팀과의 협업을 언급한다 [src:71]. 다만 그 자료의 업로더는 직방이 아니라 NAVER Engineering이고, 2021년 행사 발표를 재게시한 것이다 [src:71]. 현행 문서는 제목이 `zuix2`인 Storybook이고 [src:1][src:3], 번들에는 Figma 파일 `ZUIX-2.0` 링크가 있으며 [src:31], 스타일 번들은 `zuix2-` 접두 클래스를 만든다 [src:5].

시각 인상은 한 색의 집중에서 나온다. 기본 버튼 테마 `"primary"`의 채움, Tab 선택 밑줄, Loading 점, Checkbox·Radio 선택, Rating 별, FloatingButton, BottomNavigation 활성 아이콘이 모두 `{colors.orange1}`이다 [src:8][src:32][src:41][src:25][src:26][src:30][src:35][src:16]. 텍스트와 그림자의 기준 잉크는 순수 검정이 아니라 `{colors.gray10}`이다 — Text 기본색이 그것이고, 그림자·스크림과 `grayOpacity*` 불투명 토큰도 같은 잉크에 알파를 얹는다(흰 오버레이 `{colors.whiteOpacity04}` 하나만 흰색 기반이다) [src:6][src:5][src:44]. 밀도는 조밀한 모바일 쪽이다. Text 기본 크기가 11/14이고 [src:6], 버튼 기본 높이가 44이며 [src:8], 화면 좌우 여백 20이 반복된다 [src:32][src:15].

ZUIX는 소비자 웹에도 닿아 있다. www.zigbang.com 은 curl 로는 CloudFront 403 을 돌려주지만 렌더링하는 브라우저로는 읽히며, 2026-09-30 1440폭 실측에서 홈은 ZUIX 호스트의 Pretendard CSS를 그대로 로드하고 아이콘 래퍼에 `zuix2-tp4` 클래스를 쓴다 [src:72]. 아파트 지도 하단 CTA는 200×44·radius 4·`{colors.orange1}` 채움으로 Button 44 `"primary"`와 일치하고 [src:77], 홈 카테고리 패널의 그림자는 `{elevation.level4}`와 같은 값이다 [src:72]. 그러나 같은 화면에 enum 밖 하드코딩 색도 섞여 있다(`## Colors` 참고). App Store 앱 이름은 `No.1 부동산 플랫폼, 직방`이고 판매자는 ZIGBANG Co., Ltd.다 [src:75]. 스토어 스크린샷은 오렌지 채움 CTA, 오렌지 밑줄 탭, 연한 틴트 태그, 흰 바탕에 그림자를 얹은 떠 있는 알약형 하단 내비를 보여 준다 [src:75].

로고는 오렌지 배경 위 흰 집+궤도 심볼의 앱 아이콘형 정사각이다. favicon은 둥근 사각 배경, App Store artwork는 풀블리드 배경이며, SVG나 심볼 단독 로고는 수집되지 않았다 [src:73][src:74].

문서의 말투는 둘로 갈린다. 발표 자료는 "우리는 반응형이 기본!"처럼 짧은 구어체 감탄문이고 [src:71], Storybook mdx는 "컴포넌트는 말풍선을 통해 특정한 항목에 대한 상세 정보를 보여주기 위한 컴포넌트입니다."처럼 합니다체의 건조한 기능 설명이다 [src:67][src:68]. mdx에 권장·금지 같은 규범 문구는 없다 [src:65][src:66][src:67].

## Colors

ZUIX가 발행하는 색은 번들 안 TypeScript enum `Color`의 hex·rgba 문자열이다 [src:5][src:6]. 공개된 OKLCH는 없으므로 frontmatter의 OKLCH는 발행 hex를 변환한 값이고, 발행 hex·rgba는 각 토큰 줄의 트레일링 주석에 남겼다. 이름은 enum 그대로다.

**enum은 팔레트뿐이고 역할 이름이 없다.** style 청크에 primary·background·surface 같은 시맨틱 이름 맵은 0건이다 [src:5]. **다크 모드도 없다** — 다크 관련 식별자는 Storybook 크롬(런타임·docs blocks)에만 걸린다 [src:70][src:76]. 스토리 인덱스에도 Color·Foundation·Tokens 항목이 없다 [src:2]. 그래서 이 항목은 `primary` 토큰도 `dark-` 토큰도 싣지 않는다. `{colors.orange1}`이 강조를 도맡는 것은 위 컴포넌트들에서 **관측된 사실**이지 브랜드가 역할로 지정한 것이 아니다.

**패밀리 번호에 관례가 있다 — 1은 채도색, 2·3은 틴트다.** Gray만 명도 단계 번호(10~99)를 쓰고, 단계는 정확히 frontmatter의 열하나뿐이다(20·60·85 없음) [src:5]. Blue는 예외로 번호순과 명도가 단조롭지 않다 — `{colors.blue2}`는 밝고 `{colors.blue3}`은 어둡다 [src:5]. Tag가 틴트 배경과 채도 글자를 짝짓는 방식이 이 관례를 가장 잘 보여 준다 [src:12]. Notification 배경도 같은 틴트를 쓴다 [src:36].

| 틴트 배경 | 짝 글자색 | 관측된 쓰임 |
| --- | --- | --- |
| `{colors.orange2}` | `{colors.orange1}` | Tag 기본, Notification, Selector 선택 [src:12][src:36][src:29] |
| `{colors.blue2}` | `{colors.blue1}` | Tag, Notification [src:12][src:36] |
| `{colors.red2}` | `{colors.red1}` | Tag, Notification [src:12][src:36] |
| `{colors.gray95}` | `{colors.gray50}` | Tag [src:12] |
| `{colors.white}` | `{colors.gray30}` | Tag [src:12] |
| `{colors.gray97}` | `{colors.gray10}` | Notification(테두리 `{colors.gray95}`) [src:36] |

채도 배경 — `{colors.orange1}`·`{colors.red1}`·`{colors.gray70}`·`{colors.gray10}`·`{colors.grayOpacity60}`·`{colors.navy1}`·`{colors.blue1}`·`{colors.blue5}`·`{colors.green5}`·`{colors.green6}` — 위에는 흰 글자를 쓴다 [src:12].

**비활성은 불투명도가 아니라 별도 팔레트 색이다.** 큰 버튼(48/44/40)은 `{colors.orange3}` 채움에 흰 글자, 그보다 작은 버튼은 `{colors.gray97}` 채움에 `{colors.gray80}` 글자로 바뀌고, disabled와 짝지은 opacity는 컴포넌트 청크에서 발견되지 않았다 [src:8][src:25]. Switch도 켜짐 `${theme}1`, 비활성+켜짐 `${theme}3`, 꺼짐 `{colors.gray80}`, 비활성+꺼짐 `{colors.gray97}`로 같은 원리를 따르고, 테마는 `orange`와 `navy` 둘이다 [src:27][src:58]. 오류는 `{colors.red1}` 하나로 표현한다(TextField 테두리와 오류문) [src:19].

**알파 토큰은 전부 `{colors.gray10}`이나 흰색에 알파를 얹은 것이다.** 배경막은 Dialog와 BottomSheet 모두 `{colors.grayOpacity60}`이고 [src:21][src:46], 누름 피드백 오버레이는 기본 `{colors.grayOpacity08}`, Button `gray30` 테마에서만 `{colors.whiteOpacity04}`(이름과 달리 알파 0.4)다 [src:48][src:8][src:5]. enum에 10% 단계는 없는데도 툴팁·프로필 배지·슬라이더 노브의 그림자는 `oklch(0.218 0 0 / 0.1)`을 하드코딩한다 [src:24][src:45][src:31].

**그라디언트는 둘만 발행됐다.** Button `orange1G` 테마는 135°로 `{colors.orange1}`에서 enum 밖의 붉은 오렌지 `oklch(0.614 0.214 29)`로 넘어가고 비활성에서는 그리지 않는다 [src:8]. Tag `hug` 테마는 오른쪽 방향의 하늘색→연두 2-스톱이다 [src:12]. 둘 다 단색이 아니라 frontmatter `colors:`가 아닌 `gradients:` 맵에 `gradients.button-orange1G`·`gradients.tag-hug`로 두었다.

**enum 밖 하드코딩 색 — ZUIX 번들 안.** 아래 값은 토큰이 아니라 관찰로 남긴다.

- Badge 글자·아이콘은 핑크 `#FF20A6`(`oklch(0.665 0.264 351)`)와 파랑 `#0651F1`(`oklch(0.513 0.247 263)`)이고, 파랑은 이름이 enum `blue1`과 겹치지만 값이 다르다 [src:13].
- Badge 배경은 `#FFF5FB`(`oklch(0.980 0.013 341)`)와 `#F0F7FF`(`oklch(0.973 0.013 252)`)다 [src:13].
- BottomSheetView 핸들은 `#D9D9D9`(`oklch(0.885 0.000 0)`)다 [src:47].
- Thumbnail 글자 그림자만 gray10 잉크가 아니라 순수 검정 `oklch(0 0 0 / 0.5)`를 쓴다 [src:44].
- Icon 청크는 enum을 참조하지 않고 `{colors.orange1}`·`{colors.orange2}`·`{colors.white}` 값을 리터럴로 박아 두며 [src:49], ListImageItem 카드 배경도 흰색 리터럴이다 [src:51].

**enum 밖 하드코딩 색 — 소비자 웹.** 직방 소비자 웹은 enum을 끝까지 쓰지 않는다. 아파트 지도의 선택 카테고리는 `#FF681B`(`oklch(0.699 0.200 42)`), 검색창 테두리와 오른쪽 검색 버튼은 `#FA880B`(`oklch(0.738 0.176 57)`)로 둘 다 `{colors.orange1}`(`oklch(0.700 0.202 44)`)과 다른 오렌지이고 [src:77], 홈 뉴스 카드 배경 `#F3EDE9`(`oklch(0.950 0.008 56)`)와 지도 헤더 하단선 `#E1E1E1`(`oklch(0.910 0 0)`)도 enum에 없는 값이다 [src:72][src:77]. 반면 홈의 메타 글자는 `{colors.gray50}`, 제목·공지 글자는 `{colors.gray10}`, "일반 광고 문의" 플로팅 버튼은 `{colors.navy1}`로 enum 값과 일치하지만, 짝을 이루는 "분양 광고 문의" 버튼은 enum 밖 순수 검정 `#000000`(`oklch(0 0 0)`)이다 [src:72].

**차트에는 거래 유형이 색으로 박혀 있다.** 시세 시리즈는 매매 `{colors.orange1}`, 전세 `{colors.blue1}`, 월세 `{colors.green1}`이고, 전체 시리즈는 `{colors.gray50}`에 `{colors.gray80}` 30% 알파 채움의 둥근 막대·영역으로 그린다 [src:54]. CompareChart 스토리의 팔레트 enum도 같은 세 색이다 [src:63]. 이 대응은 도메인 의미를 담고 있으므로 `## Do's and Don'ts`의 도메인 경계 항목을 함께 볼 것.

## Typography

> **값 정정(2026-10-02).** 홈 섹션 제목 굵기를 www.zigbang.com 재측정으로 "32/32 700"에서 앞부분 400·강조어 700 혼용으로 고쳤다 [src:72].

**패밀리는 Pretendard 하나다.** Text의 래핑 스타일이 `fontFamily:"Pretendard"`를 하드코딩하고 [src:6], TextInput과 차트 공용 청크의 라벨도 같다 [src:7][src:54]. 다른 fontFamily 히트는 Storybook docs blocks와 SlideShare 사이트 CSS에만 있다 [src:76][src:71]. 별도의 디스플레이 서체가 없으므로 `font-display-src`는 해당하지 않는다.

웹폰트는 ZUIX 호스트의 `pretendard-subset.css`이고 Storybook 프리뷰 셸이 이것을 `<link rel="stylesheet">`로 로드한다 [src:3][src:4]. @font-face는 700·500·400 세 개뿐이고, 각각 로컬 설치본을 먼저 시도한 뒤 서브셋 woff2·woff를 쓴다. font-display와 unicode-range 선언은 없고, 라이선스는 SIL OFL 1.1이다 [src:4]. 가변 폰트가 아니라 세 굵기의 정적 서브셋이다.

**굵기는 세 단계뿐이다** — `FontWeight` enum이 `regular` 400 · `medium` 500 · `bold` 700을 정의하고 CSS도 이 셋만 선언하며, italic은 0건이다 [src:6][src:4]. Text의 기본 굵기는 `medium`이다 [src:6]. 굵기는 크기 스텝에 묶여 있지 않은 별도 enum이어서 frontmatter 스타일에는 싣지 않았다.

**크기 스케일은 `size` prop의 문자열 enum 12단계다** [src:6]. heading·body·caption 같은 이름은 없고 키는 숫자 문자열뿐이며, 비Storybook 청크의 fontSize 리터럴은 8~26 범위를 벗어나지 않는다 [src:6]. frontmatter 스타일 이름 `text-N`은 이 `size="N"` 값을 따랐다.

| size prop | 토큰 | fontSize / lineHeight |
| --- | --- | --- |
| `"8"` | `{typography.text-8}` | 8 / 10px |
| `"10"` | `{typography.text-10}` | 10 / 12px |
| `"11"` (기본) | `{typography.text-11}` | 11 / 14px |
| `"12"` | `{typography.text-12}` | 12 / 16px |
| `"13"` | `{typography.text-13}` | 13 / 18px |
| `"14"` | `{typography.text-14}` | 14 / 20px |
| `"16"` | `{typography.text-16}` | 16 / 24px |
| `"18"` | `{typography.text-18}` | 18 / 28px |
| `"20"` | `{typography.text-20}` | 20 / 30px |
| `"22"` | `{typography.text-22}` | 22 / 32px |
| `"24"` | `{typography.text-24}` | 24 / 36px |
| `"26"` | `{typography.text-26}` | 26 / 40px |

**letterSpacing 토큰은 없다.** 프리뷰 셸의 유일한 `letter-spacing: 0.2px`는 Storybook 헤딩의 것이고, 청크 전체에서 letterSpacing은 docs blocks에만 걸린다 [src:3][src:76].

글자 확대는 기본으로 꺼져 있다. 모듈 플래그를 켜면 크기가 `calc(Npx * min(var(--zb-font-scale, 1), maxFontSizeMultiplier) / var(--zb-engine-scale, 1))`이 되고 배율 상한 기본값은 1.5다. 플래그가 꺼진 기본 상태에서는 위 표의 정적 px다 [src:6].

컴포넌트가 실제로 고르는 조합은 다음과 같다.

| 자리 | 크기 / 굵기 |
| --- | --- |
| Button 라벨 | 48·44 → 16, 40·32 → 14, 28 → 13, 24 → 12. 48·44와 `lineGray10`·`gray30` 테마, 40+`grayOpacity08`은 bold, 나머지 medium [src:8] |
| TopBar 제목 | 14 bold [src:17] |
| Dialog 제목 / 부제 | 16 bold / 16 regular [src:21] |
| TextInput | 16/24 regular [src:7] |
| CardInfo 제목 | 22 bold [src:39] |
| Title 컴포넌트 | 14 · 18 · 24 · 26, bold [src:20][src:57] |

**소비자 웹은 서체를 둘로 나눈다.** www.zigbang.com 본문은 Spoqa Han Sans이고, 제목과 카드만 ZUIX 호스트의 Pretendard를 로드해 쓴다 [src:72]. 홈 히어로 제목은 Pretendard 36 / 600으로 ZUIX의 세 굵기 밖이고, 섹션 제목은 32/32로 앞부분 400에 강조어만 700을 섞는다 [src:72]. 뉴스 카드 제목 16/24 700과 메타 12/16 500, 공지 날짜 14/20 400은 ZUIX 크기 짝과 같다 [src:72]. 지도 화면의 필터 칩 라벨은 Pretendard 14/20 500이고, 상단 카테고리 라벨은 Spoqa Han Sans 18/28 bold다 [src:77].

## Spacing

**이름 붙은 spacing 스케일은 발행되지 않았다.** 공용 margin 헬퍼는 `mt`·`mr`·`mb`·`ml` 숫자를 그대로 margin으로 넘기고 [src:5], ListView `gap`과 Pressable `radius`의 기본값은 숫자 0이며 [src:50][src:48], 스토리 인덱스에 Spacing·Foundation 항목이 없다 [src:2]. 그래서 frontmatter에 `spacing:` 맵을 두지 않는다. 아래는 컴포넌트 리터럴을 값별로 묶은 **빈도 관찰**이지 스케일이 아니다.

- **20 — 화면 좌우 거터.** Tab 컨테이너, Filter, ChipFilter, BottomCTA, Title, CardInfo, Tooltip·SnackBar 좌우 마진, Selector, TextField 기본 좌우 마진, Divider `linePadding`이 모두 20이다 [src:32][src:11][src:10][src:15][src:20][src:39][src:24][src:22][src:23][src:29][src:19][src:40].
- **12 — 표면 안쪽 패딩.** Tooltip, SnackBar, Notification, Tag large 가로, Chip 32 가로, SearchBar 좌우 [src:24][src:22][src:36][src:12][src:9][src:18]
- **8 — 요소 사이 간격.** Dialog 버튼 사이, BottomCTA 버튼 사이, ChipFilter·Filter 항목 사이, TextField 상하 마진 [src:21][src:15][src:10][src:11][src:19]
- **4 — 슬롯 간격.** SearchBar 좌우 슬롯, Checkbox 원형 라벨 왼쪽(그 외 8), SnackBar 제목 왼쪽 슬롯 [src:18][src:25][src:22]

컴포넌트 안쪽 치수는 컴포넌트마다 정해져 있다.

```text
Button  size(= minHeight) → 세로 / 가로 패딩                [src:8]
  48 → 9 / 16     44 → 9 / 15     40 → 9 / 15
  32 → 6 / 11     28 → 4 / 7      24 → 3 / 5

Tag     size → 세로 / 가로 패딩                            [src:12]
  large 6 / 12    medium 4 / 8    small 2 / 6    xsmall 2 / 4

TextField 카드 패딩 9 / 11, 테두리 1                       [src:19]
  focus  패딩 8.5 / 10.5, 테두리 1.5   (테두리가 두꺼워진 만큼 패딩을 줄여 외곽 크기 유지)
  제목이 있으면 세로 12 (focus 11.5) · multiline 기본 높이 111

Tab     항목 좌우 12 · 위 16 · 아래 12 · 래퍼 높이 52      [src:32]
```

테두리 두께도 같은 성격의 반복이다. 일반 1, 강조·선택 1.4이고 TextField 포커스만 1.5다 [src:8][src:9][src:19][src:43]. 헤더 하단 구분선은 0.5 `{colors.grayOpacity16}`이다 [src:17][src:11][src:18]. Tile의 `TileBorderSize` 4·8·12 enum이 스케일에 가장 가깝지만 컴포넌트 로컬 스위치다 [src:43].

소비자 웹 홈의 콘텐츠 폭은 1440 뷰포트에서 1080이고, 카테고리 패널은 1080×140에 180폭 타일 여섯 개를 놓는다 [src:72].

## Rounded

**이름 붙은 radius 스케일도 발행되지 않았다.** frontmatter에 `rounded:` 맵을 두지 않고, 관측된 컴포넌트 리터럴만 값별로 적는다 [src:48][src:2]. 지배적인 값은 4다.

- **2** — Checkbox 루트, TabBox 항목, Slider 바 [src:25][src:33][src:31]
- **4 (지배적)** — Button 루트·테두리 오버레이·Pressable(크기와 무관, 크기별 radius 맵 없음), TextField 카드, SearchBar 입력, Dialog 내용, SnackBar·SnackBarVertical, Tooltip, Badge, Notification·NotificationExtend, Thumbnail, TabFilter 선택 알약, ListImageItem 카드 [src:8][src:19][src:18][src:21][src:22][src:23][src:24][src:13][src:36][src:37][src:44][src:34][src:51]
- **5** — BottomSheet 드래그 핸들(34×4)과 BottomSheetView 핸들 래퍼 [src:46][src:47]
- **6** — TabFilter 트랙 [src:34]
- **8** — Selector 항목, Profile 사각 변형 [src:29][src:45]
- **12** — BottomSheet·BottomSheetView 상단 두 모서리만, CardInfo [src:46][src:47][src:39]
- **14** — Profile 배지 알약, Slider 노브 28 [src:45][src:31]
- **16 · 20** — Chip은 높이의 절반(32 → 16, 36 → 20), Switch 트랙 16, Tag `tagRadius` 기본 20(크기와 무관) [src:9][src:27][src:12]
- **100** — FloatingButton과 그 배지의 원형 [src:35]
- Tile은 `borderRadius` 4·8·12를 enum으로 고른다 [src:43].

소비자 웹도 같은 결이다. 지도 화면의 필터 칩·검색창·하단 CTA가 4이고 [src:77], 홈의 카테고리 패널과 뉴스 카드는 12, 헤더 우측 버튼은 6이다 [src:72].

## Elevation & Depth

**평평한 표면에 옅은 그림자를 쓴다.** 웹 `Shadow` 유틸은 `{elevation.level1}`~`{elevation.level4}` 네 단계이고 모두 `{colors.gray10}` 잉크에 알파를 얹는다 [src:5]. 가장 진한 것은 오히려 가장 작은 `{elevation.level1}`(알파 0.2, 블러 4)이고, 단계가 오를수록 오프셋과 블러가 커지면서 알파는 0.06~0.12에 머문다 [src:5]. 소비자 웹 홈의 카테고리 패널 그림자가 `{elevation.level4}`와 같은 값이다 [src:72].

네이티브 대응표(Util/Shadow 스토리)는 iOS에서 모든 단계의 shadowColor를 `{colors.gray10}`으로 두고 offset·opacity·radius를 1/0.2/2, 4/0.06/4, 6/0.12/6, 8/0.1/10으로 준다. Android는 elevation 3·6·10·16이고 shadowColor는 level1만 `{colors.gray30}`, 나머지는 단계마다 enum 밖의 다른 회색이다. 스토리 표는 네 번째 행 이름을 `level1`로 잘못 적었다 [src:55].

컴포넌트 그림자는 유틸을 쓰지 않고 따로 적는다. Tooltip·Profile 배지·Slider 노브는 `0px 2px 2px oklch(0.218 0 0 / 0.1)`이고 [src:24][src:45][src:31], ListImageItem 카드는 `0px 2px 4px oklch(0.218 0 0 / 0.12)`다 [src:51]. Dialog는 그림자 없이 elevation 3만 준다 [src:21]. **Button·Chip·Tile·FloatingButton·BottomCTA에는 그림자가 없다** [src:8][src:9][src:43][src:35][src:15]. 깊이를 그림자보다 배경막과 레이어로 만든다 — SnackBar 계열은 zIndex 1e4 / elevation 999, Pressable 오버레이는 elevation 100이다 [src:22][src:23][src:48].

### Motion

```text
motion (번들 관측 — 중앙 모션 토큰 파일은 없다):
  press-scale        Pressable scaleInOut: scale 1 → .96 → 1, 각 80ms, 이징 없음, 클래스 zuix2-scale-fx
  tab-indicator      Tab 밑줄 이동 130ms
  tab-filter         TabFilter 알약 이동 300ms
  switch             Switch 노브 300ms, 이징 없음
  dialog             300ms, 진입 ease-in / 퇴장 ease-out, fade 0 → 1 + translateY 100% → 0%
  bottom-sheet       350ms cubic-bezier(.25, .1, .25, 1), Modal fade
  snackbar           200ms Easing.cubic, scale .4 → 1, 기본 유지 2000ms
  snackbar-vertical  200ms, scale .4 → 1 + opacity, 이징 없음
  loading-dot        400ms cubic-bezier(.65, 0, .35, 1), 20px 바운스, 80 / 160ms 스태거
  parallax           4000ms linear, translateX 보간 [-1, -.5, 0, .5, 1]
```

누름 피드백은 Pressable `feedback` 기본값 true가 그리는 오버레이이고, `scaleInOut`이면 축소 펄스로 바뀐다 [src:48]. Dialog·BottomSheet·SnackBar 값은 각 컴포넌트 번들에서 읽었고 [src:21][src:46][src:47][src:22][src:23], SnackBar 스토리는 유지 시간을 3000으로 바꿔 시연한다 [src:60]. Switch·Tab·TabFilter·Loading도 각 번들의 값이다 [src:27][src:32][src:34][src:41]. Parallax는 구현과 스토리가 같은 보간을 쓴다 [src:53][src:61]. Gradient 컴포넌트는 CSS linear-gradient를 left·right·bottom·top 방향(기본 bottom)으로 그린다 [src:52][src:62]. spring 애니메이션과 style 청크의 bezier·duration 맵은 0건이다 [src:5].

## Shapes

ZUIX의 형태는 **작고 기하학적인 사각형**이다. 버튼·입력·다이얼로그·스낵바·툴팁·배지·썸네일이 모두 4의 얕은 모서리를 공유하고, 알약형은 주로 Chip·Tag·Switch와 Profile 배지에 쓰인다 [src:8][src:19][src:21][src:22][src:24][src:13][src:44][src:9][src:12][src:27][src:45]. 완전한 원은 FloatingButton과 그 배지, Checkbox의 `circle` 형태 같은 작은 표지에 쓰이고 [src:35][src:25], 큰 곡률은 화면 아래에서 올라오는 BottomSheet의 상단과 CardInfo의 12에 그친다 [src:46][src:39].

선은 가늘고 두 단계다. 일반 1에 비해 강조·선택 테두리는 1.4로 두껍다 — Chip 선택, `lineOrange`·`lineGray10` 버튼, Tile `linePrimary`가 그렇다 [src:8][src:9][src:43]. 섹션 구분은 선이 아니라 12px 높이의 `{colors.gray95}` 블록으로 하고 [src:40][src:59], 가로 스크롤 줄의 끝은 흰색 페이드 그라디언트로 덮는다 [src:10].

유기적인 형태는 거의 없다. 예외는 BottomSheetView가 `#D9D9D9`(`oklch(0.885 0.000 0)`) 14×3 막대 두 개를 기울여 놓아 만든 핸들과, Tooltip을 문서가 "말풍선"이라 부르는 정도다 [src:47][src:67]. 로고도 같은 문법이다 — 오렌지 정사각 위에 흰 집과 궤도를 얹은 앱 아이콘형이다 [src:73][src:74]. 아이콘은 Icon 청크가 오렌지·흰색 채움을 리터럴로 그린다 [src:49].

## Components

스토리 인덱스(v5)는 88개 항목(docs 7 + story 81), 고유 제목 72개이고 카테고리는 `Component/*`·`Chart/*`·`Layout/ListView`·`Util/Shadow`·`Global Store`·`Playground`·`Animation/Parallax`다 [src:2]. Toast·Modal·Accordion·Dropdown·Avatar·Progress·Skeleton·Pagination·Breadcrumb 제목은 없고, 모달 역할은 Dialog가 한다 [src:2]. Dialog와 SnackBar 계열은 Provider + 훅의 Global Store로 전역 관리한다 [src:65][src:66].

아래 스펙의 치수는 번들 리터럴이고 단위는 px다. tsx 스니펫은 번들에서 읽은 값으로 재구성한 예시이며, 본문에 이름이 나온 prop 외의 철자는 확인하지 않았다.

### button-primary

```text
Button  theme "primary" (기본 테마)                         [src:8]
  size     24 | 28 | 32 | 40 | 44 (기본) | 48
  fill     {colors.orange1}
  label    {colors.white} · 48/44 → 16 bold, 40/32 → 14 medium, 28 → 13, 24 → 12
  radius   4 (크기와 무관)
  shadow   없음
  press    {colors.grayOpacity08} 오버레이 (Pressable feedback 기본값)
```

기본 버튼은 오렌지 채움에 흰 글자다 [src:8]. 소비자 웹 아파트 지도의 하단 CTA가 200×44·radius 4·`{colors.orange1}`로 이 스펙과 정확히 일치한다 [src:77].

```tsx
// 번들 값으로 재구성한 예시 — 기본 크기 44, 기본 테마 "primary"
<Button>확인</Button>
```

### button-primary-disabled

비활성은 크기에 따라 갈린다. 48·44·40은 `{colors.orange3}` 채움에 흰 글자를 유지하고, 32 이하는 `{colors.gray97}` 채움에 `{colors.gray80}` 글자로 바뀐다 [src:8]. 불투명도를 낮추지 않는다.

### button-red1

`red1` 테마는 `{colors.red1}` 채움에 흰 글자다. 비활성은 48·44·40에서 `{colors.red2}` 채움 + 흰 글자, 작은 크기에서 `{colors.gray97}` + `{colors.gray80}`이다 [src:8].

### button-line

흰 배경에 테두리만 있는 테마 넷이다 [src:8].

```text
lineGray10   테두리 1.4 {colors.gray10}  · 비활성 테두리 {colors.gray90}, 배경 {colors.gray97}
lineGray30   테두리 1   {colors.gray30}  · 비활성 배경 {colors.gray97}
lineGray90   테두리 1   {colors.gray90}  · 글자 {colors.gray10} · 비활성 테두리 {colors.gray95}, 글자 {colors.gray80}
lineOrange   테두리 1.4 {colors.orange1} · 비활성 테두리 {colors.orange3}
```

`lineGray30`은 여러 버튼이 함께 놓일 때 보조 액션 자리를 맡는다(`{component.bottom-cta}`, `{component.dialog}` 참고) [src:15][src:21].

### button-tint

`orange2` 테마는 `{colors.orange2}` 채움에 1.4 `{colors.orange1}` 테두리와 `{colors.orange1}` 글자다. `bgOrange2` 테마는 `{colors.orange2}` 채움에 테두리 없이 `{colors.orange1}` 글자를 쓰고(테두리 매핑에 이 테마가 없다), 비활성은 `{colors.gray97}` 채움 + `{colors.gray80}` 글자다 [src:8].

### button-gray30

`{colors.gray30}` 채움에 흰 글자이고, 누름 오버레이가 이 테마에서만 흰색 `{colors.whiteOpacity04}`로 바뀐다 [src:8][src:48]. `grayOpacity08` 테마는 `{colors.grayOpacity08}` 채움에 1 `{colors.gray70}` 테두리와 흰 글자다. `transparent` 테마는 배경 없이 `{colors.gray10}` 글자다 [src:8].

### button-orange1G

`gradients.button-orange1G`를 채움으로 쓰는 135° 그라디언트 테마다. 비활성 상태에서는 그라디언트를 그리지 않는다 [src:8].

### chip

크기 32·36, 테마 `lineGray90`·`lineGray30`·`bgOrange2`, 기본은 `lineGray90`/32/normal이다. 일반 상태는 흰 배경, 1 `{colors.gray90}` 테두리, `{colors.gray10}` 글자이고 라벨은 32에서 13, 36에서 14다. radius는 높이의 절반이다 [src:9].

### chip-selected

32 선택은 흰 배경에 1.4 `{colors.orange1}` 테두리와 `{colors.orange1}` 글자다. 36이거나 `selectedTheme`이 `gray30`이면 `{colors.gray30}` 채움·테두리에 흰 글자로 바뀐다 [src:9].

### chip-filter

ChipFilter는 선택한 인덱스에 `selected`를 주는 가로 스크롤 줄이다. 줄 minHeight 60, 좌우 20, 항목 사이 8이고, 오른쪽 끝을 흰색 페이드 그라디언트(스톱 0 · .35 · 1)로 덮는다 [src:10].

### filter

Filter는 상태를 Button 테마로 매핑한다 — active → `lineOrange`, selected → `orange2`, normal → `lineGray90`. 항목은 Button 32이고 컨테이너 높이 48, 하단에 0.5 `{colors.grayOpacity16}` 선을 긋는다 [src:11]. 소비자 웹 지도의 필터 칩(흰 배경, radius 4, 높이 32)도 같은 치수다 [src:77].

### tag

기본은 `orange2` 테마 / large / `tagRadius` 20이다. 라벨은 xsmall 10 · small 11 · medium 12 · large 13이고 [src:12][src:56], 배경·글자 짝은 `## Colors`의 틴트 표를 따른다 [src:12].

### tag-hug

`gradients.tag-hug` 2-스톱 그라디언트를 배경으로 쓰는 Tag 테마다 [src:12].

### badge

높이 20, radius 4, 16×16 아이콘 + 11 글자다. 색은 enum이 아니라 하드코딩 핑크·파랑이다(`## Colors` 참고). 라벨은 글자 확대를 끈다 [src:13].

### bottom-cta

하단 고정 CTA다. `type`은 `vertical`(기본)·`5to5`·`1to2`·`2to1`이고 버튼은 기본 Button 44다 [src:15].

```text
BottomCTA                                                   [src:15]
  버튼 하나     "primary"
  vertical      첫 버튼 "primary", 다음 lineGray30 (버튼 사이 8)
  5to5|1to2|2to1 첫 버튼 lineGray30, 다음 "primary" — 주 액션이 오른쪽, flex 5:5 / 1:2 / 2:1
  제목          16 bold · 부제 13 regular {colors.gray50}
  루트 마진     좌우 20 · 상하 12
  shadow        없음
```

```tsx
// 가로 5:5 — 왼쪽 lineGray30 보조, 오른쪽 "primary" 주 액션
<BottomCTA type="5to5" />
```

### bottom-navigation

흰 배경, 높이 68, 24 아이콘은 활성 `{colors.orange1}`·비활성 `{colors.gray80}`, 라벨 12/16이다 [src:16]. 앱 스크린샷의 단기임대 화면에서는 하단 내비가 그림자를 얹은 흰 알약형으로 떠 있는데, 이것이 ZUIX BottomNavigation과 같은 컴포넌트인지는 확인되지 않았다 [src:75].

### top-bar

높이 52(+notch), 좌우 슬롯 최소 72, 흰 배경, 중앙 정렬 제목 14 bold(최대 2줄), 하단 0.5 `{colors.grayOpacity16}` 구분선이다 [src:17].

### search-bar

루트 높이 52, 입력 높이 40, radius 4, `{colors.gray97}` 채움, 좌우 패딩 12다 [src:18].

### text-field

```text
TextField                                                   [src:19]
  default   카드 테두리 1 {colors.gray90} · 패딩 9 / 11 · radius 4
  focus     테두리 1.5 {colors.gray10} · 패딩 8.5 / 10.5
  error     테두리 {colors.red1} · 오류문 14 regular {colors.red1}
  readonly / disabled   채움 {colors.gray95}
  title     14 bold {colors.gray50}
```

포커스 스타일은 있지만 hover 스타일은 없다 [src:19][src:48].

### text-field-focus

포커스는 테두리를 1.5 `{colors.gray10}`으로 두껍게 하고 그만큼 패딩을 줄여 외곽 크기를 지킨다. 색으로는 오렌지를 쓰지 않는다 [src:19].

### text-field-error

오류는 `{colors.red1}` 테두리와 `{colors.red1}` 14 regular 오류문이다 [src:19].

### dialog

```text
Dialog                                                      [src:21]
  container   흰 내용 박스 maxWidth 340 · 외곽 maxWidth 400 · radius 4 · minHeight 100
  scrim       {colors.grayOpacity60}
  buttons     기본 Button 40 · buttonAlign 기본 column
  row 배치    첫 버튼 lineGray30 · 비율 3to7 (flex 3:7) | 5to5
  title       16 bold · 부제 16 regular
  shadow      없음 (elevation 3)
```

Provider와 `useDialog` 훅으로 전역 관리한다 [src:65].

### snackbar

`{colors.gray30}` 배경, radius 4, 흰 글자(제목 14, 부제 13 regular), 왼쪽 이미지 40×40이다. 오른쪽 텍스트 액션은 13 `{colors.orange1}`이고 밑줄이 없다. 내부 maxWidth 400 [src:22]. Global Store로 띄운다 [src:66].

### snackbar-vertical

화면 중앙에 고정되는 오버레이에 40 아이콘을 얹는 변형이다. minWidth 142 [src:23]. `useSnackBarVertical` 등 Global Store 훅으로 관리한다 [src:66].

### tooltip

전용 청크 없이 FlatListWithTooltip 안에 구현돼 있다. 폭 260, 1 `{colors.gray70}` 테두리, 흰 배경, radius 4, 패딩 12, 그림자 `0px 2px 2px oklch(0.218 0 0 / 0.1)`이다. 제목 14 bold `{colors.gray10}`, 부제 13 `{colors.gray30}`, 텍스트 버튼 13 medium `{colors.gray50}` 밑줄 [src:24]. 스크롤 위치를 고려해 배치하려고 기준 컴포넌트의 `rootRef`를 받는다 [src:67].

### tab

라벨 14(선택 시 bold), 선택 `{colors.orange1}`(`selectedColor`로 바꿀 수 있다), 비선택 `{colors.gray30}`, 비활성 `{colors.gray70}`이다. 2px `{colors.orange1}` 밑줄이 1px `{colors.gray95}` 트랙 위를 130ms로 미끄러진다. 래퍼 높이 52 [src:32].

### tab-filter

세그먼트 컨트롤이다. `{colors.gray97}` 트랙(radius 6, 패딩 3) 위에 흰 알약(높이 26, 1 `{colors.gray95}`, radius 4)이 300ms로 이동한다. 라벨 13은 선택 시 bold `{colors.navy1}`, 누름 `{colors.gray10}`, 기본 `{colors.gray50}`이다 [src:34]. 선택 강조에 오렌지가 아니라 네이비를 쓴다.

### tab-box

높이 24, radius 2의 태그형 탭이다. orange 테마는 흰 배경, gray 테마는 `{colors.navy2}` 배경이고 글자는 12 / 400 / 16이다 [src:33].

### checkbox

square(기본, 20)·mark·circle 세 형태, 선택 `{colors.orange1}`, 미선택 `{colors.gray70}`, 루트 radius 2다. `touchPadding` 4로 히트 영역을 넓힌다 [src:25].

### radio-button

선택은 `{colors.orange1}` 채움 위에 `{colors.gray99}` 내부 점 8(28 크기에서 11.2)이다 [src:26].

### switch

48×28 트랙(radius 16), 24 흰 노브, 300ms. 테마 `orange`·`navy`, 상태색은 `## Colors`의 비활성 규칙을 따른다 [src:27][src:58].

### stepper

1 `{colors.gray90}` 테두리, radius 4, minWidth 132, 값 16 medium `{colors.gray10}`이다 [src:28].

### selector

항목 패딩 12/20, radius 8. 선택 항목은 `{colors.orange2}` 채움에 bold `{colors.orange1}` 라벨이다 [src:29].

### rating

채운 별 `{colors.orange1}`, 빈 별 기본 `{colors.gray90}`. control 크기 40, readonly 16이다 [src:30].

### slider

4px `{colors.gray95}` 바(radius 2) 위 `{colors.gray30}` 활성 구간, 흰 노브(1 `{colors.gray30}` 테두리, `0px 2px 2px oklch(0.218 0 0 / 0.1)` 그림자), 노브 20·28이다 [src:31].

### floating-button

72×72 `{colors.orange1}` 원형, 13 bold 흰 라벨, 그림자 없음. 24 흰 배지는 2px `{colors.orange1}` 테두리를 두르고 99에서 상한한다 [src:35]. 소비자 웹 홈의 광고 문의 플로팅 버튼은 80×80 원에 `{colors.navy1}`과 enum 밖 순수 검정(`## Colors` 참고) 채움, 12/16 bold 흰 글자로 다르게 그린다 [src:72].

### notification

14 medium `{colors.gray10}` 글자, radius 4, 패딩 12. 배경은 `{colors.gray97}`(테두리 `{colors.gray95}`)·`{colors.orange2}`·`{colors.blue2}`·`{colors.red2}` 중 하나다 [src:36].

### notification-extend

흰 배경+1 `{colors.gray90}` 또는 `{colors.orange2}`+1 `{colors.orange3}`. 제목 18 bold, 본문 16 `{colors.gray50}`, 텍스트 버튼 16 medium `{colors.orange1}` [src:37]. 같은 계열의 NoticeText는 `•` 불릿 목록이고 14는 `{colors.gray50}`, 그 밖의 크기는 `{colors.gray30}`이다 [src:38].

### card-info

`{colors.gray97}` 채움, radius 12, 좌우 20, 제목 22 bold, 부제 13, 보조문 14 `{colors.gray50}`이다 [src:39].

### divider

`linePadding`(좌우 20 들여씀)·`lineFull`·`section` 세 타입. 선은 1px, 섹션은 12px 높이이고 모두 `{colors.gray95}`다 [src:40][src:59].

### loading

`{colors.orange1}` 10px 점 3개가 400ms로 20px 튀며 80·160ms 스태거한다. 캡션 13 `{colors.gray70}`이 2400ms마다 바뀐다 [src:41].

### empty

가운데 정렬, 제목 18 bold `{colors.gray10}`, 부제 14 `{colors.gray30}`이다 [src:42].

### tile

테마 `transparent`·`gray`·`lineGray90`·`lineGray30`·`lineGray10`·`linePrimary`(1.4 `{colors.orange1}`), 정렬 left·center·horizontal, 제목 16 bold / 부제 14 `{colors.gray50}`, 그림자 없음 [src:43].

### thumbnail

radius 4. `full` 타입은 하단 스크림(gray10 잉크 0 → 0.3 → 0.6)과 상단 스크림(0.4 → 0)을 깔고 흰 글자를 쓴다. `half` 타입은 `{colors.gray10}` 글자에 1 `{colors.grayOpacity08}` 테두리다. Parallax 옵션은 폭 1.5배, 4000ms다 [src:44].

### profile

이미지에 1 `{colors.grayOpacity08}` 테두리, 흰 알약 배지(radius 14, 10 bold `{colors.orange1}`)를 얹는다 [src:45].

### bottom-sheet

흰 배경, 상단 두 모서리 radius 12, `{colors.gray80}` 드래그 핸들 34×4(radius 5), 배경막 `overlayColorType` 기본 `{colors.grayOpacity60}`, 350ms 진입이다 [src:46]. BottomSheetView는 기울인 막대 두 개로 핸들을 그린다 [src:47].

### chart

`Chart/시세비교 차트`가 문서화된 1급 컴포넌트다 [src:2]. PriceDateLineChart 예시 높이는 224·232이고, `useCompareChartData`·`useRankChartData` 훅이 서버 데이터를 차트용으로 표준화한다 [src:68][src:69]. 시리즈 색 대응은 `## Colors`에 적었다 [src:54]. StackedBarChart 스토리는 `유사 (30%)` 같은 도메인 라벨을 쓴다 [src:64].

## Do's and Don'ts

**Do** — 강조를 `{colors.orange1}` 한 색에 모은다. CTA 채움, 선택 밑줄, 체크·라디오 선택, 진행 표시가 모두 같은 오렌지이고 나머지는 회색 램프다 [src:8][src:32][src:25][src:26][src:41].

**Do** — 글자와 그림자의 잉크를 `{colors.gray10}`으로 둔다. ZUIX 안에서 순수 검정은 Thumbnail 글자 그림자 한 곳의 예외다 [src:6][src:5][src:44].

**Do** — 모서리를 4에 맞춘다. 알약형은 Chip·Tag·Switch·Profile 배지, 원형은 FloatingButton·배지, 큰 곡률은 BottomSheet 상단과 CardInfo의 12에 그친다 [src:8][src:9][src:12][src:27][src:45][src:35][src:46][src:39].

**Do** — 비활성을 별도 팔레트 색으로 표현한다. 큰 버튼은 `{colors.orange3}` 채움, 작은 버튼은 `{colors.gray97}` + `{colors.gray80}`이다 [src:8].

**Do** — 연한 배경에는 같은 패밀리의 채도색 글자를 짝짓는다(`{colors.orange2}` → `{colors.orange1}`, `{colors.blue2}` → `{colors.blue1}`, `{colors.red2}` → `{colors.red1}`) [src:12][src:36].

**Do** — 가로로 버튼을 나란히 둘 때 주 액션을 오른쪽에 둔다. BottomCTA 가로형은 `lineGray30` 보조 다음에 `"primary"`를 놓는다 [src:15].

**Do** — `{colors.orange1}` 위 흰 글자를 재현할 때는 그것이 기준 미달 조합이라는 것을 전제로 쓴다. 대비는 2.89:1로 본문 글자 기준 4.5:1은 물론 큰 글자 기준 3:1(24px 이상, 또는 18.66px 이상 bold)에도 못 미치며, 크기나 굵기로 보완되지 않는다. ZUIX는 primary 테마의 모든 크기 — 48·44 버튼(16 bold), 40·32 버튼(14 medium), 28·24 버튼(13·12) — 와 FloatingButton(13 bold)에 이 조합을 쓰는데 어느 것도 큰 글자에 들지 않으므로, 이것은 직방의 브랜드 관행이지 접근성 기준을 채운 조합이 아니다 [src:8][src:35]. 기준 충족이 필요한 제품이라면 이 조합을 그대로 가져오지 말고 따로 판단한다.

**Don't** — 대비를 맞추려고 `{colors.orange1}`을 몰래 어둡게 바꾸지 않는다. 흰 바탕 위 오렌지 글자도 같은 2.89:1이므로 색을 뒤집어도 해결되지 않는다. 발행값은 그대로 두고, 본문 글자는 `{colors.gray10}` 잉크로 쓴다. 오렌지 채움 위 흰 글자는 위 Do 의 단서와 함께만 쓴다 [src:8][src:32][src:25].

**Don't** — 버튼·칩·타일·플로팅 버튼에 그림자를 넣지 않는다. 그림자는 툴팁·노브·카드·떠 있는 패널 몫이다 [src:8][src:9][src:43][src:35][src:24].

**Don't** — 소비자 웹의 enum 밖 오렌지들을 토큰으로 승격하지 않는다. 그것들은 하드코딩 관찰값이고 정본은 `{colors.orange1}`이다 [src:77][src:5].

**Don't** — `primary`·`surface` 같은 역할 이름이 발행된 것처럼 쓰지 않는다. ZUIX는 팔레트 enum만 발행했고, 다크 테마도 없다 [src:5][src:70][src:76].

**Don't (도메인 경계)** — 차용할 것은 직방의 시각 처리이지 부동산 도메인 개념이 아니다. 매매·전세·월세 시리즈 색 대응, 시세비교·랭킹 차트, 매물·분양 카드 구성, "No.1 부동산 플랫폼" 같은 카피를 관계없는 제품에 그대로 옮기지 않는다 [src:54][src:2][src:75]. 오렌지 단일 강조와 4px 기하라는 시각 언어만 가져간다.

**Don't (벤더 중립)** — `ZUIX` 워드마크, `@zigbang/zuix2` 패키지명, `zuix2-` 클래스 접두와 `--zb-` 커스텀 프로퍼티 이름을 생성하는 제품의 UI 문구·헤더·제목·라벨·클래스명에 넣지 않는다. 차용할 것은 시각 언어이지 시스템 이름이 아니다.

## Responsive Behavior

**발행된 브레이크포인트 체계는 없다.** 관측된 것은 Storybook 웹 한 가지 뷰포트이고, 스토리 인덱스에 레이아웃·브레이크포인트 항목이 없으며(`Layout/ListView`뿐) 번들에서도 뷰포트별 분기 값은 찾지 못했다 [src:2][src:50]. 발표 자료는 "우리는 반응형이 기본!", "하나의 스크린 코드라면 Theme Provider로!"라고 쓰고 여러 뷰포트의 차이를 보는 디자인 검수 인프라를 언급하지만, 그 값은 현행 번들에서 확인되지 않는다 [src:71]. 대신 오버레이와 배너가 폭 상한을 갖는다.

| 폭 | 지위 | Key Changes |
| --- | --- | --- |
| (no published breakpoint system surfaced) | 번들·문서 어디에도 없음 [src:2] | — |
| 오버레이 상한 | Dialog 외곽 400 / 내용 340(좌우 30), SnackBar 내부 400 [src:21][src:22] | 넓은 화면에서도 모바일 폭으로 가운데 유지 |
| Tooltip | 폭 260, 가로 배치 임계 160 [src:24] | 남는 폭이 임계를 넘을 때만 가로로 배치 |
| SnackBarVertical | minWidth 142 [src:23] | 화면 중앙 고정 |
| Banner | 래퍼 maxWidth 320, 이미지 100%·maxHeight 72, 비율 320/72 [src:14] | 좁은 폭에서는 이미지가 폭을 따라 줄어든다 |
| 1440 소비자 웹 | 콘텐츠 폭 1080, 뉴스 카드 4열 [src:72] | 지도 화면은 헤더 79 + 서브탭 48 = 129 [src:77] |

**터치 타깃.** Button은 24~48(기본 44)이고 [src:8], TopBar·SearchBar·Tab이 52 [src:17][src:18][src:32], Filter 48 [src:11], ChipFilter 줄 60 [src:10], BottomNavigation 68 [src:16], FloatingButton 72×72다 [src:35]. Checkbox·Switch는 `touchPadding` 4로 히트 영역을 넓힌다 [src:25][src:27]. 32 이하 버튼과 24 TabBox는 44×44 권장치에 못 미치므로, 이 시각 치수를 쓰려면 히트 영역을 패딩으로 보완하는 편이 안전하다. TopBar·SearchBar는 `notchPadding`을 높이에 더한다 [src:17][src:18].

**글자 확대.** 플래그를 켜면 최대 1.5배까지 키우고 [src:6], Filter·Badge·BottomNavigation·TopBar·FloatingButton·Selector 라벨은 `allowFontScaling:false`로 고정한다 [src:11][src:13][src:16][src:17][src:35][src:29]. 고정 높이 컨트롤이 확대로 넘치지 않게 하는 선택이다.

## Known Gaps

- **다크 테마가 발행되지 않았다.** 다크 관련 식별자는 Storybook 크롬에만 있다 [src:70][src:76]. 다크 짝은 소비자가 정해야 한다.
- **시맨틱 색 이름과 `primary` 지정이 없다.** enum은 팔레트뿐이고 [src:5], `{colors.orange1}`이 강조라는 것은 컴포넌트 관측에서 나온 판단이다. 이 항목은 `primary` 토큰을 싣지 않았다.
- **이름 붙은 spacing·radius 스케일과 letterSpacing 토큰이 없다.** `## Spacing`·`## Rounded`의 값은 컴포넌트 리터럴의 빈도 관찰이라 frontmatter 맵을 두지 않았고, 자간은 선언 자체가 없다 [src:5][src:2][src:76].
- **브레이크포인트가 없다.** 넓은 화면 대응은 오버레이·배너·툴팁의 폭 상한(Dialog 외곽 400 · 내용 340, SnackBar 400, Banner 320, Tooltip 260)뿐이다 — `## Responsive Behavior` 표 참고 [src:21][src:22][src:14][src:24].
- **토큰화가 제품 전체에 닿지 않는다.** 소비자 웹은 `#FF681B`(`oklch(0.699 0.200 42)`)·`#FA880B`(`oklch(0.738 0.176 57)`) 같은 enum 밖 오렌지를 `{colors.orange1}`(`oklch(0.700 0.202 44)`) 대신 하드코딩하고, 본문 서체도 ZUIX의 Pretendard가 아니라 Spoqa Han Sans다 [src:72][src:77]. ZUIX 값만으로 직방 웹 화면 전체를 재현할 수는 없다.
- **App Store 스크린샷은 수치로 재지 못했다.** 마케팅 프레임 안의 화면이라 구조·색 관계만 볼 수 있다 [src:75]. 발표 자료는 2021년 재게시본이라 현행 번들과 재대조되지 않은 서술이 있다 [src:71].

## References

해시 번들 표시가 붙은 항목은 파일명의 해시가 재배포 때마다 바뀐다. 안정 진입점은 스토리 인덱스 `index.json`[src:2]과 프리뷰 셸 `iframe.html`[src:3]이고, 해시 청크는 그 경로로 다시 찾는다.

1. https://zuix2.zigbang.io/ — ZUIX Storybook 루트. JS 셸이라 렌더해야 읽힌다
2. https://zuix2.zigbang.io/index.json — 안정 진입점. Storybook v5 스토리 인덱스
3. https://zuix2.zigbang.io/iframe.html — 안정 진입점. 프리뷰 셸, Pretendard CSS 링크
4. https://zuix2.zigbang.io/font/pretendard-subset.css — Pretendard 400·500·700 서브셋 @font-face
5. https://zuix2.zigbang.io/assets/style-D3ygbBMf.js — (해시 번들) Color enum · Shadow 유틸 · margin 헬퍼
6. https://zuix2.zigbang.io/assets/Text-zt7S0cae.js — (해시 번들) Text · 크기 스케일 · FontWeight
7. https://zuix2.zigbang.io/assets/TextInput-dlp6bHbr.js — (해시 번들) TextInput
8. https://zuix2.zigbang.io/assets/Button-DG2EuT3B.js — (해시 번들) Button
9. https://zuix2.zigbang.io/assets/Chip-C0xEdpYN.js — (해시 번들) Chip
10. https://zuix2.zigbang.io/assets/ChipFilter-6-O-IRPs.js — (해시 번들) ChipFilter
11. https://zuix2.zigbang.io/assets/Filter-CdrrxEZn.js — (해시 번들) Filter
12. https://zuix2.zigbang.io/assets/Tag-qG0Trz9h.js — (해시 번들) Tag
13. https://zuix2.zigbang.io/assets/Badge-BBYnPbS1.js — (해시 번들) Badge
14. https://zuix2.zigbang.io/assets/Banner-BrL0pv3Z.js — (해시 번들) Banner
15. https://zuix2.zigbang.io/assets/BottomCTA-Cb1stTu4.js — (해시 번들) BottomCTA
16. https://zuix2.zigbang.io/assets/BottomNavigation-CJk3V3EY.js — (해시 번들) BottomNavigation
17. https://zuix2.zigbang.io/assets/TopBar-BnKFIzMs.js — (해시 번들) TopBar
18. https://zuix2.zigbang.io/assets/SearchBar-0qHpqPDa.js — (해시 번들) SearchBar
19. https://zuix2.zigbang.io/assets/TextField-C3Sj1Svl.js — (해시 번들) TextField
20. https://zuix2.zigbang.io/assets/Title-BrUZU_b8.js — (해시 번들) Title
21. https://zuix2.zigbang.io/assets/Dialog-C24yIN5r.js — (해시 번들) Dialog
22. https://zuix2.zigbang.io/assets/SnackBar-BP7Ri8Ps.js — (해시 번들) SnackBar
23. https://zuix2.zigbang.io/assets/SnackBarVertical-f9Sy7k52.js — (해시 번들) SnackBarVertical
24. https://zuix2.zigbang.io/assets/FlatListWithTooltip-BnxWnPjm.js — (해시 번들) Tooltip 구현이 여기 있다
25. https://zuix2.zigbang.io/assets/Checkbox-BGXzLATy.js — (해시 번들) Checkbox
26. https://zuix2.zigbang.io/assets/RadioButton-DJ8CGfVK.js — (해시 번들) RadioButton
27. https://zuix2.zigbang.io/assets/Switch-DoHv0-H_.js — (해시 번들) Switch
28. https://zuix2.zigbang.io/assets/Stepper-CUE23rYX.js — (해시 번들) Stepper
29. https://zuix2.zigbang.io/assets/Selector-DNIB60dt.js — (해시 번들) Selector
30. https://zuix2.zigbang.io/assets/Rating-DrVeAaZ-.js — (해시 번들) Rating
31. https://zuix2.zigbang.io/assets/Slider-BVl-MIag.js — (해시 번들) Slider. Figma `ZUIX-2.0` 링크 포함
32. https://zuix2.zigbang.io/assets/Tab-fgsiRpJz.js — (해시 번들) Tab
33. https://zuix2.zigbang.io/assets/TabBox-BZgt907F.js — (해시 번들) TabBox
34. https://zuix2.zigbang.io/assets/TabFilter-DJO2OVj3.js — (해시 번들) TabFilter
35. https://zuix2.zigbang.io/assets/FloatingButton-DnGKLopr.js — (해시 번들) FloatingButton
36. https://zuix2.zigbang.io/assets/Notification-BLXiVNEI.js — (해시 번들) Notification
37. https://zuix2.zigbang.io/assets/NotificationExtend-C6Y1JfyB.js — (해시 번들) NotificationExtend
38. https://zuix2.zigbang.io/assets/NoticeText-O6PgzV3h.js — (해시 번들) NoticeText
39. https://zuix2.zigbang.io/assets/CardInfo-owjdQ7zY.js — (해시 번들) CardInfo
40. https://zuix2.zigbang.io/assets/Divider-CAbVrrY_.js — (해시 번들) Divider
41. https://zuix2.zigbang.io/assets/Loading-CTua2ljw.js — (해시 번들) Loading
42. https://zuix2.zigbang.io/assets/Empty-DoRDYAA6.js — (해시 번들) Empty
43. https://zuix2.zigbang.io/assets/Tile-BYqAssU-.js — (해시 번들) Tile
44. https://zuix2.zigbang.io/assets/Thumbnail-zQwGHl1z.js — (해시 번들) Thumbnail
45. https://zuix2.zigbang.io/assets/Profile-D4QPwFlP.js — (해시 번들) Profile
46. https://zuix2.zigbang.io/assets/BottomSheet--4UVyIeY.js — (해시 번들) BottomSheet
47. https://zuix2.zigbang.io/assets/BottomSheetView-Cvftk35G.js — (해시 번들) BottomSheetView
48. https://zuix2.zigbang.io/assets/Pressable-pLE3dPfB.js — (해시 번들) Pressable · 누름 피드백
49. https://zuix2.zigbang.io/assets/Icon-rgLE87ym.js — (해시 번들) Icon
50. https://zuix2.zigbang.io/assets/ListView-sdhZ7bRO.js — (해시 번들) ListView
51. https://zuix2.zigbang.io/assets/ListImageItem-DFr46Hg4.js — (해시 번들) ListImageItem
52. https://zuix2.zigbang.io/assets/Gradient-Bta-opbr.js — (해시 번들) Gradient
53. https://zuix2.zigbang.io/assets/index-DTbA6Yh_.js — (해시 번들) Parallax 구현
54. https://zuix2.zigbang.io/assets/index-Zdm1N0KJ.js — (해시 번들) 차트 공용 청크
55. https://zuix2.zigbang.io/assets/Shadow.stories-DvxFt4Ub.js — (해시 번들) Util/Shadow 스토리 · iOS·Android 대응표
56. https://zuix2.zigbang.io/assets/Tag.stories-Dh0bT_Rm.js — (해시 번들) Tag 스토리
57. https://zuix2.zigbang.io/assets/Title.stories-ezz6lToE.js — (해시 번들) Title 스토리
58. https://zuix2.zigbang.io/assets/Switch.stories-DhwPGKP0.js — (해시 번들) Switch 스토리
59. https://zuix2.zigbang.io/assets/Divider.stories-CbpZNvsk.js — (해시 번들) Divider 스토리
60. https://zuix2.zigbang.io/assets/SnackBar.stories-m3Fx6LG3.js — (해시 번들) SnackBar 스토리
61. https://zuix2.zigbang.io/assets/Parallax.stories-DqgC-e8r.js — (해시 번들) Parallax 스토리
62. https://zuix2.zigbang.io/assets/Gradient.stories-DDxbMK-9.js — (해시 번들) Gradient 스토리
63. https://zuix2.zigbang.io/assets/CompareChart.stories-8t76Ncqz.js — (해시 번들) CompareChart 스토리
64. https://zuix2.zigbang.io/assets/StackedBarChart.stories-kec1n3Lb.js — (해시 번들) StackedBarChart 스토리
65. https://zuix2.zigbang.io/assets/dialog-DDWx3_wQ.js — (해시 번들) dialog.mdx
66. https://zuix2.zigbang.io/assets/globalState-oLktznlE.js — (해시 번들) Global Store mdx. 패키지 import 예시
67. https://zuix2.zigbang.io/assets/tooltip-DhaUPyrm.js — (해시 번들) tooltip.mdx
68. https://zuix2.zigbang.io/assets/compareChart-J8sSb_Ht.js — (해시 번들) compareChart.mdx
69. https://zuix2.zigbang.io/assets/rankingChart-CNiieO43.js — (해시 번들) rankingChart.mdx
70. https://zuix2.zigbang.io/assets/iframe-BVtnlT6W.js — (해시 번들) Storybook 프리뷰 런타임. ZUIX 값은 없고 부재 판정의 대조군이다
71. https://www.slideshare.net/slideshow/zuix/250059242 — ZUIX 발표 자료. 업로더는 NAVER Engineering이고 2021년 행사 발표의 재게시이며 직방의 공식 발행물이 아니다
72. https://www.zigbang.com/ — 직방 소비자 웹 홈. JS 렌더 페이지라 렌더해야 읽힌다(curl 은 CloudFront 403)
73. https://s.zigbang.com/favicon.ico — 직방 favicon. 오렌지 둥근 사각 앱 아이콘형
74. https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/27/23/da/2723daf4-106c-f9e2-776b-7822017b2568/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg — App Store 직방 앱 아이콘 artwork(512×512, 실제 형식은 JPEG)
75. https://itunes.apple.com/lookup?id=503098735&country=kr — App Store 조회 API(trackId 고정). trackId 503098735의 앱 이름·판매자와 스토어 스크린샷
76. https://zuix2.zigbang.io/assets/blocks-CPl-Bt24.js — (해시 번들) Storybook docs blocks 런타임. ZUIX 값은 없고 부재 판정의 대조군이다
77. https://www.zigbang.com/home/apt/map — 직방 아파트 지도. JS 렌더 페이지라 렌더해야 읽힌다(curl 은 CloudFront 403)
