# 조각과 조립 구조 (fragments)

> PROTOTYPE. 구조 겨루기(티켓 729)의 후보 하나다. 버리는 코드이고 main 에 들어가지 않는다.
> 기준은 `prototypes/preview-structure/STANDARD.md` 다. 이 문서는 그 기준을 이 구조에서 어떻게 쓰는지만 적는다.

## 한눈에

- 항목은 프리뷰 HTML 을 직접 쓰지 않는다. **구역마다 조각 파일 하나와 브랜드 스타일 두 장**을 쓴다.
- 공통 뼈대(`<head>`, 면책 띠, `<main>`, 구역 래퍼와 제목, 칸과 이름표와 시연 자리의 감싸개, 틀 스타일)는 조립기가 쓴다.
- 조립기가 둘을 합쳐 서빙되는 `public/preview/{slug}/preview.html` 한 장을 만든다. **그 파일도 커밋한다.** 서빙 주소는 그대로다.
- 원본과 서빙 파일이 어긋나면 `pnpm test` 가 막는다(토큰 사이드카와 같은 방식. 아래 「어긋남 검사」).
- 이 구조로 쓰인 항목은 지금 `chzzk`, `toss` 둘이다. 나머지 항목은 예전처럼 HTML 한 장이고 이 구조와 무관하다.

## 원본이 놓이는 곳과 꼴

```
preview-src/{slug}/
  brand.css           라이트 시트. 첫 <style> 안, 틀 블록 바로 뒤에 그대로 붙는다
  dark.css            다크 시트. 두 번째 <style> 의 내용 그대로
  zones/hero.html     히어로 안쪽(<header class="pv-hero"> 의 안). 네 칸 덜 들여 쓴다
  zones/{구역}.html   그리는 구역마다 하나. 칸 블록만 담는다
```

- 구역 파일의 이름은 `hero` 이거나 `zones.ts` 의 `ZONES` 에 있는 구역 식별자다. `hero` 와 `REQUIRED_ZONES` 에 든 구역은 꼭 있어야 한다. 규정되지 않은 구역은 파일을 만들지 않는다.
- **구역의 순서와 제목은 항목이 정하지 않는다.** 공통 목록 `prototypes/preview-structure/fragments/zones.ts` 의 `ZONES` 한 곳이 정하고, 조립기는 파일이 어떤 순서로 있든 그 순서로 내보낸다.
- **히어로 조각**(`zones/hero.html`)에는 `<header class="pv-hero" data-pv-zone="hero">` 의 안쪽만 쓴다. 감싸개 `<header>` 는 조립기가 쓴다. 담는 것은 STANDARD 1절의 히어로 줄(브랜드 이름, 슬로건, 주요 버튼, 로고)이고, `h1` 하나와 로고 `<img>`(사이트 상대 경로)가 있어야 한다(STANDARD 2절, 6절). 히어로 안의 브랜드 감싸개는 좌우 여백으로 틀이 내주는 `var(--pv-gutter)` 를 쓰고, 히어로는 자기 아래 선을 그리지 않는다(STANDARD 2절, 3절). 칸 문법(`<pv-cell>`, `<pv-label>`, `<pv-screen>`)과 `pv-` class 는 히어로에 쓰지 않는다. 줄은 서빙 파일보다 네 칸 덜 들여 쓴다(조립기가 네 칸을 더한다).
- `<title>` 은 `services/{slug}.md` 의 `name` 에 ` preview` 를 붙여 만든다. 따로 적지 않는다.
- 틀 스타일은 `prototypes/preview-structure/frame.css` 의 `/* pv-frame:start */` 부터 `/* pv-frame:end */` 까지다. 이 파일 한 곳을 고치면 조립할 때 모든 항목에 들어간다. 항목 쪽에는 사본이 없다.
- `--pv-*` 변수는 예전처럼 항목이 `brand.css` 의 `:root` 에서 준다(STANDARD 3절).

### 구역 파일의 칸

```html
<pv-cell name="screen-live-watch" wide stack>
  <pv-label>라이브 시청, 데스크톱 (… 가정)</pv-label>
  <template data-theme-variant="dark"><pv-label>라이브 시청, 데스크톱</pv-label></template>
  <p class="catalog-dummy">방송 제목, … 은 레이아웃 시연용 더미 데이터입니다.</p>
  <pv-screen>
    <div class="screen-desk" role="img" aria-label="라이브 시청 화면 목업">
      …브랜드 마크업 자유…
    </div>
  </pv-screen>
  <div class="specs">…</div>
</pv-cell>
```

