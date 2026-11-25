# 구조 "커스텀 태그" (티켓 731, 짧은 시험)

> PROTOTYPE. 버리는 코드의 일부다. main 에 들어가지 않는다.
> 이 구조는 치지직 하나만 옮겼다. 토스는 공통 바탕 그대로다. 약속 검사는 만들지 않았다(티켓이 요구하지 않는다).

## 먼저 알 것

- **기존 검사 셋(프리뷰 검사기, 임시 폴더 프리뷰의 대비 관찰, 화면 비교)은 아무것도 막지 않았다.** 티켓은 처음 막히는 곳을 기록하라고 했지만, 기록할 막힘이 없다. 막힘을 지어내지 않았다.
- **막힘이 없는 것은 이 시험이 고른 설계의 결과다.** 태그를 그리는 코드를 모든 프리뷰가 싣는 공용 런타임 `iframe.js` 안에 넣었다. 그 코드를 별도 스크립트 파일로 실었다면 첫 검사(프리뷰 검사기)의 `foreign-script` 가 막았다(4.1에 그 사본의 메시지가 있다).
- **그래서 이 브랜치의 산출물은 "막힌 곳의 기록"이 아니라 "검사가 보지 못하는 곳의 기록"이다.** 프리뷰 검사기는 스크립트를 돌리지 않고 파일 글자를 읽으므로, 속성으로 옮긴 이름표와 구역 제목, 다크 이름표를 보지 못한 채 통과했다(3절, 4.2, 4.4). 브라우저에서 재는 두 검사는 그려진 문서를 보고 바탕과 같다고 냈다.

## 1. 무엇인가

프리뷰는 지금처럼 HTML 한 장이다. 다른 점은 틀(구역, 칸, 이름표, 시연 자리)을 표준 마크업 대신 전용 태그로 적는다는 것이다.
공용 런타임 `public/preview/_runtime/iframe.js` 가 브라우저에서 그 태그를 공통 바탕과 같은 마크업(`STANDARD.md` 2절)으로 바꿔 그린다.

```html
<pv-page>
  <pv-hero>…안쪽은 브랜드 자유…</pv-hero>

  <pv-zone name="screens">
    <pv-cell name="screen-live-watch" label="라이브 시청, 데스크톱 (… 가정)" label-dark="라이브 시청, 데스크톱 (… 가정)" wide stack>
      <p class="catalog-dummy">…더미 데이터입니다.</p>
      <pv-screen>…안쪽은 브랜드 자유…</pv-screen>
    </pv-cell>
  </pv-zone>
</pv-page>
```

| 태그 | 그려지는 마크업 | 어디서 오나 |
| --- | --- | --- |
| `<pv-page>` | `<main class="pv-page">` | |
| `<pv-hero>` | `<header class="pv-hero" data-pv-zone="hero">` | |
| `<pv-zone name>` | `<section class="pv-zone" data-pv-zone aria-labelledby>` 와 `<h2 class="pv-zone-title">`, `<div class="pv-cells">` | 구역 제목은 런타임의 표 `ZONES` 한 곳에서 온다 |
| `<pv-cell name label …>` | `<div class="pv-cell" data-pv-cell>` 와 이름표 `<p class="pv-label">`, `<div class="pv-stage">` | 이름표는 `label` 속성. `wide` 는 `pv-cell--wide`, `stack` 은 `pv-stage--stack` |
| `label-dark` 속성 | 이름표 바로 뒤 `<template data-theme-variant="dark"><p class="pv-label">…</p></template>` | 런타임이 만든 뒤 기존 다크 바꿔 끼기가 그대로 집어 간다 |
| `<pv-cell>` 첫머리의 `<p class="catalog-dummy">` | 시연 자리 밖, 이름표 아래에 남는다 | 정적 검사가 class 로 찾기 때문에 속성이 아니라 진짜 요소로 둔다 |
| `<pv-screen>` | `<div class="pv-screen">` | |

- 그리는 코드는 `iframe.js` 의 `drawTags()` 이고 `start()` 맨 앞, 다크 변형을 모으기(`collect()`) 전에 돈다. 108줄이다.
- `<style>` 두 블록(틀 블록 포함)은 공통 바탕과 글자까지 같다. 틀 스타일은 그려진 `.pv-*` class 에 걸린다.
- `name` 이 표에 없는 구역은 제목이 빈 채 그려진다. 이 구조에는 그것을 막는 검사가 없다.

## 2. 파일

