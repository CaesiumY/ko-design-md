---
name: 그리팅
design_system_name: Doodlin UI
slug: greeting
category: career
last_updated: "2026-07-26"
created_at: "2026-07-26"
sources:
  - https://doodlincorp.github.io/doodlin-ui/
  - https://www.npmjs.com/package/@doodlincorp/doodlin-ui
  - https://www.greetinghr.com/
  - https://registry.npmjs.org/@doodlincorp/doodlin-ui/latest
  - https://guide.greetinghr.com/ko
  - https://blog.greetinghr.com/greeting/
related_services: ["wanted", "bezier"]
lang: ko
logo: https://getdesign.kr/logos/greeting.svg
---

# 그리팅 — design.md

> 그리팅(Greeting)은 두들린 주식회사가 만드는 채용 관리 SaaS이고 [src:3], 그 디자인 시스템이 **Doodlin UI**(`@doodlincorp/doodlin-ui`)다 [src:4]. 값의 출처는 공개 Storybook 배포본과 npm 레지스트리이며, 아래 수치는 그 두 곳에서 확인된 것만 옮겼다 [src:1][src:4].

## Brand & Style

그리팅은 기업의 채용 담당자가 하루 여덟 시간 붙들고 있는 채용 관리 SaaS이고, 면접 진행 상태를 색 토큰으로 못 박아 도메인을 팔레트 층까지 끌어내린 흰 바탕·헤어라인의 업무 도구다 [src:1][src:3]. 사용자는 소비자가 아니라 기업의 채용 담당자이며 [src:3], 제품은 가이드 카테고리 네비가 1~5로 번호 매겨 열거하는 채용(ATS)·채용 홈페이지(Homepage)·설문(Form)·인재영입(TRM)·분석(Analytics) 다섯 모듈로 나뉜다 [src:5].

**도메인이 토큰 층까지 내려와 있다.** 색 시맨틱에는 `SystemColor`(brand·link·info·success·warning·danger)와 **동급으로** `InterviewColor` 그룹이 선언돼 있다 — `ready` · `request` · `complete` · `changeRequest` [src:1]. 면접 진행 상태를 색으로 코드화한 축이며, 범용 UI 프레임워크에는 존재할 이유가 없는 개념이다. 같은 성격이 컴포넌트 트리에도 있다. 일반 분류(General · DataDisplay · DataEntry · Feedback · Navigation · Utility) 옆에 `ATS/`(`QuestionAnswer` · `Question` · `Answer` · `RecommendationInfo` · `RecommenderInfo`)와 `Forms/FormResponse/`(`Banner` · `Respondent` · `QuestionAndAnswer` · `ArchivedAnswer`)가 1급 카테고리로 서 있고 [src:1], 이 두 이름은 제품 가이드의 모듈명(채용 ATS / 설문 Form)과 그대로 대응한다 [src:5].

시각 언어는 **밀도 높고, 조용하고, 사무적**이다 [src:1]. 흰 바탕에 1px 헤어라인으로 구획을 나누고, 유채색은 브랜드 파랑과 상태색뿐이며, 구조 요소는 전부 무채색 알파 오버레이다 [src:1]. `MenuItem` 32px · `Tabs` 아이템 28px · `Tag` 26px · `Badge` 20px로 실측되는 포인터 입력 밀도이고 [src:1], 그라디언트·텍스처·사진·일러스트는 제품 UI에 한 조각도 없다 [src:1]. 깊이는 4단계 무채색 틴트에서만 오며, 사이드바가 `background1`(검정 2%) 위에 앉는 그 2% 차이가 시각적 분리의 전부다 [src:1]. **마케팅과 제품이 분리돼 있다는 점 자체가 특징이다** — 마케팅 사이트는 진한 파랑 그라디언트와 인물 사진을 쓰지만 [src:3], 제품 UI는 그것을 한 조각도 들여오지 않는다 [src:1].

전체 인상은 "Ant Design의 규율 잡힌 사촌"이다. 램프 _이름_ 체계는 Ant Design v4 계열(`red` `volcano` `orange` `gold` `yellow` `lime` `green` `cyan` `blue` `ultraviolet` `purple` `magenta` — 이 중 `ultraviolet`만 Ant의 `geekblue`를 개명한 것이고 나머지 열한 개는 이름까지 같다)이지만 값은 대부분 다르다 — 12램프 × 10단계 축자 대조에서 29개(24%)만 일치하고 `lime` · `green` · `cyan` · `purple` · `magenta` 다섯 램프는 한 값도 겹치지 않는다 [src:1].

**Voice는 두 층으로 갈린다(관찰 — 공식 톤 가이드 미공개).** 제품 UI 카피는 존댓말 `-습니다` / `-해주세요` 계열이고("공고 내 모든 멤버에게 알립니다.", "알림 제목을 입력해주세요."), 버튼·라벨은 `취소` · `전송` · `동의함` · `실행 취소` 같은 명사형 또는 짧은 동사다 [src:1]. 반면 마케팅 사이트와 블로그는 부드러운 `-요` 체와 권유형을 쓴다("여러 명의 지원자에게 면접 요청 메일을 보낼 수 있어요") [src:3][src:6]. **이 문서의 기준선은 제품 UI 쪽(`-습니다`)이다.** 경고 카피는 한 단어 감탄사를 제목으로 세우고 본문을 존댓말 완성 문장으로 잇는다 — "잠깐!" → "혹시 … 확인해 보셨나요?" [src:1]. 이모지는 소스 전체에서 하나도 나오지 않는다 [src:1].

**시스템의 상태.** 컴포넌트 그룹 60개 / 스토리 123개 / 테마당 색 토큰 265개 / fontSize 37종 / radius 7단계 / 아이콘 316종이고, spacing 축은 0개다 [src:1]. 스타일링 엔진은 styled-components이며 런타임 의존성은 `styled-components` · `@floating-ui/react-dom` · `dayzed` 셋뿐이다 [src:4]. npm 배포는 2022년에 시작해 **0.0.76(2025-03-19)이 마지막**이고 이후 신규 배포가 없다 [src:2][src:4]. 라이선스 필드는 ISC로 선언돼 있으나 tarball에 LICENSE 원문이 없고 소스 저장소도 비공개(404)라 원문 대조 경로가 없다 — 재배포 근거로 삼을 때 이 한계를 병기해야 한다 [src:2][src:4]. 한편 Storybook의 Introduction 스토리는 `thisTheme.color.brand`를 교체 가능한 파라미터로 문서화하고 예시 값으로 cyan400 `oklch(0.758 0.102 191.2)`를 쓴다 [src:1] — "브랜드 언어"보다 "테마 가능한 킷"에 가까운 신호이므로, 위 도메인 근거와 상충하는 관찰로 함께 남긴다.

## Colors

구조는 **Palette(원시) → Semantic(의미 별칭) 2층 + 라이트/다크 거울**이다 [src:1]. 세 가지가 이 시스템의 색 설계를 규정한다.

