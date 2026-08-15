# 프리뷰 산문 감사 되돌리기 — greeting (그리팅)

- 날짜: 2026-08-07
- 되돌리는 대상: `6420c0a`(#215) · `0e5d96c`(#220) · `5f927f1`(#232)
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」
- 대장: `2026-08-07-preview-prose-audit-false-positive-ledger.md`
- 선행: `2026-08-07-preview-prose-audit-revert-bezier.md`(#258) ·
  `2026-08-07-preview-prose-audit-revert-toss-socar-11st.md`(#259)

## 방법 — 통째 복원이 안 되는 유일한 슬러그

감사 세 커밋 뒤에 **감사와 무관한 마크업 정리 `584f363`(#233, 빈 카드 제거)** 이 올라와
있어, `fcc53b2` 로 통째 복원하면 그것까지 되돌아간다. 그래서 `origin/main` 에서
시작해 확증 오탐만 표면별로 적용했다. 각 치환은 건수를 단언한다 — 1건이 아니면
실패로 잡힌다. **14 치환 × 2 테마 = 28건 전부 성공**했다.

**저널의 `before` 를 그대로 쓰지 않았다.** 세 건이 `…` 로 축약돼 있어 그대로 쓰면
추측이 된다. 정확한 원문은 `git show fcc53b2:public/preview/greeting/light.html` 에서
직접 꺼냈다 — 되돌리기의 원문은 저널이 아니라 git 이 갖는다.

## 되돌린 14건

카드 영문 부제 대부분은 원본 `@dsCard subtitle=` 속성의 축자 복사였다. 감사는 그걸
"md 에 없다" 며 고쳤다.

| # | 지금 문구 | 복원 |
| ---: | --- | --- |
| 1 | `그리팅 / Greeting<br>디자인 시스템은 Doodlin UI 다.` | `…제품군은 그리팅 ATS · 그리팅 TRM.` |
| 2 | `<em>40px header, hairline rules</em>` | `<em>40px header, 48px rows, hairline rules only</em>` |
| 3 | `헤더 행 40px · 규칙선은 1px 헤어라인이다.` | `헤더 행 40px · 데이터 행 48px · 규칙선은 헤어라인뿐이고 세로선이 없다.` |
| 4 | `<b>Side panel</b><em>Reproduced to match the shell's 56px header</em>` | `<b>Drawer</b><em>Edge-anchored panel — 56px header, footer actions</em>` |
| 5 | `<em>Edge-anchored panel — 56px header, footer actions</em>` | `…— square corners, 56px header, footer actions` |
| 6 | `이 프리뷰는 대체 글리프도 그리지 않고 ` | `원본 카드는 Lucide 를 대체 글리프로 얹지만, 이 프리뷰는 대체본조차 그리지 않고 ` |
| 7 | `배치는 Floating UI 가 담당한다.` | `…담당하고, DropdownItem / DropdownItemSelect 두 행 계열을 갖는다.` |
| 8 | `<span class="u">ToggleSwitch 트랙</span>` | `<span class="u">ToggleSwitch 트랙 · Drawer</span>` |
| 9 | `<em>Recommender info block, paired with RecommenderInfo</em>` | `<em>Employee-referral panel and recommender row</em>` |
| 10 | `<em>Horizontal rail, vertical rail, tooltip wrapper</em>` | `<em>Horizontal rail, vertical rail, hover label</em>` |
| 11 | `<em>Block notice and its one-line inline pair</em>` | `<em>Block notice and one-line inline notice, five tones</em>` |
| 12 | `<em>32px rows — active, hover, badge, disabled</em>` | `<em>32px sidebar rows — …</em>` |
| 13 | `<em>Applicant list — a static snapshot of the ATS shell</em>` | `<em>Applicant list — static snapshot of the ATS shell (original card is click-through)</em>` |
| 14 | `<p class="note">이 프리뷰는 스크립트 없이 ` | `<p class="note">원본 카드는 클릭 가능한 재현이지만, 이 프리뷰는 스크립트 없이 ` |

**가장 심각했던 것은 4번이다.** `#232` 가 Drawer 카드를 "md 전문에 Drawer 0건" 이라며
**Side panel 로 개명**했는데, 원본에 `components/feedback/Drawer.jsx` ·
`drawer.card.html` · `Drawer.prompt.md` 가 있다. `CLAUDE.md` 가 경고한 대로 이름을
바꾸는 정정이 값보다 위험하다.

### 사슬 편집 — 4·5 는 같은 표면이다

`#215` 가 `square corners` 를 지우고, `#232` 가 그 결과를 `Side panel` 로 개명했다.
**둘 다 확증 오탐이라 순서대로 적용하면 원본으로 정확히 합성된다:**

```
원본        <b>Drawer</b><em>Edge-anchored panel — square corners, 56px header, footer actions</em>
#215        <b>Drawer</b><em>Edge-anchored panel — 56px header, footer actions</em>
#232        <b>Side panel</b><em>Reproduced to match the shell's 56px header</em>
이 PR       원본과 동일 (4 → 5 순서로 적용)
```

**개별 치환을 순서 없이 적용하면 두 번째가 안 맞는다.** 4 를 먼저 적용해야 5 의
대상 문자열이 생긴다.

## 되돌리지 않은 것

- **유지 9건** — 반증 검증이 감사 편을 들었다(법인명 표기 · 네이밍 do/don't ·
  `greetinghr.com` 규범문 · Lucide 대체 경고 · 브랜드 이미지 · Toast · Button 5 variants
  등). 대장의 greeting 절 「유지한다」 목록이 그 전부다.
- **Doodlin 워드마크 카드 2건** — 확증 오탐 1 + 기각 1 의 사슬인데, `584f363`(#233)이
  카드를 통째로 걷어내 **되돌릴 표면이 없다.** 대장의 「집행 불가」 절 참조.
- **미판정 1건** — `Tooltip 은 Toast 와 같은 반전 서피스라 …`. 검증 에이전트가 죽어
  결과가 없다. 상류를 직접 확인해야 하므로 이 PR 에서 손대지 않았다.

## 검증

```
validate:previews (greeting)  0 blocking · 0 warn — 기준선과 동일
typecheck PASS   lint PASS   test 540 passed
validate:catalog 0 blocking   audit:oklch 0 mismatched
check:last-updated  services/*.md 미변경 — 해당 없음
```

편집은 캡션 문자열뿐이다. 파일당 13줄(사슬 2건이 같은 줄이라 14 치환 → 13 줄).