| 파일 | 하는 일 |
| --- | --- |
| `public/preview/chzzk/preview.html` | 옮긴 치지직. 손으로 고치는 원본이자 서빙되는 파일 |
| `public/preview/_runtime/iframe.js` | 태그를 그리는 코드가 더해진 공용 런타임 |
| `prototypes/preview-structure/custom-tags/to-tags.mjs` | 공통 바탕의 프리뷰를 이 구조로 바꾸는 변환 스크립트. 치지직은 이것으로 옮겼다 |
| `prototypes/preview-structure/custom-tags/hurdles.ts` | 걸림돌 다섯을 하나씩 재는 실험. 임시 폴더의 사본만 만든다 |

```bash
# 옮기기 (공통 바탕 파일에서)
node prototypes/preview-structure/custom-tags/to-tags.mjs <바탕 preview.html> public/preview/chzzk/preview.html
# 걸림돌 실험 (3번은 대비 측정을 두 번 돌려 몇 분 걸린다)
pnpm exec tsx prototypes/preview-structure/custom-tags/hurdles.ts --base <바탕 preview.html> [--only 1,2,4,5]
```

## 3. 기존 검사를 순서대로 돌린 결과

티켓은 처음 막히는 곳에서 멈추라고 했다. **세 검사 가운데 막은 것이 없었다.** 아래가 그 실행이다.
막힘이 없는 것은 그리는 코드를 공용 런타임 `iframe.js` 안에 둔 결과다. 그리는 코드를 별도 파일로 실으면 1번 검사(프리뷰 검사기)의 `foreign-script` 에서 처음 막힌다. 그 메시지는 4.1에 있다.

| 순서 | 검사 | 명령 | 결과 |
| --- | --- | --- | --- |
| 1 | 프리뷰 검사기 | `pnpm validate:previews --slug chzzk --verbose` | exit 0, 막힘 0, 경고 0, `oklch 41/50L 20/50D`. 공통 바탕 파일을 같은 검사기(스테이징 모드)에 넣어도 글자 그대로 같은 줄이 나온다 |
| 2 | 임시 폴더 프리뷰의 대비 관찰 | `pnpm audit:contrast:staged --staged <임시>/preview.html --json-out <임시>/report.json` | exit 0, `0 block / 20 warn`. 측정 행 322, 미달 40, 텍스트 요소 테마마다 326. 공통 바탕 사본도 같은 명령으로 같은 수가 나왔고 경고 20건의 내용도 같다 |
| 3 | 화면 비교(공통 바탕과) | `pnpm exec tsx prototypes/preview-structure/dom-diff.ts --a <바탕>/public/preview/chzzk/preview.html --public-a <바탕>/public --b public/preview/chzzk/preview.html --public-b public` | exit 0, `SAME: no difference in any pass.` 16번(두 테마, 네 폭, 손끝 상태 강제, 전환) 모두 요소 608개가 같다 |

통과의 뜻이 검사마다 다르다. 이것이 이 구조에서 알아낸 가장 중요한 사실이다.

- **검사기의 통과는 "보지 못했다"에 가깝다.** 검사기는 스크립트를 돌리지 않고 파일의 글자를 읽는다. 바뀐 틀(구역 제목, 칸 이름표, 다크 이름표)은 파일에 글로 없으니 검사 대상에서 빠졌다. 지금 검사기에는 `.pv-*` 틀을 보는 규칙이 없어서, 빠졌어도 결과 줄이 같다. 아래 걸림돌 2와 4가 빠진 것을 재 보인다.
- **대비 관찰과 화면 비교의 통과는 "봤고 같다"이다.** 둘은 Chromium 에서 스크립트가 그린 뒤의 문서를 잰다. 그리는 코드가 그림자 DOM 을 쓰지 않고 표준 마크업을 문서에 그대로 그리기 때문이다.

티켓 순서 밖의 도구 하나도 돌렸다. 공통 바탕의 `pnpm exec tsx prototypes/preview-structure/base-notes/check-base.ts chzzk` 는 exit 1, `chzzk: FAIL no main.pv-page` 이다.
이 도구의 구조 검사는 스크립트를 돌리지 않고 파일의 마크업을 따로 파싱해 읽는다(머리 주석). 같은 실행에서 브라우저로 잰 구역 수(`zones screens 3, buttons 1, inputs 3, navigation 2, content 4, feedback 1`)는 바탕과 같다. 본 순서의 판정에는 넣지 않는다.

완료 조건 1(브라우저에서 그려진다)의 증거는 화면 비교의 `SAME` 과, 스크립트를 켠 Chromium 에서 센 수다. 구역 6, 칸 14, 이름표 14, 높이 6720px 로 바탕과 같다(`hurdles.ts --only 5` 의 첫 줄).

## 4. 걸림돌 다섯

모두 `hurdles.ts` 로 쟀다. 사본은 OS 임시 폴더에 만들고, 서빙되는 파일은 건드리지 않았다.

