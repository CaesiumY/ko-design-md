# 구조 "컴포넌트" 안내

> PROTOTYPE. 버리는 코드다. 구조 겨루기의 후보 하나를 실제로 만든 것이고 main 에 들어가지 않는다.
> 프리뷰 기준은 `prototypes/preview-structure/STANDARD.md` 다. 이 안내는 그 기준을 이 구조에서 어디에 어떻게 쓰는지만 적는다.

## 1. 한눈에

- 항목마다 **화면 코드 모듈**(`entries/{slug}/preview.ts`)이 있다. 모듈은 공용 부품(페이지, 구역, 칸)을 불러 브랜드의 시연 마크업을 넘긴다.
- **빌드**가 모듈을 읽어 서빙되는 정적 HTML 한 장(`public/preview/{slug}/preview.html`)을 쓴다. 사이트의 머리글과 바닥글, 사이트 스타일은 들어가지 않는다.
- 틀의 태그는 부품만 쓴다: `<head>`, 면책 띠, `main.pv-page`, `header.pv-hero`, `section.pv-zone` 과 제목, `.pv-cells`, `.pv-cell`, 칸의 이름표, 다크 이름표의 `<template>`, 칸의 더미 데이터 표기, `.pv-stage`, `.pv-screen`. 틀 CSS 는 `frame.css` 에서 읽어 넣는다.
- 모듈은 **브랜드의 시연과 스타일만** 갖는다: 히어로 안쪽, 칸마다 이름표의 글, 시연 자리 안쪽 마크업, 그리고 브랜드 CSS 두 장(`light.css`, `dark.css`).
- 만들어진 HTML 은 **커밋한다**. 원본과 어긋나면 `pnpm test` 가 막는다(5절).

경로는 모두 저장소 루트 기준이다. 이 폴더는 `prototypes/preview-structure/components/` 이고 아래에서 `components/` 로 줄여 쓴다.

## 2. 원본이 어디에 어떤 꼴로 놓이나

```
prototypes/preview-structure/
  frame.css                     틀 CSS. 빌드가 블록을 글자 그대로 첫 <style> 맨 위에 넣는다
  components/
    kit/zones.ts                고정 구역 목록 하나(식별자, 제목, 순서)
    kit/parts.ts                부품(definePreview, zone, cell, screen)과 렌더. 틀의 태그를 쓰는 유일한 곳
    kit/check.ts                약속 검사
    kit/entries.ts              항목 폴더를 찾고 빌드한다
    build.ts                    pnpm pv:build, pnpm pv:check
    where.ts                    pnpm pv:where
    convert.ts                  서빙 HTML 을 항목 폴더로 옮기는 변환 스크립트
    components.test.ts          약속 검사의 테스트와 어긋남 검사(pnpm test 에 들어간다)
    entries/{slug}/preview.ts   항목 모듈(손으로 쓰는 원본)
    entries/{slug}/light.css    첫 <style> 의 브랜드 쪽(틀 블록 뒤). :root 토큰과 --pv-* 변수, 컴포넌트 스타일
    entries/{slug}/dark.css     둘째 <style>(다크 시트) 전체
public/preview/{slug}/preview.html   빌드 산출물. 커밋한다. 손으로 고치지 않는다
```

항목 모듈의 꼴:

```ts
import { cell, definePreview, screen, zone } from "#preview-kit"

export default definePreview({
  slug: "chzzk",
  title: "치지직 preview",          // <title>
  // noindex: true,                 // <meta name="robots" content="noindex"> 를 더한다
  hero: `
<div class="hero-wrap">
  <h1>…</h1>
</div>
`,                                  // header.pv-hero 의 안쪽
  zones: [
    zone("screens", [
      screen({
        name: "screen-live-watch",   // data-pv-cell. kebab-case, 파일 안에서 유일
        label: "라이브 시청, 데스크톱 (… 가정)",           // 칸 이름표의 안쪽 HTML
        labelDark: "라이브 시청, 데스크톱 (… 가정)",       // (있으면) 다크에서 이름표 전체가 다를 때
        dummy: "방송 제목, … 더미 데이터입니다.",          // (있으면) 칸의 더미 데이터 표기
        wide: true,                  // pv-cell--wide
        stack: true,                 // pv-stage--stack
        screen: `
