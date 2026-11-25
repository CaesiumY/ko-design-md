# 구조 안내: HTML 한 장 + 공용 틀 (`html-frame`)

> PROTOTYPE. 버리는 코드의 일부다. 프리뷰 기준은 `prototypes/preview-structure/STANDARD.md` 이고, 이 파일은 그 기준을 **이 구조에서 어떻게 지키는지**만 적는다.
> 수치는 같은 폴더의 `STATS.md` 에 있다.

## 1. 한눈에

- 항목마다 프리뷰는 손으로 쓴 HTML **한 장**이다. 그 파일이 곧 원본이고 서빙되는 파일이다. 빌드 단계도, 생성되는 산출물도 없다.
- 틀(구역 제목, 칸의 배치, 칸의 이름표)의 스타일은 공용 파일 **하나**가 그린다: `public/preview/_runtime/frame.css`. 각 프리뷰는 이것을 `<link>` 로 싣는다.
- 틀의 마크업(구역 `<section>`, 칸 `<div>`, 이름표 `<p>`)은 각 항목 파일에 손으로 쓴다. 틀이 정하는 것은 스타일뿐이다.
- 구역 목록(식별자, 제목, 순서)은 약속 검사 `check-frame.ts` 의 `ZONES` 한 곳에만 있다.

## 2. 파일이 놓이는 곳

| 파일 | 무엇 | 누가 고치나 |
| --- | --- | --- |
| `public/preview/{slug}/preview.html` | 항목의 프리뷰. 원본이자 서빙되는 파일 | 항목마다 손으로 |
| `public/preview/_runtime/frame.css` | 틀 스타일 전부. 모든 프리뷰가 같은 파일을 싣는다 | 틀을 바꿀 때만 |
| `public/preview/_runtime/tokens.css`, `iframe.js` | 기존 공용 런타임. 그대로다 | (이 구조와 무관) |
| `prototypes/preview-structure/html-frame/check-frame.ts` | 약속 검사. 구역 목록 `ZONES` 가 여기에 있다 | 약속이 바뀔 때 |
| `prototypes/preview-structure/html-frame/check-frame.test.ts` | 약속 검사의 테스트 | 약속이 바뀔 때 |
| `prototypes/preview-structure/html-frame/skeleton.html` | 새 항목을 시작할 뼈대. 약속 검사를 통과한다 | (복사해서 쓴다) |
| `prototypes/preview-structure/html-frame/to-html-frame.mjs` | 공통 바탕의 프리뷰를 이 구조로 옮긴 변환 스크립트(토스, 치지직에 썼다) | 다시 쓸 일 없음 |

- 서빙 주소는 공통 바탕과 같다: 프리뷰는 `/preview/{slug}/preview.html`, 틀은 `/preview/_runtime/frame.css`.
- 공통 바탕의 `prototypes/preview-structure/frame.css` 는 이 브랜치에서 `public/preview/_runtime/frame.css` 로 **옮겼다**(`git mv`, 내용은 한 글자도 바꾸지 않았다). 틀 파일은 한 벌뿐이다. `STANDARD.md` 3절이 말하는 "frame.css 의 pv-frame 블록"은 이 브랜치에서는 이 파일이다.
- 파일 머리의 `/* pv-frame:start …` 주석은 공통 바탕에서 물려받은 글이다. "글자 그대로 붙여 넣는다"는 바탕 단계의 방식이고, 이 구조에서는 **붙여 넣지 않는다**(붙여 넣으면 약속 검사가 `frame-copy` 로 막는다).

## 3. 프리뷰 파일의 꼴

`<head>` 는 이 순서다. 틀 링크는 tokens.css 링크 **바로 다음 줄**, 첫 `<style>` 보다 앞이다. 그래야 스타일이 tokens.css, 틀, 페이지 스타일 순서로 겹친다(공통 바탕과 같은 순서).

```html
<link rel="stylesheet" href="/preview/_runtime/tokens.css">
<link rel="stylesheet" href="/preview/_runtime/frame.css">
<script src="/preview/_runtime/iframe.js" defer></script>
<style>
  :root {
    /* 브랜드 토큰 … */
    --pv-font: var(--브랜드-본문-서체);
    --pv-ink: var(--브랜드-글자);
    --pv-ink-muted: var(--브랜드-보조-글자);
    --pv-canvas: var(--브랜드-페이지-바탕);
    --pv-surface: var(--브랜드-칸-바탕);
    --pv-line: var(--브랜드-선);
    --pv-radius: var(--브랜드-반경);
    /* 선택: --pv-title-weight: 700; --pv-tracking: 0; */
  }
  /* 브랜드 컴포넌트 스타일. .pv-* 선택자는 쓰지 않는다 */
</style>
<style>
  [data-theme="dark"] { /* 다크에서 달라지는 토큰만 */ }
</style>
```

