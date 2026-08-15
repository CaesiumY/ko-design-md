# 프리뷰 산문 감사 되돌리기 — toss · socar · 11st

- 날짜: 2026-08-07
- 되돌리는 대상: `05bce48`(#236, toss) · `2d0fca7`(#216, socar) · `2d63f73`(#250, 11st)
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」
- 대장: `2026-08-07-preview-prose-audit-false-positive-ledger.md`
- 선행: `2026-08-07-preview-prose-audit-revert-bezier.md` (#258)

## 방법 — 이번엔 통째로 복원하지 않았다

bezier 는 8건 중 7건이 오탐이라 **감사 직전 커밋으로 통째 복원한 뒤 정당한 것만
재적용**하는 편이 안전했다. **이 세 슬러그는 반대다** — toss 7건 중 2건, socar 7건 중
1건, 11st 4건 중 1건만 되돌린다. 유지할 것이 압도적으로 많으면 재적용 목록이 길어지고
**거기서 누락이 난다**(실제로 첫 시도에서 11st 더미 캡션 2건과 socar 푸터 삭제를
빠뜨려 복원돼 버렸다).

그래서 **`origin/main` 에서 시작해 되돌릴 것만 적용**했다. 각 치환은 건수를 단언한다 —
1건이 아니면 실패로 잡힌다. 이 단언이 실제로 사고를 막았다: socar 의
`background: var(--sf-information-weak);` 는 파일에 **7번** 나오는데 감사가 바꾼 것은
`.sf-chip.selected` 블록 안 하나뿐이었다. 무조건 치환했다면 나머지 6곳을 조용히
오염시켰을 것이다.

> **규칙으로 남긴다.** 되돌릴 비율이 절반을 넘으면 통째 복원, 그 아래면 `main` 에서
> 되돌릴 것만 적용. 어느 쪽이든 **치환 건수를 단언**한다.

## toss — 되돌림 2 (#236)

| 표면 | `#236` 이 바꾼 것 | 복원 |
| --- | --- | --- |
| CHIP row-label (L·D) | `CHIP · resting / active / brand · removable **(md 에 없는 이 프리뷰의 재현)**` | 괄호 제거 |
| Segmented comp-caption (L·D) | L `grey-100 track · white selected segment · underline tab` / D `grey-100 track · grey-200 selected segment (이 프리뷰의 다크 재현) · underline tab` | 둘 다 `pill 3-segments · underline tab` |

근거: 원본 `Toss Design System`(`019dd010-b4cf-7d7a-b1a9-7f63633fecff`)의
`preview/chip.html` 이 `removable` 을 실제로 정의하고, `preview/segmented-control.html`
이 `<div class="lab">PILL · 2 segments</div>` 등으로 **PILL 과 segment 수**를 라벨에
싣는다. 즉 `pill 3-segments` 는 번들 어휘였고 `md 에 없는` 은 md 의 침묵일 뿐이었다.

### 유지한 정정 4건

- 다크 히어로 lede 2문장 — 원본이 라이트 전용이고 `colors_and_type.css` 에 다크 alias
  블록이 아예 없다. 다크 프리뷰가 스스로 파생물임을 밝히는 것이 맞다.
- 다크 `STATE · pressed (흰색 16% overlay)` → `(이 프리뷰의 다크 재현)` — README 가
  pressed 를 `--tds-press-overlay: rgba(0,0,0,0.26)` **단일 규칙**으로 못박는다.
  라이트 프리뷰가 이미 `검정 26% overlay` 로 맞게 쓰고 있는 것이 방증이다.
- `PALETTES 10 families` → `8 families` (L·D) — 경계 사례다. CORE PALETTE 의 색 이름
  접두사는 정확히 10개지만 원본 자신이 `--tds-white`/`--tds-black` 을 `/* Greyscale */`
  주석 블록 **안에** 넣어 별도 패밀리로 취급하지 않고, md `:652` 와 사이드카도 8로
  센다. **원본이 10을 부정한다고 말할 수는 없으나 8 쪽이 더 방어 가능해 유지한다.**

### 기각이 유지된 1건

`segmented · search · progress · … · filter chips` 뒤에 붙은
`— 아래 카드의 치수와 변형은 md 가 싣지 않는 범위에서 이 프리뷰의 재현이에요` 는
**아무것도 삭제하지 않고 덧붙이기만 했다.** 되돌릴 값·상태·이름이 없으므로 오탐
유형이 성립하지 않는다.

> **다만 후속 검토감이다.** 이 caveat 는 8개 컴포넌트의 치수·변형을 싸잡아 "이 프리뷰의
> 재현" 으로 말하는데, 그중 일부는 번들이 실제로 발행한다(`chip.html` 의 `removable`,
> `segmented-control.html` 의 `PILL · 2 segments` 가 이 PR 로 확인됐다). **충실한 전사를
> 창작으로 격하하는 것도 프로비넌스 오류다.** 8개를 전수 대조해 범위를 좁히는 것은
> 별도 작업으로 남긴다.

## socar — 되돌림 1 (#216)

| 표면 | `#216` 이 바꾼 것 | 복원 |
| --- | --- | --- |
| Accordion panel-note (L·D) | `각 항목은 질문 + 셰브론 trigger 행과 답변 panel 로 구성된다.` | `셰브론은 펼침 시 180° 회전한다.` |

근거: 원본 `SOCAR Frame Design System`(`c29a1743-9b80-4a6b-8019-e82abdf727cc`)의
`preview/component-accordion.html` 이 `.chev { transition: transform 100ms … }` 로
셰브론 회전을 실제로 구현한다. 감사는 md 에 그 서술이 없다는 이유로 지웠다.

### 유지한 정정 4건

- 히어로 meta-chip `카셰어링 · 10분 단위` · `전국 5,000여 쏘카존` → `한국 최대
  카셰어링` · `전국 쏘카존` — 76KB 크롤 코퍼스·component-specs·README 어디에도
  `10분`·`5,000`·`쏘카존` 문자열이 0건이고, 대체 문구는 README 첫머리
  `쏘카 is Korea's largest car-sharing service` 가 정확히 뒷받침한다.
- Chip `information-weak` → `blue-50` (산문 + CSS) — 원본 component-specs 의 Chip
  selected 는 `tw-bg-primary-50` 이고 `component-chip-tag.html` 은 `#EBF5FF` 를
  하드코딩한다. 두 토큰은 값이 같아도 **별개 이름**이라 원본이 Chip 에
  `information-weak` 을 부여하지 않는다.
- 푸터 서비스 목록에서 `쏘카플랜`·`일레클` 삭제 — 전 파일 0건.

### 기각이 유지된 2건 — 다만 근거가 약하다

`SelectionBox` 의 배경 틴트·inset 링과 `Snackbar` 의 `gray-1000` 을 "이 프리뷰의 재현"
으로 낮춘 두 건은 기각됐다. 반증 검증의 논지는 **"Claude Design 번들 파일이 상류 근거가
아니라 같은 파이프라인의 재구성물"** 이라는 것이다 — socar 는 공개 문서 크롤 코퍼스가
따로 있고 번들이 그 하류라는 점에서 다른 슬러그와 사정이 다르다.

**이 PR 에서는 건드리지 않는다.** 두 건 모두 값을 지운 것이 아니라 재현임을 밝힌
것이라 피해가 작고, "번들이 상류로서 적격한가" 는 이 되돌리기의 범위를 넘는
정책 질문이다. 판단이 필요하면 별도로 연다.

## 11st — 되돌림 1 + 반쪽 오탐 분리 1 (#250)

| 표면 | `#250` 이 바꾼 것 | 복원 |
| --- | --- | --- |
| GNB sub-caps (L·D) | `GNB · Top app bar` (높이 삭제) | `GNB · Top app bar **56h**` |

근거: 원본 `11번가 Design System`(`71d10b81-33f3-43e2-b3d7-5eefa1ba7147`)의
`preview/22-nav-gnb.html` 이 `.gnb { height: 56px; … }` 와 meta 문구
`<b>GNB</b> · 56px high.` 를 담고, `colors_and_type.css` 에 **`--size-gnb-h: 56px`
전용 토큰**이 있다. 감사가 든 근거는 *"카탈로그 안의 `56` 은 `### title-sub` 것"* 이었는데
같은 블록에 `--size-title-sub-h: 56px` 가 나란히 있을 뿐 gnb 토큰은 따로 존재한다.

### 반쪽 오탐 — tooltip 캡션을 갈랐다

```
정정 전   Standard tooltip · radius 4 · 92% alpha
#250     Standard / Small 2종 · radius·알파는 이 프리뷰의 재현
이 PR    Standard / Small 2종 · radius 4 · 알파는 이 프리뷰의 재현
```

`preview/29-tooltip.html` 을 직접 읽어 확인했다 — `.bubble { … border-radius: 4px; }`
이므로 **`radius 4` 는 원본 축자**이고, 라벨도 `Standard` / `Small` 두 개라 정정의
`2종` 은 맞다. 반면 알파는 없다: 버블 배경이 불투명 `--gray-02`(`#111111`) 이고 원본의
유일한 알파 표면은 `--bg-toast: rgba(0,0,0,.8)` 로 tooltip 이 아니다.

즉 **정정문이 radius 와 알파를 묶어 함께 격하한 것이 오류**였다. 대장은 이 건을
"기각" 으로 적었으나 그것도 정확하지 않다 — 되돌릴 것도 그대로 둘 것도 아니고
**갈라야** 한다.

### 유지한 정정 2건

`catalog-dummy` 캡션 신설 2건(FAQ 문답의 배송 소요일·취소 시점·쿠폰 안내 / 판촉 카드의
'단독 혜택'·'오늘 마감'·쿠폰·멤버십·배송 조건)은 원본을 봐도 정당하다.

## 대장에 반영할 것

- **11st**: `radius 4 · 92% alpha` 는 "기각" 이 아니라 **반쪽** 이다 — 갈라서 처리했다.
- **socar·toss** 의 기각은 유지하되 위 두 후속 검토감을 함께 적는다.

## 검증

```
validate:previews  toss 4 warn · socar 2 warn · 11st 4 warn — 셋 다 0 blocking,
                   warn 수와 oklch 카운트가 기준선(origin/main)과 완전히 동일
typecheck PASS   lint PASS   test 37 files / 527 tests PASS
validate:catalog 0 blocking   tokens:check in sync   audit:oklch 0 mismatched
check:last-updated  services/*.md 미변경 — 해당 없음
```

편집은 캡션 문자열뿐이다. 파일당 변경은 11st 2줄 · socar 1줄 · toss 2줄(양 테마 동일).