<div class="screen-desk" role="img" aria-label="…">…</div>
`,                                  // .pv-screen 의 안쪽
        after: `
<div class="specs">…</div>
`,                                  // (있으면) 시연 자리 안, 화면 뒤
      }),
    ]),
    zone("buttons", [
      cell({ name: "button-variants", label: "button, 변형과 상태", stack: true, stage: `
<div class="vrows">…</div>
` }),                                // stage: .pv-stage 의 안쪽
    ]),
  ],
  // attribution: "…",               // (있으면) 구역들 뒤의 catalog-attribution 줄 안쪽
})
```

- `#preview-kit` 은 `package.json` 의 `imports` 가 `components/kit/parts.ts` 로 잇는다. 그래서 모듈을 어느 폴더에 두든(온보딩의 임시 폴더라도) 같은 줄로 부품을 부른다.
- 화면 구역(`"screens"`)에는 `screen(...)` 만, 다른 구역에는 `cell(...)` 만 넣을 수 있다. 어기면 타입 검사가 막는다. 모르는 구역 이름과 이름표 없는 칸도 타입 검사에서 걸린다.
- **구역은 모듈에 적은 순서가 아니라 `kit/zones.ts` 의 순서로 나온다.** 구역을 빼려면 그 `zone(...)` 을 지운다.
- 이름표가 일부만 다크에서 바뀌면 `label` 의 HTML 안에 `<span data-theme-text>…</span><template data-theme-variant="dark" data-theme-op="swap">…</template>` 를 그대로 쓴다(토스의 `button-state` 칸). 이름표 전체가 바뀌면 `labelDark` 를 쓴다(치지직).
- 마크업은 **꼬리표 없는 템플릿 리터럴**(백틱)이다. 여는 백틱 바로 뒤에서 줄을 바꾸고, 내용은 아무 들여쓰기로 써도 된다. 빌드가 공통 들여쓰기를 걷고 제자리 깊이로 다시 들여 쓴다. 줄 순서와 줄 수는 그대로 서빙 HTML 에 들어간다.
  - 리터럴 안의 `` ` `` 는 `` \` ``, `${` 는 `\${`, `\` 는 `\\` 로 쓴다.
  - `html` 이나 `css` 같은 꼬리표를 붙이지 않는다. prettier 가 꼬리표 붙은 리터럴의 안쪽을 다시 포맷한다.
- CSS 두 장은 빌드가 **글자 그대로** 싣는다. `light.css` 는 틀 블록 바로 뒤에 붙고, `dark.css` 는 둘째 `<style>` 의 전부다.
  `.prettierignore` 가 이 CSS 를 포맷 대상에서 뺀다. `prettier --write` 를 폴더째 돌리지 않는다(CSS 를 다시 쓰면 서빙 HTML 이 바뀐다).
- 틀 CSS 와 면책 띠, `<head>` 는 모듈에 쓰지 않는다. 바꿀 일이 있으면 7절의 공용 자리를 고친다.

## 3. 한 줄 실행 명령

| 하는 일 | 명령 |
| --- | --- |
| 모든 항목을 빌드해 `public/preview/{slug}/preview.html` 을 쓴다 | `pnpm pv:build` |
| 한 항목만 빌드 | `pnpm pv:build toss` |
| 아무것도 쓰지 않고 약속 검사와 어긋남 검사 | `pnpm pv:check` (또는 `pnpm pv:check toss`) |
| 아무 HTML 파일에 약속 검사만 | `pnpm pv:check --file <html>` |
| 항목 폴더 하나를 아무 곳으로 빌드(온보딩) | `pnpm pv:build --entry <항목 폴더> --out <html>` |
| 서빙 HTML 의 줄에서 원본 찾기 | `pnpm pv:where toss 1768 1570` |
| 기존 프리뷰 검증기 | `pnpm validate:previews --slug toss` |

빌드는 약속 검사를 먼저 돌리고, 걸리면 **아무것도 쓰지 않는다**. 고친 뒤에는 늘 `pnpm pv:build <slug>` 로 다시 만들고 산출물까지 함께 커밋한다.

## 4. 약속 검사

세 겹이다.

1. **타입**(`pnpm typecheck`, 곧 `tsc --noEmit`): 모르는 구역 이름, `name` 이나 `label` 이 빠진 칸, 화면 구역에 `cell(...)` 을 넣거나 다른 구역에 `screen(...)` 을 넣은 것.
2. **`kit/check.ts`**: 만들어진 HTML(빌드 중이든 서빙 파일이든)을 읽는다. 잡는 것:
   - 구역 순서가 `kit/zones.ts` 와 다름, 목록에 없는 구역, 같은 구역 두 번, 히어로 바로 뒤가 화면이 아님, 빈 구역
   - 구역 제목의 글자, `id`, `aria-labelledby` 가 어긋남
   - 칸에 이름표가 없거나 비어 있음, 칸 자식의 순서(이름표, 다크 이름표, 더미 데이터 표기, 시연 자리), `data-pv-cell` 이 kebab-case 가 아니거나 겹침
   - 다크 이름표가 글이 있는 `p.pv-label` 이 아님, 화면 칸이 아닌데 `.pv-screen` 이 있거나 화면 칸에 없음, `.pv-screen` 안의 틀 class 와 `data-pv-*`
   - 면책 띠가 `<body>` 첫 자식이 아님, 히어로의 h1 이 하나가 아님, 자기 `<script>`, 브랜드 CSS 가 `.pv-*` 나 `[data-pv-*]` 선택자를 쓰거나 `--pv-gutter` 를 정의함
3. **어긋남**: 서빙 파일이 모듈을 빌드한 결과와 한 글자라도 다르면 막는다.

돌리는 곳

- `pnpm pv:check`: 2와 3. 문제마다 `파일:줄 [구역/칸] 메시지` 로 찍고 exit 1.
- `pnpm test`: `components/components.test.ts` 가 2의 규칙을 시험하고(틀린 구역 순서, 모르는 구역, 이름표 없는 칸, 빈 이름표, 틀 선택자), 항목마다 2와 3을 돈다. CI 의 `pnpm test` 가 이것을 막는다.
- 테스트 파일 하나만: `pnpm exec vitest run prototypes/preview-structure/components`.

메시지 예

```
public/preview/toss/preview.html:1810 [buttons/bottom-info] 칸 buttons/bottom-info 에 이름표(p.pv-label)가 없다. 칸마다 이름표 하나를 단다
public/preview/toss/preview.html:1811 이 prototypes/preview-structure/components/entries/toss 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). 서빙 파일이 아니라 항목 모듈을 고치고 pnpm pv:build toss 로 다시 만든다. 원본 줄은 pnpm pv:where toss 1811
```

검사 규칙을 더할 때는 `kit/check.ts` 에 규칙을, `components.test.ts` 에 그 규칙을 어긴 입력이 잡히는 테스트를 더한다. 부품이 새 약속대로 쓰게 하려면 `kit/parts.ts` 를 고친다(7절).

## 5. 만들어진 HTML 을 커밋하는 까닭과 어긋남

- 사이트, 프리뷰 검증기, 대비 측정, E2E 는 모두 `public/preview/{slug}/preview.html` 을 읽는다. 산출물을 커밋하면 이 도구들과 사이트 빌드는 하나도 바뀌지 않는다.
- 대신 원본(모듈과 CSS)과 산출물이 어긋날 수 있다. 서빙 파일을 손으로 고치거나, 모듈을 고치고 빌드를 잊은 경우다. `pnpm test`(`served previews` 묶음)와 `pnpm pv:check` 가 막고, 메시지가 다시 만드는 명령을 말한다.
- `frame.css`, `kit/zones.ts`, `kit/parts.ts` 를 고치면 **모든 항목의 산출물이 달라진다.** `pnpm pv:build` 로 모두 다시 만들어 함께 커밋한다.

## 6. 새 항목을 쓰는 순서

1. `entries/{slug}/` 폴더를 만들고 `preview.ts`, `light.css`, `dark.css` 를 둔다. 가장 빠른 길은 `entries/chzzk/` 를 복사해 시작하는 것이다.
2. `light.css` 맨 위의 `:root` 에 브랜드 토큰과 틀 변수(`--pv-font`, `--pv-ink`, `--pv-ink-muted`, `--pv-canvas`, `--pv-surface`, `--pv-line`, `--pv-radius`, 선택으로 `--pv-title-weight`, `--pv-tracking`)를 둔다(STANDARD 3절). `dark.css` 에는 `[data-theme="dark"] { … }` 토큰 재정의를 둔다(STANDARD 4절).
3. `preview.ts` 에 `slug`, `title`, `hero`, 그리고 md 가 규정한 구역만 `zone(...)` 으로 쓴다. 칸마다 `name`, `label`, `stage`(화면이면 `screen`).
4. `pnpm typecheck` 로 타입을 본다(느리면 `pnpm exec tsc --noEmit`).
5. `pnpm pv:build {slug}` 로 산출물을 쓴다. 약속 검사에 걸리면 메시지의 `구역/칸` 을 모듈에서 고친다.
6. `pnpm validate:previews --slug {slug}`, `pnpm pv:check {slug}`.
7. `pnpm exec prettier --write prototypes/preview-structure/components/entries/{slug}/preview.ts`(포맷 검사는 ts 만 본다).
8. 원본 셋과 산출물을 함께 커밋한다.

## 7. 공용 자리를 고칠 때

| 바꾸려는 것 | 고칠 곳 | 그다음 |
| --- | --- | --- |
| 틀의 모양(구역 제목 글씨, 간격, 칸) | `prototypes/preview-structure/frame.css` 의 블록 | `pnpm pv:build` |
| 틀의 태그와 속성(칸, 이름표, 구역의 마크업) | `components/kit/parts.ts` 의 `renderCell`, `renderZone` | 약속이 바뀌면 `kit/check.ts` 와 테스트, `pnpm pv:build`. **주의**: `pnpm pv:where` 는 이 태그들의 들여쓰기와 첫머리로 줄을 센다(아래 첫 항목). 속성을 더하는 것은 괜찮지만, 들여쓰기를 바꾸거나 태그를 줄로 쪼개거나 겉 요소를 한 겹 더하면 `where.ts` 의 정규식도 같이 고치고 `pnpm pv:where` 로 칸 하나를 짚어 본다 |
| 구역의 목록, 제목, 순서 | `components/kit/zones.ts` 한 곳 | 아래 「구역을 더하거나 순서를 바꾸는 법」 |
| `<head>`, 면책 띠 | `components/kit/parts.ts` 의 `renderUnchecked`, `DISCLAIMER` | `pnpm pv:build` |

- `pnpm pv:where` 는 부품이 칸을 6칸, 칸의 이름표와 시연 자리를 8칸, `.pv-screen` 을 10칸 들여 쓴다고 보고 줄을 센다. `renderCell` 의 들여쓰기를 바꾸면 `where.ts` 의 정규식도 같이 바꾼다. 속성을 더하는 것은 괜찮다.
- 공통 바탕의 도구(`base-notes/check-base.ts`, `base-notes/paste-frame.mjs --check`)도 산출물에 그대로 쓸 수 있다. 다만 `check-base.ts` 의 구역 목록은 그 파일 안에 따로 있다(아래).

### 구역을 더하거나 순서를 바꾸는 법

구역 목록은 `components/kit/zones.ts` 의 `ZONES` 배열 하나다. 항목 하나가 `{ id, title }` 이고, 배열의 순서가 곧 페이지의 순서다. 이 배열에서 나오는 것:

- 타입 `ZoneId`(모듈의 `zone("…", …)` 에 쓸 수 있는 이름). 배열에 더하면 그 이름을 쓸 수 있고, 빼면 그 이름을 쓴 모듈이 타입 검사에서 걸린다.
- 빌드의 순서. 부품이 구역을 이 배열 순서로 늘어놓으므로 **순서를 바꾸는 일은 배열의 자리만 바꾸는 것**이고, 항목 모듈은 고치지 않는다.
- 구역 제목(`h2` 의 글자)과 약속 검사(`kit/check.ts`)의 순서, 모르는 구역, 제목 판정.

새 구역이 무엇을 받는지: `zone()` 은 `"screens"` 에만 `screen(...)` 칸을, 나머지 모든 구역에는 `cell(...)` 칸을 받는다(`kit/parts.ts` 의 `zone` 겹침 선언). 그래서 배열에 더한 구역은 따로 손대지 않아도 버튼이나 콘텐츠 같은 보통 구역이 된다. 화면 칸처럼 다른 칸을 받게 하려면 `zone` 선언과 `renderCell`, `kit/check.ts` 의 `.pv-screen` 규칙을 함께 고친다.

순서:

1. `kit/zones.ts` 의 `ZONES` 에 `{ id: "…", title: "…" }` 를 원하는 자리에 넣거나, 항목의 자리를 옮긴다. `id` 는 kebab-case 영문, `title` 은 구역 제목 글자다.
2. 칸을 새 구역으로 옮기려면 그 항목 모듈에서 `cell({ … })` 덩어리를 원래 `zone(...)` 배열에서 잘라 `zone("새 id", [ … ])` 안에 넣는다. 모듈 안 `zone(...)` 들의 순서는 상관없다. 칸을 다 옮겨 빈 `zone` 이 남으면 지운다(빈 구역은 약속 검사가 막는다).
3. `pnpm typecheck` 뒤 `pnpm pv:build` 로 **모든 항목**을 다시 만든다(순서가 바뀌면 모든 산출물이 바뀐다).
4. `pnpm pv:check`, `pnpm exec vitest run prototypes/preview-structure/components`. 테스트의 견본 페이지(`components.test.ts` 의 `sample`)가 기대하는 구역 순서와 어긋나면 그 테스트의 기대를 새 순서에 맞춘다.
5. 산출물과 함께 커밋한다.

구역 목록이 `ZONES` 말고도 적혀 있는 곳(이 구조의 빌드와 약속 검사는 읽지 않는다):

- `prototypes/preview-structure/base-notes/check-base.ts` 의 `ZONES`: 공통 바탕의 점검 도구다. 고치지 않으면 새 순서의 산출물을 "순서가 틀렸다"고 본다. 이 구조의 약속 검사는 `pnpm pv:check` 다.
- `prototypes/preview-structure/STANDARD.md` 1절의 표: 기준 문서다.
- `components/where.ts` 는 구역 목록을 쓰지 않는다(구역 이름을 몰라도 줄을 찾는다).

## 8. 온보딩(`/design-md` Stage 9~12)의 임시 폴더 흐름이 바뀌는 곳

지금 흐름: 저자 에이전트가 `{cache_dir}/preview.html` 한 장을 쓰고, 9a2 검증기, 9a3 대비 관측, 9b 리뷰어가 그 파일을 읽고, Stage 10 이 그 파일을 `public/preview/{slug}/` 로 복사한다.

이 구조에서:

| 단계 | 바뀌는 것 |
| --- | --- |
| 9a 저자 | `{cache_dir}/preview.html` 대신 항목 폴더 `{cache_dir}/entry/` 에 `preview.ts`, `light.css`, `dark.css` 를 쓴다 |
| 9a1 빌드(새 단계) | `pnpm pv:build --entry {cache_dir}/entry --out {cache_dir}/preview.html`. 타입이나 약속 검사에 걸리면 9a2 의 기계 재시도와 같이 그 메시지를 저자에게 돌려준다 |
| 9a2, 9a3, 9b | 그대로. 모두 빌드된 `{cache_dir}/preview.html` 을 읽는다. 리뷰어가 줄을 지적하면 `pnpm pv:where` 는 쓸 수 없다(항목이 아직 `entries/` 에 없다). 칸 이름(`data-pv-cell`)으로 모듈을 찾는다 |
| 10 쓰기 | `cp preview.html` 대신 `{cache_dir}/entry/` 를 `components/entries/{slug}/` 로 복사하고 `pnpm pv:build {slug}`, `pnpm exec prettier --write …/entries/{slug}/preview.ts`, `pnpm pv:check {slug}` |
| 12 자동 수정 | 저자가 `{cache_dir}/entry/` 를 다시 쓰고, 9a1 과 10 을 다시 돈다 |

임시 폴더도 저장소 안(`.claude/cache/…`)이라 모듈의 `#preview-kit` 이 그대로 풀린다. 저장소 밖 폴더에서는 풀리지 않는다.

## 9. 검사가 서빙 HTML 의 줄을 지적했을 때 원본 찾기

```
pnpm pv:where toss 1768
public/preview/toss/preview.html:1768  ->  prototypes/preview-structure/components/entries/toss/preview.ts:258  (칸 button-size 의 label. …)
```

명령이 하는 일, 그리고 손으로 하는 법:

1. 그 줄이 `<style>` 안이면: 첫 `<style>` 의 `/* pv-frame:end */` 까지는 `frame.css`, 그 뒤는 `light.css`, 둘째 `<style>` 은 `dark.css` 다. 줄은 글자 그대로라 `light.css` 의 줄 번호는 (서빙 줄 − `pv-frame:end` 줄)이다.
2. 그 줄에서 위로 올라가 가장 가까운 `data-pv-cell="…"` 을 찾는다. 이것이 칸 이름이다. 모듈에서 `name: "그 이름",` 을 찾는다.
3. 칸 안의 줄이면:
   - `<p class="pv-label">`, 다크 이름표 `<template>`, `catalog-dummy` 줄은 그 칸의 `label`, `labelDark`, `dummy` 값이다.
   - 시연 자리(`.pv-stage`) 안이면 그 칸의 `stage` 리터럴이다. 화면 칸이면 `.pv-screen` 안은 `screen`, `.pv-screen` 이 닫힌 뒤는 `after` 다.
   - 리터럴의 첫 줄(여는 백틱 다음 줄)이 조각의 첫 줄이다. 서빙 줄이 조각의 k 번째 줄이면 모듈에서도 k 번째 줄이다. 글자는 들여쓰기만 다르다.
4. 히어로(`header.pv-hero`) 안이면 `hero` 리터럴, 같은 셈이다.
5. 그 밖의 줄(`<head>`, 면책 띠, 구역 겉, 칸 겉, 여닫는 `pv-` 태그)은 `kit/parts.ts` 가 쓴 줄이라 모듈에 없다.

고친 뒤에는 `pnpm pv:build {slug}` 로 다시 만들고 `pnpm pv:check {slug}`. 서빙 줄 번호는 빌드 뒤 바뀔 수 있다.

## 10. 변환 스크립트

`components/convert.ts` 가 서빙 HTML 한 장(STANDARD 2절의 꼴)을 항목 폴더로 옮긴다. 치지직과 토스 둘 다 이것으로 옮겼고 손으로 마무리한 곳은 없다.

```
pnpm exec tsx prototypes/preview-structure/components/convert.ts --in <preview.html> --out prototypes/preview-structure/components/entries/<slug>
pnpm exec prettier --write prototypes/preview-structure/components/entries/<slug>/preview.ts
pnpm pv:build <slug>
```

- 원본 조각은 parse5 의 위치 정보로 잘라 글자 그대로 옮긴다. 들여쓰기만 걷는다.
- 부품이 쓰는 꼴과 다른 틀 태그(이름표에 다른 속성, 화면 앞의 다른 요소, 공용 면책 띠와 다른 글)를 만나면 멈추고 그 줄을 말한다.
- `<head>` 는 `title`, `lang`, `noindex` 만 옮긴다. 부품의 `<head>` 와 다른 줄(토스의 `<html …><head>` 한 줄, `defer=""`)은 산출물에서 부품의 꼴로 바뀐다. 화면에는 차이가 없다.
