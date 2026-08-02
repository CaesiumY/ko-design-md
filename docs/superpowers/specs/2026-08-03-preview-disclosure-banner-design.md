# 브랜드 자산 리스크 정정 — 묶음 D: 프리뷰 고지 스트립 + 더미 데이터 캡션

- 날짜: 2026-08-03
- 선행: PR #206(묶음 A·B), PR #209(seed-design 범위 명시)
- 이 PR(D-1): 프리뷰 34개 전수 고지 + 허구 데이터 라벨 9곳 + 검증기 룰(warn)
- 후속(D-2): 스킬 3개 파일 + 계약 테스트 + block 승격 — **사전 합의 이슈 필요**

## 배경

k-skill/블루리본 사건 조사에서 출발한 상표·저작권 감사가 7개 묶음(A~H)을 만들었고
A·B가 착지했다. 묶음 D는 **프리뷰 안에 고지를 넣고, 허구 데이터에 캡션을 다는** 일이다.

착수 시점의 상태: 원티드 프리뷰가 실명 브랜드(토스·당근)에 허구 채용보상금을,
지마켓이 나이키·소니·스타벅스에 허구 가격과 `공식` 배지를, 토스가 삼성전자·SK하이닉스에
허구 주가를, 교보문고가 실재 도서(룰루 밀러 『물고기는 존재하지 않는다』, 곰출판)에
허구 판매가와 `베스트`·`바로드림` 배지를 **고지 없이 라이브로** 띄우고 있었다.
17개 항목 중 10개는 어떤 고지도 없었다.

## 확정된 법리 (재논의 금지)

이 절은 다음 사람이 같은 결론을 다시 도출하지 않게 하려고 남긴다.

- **형법 제313조(신용훼손)·제314조(업무방해)·제307조 제2항(허위사실 명예훼손)은 공통으로
  「허위의 사실」을 요건으로 한다.** 명확한 "더미 데이터" 표기가 이 요건을 깬다 — 표시된
  수치가 사실 주장이 아님을 화면이 스스로 말하기 때문이다.
- **부정경쟁방지법 제2조 제1호 나목(영업주체 혼동)은 ①주지 표지 ②동일·유사 사용
  ③혼동을 요건으로 한다.** 데이터 고지는 이 셋 중 아무것도 건드리지 않는다. 나목을
  겨냥하는 문장은 **비제휴 선언**이며, 그래서 배너는 비제휴로 시작한다.
- 두 축이 서로를 대체하지 못하므로 배너는 **두 문장**이고, 검증기도 **따로** 검사한다.

## 확정된 결정 (재논의 금지)

- **프리뷰에 표시되는 데이터는 제거·익명화하지 않는다.** 더미데이터 명시로 처리한다
  (2026-08-02 사용자 결정). 허구 수치를 지우거나 브랜드명을 바꾸는 제안을 하지 말 것.
- **지마켓 `공식` 배지는 유지하고 캡션이 명시적으로 언급한다.**
- **KRDS `gov-strip` 은 D 에서 좁게 처리한다.** D 가 모순을 만들므로 D 가 닫는다.
  KRDS 원문 문자열은 건드리지 않아 묶음 E 의 판단을 선점하지 않는다.
