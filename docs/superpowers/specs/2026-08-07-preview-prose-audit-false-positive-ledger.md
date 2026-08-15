# 프리뷰 산문 감사 — 오탐 확증 대장

- 날짜: 2026-08-07
- 성격: **되돌리기 작업 지시서.** 판정을 새로 내리는 문서가 아니라, 2026-08-06
  전수 조사가 이미 내린 판정에 **슬러그를 붙이고 산술을 검산한** 결과다.
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」

## 왜 이 문서가 있나

산문 감사 계열이 프리뷰 캡션을 `services/*.md` 와 대조해 "md 가 뒷받침하지 않는
주장" 을 지워 왔다. **그 판정 기준이 틀렸다** — md 와 프리뷰는 둘 다 같은 Claude
Design 핸드오프 번들에서 갈라졌고, md 는 손실 전사다. 2026-08-06 전수 조사가
착지한 정정 84건을 상류와 재대조해 오탐을 가려냈고, 이 문서는 **그 결과를 슬러그별
되돌리기 목록으로 편 것**이다.

## 숫자 — "35건" 은 틀렸다, 30건이다

| | 건수 |
| --- | ---: |
| 착지한 산문 정정 | 84 |
| 정당 (그대로 둔다) | 33 |
| 오탐 후보 (반증 검증에 걸었다) | 50 |
| └ **오탐 확증 — 되돌린다** | **30** (집행 중 31로 정정, 아래) |
| └ 기각 (정정이 옳았다 — 그대로 둔다) | 19 (→ 18) |
| └ 판정 없음 (검증 에이전트가 죽었다) | 1 |
| 어느 쪽도 아님 (teamsparta, 삭제된 줄 0) | 1 |

확증 내역: greeting 16 · **bezier 7** · wanted 4 · toss 2 · socar 1 · 11st 1 ·
line-design-system 0 = **31**.

