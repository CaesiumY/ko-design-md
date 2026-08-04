# 프리뷰 용량 전략 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 그리팅 프리뷰를 기존 루브릭 조항에 맞춰 정리하고, 그 조항 두 개를 결정론적 규칙으로 승격하며, 크기 게이트를 실제 배포 형태(brotli) 기준으로 바꾼다.

**Architecture:** 세 개의 독립 PR 로 나눈다. PR-1 은 프리뷰 HTML 콘텐츠만 건드리고, PR-2 는 `src/lib/preview-validator.ts` 에 규칙 2종 추가 + 크기 게이트 단위 전환, PR-3a 는 `scripts/audit-oklch.ts` 의 조용한 누락을 제거한다. 순서는 강제다 — 근거는 각 태스크 머리에 적었다.

**Tech Stack:** TypeScript, vitest, tsx, Node `node:zlib`, TanStack Start (Vite). 패키지 매니저는 **pnpm** (npm 금지).

**설계 문서:** `docs/superpowers/specs/2026-08-02-preview-size-strategy-design.md`
**측정 기준선:** `origin/main` = `6420c0a` (2026-08-02)

## Global Constraints

- 패키지 매니저는 **pnpm**. `npm` 명령은 금지.
- 모든 커밋은 DCO 서명: `git commit -s`.
- CI 게이트 전체: `pnpm typecheck && pnpm lint && pnpm format:check`, `pnpm test`, `pnpm validate:catalog`, `pnpm validate:previews`, `pnpm tokens:check`, `pnpm audit:oklch`.
- **프리뷰 HTML 에 prettier 를 돌리지 말 것.** `format:check` 범위는 `**/*.{ts,tsx,js,jsx}` 뿐이다. 프리뷰에 돌리면 마크업이 펼쳐져 175 KiB 로 불어나 하드캡을 넘긴다.
- 프리뷰 검증 폭은 **375 / 768 / 976 / 1440** 전수. 976 은 상세페이지 iframe 임베드 폭이고, 오버플로우는 중간 다열 폭에서만 터진다 — 375px 만 보고 통과 판정 금지.
- Windows 로컬: `pnpm format:check` 가 로컬에서만 실패하면 CRLF 오탐이므로 **CI 결과가 진실**이고 해당 파일을 재포맷해 커밋하지 말 것. 반대로 `pnpm tokens:check` 는 오탐이 없으므로 실패하면 진짜 drift 다.
- 프리뷰 스크린샷은 이 repo 에서 `preview_screenshot` 이 행(hang)한다. **Playwright 로 찍을 것.**
- 확정 임계값 (설계 문서에서 그대로 옮김):
  - `type-scale-showcase`: `typoLabels >= 5 && typoLabels >= totalTypographyTokens * 0.5` → block
  - `swatch-catalog`: `fillOnly >= 24` → block, 단 `fillOnly = shared + max(lightOnly, darkOnly)`
  - `file-size-budget`: brotli `> 24 KiB` → warn
  - `file-too-large`: brotli `> 40 KiB` → block
  - `file-too-large-raw`: raw `> 256 KiB` → block (안전망)
  - brotli 는 `BROTLI_PARAM_QUALITY: 11` 고정

---

## File Structure

| 파일 | 역할 | 태스크 |
|---|---|---|
| `public/preview/greeting/light.html` | 그리팅 라이트 프리뷰 — 스와치/스케일 카드 9장 제거 | 1 |
| `public/preview/greeting/dark.html` | 동 다크 | 1 |
| `src/lib/preview-validator.ts` | 규칙 2종 추가 + 크기 게이트 brotli 전환 | 2·3·4 |
| `src/lib/preview-validator.test.ts` | 위 규칙들의 단위 테스트 | 2·3·4 |
| `scripts/audit-oklch.ts` | 프리뷰를 못 찾을 때 조용히 넘기지 않도록 | 5 |

`src/lib/oklch-sync.ts` 는 **건드리지 않는다.** 설계 문서 초안은 여기도 경로 확장이 필요하다고 적었지만, 실제로는 `path.`/`fs.` 사용이 0건인 순수 문자열 치환 모듈이라 경로 개념이 없다.

---

### Task 1: PR-1 — 그리팅 프리뷰 루브릭 정합

**왜 먼저인가:** Task 2·3 의 규칙을 그리팅이 정리되기 전에 켜면 카탈로그의 자기 항목이 block 된다.

**Files:**
- Modify: `public/preview/greeting/light.html`
- Modify: `public/preview/greeting/dark.html`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: 정리된 그리팅 프리뷰 쌍. Task 3 의 캘리브레이션이 이 결과에 의존한다 — `fillOnly` 18, `typoLabels` 0.

**제거 대상 카드 9장** (각 `<article>` 의 `class="card-hd"><b>NAME</b>` 로 식별):

램프 단계를 열거하는 카드 — `Accent ramps`, `Blue ramp`, `Gray ramp`, `Murky ramps`, `Neutral overlay`, `Dark mirror`
스케일 이름을 열거하는 카드 — `Body scale`, `Item scale`, `Title scale`

**유지 대상 (건드리지 말 것):** `Murky in use`(Fill = ramp 100 / text = ramp 800 레시피), `Borders & surfaces`, `Text colours`, `InterviewColor`, `Brand & System`, `Pretendard`, `Line-height roles`. 이들은 토큰을 **사용 맥락**에서 보여주므로 rubric L23 의 "in application" 원칙에 부합한다.

**절대 건드리지 말 것:**
- `<style>` 의 `:root` 토큰 선언 — 여기를 지우면 OKLCH 커버리지가 깨진다. body 스와치만 제거한다.
- `<body>` 첫 자식인 `<div class="catalog-disclaimer" role="note">` — `disclaimer-banner-misplaced` 가 block 이다.
- 각 `<section>` 헤더의 `<span class="grp-ct">N장</span>` 은 카드 수를 표시하므로 **함께 갱신**해야 한다 (Colors 11장 → 5장, Type 5장 → 2장).

- [ ] **Step 1: 기준선 측정 — 지금 값을 기록한다**