### 4.1 공용 스크립트 밖 스크립트 금지: 그렇다. 단 `src` 로 실은 파일만 막는다

- 쪽: 원본 글자(검사기 `foreign-script`, `src/lib/preview-validator.ts` 1432~1442줄).
- 그리는 코드를 `/preview/_runtime/pv-tags.js` 로 따로 실은 사본은 exit 1 이다.
  `BLOCK [foreign-script] … loads a script other than the shared runtime: \`/preview/_runtime/pv-tags.js\`. Previews must stay self-contained (no frameworks, no per-slug runtime copies).` (라이트와 다크 반쪽에서 하나씩, 막힘 2)
- 같은 코드를 `<head>` 의 인라인 `<script>` 로 둔 사본은 exit 0 이다. 규칙의 정규식이 `src` 가 있는 `<script>` 만 본다. 인라인 스크립트는 `STANDARD.md` 5절과 ADR 0015("프리뷰는 자기 스크립트를 갖지 않는다")가 금지하지만 검사기는 잡지 않는다(공통 바탕의 `check-base.ts` 만 본다).
- 본 구조는 그리는 코드를 `iframe.js` 안에 넣어 이 규칙에 걸리지 않는다. 대가는 모든 프리뷰가 싣는 공용 런타임이 108줄 늘어난다는 것이다(225줄에서 334줄). 태그가 없는 다른 프리뷰에서는 `querySelectorAll` 다섯 번이 빈 결과를 낸다.
- 지키려는 것: 프리뷰가 스스로 완결되고 항목마다 런타임 사본이 생기지 않는 것.

### 4.2 속성에 든 이름표를 산문 검사가 읽지 못함: 그렇다

- 쪽: 원본 글자(검사기의 `visibleText`).
- 같은 문구 `All rights reserved` 를 심어 비교했다.
  - 칸 이름표 속성(`label="badge, All rights reserved"`)에 심은 사본: exit 0, `PASSED`.
  - 요소의 글(`<span class="spec">`)로 심은 사본: exit 1, `BLOCK [rights-reserved-claim] … contains "All rights reserved"` (막힘 2).
- 검사기의 보이는 글(`visibleText`, 태그를 속성째 지운다)에 바탕의 이름표, 다크 이름표, 구역 제목 24개가 몇 개 남는지 셌다. 바탕 24개, 태그 구조 3개다. 남은 셋("화면", "버튼", "입력")은 이름표가 아니라 다른 글에 같은 낱말이 있어서 걸린 것이다. 사실상 0개다.
- `type-scale-showcase`(이름표에 적힌 타입 토큰 이름을 센다)도 같은 `visibleText` 를 읽으므로 이름표를 세지 않는다. 코드에서 읽은 것이고 따로 재지 않았다.
- 프리뷰 산문 감사(`.claude/skills/preview-prose-audit/`)는 글을 뽑는 스크립트가 없고 에이전트가 원본을 읽는 절차뿐이다(`SKILL.md` 하나). 감사가 속성 안의 이름표를 읽는지는 확인하지 않았다.
- 지키려는 것: 프리뷰에 실리는 모든 글이 금지 문구와 캡션 규칙의 검사를 받는 것.

### 4.3 대비 측정이 태그 안쪽을 보지 못함: 본 구조에서는 그렇지 않다. 그림자 DOM 으로 그리면 그렇다

- 쪽: 브라우저(`scripts/audit-contrast-collector.ts` 1342줄은 `document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)` 로 글을 찾는다. 이 걷기는 그림자 루트 안으로 들어가지 않는다).
- 본 구조(문서에 그대로 그린다): 측정 행 322, 미달 40, 텍스트 요소 326 / 326. 바탕과 같다.
- 변형(같은 태그를 그린 뒤 칸마다 내용을 그림자 루트로 옮김. 그림자 DOM 으로 그리는 런타임이 남길 모습을 인라인 스크립트로 흉내 냈다): 측정 행 20, 미달 2, 텍스트 요소 15 / 15. 칸 안의 글이 측정에서 통째로 빠지고, 얇은 프리뷰 하한(80)에도 걸린다.
- 그래서 본 구조는 커스텀 엘리먼트(`customElements.define`)와 그림자 DOM 을 쓰지 않고, 태그를 표준 마크업으로 바꿔 끼는 함수 하나로 그렸다.

### 4.4 다크에서 글이 달라지는 이름표의 묶임: 그렇다. 브라우저에서는 풀리지만 검사기는 다크 이름표를 보지 못한다