1. `gray` 램프가 테마별로 완전히 뒤집힌다 — `gray0`은 라이트에서 흰색, 다크에서 검정이다 [src:1].
2. `neutral`은 hex가 아니라 **알파 오버레이**다. 라이트는 검정 알파, 다크는 흰색 알파이며 **알파 값은 양쪽이 동일**하다 [src:1].
3. 그래서 `primary` · `border2` · `background3` 같은 시맨틱 이름이 **양 테마에서 그대로** 동작한다 [src:1]. 실무 귀결은 하나다 — 회색을 하드코딩하지 말고 neutral 파생 시맨틱을 쓴다 [src:1].

아래 토큰 값은 전부 라이트 테마이며, 원본 hex는 트레일링 주석으로 병기했다 [src:1].

### gray — 불투명 무채색 램프 (라이트)

```yaml
gray0: oklch(1.000 0.000 0) # #FFFFFF
gray25: oklch(0.985 0.000 0) # #FAFAFA
gray50: oklch(0.970 0.000 0) # #F5F5F5
gray75: oklch(0.955 0.000 0) # #F0F0F0
gray100: oklch(0.885 0.000 0) # #D9D9D9
gray200: oklch(0.805 0.000 0) # #BFBFBF
gray300: oklch(0.640 0.000 0) # #8C8C8C
gray400: oklch(0.464 0.000 0) # #595959
gray500: oklch(0.383 0.000 0) # #434343
gray600: oklch(0.301 0.000 0) # #2E2E2E
gray700: oklch(0.252 0.000 0) # #222222
gray800: oklch(0.205 0.000 0) # #171717
gray900: oklch(0.000 0.000 0) # #000000
```

### neutral — 알파 오버레이 (라이트)

```yaml
neutral25: oklch(0.000 0.000 0 / 0.02) # 검정 2% 오버레이
neutral50: oklch(0.000 0.000 0 / 0.04) # 검정 4% 오버레이
neutral75: oklch(0.000 0.000 0 / 0.06) # 검정 6% 오버레이
neutral100: oklch(0.000 0.000 0 / 0.11) # 검정 11% 오버레이
neutral200: oklch(0.000 0.000 0 / 0.18) # 검정 18% 오버레이
neutral300: oklch(0.000 0.000 0 / 0.25) # 검정 25% 오버레이
neutral400: oklch(0.000 0.000 0 / 0.45) # 검정 45% 오버레이
neutral500: oklch(0.000 0.000 0 / 0.6) # 검정 60% 오버레이
neutral600: oklch(0.000 0.000 0 / 0.85) # 검정 85% 오버레이
```

다크 테마의 `neutral`은 같은 알파 값을 흰색으로 뒤집은 것이다 — `neutral600`은 다크에서 `oklch(1.000 0.000 0 / 0.85)`다 [src:1].

### blue — 브랜드 램프 (라이트)

```yaml
blue50: oklch(0.974 0.016 227.0) # #ECF9FF
blue100: oklch(0.911 0.053 230.9) # #BFE9FF
blue200: oklch(0.850 0.086 236.2) # #96D7FF
blue300: oklch(0.779 0.124 242.1) # #69C0FF
blue400: oklch(0.714 0.158 247.3) # #40A9FF
blue500: oklch(0.651 0.191 252.8) # #1890FF
blue600: oklch(0.548 0.185 256.3) # #096DD9
blue700: oklch(0.454 0.171 258.4) # #0050B3
blue800: oklch(0.387 0.134 258.8) # #0C408A
blue900: oklch(0.317 0.095 259.4) # #113061
```

브랜드 색은 `blue500`이고 `link`가 `blue600`이다. `Button/Default`의 filled 배경이 `blue500` 값으로 실측된다 [src:1].

### 일반 12색 램프 500 대표값 (라이트)

```yaml
cyan500: oklch(0.675 0.101 195.0) # #35AAAA
gold500: oklch(0.782 0.163 74.8) # #F4A60B
green500: oklch(0.717 0.228 141.5) # #33C41D
lime500: oklch(0.748 0.174 124.7) # #95BF29
magenta500: oklch(0.642 0.177 349.3) # #D7579D
orange500: oklch(0.729 0.160 60.7) # #EE8C23
purple500: oklch(0.553 0.160 300.6) # #8357C0
red500: oklch(0.621 0.238 26.1) # #F5222D
red400: oklch(0.673 0.214 24.5) # #FF4D4F
ultraviolet500: oklch(0.574 0.185 269.2) # #4E6CE4
volcano500: oklch(0.640 0.187 37.8) # #E65727
yellow500: oklch(0.868 0.178 98.0) # #F3D307
```

`blue500`은 위 브랜드 램프 블록에 있다. `red400`을 함께 실은 것은 `danger`와 `changeRequest`가 500이 아니라 400 단계를 참조하기 때문이다 [src:1]. 각 램프는 50/100/200/300/400/500/600/700/800/900 열 단계를 라이트·다크 양쪽으로 갖는다 [src:1].

### murkyBlue — murky 램프 표본 (라이트)

**murky 12색은 일반 12색의 저채도 쌍둥이**이고 태그·라벨 팔레트를 전담한다 — **fill은 100 단계, text는 800 단계** 패턴이다 [src:1]. 아래는 대표로 murkyBlue 전 단계를 실은 것이며, 나머지 11개 램프도 같은 10단계 구조를 갖는다 [src:1].

```yaml
murkyBlue50: oklch(0.956 0.019 248.0) # #E7F2FD
murkyBlue100: oklch(0.919 0.029 244.9) # #D5E7F7
murkyBlue200: oklch(0.861 0.042 245.0) # #BBD5EC
murkyBlue300: oklch(0.799 0.061 246.3) # #9EC2E3
murkyBlue400: oklch(0.740 0.080 247.3) # #82B0DB
murkyBlue500: oklch(0.659 0.096 247.7) # #6097CA
murkyBlue600: oklch(0.588 0.095 248.8) # #4D81B3
murkyBlue700: oklch(0.524 0.089 248.0) # #3D6E9B
murkyBlue800: oklch(0.449 0.074 248.6) # #32587C
murkyBlue900: oklch(0.394 0.064 247.6) # #284967
```

태그 한 쌍은 `murkyBlue100` 배경 + `murkyBlue800` 텍스트다 [src:1].

### murky 12색 램프 500 대표값 (라이트)

```yaml
murkyCyan500: oklch(0.716 0.076 207.7) # #66B1BC
murkyGold500: oklch(0.686 0.067 72.6) # #B4946C
murkyGreen500: oklch(0.705 0.091 155.0) # #70B187
murkyLime500: oklch(0.639 0.081 126.3) # #7F955E
murkyMagenta500: oklch(0.623 0.061 338.0) # #A07994
murkyOrange500: oklch(0.677 0.063 53.1) # #B78D73
murkyPurple500: oklch(0.636 0.092 297.3) # #917FBC
murkyRed500: oklch(0.637 0.076 8.5) # #B47882
murkyUltraviolet500: oklch(0.648 0.079 281.4) # #8689BE
murkyVolcano500: oklch(0.612 0.072 27.2) # #AB736C
murkyYellow500: oklch(0.719 0.093 100.6) # #B1A65F
```