| 원본에 쓰는 것 | 서빙 파일에 나오는 것 |
| --- | --- |
| `<pv-cell name="x">` (줄 머리) | `<div class="pv-cell" data-pv-cell="x">` 와 그 안의 `<div class="pv-stage">` |
| `wide` | `pv-cell--wide` |
| `stack` | `pv-stage--stack` |
| `  <pv-label>…</pv-label>` (칸의 첫 줄, 한 줄) | `<p class="pv-label">…</p>` |
| `  <template data-theme-variant="dark"><pv-label>…</pv-label></template>` (있으면 둘째 줄) | `<template …><p class="pv-label">…</p></template>` |
| `  <p class="catalog-dummy">…</p>` (있으면 이름표들 다음 줄) | 그대로 |
| 그 밖의 줄(두 칸 이상 들여 쓴 시연) | 시연 자리 `.pv-stage` 안. 여덟 칸 더 들여 쓴다 |
| `<pv-screen>` / `</pv-screen>` (줄에 홀로) | `<div class="pv-screen">` / `</div>` |
| `</pv-cell>` (줄 머리) | 시연 자리와 칸을 닫는 두 줄 |

- 이름표 안에 마크업을 둘 수 있다. 이름표의 한 조각만 다크에서 달라지면 그 조각 뒤에 `<template data-theme-variant="dark">` 를 이름표 안에 둔다(토스의 다섯 칸. STANDARD 2절).
- 조각에는 `pv-` class 와 `data-pv-zone`, `data-pv-cell` 을 쓰지 않는다. 쓰면 약속 검사가 막는다. `data-pv-toggle`, `data-pv-option` 은 브랜드 마크업의 것이라 쓴다(STANDARD 5절).
- 칸, 이름표, 시연 자리의 서빙 마크업은 `assemble.ts` 의 `assemble()` 끝, 칸을 내보내는 반복문 한 곳에서 쓴다. 이름표는 거기서 두 번 쓰인다(이름표 줄과 다크 `<template>` 안의 이름표 줄). 칸의 마크업 약속을 바꾸면 그 반복문과 `contract.ts` 의 칸 검사를 함께 고치고 `pnpm previews:build` 로 모든 항목을 다시 만든다.
- 칸 사이의 빈 줄은 그대로 서빙 파일에 나온다. 칸 밖에는 빈 줄 말고 아무것도 두지 않는다.

## 한 줄 명령

| 하는 일 | 명령 |
| --- | --- |
| 조립(전부 / 몇 항목) | `pnpm previews:build` / `pnpm previews:build toss` |
| 약속 검사와 어긋남 검사(전부 / 몇 항목) | `pnpm previews:check` / `pnpm previews:check toss` |
| 서빙 파일의 줄에서 원본 찾기 | `pnpm previews:where toss 1772` |
| 아무 HTML 한 장의 약속 검사 | `pnpm previews:check --served <html>` |
| 스테이징 폴더의 원본 검사와 조립 | `pnpm previews:check --slug {slug} --src <폴더>` / `pnpm previews:build --slug {slug} --src <폴더> --out <html>` |
| 이 구조의 테스트 | `pnpm exec vitest run prototypes/preview-structure/fragments` |
| 기존 프리뷰 검증기(그대로) | `pnpm validate:previews --slug toss` |

종료 코드는 0 통과, 1 지적 있음, 2 인자나 파일 잘못이다. 지적은 한 줄에 하나, `파일:줄 — 무엇이 틀렸고 어떻게 고치는지` 꼴이다.

## 약속 검사

`pnpm previews:check` 가 두 층을 본다.

1. **원본의 꼴.** 모르는 구역 파일(이름이 `hero` 도 아니고 `ZONES` 에도 없는 파일), 빠진 필수 구역, 이름표가 없는 칸, 빈 이름표, kebab-case 가 아니거나 두 번 쓰인 칸 이름, 모르는 칸 속성, 닫히지 않은 칸, 칸 밖의 내용, 조각 안에 손으로 쓴 틀 마크업. 지적은 원본 파일과 줄을 가리킨다.
2. **서빙 파일의 약속.** 원본이 깨끗하면 새로 조립한 결과를 읽어 본다: 면책 띠가 `<body>` 의 첫 자식인지, 히어로가 `<main>` 의 첫 자식인지, 구역이 목록 안에 있고 목록 순서이고 한 번씩인지, 구역 제목과 `aria-labelledby`, 칸의 자식 순서(이름표, 다크 이름표, 더미 데이터 표기, 시연 자리). 지적은 그 줄을 만든 원본의 파일과 줄로 옮겨 적고, 괄호에 서빙 파일의 줄을 덧붙인다.