- 쪽: 둘 다.
- 본 구조(`label-dark` 속성): 다크로 연 Chromium 에서 `screen-live-watch` 칸의 이름표는 다크 글 하나만 보인다(`["라이브 시청, 데스크톱 (채팅 폭, 제목 크기, 전송 버튼 가정)"]`). 런타임이 `<template>` 을 만든 뒤 기존 바꿔 끼기가 돈다.
- 그러나 검사기가 원본에서 다시 짠 다크 반쪽(`splitMergedPreview`)에는 다크 이름표도 라이트 이름표도 없다(바탕은 다크 이름표가 있다). 다크 이름표 네 개(`screen-live-watch`, `chat-input`, `channel-head`, `modal`)는 검사기의 `dark-swap-anchor` 짝 검사와 다크 반쪽의 모든 글 검사 밖에 있다.
- 다른 꼴(다크 이름표를 칸의 첫 자식 `<template>` 으로 쓰기)은 검사기가 막는다. exit 1,
  `BLOCK [unreadable-merged-preview] … a template[data-theme-variant="dark"] with no preceding node has nothing to swap.` 원본에서 그 template 앞에 라이트 이름표가 없기 때문이다. 브라우저에서도 틀린다. 다크에서 라이트 이름표와 다크 이름표가 둘 다 보인다.
- 이름표의 한 조각만 다크에서 달라지는 경우(`STANDARD.md` 2절의 template 을 이름표 안에 두는 꼴)는 속성 하나로 적을 수 없다. 치지직에는 그런 칸 이름표가 없어 재지 않았다.
- 지키려는 것: 다크에서 바꿔 끼는 글이 엉뚱한 노드를 빼지 않는 것, 그리고 검증과 리뷰의 대상이 실제로 서빙되는 문서인 것(ADR 0002).

### 4.5 스크립트 없이도 라이트가 그려지는 성질: 그렇다. 이 성질을 잃는다

- 쪽: 브라우저(Playwright `javaScriptEnabled: false`).
- 바탕, 스크립트 끔: 구역 6, 칸 14, 이름표 14, 높이 6720px. 스크립트를 켠 것과 같다.
- 태그 구조, 스크립트 끔: 구역 0, 칸 0, 이름표 0, 높이 5296px. 브라우저는 모르는 태그를 인라인 요소로 두고, 틀 스타일은 `.pv-*` class 에 걸리므로 하나도 적용되지 않는다.
- 바탕에 보이고 태그 구조에 안 보이는 줄은 20개다. 구역 제목 6과 칸 이름표 14 전부다. 시연 안의 글과 더미 데이터 표기는 남는다.
- `iframe.js` 머리 주석의 약속("With no script at all the file is the light theme")이 이 구조에서는 성립하지 않는다.
  검사기의 면책 띠 규칙도 같은 전제를 둔다. 런타임은 단독으로 열거나 재배포한 사본에 면책 띠를 넣을 수 없으니 정적 마크업으로 두라고 한다(`missing-disclaimer-banner` 메시지, "standalone or redistributed copy"). 그런 사본에서 이 구조는 틀을 잃는다.

## 5. 이 구조로 같은 일을 하려면 무엇을 바꿔야 하나

본 순서의 검사는 막지 않았으므로 아래는 "막힌 검사를 통과하려면"이 아니라, 걸림돌이 드러낸 빈자리를 메우려면 바꿔야 하는 곳이다. 이 시험에서는 아무것도 바꾸지 않았다.

| 빈자리 | 검사를 바꾸는 길 | 구조를 바꾸는 길 |
| --- | --- | --- |
| 이름표와 구역 제목이 검사기의 글 검사 밖(4.2) | 검사기가 글 검사 전에 원본을 jsdom 에서 `drawTags()` 로 펼친다. `preview-halves.ts` 의 반쪽 짜기도 펼친 뒤에 해야 한다 | 이름표를 속성이 아니라 자식 요소로 쓴다. 그러면 태그가 하는 일은 class 와 감싸개를 다는 것뿐이다 |
| 다크 이름표가 검사기의 다크 반쪽 밖(4.4) | 위와 같다. 펼친 뒤에 다크 반쪽을 짜야 `dark-swap-anchor` 가 다시 본다 | 다크 이름표를 칸 안의 진짜 `<p class="pv-label">` 와 그 뒤 `<template>` 으로 쓴다(바탕과 같은 꼴) |
| 인라인 스크립트를 검사기가 잡지 않음(4.1) | `foreign-script` 가 `src` 없는 `<script>` 도 본다 | (구조와 무관) |
| 스크립트 없이 틀이 없음(4.5) | 성질 자체를 버리고 `iframe.js` 머리 주석을 고친다 | 빌드 단계에서 태그를 펼친 산출물을 서빙한다. 그러면 원본과 산출물이 갈라진다 |
