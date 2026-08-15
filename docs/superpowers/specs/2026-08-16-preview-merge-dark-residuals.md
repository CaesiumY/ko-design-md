# 병합 프리뷰 — 다크 잔존 불일치 (2026-08-16)

PR #285 (light.html + dark.html → preview.html) 의 미해소 부채. 라이트는 17개
슬러그 전부 원본과 계산 스타일까지 일치하고, **다크만** 어긋난다. 이 문서는 그
잔존분의 원인·검증 방법·기각한 접근을 남긴다. 세션이 바뀌어도 같은 실패를
반복하지 않기 위한 것이다.

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

### seed-design — 스코프가 명시도를 올려 tokens.css 를 이긴다

`.sd-tag { font-weight: 500 }` 은 라이트·다크 양쪽에 똑같이 있다. 스코프가
`[data-theme="dark"] .sd-tag` (0,2,0) 으로 만들면서 `tokens.css` 의
`.catalog-disclaimer b` (0,1,1) 를 이겨버린다. 원본 dark.html 에서는 tokens.css 가
정당하게 이겨 600 이었다.

라이트 쪽 처치로는 닿지 않는다. 다크 스코프의 명시도를 원본 관계가 보존되도록
조정해야 하는데, 아래 기각 목록이 보여주듯 전역 조정은 전부 다른 슬러그를 깬다.

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

## 다음에 할 일

1. 라이트 스코핑 적용 — `[data-theme="light"]` 표기 필수
2. baemin — 런타임이 `<template>` 대신 주석 노드 마커를 쓰도록
3. seed-design — 다크 명시도, 별도 처치

1 번은 검증까지 끝난 상태이고 2·3 번은 설계만 있다.