- `--pv-*` 일곱(font, ink, ink-muted, canvas, surface, line, radius)은 **첫 `<style>`** 에 `var(--…)` 참조로 준다. 굵기와 자간 둘만 글자 값을 쓸 수 있다. 뜻은 `STANDARD.md` 3절의 표다.
- `--pv-gutter` 는 틀이 내주는 값이다. 페이지는 `var(--pv-gutter)` 로 읽기만 한다(히어로 안쪽 여백 등).
- `<body>` 안의 꼴은 `STANDARD.md` 2절 그대로다: 면책 띠, `<main class="pv-page">`, 그 안에 히어로 `<header class="pv-hero" data-pv-zone="hero">` 와 구역 `<section class="pv-zone" …>` 들. 아래 조각을 복사해 쓴다. `skeleton.html` 에도 같은 꼴이 있다.

### 구역 조각

`{id}` 는 구역 식별자, `{제목}` 은 그 구역의 제목 글자다. `{id}` 는 세 곳(`data-pv-zone`, `aria-labelledby`, `h2` 의 `id`)에 같은 글자로 들어간다. 구역의 자식은 제목과 `.pv-cells` 둘뿐이다.

```html
  <section class="pv-zone" data-pv-zone="{id}" aria-labelledby="pv-{id}">
    <h2 class="pv-zone-title" id="pv-{id}">{제목}</h2>
    <div class="pv-cells">
      <!-- 칸들 -->
    </div>
  </section>
```

### 칸 조각

칸의 자식은 **이 순서**다. 괄호 안은 있을 때만 둔다.

1. 칸의 이름표 `<p class="pv-label">`. 비어 있으면 안 된다.
2. (다크에서 이름표 글이 다를 때) `<template data-theme-variant="dark">` 하나. 안에 바꿔 낄 `<p class="pv-label">` 하나만 둔다.
3. (칸에 더미 데이터가 있을 때) `<p class="catalog-dummy">` 하나.
4. 시연 자리 `<div class="pv-stage">` 하나. 마지막 자식이다.

가장 짧은 칸:

```html
      <div class="pv-cell" data-pv-cell="{kebab-case 이름}">
        <p class="pv-label">{md 의 컴포넌트 이름}</p>
        <div class="pv-stage"><!-- 시연 --></div>
      </div>
```

넷을 다 갖춘 칸:

```html
      <div class="pv-cell pv-cell--wide" data-pv-cell="{kebab-case 이름}">
        <p class="pv-label">{이름}, {스펙} (라이트 색 가정)</p>
        <template data-theme-variant="dark"><p class="pv-label">{이름}, {스펙}</p></template>
        <p class="catalog-dummy">{무엇}은 레이아웃 시연용 더미 데이터입니다.</p>
        <div class="pv-stage pv-stage--stack">
          <!-- 시연. 상태나 변형을 밝히는 이름표는 브랜드 class 로 이 안에 둔다 -->
        </div>
      </div>
```

- `data-pv-cell` 은 소문자, 숫자, 하이픈으로 쓰고 파일 안에서 겹치지 않는다.
- 넓게 써야 하는 칸은 `pv-cell--wide`, 세로로 쌓는 시연은 `pv-stage--stack` 을 더한다. 틀의 class 는 `frame.css` 에 있는 것만 쓴다.
- 화면 구역의 칸은 시연 자리 안에 `<div class="pv-screen">` 하나를 두고 그 안에 화면을 그린다. `.pv-screen` 안에는 `pv-` class 를 쓰지 않는다.

## 4. 한 줄 실행 명령

빌드가 없으므로 따로 만들 것이 없다. 고친 파일이 곧 서빙되는 파일이다. 확인은 두 줄이다.

```bash
pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts toss chzzk   # 약속 검사
pnpm validate:previews --slug toss                                                # 기존 프리뷰 검증기
```

