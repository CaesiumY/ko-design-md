# 프리뷰 기준 (프로토타입용 요약)

> PROTOTYPE. 버리는 코드의 일부다. 결정의 정본은 `docs/adr/0015-preview-shows-screen-then-same-zones.md` 와 `GLOSSARY.md` 의 프리뷰 절이다.
> 여기 적힌 class 이름과 속성 이름은 구조를 겨루기 위한 **후보**다.

## 1. 무엇을 어떤 순서로 보여 주나

| 순서 | 구역 식별자 | 제목 | 담는 것 | 필수 |
| --- | --- | --- | --- | --- |
| 0 | (없음) | (없음) | 면책 띠 `catalog-disclaimer`. `<body>` 의 첫 자식, 글자 그대로 | 예 |
| 1 | `hero` | (h1 이 제목) | 브랜드 이름, 슬로건, 주요 버튼, 로고 | 예 |
| 2 | `screens` | 화면 | 화면 재현. 하나 이상 | 예 |
| 3 | `buttons` | 버튼 | 버튼의 변형, 크기, 상태 | 발행됐으면 |
| 4 | `inputs` | 입력 | 입력창, 검색, 셀렉트 | 발행됐으면 |
| 5 | `selection` | 선택 | 체크박스, 라디오, 스위치, 칩, 세그먼트 | 발행됐으면 |
| 6 | `navigation` | 내비게이션 | 헤더, 탭, 하단 탭바 | 발행됐으면 |
| 7 | `content` | 콘텐츠 | 카드, 리스트, 배지, 태그 | 발행됐으면 |
| 8 | `feedback` | 피드백 | 다이얼로그, 시트, 토스트, 배너, 로딩 | 발행됐으면 |
| 9 | `brand` | 브랜드 고유 | 위 여섯 어디에도 안 맞는 그 브랜드만의 컴포넌트 | 있으면 |

- 브랜드의 DESIGN.md(`services/{slug}.md`)가 규정하지 않은 구역은 **뺀다**. 빈 구역도, 다른 구역의 토큰을 빌려 추정한 시연도 두지 않는다.
- 남은 구역의 순서와 제목은 그대로다. 제목 글자는 표의 것만 쓴다.
- 토큰 견본표(색 스와치 격자, 타입 스케일 목록)는 금지다. 기존 규칙 그대로다.

## 2. 마크업 약속

```html
<body>
<div class="catalog-disclaimer">…글자 그대로…</div>
<main class="pv-page">

  <header class="pv-hero" data-pv-zone="hero">
    <!-- 안쪽은 브랜드 자유. h1 하나와 로고 <img> 가 있다 -->
  </header>

  <section class="pv-zone" data-pv-zone="screens" aria-labelledby="pv-screens">
    <h2 class="pv-zone-title" id="pv-screens">화면</h2>
    <div class="pv-cells">
      <div class="pv-cell pv-cell--wide" data-pv-cell="screen-live-watch">
        <p class="pv-label">라이브 시청, 데스크톱</p>
        <div class="pv-stage">
          <div class="pv-screen"><!-- 안쪽은 브랜드 자유 --></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pv-zone" data-pv-zone="buttons" aria-labelledby="pv-buttons">
    <h2 class="pv-zone-title" id="pv-buttons">버튼</h2>
    <div class="pv-cells">
      <div class="pv-cell" data-pv-cell="button-primary">
        <p class="pv-label">button-primary, 48 / 44 / 40</p>
        <div class="pv-stage"><!-- 브랜드 마크업 자유 --></div>
      </div>
    </div>
  </section>

  <!-- inputs, selection, navigation, content, feedback, brand 도 같은 꼴 -->
</main>
</body>
```

- 구역은 `<section class="pv-zone" data-pv-zone="{식별자}" aria-labelledby="pv-{식별자}">`, 제목은 `<h2 class="pv-zone-title" id="pv-{식별자}">`.
- 구역 안에는 `.pv-cells` 하나, 그 안에 `.pv-cell` 들. 칸마다 `data-pv-cell="{kebab-case 이름}"`(파일 안에서 유일).
- 칸은 이름표 `<p class="pv-label">` 하나와 시연 자리 `<div class="pv-stage">` 하나를 이 순서로 갖는다.
  넓게 써야 하는 칸은 `pv-cell--wide`, 세로로 쌓는 시연은 `pv-stage--stack` 을 더한다.
- 화면 재현은 `screens` 구역의 칸 안 `.pv-screen` 이다. `.pv-screen` 안은 자유지만 그 안에 `pv-` class 와 구역을 넣지 않는다.
  화면 안 요소의 `(가정)` 표지와 더미 데이터 표기 `catalog-dummy` 는 `.pv-screen` 밖, 그 칸의 이름표 쪽에 둔다(기존 규칙).
