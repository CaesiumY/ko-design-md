---
paths:
  - "public/preview/**"
  - "src/lib/preview-validator*"
  - "src/lib/validate-preview-cli.test.ts"
  - "scripts/validate-preview.ts"
  - "src/lib/dark-sheet-backlog.ts"
  - "src/lib/preview-dark-copy*"
  - "src/lib/preview-dom-diff*"
  - "scripts/preview-dom-diff.ts"
  - "src/lib/*contrast*"
  - "scripts/*contrast*"
  - "docs/preview-contrast-baseline.md"
  - ".claude/agents/preview-html-*.md"
  - ".claude/skills/design-md/**"
  - ".claude/cache/design-md/**"
  - ".claude/skills/preview-prose-audit/**"
---

# 프리뷰 HTML · 산문 감사 · 대비 게이트

## 프리뷰 HTML

- 검증 폭: **375 / 768 / 976(상세페이지 임베드 폭 — 역사적 사각지대) / 1440**.
  오버플로우는 중간 다열 폭에서 숨는다 — 375px만 보고 통과 판정 금지.
- 가드 요지: content 트랙은 `minmax(0, 1fr)`(bare `1fr` 금지), 다열 grid는 @media
  collapse 필수, 고정폭 자식을 감싼 flex/grid 아이템에 `min-width: 0`, 원자적 컨트롤
  그룹(segmented 등)은 `max-width: 100%` + `min-width: 0`.
- 컬러 표면 위 텍스트는 `var(--primary-foreground)` 계열 토큰 — 흰색 하드코딩 시
  다크 모드에서 대비 붕괴.