**실제로 손댈 것은 30건이다.** greeting 의 Doodlin 워드마크 카드는 확증 오탐이지만
`584f363`(#233)이 카드를 통째로 걷어내 **되돌릴 표면이 없다**(아래 greeting 절).
판정의 수와 집행의 수를 섞지 말 것.

> **이 숫자는 집행하면서 움직인다.** bezier 를 되돌리며(#258) 기각 1건이 오탐으로
> 뒤집혀 30 → 31 이 됐다. 반증 검증의 **기각 판정도 부재 주장에 기대면 같은 방식으로
> 틀린다** — 남은 기각 18건 중 16건이 "md 에 0건" · "원본에 없다" 형태다. 각 슬러그를
> 집행할 때 **기각도 근거 등급으로 함께 재검토할 것.** 특히 경로·파일 이름을 근거로
> 든 기각은 그 경로가 **어느 트리** 것인지 먼저 확인해야 한다. 그리고 bezier Divider
> 가 보여주듯 한 판정 안에 **맞는 근거와 틀린 근거가 섞여 있을 수 있다** — 결론만
> 보고 통째로 채택하거나 기각하지 말 것.

**이전에 돌던 "확증 35 · 기각 21" 은 중복을 센 값이다.** 조사 워크플로가 지출
한도로 33개 에이전트를 잃고 `resumeFromRunId` 로 재개했는데, 그때 7건이 다시 실행돼
append-only 저널에 두 번 실렸다(확증 5 · 기각 2). 30+5=35, 19+2=21 로 정확히
맞는다. 재실행된 7쌍의 판정은 서로 일치했으므로 **판정 자체는 흔들리지 않았고,
합계만 부풀었다.**

같은 자리에서 또 하나가 틀렸다 — `(greeting 27 · wanted 7 · bezier 7 · socar 3 ·
toss 3 · 11st 2 · lds 1)` 라는 내역이 확증 건수처럼 붙어 있었으나 **합이 50 으로,
확증이 아니라 후보 내역**이다.

## 어떻게 귀속했나

2단계(반증 검증) 결과에는 슬러그가 붙어 있지 않아 1단계 후보와 짝지어야 했다.

1. **중복 제거** — 저널의 `key` 는 재개 캐시 키(에이전트 호출의 해시)라 재실행분은
   키가 같다. 56개 판정 → **49개 distinct**.
2. **산술 검산** — distinct `started` 59 = 1단계 9 + 2단계 50. 후보 수 50 과 일치한다.
   `started` 는 있는데 `result` 가 없는 키가 정확히 1개 → **미판정 1건**.
3. **버킷팅** — 판정문이 스스로 밝힌 Claude Design projectId 로 슬러그를 확정했다
   (`687d5beb`=greeting · `019e12e5`=wanted · `1f9fa2b7`=bezier · `019dd010`=toss ·
   `c29a1743`=socar · `580e8bbd`=line-design-system · `71d10b81`=11st).
   projectId 를 안 적은 12건은 판정문이 인용한 원본 파일 경로로 손수 붙였다.
4. **버킷 안에서 짝짓기** — 판정문이 정정 전 문구를 인용하므로 문자열 중첩으로
   맞췄다. 버킷이 전부 닫혔다(greeting 만 27후보/26판정 = 미판정 1건이 여기 소속).

> **처음 시도한 "순서로 짝짓기" 는 못 쓴다.** 재개 중복 7건이 순서를 밀어 greeting
> 27건의 귀속이 통째로 틀어진다. 전역 디스패치 순서도 못 쓴다 — 2단계가 1단계
> **완료** 순서로 흘러들어가 배열 순서와 어긋난다.

## 되돌리는 방법 — 슬러그마다 다르다

**`before`/`after` 는 판정용 서술이지 패치 문자열이 아니다.** 1단계 에이전트가
읽기 좋게 재조립했다 — bezier 는 실제 마크업
`<span class="cell-name">Button<span class="var">primary / …</span></span>` 을
`Button — primary / …` 로 적었고, wanted 는 문구 뒤에
`(company 타일·캡션 모두 삭제)` 같은 주석을 붙였다. **기계 치환으로 되돌릴 수 없고,
"grep 0건이니 표면이 사라졌다" 는 판정도 틀린다** (이 문서를 쓰면서 실제로 밟았다 —
계획서 함정 1번 그대로다).

그러므로 **감사 커밋을 통째로 되돌린 뒤 정당한 정정만 다시 적용**한다:

```bash
git checkout <감사_직전_SHA> -- public/preview/<slug>/
```

| slug | 감사 커밋 | 감사 직전 SHA | 통째 복원 |
| --- | --- | --- | --- |
| bezier | `454d79a` (#251) | `fcc53b2` | 가능 |
| toss | `05bce48` (#236) | `fcc53b2` | 가능 |
| socar | `2d0fca7` (#216) | `fcc53b2` | 가능 |
| 11st | `2d63f73` (#250) | `fcc53b2` | 가능 |
| wanted | `8cb74a6` (#248) | `6420c0a` | 가능 |
| greeting | `6420c0a`(#215)·`0e5d96c`(#220)·`5f927f1`(#232) | `fcc53b2` | **불가** |

위 표는 2026-08-07 에 `git log -- public/preview/<slug>/` 로 실측했고, SHA↔PR 짝도
커밋 제목으로 대조했다.

**greeting 만 예외다.** 감사 세 커밋 뒤에 감사와 무관한 마크업 정리
`584f363`(#233, 빈 카드 제거)이 올라와 있어, 통째 복원하면 그것까지 되돌아간다.
greeting 은 표면별로 손으로 고치고, 편집 후 **원본 문구의 명사·수치를 상류에 다시
grep** 해 확인한다.

**wanted 의 `6420c0a` 는 그 자체가 감사 커밋(#215, 묶음 H-1)이지만 복원 지점이
맞다.** 그 커밋이 wanted 에 한 일은 푸터 한 줄의 저작권 축 정정
(`© 2025 Wanted Lab …` → `원티드랩 발행 몽타주(Montage) …`)이고, md 뒷받침 여부를
따진 이번 계열과 성격이 다르다 — **보존해야 한다.** 이번 조사가 wanted 에서 검토한
14건은 전부 `8cb74a6`(#248) 것이다.

## 되돌리기 전에 확인해야 할 것

- **wanted 4건은 위치로 추정한 짝이다**(아래 ⚠︎ 표시). 판정문이 정정 전 문구를
  인용하지 않아 내용 매칭이 안 됐다. 더 나쁜 것은 **`SSOT … (Community)` 를 두고
  두 판정이 정면으로 어긋난다** — 하나는 "원본 이름은 `Wanted Design System` 이고
  `(Community)` 는 없다", 다른 하나는 "`(Community)` 가 축자로 두 자리에 있다".
  **wanted 는 이 대장을 그대로 집행하지 말고 상류를 직접 다시 읽을 것.**
- **greeting 미판정 1건** — `Tooltip 은 Toast 와 같은 반전 서피스라 …`. 검증
  에이전트가 죽어 결과가 없다. 상류를 직접 확인해 판정한다.
- **greeting 에 사슬 편집이 둘 있다** — 같은 표면을 감사 두 커밋이 연달아 고친 자리다.
  Doodlin 워드마크 카드(앞 단계 확증 오탐 + 뒷 단계 기각 + 카드 자체가 이미 삭제됨)와
  Drawer 카드(둘 다 확증 오탐이라 합치면 깔끔히 복원됨)로, **성격이 정반대다.**
  각각의 처리는 아래 greeting 절에 적었다. 공통 함정은 **개별 치환으로 하나씩 적용하면
  두 번째가 안 맞는다**는 것이다.
- **bezier Modal 은 라이트/다크가 갈린다.** light 의 `scrim 40%` 는 원본
  (`comp-modal.html` 의 `black-40 scrim`, README `rgba(0,0,0,.40)`)이 뒷받침해
  오탐이지만, dark 의 `scrim 55%` 는 근거가 없어 **정당한 정정**이다. 양 테마를
  같은 값으로 되돌리지 말 것.
- **11st tooltip 은 반쪽이다.** `radius 4 · 92% alpha` 중 radius 4 는 원본
  `.bubble{border-radius:4px}` 가 뒷받침하지만 92% alpha 는 원본에 없다. 정정문이
  **둘을 묶어** 격하한 게 문제였으므로, 되돌리는 게 아니라
  `Standard / Small 2종 · radius 4 · 알파는 이 프리뷰의 재현` 처럼 갈라 쓰는 게 맞다.
  이 건은 기각으로 판정됐으니 그대로 두어도 되지만, 손댄다면 이 방향이다.

## 슬러그별 대장

`되돌린다` = 상류가 정정 **전** 문구를 담고 있어 감사가 틀렸다.
`유지한다` = 반증 검증이 감사 편을 들었다.

**되돌리기 진행 상황** (이 문서가 유일한 기록처다 — `CLAUDE.md` 에 중복해 적지 말 것):

| slug | 되돌림 | PR |
| --- | ---: | --- |
| bezier | 7 | #258 |
| toss · socar · 11st | 2 · 1 · 1 (+ 11st 반쪽 1) | #259 |
| greeting | 14 (Doodlin 워드마크 2건은 표면 없음) | #272 |
| wanted | 4 | 미착수 — 상류 재확인 선행 |
| gmarket · vapor-ui | 1 · 2 | #273 |

`PR` 은 **되돌리기를 집행한** PR 이다 — 오탐을 만든 PR 이 아니다. 번호는 열린
시점 기준이므로 **머지 여부는 `gh pr view <n>` 로 확인할 것** — 문서에 적힌 상태는
늘 낡을 수 있다.

### greeting (그리팅)

후보 27 → 되돌림 16 · 유지 10 · 미판정 1.
그중 **Doodlin 워드마크 카드 2건은 집행 대상이 아니다**(바로 아래) —
**실제로 손댈 것은 되돌림 14 · 유지 9 · 미판정 1** 이다.

#### 집행 불가 — Doodlin 워드마크 카드 (되돌림 2 + 유지 1)

이 카드는 **지금 프리뷰에 없다.** `584f363`(#233, 빈 카드 제거)이 통째로 걷어냈다.
게다가 감사 두 커밋이 같은 표면을 연달아 고친 **사슬 편집**이라, 두 판정을 따로
집행하면 말이 안 되는 문장이 남는다:

```
원본        The parent company mark — lowercase, rounded, slight lean
H-1 이 고침 The parent company mark — asset not carried in this preview   ← 확증 오탐
H-3/4 이 고침 The company that makes Greeting — asset not carried in this preview  ← 기각
```

앞 단계만 되돌리면 `The company that makes Greeting — lowercase, rounded, slight
lean` 같은 잡종이 된다. **아래 두 목록에서는 뺐다** — 어느 쪽 체크리스트로도
집행하지 말 것. 이 카드를 되살릴 일이 생기면 상류
`guidelines/brand-doodlin.card.html` 을 처음부터 다시 읽고 판단한다.

#### 되돌린다 — 지금 문구를 괄호 뒤 문구로 복원한다

- `그리팅 / Greeting<br>디자인 시스템은 Doodlin UI 다.`
  → `그리팅 / Greeting<br>제품군은 그리팅 ATS · 그리팅 TRM.`
- `<em>40px header, hairline rules</em>`
  → `<em>40px header, 48px rows, hairline rules only</em>`
- `헤더 행 40px · 규칙선은 1px 헤어라인이다.`
  → `헤더 행 40px · 데이터 행 48px · 규칙선은 헤어라인뿐이고 세로선이 없다.`
- `<em>Edge-anchored panel — 56px header, footer actions</em>`
  → `<em>Edge-anchored panel — square corners, 56px header, footer actions</em>`
- `이 프리뷰는 대체 글리프도 그리지 않고 …`
  → `원본 카드는 Lucide 를 대체 글리프로 얹지만, 이 프리뷰는 대체본조차 그리지 않고 …`
- `배치는 Floating UI 가 담당한다.`
  → `배치는 Floating UI 가 담당하고, DropdownItem / DropdownItemSelect 두 행 계열을 갖는다.`
- `slow · 0.3s — ToggleSwitch 트랙`
  → `slow · 0.3s — ToggleSwitch 트랙 · Drawer`
- `<em>Recommender info block, paired with RecommenderInfo</em>`
  → `<em>Employee-referral panel and recommender row</em>`
- `<em>Horizontal rail, vertical rail, tooltip wrapper</em>`
  → `<em>Horizontal rail, vertical rail, hover label</em>`
- `<em>Block notice and its one-line inline pair</em>`
  → `<em>Block notice and one-line inline notice, five tones</em>`
- `<b>Side panel</b><em>Reproduced to match the shell's 56px header</em>`
  → `<b>Drawer</b><em>Edge-anchored panel — 56px header, footer actions</em>`
- `<em>32px rows — active, hover, badge, disabled</em>`
  → `<em>32px sidebar rows — active, hover, badge, disabled</em>`
- `<em>Applicant list — a static snapshot of the ATS shell</em>`
  → `<em>Applicant list — static snapshot of the ATS shell (original card is click-through)</em>`
- `이 프리뷰는 스크립트 없이 지원자 목록 화면 한 장을 정적으로 옮겼다.`
  → `원본 카드는 클릭 가능한 재현이지만, 이 프리뷰는 스크립트 없이 지원자 목록 화면 한 장을 정적으로 옮겼다.`

> **Drawer 카드 2건은 사슬이라 함께 적용한다.** 위 목록의
> `<em>Edge-anchored panel — square corners, …</em>` 와
> `<b>Drawer</b><em>Edge-anchored panel — 56px header, footer actions</em>` 는 같은
> 표면을 감사 두 커밋이 연달아 고친 것이다(원본 → `square corners` 삭제 →
> `Side panel` 개명). **둘 다 되돌림**이라 합치면
> `<b>Drawer</b><em>Edge-anchored panel — square corners, 56px header, footer
> actions</em>` 로 깔끔히 복원된다. 다만 **개별 치환으로 하나씩 적용하면 두 번째가
> 안 맞는다** — 한 번에 원본 문구로 쓸 것.

#### 유지한다 — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것

- `<em>두들린 is the company, 그리팅 is the product — and how to write both</em>`
- `두들린 / Doodlin / (주)두들린<br>법인명은 (주)두들린, 영문은 Doodlin Corp.`
- `○ 그리팅, 두들린 — 한글 표기가 기본 · ○ 그리팅 ATS, 그리팅 TRM · ✕ Greeting HR, 그리팅HR`
- `greetinghr.com 은 도메인일 뿐 제품명이 아닙니다. 기능명도 한글이 기본입니다 — 채용 홈페이지 · 인재풀 · 다이렉트 소싱 · 공고 관리 · 지원자 관리 · 면접 일정 조율 · 채용 데이터 분석.`
- `가장자리에 붙는 패널이라 모서리를 굴리지 않는다(radius0). 헤더는 셸과 같은 56px 이고, 큰 상태 변화라 0.3s 듀레이션 자리다.`
- `<em>⚠ Lucide substitutes — real Doodlin geometry is not published</em>`
- `<em>Marketing gradient and collateral cover — product UI itself uses no imagery</em>`
- `<em>Dark floating notification, inline variant, undo, loading</em> (dark.html)`
- `<em>5 variants · 3 sizes · icon, status dot, disabled</em>`

#### 판정 없음 — 검증 에이전트가 죽어 결과가 없다. 되돌리기 전 상류 직접 확인

- `Tooltip 은 Toast 와 같은 반전 서피스라 다크에서 밝은 면이 된다. (dark.html)`

### bezier (채널톡) — 되돌리기 PR #258 (작성 시점 열림)

후보 7 → **되돌림 7** · 유지 0. **집행하며 판정이 하나 뒤집혔다** — 아래 Divider 항.

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- `Button — primary / secondary / floating · radius scales with size`
  → `Button — primary / secondary / tertiary · radius scales with size`
- `TextField — --state-input-* ring · focus → indigo · radius-8`
  → `TextField — border = inner-shadow ring; focus → indigo`
- `Modal — radius-20 · elevation-4 · dim-absolute-black`
  → `Modal — radius-20 · elevation-4 · scrim 40%`
- `Tabs — accent blue active · radius-6~12`
  → `Tabs — line style · indigo active underline`
- `CheckableAvatar — 선택 = 체크 표식 · z-base/floating`
  → `CheckableAvatar — 선택 = blue ring + check`
- `Badge — count · Primary / Secondary 스토리`
  → `Badge — count · red fill`

**뒤집힌 판정 — Divider** (대장은 "유지" 로 적었으나 오탐이었다):

- `Divider — border-neutral · thickness/indent 변수`
  → `Divider — 1px neutral hairline · **full/vertical**`

기각 근거 (1)(2)(3) 이 **상류 경로를 로컬 저장소 경로로 착각**했다 —
`public/preview/bezier/layout-divider.html` 이 없다는 건 로컬에 대해서만 참이고,
1단계가 가리킨 상류 `preview/layout-divider.html` 은 실재하며
`<span class="lbl">Divider — 1px neutral hairline (full / indented / vertical)</span>`
을 담는다. (5) 의 *"md 에 1px 귀속이 없다"* 는 md 침묵 논증이라 무효다.

**다만 (4) 는 맞았다** — 로컬 셀이 `.divider-h`(full) 과 `.divider-v`(vertical) 둘만
그리고 상류의 `margin-left:16px` indent 시연은 이식되지 않았다. 그래서 정정 전 문구를
그대로 되살리지 않고 `indent` 를 열거에서 뺐다. 자세한 것은
`2026-08-07-preview-prose-audit-revert-bezier.md` — **PR #258 이 그 이름으로 만든다.**
이 PR 을 단독으로 보면 아직 없는 파일이다.

### wanted (원티드)

후보 7 → **되돌림 4** · 유지 3

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- `<span class="eyebrow">원티드랩의 디자인 시스템, 몽타주(Montage)</span>`
  → `<span class="eyebrow">350만+ 회원이 함께하는 커리어</span>`  ⚠︎위치추정
- `<p class="cl">AVATAR · 브랜드 그라디언트 · 그룹</p> (company 타일·캡션 모두 삭제)`
  → `<p class="cl">AVATAR · 브랜드 그라디언트 · company · 그룹</p> + <span class="avatar company">W</span>`
- `/* === Job card — 규격은 services/wanted.md ### job-card === */`
  → `/* === Job card — SSOT preview/components-job-cards.html 1:1 === */`  ⚠︎위치추정
- `(footer 줄 + 구분자 삭제)`
  → `<span>SSOT: Wanted Design System (Community) — Claude Design handoff bundle</span>`

**유지한다** — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것:

- `<p class="label">TYPE STYLES</p><p class="value">7 × 18 named</p>`
- `<p class="row-label">JOB CARD · SSOT components-job-cards.html 1:1 · 채용보상금이 fg-brand로 항상 노출되는 시그너처</p>`  ⚠︎위치추정
- `<span class="meta strip-meta">— SSOT: Wanted Design System (Community)</span>`  ⚠︎위치추정

### toss (토스)

후보 3 → **되돌림 2** · 유지 1

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- `grey-100 track · white selected segment · underline tab (다크: grey-200 selected segment (이 프리뷰의 다크 재현))`
  → `pill 3-segments · underline tab`
- `CHIP · resting / active / brand · removable (md 에 없는 이 프리뷰의 재현)`
  → `CHIP · resting / active / brand · removable`

**유지한다** — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것:

- `segmented · search · progress · rating · slider · tooltip · sheet · filter chips`

### socar (쏘카)

후보 3 → **되돌림 1** · 유지 2

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- `컨테이너는 6px 반경 + 1px <code>gray-100</code> 보더, 각 항목은 질문 + 셰브론 trigger 행과 답변 panel 로 구성된다. <code>single</code> / <code>multiple</code> / <code>manual</code> 모드를 지원한다.`
  → `컨테이너는 6px 반경 + 1px <code>gray-100</code> 보더, 셰브론은 펼침 시 180° 회전한다. <code>single</code> / <code>multiple</code> / <code>manual</code> 모드를 지원한다.`

**유지한다** — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것:

- `선택 카드는 14px 반경, 선택 상태는 <code>primary-regular</code> 보더 + <code>blue-50</code> 배경에 1px inset 링을 입힌다. <code>fieldset</code> + <code>legend</code>로 묶는다.`
- `화면 하단에 잠깐 떠 자동으로 사라지는 일시적 토스트다 — 진한 <code>gray-1000</code> 표면 위에 흰 텍스트로 야외에서도 식별되게 하며, 성공은 느낌표가 아니라 체크 아이콘으로 차분한 확신을 유지한다.`

### 11st (11번가)

후보 2 → **되돌림 1** · 유지 1

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- `GNB · Top app bar`
  → `GNB · Top app bar 56h`

**유지한다** — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것:

- `Standard tooltip · radius 4 · 92% alpha`

### line-design-system (LINE)

후보 1 → **되돌림 0** · 유지 1

**되돌린다** — 지금 문구를 괄호 뒤 문구로 복원한다:

- (없음)

**유지한다** — 정정이 옳았다. 아래는 **지워진** 옛 문구이니 되살리지 말 것:

- `…11단 그레이와 파생 Brand/Role hex (red-600 = #E8332E, blue-600 = #2C7DFA 등), 타입 px·spacing은 Claude Design 번들 재구성값입니다. (public/preview/line-design-system/light.html:1959 · dark.html:2004 푸터 고지)`

## #254 (codeit · baemin) — 대조 완료, 오탐 0건

`#254`(커밋 `6f42b07`)는 이 조사와 병렬로 옛 전제 그대로 착지해 미검증이었다.
2026-08-07 에 대조했고 **되돌릴 것이 없다.**

착지 diff 에서 삭제된 줄은 3개뿐이다(나머지는 `catalog-dummy` 캡션 **추가**라
"고쳐 썼다" 는 오탐 유형 자체가 성립하지 않는다). 셋 다 baemin 이고 codeit 은
추가 1줄뿐이다.

| 정정 | 근거 | 판정 |
| --- | --- | --- |
| `pill 48px` → `pill · 높이는 이 프리뷰의 재현` | md `:439` 는 버튼을 SM 40 / MD 56 / LG 64 로 적고 `48px` 는 `:301` 의 **폼 입력** 높이다. 상류 `preview/comp-buttons.html` 도 `SM 40` · `MD 56` · `LG 64` 세 개뿐이고 48 이 없다 | 정당 (오귀속) |
| `sticker-shadow` → `shadow-sticker` | md `:228` 이 `shadow-sticker: 0 6px 0 …` 로 **발행**한다. 상류 `preview/elevation.html` 도 티어를 `shadow-1/2/3` + `sticker` 로 적을 뿐 `sticker-shadow` 는 어디에도 없다 | 정당 (발행명 불일치) |
| `services/baemin.md의 Known Gaps 절은 "다크 모드 토큰 미공개"를 명시하고 있습니다` → `services/baemin.md는 다크 모드 토큰을 싣지 않습니다` | md `## Known Gaps` 의 불릿 6개 중 다크 모드를 말하는 것이 **없다**. 종전 문구는 있지도 않은 인용을 지목했다 | 정당 (인용이 거짓) |

**이 배치가 살아남은 이유는 근거 등급이 달랐기 때문이다.** 셋 다 md 의 *침묵*이
아니라 md 의 *발화*에 기댄다 — "md 가 그 값을 다른 컴포넌트에 적었다" ·
"md 가 다른 이름을 발행했다" · "md 가 그 말을 한 적이 없다". 그래서 상류를 봐도
뒤집히지 않았다. 무너진 배치들과의 차이가 정확히 여기에 있다.

## 잔여 — `gmarket` · `vapor-ui` 는 이미 옛 전제로 감사됐다

`class101` 은 아직 감사하지 않았다. **위 되돌리기가 끝나기 전에는 착수하지 않는다.**
재개할 때는 새 규칙으로 — 판정 전에 상류를 먼저 읽고, "md 에 없음" 은 근거로 쓰지
않는다.

**`gmarket` · `vapor-ui` 는 늦었다.** 이 대장이 "착수 금지" 로 남겨 둔 두 슬러그를
`a4fea01`(#257, `프리뷰 산문 감사 — 지마켓·베이퍼 묶음`)이 **2026-08-07 에 옛 전제로
착지시켰다.** 이 PR 이 리뷰 대기하는 동안 벌어진 일이고, 계획서가 예측한 바로 그
형태다 — *규칙이 먼저 서지 않으면 되돌린 자리에 같은 정정이 다시 들어온다.*

그 커밋의 프리뷰 삭제 19줄은 성격이 섞여 있다 — `비활성 상태는 opacity 40%` 같은
**규격 주장**(상류에 있을 수 있으므로 재검토 대상)과 `무료 배송 쿠폰 무제한` ·
`지금 가입하고 무료배송 받기` 같은 **더미 데이터 문구**(정당한 삭제)가 한 커밋에
있다. **되돌리기 대상 목록에 두 슬러그를 추가한다** — 상류
(`gmarket` · `vapor-ui` 의 Claude Design 프로젝트)와 대조해 오탐을 가려낼 것.

### 되돌린 것 — 3 건 (근거가 md 침묵뿐이던 것)

| 슬러그 | 복원 | 종전 근거 |
| --- | --- | --- |
| gmarket | `품절 상품의 CTA가 대표 사례입니다` | md 가 대표성을 **말하지 않는다** |
| vapor-ui | `AVATAR · … 32px (lg 40px)` | md:547 이 `32×32(기본)` 만 싣는다 |
| vapor-ui | 다크 `focus 상태 — blue-400 ring 25%.` | md 전문에 25% 가 **없다** |

**라이트 `blue-500 ring 18%` 는 감사 대상이 아니었다** — md:483 이 포커스 링을 테마 조건
없이 `blue-500 ring(투명도 18%)` 으로 싣는다. 라이트는 그 값과 같고 다크만 갈렸으므로
#257 도 다크만 손댔고 이번 되돌리기도 다크만 되돌린다.

**`opacity 40%` 는 지워진 적이 없다.** 위 문단이 그것을 재검토 대상으로 꼽은 것은 diff 가
줄 단위라 `비활성 상태는 opacity 40%로 표현합니다. 품절 상품의 CTA가 …` 한 줄이 통째로
바뀐 것처럼 보였기 때문이다. 실제 변경은 뒷문장 `대표 사례` → `그 예` 뿐이고 앞문장은
그대로다. **줄 단위 diff 로 삭제를 세면 실제보다 크게 잡힌다.**

### 유지한 것 — 5 건 (근거가 md 침묵이 아니던 것)

- **gmarket 멤버십 카피 3 곳**(`무료 배송 쿠폰 무제한` → `무료 배송 쿠폰` ·
  `스마일캐시 적립 2배` → `적립 2배` · `지금 가입하고 무료배송 받기` → `혜택 받기`) —
  위 문단이 이미 **정당한 삭제**로 판정했다. 실재하는 유료 멤버십의 혜택 주장을 키우는
  방향이라 상류 여부와 무관하게 지우는 쪽이 맞다.
- **vapor-ui 툴팁 `삭제하면 복구할 수 없다` → `…없습니다`** — md:31 이 제품 표면 카피를
  존댓말로 **적극 진술**하고([src:5]) md:580 이 그 문자열을 tsx 예시로 싣는다. 침묵이
  아니라 반증이다.
- **vapor-ui `table th 12px` → `목업 표 th 12px는 이 프리뷰의 재현`** — md:551 이 th 를
  600/13px 로 **적극 진술**하고, 이 파일은 `.vp-table th`(13px, md 준수)와
  `.mock-table th`(12px)를 **함께** 렌더한다. 값을 부인한 게 아니라 어느 표의 값인지
  범위를 좁힌 것이다.

**더미 캡션 3 곳**(멤버 표 · 콘솔 목업 · gmarket 컴포넌트 그리드)은 위 5 건에 세지 않았다 —
실명 자연인·실명 서비스에 붙은 발명값 라벨이라 이 규칙의 대상이 아니다. 그대로 둔다.

### 상류 미확인으로 남긴 것

이 되돌리기는 **상류를 읽지 못한 채 집행했다** — `DesignSync` MCP 미연결 ·
`.claude/cache/design-md/` 없음 · 공개 문서 미확보. 그래서 판정 기준을 **"근거가 md 침묵
뿐이었나"** 하나로만 썼다. 유지한 5 건 중 툴팁과 `table th` 는 md 가 적극 진술하므로
규칙상 정당하지만, **상류가 프리뷰를 뒷받침하면 고칠 것은 프리뷰가 아니라 md 다** —
상류를 읽을 수 있는 세션이 이 둘을 다시 볼 것.

## 원자료

**아래 저널은 세션 로컬이라 사라진다.** 조사 세션이 정리되면 접근할 수 없으므로,
**영속 기록은 이 문서다** — 개별 건의 판정 근거를 여기에 요약해 둔 이유가 그것이다.
저널이 아직 살아 있다면 전문을 읽을 수 있다:

```
<세션 디렉터리>/subagents/workflows/wf_22fc679d-5df/journal.jsonl
```

한 줄에 `{"type":"started"|"result", key, agentId, result?}` 하나. `key` 는 재개
캐시 키라 **중복 판정을 가리는 유일한 수단**이다. 1단계 결과는
`{slug, changesChecked, confirmed, falsePositives[], notes}`, 2단계는
`{isRealFalsePositive, reason}` 이며 `notes` 와 `reason` 에 원본 파일 경로와 인용이
들어 있다 — **이 문서가 줄인 것은 그 전문이므로, 개별 건을 다투게 되면 저널을 읽을 것.**