### SystemColor — 브랜드 · 상태 시맨틱

| token     | → palette  | light                      | dark                       |
| --------- | ---------- | -------------------------- | -------------------------- |
| `brand`   | `blue500`  | `oklch(0.651 0.191 252.8)` | `oklch(0.627 0.170 249.0)` |
| `link`    | `blue600`  | `oklch(0.548 0.185 256.3)` | `oklch(0.708 0.142 243.8)` |
| `info`    | `blue500`  | `oklch(0.651 0.191 252.8)` | `oklch(0.627 0.170 249.0)` |
| `success` | `green500` | `oklch(0.717 0.228 141.5)` | `oklch(0.661 0.157 140.5)` |
| `warning` | `gold500`  | `oklch(0.782 0.163 74.8)`  | `oklch(0.739 0.139 82.7)`  |
| `danger`  | `red400`   | `oklch(0.673 0.214 24.5)`  | `oklch(0.610 0.173 21.0)`  |

[src:1]

### InterviewColor — 면접 진행 상태 시맨틱

`SystemColor`와 **동급의 시맨틱 그룹**으로 선언돼 있다. 부록이 아니라 1급 개념이라는 점이 이 시스템의 정체성이다 [src:1].

| token           | → palette   | 의미        | light                     | dark                      |
| --------------- | ----------- | ----------- | ------------------------- | ------------------------- |
| `ready`         | `orange500` | 면접 준비됨 | `oklch(0.729 0.160 60.7)` | `oklch(0.713 0.131 67.4)` |
| `request`       | `gray300`   | 요청됨      | `oklch(0.640 0.000 0)`    | `oklch(0.640 0.000 0)`    |
| `complete`      | `gray200`   | 완료        | `oklch(0.805 0.000 0)`    | `oklch(0.464 0.000 0)`    |
| `changeRequest` | `red400`    | 변경 요청   | `oklch(0.673 0.214 24.5)` | `oklch(0.610 0.173 21.0)` |

`request`(gray300)가 양 테마에서 같은 값이라는 점이 특이하다 — gray300이 반전축의 중심이기 때문이다 [src:1].

### SemanticTheme — 텍스트 · 보더 · 배경 · 이펙트

18개 별칭이 전부 `neutral` 알파 또는 `gray0`을 가리킨다. 값이 알파이므로 라이트/다크에서 같은 이름이 그대로 작동한다 [src:1].

| token                                         | → palette                                                | light (검정 알파)             | dark (흰색 알파)              |
| --------------------------------------------- | -------------------------------------------------------- | ----------------------------- | ----------------------------- |
| `primary`                                     | `neutral600`                                             | `oklch(0.000 0.000 0 / 0.85)` | `oklch(1.000 0.000 0 / 0.85)` |
| `secondary`                                   | `neutral500`                                             | `oklch(0.000 0.000 0 / 0.6)`  | `oklch(1.000 0.000 0 / 0.6)`  |
| `tertiary`                                    | `neutral400`                                             | `oklch(0.000 0.000 0 / 0.45)` | `oklch(1.000 0.000 0 / 0.45)` |
| `disabled`                                    | `neutral300`                                             | `oklch(0.000 0.000 0 / 0.25)` | `oklch(1.000 0.000 0 / 0.25)` |
| `border1`                                     | `neutral75`                                              | `oklch(0.000 0.000 0 / 0.06)` | `oklch(1.000 0.000 0 / 0.06)` |
| `border2`                                     | `neutral100`                                             | `oklch(0.000 0.000 0 / 0.11)` | `oklch(1.000 0.000 0 / 0.11)` |
| `border3`                                     | `neutral200`                                             | `oklch(0.000 0.000 0 / 0.18)` | `oklch(1.000 0.000 0 / 0.18)` |
| `border4`                                     | `neutral400`                                             | `oklch(0.000 0.000 0 / 0.45)` | `oklch(1.000 0.000 0 / 0.45)` |
| `border5`                                     | `neutral500`                                             | `oklch(0.000 0.000 0 / 0.6)`  | `oklch(1.000 0.000 0 / 0.6)`  |
| `background1`                                 | `neutral25`                                              | `oklch(0.000 0.000 0 / 0.02)` | `oklch(1.000 0.000 0 / 0.02)` |
| `background2`                                 | `neutral50`                                              | `oklch(0.000 0.000 0 / 0.04)` | `oklch(1.000 0.000 0 / 0.04)` |
| `background3`                                 | `neutral75`                                              | `oklch(0.000 0.000 0 / 0.06)` | `oklch(1.000 0.000 0 / 0.06)` |
| `background4`                                 | `neutral100`                                             | `oklch(0.000 0.000 0 / 0.11)` | `oklch(1.000 0.000 0 / 0.11)` |
| `effect1` / `effect2` / `effect3` / `effect4` | `neutral75` / `neutral100` / `neutral200` / `neutral300` | 6% / 11% / 18% / 25% 검정     | 6% / 11% / 18% / 25% 흰색     |
| `baseBackground`                              | `gray0`                                                  | `oklch(1.000 0.000 0)`        | `oklch(0.000 0.000 0)`        |

### gray 램프의 거울 구조

| step  | light                  | dark                   |
| ----- | ---------------------- | ---------------------- |
| `0`   | `oklch(1.000 0.000 0)` | `oklch(0.000 0.000 0)` |
| `25`  | `oklch(0.985 0.000 0)` | `oklch(0.205 0.000 0)` |
| `50`  | `oklch(0.970 0.000 0)` | `oklch(0.252 0.000 0)` |
| `75`  | `oklch(0.955 0.000 0)` | `oklch(0.301 0.000 0)` |
| `100` | `oklch(0.885 0.000 0)` | `oklch(0.383 0.000 0)` |
| `200` | `oklch(0.805 0.000 0)` | `oklch(0.464 0.000 0)` |
| `300` | `oklch(0.640 0.000 0)` | `oklch(0.640 0.000 0)` |
| `400` | `oklch(0.464 0.000 0)` | `oklch(0.805 0.000 0)` |
| `500` | `oklch(0.383 0.000 0)` | `oklch(0.885 0.000 0)` |
| `600` | `oklch(0.301 0.000 0)` | `oklch(0.955 0.000 0)` |
| `700` | `oklch(0.252 0.000 0)` | `oklch(0.970 0.000 0)` |
| `800` | `oklch(0.205 0.000 0)` | `oklch(0.985 0.000 0)` |
| `900` | `oklch(0.000 0.000 0)` | `oklch(1.000 0.000 0)` |