**구역 순서는 원본에서 틀릴 수 없다.** 순서는 공통 목록이 정하기 때문이다. 틀린 순서는 서빙 파일을 손으로 고쳤을 때만 생기고, 그때는 어긋남 검사와 서빙 파일 검사가 함께 잡는다. 아무 HTML 을 직접 보려면 `pnpm previews:check --served <html>` 이다.

## 어긋남 검사

- 조립한 결과와 커밋된 `public/preview/{slug}/preview.html` 이 글자까지 같아야 한다(줄 끝 CRLF 는 무시한다).
- `pnpm previews:check` 가 보고, `pnpm test` 안의 `prototypes/preview-structure/fragments/fragments.test.ts` 도 항목마다 본다. `pnpm test` 는 CI 게이트이므로 어긋난 채로는 머지되지 않는다. 게이트 목록(`src/lib/gates.ts`)과 CI 설정은 고치지 않았다.
- 지적은 처음 달라진 줄을 말하고 `pnpm previews:build {slug}` 를 돌려 그 결과를 함께 커밋하라고 한다.
- 서빙 파일 맨 위 `<head>` 안에 "조립된 파일이다. 손으로 고치지 않는다" 주석이 있다.

## 새 항목을 쓰는 순서

1. `preview-src/{slug}/` 에 `brand.css`, `dark.css`, `zones/hero.html` 과 필수 구역(`REQUIRED_ZONES`)의 조각을 만든다. 치지직과 토스의 원본이 본보기다.
2. `brand.css` 의 `:root` 에 브랜드 토큰과 `--pv-*` 변수를 둔다. `dark.css` 는 `[data-theme="dark"]` 에서 토큰을 다시 정의한다(STANDARD 3, 4절).
3. md 가 규정한 구역마다 `zones/{구역}.html` 을 만들고 칸을 `<pv-cell>` 로 쓴다.
4. `pnpm previews:check {slug}` 로 원본의 꼴을 본다. 처음에는 서빙 파일이 없어 어긋남을 하나 낸다.
5. `pnpm previews:build {slug}` 로 서빙 파일을 만든다.
6. `pnpm previews:check {slug}` 와 `pnpm validate:previews --slug {slug}` 가 둘 다 통과할 때까지 원본을 고치고 4~5를 되풀이한다.
7. 원본 폴더와 서빙 파일을 함께 커밋한다.

## 구역을 더하거나 빼거나 순서를 바꿀 때

구역의 식별자, 제목, 순서를 코드가 읽는 곳은 `prototypes/preview-structure/fragments/zones.ts` 하나다. 조립기, 약속 검사, 변환 스크립트가 모두 이 목록을 읽는다. 사람이 읽는 기준은 `STANDARD.md` 1절의 표다.

1. `zones.ts` 의 `ZONES` 배열에 `{ id, title }` 를 더하거나 고친다. 배열의 순서가 서빙 파일의 구역 순서다. 모든 항목에 꼭 있어야 하는 구역이면 `REQUIRED_ZONES` 에도 넣는다.
2. 순서나 제목만 바꿨으면 항목의 원본은 고치지 않는다.
3. 새 구역에 칸을 옮기려면, 옮길 칸 블록(`<pv-cell …>` 줄부터 `</pv-cell>` 줄까지)을 원래 구역 파일에서 잘라 `preview-src/{slug}/zones/{새 식별자}.html` 에 붙인다. 칸 이름과 내용은 그대로 둔다. 원래 구역 파일에 칸이 하나도 남지 않으면 그 파일을 지운다.
4. 식별자를 바꾸거나 뺐으면 그 이름의 구역 파일이 남은 항목이 없는지 본다. 남아 있으면 약속 검사가 "모르는 구역" 으로 막는다.
5. `pnpm previews:build` 를 slug 없이 돌려 **모든 항목**을 다시 조립한다. 구역 목록은 모든 서빙 파일에 들어가므로 한 항목만 조립하면 나머지가 어긋남으로 막힌다.
6. `pnpm previews:check` 와 `pnpm validate:previews` 를 돌리고, `zones.ts`, 바뀐 원본, 다시 만든 서빙 파일을 함께 커밋한다.

## 온보딩의 임시 폴더 흐름이 바뀌는 곳

지금 흐름(`.claude/skills/design-md/SKILL.md` Stage 9~12)은 저자가 `.claude/cache/design-md/{slug}/preview.html` 한 장을 쓰고 Stage 10 이 그 파일을 `public/preview/{slug}/` 로 복사한다. 이 구조에서는 다음처럼 바뀐다. 스킬과 프롬프트는 이 브랜치에서 고치지 않았다.