- **seed-design 은 리뉴얼 준비 중이므로 묶음 C~H 전체의 범위 밖이다** (PR #209).
  이 PR 이 seed-design 프리뷰를 건드리는 부분은 **배너 1줄뿐**이며, 그건 34개 파일
  전수 삽입의 일부다. 산문·자산·캡션은 손대지 않았다.

## 확정된 사실 (실측)

- **런타임 주입은 불가능하다.** `public/preview/_runtime/iframe.js:15` 가
  `if (window.parent === window) return`. 단독 접근·스크린샷·CC BY 재배포 사본은
  런타임을 아예 실행하지 않는다 → **각 파일의 정적 마크업**이어야 한다.
- **사이트 chrome 은 단독 접근에 닿지 않는다.** 기존 "비공식" 문구
  (`src/routes/services/-copy.ts` 의 `unofficialNotice`)는 상세페이지 사이드바,
  즉 iframe **밖**이다.
- **`<body>` 가 유일하게 신뢰할 수 있는 앵커.** 34개 파일 전부 `^\s*<body>$` 정확히 1개,
  `<body class=…>` 없음. 첫 자식은 제각각이다. 런타임 `<link>`/`<script>` 줄은 텍스트로
  동일하지 않다(들여쓰기 2종·self-closing·codeit/wanted 는 중간에 폰트 link, yeogi 는
  preload 블록) — 앵커로 쓰면 안 된다.
- **17개 중 13개가 자기 `<style>` 에서 `--muted-foreground` 를 재정의**하고, 11개가
  `--border`/`--background`/`--foreground` 를 재정의한다. 프리뷰 `<style>` 이
  tokens.css `<link>` 보다 뒤라 이긴다 → **전용 토큰이 필수다.**
- 용량 상한은 `BLOCK_BYTES = 131072` / `WARN_BYTES = 102400`
  (`src/lib/preview-validator.ts`). 가장 빡빡한 파일은 `greeting/dark.html`.
- 검증기는 **raw 문자열 정규식만** 쓴다(DOM 파서 없음). 룰은 레지스트리가 아니라
  `checkFile()` 안의 명령형 `if → issues.push()`.
- **프리뷰 HTML 에 prettier 금지** — 마크업이 펼쳐져 ~175 KB 로 불어나 캡을 넘는다.
  `format:check` 범위는 `**/*.{ts,tsx,js,jsx}` 뿐이라 CI 는 안 건드리지만
  로컬 `pnpm format` 은 위험하다.

## 설계

### D-1a. 배너 — `<body>` 최상단, 한 곳

34개 파일 전부에 `<body>` 다음 줄로 **무들여쓰기 1줄**(374 B) 삽입:

```html
<div class="catalog-disclaimer" role="note"><b>ko/design.md 카탈로그 프리뷰</b> — 이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다. 이 화면은 공식 배포본이 아닌 공개 자료 기반 비공식 재현이며, 표시된 상품·가격·평점·거래·채용 정보는 레이아웃 시연용 더미 데이터입니다.</div>
```

**상단만인 이유:** 단독 접근에서 첫 화면에 보이고, 히어로 스크린샷(가장 흔한 크롭)에
포함된다. 하단은 둘 다 실패한다. 상하 양쪽은 바이트를 두 번 물면서 10개 브랜드의 자체
푸터 바로 아래에 무채색 띠를 하나 더 만들어 버그처럼 읽힌다.

**1문장은 `src/components/site/footer.tsx` 의 문장을 그대로 재사용한다** —
`src/lib/license-notice-consistency.test.ts:63` 이 고정한 리터럴 `제휴·후원 관계가 없습니다`.
두 표면이 갈라지지 않게 하려는 것이다.

**브랜드명은 보간하지 않는다.** ⓐ 게이트가 단일 리터럴로 끝난다 ⓑ 고지 안에서 표지를
한 번 더 쓰는 건 나목상 역행이다 ⓒ `<title>{Brand} preview` 와 히어로 락업이 한 화면
안에 있어 모호하지 않다.

### D-1b. 스타일 — 전부 `_runtime/tokens.css`

34개 파일의 CSS 바이트는 **0**. `tokens.css` 는 이미 `.text-display`·`.text-meta-caps`·
`.hangul-idx`·`.hairline` 을 호스팅하는 파일이라 관례에도 맞다.

`:root` 와 `[data-theme="dark"]` 양쪽에 **전용 토큰** `--catalog-note-fg/-line/-bg` 추가.
공용 토큰을 쓰면 13개 항목에서 배너가 브랜드 색조를 띤다.

`.catalog-dummy` 는 flow/flex/grid 부모 모두에서 전폭이 되도록
`p.catalog-dummy, div.catalog-dummy { width:100%; flex:1 0 100%; grid-column:1/-1 }` 을
두되, **`caption.catalog-dummy` 에는 `display` 를 주지 않는다**(`display:table-caption`
유지 필요).

접두사는 `catalog-` — `kd-` 는 kyobobook 의 `--kds-*`/`.kds-badge` 와 한 글자 차이다.

### D-1c. 캡션 — 9곳 × 2테마

**배치 규칙:** 가로 스크롤 컨테이너가 **없는** 진짜 `<table>` 이면
`<caption class="catalog-dummy">`(추출 시 표와 함께 이동), 그 밖에는 블록 **바로 앞**
같은 컨테이너 안에 `<p class="catalog-dummy">`. **폰 목업 `.screen` 안에는 절대 넣지
않는다** — 카탈로그가 하는 말이지 목업 앱이 하는 말이 아니다.

| # | slug | 위치 | 요소 |
|---|---|---|---|
| 1 | wanted | `.table-scroll` 앞 | `<p>` |
| 2 | wanted | `.jobcard-grid` 앞 | `<p>` |
| 3 | teamsparta | `.cards` 앞 | `<p>` |
| 4 | kyobobook | `.device-stage` 마지막 자식 | `<p>` |
| 5 | gmarket | `.items-row` 앞 | `<p>` |
| 6 | gmarket | `.item-list` 앞 | `<p>` |
| 7 | gmarket | `.sec__head` 마지막 자식(`.mock-frame` 밖) | `<p>` |
| 8 | toss | `<table class="table-mini">` 첫 자식 | `<caption>` |
| 9 | toss | `.listcard` 안, `.list-header` 닫은 직후 | `<p>` |
| 10 | krds | `.gov-strip` 다음, `.container` 래퍼 안 | `<p>` |

### D-1d. 검증기 룰 `missing-disclaimer-banner`

`checkFile()` 안, `hero-logo-missing` push 직후·`scanCss()` 앞. 4가지를 따로 검사한다 —
클래스 존재(구조 앵커), **`<body>` 첫 자식인지(위치)**, `제휴·후원 관계가 없습니다`(나목),
`더미 데이터`(허위의 사실). 문장 전체 매칭은 나중에 한 글자도 못 바꾸게 만들고,
클래스만 보면 빈 배너를 통과시킨다.

위치는 별도 규칙명 `disclaimer-banner-misplaced` 로 낸다 — 없는 것과 잘못 놓인 것은
고치는 방법이 다르다. **위치가 장식이 아닌 이유**는 아래 정오표 3 참조.

`lang === "ko"` 일 때만 한국어 문구 2개를 요구한다 — `lang: en` 은 유효한 파이프라인
산출물이다. 클래스 검사는 언어 무관.

**severity 는 D-1 에서 `warn`, D-2 에서 `block`.** 최종 상태는 `block` 이 맞다 — 형제
구조 룰이 전부 block 이고, 파이프라인이 자동 생성하는 리터럴의 존재 검사라 오탐이 없다.
`warn` 은 **오직 전환 상태**다(아래 순서 위험).

## 순서 위험 — PR 을 둘로 나눈 이유

`block` 룰이 `preview-html-author.md` 보다 먼저 들어가면: 다음 온보딩이 배너 없는
프리뷰를 만들고 → Stage 9a2 가 block 하고 → 작성자 프롬프트에 배너 얘기가 없어 못 고치고
→ K=2 소진 → Stage 9c 가 비블로킹이라 그냥 출하 → main 에서 `validate:previews` 가
실패한다. **파이프라인이 자기 게이트를 구조적으로 만족 못 하는 상태**가 된다.

또한 `.claude/skills/design-md/` 변경은 CLAUDE.md 상 사전 합의가 필요하다.

## D-2 범위 (이 PR 아님)

- `.claude/agents/preview-html-author.md` — `<body>` 스켈레톤에 배너 줄, "Catalog
  disclosure strip (required, verbatim, first child of `<body>`)" 절 신설(런타임 주입
  불가 이유 명시), "Required body composition" 0번 항목, "Fabricated data must be
  labelled" 절 신설(`공식`·`인증` 같은 **자격 주장 배지는 캡션이 명시해야 한다** 포함),
  Halt conditions 2개, "What you must NOT do" 2개.