- 사이트 chrome은 라이트 고정; `[data-theme="dark"]`는 프리뷰 iframe 전용.
- **다크용 스타일(맨 끝의 `[data-theme="dark"]` 시트)에는 다크에서 달라지는 것만 적는다**(ADR 0015).
  기본은 토큰 재정의다. 달라지는 색은 `[data-theme="dark"]` 아래에서 커스텀 프로퍼티를 다시 정의해 바꾸고,
  토큰으로 옮길 수 없는 곳(로고를 `filter` 로 뒤집는 경우 등)만 그 속성을 바꾸는 규칙으로 남긴다. 라이트 규칙을
  다크 시트에 다시 적은 복사본은 두지 않는다. 검증기가 복사본을 막고, 무엇이 복사본인지의 정의는
  `src/lib/preview-validator.ts` 의 `darkSheetReport` 주석이 정본이다.
  - **이행 중(#734 → #738)**: 아직 걷지 않은 슬러그의 목록(`src/lib/dark-sheet-backlog.ts` 의
    `DARK_COPY_BACKLOG`)에 있는 항목은 복사본이 경고로만 난다. 목록은 줄어들기만 하고 새로 넣지 않는다. 걷은
    PR 이 그 슬러그를 목록에서 뺀다. 빼지 않으면 `pnpm validate:previews` 와 `pnpm test` 가 막는다. 목록이 비면
    목록과 이 문단을 걷는다.
  - **다크가 토큰 밖에서 라이트와 다르게 적는 것의 수는 슬러그별로 같은 파일의 `DARK_OVERRIDE_RULES` 에
    정확값으로 적는다.** 무엇을 세는지의 정의도 `darkSheetReport` 주석이 정본이다. 요지는 커스텀 프로퍼티가 아닌
    속성을 라이트가 주지 않는 값으로 적은 다크 규칙과, 다크에만 있는 `@keyframes`, `@font-face` 블록이다.
    라이트를 그대로 되풀이한 규칙은 이 수에 들지 않고 위의 복사본 검사가 본다. 앞쪽 `<style>` 에 적힌 다크
    규칙과 스코프를 다르게 적은 규칙(`html[data-theme="dark"] .a` 등)도 같은 다크 규칙으로 읽는다.
    "토큰만 허용"으로 막지 않는 대신 그 수를 고정한 것이다. 늘어도 줄어도 `pnpm test` 가 막고, 실패 메시지가
    적을 줄을 말한다. 늘릴 때는 그 규칙이 왜 토큰으로 안 되는지를 PR 에 적는다.
  - **다크 규칙은 평평하게, 스코프를 선택자 맨 앞의 루트 요소에 적는다.** 검증기는 다크 규칙을 같은 선택자의
    라이트 규칙과 짝지어 읽는다. 그렇게 읽을 수 없는 다크 규칙은 목록 여부와 무관하게 그 규칙 자체를 막는다.
    정의와, 그래도 읽지 못하고 지나가는 것의 목록은 `src/lib/preview-validator.ts` 의 `unreadDarkScopes` 주석이
    정본이다. 막히는 꼴은 스코프를 다른 자리에 적은 규칙(`:is([data-theme="dark"]) .a`,
    `body[data-theme="dark"] .a`, `.wrap [data-theme="dark"] .a`), 다른 규칙 안에 중첩해 적은 다크
    규칙(`.a { [data-theme="dark"] & { … } }`, 다크 시트의 규칙 안에 든 규칙), 머리말에 다크 테마를 적은
    at-rule 아래의 규칙(`@scope ([data-theme="dark"]) { .a { … } }`)이다. 같은 이유로 다크를 빼려고 이름을
    적은 라이트 규칙(`:root:not([data-theme="dark"]) .a`)과 `data-theme` 속성을 빌려 쓴 시연
    요소(`button[data-theme="dark"]`)도 막힌다. 라이트는 스코프 없이 적고, `data-theme` 은 페이지의 테마
    스위치로만 쓴다.
  - **복사본을 걷을 때는 보이는 대로 지우지 않는다.** `[data-theme="dark"] .a` 는 선택자가 하나 더 붙어 라이트의
    더 구체적인 규칙을 이기므로, 값이 같은 다크 규칙이 다크 화면을 붙들고 있을 수 있다. 걷기 전 파일과 걷은 뒤
    파일을 `pnpm preview:dom-diff --a <걷기 전> --b <걷은 뒤>` 로 비교해 차이가 없어야 한다. 로컬에서는
    `pnpm exec playwright install chromium` 이 선행이고, 종료 코드는 차이 3, 도구 고장 1, 인자 오류 2 다.
    **이 도구는 프리뷰 기준 이행(#724) 동안만 쓰는 임시 도구다.** 무엇을 비교하는지, 종료 코드, "차이 없음"이
    보장하지 않는 것(`::placeholder` 등)의 정의는 `scripts/preview-dom-diff.ts` 머리 주석이 정본이다.
- **디자인 설명 캡션을 쓰지 않는다**(#499). 시연 자체의 글(히어로 브랜드명·슬로건·CTA, 섹션 제목,
  컴포넌트·목업 안 카피) 밖의 글은 닫힌 목록뿐이다 — `catalog-disclaimer` 띠 · `catalog-dummy`
  더미 데이터 표기 · `catalog-attribution` 줄 · 컴포넌트·상태 이름표(스펙·값 라벨 포함) · 조작 안내 ·
  이미지 자리 표시. md 가 말하지 못하는 것(빌린 토큰 · 값 없이 그린 자리 · 다크 해석)도 문장으로 밝히지
  않는다. **리뷰가 "가정임을 밝혀라"고 하면 노트가 아니라 그 요소의 `(가정)` 표지로 답한다**
  (요소가 목업 `.screen` 안이면 목업 밖 셀 이름표·상태 이름표에 단다 — 더미 데이터 표기와 같은
  규칙). 기준은 `rubric-preview.md` 의 `## Explanatory prose` 이고, 의미 판정이라 검증기로는
  잡지 않는다.

## 프리뷰 산문 감사

**프리뷰 산문을 고치기 전에 `.claude/skills/preview-prose-audit/SKILL.md` 를 반드시 읽을 것.** 판정의 뼈대는
하나다 — **"md에 없음"은 결함의 근거가 아니다**(md는 손실 전사일 수 있다). md 또는 상류가 반증할 때만 결함이고,
상류를 확인 못 하면 판정하지 않고 유보한다.

## 프리뷰 대비 게이트 (`pnpm gate:contrast`)

CI 의 **별도 `contrast` 잡**에서 돈다. 프리뷰 대비를 라이트·다크 × 4폭으로 전수 재고
`docs/preview-contrast-baseline.md` 의 총계 표와 대조해, 개별 미달이 아니라 **그 수가 움직였는지**만
막는다(ADR 0007). 대비와 별개로, 텍스트 요소가 하한 `MIN_TEXT_ELEMENTS` 미만인 얇은 프리뷰도 막는다(ADR 0013). **수치는 CI 가 정본이다** — 폰트 폴백이 OS 마다 달라 줄바꿈과 판정이 바뀔 수 있다.
로컬에서 돌리려면 `pnpm exec playwright install chromium` 이 선행이고, 종료 코드는 어긋남 또는 얇은 프리뷰 3 · `--self-check` 의
측정기 고장 1 · 인자 오류 2 다(정의는 `scripts/audit-contrast.ts`).

**총계 표를 갱신하는 PR 은 발행색 분류표와 보류 사유 표도 함께 다시 낸다** — 그 CI run 번호로
`pnpm audit:contrast:rebaseline <run id>` 를 돌리면 산출물(`contrast-report`)을 받기 전에 묻고, 표와 분류 run
기록을 그 run 으로 다시 쓴 뒤 사람이 쓸 날짜 산문(총계 문장의 날짜와 run 포함)을 남은 일로 찍는다(어긋나면 `pnpm test` 가 막고, 실패 메시지가 이 명령을
가리킨다). 분류표에 행이 있는 항목의 팔레트(`colors:` 나 관찰색 목록)나 항목을 읽는 코드(`paletteOf`, OKLCH 변환)를 바꾸는 PR 도 그 PR 의 CI run 으로 같은 명령을
돌린다 — 분류 run 기록이 분류에 쓴 팔레트의 지문을 담고, 어긋나면 `pnpm test` 가 그 슬러그 이름으로 막는다(#669).
새 항목은 다음 재집계까지 면제되므로 온보딩의 등록처는 늘지 않는다. 비텍스트 `fail`·`borderline` 은 `gate:contrast` 가 warn 만 내므로 비텍스트 쪽은 두 표가
함께 낡을 수 있다.

스킬 루프 안의 `pnpm audit:contrast:staged`(Stage 9a3, ADR 0009)는 미달을 **warn** 으로만 합친다. 테마별 텍스트 요소 수도 CI 와 같은 방식으로 세어, `MIN_TEXT_ELEMENTS` 아래면 얇은 프리뷰 **warn** 을 하나 더한다. 리뷰어는 그 경고가 있으면 컴포넌트 범위 점수(Item 4)를 만점으로 주지 않고, 경고가 남아 있으면 루프가 점수와 상관없이 저자 회차를 더 돈다(3회차까지).
Chromium 이 없거나 측정이 깨지면 exit 0 과 `render.skipped` 를 남기는데, 이것은 "미달 없음"이 아니라
"재지 않음"이다. exit 2 는 호출이나 그 파일이 잘못된 경우뿐이다. 로컬 수치라 기준선과 대조하지 않는다.