- 약속 검사의 인자는 슬러그(`public/preview/{slug}/preview.html` 을 본다)나 파일 경로다. 경로는 `/` 나 `\` 가 들었거나 `.html` 로 끝나는 인자다. 인자가 없거나 파일이 없으면 exit 2, 어긴 곳이 있으면 exit 1, 없으면 exit 0 이다.
- 약속 검사의 테스트: `pnpm exec vitest run prototypes/preview-structure/html-frame`(14개). `pnpm test` 에도 들어 있다.
- 화면 비교가 필요하면 `prototypes/preview-structure/dom-diff.ts` 의 머리 주석대로 돌린다. 이 구조는 원본이 곧 서빙 파일이라 `--b` 에 `public/preview/{slug}/preview.html`, `--public-b` 에 `public` 을 준다.

## 5. 약속 검사가 보는 것과 메시지

메시지는 한 줄에 하나, `파일:줄  [코드] 무엇이 틀렸나` 다음 줄에 `고치는 법:` 이다. **줄 번호는 서빙되는 파일의 줄 번호이고, 그 파일이 원본이다.** 검증기나 리뷰가 서빙되는 HTML 의 줄을 가리키면 같은 파일의 같은 줄을 고치면 된다.

```
public/preview/toss/preview.html:1835  [zone-order] 구역 "inputs" 가 구역 "selection" 뒤에 있다
    고치는 법: "inputs" 구역(<section> 통째)을 "selection" 구역 앞으로 옮긴다. 순서는 screens, buttons, inputs, selection, navigation, content, feedback, brand