- `references/rubric-preview.md` — Item 1(2점, 하드)에 불릿 1개 + failure mode 1줄.
  "Mobile overflow" 뒤에 더미 데이터 라벨링 advisory 블록(warn 방출, 점수 불변).
  **새 채점 항목을 만들지 않는다** — 10점 총합 재배분과 JSON 예시 전면 수정을 유발한다.
- `SKILL.md` — Stage 9a2 문구에 `, catalog disclosure strip` 추가, Stage 10 에
  `rg -q -F` 센티넬.
- 신규 `src/lib/design-md-preview-disclaimer.test.ts` — 배선 리터럴 + 34개 순회 +
  **프리뷰 배너와 사이트 푸터가 같은 비제휴 문장을 쓰는지** + 허구 데이터 9곳 인벤토리.
- 마지막에 `warn` → `block` 1줄 승격 (+ 순서 고정 테스트 1개 갱신).

## 검증 (실측 결과)

- **삽입 정합성:** 클래스·비제휴·더미 리터럴 각 34/34, `<body>` 첫 자식 34/34,
  diff 는 34개 전부 +1/-0.
- **반응형:** 6개 slug × 2테마 × `375·768·976·1440` = **48조합에서 문서 가로 스크롤 0**
  (최대 −15px), 라벨 128개 전부 높이 > 0 이고 클리핑 조상 안.