```bash
node -e "
const {readFileSync}=require('fs');const {brotliCompressSync,constants}=require('zlib');
for(const t of ['light','dark']){
  const p='public/preview/greeting/'+t+'.html';
  const b=readFileSync(p);const s=b.toString('utf8');
  const body=s.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
  let fo=0;
  for(const m of body.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\sstyle=\"[^\"]*background[^\"]*\"[^>]*>([\s\S]*?)<\/\1>/gi))
    if(m[2].replace(/<[^>]*>/g,'').trim()==='')fo++;
  const cards=(body.match(/class=\"card-hd\"/g)||[]).length;
  const br=brotliCompressSync(b,{params:{[constants.BROTLI_PARAM_QUALITY]:11}}).length;
  console.log(t+': raw '+(b.length/1024).toFixed(1)+' KiB  brotli '+(br/1024).toFixed(1)+' KiB  cards '+cards+'  fillOnly '+fo);
}
"
```

기대 출력 (기준선 `6420c0a`):
```
light: raw 119.8 KiB  brotli 18.9 KiB  cards 44  fillOnly 82
dark: raw 121.7 KiB  brotli 19.4 KiB  cards 44  fillOnly 82
```

숫자가 다르면 main 이 또 움직인 것이다. 진행 전에 설계 문서의 "재측정 결과" 절을 갱신할 것.

- [ ] **Step 2: light.html 에서 카드 9장을 제거한다**

각 카드는 `<article ...>` 로 시작해 대응하는 `</article>` 로 끝난다. 위 9개 이름을 가진 `<article>` 블록을 통째로 지운다. 편집 후 `<article>` 과 `</article>` 개수가 같아야 한다.

- [ ] **Step 3: dark.html 에 같은 제거를 적용한다**

다크 파일도 같은 9장을 제거한다. 카드 이름은 양 테마에서 동일하다 (`Dark mirror` 포함).

- [ ] **Step 4: 카드 수 표기 3곳을 갱신한다**

44 − 9 = **35**. 표기가 세 군데에 흩어져 있으니 전부 고친다 (light·dark 양쪽).

1. `<style>` 머리 주석 (약 14행) — 현재:
   ```
   Greeting ATS(1) · Shape(4) · Spacing(1) · Type(5) = 46장.
   ```
   **이 줄은 이미 낡아 있다** (실제 44장인데 46장이라고 적혀 있다 — Brand 가 5 → 3 으로
   줄었을 때 갱신되지 않았다). 정리 후 실제 구성으로 다시 쓴다:
   ```
   Brand(3) · Colors(5) · Components(19) · Greeting ATS(1) · Shape(4) ·
   Spacing(1) · Type(2) = 35장.
   ```
   앞부분 `구성은 카드 갤러리다 — Brand(5) · Colors(11) · Components(19) ·` 도 같은
   줄묶음에 있으므로 함께 맞춘다.

2. `<span class="topbar-sys">Doodlin UI · 44 cards</span>` (약 629행 light / 635행 dark)
   → `Doodlin UI · 35 cards`

3. `<span class="grp-ct">` 7개 중 둘:
   - Colors 섹션 `11장` → `5장`
   - Type 섹션 `5장` → `2장`

   (나머지 다섯 — Brand `3장`, Components `19장`, Greeting ATS `1장`, Shape `4장`,
   Spacing `1장` — 은 그대로다.)

- [ ] **Step 5: 목표 수치 달성을 확인한다**

Step 1 의 스크립트를 다시 실행한다. 기대:

```
light: raw 101.5 KiB  brotli 17.1 KiB  cards 35  fillOnly 18
dark:  raw 103.0 KiB  brotli 17.5 KiB  cards 35  fillOnly 18
```

`fillOnly` 가 24 이상이면 제거가 덜 된 것이다 — 남은 fill 이 어느 카드에 있는지 확인할 것:

```bash
node -e "
const {readFileSync}=require('fs');
const body=readFileSync('public/preview/greeting/light.html','utf8').match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
for(const card of body.split(/(?=<article)/)){
  const nm=card.match(/class=\"card-hd\"><b>([^<]*)</);
  if(!nm)continue;
  let n=0;
  for(const m of card.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\sstyle=\"[^\"]*background[^\"]*\"[^>]*>([\s\S]*?)<\/\1>/gi))
    if(m[2].replace(/<[^>]*>/g,'').trim()==='')n++;
  if(n)console.log('  '+nm[1].padEnd(24)+n);
}
"
```

- [ ] **Step 6: 결정론적 게이트를 돌린다**

```bash
pnpm validate:previews --slug greeting --verbose
```

기대: `0 blocking`. `file-size-budget` warn 은 **여전히 뜬다** (light 101.5 KiB > 100 KiB raw budget). 이것은 Task 4 의 brotli 전환으로 해소되는 알려진 상태이며 block 이 아니므로 CI 는 통과한다.

`missing-disclaimer-banner` / `disclaimer-banner-misplaced` 가 뜨면 고지 스트립을 건드린 것이다 — `<body>` 첫 자식으로 되돌릴 것.

- [ ] **Step 7: OKLCH 커버리지가 유지됐는지 확인한다**

Step 6 출력의 `oklch N/M` 을 읽는다. 기대: **`65/65L`** (제거 전과 동일). 줄었다면 `:root` 토큰 선언을 잘못 지운 것이다.

```bash
pnpm audit:oklch
```
기대: `0 token(s) mismatched`.

- [ ] **Step 8: 브라우저에서 4폭 × 2테마 오버플로우를 확인한다**

dev 서버를 띄우고(`.claude/launch.json` 의 `Vite Dev Server (TanStack Start)`) `/preview/greeting/light.html` 과 `/preview/greeting/dark.html` 을 375 / 768 / 976 / 1440 에서 확인한다. 각 폭에서 `document.documentElement.scrollWidth <= window.innerWidth` 여야 한다.

기대 문서 폭: 360 / 753 / 961 / 1425 (정리 전과 동일 — 카드 제거는 레이아웃 폭을 바꾸지 않는다).

- [ ] **Step 9: 나머지 CI 게이트를 돌린다**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm validate:catalog && pnpm tokens:check
```

- [ ] **Step 10: 커밋**

```bash
git add public/preview/greeting/light.html public/preview/greeting/dark.html
git commit -s -m "fix(preview): 그리팅 스와치 카탈로그·타입 스케일 쇼케이스 제거

rubric-preview.md L23/L34 가 이미 금지한 콘텐츠였다 — 프리뷰는 컴포넌트
데모이지 스와치 카탈로그가 아니고, 타입 스케일은 토큰 카드에 산다.
greeting.tokens.json 이 colors 65 / typography 22 를 이미 렌더하므로
순수 중복이었다.