| 단계 | 지금 | 이 구조 |
| --- | --- | --- |
| 9a 저자 | `{cache}/preview.html` 을 쓴다 | `{cache}/preview-src/` 에 `brand.css`, `dark.css`, `zones/*.html` 을 쓴다 |
| 9a 직후 (새 단계) | 없음 | `pnpm previews:check --slug {slug} --src {cache}/preview-src` 로 원본 꼴을 보고, `pnpm previews:build --slug {slug} --src {cache}/preview-src --out {cache}/preview.html` 로 조립한다. 원본 꼴의 지적은 9a2 의 기계 지적처럼 저자에게 되돌린다 |
| 9a2, 9a3, 9b | 스테이징 `preview.html` 을 본다 | 그대로. 조립된 `{cache}/preview.html` 을 본다. 지적의 줄을 원본으로 옮기려면 `pnpm previews:where {slug} <줄> --src {cache}/preview-src` |
| 9a 재시도 | 저자가 HTML 을 고친다 | 저자가 조각을 고치고 위 조립을 다시 돌린다 |
| 10 | `preview.html` 을 복사한다 | `{cache}/preview-src/` 를 `preview-src/{slug}/` 로 복사하고 `pnpm previews:build {slug}` 를 돌린다. 원본과 서빙 파일을 함께 커밋한다 |
| 11, 12 | 서빙 파일을 본다 | 그대로 |

`--src` 를 쓸 때도 `<title>` 은 `services/{slug}.md` 에서 읽으므로 Stage 8 이 끝난 뒤에만 조립할 수 있다.

## 검사가 서빙 파일의 줄을 지적했을 때

검증기(`pnpm validate:previews`, 대비 게이트, 리뷰어)는 서빙 파일의 줄로 말한다. 원본은 이렇게 찾는다.

```
pnpm previews:where toss 1772
preview-src/toss/zones/buttons.html:4  ← 원본
  서빙 1772줄: <button class="btn btn-xl btn-brand" type="button">송금하기</button>
```

- 조립은 줄 대 줄이다. 서빙 파일의 줄마다 그 줄을 만든 원본 줄이 정확히 하나 있다.
- `← 공통 뼈대` 로 나오면 항목의 원본이 아니라 `zones.ts`(구역 래퍼와 제목, 히어로 감싸개), `assemble.ts`(`<head>`, 면책 띠, `<main>`) 가 쓴 줄이다. 칸 감싸개와 시연 자리를 여는 줄은 그 칸의 `<pv-cell>` 줄로, 닫는 두 줄은 `</pv-cell>` 줄로 나온다. 틀 블록 줄은 `frame.css` 의 줄로 나온다.
- 서빙 파일이 지금 원본의 조립 결과와 다르면(어긋남) `where` 가 그 사실을 덧붙인다. 그때 줄 번호는 조립 결과 기준이므로 먼저 `pnpm previews:build` 로 맞춘다.
- 원본 줄과 서빙 줄의 관계는 셈으로도 구할 수 있다. 시연 줄은 원본보다 여덟 칸 더 들여 써 있고, 히어로 줄은 네 칸 더 들여 써 있다. 글은 같다.

## 이 구조에 들어온 파일

| 파일 | 하는 일 |
| --- | --- |
| `prototypes/preview-structure/fragments/zones.ts` | 구역 목록과 제목, 필수 구역, 면책 띠 글, 경로 |
| `prototypes/preview-structure/fragments/assemble.ts` | 원본 읽기와 꼴 검사, 조립, 줄의 출처 기록 |
| `prototypes/preview-structure/fragments/contract.ts` | 서빙 파일의 약속 검사 |
| `prototypes/preview-structure/fragments/repo.ts` | 원본 폴더 찾기, 제목 읽기, 어긋남 비교 |
| `prototypes/preview-structure/fragments/cli.ts` | `previews:build`, `previews:check`, `previews:where` |
| `prototypes/preview-structure/fragments/convert.ts` | 공통 바탕의 HTML 한 장을 조각으로 자르는 변환 스크립트(토스, 치지직) |
| `prototypes/preview-structure/fragments/fragments.test.ts` | 약속 검사와 어긋남 검사의 테스트 |
| `preview-src/chzzk/`, `preview-src/toss/` | 두 항목의 원본 |
| `package.json` | 명령 셋(`previews:build`, `previews:check`, `previews:where`) |

수치와 알려진 고장 방식은 같은 폴더의 `STATS.md` 에 있다.