- `pv-` 접두는 틀만 쓴다. 브랜드 쪽 class 에 `pv-` 를 쓰지 않는다.
- 다크에서 글이 달라지는 이름표는 기존 방식 그대로 바로 뒤 형제 `<template data-theme-variant="dark">` 로 싣는다.
- 디자인 설명 캡션을 쓰지 않는다. 구역과 칸에 허용되는 글은 이름표, `(가정)` 표지, 더미 데이터 표기, `catalog-attribution`, 조작 안내, 이미지 자리 표시뿐이다.

## 3. 틀 스타일

- 틀의 스타일은 `prototypes/preview-structure/frame.css` 의 `/* pv-frame:start */` 부터 `/* pv-frame:end */` 까지다.
  **공통 바탕 단계에서는 이 블록을 각 프리뷰의 첫 `<style>` 맨 위에 글자 그대로 붙여 넣는다.** 한 글자도 고치지 않는다.
- 페이지 쪽 스타일은 `.pv-*` 선택자에 선언을 더하거나 덮지 않는다.
- 틀은 짜임만 같고 서체와 색은 브랜드 것이다. 항목은 첫 `<style>` 의 `:root` 에서 아래 변수를 자기 토큰으로 준다.

| 변수 | 뜻 | 예 |
| --- | --- | --- |
| `--pv-font` | 본문 서체 | `var(--brand-font-sans)` |
| `--pv-font-display` | 구역 제목 서체(없으면 `--pv-font`) | `var(--brand-font-display)` |
| `--pv-ink` | 기본 글자색 | `var(--brand-text-strong)` |
| `--pv-ink-muted` | 이름표 글자색 | `var(--brand-text-weak)` |
| `--pv-canvas` | 페이지 바탕 | `var(--brand-bg)` |
| `--pv-surface` | 칸 바탕 | `var(--brand-surface)` |
| `--pv-line` | 구역과 칸의 선 | `var(--brand-border-weak)` |
| `--pv-radius` | 칸의 모서리 | `var(--brand-radius-md)` |

- `--pv-*` 값은 브랜드 토큰을 **참조**(`var(--…)`)로만 준다. 그러면 다크에서 브랜드 토큰이 바뀔 때 틀도 따라 바뀐다.
- 이름표 글자색은 칸 바탕 위에서 읽혀야 한다. md 가 정한 보조 글자색을 쓴다.

## 4. 다크

- 두 번째 `<style>`(다크 시트)은 `[data-theme="dark"]` 에서 **토큰을 다시 정의**하는 것이 기본이다.
- 토큰만으로 안 되는 곳은 색 속성만 바꾸는 규칙(델타)을 둘 수 있다. 라이트 규칙을 통째로 복사한 규칙은 두지 않는다.
- `<html data-theme="light">` 로 열리고, 테마 전환은 공용 `iframe.js` 가 맡는다. `prefers-color-scheme` 은 쓰지 않는다.

## 5. 직접 조작

- **손끝 반응**: md 가 규정한 hover, 눌림(`:active`), 초점(`:focus-visible`)을 실제 스타일로 넣는다. md 가 규정하지 않은 반응은 지어내지 않는다.
  전환 속도와 곡선도 md 의 모션 값이 있으면 그 값을 쓴다. `prefers-reduced-motion` 블록은 기존 방식 그대로 둔다.
- **켜고 끄기**:
  - 체크박스, 라디오, 스위치는 진짜 `<input>` 으로 그려 눌리게 한다.
  - 아코디언은 `<details>` 로 그린다.
  - 탭, 세그먼트, 하나만 고르는 칩은 묶음에 `data-pv-toggle="aria-selected"`(또는 `aria-pressed`, `aria-checked`)를,
    선택지에 `data-pv-option` 과 그 속성의 초기값을 달면 공용 `iframe.js` 가 누른 것만 `"true"` 로 바꾼다. 스타일은 그 속성 값으로 건다.
    탭이 가리키는 패널은 두지 않는다(숨은 글자를 만들지 않는다).
- **나란히 그리기**: 셀렉트, 다이얼로그, 메뉴, 토스트는 열지 않고 닫힌 모습과 열린 모습을 칸으로 나란히 그린다.
  기본, hover, 눌림, 비활성을 나란히 그린 칸은 손끝 반응을 넣어도 그대로 둔다.
- 페이지에 자기 `<script>` 를 넣지 않는다. 공용 `iframe.js` 만 쓴다.

## 6. 그대로인 것

- `<head>` 뼈대, `/preview/_runtime/tokens.css`, `/preview/_runtime/iframe.js`(defer), 로고는 사이트 상대 경로 `<img>`.
- 색은 md 의 OKLCH 값. 레이아웃 가드(`minmax(0, 1fr)`, 다열 grid 의 @media 접기, `min-width: 0`)와 검증 폭 375 / 768 / 976 / 1440.
- 텍스트 요소 하한(테마마다 80)을 지킨다. 구역을 옮기다가 시연을 지우지 않는다.