[src:1] — 다크 테마는 별도 팔레트가 아니라 **같은 이름의 값 반전**이다. 유채색 램프도 같은 원리로 밝은 단계와 어두운 단계가 자리를 바꾸며, 그 결과 `blue500`은 다크에서 한 단계 어두워진 `oklch(0.627 0.170 249.0)`이 된다 [src:1].

### 색 사용 규칙 (관찰)

- 브랜드 파랑 {colors.brand}는 **1차 액션과 활성 상태 전용**이다. 그 외 용도가 관찰되지 않는다 [src:1].
- 구조 요소(보더·배경·구분선)는 전부 neutral 알파 파생 시맨틱이다 [src:1].
- 색조는 Tag와 상태에만 산다. 태그·라벨은 murky 램프 fill 100 / text 800, 채도 높은 일반 램프는 시맨틱 상태 전용이다 [src:1].
- Toast는 반전 서피스다 — 라이트 기준 배경 {colors.gray600} + 흰 텍스트로 실측된다 [src:1].
- 모달 스크림은 **평면 45% 검정**이며 블러가 없다 [src:1].

## Typography

서체는 **Pretendard 단일**이다. 별도의 디스플레이/브랜드 서체가 없다 — 로고 워드마크 "Greeting"은 로고 이미지 안에만 존재하는 커스텀 레터링이고 배포되는 웹폰트가 아니다 [src:3]. 따라서 `font-display-src`에 넣을 대상이 없고, UI 타입은 전부 Pretendard로 통일된다 [src:1].

```yaml
font-sans: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif
font-weight-regular: 400
font-weight-medium: 600
font-weight-bold: 700
line-height-title: 1.4em
line-height-body: 1.6em
line-height-item: 1.5em
```

Pretendard를 1순위에 두고 `Apple SD Gothic Neo` · `Noto Sans KR` · `Malgun Gothic`을 폴백으로 잇는 **한국어 인지 스택**이다 [src:1].

**핵심 설계는 "픽셀이 아니라 역할을 고른다"** 이다. semantic 스케일이 title / body / item 세 계열로 갈리는데, 같은 픽셀 값을 갖되 **행간이 다르다** — `body5`와 `item5`는 둘 다 16px이지만 배율이 1.6em과 1.5em이다 [src:1]. 아래 line-height는 그 배율을 px로 환산한 값이다.

```yaml
title1: 60 / 84
title2: 40 / 56
title3: 36 / 50.4
title4: 28 / 39.2
title5: 22 / 30.8
title6: 18 / 25.2
title7: 16 / 22.4
title8: 14 / 19.6
body1: 25 / 40
body2: 22 / 35.2
body3: 20 / 32
body4: 18 / 28.8
body5: 16 / 25.6
body6: 14 / 22.4
body7: 12 / 19.2
item1: 25 / 37.5
item2: 22 / 33
item3: 20 / 30
item4: 18 / 27
item5: 16 / 24
item6: 14 / 21
item7: 12 / 18
```

원시 스케일은 따로 있다 — `fontSize50` 11 · `fontSize75` 12 · `fontSize100` 14 · `fontSize200` 16 · `fontSize300` 18 · `fontSize400` 20 · `fontSize500` 22 · `fontSize600` 25 · `fontSize700` 28 · `fontSize800` 32 · `fontSize900` 36 · `fontSize1000` 40 · `fontSize1100` 45 · `fontSize1200` 50 · `fontSize1300` 60 (px) 15종이며, 위 semantic 22종이 그 위에 얹힌다 [src:1].

**weight는 3종뿐이고 `medium`이 600이다** — 일반 관례(500)와 다르니 옮길 때 주의한다 [src:1]. 실측에서 강조 텍스트는 전부 600이었고 700은 컴포넌트 스케일에서 관찰되지 않았다 [src:1]. **letter-spacing 토큰은 존재하지 않고**, 이탤릭도 쓰지 않는다 [src:1].

컴포넌트 실측 타입과 역할 대응은 다음과 같다. 크기·굵기·행간은 실측값이고, 오른쪽 대응은 행간÷크기로 계열을 역산한 것이다 [src:1].

| 컴포넌트         | size / weight / line-height | 대응 역할           |
| ---------------- | --------------------------- | ------------------- |
| Button 라벨      | 18px / 600 / 27px           | {typography.item4}  |
| TextField 입력   | 18px / 400 / 27px           | {typography.item4}  |
| Tag 라벨         | 14px / 400 / 21px           | {typography.item6}  |
| Badge 숫자       | 12px / 400 / 18px           | {typography.item7}  |
| MenuItem 라벨    | 14px / 600 / 22.4px         | {typography.body6}  |
| Callout 제목     | 16px / 600 / 22.4px         | {typography.title7} |
| Callout 본문     | 14px / 400 / 22.4px         | {typography.body6}  |
| Toast 제목(`h2`) | 16px / 600 / 22.4px         | {typography.title7} |
| Toast 본문(`p`)  | 14px / 400 / 22.4px         | {typography.body6}  |
| TextArea 입력    | 14px / 400 / 21px           | {typography.item6}  |

## Spacing

**명명 스페이싱 스케일이 존재하지 않는다.** 이것은 "문서에 없다"가 아니라 "시스템에 없다"로 확인된 항목이다 — npm 패키지의 `dist/constants/` 하위는 `color` · `date-picker` · `keyframes` · `radius` · `shadow` · `theme` · `transition` · `typography` 여덟 개뿐이고 `spacing` 디렉터리가 없으며 [src:2][src:4], 레이아웃 프리미티브 `Flex`는 `gap?: number`로 **raw 픽셀 숫자**를 받는다 [src:1].

따라서 아래는 **관찰된 실사용 값이지 토큰이 아니다.** 값 자체는 그대로 옮겨 쓰되, "8px 그리드" 같은 규정을 이 시스템의 것으로 서술하지 않는다.

| 값                     | 관찰 위치                            |
| ---------------------- | ------------------------------------ |
| `0px 20px`             | Button (filled, large)               |
| `0px 19px`             | Button (outlined, large) — 보더 보정 |
| `0px 16px`             | TextField 라벨 박스                  |
| `0px 8px`              | Tabs 아이템                          |
| `0px 6px`              | Tag                                  |
| `16px 20px`            | Callout                              |
| `12px 48px 12px 12px`  | Toast (오른쪽 48px = 닫기 버튼 자리) |
| `8px 12px 0px` / `8px` | TextArea 입력 영역 / 하단 툴 영역    |
| `16px`                 | Tooltip 래퍼                         |

[src:1] — **19px은 오타가 아니라 의도**다. outlined 버튼의 1px 보더를 상쇄해 filled 버튼과 같은 박스(19+1 = 20)를 차지하게 만든다 [src:1].

gap 관찰값은 `2px`(MenuItem 내부 텍스트) · `4px`(Tag 내부, Tabs 리스트, Toast 텍스트 블록) · `6px`(Tabs 아이템, TextArea 파일 행) · `8px`(Button 아이콘↔라벨, CheckBox/Radio 라벨, TextField 내부, TextArea 툴바) · `12px`(Callout, Toast 루트) · `16px`(Toast 본문 블록)이다 [src:1]. 리듬으로 요약하면 **칩 안 4px → 컨트롤과 라벨 사이 6~~8px → Callout 안 12px → 섹션 패딩 16~~20px**이다 [src:1].