램프 열거 6장 + 스케일 열거 3장을 제거하고 사용 맥락 카드는 남겼다.
:root 토큰 선언은 그대로라 OKLCH 커버리지는 65/65 불변이다.

light 119.8 → 101.5 KiB, dark 121.7 → 103.0 KiB.
하드캡 여유 6.3 → 25.0 KiB, fillOnly 82 → 18."
```

---

### Task 2: PR-2 — `type-scale-showcase` 규칙

**왜 지금인가:** Task 1 이 머지된 뒤여야 그리팅이 이 규칙에 걸리지 않는다.

**Files:**
- Modify: `src/lib/preview-validator.ts`
- Test: `src/lib/preview-validator.test.ts`

**Interfaces:**
- Consumes: Task 1 이 남긴 그리팅 (`typoLabels` 0)
- Produces: `preview-validator.ts` 에 `bodyOf(html: string): string` 과 `labelledTokenNames(html: string, names: Array<string>): number` 를 추가한다. Task 3 이 `bodyOf` 를 재사용한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/lib/preview-validator.test.ts` 끝에 추가:

```typescript
// ── 루브릭 조항 기계화 ────────────────────────────────────────────────────────

/** design.md with N typography tokens named scale1..scaleN. */
function makeScaleDesignMd(count: number): string {
  const rows = Array.from(
    { length: count },
    (_, i) => `scale${i + 1}: 1${i}px / 1.5`
  )
  return [
    "---",
    "name: 데모",
    "slug: demo",
    "category: finance",
    'last_updated: "2026-07-03"',
    "sources:",
    "  - https://example.com/a",
    "related_services: []",
    "lang: ko",
    "logo: https://getdesign.kr/logos/demo.png",
    "---",
    "",
    "# 데모",
    "",
    "## Colors",
    "",
    "```yaml",
    "primary: oklch(0.62 0.18 250)",
    "```",
    "",
    "## Typography",
    "",
    "```yaml",
    ...rows,
    "```",
    "",
    "## Components",
    "",
    "버튼과 카드가 있다.",
  ].join("\n")
}

