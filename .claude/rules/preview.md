---
paths:
  - "public/preview/**"
  - "src/lib/preview-validator*"
  - "src/lib/validate-preview-cli.test.ts"
  - "scripts/validate-preview.ts"
  - "src/lib/*contrast*"
  - "scripts/*contrast*"
  - "docs/preview-contrast-baseline.md"
  - ".claude/agents/preview-html-*.md"
  - ".claude/skills/design-md/**"
  - ".claude/cache/design-md/**"
---

# 프리뷰 HTML 과 대비 게이트

## 프리뷰 HTML

- 검증 폭: **375 / 768 / 976(상세페이지 임베드 폭 — 역사적 사각지대) / 1440**.
  오버플로우는 중간 다열 폭에서 숨는다 — 375px만 보고 통과 판정 금지.
- 가드 요지: content 트랙은 `minmax(0, 1fr)`(bare `1fr` 금지), 다열 grid는 @media
  collapse 필수, 고정폭 자식을 감싼 flex/grid 아이템에 `min-width: 0`, 원자적 컨트롤
  그룹(segmented 등)은 `max-width: 100%` + `min-width: 0`.
- 컬러 표면 위 텍스트는 `var(--primary-foreground)` 계열 토큰 — 흰색 하드코딩 시
  다크 모드에서 대비 붕괴.
- 사이트 chrome은 라이트 고정; `[data-theme="dark"]`는 프리뷰 iframe 전용.
- **디자인 설명 캡션을 쓰지 않는다**(#499). 시연 자체의 글(히어로 브랜드명·태그라인·CTA, 섹션 제목,
  컴포넌트·목업 안 카피) 밖의 글은 닫힌 목록뿐이다 — `catalog-disclaimer` 띠 · `catalog-dummy`
  더미 데이터 표기 · `catalog-attribution` 줄 · 컴포넌트·상태 이름표(스펙·값 라벨 포함) · 조작 안내 ·
  이미지 자리 표시. md 가 말하지 못하는 것(빌린 토큰 · 값 없이 그린 자리 · 다크 해석)도 문장으로 밝히지
  않는다. **리뷰가 "가정임을 밝혀라"고 하면 노트가 아니라 그 요소의 `(가정)` 표지로 답한다**
  (요소가 목업 `.screen` 안이면 목업 밖 셀 이름표·상태 이름표에 단다 — 더미 데이터 표기와 같은
  규칙). 기준은 `rubric-preview.md` 의 `## Explanatory prose` 이고, 의미 판정이라 검증기로는
  잡지 않는다.

## 프리뷰 대비 게이트 (`pnpm gate:contrast`)

루트 `CLAUDE.md` 의 검증 커맨드 묶음에 없다 — CI 의 **별도 `contrast` 잡**에서 돈다. 프리뷰 대비를 라이트·다크 × 4폭으로 전수 재고
`docs/preview-contrast-baseline.md` 의 총계 표와 대조해, 개별 미달이 아니라 **그 수가 움직였는지**만
막는다(ADR 0007). **수치는 CI 가 정본이다** — 폰트 폴백이 OS 마다 달라 줄바꿈과 판정이 바뀔 수 있다.

**총계 표를 갱신하는 PR 은 발행색 분류표도 함께 다시 낸다** — 같은 CI 아티팩트(`contrast-report`)로
`pnpm audit:contrast:pairs --findings <contrast-findings.json>` 를 돌린다(어긋나면 `pnpm test` 가 막고, 실패
메시지가 단계를 말한다). 비텍스트 `fail`·`borderline` 은 `gate:contrast` 가 warn 만 내므로 비텍스트 쪽은 두 표가
함께 낡을 수 있다.

스킬 루프 안의 `pnpm audit:contrast:staged`(Stage 9a3, ADR 0009)는 미달을 **warn** 으로만 합친다.
Chromium 이 없거나 측정이 깨지면 exit 0 과 `render.skipped` 를 남기는데, 이것은 "미달 없음"이 아니라
"재지 않음"이다. 로컬 수치라 기준선과 대조하지 않는다.