```tsx
// 레이아웃 프리미티브는 명명 토큰이 아니라 raw 픽셀 gap 을 받는다 [src:1]
<Flex gap={8}>{children}</Flex>
```

## Rounded

radius만은 명명 토큰으로 존재한다 — `dist/constants/radius`가 실제 디렉터리이고 [src:2][src:4], 7단계가 선언돼 있다 [src:1].

```yaml
radius0: 0px
radius4: 4px
radius6: 6px
radius8: 8px
radius10: 10px
radius14: 14px
radius20: 20px
```

실측 적용은 다음과 같다 [src:1].

| radius | 컴포넌트                                                        |
| ------ | --------------------------------------------------------------- |
| 4px    | Tag · Toast · Callout · CheckBox · Skeleton · Avatar · TextArea |
| 6px    | Button · TextField · Tabs 아이템                                |
| 10px   | Badge (카운트 배지)                                             |
| 100%   | Radio · Spinner                                                 |

시스템 서술상 8px은 패널·드롭다운, 10px은 모달·카운트 배지이며 이 중 배지 10px은 실측으로 확인됐다(패널·모달 개별 실측은 확보되지 않았다) [src:1]. **{rounded.radius14}와 {rounded.radius20}은 컴포넌트 스케일에서 사실상 미사용**이다 [src:1]. ToggleSwitch만 명명 스케일 밖의 명시값을 쓴다 — 트랙 28px / 노브 24px의 pill 처리다 [src:1].

## Elevation & Depth

**깊이의 1차 언어는 그림자가 아니라 1px 헤어라인이다.** 카드는 {rounded.radius8} + 1px 보더로 정의되며, 그림자는 *떠 있음*을, 보더는 *묶여 있음*을 뜻한다 [src:1]. 규칙선은 {colors.border2}(11%), 입력·outlined 버튼 가장자리는 {colors.border3}(18%)를 쓴다 [src:1].

보더 대신 **inset box-shadow**를 쓰는 자리가 있다 — Avatar와 Radio가 `inset 0 0 0 1px`을 {colors.border3} 값으로 쓰며, 선택 시 레이아웃이 밀리지 않게 하는 장치다 [src:1]. 한쪽 inset 그림자로 규칙선을 만들기도 한다(Tabs 레일 아래 `inset 0 -1px 0`을 {colors.border2} 값으로) [src:1].

떠 있는 표면에만 2단 그림자가 붙는다. **토큰 이름은 공개돼 있지 않다** — `Constants/shadow` 스토리가 텍스트 라벨 없이 시각 스와치만 렌더하므로, 아래 값은 렌더된 DOM의 계산 스타일에서 직접 읽은 것이다 [src:1]. 원문은 rgba이며 카탈로그 정책에 따라 OKLCH로 옮겼다.

```yaml
lifted: 0 1px 2px 0 oklch(0 0 0 / 0.04), 0 2px 6px 0 oklch(0 0 0 / 0.16) # ToggleSwitch 노브 실측
overlay: 0 1px 2px 0 oklch(0 0 0 / 0.04), 0 4px 10px 0 oklch(0 0 0 / 0.05), 0 6px 14px 0 oklch(0 0 0 / 0.16) # Toast 실측(3겹)
```

컬러 그림자·글로우는 없다 [src:1]. 깊이의 나머지는 4단계 무채색 틴트({colors.background1}~{colors.background4})가 담당하며, 사이드바가 {colors.background1}(2%) 위에 앉는 정도의 차이로 층을 나눈다 [src:1].

모션도 같은 절제를 따른다. **이징이 전 시스템에 하나뿐**이다 [src:1].

```yaml
easing: cubic-bezier(0.31, 0.27, 0.15, 0.99)
duration-fast: 0.1s # Button · TextField · CheckBox · Radio · Tabs 아이템 · MenuItem
duration-base: 0.15s # ToggleSwitch 노브
duration-slow: 0.3s # ToggleSwitch 트랙
duration-toast: 0.2s # Toast transform / opacity
```

바운스·스케일·스프링은 없다. 다만 **공식 모션 명세 문서는 공개돼 있지 않고 위는 전부 실측**이다 [src:1].

## Shapes

기하학적이되 부드러움이 최소인 언어다. 실무 radius 범위는 4/6/8/10이고 그 위(14·20)는 컴포넌트 스케일에서 쓰이지 않는다 [src:1]. 완전한 원은 Radio와 Spinner에만, pill은 ToggleSwitch 트랙에만 나타난다 [src:1]. **Avatar가 원형이 아니라 {rounded.radius4} 사각형**이라는 점이 이 시스템의 실루엣을 요약한다 — 사람 얼굴조차 데이터 셀처럼 다룬다 [src:1].

표면은 평면 채움과 1px 헤어라인뿐이다. 그라디언트·텍스처·사진·일러스트가 제품 UI에 하나도 없고 [src:1], 마케팅 사이트의 파랑 그라디언트와 인물 사진은 제품 경계를 넘어오지 않는다 [src:1][src:3].

아이콘은 `Icon` 단일 컴포넌트가 316종을 감싸는 구조이고, 이름이 **합성형 `<meaning><variant><direction>`**이다 — `arrowChevronDefaultBottom` · `arrowSolidDoubleLeft` · `lockBorderUnlock` 식이다 [src:1]. 대부분 개념이 Border(외곽선)/Solid(채움) 쌍을 갖고(`mailBorder`/`mailSolid`), 액션 쌍은 한 접두사 아래 묶인다(`archiveArchive`/`archiveUnarchive`, `pinDefault`/`pinUnpin`) [src:1]. **도메인 밀도가 이례적으로 높다** — `codingTest` · `competencyTest` · `careerSite` · `preQuestion` · `shakeHands`, `InterviewColor` 축과 대응하는 캘린더 상태(`calendarRequest` · `calendarChangeRequest` · `calendarScheduled` · `calendarFinish`), 한국 채용 플랫폼 연동 마크(`interworkJobplanet` · `interworkProgrammers` · `interworkShiftee` · `interworkCatch` · `interworkOrp`), 채용 사이트 빌더용 블록 글리프(`blockBanner` · `blockCarousel` · `blockYoutube` · `blockOpeningList`)가 세트 안에 있다 [src:1]. 사용 크기는 버튼·태그·입력·메뉴 행 안 16px, 단독 또는 Callout/Toast 선두 20px, 56px 버튼 안 24px이며 색은 기본 `currentColor`로 텍스트를 상속한다 [src:1].

> **글리프 도형은 공개돼 있지 않다.** 공개 Storybook은 아이콘 **이름만** 렌더하고 SVG path를 노출하지 않으며 소스 저장소는 비공개다 [src:1]. 이 문서가 인용하는 것은 이름 체계와 도메인 목록이지 형태가 아니다.