- **대비:** 34개 전수에서 본문 **6.98:1(dark) ~ 8.10:1(light)** — 전부 WCAG AA 4.5 초과,
  라이트는 AAA 7 초과. 스트립과 페이지 배경 차이는 최대 **1.33** 이라 경고가 아니라
  머리글로 읽힌다.
- **토큰 포획 차단 확인:** 색이 34개에서 정확히 **2쌍**으로 수렴했다 —
  dark `bg(7,7,7)/fg(152,152,152)`, light `bg(250,250,250)/fg(77,77,77)`.
  13개 항목이 `--muted-foreground` 를 재정의함에도 전용 토큰이 브랜드 색조 포획을 막았다.
- **용량:** 최악인 `greeting/dark.html` 124,884 → **125,258**, `BLOCK_BYTES` 131,072 까지
  **5,814 B** 여유. 새로 임계를 넘는 파일 없음.
- **게이트:** `validate:previews` 0 blocking / warn 54(삽입 전 베이스라인과 동일),
  `test` 363개(357 → 363), `typecheck`·`lint`·`format:check`·`tokens:check`·
  `audit:oklch` 통과.
- **룰이 실제로 잡는지:** 룰을 제거한 상태로 테스트를 돌려 flags 3종이 정확히 실패하는
  것까지 확인했다.

## 정오표 — 배너 문구가 계약 리터럴을 담지 않았다

최초 삽입본은 두 절을 `제휴·후원 관계가 **없으며**,` 로 이었다. 계약 테스트가 고정한
리터럴은 `제휴·후원 관계가 **없습니다**` 라 검증기 룰도 계약 테스트도 이 배너를 찾지
못한다. **계획서 자신이 이 모순을 담고 있었다** — 산문은 "연결어만 바꿔 재사용"이라
적고 검증 항목은 `없습니다` 를 찾으라고 적었다.