describe("validatePreviewPair — type-scale-showcase", () => {
  /** N rows, each naming `scale1`..`scaleN` in visible text. */
  function labelRows(n: number): string {
    return Array.from(
      { length: n },
      (_, i) => `<div class="row"><span>scale${i + 1}</span><p>본문</p></div>`
    ).join("")
  }

  it("blocks when the scale is enumerated (8 of 8 names)", () => {
    const body = `<main>${labelRows(8)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(8),
    })
    expect(rulesOf(input, "block")).toContain("type-scale-showcase")
  })

  it("allows a handful named in component context (6 of 22 names)", () => {
    // Mirrors the real catalog case this threshold was calibrated on: naming a
    // few scales where a component uses them is exactly what the rubric wants.
    const body = `<main>${labelRows(6)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(22),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })

  it("allows a small scale below the floor even at 100% (4 of 4 names)", () => {
    // The floor keeps a 4-token system from tripping on incidental mentions.
    const body = `<main>${labelRows(4)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(4),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })

  it("blocks a small scale that is fully enumerated at the floor (7 of 7)", () => {
    // Absolute-count thresholds miss this shape; the ratio catches it.
    const body = `<main>${labelRows(7)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(7),
    })
    expect(rulesOf(input, "block")).toContain("type-scale-showcase")
  })

  it("does not count a token name that only appears inside a longer word", () => {
    // `scale1` must not be found inside `scale10`, and a name mentioned only
    // in an attribute (not visible text) must not count either.
    const body =
      "<main>" +
      Array.from(
        { length: 8 },
        (_, i) => `<div data-token="scale${i + 1}">scale1${i}</div>`
      ).join("") +
      "</main>"
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(8),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts -t "type-scale-showcase"
```
기대: 첫 테스트가 FAIL — `type-scale-showcase` 규칙이 없으므로 `rulesOf` 결과에 없다.

- [ ] **Step 3: 최소 구현을 넣는다**

`src/lib/preview-validator.ts` 의 상수 블록(`WARN_BYTES` 아래)에 추가:

```typescript
// design.md `## Typography` 토큰 이름이 프리뷰 본문에 텍스트 라벨로 몇 개
// 등장하는가. 스탠드얼론 타입 스케일 쇼케이스는 필연적으로 각 단계에 이름을
// 달기 때문에, 마크업 구조나 클래스명과 무관하게 그 형태를 잡는다.
// rubric-preview.md L34 의 기계화. 코퍼스 실측: greeting 22, 그 외 전부 0~1.
// 위반의 정체는 "스케일을 통째로 열거"하는 것이므로 본질적으로 비율 문제다.
// 절대 개수만으로는 타입 토큰이 7개인 시스템이 7개를 다 열거해도 통과하고,
// 22개인 시스템이 6개만 적용 맥락에서 언급해도 걸린다.
//
// 바닥(5)은 스케일이 작은 시스템에서 우연한 언급 두어 개가 50%를 넘겨
// 오탐하는 것을 막는다. 코퍼스 실측: 그리팅이 정리 전 22/22(100%)로 위반,
// 정리 후 6/22(27%)로 통과 — 남은 6개는 Line-height roles 카드의 논지와
// 컴포넌트 스펙이라 루브릭이 오히려 요구하는 적용 맥락이다. socar 1/18(6%),
// 나머지 15개는 0.
const TYPE_SCALE_LABEL_FLOOR = 5
const TYPE_SCALE_LABEL_RATIO = 0.5
```

`visibleText` 아래에 헬퍼 두 개를 추가:

```typescript
function bodyOf(html: string): string {
  return html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
}

// 이름이 "단독 라벨"로 등장한 경우만 센다. 앞뒤를 공백이나 구두점으로 묶어
// `scale1` 이 `scale10` 안에서 매칭되는 것을 막는다. visibleText 가 태그를
// 공백으로 치환하므로 태그 경계도 자연히 경계로 잡히고, 속성값은 제거된다.
function labelledTokenNames(html: string, names: Array<string>): number {
  const text = visibleText(bodyOf(html))
  let found = 0
  for (const raw of new Set(names)) {
    const name = raw.trim()
    if (name.length < 2) continue
    const re = new RegExp(
      `(?:^|[\\s(·|,/])${escapeRegExp(name)}(?:$|[\\s)·|,/:])`,
      "u"
    )
    if (re.test(text)) found++
  }
  return found
}
```

`checkFile` 시그니처에 파라미터를 추가한다 (`heroSrc` 뒤, `issues` 앞):

```typescript
function checkFile(
  name: "light.html" | "dark.html",
  html: string,
  bytes: number,
  expectedTheme: "light" | "dark",
  expectedLang: string,
  heroSrc: string | undefined,
  typographyNames: Array<string>,
  issues: Array<ValidationIssue>
): void {
```

`checkFile` 본문에서 `hero-logo-missing` 검사 뒤에 규칙을 추가:

```typescript
  const scaleLabels = labelledTokenNames(html, typographyNames)
  const scaleShare = typographyNames.length
    ? scaleLabels / typographyNames.length
    : 0
  if (
    scaleLabels >= TYPE_SCALE_LABEL_FLOOR &&
    scaleShare >= TYPE_SCALE_LABEL_RATIO
  ) {
    issues.push(
      block(
        "type-scale-showcase",
        name,
        `${name} prints ${scaleLabels} of the design.md's ${typographyNames.length} typography token names as text labels (${Math.round(scaleShare * 100)}% — limit is ${TYPE_SCALE_LABEL_RATIO * 100}% once ${TYPE_SCALE_LABEL_FLOOR} names appear) — rubric-preview.md forbids a standalone type-scale showcase; the documented scale lives in {slug}.tokens.json. Naming a few scales in component context is fine; enumerating the scale is not.`
      )
    )
  }
```

`validatePreviewPair` 에서 typography 이름을 뽑아 넘긴다. `colorValues` 선언 옆에 추가:

```typescript
  let colorValues: Array<string> = []
  let typographyNames: Array<string> = []
```

try 블록 안 `colorValues = ...` 다음 줄에:

```typescript
    typographyNames = extractTokensFromMarkdown(doc.body).typography.map(
      (t) => t.name
    )
```

두 `checkFile(...)` 호출에 `typographyNames` 를 `heroSrc` 뒤에 끼워 넣는다.

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts -t "type-scale-showcase"
```
기대: 3개 PASS.

- [ ] **Step 5: 기존 17개가 회귀하지 않는지 확인한다**

```bash
pnpm validate:previews
```
기대: `0 blocking`. `type-scale-showcase` 가 하나라도 뜨면 임계값이나 이름 매칭이 과하게 잡는 것이다 — 어느 슬러그인지 확인하고 설계 문서의 캘리브레이션 표와 대조할 것.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/preview-validator.ts src/lib/preview-validator.test.ts
git commit -s -m "feat(validate): type-scale-showcase 규칙 — 루브릭 L34 기계화

rubric-preview.md L34 의 'No standalone type-scale showcase' 는 지금까지
서브에이전트 리뷰어의 정성 판단에만 맡겨져 있었고 그리팅에서 통과했다.

지표는 design.md Typography 토큰 이름이 본문 텍스트 라벨로 등장한 수다.
스케일 쇼케이스는 필연적으로 각 단계에 이름을 달기 때문에 마크업 구조나
클래스명을 바꿔도 우회할 수 없다.

위반의 정체가 '스케일 통째 열거'라 절대 개수가 아니라 비율로 잰다 — 이름이
5개 이상 등장하고 그것이 전체 타입 토큰의 절반을 넘으면 block. 절대 개수만
쓰면 토큰 7개짜리 시스템이 7개를 다 열거해도 통과하고, 22개짜리가 적용
맥락에서 6개만 언급해도 걸린다.

17개 전수 실측: 그리팅이 정리 전 22/22(100%)로 위반, 정리 후 6/22(27%)로
통과한다. 남은 6개는 Line-height roles 카드의 논지와 컴포넌트 스펙이라
루브릭이 오히려 요구하는 적용 맥락이다. socar 1/18, 나머지 15개는 0."
```

---

### Task 3: PR-2 — `swatch-catalog` 규칙

**Files:**
- Modify: `src/lib/preview-validator.ts`
- Test: `src/lib/preview-validator.test.ts`

**Interfaces:**
- Consumes: Task 2 의 `bodyOf(html: string): string`
- Produces: `swatchFillCount(html: string): number`

**핵심 설계 — 왜 단순 합계가 아닌가:** 향후 단일 파일 병합(PR-3b)에서 한 파일이 **양 테마의 fill 요소를 둘 다** 담고 한쪽을 CSS 로 숨긴다. 단순 합계로 세면 규칙을 지킨 파일이 두 배로 세어져 자기 자신을 block 한다 (그리팅 실측: 18 이 아니라 27). 그래서 정의를 "한 테마가 실제로 렌더하는 수"로 고정한다:

```
fillOnly = shared + max(lightOnly, darkOnly)
```

지금은 병합 파일이 없어 `lightOnly = darkOnly = 0` 이므로 단순 합계와 같지만, 이렇게 넣어두면 PR-3b 가 이 파일을 다시 건드릴 필요가 없다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/lib/preview-validator.test.ts` 의 Task 2 블록 아래에 추가:

```typescript
describe("validatePreviewPair — swatch-catalog", () => {
  /** N fill-only elements: inline background, no text of their own. */
  function fills(n: number, themeOnly?: "light" | "dark"): string {
    const attr = themeOnly ? ` data-theme-only="${themeOnly}"` : ""
    return Array.from(
      { length: n },
      (_, i) =>
        `<div class="sw"${attr}><div class="chip" style="background:oklch(0.6 0.1 ${i})"></div></div>`
    ).join("\n")
  }

  it("blocks at 24 or more fill-only elements", () => {
    const body = `<main>${fills(24)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })

  it("allows 23", () => {
    const body = `<main>${fills(23)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  it("does not count an element that has text of its own", () => {
    const labelled = Array.from(
      { length: 30 },
      (_, i) =>
        `<div class="sw" style="background:oklch(0.6 0.1 ${i})">토큰 ${i}</div>`
    ).join("\n")
    const body = `<main>${labelled}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  it("counts per rendered theme, not the sum, when both themes are inlined", () => {
    // A merged single-file preview carries both themes and hides one with CSS.
    // 12 shared + 12 light-only + 12 dark-only renders 24 per theme — over the
    // limit — while a naive total would say 36 and a per-theme count says 24.
    const over = `<main>${fills(12)}${fills(12, "light")}${fills(12, "dark")}</main>`
    const overInput = makeInput({
      lightRaw: makeHtml({ body: over }),
      darkRaw: makeHtml({ theme: "dark", body: over }),
    })
    expect(rulesOf(overInput, "block")).toContain("swatch-catalog")

    // 9 + 9 + 9 renders 18 per theme — under the limit — but totals 27, which
    // a naive count would wrongly block.
    const under = `<main>${fills(9)}${fills(9, "light")}${fills(9, "dark")}</main>`
    const underInput = makeInput({
      lightRaw: makeHtml({ body: under }),
      darkRaw: makeHtml({ theme: "dark", body: under }),
    })
    expect(rulesOf(underInput, "block")).not.toContain("swatch-catalog")
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts -t "swatch-catalog"
```
기대: 첫 테스트와 네 번째 테스트가 FAIL.

- [ ] **Step 3: 최소 구현을 넣는다**

상수 블록에 추가:

```typescript
// 인라인 background 를 칠하고 자기 텍스트가 없는 요소 — 오직 색을 보여주려고
// 존재하는 요소의 수. rubric-preview.md L23 의 기계화("component demo, not a
// swatch catalog"). 클래스명·마크업 구조와 무관해 이름을 바꿔 우회할 수 없다.
// 코퍼스 실측: greeting 82, 2위 bezier 7 — 12배 격차.
const SWATCH_FILL_LIMIT = 24
```

`bodyOf` 아래에 추가:

```typescript
// 병합 단일 파일은 양 테마의 fill 을 둘 다 싣고 한쪽을 CSS 로 숨긴다. 단순
// 합계로 세면 규칙을 지킨 파일이 두 배로 세어져 자기 자신을 block 하므로,
// "한 테마가 실제로 렌더하는 수"로 정의한다.
//
// `data-theme-only` 요소는 자기완결 균형 줄이라는 것이 병합 산출의 불변식이라,
// 줄 단위 귀속이 DOM 순회와 같은 답을 낸다 — 실제 그리팅 파일에서
// getComputedStyle 기반 측정과 18/18/82 로 일치함을 확인했다.
//
// 같은 줄에 같은 태그가 중첩된 경우 non-greedy 매칭이 첫 닫는 태그에서
// 끊겨 내부 텍스트를 보게 되므로 그 요소는 세지 않는다. 과소 계수 방향이라
// 오탐(정상 파일을 block)을 만들지 않는 안전한 쪽이다.
function swatchFillCount(html: string): number {
  let shared = 0
  let light = 0
  let dark = 0
  for (const line of bodyOf(html).split("\n")) {
    let fills = 0
    for (const m of line.matchAll(
      /<([a-z][a-z0-9]*)\b[^>]*\sstyle=["'][^"']*background[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi
    )) {
      if (m[2].replace(/<[^>]*>/g, "").trim() === "") fills++
    }
    if (fills === 0) continue
    const theme = line.match(/data-theme-only=["'](light|dark)["']/)?.[1]
    if (theme === "light") light += fills
    else if (theme === "dark") dark += fills
    else shared += fills
  }
  return shared + Math.max(light, dark)
}
```

`checkFile` 안, Task 2 의 `type-scale-showcase` 검사 옆에 추가:

```typescript
  const swatchFills = swatchFillCount(html)
  if (swatchFills >= SWATCH_FILL_LIMIT) {
    issues.push(
      block(
        "swatch-catalog",
        name,
        `${name} renders ${swatchFills} fill-only elements per theme (limit ${SWATCH_FILL_LIMIT}) — rubric-preview.md says the preview is a component demo, not a swatch catalog. The ramp catalogue belongs in {slug}.tokens.json; show colours applied to components instead.`
      )
    )
  }
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts -t "swatch-catalog"
```
기대: 4개 PASS.

- [ ] **Step 5: 기존 17개가 회귀하지 않는지 확인한다**

```bash
pnpm validate:previews
```
기대: `0 blocking`. 특히 그리팅(Task 1 후 18)과 bezier(7)가 통과해야 한다.

- [ ] **Step 6: 커밋**

```bash
git add src/lib/preview-validator.ts src/lib/preview-validator.test.ts
git commit -s -m "feat(validate): swatch-catalog 규칙 — 루브릭 L23 기계화

지표는 인라인 background 를 칠하고 자기 텍스트가 없는 요소 수다. 오직 색을
보여주려고 존재하는 요소이므로 클래스명이나 마크업을 바꿔도 우회할 수 없다.
코퍼스 실측에서 그리팅 82, 2위 bezier 7 로 12배 격차라 임계값 24 는 위아래로
3배 이상 여유가 있다.

계수는 단순 합계가 아니라 shared + max(lightOnly, darkOnly) 다. 향후 단일
파일 병합에서 한 파일이 양 테마 요소를 둘 다 싣기 때문에, 단순 합계로 세면
규칙을 지킨 파일이 두 배로 세어져 자기 자신을 block 한다(그리팅 18 이 아니라
27). data-theme-only 요소가 자기완결 균형 줄이라 줄 단위 귀속이 DOM 순회와
같은 답을 낸다 — 실측 18/18/82 일치."
```

---

### Task 4: PR-2 — 크기 게이트를 brotli 바이트 기준으로 전환

**Files:**
- Modify: `src/lib/preview-validator.ts`
- Test: `src/lib/preview-validator.test.ts`

**Interfaces:**
- Consumes: 없음 (독립)
- Produces: `file-size-budget` / `file-too-large` 의 의미가 brotli 기준으로 바뀌고, `file-too-large-raw` 규칙이 새로 생긴다.

**근거:** 캡의 자체 문구가 `"inline assets or duplicated markup have run away"` 인데 brotli 가 정확히 그 둘을 갈라낸다 — 반복 마크업은 압축돼 사라지고 base64 인라인 자산은 압축이 안 돼 그대로 남는다. 부수 효과로 들여쓰기·가독성에 물리던 세금이 사라진다(프리뷰는 사람이 읽고 고치는 산출물이고 prettier 대상이 아니다). 현재 34개 파일에 `data:` / base64 자산은 0건이다 — 이 캡이 노린 사고는 한 번도 없었고 정당한 콘텐츠만 위협해 왔다.

**주의:** `preview-validator.ts` 는 `scripts/validate-preview.ts` 와 자기 테스트만 import 하므로 `node:zlib` 사용이 안전하다. Step 5 에서 `pnpm build` 로 이를 확인한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```typescript
describe("validatePreviewPair — size gate (brotli)", () => {
  /** Random-ish text that brotli cannot compress away, to exercise the gate. */
  function incompressible(bytes: number): string {
    let s = ""
    let seed = 1
    while (Buffer.byteLength(s) < bytes) {
      seed = (seed * 1103515245 + 12345) % 2147483648
      s += seed.toString(36)
    }
    return s
  }

  it("does not warn on a large but highly repetitive file", () => {
    // 300 KiB of repeated markup compresses to a few KiB — exactly the
    // "duplicated markup" case the old raw cap punished for no user cost.
    const repeated = '<div class="row"><span>본문</span></div>\n'.repeat(6000)
    const html = makeHtml({ body: `<main>${repeated}</main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main>${repeated}</main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input)).not.toContain("file-size-budget")
    expect(rulesOf(input)).not.toContain("file-too-large")
  })

  it("blocks when incompressible payload exceeds the brotli hard cap", () => {
    const blob = incompressible(48 * 1024)
    const html = makeHtml({ body: `<main><p>${blob}</p></main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main><p>${blob}</p></main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input, "block")).toContain("file-too-large")
  })

  it("warns between the brotli budget and the hard cap", () => {
    const blob = incompressible(30 * 1024)
    const html = makeHtml({ body: `<main><p>${blob}</p></main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main><p>${blob}</p></main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input, "warn")).toContain("file-size-budget")
    expect(rulesOf(input, "block")).not.toContain("file-too-large")
  })

  it("keeps a raw safety net for runaway generated markup", () => {
    const repeated = '<div class="row"><span>본문</span></div>\n'.repeat(8000)
    const html = makeHtml({ body: `<main>${repeated}</main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main>${repeated}</main>` }),
      lightBytes: 300 * 1024,
      darkBytes: 300 * 1024,
    })
    expect(rulesOf(input, "block")).toContain("file-too-large-raw")
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts -t "size gate"
```
기대: 첫 테스트가 FAIL (현재는 raw 기준이라 300 KiB 반복 마크업이 `file-too-large` 를 띄운다), 네 번째도 FAIL (`file-too-large-raw` 규칙 없음).

- [ ] **Step 3: 최소 구현을 넣는다**

파일 맨 위 import 에 추가:

```typescript
import { brotliCompressSync, constants } from "node:zlib"
```

상수를 교체한다. 기존 `BLOCK_BYTES` / `WARN_BYTES` 두 줄을 지우고:

```typescript
// 크기 게이트는 실제로 배포되는 형태(brotli)를 잰다. Vercel 이 프리뷰 HTML 을
// `content-encoding: br` 로 서빙하므로 raw 바이트는 전송 비용이 아니다 —
// bezier 는 raw 106 KiB 인데 실제 다운로드는 21 KiB 다.
//
// 이 단위가 게이트의 자체 문구("inline assets or duplicated markup have run
// away")와 실제로 일치한다: 반복 마크업은 압축돼 사라지고, base64 인라인
// 자산은 압축이 안 돼 그대로 남는다. 그리고 들여쓰기·가독성에 세금을 물리지
// 않는다 — 프리뷰는 사람이 읽고 고치는 산출물이고 prettier 대상이 아니다.
//
// q11 은 "호스트가 내보내는 정확한 바이트"의 약속이 아니라 결정론적 프록시다.
// 코퍼스 실측 분포: min 5.2 / p50 11.3 / max 19.4 KiB.
const BROTLI_QUALITY = 11
const BLOCK_BROTLI_BYTES = 40 * 1024
const WARN_BROTLI_BYTES = 24 * 1024
// raw 안전망. 압축이 잘 되는 폭주(생성 루프가 같은 마크업을 무한 반복하는
// 종류)는 brotli 기준을 통과하므로 별도로 막는다.
const BLOCK_RAW_BYTES = 256 * 1024
```

`countOccurrences` 아래에 추가:

```typescript
function brotliBytes(html: string): number {
  return brotliCompressSync(Buffer.from(html, "utf8"), {
    params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
  }).length
}
```

`checkFile` 안의 기존 크기 블록을 교체한다. 아래를 지우고:

```typescript
  if (bytes > BLOCK_BYTES) { … } else if (bytes > WARN_BYTES) { … }
```

이것으로 바꾼다:

```typescript
  if (bytes > BLOCK_RAW_BYTES) {
    issues.push(
      block(
        "file-too-large-raw",
        name,
        `${name} is ${Math.round(bytes / 1024)}KB raw (> ${BLOCK_RAW_BYTES / 1024}KB) — generated markup has run away. Compressed size is not the issue here; the source itself is unreviewable.`
      )
    )
  }
  const wire = brotliBytes(html)
  if (wire > BLOCK_BROTLI_BYTES) {
    issues.push(
      block(
        "file-too-large",
        name,
        `${name} compresses to ${Math.round(wire / 1024)}KB brotli (> ${BLOCK_BROTLI_BYTES / 1024}KB hard cap) — inline assets have run away. Repetitive markup compresses away, so this size means real payload.`
      )
    )
  } else if (wire > WARN_BROTLI_BYTES) {
    issues.push(
      warn(
        "file-size-budget",
        name,
        `${name} compresses to ${Math.round(wire / 1024)}KB brotli (> ${WARN_BROTLI_BYTES / 1024}KB budget) — consider trimming showcase markup.`
      )
    )
  }
```

- [ ] **Step 4: 낡은 raw 기준 테스트를 교체한다**

`src/lib/preview-validator.test.ts` 약 165~173행에 raw 바이트를 전제한 기존 테스트가 있다:

```typescript
    const oversized = makeInput({ lightBytes: 130 * 1024 })
    expect(rulesOf(oversized, "block")).toContain("file-too-large")

    const budget = makeInput({ lightBytes: 108 * 1024 })
    expect(rulesOf(budget, "block")).not.toContain("file-too-large")
    expect(rulesOf(budget, "warn")).toContain("file-size-budget")
```

**둘 다 반드시 깨진다.** 픽스처 HTML 은 수백 바이트라 brotli 로는 1 KiB 미만이고,
raw 130 KiB 는 새 안전망 256 KiB 아래다. 이 세 assertion 을 지우고 아래로 바꾼다 —
`lightBytes` 는 이제 raw 안전망만 담당한다는 것을 고정하는 테스트다:

```typescript
    // 크기 게이트는 이제 brotli 기준이다 (Task 4). raw 바이트는 안전망 전용이라
    // 256 KiB 아래에서는 아무 이슈도 만들지 않는다 — 실제 전송량이 아니기 때문.
    const rawHeavy = makeInput({ lightBytes: 130 * 1024 })
    expect(rulesOf(rawHeavy, "block")).not.toContain("file-too-large")
    expect(rulesOf(rawHeavy, "block")).not.toContain("file-too-large-raw")
    expect(rulesOf(rawHeavy, "warn")).not.toContain("file-size-budget")
```

- [ ] **Step 5: 테스트가 통과하는지 확인한다**

```bash
pnpm vitest run src/lib/preview-validator.test.ts
```
기대: 파일 전체 PASS.

- [ ] **Step 6: `node:zlib` 이 클라이언트 번들로 새지 않는지 확인한다**

```bash
pnpm build
```
기대: 성공. `node:zlib` externalization 경고가 뜨면 `preview-validator.ts` 가 라우트/컴포넌트에서 import 되고 있다는 뜻이므로 즉시 멈추고 import 체인을 확인할 것 (현재는 `scripts/validate-preview.ts` 와 자기 테스트만 import 한다).

- [ ] **Step 7: 전수 게이트 + 크기 warn 해소 확인**

```bash
pnpm validate:previews
```
기대: `0 blocking`, 그리고 **`file-size-budget` warn 이 0건**이 된다. 전환 전에는 그리팅과 bezier 두 항목에서 발화하고 있었다. 콘텐츠 정책 단속은 Task 2·3 의 두 규칙으로 옮겨갔고 크기 게이트는 폭주 탐지기라는 본래 역할만 남으므로, 이는 의도한 결과다.

```bash
pnpm typecheck && pnpm lint && pnpm test
```

- [ ] **Step 8: 커밋**

```bash
git add src/lib/preview-validator.ts src/lib/preview-validator.test.ts
git commit -s -m "feat(validate): 프리뷰 크기 게이트를 brotli 바이트 기준으로 전환

Vercel 이 프리뷰를 content-encoding: br 로 서빙하므로 raw 바이트는 전송
비용이 아니다 — bezier 는 raw 106 KiB 인데 실제 다운로드가 21 KiB 다.

이 단위가 게이트 자체 문구('inline assets or duplicated markup have run
away')와 실제로 일치한다: 반복 마크업은 압축돼 사라지고 base64 인라인
자산은 압축이 안 돼 남는다. 그리고 들여쓰기에 세금을 물리지 않는다 —
프리뷰는 사람이 읽고 고치는 산출물이고 prettier 대상이 아니다.

warn 24 KiB / block 40 KiB (코퍼스 최대 19.4, p50 11.3, min 5.2).
압축이 잘 되는 폭주는 raw 256 KiB 안전망으로 따로 막는다.

부수 효과로 크기 warn 이 조용해진다. 콘텐츠 정책 단속은 swatch-catalog·
type-scale-showcase 로 옮겨갔고 크기 게이트는 폭주 탐지기 역할만 남는다."
```

---

### Task 5: PR-3a — `audit-oklch` 의 조용한 누락 제거

**왜 병합보다 먼저인가:** 단일 파일 병합 후 `audit:oklch` 는 **exit 0 에 해당 슬러그 언급 0건**으로 조용히 빠진다 (실측). `validate:previews` 는 `missing-preview-file` 2 block 으로 시끄럽게 실패하므로 안전하지만, 이쪽은 게이트가 초록인데 검사가 안 되는 상태를 만든다. 이 프로젝트가 반복해 당한 "조용한 거짓 통과" 패턴이다.

**Files:**
- Modify: `scripts/audit-oklch.ts`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (스크립트 동작 변경)

**범위 판단:** 드리프트 루프를 "디렉터리의 모든 `*.html` 스캔"으로 바꾸지 **않는다.** 이슈 #187 이 기록하듯 다크는 `[data-theme="dark"]` 스코프에서 토큰을 설계상 다른 값으로 재정의하므로, 라이트 기준 md 와 비교하면 오탐이 231건 쏟아진다. 병합 포맷을 미리 아는 코드를 넣는 것도 YAGNI 다. 실제 위험은 "조용함"이므로 그것만 정확히 제거한다.

`--sync` 대상 목록은 반대로 넓힌다 — 이쪽은 old→new 리터럴 치환이라 테마와 무관하고, 병합 파일이 sync 에서 빠지면 값이 낡은 채 남는다.

- [ ] **Step 1: 현재 동작을 재현해 본다**

```bash
mkdir -p /tmp/oklch-probe && cp public/preview/wanted/light.html /tmp/oklch-probe/ \
  && mv public/preview/wanted/light.html public/preview/wanted/preview.html
pnpm audit:oklch | tail -5
echo "wanted 언급 횟수: $(pnpm audit:oklch 2>/dev/null | grep -c wanted)"
```
기대: exit 0, `wanted 언급 횟수: 0` — 조용히 빠진다.

```bash
mv public/preview/wanted/preview.html public/preview/wanted/light.html
```
로 반드시 되돌릴 것.

- [ ] **Step 2: `--sync` 대상 목록을 디렉터리 전수로 넓힌다**

`scripts/audit-oklch.ts` 의 `const targets = [...]` 블록(약 206~211행)을 교체한다:

```typescript
  // 파생 리터럴은 md 뿐 아니라 프리뷰 HTML 에도 복사돼 있다. 파일명을 박아두면
  // 이름이 다른 프리뷰(단일 파일 병합 등)가 sync 에서 조용히 빠져 낡은 값이
  // 남으므로, 디렉터리의 모든 .html 을 대상으로 삼는다. 치환은 old→new 리터럴
  // 매칭이라 테마와 무관하다.
  const previewDir = path.join(PREVIEW, slug)
  const previewFiles = fs.existsSync(previewDir)
    ? fs
        .readdirSync(previewDir)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(previewDir, f))
    : []
  const targets = [mdPath, ...previewFiles].filter((p) => fs.existsSync(p))
```

- [ ] **Step 3: 드리프트 루프의 조용한 `continue` 를 시끄러운 실패로 바꾼다**

약 318~320행의 다음 부분을 찾는다:

```typescript
  const preview = path.join(PREVIEW, slug, "light.html")
  if (!fs.existsSync(preview)) continue
```

이것으로 교체한다:

```typescript
  // 라이트 스코프만 검사한다 — 다크는 [data-theme="dark"] 에서 토큰을 설계상
  // 다른 값으로 재정의하므로 라이트 기준 md 와 비교하면 오탐이 쏟아진다
  // (이슈 #187, 측정 231건).
  //
  // 없으면 조용히 넘기지 않는다. 프리뷰 파일 이름이 바뀌면(단일 파일 병합 등)
  // 이 루프가 exit 0 에 아무 출력 없이 통과해 "게이트는 초록인데 검사는 안 됨"
  // 상태를 만든다. 현재 카탈로그는 모든 슬러그가 light.html 을 갖고 있으므로
  // 여기서 멈추는 것이 정상이다.
  const preview = path.join(PREVIEW, slug, "light.html")
  if (!fs.existsSync(preview)) {
    console.error(
      `\n${slug}: no light.html under public/preview/${slug}/ — the drift ` +
        `check cannot run for this slug. If the preview format changed, teach ` +
        `this loop the new layout instead of letting it skip silently.`
    )
    process.exitCode = 1
    continue
  }
```

- [ ] **Step 4: 조용한 누락이 사라졌는지 확인한다**

Step 1 의 재현을 다시 돌린다:

```bash
mv public/preview/wanted/light.html public/preview/wanted/preview.html
pnpm audit:oklch; echo "exit=$?"
mv public/preview/wanted/preview.html public/preview/wanted/light.html
```
기대: `wanted: no light.html …` 메시지가 뜨고 **exit=1**.

- [ ] **Step 5: 정상 상태에서 회귀가 없는지 확인한다**

```bash
git status --short
```
기대: 비어 있음 (Step 4 의 mv 를 되돌렸는지 확인).

```bash
pnpm audit:oklch; echo "exit=$?"
```
기대: `0 token(s) mismatched`, **exit=0**.

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

- [ ] **Step 6: 커밋**

```bash
git add scripts/audit-oklch.ts
git commit -s -m "fix(audit): 프리뷰를 못 찾을 때 조용히 넘기지 않는다

드리프트 루프가 light.html 을 파일명으로 찾고 없으면 continue 했다.
프리뷰 파일 이름이 바뀌면(단일 파일 병합 등) exit 0 에 아무 출력 없이
통과해 '게이트는 초록인데 검사는 안 됨' 상태가 된다 — 실측으로 확인했다.
validate:previews 는 같은 상황에서 2 block 으로 시끄럽게 실패하므로
안전하지만 이쪽은 아니었다.

--sync 대상 목록도 파일명 하드코딩에서 디렉터리 전수로 넓혔다. 이쪽은
old→new 리터럴 치환이라 테마와 무관하고, 빠지면 낡은 값이 남는다.

드리프트 검사 자체는 라이트 스코프로 유지한다 — 다크는 설계상 값을
재정의하므로 라이트 기준 md 와 비교하면 오탐 231건이다(#187)."
```

---

## PR-3b 개괄 (이슈 #202 합의 대기 — 이 계획의 범위 밖)

합의가 나오면 별도 계획을 쓴다. 지금 확정된 것만 적어 둔다.

**전제 조건 (전부 충족돼야 착수):**
1. Task 1~4 머지 — 병합 파일의 raw 는 120.9 KiB 로 캡 여유가 7.1 KiB 뿐이라, brotli 게이트(Task 4) 없이는 병합이 용량 면에서 **퇴보**다.
2. Task 5 머지 — 그렇지 않으면 병합된 슬러그가 드리프트 감사에서 조용히 빠진다.
3. 이슈 #202 에서 (a)(b)(c) 합의 — `.claude/skills/design-md/` 변경을 포함하기 때문.

**작업 목록:**
- `src/lib/preview-validator.ts` — 쌍 전제를 단일 파일로. `data-theme-mismatch` 는 "초기 `data-theme` 가 light + 양 테마 토큰 블록 존재"로, `identical-style-blocks` 는 "두 `:root[data-theme=…]` 블록이 동일하면 warn"으로 재정의. 소급하지 않는 동안 **단일 파일과 쌍 구조를 모두 받아야** 한다. `swatch-catalog` 는 Task 3 에서 이미 병합 대응이 끝났으므로 건드릴 필요 없다.
- 새 규칙: 고지 스트립이 `data-theme-only` 를 달고 있으면 block (한쪽 테마에서 고지가 사라지는 것을 막는다).
- `scripts/validate-preview.ts` — 쌍 입출력을 단일 파일로.
- `src/lib/content-collection.ts` · `vite.config.ts` — 슬러그 존재 판정 파일명.
- `src/routes/services/-components/preview-frame.tsx` — src 고정 + postMessage. `key={src}` 리마운트가 불필요해진다.
- `public/preview/_runtime/iframe.js` — message / hashchange 리스너 수용.
- `.claude/skills/design-md/` — `preview-html-author` 1파일 산출, `SKILL.md:342` hard-check 목록 동기화, `rubric-preview.md:14` 크기 기준 문구 전환.

**병합 산출 규칙 (POC 로 검증됨):**
- `<style>`: `:root[data-theme="light"]` / `:root[data-theme="dark"]` 두 토큰 블록 + 공통 컴포넌트 규칙 한 벌 + 토글 CSS 한 줄
- `<body>`: LCS 정렬로 차이를 **제자리에** 짝지어 배치. 단순 연결(shared + light전부 + dark전부)은 레이아웃을 파괴한다.
- 초기 테마는 `?theme=` / `#dark` 를 head **인라인** 스크립트에서 확정. `defer` 인 `iframe.js` 는 first paint 이후라 깜빡인다.
- **`hashchange` 리스너 필수.** `preview.html` → `preview.html#dark` 는 same-document fragment navigation 이라 문서가 재파싱되지 않는다. POC 에서 이걸 빠뜨려 실제 결함이 났다.

**검증:** 원본 쌍과의 등가성을 기계로 확인한다 — 라이트/다크 각각 `body.innerText` 전문 일치, design.md 색 토큰 전수의 computed value 일치, 카드 수 일치, 고지 스트립 1개·첫자식. 폭 375/768/976/1440 × 2테마에서 `documentElement.scrollWidth` 가 원본과 같을 것. 테마 전환 3경로(초기 해시 파싱 / `hashchange` / postMessage)를 **드라이버 2종 이상으로 교차 확인** — 일부 브라우저 자동화 툴이 해시 변경을 강제 리로드로 처리해 `hashchange` 결함을 가린다 (POC 에서 실제로 그랬다).
