# 병합 프리뷰 — 다크 잔존 불일치 (2026-08-16)

PR #285 (light.html + dark.html → preview.html) 의 미해소 부채. 라이트는 17개
슬러그 전부 원본과 계산 스타일까지 일치하고, **다크만** 어긋난다. 이 문서는 그
잔존분의 원인·검증 방법·기각한 접근을 남긴다. 세션이 바뀌어도 같은 실패를
반복하지 않기 위한 것이다.

> **해소됨 (2026-08-16).** 아래 잔존 4건을 셋 다 처방했다 — 라이트 스코핑 ·
> 런타임 주석 앵커 · tokens.css 대비 국소 명시도 평탄화. 27개 속성 · 폭
> 375/768/976/1440 전수에서 **라이트 0 · 다크 0** (17/17). 원인 분석과 기각
> 목록은 그대로 두되, 각 절 끝에 실제 처방과 실측치를 붙였다. 「다음에 할 일」이
> 남은 부채를 갖는다.

## 측정 방법 — 이대로 하지 않으면 숫자가 거짓말한다

원본 반쪽은 브랜치에서 지웠으므로 git 에서 꺼낸다.

```
git show origin/main:public/preview/{slug}/light.html
git show origin/main:public/preview/{slug}/dark.html
```

`baemin` 만 예외다. dark.html 의 `<section class="section" style="padding-bottom: 0">`
를 `<section class="section section-dark-gap" style="padding-bottom: 0">` 로
바꿔야 정렬이 성립한다(다크 전용 면책 절과 공유 Components 절이 같은 클래스라
LCS 가 둘을 짝짓는다).

**모션을 끄고 재라.** `data-theme` 를 뒤집으면 `transition` 이 발화하는데,
숨은 탭·헤드리스에서는 타임라인이 `t=0` 에 얼어붙어 **보간 시작값(=라이트 값)** 을
읽게 된다. `data-theme` 를 바꾸기 **전에** 주입할 것:

```html
<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>
```

이걸 놓쳐서 **289건을 회귀로 오인한 적이 있다.** 진행 중인 oklch 보간이
`oklab()` 으로 직렬화되는 것이 그때의 단서였는데, 표기 차이를 잡음으로 치부하고
값만 쫓았다.

**살아 있는 워크트리에서 재지 말 것.** 병렬 세션이 같은 파일을 고치는 중이면
남의 미커밋 수정을 자기 베이스라인으로 착각한다(실제로 34 반쪽 전부 0 이 나와
의심한 사례가 있다). 커밋 SHA 로 `git archive` 해 고정한 사본에서 재고, 그
사본이 커밋본을 바이트 재현하는지부터 확인한다.

**비교 속성을 좁게 잡지 말 것.** `color`·`background-color` 위주 10개로 재면
`box-shadow`·`border-radius`·`opacity`·`letter-spacing` 누출이 안 보인다. krds
2건이 그렇게 숨어 있었다. 22개 이상으로 재라.

요소 정렬은 `body` 하위 전 요소를 문서 순서로 1:1 비교하되 `<template>` 과
`[data-theme-text]` 래퍼는 제외한다(병합본에만 있는 노드다).

## 잔존 불일치와 원인 — 셋이 서로 다른 부류다

22개 속성으로 잰 HEAD(219b692) 기준.

| 슬러그 | 불일치 | 부류 |
| --- | --- | --- |
| vapor-ui | 7행 (요소 1) | 라이트 누출 |
| baemin | 3행 (요소 1) | **마크업** |
| krds | 2행 | 라이트 누출 |
| seed-design | 1행 | 명시도 인플레이션 |

### 라이트 누출 — 다크 시트에 대응 선언이 아예 없는 경우

`vapor-ui` 의 `.wordmark { color }` 는 원본 dark.html 에 **없다.** 병합본은
라이트 시트의 선언을 물려받아 다르게 그린다. 중화할 선택자가 다크 쪽에 없으므로
**어떤 명시도 값으로도 못 고친다.**

해법은 중화 규칙을 emit 하는 것이 아니라 — CSS 에는 "선언 취소" 값이 없고
`revert`/`unset`/`initial` 은 그 자체가 선언이라 여전히 적용돼야 할 다른 규칙까지
누른다 — **라이트 전용 선언을 라이트 스코프로 옮기는 것**이다.