이모지는 쓰지 않으며, 아이콘이 아닌 유일한 글리프는 필수 표시 `*`다 [src:1].

## Components

컴포넌트 그룹 60개 / 스토리 123개다 [src:1]. **prop 표(addon-docs)가 공개돼 있지 않으므로**(`&viewMode=docs`가 빈 화면을 반환한다) 아래 스니펫은 prop 시그니처가 아니라 실측된 시각 명세를 옮긴 형태다. prop 명세가 필요하면 npm 패키지의 `dist/**/*.d.ts`를 봐야 한다 [src:1][src:2][src:4].

### button-filled

1차 액션. large 사이즈가 height 56px로 실측되고, {colors.brand} 채움, {rounded.radius6}, padding `0 20px`, 라벨 {typography.item4} / weight 600, 아이콘↔라벨 gap 8px, 내부 아이콘 24px이다 [src:1]. 트랜지션은 0.1s + 단일 이징이다 [src:1]. 채움 위 라벨 색은 실측 대상에 잡히지 않았다 — 공개 소스에서 밝은 잉크가 확인된 표면은 {component.toast}뿐이므로, 재현할 때는 색을 추정하지 말고 컬러 표면 위 전경 토큰을 쓴다.

```tsx
// prop 시그니처는 미공개다 — 아래 주석은 실측된 시각 명세다 [src:1]
// height 56px · radius {rounded.radius6} · padding 0 20px
// fill {colors.brand} · label {typography.item4} / weight 600
<Button>전송</Button>
```

### button-outlined

같은 박스를 유지하되 채움 대신 1px {colors.border3} 헤어라인을 쓴다. padding이 `0 19px`인 것은 보더 1px를 상쇄해 {component.button-filled}와 동일한 외곽 박스를 만들기 위함이다 [src:1].

### button-states

상태 처리는 시스템 전역 규칙이고 버튼이 그 대표다 [src:1].

- **hover** — 채워진 서피스는 약간 어두워지고, 투명 서피스는 {colors.background2}를 얻는다. opacity는 쓰지 않는다.
- **press** — 더 어두워질 뿐 축소·그림자 변화·transform이 없다.
- **focus** — 헤어라인이 {colors.brand} 색으로 교체된다. 외곽 링·글로우가 없다.
- **disabled** — {colors.background3} 채움 + {colors.disabled}(25%) 텍스트. 박스 크기는 유지된다.

### text-field

height 56px, {rounded.radius6}, 1px {colors.border3} 보더, 입력 텍스트 {typography.item4}, 라벨 박스 padding `0 16px`, 내부 gap 8px로 실측된다 [src:1]. `Prefix` / `Suffix` 스토리를 갖는다 [src:1].

### text-area

스토리가 7개(`Default` / `Text Only` / `With Max Length` / `With Button` / `With Button And Length` / `With Tools` / `With Tools And Length`)로 가장 많은 조합을 갖는 컴포넌트다 — **첨부 + 글자수 + 액션 버튼을 한 박스에 담는 커뮤니케이션 입력**이 이 제품의 핵심 화면임을 시사한다 [src:1]. 루트 {rounded.radius4}, 1px {colors.border3} 보더, 입력 영역 padding `8px 12px 0px`, 하단 툴 영역 padding 8px에 gap 8px이며, 파일 행 보더만 {colors.border2}로 한 단계 옅다 [src:1]. `TextArea/FileBox`가 파일 첨부를 인라인으로 붙인다 [src:1].

### tag

height 26px, {rounded.radius4}, padding `0 6px`, gap 4px, 라벨 {typography.item6}. 기본 배경은 {colors.background3}(6%)이고 보더는 `1px solid transparent`로 자리만 잡아 둔다 — 색 태그로 바뀌어도 박스가 흔들리지 않게 하는 장치다 [src:1]. 색 태그는 murky 램프 fill 100 / text 800 조합이며, 컴포넌트에서 `bgColor="murkyBlue100"` 형태로 직접 참조된다 [src:1].

```tsx
// murky 램프는 fill 100 / text 800 쌍으로 쓴다 [src:1]
<Tag bgColor="murkyBlue100">면접 일정</Tag>
```

### badge

카운트 배지. height 20px, {rounded.radius10}, 숫자 {typography.item7}, 배경은 {colors.danger}(= `red400`)로 실측된다 [src:1].

### status-dot

**`InterviewColor` 축을 화면에 실어 나르는 프리미티브**다. 6px 원으로 실측되고 색은 `gray200`(= {colors.complete})이었다 [src:1]. 이 시스템에서 상태는 문장이 아니라 점 하나로 먼저 전달된다.

### avatar

{rounded.radius4} 사각형이며 원형이 아니다. 보더 대신 `inset 0 0 0 1px`을 {colors.border3} 값으로 써서 강조 시 레이아웃이 밀리지 않는다 [src:1].

### callout

{colors.background2}(4%) 채움, {rounded.radius4}, padding `16px 20px`, gap 12px, **보더 없음**으로 실측된다 [src:1]. 부드럽게 채운 블록은 보더를 쓰지 않는다는 규칙이 여기서 드러난다. 제목 {typography.title7} / 본문 {typography.body6}이다 [src:1].

### callout-inline

같은 피드백을 흐름 안에 박아 넣는 짝이다. 이 시스템은 **떠 있는 버전과 인라인 버전을 쌍으로 두는 것**이 원칙이다 [src:1].

### toast

반전 서피스다 — 라이트 기준 배경 {colors.gray600} + 흰 텍스트, {rounded.radius4}, padding `12px 48px 12px 12px`(오른쪽 48px은 닫기 버튼 자리), 루트 gap 12px, 3겹 오버레이 그림자, 진입 트랜지션 0.2s [src:1]. 제목은 `h2` {typography.title7}, 본문은 `p` {typography.body6}로 실측된다 [src:1].

### toast-inline

Toast의 인라인 쌍이며 `ToastInline/UndoButton`(실행 취소)이 붙는다 [src:1].

### modal-confirm

파괴적 액션 확인 전용이고 `Use Confirm` 스토리를 따로 갖는다 [src:1]. 카피 패턴이 특징적이다 — "잠깐!" 한 단어 제목 뒤에 "혹시 … 확인해 보셨나요?" 같은 존댓말 완성 문장이 온다 [src:1]. 스크림은 평면 45% 검정이며 블러가 없다 [src:1].

### template

앱 셸이다. **232px 고정 사이드바 + 56px sticky 헤더 + 스크롤 메인** 구조이고, 중앙 정렬 max-width 컬럼이 없다 — 밀도 높은 데이터 뷰라 콘텐츠가 거터 안에서 좌측 정렬·전폭을 쓴다 [src:1]. 대량 액션 바는 스크롤 컨테이너 하단에 고정된다 [src:1]. 사이드바는 {colors.background1}(2%) 위에 앉아 본문과 갈린다 [src:1].