34개 파일에 넣은 뒤 삽입 후 검증(`비제휴 문구: 0 / 34`)에서 잡아 되돌리고 3문장으로
재구성했다. PR #206 의 "산문과 코드 블록이 같은 말을 하는지 대조할 것" 과 같은 유형이며,
**삽입 직후 리터럴 개수를 세는 검증이 이걸 잡았다**는 게 이번의 교훈이다.

## 정오표 — `<caption>` 규칙에 스크롤러 단서가 빠져 있었다

계획은 "진짜 `<table>` 이면 `<caption>`" 이라고만 적었다. 실측 결과 `wanted` 의
`.wtable` 은 `overflow-x:auto` 인 `.table-scroll` 안에 있고, **caption 박스 폭은
스크롤러가 아니라 표를 따른다** — 375px 에서 caption 360 / 컨테이너 294 로 문장의
**66px 이 가로 스크롤해야만 읽히는 자리**로 밀렸다. 끝까지 읽으려면 스크롤해야 하는
고지는 고지 구실을 못 한다.

`toss` 의 `.table-mini` 은 스크롤러가 없어(표가 294→190→260→242 로 가용 폭에 맞게
줄어든다) `<caption>` 이 4개 폭 전부에서 온전히 읽힌다. 즉 규칙이 깨지는 조건은
**"표가 가로 스크롤 컨테이너 안에 있을 때"** 로 특정된다. 규칙을 버리는 대신 그 조건을
붙였고, `tokens.css` 의 `caption.catalog-dummy` 주석에 남겼다.

## 정오표 — 위치 검사를 D-2 로 미루면 새 항목에는 영원히 적용되지 않았다

최초 룰은 클래스와 두 문장만 봤고, 구조 강제는 D-2 의 계약 테스트로 미뤄 뒀었다.
리뷰가 짚은 대로 그건 성립하지 않는다 — **D-2 의 계약 테스트는 저장소의 34개 파일을
순회하지만, 앞으로 온보딩되는 새 프리뷰는 그 인벤토리가 아니라 `validate:previews` 룰을
통과한다.** 룰이 위치를 안 보면 배너를 `<body>` 맨 아래(스크롤해야 보이는 자리)에 둔 새
프리뷰가 `block` 승격 후에도 계속 통과하고, "첫 화면과 히어로 크롭에 걸린다"는 이 묶음의
목적이 신규 항목에만 빠진다.

그래서 위치 검사를 D-1 로 당겨 `disclaimer-banner-misplaced` 로 넣었다. 34개 전수가
이미 만족하므로 카탈로그에는 0건이고, 룰을 뺀 상태로 돌려 테스트가 실패하는 것까지
확인했다. **교훈: "나중에 계약 테스트로 고정한다"가 인벤토리 순회를 뜻할 때, 그건 미래에
생길 것에는 아무 효력이 없다.**

## 인계 사항 (D 범위 밖)

`krds/{light,dark}.html` 푸터에
`© Ministry of the Interior and Safety, Republic of Korea. All rights reserved.` —
**이 저장소가 쓴 마크업에 부처 명의 저작권 주장**이다. `bezier`(© Channel Corp.) ·
`line-design-system`(© LY Corporation) · `wanted`(© 2025 Wanted Lab) 도 같은 형태다.
bezier 는 Apache-2.0 라이브러리라 프로비넌스로 방어되지만 나머지 셋은 그렇지 않고,
"All rights reserved" 는 넷 중 가장 강한 주장이다. **묶음 H(프리뷰 산문 전수 감사)
또는 E 소관.**

## 미확인 (이 PR 이 해소하지 않음)

- 캡션 문구가 각 화면의 허구 항목을 **빠짐없이** 열거하는지는 리뷰가 봐야 한다.
  기계 검사는 리터럴 존재까지만 한다.
- 나머지 11개 항목의 프리뷰 산문에 남은 오귀속·규범문은 **묶음 H** 소관이다
  (비-greeting 프리뷰 기준 한국어 산문 블록 약 150개, seed-design 제외).