```
  .wordmark { font-size: 18px; …; -webkit-text-fill-color: transparent }
:where(html[data-theme="light"]) .wordmark { color: var(--vp-fg-secondary-200) }
```

- 이동 단위는 **선언**이지 규칙이 아니다. `.wordmark` 의 나머지 선언은 공유로 남는다.
- 가드는 `:where()` 로 감싸 명시도 0. 맨 접두를 쓰면 명시도가 올라가 아래
  seed-design 과 같은 버그를 라이트 쪽에 복제한다.
- 속성은 shorthand/longhand 패밀리로 묶어 판정한다. 라이트 `border-top` 의 짝이
  다크 `border-top-color` 뿐일 때 부재로 보면 다크에서 width·style 이 증발한다.

실측: 라이트 전용 선언 192개 / 12 사이트 / 8 슬러그. 적용 시 다크 13행 → 4행
(vapor-ui 7→0, krds 2→0), 라이트 0 유지, `validate:previews`·`audit:oklch` 출력
바이트 동일, brotli 최대 +293 B.

**처방 (착지): `scopeLightOnly` in `scripts/merge-preview-themes.mjs`.** 위 설계
그대로 — 선언 단위 이동, `:where()` 가드, shorthand/longhand 패밀리 판정. 결과는
예측대로 다크 13 → 4 · 라이트 0 유지였다.

**다만 192개가 아니라 29개면 된다.** 위 실측이 큰 이유는 **두 반쪽이 같은 요소를
다른 이름으로 부르기 때문**이다 — 라이트는 `:root { --brand-orange }`, 다크는
`[data-theme="dark"] { --brand-orange }` 로 쓴다. 문자열로 비교하면 그런 토큰이
전부 "라이트 전용" 으로 읽혀 11st 혼자 58개가 옮겨졌다(패리티는 어느 쪽이든
성립한다 — 다크 자기 블록이 어차피 이겼다). 그래서 부재 판정 키는 루트 컴파운드
(`:root` · `html` · `[data-theme=…]` 의 조합)를 하나로 접고, 자손 앞에 붙은 루트
컴파운드도 벗긴다(`[data-theme="dark"] .hero` ≡ `.hero`, 그 문서 안에서는 같다).
**29개 / 7 슬러그로 줄었고 결과는 동일하다** — 라이트 0, 다크 13 → 4. 옮기는 선언이
적을수록 diff 가 읽히므로 이쪽을 채택했다.

**가드 표기를 `:not([data-theme="dark"])` 로 쓰면 안 된다.** `findPreviewDrift`
(`src/lib/oklch-drift.ts`) 는 선택자에 `[data-theme="dark"` 문자열이 나타나기만
하면 그 블록을 다크로 보고 건너뛴다. 그 표기를 쓰면 **라이트 토큰 블록이 통째로
감사에서 사라진다** — 11st 33개 → 0개, vapor-ui 43개 → 0개. 게이트는 여전히
exit 0 이라 조용히 실명한다. `[data-theme="light"]` 로 쓰면 HEAD 와 동일하게
동작한다.

### baemin — `<template>` 이 인접 형제 결합자를 끊는다

`.section + .section { border-top: 1px solid var(--bm-border-1) }` 는 두 시트에
글자 그대로 동일하다. 문제는 **`<template>` 이 엘리먼트**라는 것이다. 런타임의
`insert` 는 다크 노드를 앵커 `<template>` **앞에** 넣으므로 다크에서 순서가
`[다크 section][template][section]` 이 되고 `+` 가 불발한다. 그래서
`border-top-color` 가 `currentColor` 로 떨어진다.

라이트가 멀쩡한 것은 그 자리의 앞 형제가 원래 `.section` 이 아니었던 **우연**이다.
**즉 이건 baemin 하나의 문제가 아니라 병합 메커니즘 자체의 함정이고, 형제
결합자를 쓰는 모든 프리뷰에 잠복한다.**