### tabs

아이템 height 28px, {rounded.radius6}, padding `0 8px`, 리스트 gap 4px, 아이템 gap 6px이며 레일 아래 규칙선은 한쪽 inset 그림자로 만든다 [src:1]. `Width Scroll` 스토리가 좁은 폭에서의 가로 스크롤 대응을 보여 준다 [src:1].

### tabs-rail

`Tabs`/`TabItem`과 **별개의 두 번째 탭 계열**이다(`TabsRail` / `TabRailItem`). 레일형 세로 축 내비게이션을 담당한다 [src:1].

### menu-item

height 32px, 라벨 {typography.body6}, 내부 padding `0px 16px 0px 0px` / `0px 0px 0px 4px` / `0px 0px 0px 2px`, 텍스트 gap 2px로 실측된다 [src:1]. 이 32px이 이 시스템의 밀도 기준선이다.

### floating-box

`Usage` 스토리를 3개(`Usage`, `Usage 2`, `Usage 3`) 가진 플로팅 패널 프리미티브다 — 스토리 수로 보면 시스템에서 가장 많이 조합되는 오버레이 축이다 [src:1]. 시스템의 팝오버 배치는 Floating UI가 담당한다 [src:4].

### overlay

스크림 컴포넌트. 평면 45% 검정이며 블러가 없다 [src:1].

### toggle-switch

명명 radius 스케일 밖의 유일한 컴포넌트다 — 트랙 28px / 노브 24px pill이며, 노브에 위 `lifted` 2겹 그림자가 붙는다 [src:1]. 노브 0.15s / 트랙 0.3s로 듀레이션이 갈리는 것도 여기뿐이다 [src:1].

### ats-question-answer

**여기서만 볼 수 있는 컴포넌트다.** 지원자의 질문–답변 쌍을 표시하며 `Question` · `Answer`가 함께 있다 [src:1]. "지원자 답변을 어떻게 보여줄 것인가"를 컴포넌트 층에서 규정한 결과물이다.

### ats-recommendation-info

추천인 정보 블록이고 `RecommenderInfo`가 짝을 이룬다. 데모 문자열에 `경영지원팀` 같은 사내 조직명이 등장한다 [src:1].

### forms-form-response

설문 응답 화면 루트이며 제품의 설문(Form) 모듈과 대응한다 [src:1][src:5]. 하위에 `Respondent`(응답자 정보) · `QuestionAndAnswer`(문항–응답 쌍) · `ArchivedAnswer`(보관된 응답) · `Banner`가 있다 [src:1].

이 밖에 `NumberField` · `InputField`(+`Select`) · `InputTextArea` · `MultiSelect` · `CheckBox`(16px) · `Radio`(16px, 원형) · `RadioBox`(박스형) · `Table`(`With Fixed` 고정 컬럼) · `Tooltip`(래퍼 padding 16px) · `Skeleton` · `Divider` · `Spinner` · `Dropdown`/`DropdownItem`이 같은 토큰 위에서 동작한다 [src:1].

## Do's and Don'ts

**Do**

- 회색이 필요하면 neutral 파생 시맨틱({colors.border1}~~{colors.border5}, {colors.background1}~~{colors.background4}, {colors.primary}~{colors.disabled})을 쓴다. 알파 오버레이라서 라이트/다크에서 같은 이름이 그대로 작동한다 [src:1].
- 강조는 {colors.brand} 하나로 수렴시킨다 — 1차 액션과 활성 상태 전용이다 [src:1].
- 태그·라벨 팔레트는 murky 램프 fill 100 / text 800 쌍으로 만든다 [src:1].
- 진행 상태가 필요한 제품이라면 색 이름이 아니라 **도메인 이름을 가진 시맨틱 그룹**을 따로 선언하는 방식을 차용한다 — 이 시스템이 {colors.ready}·{colors.request}·{colors.complete}·{colors.changeRequest}를 `SystemColor`와 동급으로 둔 것이 그 사례다 [src:1].
- 카드·패널의 분리는 그림자가 아니라 1px {colors.border2}·{colors.border3} 헤어라인으로 한다 [src:1].
- 타입은 픽셀이 아니라 역할로 고른다 — 제목은 title(1.4em), 읽기 문장은 body(1.6em), 컨트롤 라벨은 item(1.5em) 계열이다 [src:1].
- 강조 굵기는 600을 쓴다. 이 시스템에서 `medium`이 600이다 [src:1].
- 모션은 단일 이징 `cubic-bezier(0.31, 0.27, 0.15, 0.99)`와 0.1s / 0.15s / 0.3s 세 듀레이션 안에서 해결한다 [src:1].
- 제품 UI 카피는 존댓말 `-습니다` / `-해주세요` 계열로, 버튼은 `취소` · `전송` · `실행 취소` 같은 명사형 또는 짧은 동사로 쓴다(관찰 — 공식 톤 가이드 미공개) [src:1].
- 날짜·시각 표기는 `2023. 08. 31` · `1월 12일 (목)` · `오전 9:00 ~ 오전 10:00`, 카운터는 `0/ 50` 형태로 관찰된다 [src:1].

**Don't**

- 회색을 하드코딩하지 않는다. 이 시스템의 제1 규칙이며, 하드코딩하는 순간 다크 테마에서 반전이 깨진다 [src:1].
- 채도 높은 일반 램프를 태그·라벨 배경으로 쓰지 않는다 — 그쪽은 시맨틱 상태 전용이고 라벨 팔레트는 murky다 [src:1].
- 카드를 그림자로 띄우지 않는다. 그림자는 Toast·ToggleSwitch 노브처럼 실제로 떠 있는 것에만 붙는다 [src:1].
- {rounded.radius14}·{rounded.radius20}을 컴포넌트에 쓰지 않는다 — 선언은 돼 있으나 컴포넌트 스케일에서 사실상 미사용이다 [src:1].
- hover에 opacity를, press에 축소·transform을, focus에 외곽 링·글로우를 쓰지 않는다 — 전부 이 시스템에 없는 어휘다 [src:1].
- 이모지를 쓰지 않는다. 소스 전체에서 단 하나도 나오지 않는다 [src:1].
- 마케팅 사이트의 그라디언트·인물 사진을 제품 UI로 들여오지 않는다. 그 분리 자체가 이 시스템의 성격이다 [src:1][src:3].
- 마케팅의 `-요` 체를 제품 UI에 섞지 않는다. 관찰된 제품 카피는 `-습니다` 계열이다 [src:1][src:3][src:6].
- 아이콘 **글리프의 형태**를 두들린의 것으로 재현하거나 서술하지 않는다 — 공개된 것은 316종의 **이름 체계**뿐이고 SVG path는 비공개다 [src:1].
- **(도메인 경계)** 그리팅의 채용 도메인 개념 — 지원자 파이프라인과 공고 단위 열람 권한, 면접 일정 조율 흐름, 지원서 보관 규칙, 추천인 정보 블록, `공고`·`지원자`·`지원서`·`면접 일정` 같은 도메인 카피, 그리고 `InterviewColor` 상태 축의 의미 자체 — 를 그대로 가져오지 않는다. 차용할 것은 밀도 높은 무채색 표면, 알파 오버레이 시맨틱, 헤어라인 구획, 단일 파랑 액센트라는 **시각 처리**이지 채용 SaaS의 제품 개념이 아니다.
- **(벤더 중립)** `Doodlin UI` / `두들린` 워드마크, `@doodlincorp/doodlin-ui` 패키지명, `dist/constants/*` 같은 내부 경로 이름을 생성하는 제품 UI의 카피·헤더·타이틀·라벨·클래스명에 넣지 않는다 — 차용할 것은 시각 언어이지 시스템 이름이 아니다.