```

| 코드 | 잡는 것 |
| --- | --- |
| `frame-link` | 틀 링크가 없거나 둘 이상이거나, tokens.css 링크 바로 다음이 아니거나, 첫 `<style>` 뒤에 있음 |
| `frame-copy` | 페이지에 틀 블록(`pv-frame:start`)을 붙여 넣음 |
| `page-names-frame` | 페이지 스타일의 선택자가 `.pv-` 나 `[data-pv-` 를 이름함 |
| `page-redefines-gutter` | 페이지 스타일이 `--pv-gutter` 를 정의함 |
| `frame-var` | `--pv-*` 일곱 가운데 첫 `<style>` 에 없는 것, 글자 값으로 준 것, 틀이 모르는 `--pv-` 변수 |
| `frame-class` | 틀에 없는 `pv-` class(틀의 class 목록은 `frame.css` 에서 읽는다) |
| `frame-inline` | `pv-` class 를 가진 요소의 인라인 `style` |
| `own-script` | `src` 없는 `<script>` |
| `page-main` | `<body>` 바로 아래의 `<main class="pv-page">` 가 하나가 아님 |
| `hero` | `<main>` 의 첫 자식이 `h1` 하나를 가진 `header.pv-hero[data-pv-zone="hero"]` 가 아님 |
| `zone-shape` | `<main>` 안의 구역 아닌 요소, `aria-labelledby` 나 제목 `h2` 의 id 틀림, 제목 다음 `.pv-cells` 하나가 아님 |
| `zone-unknown` | `ZONES` 에 없는 `data-pv-zone` |
| `zone-order` | 구역이 `ZONES` 순서보다 늦게 나옴(뒤로 밀린 구역의 줄을 가리킨다) |
| `zone-duplicate` | 같은 구역이 두 번 |
| `zone-title` | 제목 글자가 `ZONES` 의 것과 다름 |
| `zone-missing` | 필수 구역(`screens`)이 없음 |
| `cell-shape` | `.pv-cells` 안의 칸 아닌 요소, 칸의 자식 순서(이름표, 다크 이름표 template, `catalog-dummy`, 시연 자리) 틀림, 다크 template 이 이름표 하나를 싣지 않음 |
| `cell-label` | 칸의 첫 자식이 `p.pv-label` 이 아니거나 이름표가 비었음 |
| `cell-name` | `data-pv-cell` 이 kebab-case 가 아니거나 파일 안에서 겹침 |
| `screen-frame` | `.pv-screen` 이 screens 구역 밖에 있거나, 그 안에 `pv-` class, `data-pv-zone`, `data-pv-cell` 이 있음 |

약속 검사가 보지 **않는** 것

- 프리뷰 검증기가 이미 보는 것: 면책 띠, tokens.css 와 iframe.js 링크, 색 값, 크기, 로고, 레이아웃 경고.
- 렌더링한 결과: 넘침, 대비, 틀 링크가 실제로 불러와지는지. 파일의 글자만 읽는다.
- 칸이 쓰임에 맞는 구역에 있는지. DESIGN.md 를 읽어 판단할 일이다.

## 6. 자주 하는 일

**틀의 모양을 바꾼다**(예: 구역 제목의 크기와 굵기): `public/preview/_runtime/frame.css` 한 파일을 고친다. 항목 파일은 건드리지 않는다. 모든 프리뷰의 화면이 함께 바뀐다.

**틀의 태그를 바꾼다**(예: 모든 칸에 속성을 더한다): 틀의 마크업은 각 항목 파일에 있으므로 **항목 파일마다** 고친다. 칸이 많으면(토스 41칸, 치지직 14칸) 스크립트로 바꾸는 편이 빠르다. 새 약속은 `check-frame.ts` 의 `checkCell`(칸), `checkZone`(구역)에 더하고, 테스트를 `check-frame.test.ts` 에 더한다.

**구역을 더하거나 순서를 바꾼다**: `check-frame.ts` 의 `ZONES` 한 곳을 고친다. 그다음 항목 파일에서 `<section>` 을 새 순서로 옮기거나 새로 쓴다. 틀 스타일은 구역 식별자를 모르므로 `frame.css` 는 그대로다.

**새 항목의 프리뷰를 쓴다**

1. `prototypes/preview-structure/html-frame/skeleton.html` 을 `public/preview/{slug}/preview.html` 로 복사한다.
2. `<title>`, 로고 경로(`/logos/…`, md 의 logo 값), `h1` 을 그 브랜드 것으로 바꾼다.
3. 첫 `<style>` 의 `:root` 에 md 의 토큰을 OKLCH 로 적고, `--pv-*` 일곱을 그 토큰의 참조로 준다.
4. 다크 `<style>` 에 다크에서 달라지는 토큰만 다시 정의한다.
5. 히어로, 화면 구역, 그 뒤 md 가 규정한 구역을 `ZONES` 순서대로 쓴다. md 가 규정하지 않은 구역은 쓰지 않는다. 구역과 칸은 3절의 구역 조각과 칸 조각을 복사해 채운다.
6. 약속 검사, `pnpm validate:previews --slug {slug}` 를 돌려 막히는 곳을 고친다.

`skeleton.html` 에는 화면 구역과 버튼 구역만 있다. 그 밖의 구역은 구역 조각으로 쓴다. 버튼 구역에는 가장 짧은 칸과 넷을 다 갖춘 칸이 하나씩 있다. 면책 띠의 글은 글자 그대로 둔다(검증기가 본다).

## 7. 온보딩의 임시 폴더 흐름에서 달라지는 것

온보딩 스킬(`.claude/skills/design-md/SKILL.md`)의 흐름은 저자가 `.claude/cache/design-md/{slug}/preview.html` 에 쓰고, 검사하고, 9단계가 끝나면 `public/preview/{slug}/` 로 복사하는 것이다. 이 구조에서는 다음만 달라진다.

- **저자가 쓰는 파일은 그대로 한 장이다.** 임시 폴더의 파일이 곧 서빙될 파일이고, 10단계의 복사(`cp`)도 그대로다. 사이에 빌드나 생성 단계가 없다.
- **틀 링크가 임시 폴더에서도 풀린다.** 9a3 의 대비 관측(`pnpm audit:contrast:staged`)은 임시 파일을 서빙 주소에 얹고 그 아래에 저장소의 `public/` 을 깔아 연다. 그래서 `/preview/_runtime/frame.css` 가 tokens.css 와 똑같이 풀린다. 토스 사본을 저장소 밖 임시 폴더에 두고 돌려 텍스트 요소가 테마마다 325, 대비 미달 83 으로 공통 바탕과 같은 것을 확인했다.
- **9a2 옆에 약속 검사 한 줄이 더해진다**: `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts .claude/cache/design-md/{slug}/preview.html`. 경로 인자를 그대로 받는다. 막히면 9a2 의 검증기와 같이 저자에게 되돌린다.
- 파일을 `file://` 로 직접 열면 틀이 보이지 않는다. tokens.css 와 iframe.js 도 같은 사이트 절대 경로라 원래부터 그렇다.
- 저자 프롬프트와 리뷰어 프롬프트는 이 브랜치에서 고치지 않았다. 지금 저자 프롬프트는 틀 링크와 `--pv-*` 변수를 모른다(STATS 3절).

## 8. 이 구조의 검사가 아닌 것

`prototypes/preview-structure/base-notes/` 의 도구는 공통 바탕을 만들 때 쓴 것이고 고치지 않는 재료다. 이 구조에서 돌릴 필요가 없다.

- `paste-frame.mjs` 는 틀 블록을 각 파일에 붙여 넣는 바탕 단계의 도구다. 이 브랜치에서는 옛 경로의 `frame.css` 를 읽다가 실패한다. 이 구조에서는 쓰지 않는다.
- `check-base.ts` 는 렌더한 넘침과 조작까지 보는 바탕 검사다. 두 슬러그에서 지금도 통과하지만, 자기 구역 목록을 따로 갖고 있어 구역을 바꾸면(문제 3) 틀렸다고 말한다. 이 구조의 구역 목록은 `check-frame.ts` 의 `ZONES` 하나다.
- `toss-rezone.mjs` 와 `toss-dedupe-dark.mjs` 는 바탕을 만든 변환 스크립트다. 토스를 이 구조로 옮긴 스크립트는 `html-frame/to-html-frame.mjs` 이다.
