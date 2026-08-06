# 프리뷰 산문 감사 되돌리기 — bezier (채널톡)

- 날짜: 2026-08-07
- 되돌리는 대상: `454d79a` (PR #251, "프리뷰 산문 감사 9차 — bezier")
- 복원 기준: `fcc53b2` (그 커밋 직전에 `public/preview/bezier/` 를 바꾼 커밋)
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」
- 대장: `2026-08-07-preview-prose-audit-false-positive-ledger.md`

## 무엇이 잘못됐나

`#251` 은 프리뷰 캡션이 `services/bezier.md` 로 뒷받침되지 않는다며 8건을 고쳤다.
**그 판정 기준이 틀렸다** — md 와 프리뷰는 둘 다 같은 Claude Design 핸드오프 번들에서
갈라졌고 md 는 손실 전사다. 캡션 대부분은 **번들 카드의 `.lbl` 라벨을 옮겨 온 것**이라
md 의 침묵은 프리뷰가 지어냈다는 증거가 아니었다.

상류: Claude Design 프로젝트 `Bezier Design System (채널톡)`
(`1f9fa2b7-86c5-48e9-ad4d-9cd3e6ada887`).

## 되돌린 7건 — 상류가 정정 **전** 문구를 담고 있다

`(라이트/다크)` 는 어느 테마에 적용했는지다.

| 컴포넌트 | #251 이 바꾼 것 | 복원 | 상류 근거 |
| --- | --- | --- | --- |
| Button (L·D) | `primary / secondary / **floating**` | `primary / secondary / **tertiary**` | `preview/comp-buttons.html` 의 `<span class="lbl">Primary / Secondary / Tertiary</span>` 와 CSS 주석 `/* tertiary */ .btn.ter{…}`. **`floating` 이라는 버튼 variant 는 그 카드에 없다** — 정정이 오히려 원본에 없는 이름을 넣었다 |
| Badge (L·D) | `count · Primary / Secondary 스토리` | `count · red fill` | `preview/comp-badges.html` 의 `<span class="lbl">Badge (count)</span>` + `.badge{ … background:var(--color-red-400); }`. `Primary / Secondary 스토리` 는 그 카드에 없다 |
| Divider (L·D) | `border-neutral · thickness/indent 변수` | `1px neutral hairline · full/**vertical**` (아래 참고) | `preview/layout-divider.html` 의 `<span class="lbl">Divider — 1px neutral hairline (full / indented / vertical)</span>`. CSS 도 `.divider{height:1px;background:var(--color-border-neutral)}` · `.vert{width:1px}` 로 1px 를 실제로 쓴다 |
| Modal (L) | `radius-20 · elevation-4 · dim-absolute-black` | `radius-20 · elevation-4 · scrim 40%` | `preview/comp-modal.html` 하단 캡션 `Modal r20 · elevation-4 · **black-40 scrim** · …` |
| TextField (L·D) | `--state-input-* ring · focus → indigo · radius-8` | `border = inner-shadow ring; focus → indigo` | 반증 검증이 `preview/comp-inputs.html` 에서 축자 확인 |
| Tabs (L·D) | `accent blue active · radius-6~12` | `line style · indigo active underline` | 반증 검증이 `preview/comp-tabs.html` 의 `<span class="lbl">Tabs — line style, indigo a…</span>` 를 축자 확인. 정정이 넣은 radius 칩은 원본에 없다 |
| CheckableAvatar (L·D) | `선택 = 체크 표식 · z-base/floating` | `선택 = blue ring + check` | 반증 검증이 `preview/comp-avatars.html` 에서 축자 확인 |

**이름을 바꾼 정정이 넷이다**(Button · Badge · Tabs · CheckableAvatar). `CLAUDE.md` 가
경고한 대로 이쪽이 값보다 위험하다 — 값은 틀리면 눈에 띄지만 이름은 굳어져 다음 감사가
그걸 정본으로 삼는다. `floating` 버튼과 `Primary / Secondary 스토리` 는 원본 어디에도
없는 이름이었다.

## 되돌리지 않은 2건 — 정정이 옳았다

| 컴포넌트 | 유지하는 정정 | 근거 |
| --- | --- | --- |
| Toast (**다크만**) | `floating raised bar · grey-800` → `floating dark bar · **이 재현은** grey-800` | 원본은 `<span class="lbl">Toast — floating, dark</span>` + `background:var(--color-fill-neutral-heaviest)` 로만 적고 grey-800 을 Toast 에 부여하지 않는다(grey-800 은 `comp-floating.html` 의 `.fpill`). 정정은 값을 지우지 않고 재현임을 밝혔을 뿐이라 원본과 충돌하지 않는다 |
| Modal (**다크만**) | `scrim 55%` → `dim-absolute-black` | 원본 캡션은 `black-40 scrim` 하나뿐이고 **55% 는 어디에도 없다.** 라이트가 40% 로 맞았던 것과 대조된다 |

> **Modal 은 테마별로 갈린다.** 라이트의 `scrim 40%` 는 원본이 뒷받침하므로 되돌리고,
> 다크의 `scrim 55%` 는 근거가 없으므로 정정을 유지한다. **양 테마를 같은 값으로
> 맞추면 안 된다** — 다크 프리뷰는 스스로 파생물임을 밝히는 자리이고,
> `services/bezier.md` `:336`·`:340` 도 딤을 `--color-dim-absolute-black` 토큰으로만
> 발행할 뿐 알파를 싣지 않는다. 프리뷰의 섹션 헤더가 이미 `딤은 dim-absolute-black.`
> 이라 적고 있어 다크 셀이 그 이름을 반복하는 것도 자연스럽다.

## Divider — 양쪽이 각각 틀렸다

오탐 확증 대장은 bezier 를 **되돌림 6 · 유지 1(Divider)** 로 적었다. 실제로는
**감사도 틀렸고 그 기각도 절반만 맞았다.** 결과 문구는 어느 쪽 원문과도 다르다.

**기각 근거 (1)(2)(3) 은 트리를 잘못 봤다.** 사유가
*"`public/preview/bezier/layout-divider.html` 은 존재하지 않는다 — bezier 프리뷰는
light.html/dark.html 단일 장 구조다"* 였는데, 그 문장은 **로컬 저장소 경로에 대해서만
참이다.** 1단계가 가리킨 것은 **상류 번들의 `preview/layout-divider.html`** 이고
`list_files` 에 실재한다. 클래스명이 다르다는 (2)(3) 도 같은 착각이다 — 상류가 `.lbl`
· `.divider` · `var(--color-border-neutral)` 를 쓰고 로컬이 `.cell-name/.var` ·
`.divider-h/-v` · `var(--border-neutral)` 를 쓰는 것은 **두 파일이 다른 트리에 있기
때문**이지 인용이 거짓이어서가 아니다.

**기각 근거 (5) 는 무효다.** *"md 전체에 Divider 를 1px 로 귀속시키는 서술이 없으므로
1px 는 프리뷰 저자의 렌더링 선택"* — 이것이 바로 `CLAUDE.md` 가 금지한 md 침묵
논증이다. 상류가 `1px neutral hairline` 을 라벨과 CSS 양쪽에 담고 있다.

**그러나 기각 근거 (4) 는 맞다.** *"캡션이 열거한 세 상태 중 indent 는 화면에 없다"* —
로컬 셀은 `.divider-h`(full) 과 `.divider-v`(vertical) 두 개만 그리고, 상류에 있는
`margin-left:16px` + `indent 16` 시연이 이식되지 않았다. 다른 셀은 열거와 시연이
맞는다(Button 의 `primary / secondary / tertiary` 는 셋 다 그린다) — Divider 만
어긋난다.

그래서 **정정 전 문구를 그대로 되살리지 않았다.** 상류가 뒷받침하는
`1px neutral hairline` 은 복원하고, 화면에 없는 `indent` 는 열거에서 뺐다:

```
#251 이 바꾼 것   border-neutral · thickness/indent 변수
정정 전          1px neutral hairline · full/indent/vertical
이 PR            1px neutral hairline · full/vertical
```

> **더 나은 해법은 시연을 이식하는 것이다** — 상류처럼 indent 예시를 셀에 추가하면
> 캡션을 좁힐 필요가 없다. 되돌리기 PR 에서 새 마크업을 넣는 것은 범위 밖이라
> 후속으로 남긴다.

**대장 수정이 필요하다.** bezier 는 **되돌림 7 · 유지 2** 이고(유지 2 = 다크 Toast ·
다크 Modal), 전체 확증 오탐 수는 30 → 31 이다.

> **일반화해서 남긴다.** 반증 검증의 **기각 판정도 같은 방식으로 틀릴 수 있다.** 남은
> 기각 18건 중 16건이 "md 에 0건" · "원본에 없다" 같은 **부재 주장**을 근거로 든다 —
> 이 계열이 무너진 원인이 정확히 부재 주장을 검증 없이 믿은 것이었다. 되돌리기를
> 이어받는 세션은 **기각도 근거 등급으로 재검토할 것.** 특히 경로·파일 이름을 근거로
> 든 기각은 그 경로가 **어느 트리** 것인지 먼저 확인해야 한다. 그리고 Divider 가
> 보여주듯, 한 판정 안에 **맞는 근거와 틀린 근거가 섞여 있을 수 있다** — 결론만 보고
> 통째로 채택하거나 기각하지 말 것.

## 검증

```
validate:previews (bezier)  0 blocking · 8 warn — 기준선(origin/main)과 동일, 신규 0
typecheck PASS   lint PASS   test 37 files / 527 tests PASS
validate:catalog 0 blocking   tokens:check in sync   audit:oklch 0 mismatched
check:last-updated  services/*.md 미변경 — 해당 없음
```

편집은 캡션 문자열뿐이고 마크업·CSS·토큰은 건드리지 않았다. 파일별 변경은
`light.html` 7줄 · `dark.html` 6줄(다크는 Modal·Toast 정정을 유지하므로 하나 적다).