## Responsive Behavior

**공개된 브레이크포인트 값이 없다.** `Constants/*` 스토리는 `color` · `radius` · `shadow` · `typography`뿐이고 breakpoint 축 자체가 스토리로 존재하지 않으며 [src:1], npm `dist/constants/` 여덟 디렉터리에도 breakpoint 항목이 없다 [src:2][src:4]. 관측된 뷰포트도 하나뿐이다 — 컴포넌트 계산 스타일은 전부 1280×900 데스크톱 렌더에서 측정됐다 [src:1]. 따라서 모바일 레이아웃에 대한 주장은 하지 않는다.

| 구간        | 값                                                              | Key Changes                                                                                                            |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 전 구간     | (no published breakpoint system surfaced) [src:1][src:2][src:4] | 공개 소스에서 미디어쿼리 collapse 패턴이 관찰되지 않았다 — 관찰된 좁은 폭 대응은 가로 스크롤과 컬럼 고정뿐이다 [src:1] |
| 관측 뷰포트 | 1280×900 (실측 렌더 폭) [src:1]                                 | {component.template} 셸 = 232px 고정 사이드바 + 56px sticky 헤더 + 스크롤 메인, 중앙 정렬 max-width 컬럼 없음 [src:1]  |
| 모바일      | (공개 규격 없음) [src:5]                                        | 모바일 안내 문서는 존재하나 로그인·지원자 열람 절차를 다루는 사용자 가이드이고 레이아웃 규격이 없다 [src:5]           |

### Collapsing Strategy

- 오버플로는 **가로 스크롤 + 컬럼 고정**으로 처리한다 — `Tabs`의 `Width Scroll` 스토리와 `Table`의 `With Fixed`(고정 컬럼) 스토리가 그 어포던스다 [src:1].
- {component.template}은 사이드바 폭이 고정이므로 좁은 폭에서 메인 컬럼만 좁아진다. 사이드바 접힘 상태는 공개돼 있지 않다 [src:1].
- 대량 액션 바는 스크롤 컨테이너 하단에 고정되어 폭과 무관하게 자리를 지킨다 [src:1].

### Touch Targets

실측 높이는 Button(large) 56px · TextField 56px · Table 헤더 행 40px · {component.menu-item} 32px · Tabs 아이템 28px · {component.tag} 26px · {component.badge} 20px · CheckBox/Radio 16px이다 [src:1]. **56px 두 컨트롤을 빼면 대부분 권장 터치 타깃(44×44px) 아래**이며, 이는 데스크톱 브라우저를 1급 환경으로 상정한 밀도로 읽힌다 [src:1]. 터치 환경으로 옮길 때는 이 밀도를 그대로 쓰지 말고 히트 영역을 별도로 키워야 한다.

### Image Behavior

이미지 규칙이 존재하지 않는다 — 제품 UI에 사진·일러스트·그라디언트가 없다 [src:1]. 사람을 표현하는 유일한 표면은 {component.avatar}이고, {rounded.radius4} 박스에 보더 대신 inset box-shadow로 테두리를 그려 선택 상태가 레이아웃을 밀지 않게 한다 [src:1]. 크롭·비율 정책은 공개 소스에 서술돼 있지 않으므로 재현 시 임의로 규정하지 말 것.

## Known Gaps

- **spacing 명명 스케일이 없다.** `dist/constants/`에 spacing 디렉터리가 없고 [src:2][src:4] `Flex`가 raw 픽셀 gap을 받으므로 [src:1], 이 문서의 간격은 전부 관찰값이지 토큰이 아니다.
- **그림자 토큰 이름이 미공개다.** `Constants/shadow` 스토리가 라벨 없이 스와치만 렌더해 이름↔값 대응이 없고, 값은 계산 스타일 실측이다 [src:1].
- **prop 명세·사용 가이드·접근성 가이드가 없다.** addon-docs가 비어 있고 `Usage` 스토리 20개도 전부 인터랙티브 데모라 "언제 무엇을 쓰라"는 서술 규칙이 없다 [src:1]. Button도 large(56px)만 실측됐고 그보다 작은 사이즈 규격은 확인되지 않았다 [src:1].
- **아이콘 글리프 도형이 비공개다.** 316종의 이름과 도메인 목록만 공개돼 있다 [src:1].
- **배포·라이선스 상태가 멈춰 있다.** npm 최종 배포는 0.0.76(2025-03-19)이고 [src:2][src:4], 라이선스는 ISC로 선언돼 있으나 tarball에 LICENSE 원문이 없으며 소스 저장소는 비공개(404)다 [src:2][src:4].

## References

1. https://doodlincorp.github.io/doodlin-ui/ — 공개 Storybook(Storybook 6.x, GitHub Pages). 색·타이포·radius·shadow·모션 토큰 값, 컴포넌트 60그룹/123스토리 인벤토리, 계산 스타일 실측, 아이콘 316종 이름, UI 카피 문자열의 출처
2. https://www.npmjs.com/package/@doodlincorp/doodlin-ui — npm 패키지 페이지(v0.0.76 · ISC 선언 · 최종 배포 2025-03-19 · `dist/constants/` 8개 디렉터리 구성)
3. https://www.greetinghr.com/ — 그리팅 제품·마케팅 사이트(대상 사용자·모듈 구성·마케팅 그라디언트와 인물 사진·래스터 로고)
4. https://registry.npmjs.org/@doodlincorp/doodlin-ui/latest — npm 레지스트리 JSON(버전 · license 필드 · 엔트리 · 의존성 styled-components/@floating-ui/dayzed · repository 필드)
5. https://guide.greetinghr.com/ko — 그리팅 공식 제품 가이드(카테고리 네비가 1️⃣ 채용 ATS / 2️⃣ 채용 홈페이지 Homepage / 3️⃣ 설문 Form / 4️⃣ 인재영입 TRM / 5️⃣ 분석 Analytics 다섯 모듈을 번호로 열거, 모바일 안내 문서는 사용자 절차 가이드)
6. https://blog.greetinghr.com/greeting/ — 그리팅 공식 블로그(마케팅 `-요` 체 카피의 출처)