고칠 자리는 CSS 가 아니라 런타임·생성 단계다. `collect()` 가 `<template>` 을
주석 노드 마커로 교체하면 형제 사슬에 안 걸린다. 다만 스크립트 없이 여는 라이트
경로에는 template 이 그대로 남으므로, 생성 단계에서 앵커를 형제 사슬 밖으로
빼는 것까지 함께 봐야 한다.

**처방 (착지): `collect()` 가 `<template>` 을 `document.createComment()` 로
교체한다.** 내용은 그 전에 `importNode` 로 떠 둔다. 주석은 엘리먼트가 아니므로
`+`/`~` 를 안 끊고 `:nth-child` 도 안 밀며, template 을 고른 이유였던 불활성
성질(렌더·접근성 트리·find-in-page·복사 어디에도 안 걸림)을 그대로 갖는다.
baemin 다크 3행 → 0. 라이트→다크→라이트→다크 순환도 17/17 멱등이다(단일 전환
DOM 과 바이트 동일).

**생성 단계는 손대지 않았다 — 재보고 내린 판단이다.** 파일 포맷의 `<template>` 은
생성물이기만 한 게 아니라 **손으로 쓰는 규약**이고
(`.claude/agents/preview-html-author.md`), `src/lib/preview-halves.ts` 가 두 반쪽을
되짚는 근거이며, 검증기의 요소 워크가 그 안을 들여다본다. 다크 마크업을 주석
데이터로 옮기면 작성자가 `-->` 를 피해 가며 마크업을 손으로 이스케이프해야 하고
검증기 시야에서 사라진다. **그리고 그 경로가 실제로 깨지는지 재 봤다** —
런타임을 통째로 막고(= template 이 흐름에 남는 유일한 경우) 재면 17개 슬러그
전부 원본 light.html 과 계산 스타일까지 일치한다. **잠복이지 발현이 아니다.**
`_runtime/iframe.js` 의 주석이 이 판단과 실측을 갖는다.

### seed-design — 스코프가 명시도를 올려 tokens.css 를 이긴다

`.sd-tag { font-weight: 500 }` 은 라이트·다크 양쪽에 똑같이 있다. 스코프가
`[data-theme="dark"] .sd-tag` (0,2,0) 으로 만들면서 `tokens.css` 의
`.catalog-disclaimer b` (0,1,1) 를 이겨버린다. 원본 dark.html 에서는 tokens.css 가
정당하게 이겨 600 이었다.

라이트 쪽 처치로는 닿지 않는다. 다크 스코프의 명시도를 원본 관계가 보존되도록
조정해야 하는데, 아래 기각 목록이 보여주듯 전역 조정은 전부 다른 슬러그를 깬다.

**처방 (착지): `selectorsOutrankedByTokens` — 국소 평탄화.** 접두가 (0,1,0) 을
더하는 것이 페이지 안에서는 무해하다(라이트 쌍둥이도 같은 무게라 순서만 있으면
된다). **문제는 `tokens.css` 가 어느 반쪽에도 속하지 않아 그 가산을 안 받는
제3의 시트라는 것**뿐이다. 그래서 **접두가 tokens.css 규칙을 타 넘는 선택자에만**
`:where([data-theme="dark"])` 를 쓰고 나머지는 전부 full weight 로 둔다.

판정 조건은 "엄격히 사이" 하나다 — `명시도(tokens) > 명시도(선택자)` 이고
`명시도(선택자+접두) > 명시도(tokens)`. 동률인 tokens 규칙은 이미 순서로 지고
있고(링크가 페이지 `<style>` 보다 앞) 접두 후에도 계속 지므로 뒤집힘이 없다.

**"같은 요소를 가리키는가" 는 패턴이 아니라 문서로 판정한다.** `.sd-tag` 와
`.catalog-disclaimer b` 는 글자를 하나도 공유하지 않고, 같은 `<b>` 를 맞출 뿐이다.
jsdom 이 이미 다크 반쪽을 들고 있으므로 두 선택자가 맞추는 요소 집합을 실제로
구해 교집합을 본다. **전 카탈로그에서 걸린 선택자는 `.sd-tag` 하나** (seed-design,
+8 B). seed-design 다크 1행 → 0.

## 기각한 접근 — 실측치와 함께

넷 다 돌려보기 전에는 옳아 보인다. 그래서 숫자를 남긴다.

| 방식 | 결과 |
| --- | --- |
| 단일 `[data-theme="dark"]` | 라이트 0 · 다크 13행 ← 현재 채택 |
| 속성 3회 반복 `[dt][dt][dt]` | 11st 10 → **373** (증가폭 불균일: `:root` +2, `.x` +3) |
| 캐스케이드 레이어 `@layer` | 라이트 0 → **348** (`tokens.css` 가 비레이어라 위로 올라섬) |
| `:where([data-theme="dark"])` | baemin 1 → **340** (동률에서 순서가 뒤집힘) |

레이어가 실패하는 이유가 특히 반직관적이다 — **레이어에 속하지 않은 선언은
레이어에 속한 선언을 이긴다.** 페이지 CSS 를 레이어로 감싸는 순간 공유
`tokens.css` 가 그 위로 올라선다.

그 관찰이 국소 처치의 근거가 됐다 — 세 방식이 건드리려던 것은 사실 **"페이지 CSS
대 페이지 CSS"가 아니라 "페이지 CSS 대 비스코프 제3 시트"** 관계 하나뿐인데,
셋 다 페이지 내부 관계까지 같이 흔들었다. 표의 마지막 줄(전역 `:where()`)이
seed-design 을 고치면서 baemin 을 340행으로 만든 것이 그 대가다. 조건을 "제3
시트를 타 넘는 선택자" 로 좁히면 전 카탈로그에서 한 줄만 남는다.

**즉 이 표는 여전히 유효하다** — 기각된 것은 전역 적용이고, 채택된 것은 같은
도구의 국소 적용이다. 전역으로 되돌리려는 다음 사람은 위 숫자를 먼저 볼 것.

## 착지 상태 (2026-08-16)

| 슬러그 | 이전 | 이후 | 처방 |
| --- | --- | --- | --- |
| vapor-ui | 7행 | 0 | 라이트 스코핑 (`.wordmark { color }` 외 2건) |
| krds | 2행 | 0 | 라이트 스코핑 (`box-shadow` 2건 포함 20건) |
| baemin | 3행 | 0 | 런타임 주석 앵커 |
| seed-design | 1행 | 0 | `.sd-tag` 국소 평탄화 |

전수 실측 (27개 속성, `body` 하위 전 요소, `<template>`·`[data-theme-text]` 제외):

- 폭 **1440 / 976 / 768 / 375** 넷 다 **라이트 0 · 다크 0**, 17/17
- 런타임 차단(스크립트 없는 라이트) 도 17/17 원본 일치
- 테마 순환(라이트→다크→라이트→다크) 17/17 멱등
- `npx tsc --noEmit` 0 · `npx vitest run` 555 passed / 41 files ·
  `validate-preview.ts` 0 · `audit-oklch.ts` 0
- `validate:previews`·`audit:oklch` 출력은 HEAD 와 **바이트 동일** (감사 시야가
  줄지 않았다는 증거 — 라이트 가드를 `:not([data-theme="dark"])` 로 썼다면 여기서
  조용히 0 이 됐을 자리다)
- 용량: 6개 슬러그에서 raw +508 B, brotli **+147 B** (최대 seed-design 125,643 B)
- `merge-preview-themes.mjs` 재실행 → 설치본과 17/17 바이트 동일 (결정론적)

## 남은 부채

**생성 단계의 `<template>` 은 그대로다.** 런타임이 도는 경로(사이트 iframe, 즉
실제로 서빙되는 형태)에서는 주석으로 교체되므로 형제 사슬에 안 걸리지만,
**스크립트 없이 여는 라이트 경로에는 남는다.** 지금은 17개 전부 원본과 일치하니
발현된 결함이 아니라 잠복이고, 포맷을 바꾸는 비용(손 작성 규약 ·
`preview-halves.ts` · 검증기 시야 · `-->` 이스케이프)이 그보다 크다고 판단했다.
되짚는다면 근거는 「baemin」 절의 처방 항에 있다.

**이 잠복을 깨울 수 있는 것은 새 프리뷰다** — 손으로 쓴 `<template>` 이 `+`/`~`
사슬이나 `:nth-child` 를 가로지르는 자리에 놓이면 스크립트 없는 라이트에서만
어긋난다. 기계 검사는 없다.
