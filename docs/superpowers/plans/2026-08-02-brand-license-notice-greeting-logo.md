# 브랜드 자산 리스크 정정 PR 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라이선스·고지 문서가 실제로 보유한 권리만 허락하도록 고치고, 그리팅 프리뷰가 자체 제작 개작본 대신 공식 로고를 쓰도록 되돌린다.

**Architecture:** 세 개의 독립 커밋으로 나눈다 — (1) 문서만 바꾸는 라이선스·고지 정정, (2) 그리팅 프리뷰 HTML 2개와 계약 테스트를 바꾸는 정합성 복구, (3) 렌더에 쓰이지 않는 로고 자산 제거. 각 커밋은 자체 테스트 사이클을 갖는다. 문서 변경은 vitest 콘텐츠 단언 테스트로, 프리뷰 변경은 기존 계약 테스트를 전체 순회로 일반화해서 고정한다.

**Tech Stack:** TypeScript · vitest · TanStack Start · pnpm · 정적 HTML 프리뷰

## Global Constraints

- 패키지 매니저는 **pnpm**. npm 금지.
- 모든 커밋은 DCO 서명: `git commit -s`.
- 편집 경로는 **워크트리 루트**(`git rev-parse --show-toplevel`) 기준. 메인 repo 경로로 편집하면 dev 서버가 stale 서빙한다.
- Bash 도구는 Git Bash(POSIX sh)다. PowerShell here-string(`@'...'@`)은 파서 오류가 아니라 **리터럴로 새어 들어간다**. 멀티라인 커밋 메시지는 heredoc(`git commit -F - <<'EOF'`)을 쓴다.
- `pnpm format:check` 범위는 `**/*.{ts,tsx,js,jsx}`뿐이다. `.md`·`.html`·`LICENSE-CONTENT`·`NOTICE`는 대상이 아니므로 prettier를 돌리지 않는다. 프리뷰 HTML에 prettier를 돌리면 마크업이 펼쳐져 175 KiB로 불어나 128 KiB 하드캡을 넘긴다.
- Windows 로컬에서 `format:check`가 실패하면 CRLF 오탐일 수 있다 — **CI가 진실**이며 해당 파일을 재포맷해 커밋하지 않는다. 반대로 `tokens:check` 실패는 진짜 drift다.
- 프리뷰 HTML 파일당 하드캡 **128 KiB**. 현재 greeting은 light 124.0 / dark 125.7 KiB로 여유가 2.3 KiB다. 이 PR은 내용을 제거만 하므로 여유가 늘어난다.
- 프리뷰 검증 폭은 **375 / 768 / 976 / 1440**. 976은 상세페이지 임베드 폭이자 알려진 사각지대다.
- 이 PR은 **아이콘 글리프를 건드리지 않는다.** greeting 프리뷰의 inline `<svg>`는 0개이고 `services/greeting.md:526`의 Don't가 이미 지켜졌다.

## File Structure

| 파일 | 책임 | 작업 |
| --- | --- | --- |
| `LICENSE-CONTENT` | CC BY 4.0 적용 범위 선언 | 헤더 블록 교체 (하단 legalcode 전문 불변) |
| `NOTICE` | 브랜드 자산 격리 + 국가 표장 + 자산 목록 | krds.svg 항목 분리, 자산 목록 추가 |
| `src/components/site/footer.tsx` | 사이트 하단 라이선스·비제휴 고지 | 문구 3곳 정정 |
| `src/lib/license-notice-consistency.test.ts` | 위 세 문서의 회귀 가드 | **신규** |
| `public/preview/greeting/light.html` | 그리팅 라이트 프리뷰 | 로고 4곳 교체, 카드 2장 제거, 고아 CSS 제거 |
| `public/preview/greeting/dark.html` | 그리팅 다크 프리뷰 | 동일 |
| `src/lib/design-md-skill-logo-policy.test.ts` | frontmatter logo ↔ 프리뷰 임베드 계약 | slug 하드코딩 → 전체 순회 + 예외 집합, 고아 자산 가드 추가 |
| `public/logos/*` | 브랜드 로고 자산 | 7개 삭제 |

---

### Task 1: 라이선스·고지 문서 정정

**Files:**
- Create: `src/lib/license-notice-consistency.test.ts`
- Modify: `LICENSE-CONTENT:1-14`
- Modify: `NOTICE:1-11`, `NOTICE` 하단
- Modify: `src/components/site/footer.tsx:9-13`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: 없음 (다른 태스크가 의존하지 않는 독립 변경)

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/lib/license-notice-consistency.test.ts` 를 새로 만든다:

```ts
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

describe("license and notice consistency", () => {
  it("states what CC BY covers before what it excludes", () => {
    const content = readRepoFile("LICENSE-CONTENT")
    expect(content).toContain("Scope (CC BY 4.0)")
    expect(content).toContain("Prose written for this catalog")
    expect(content).toContain("Preview layout, CSS, and component structure")
  })

  it("excludes third-party assets reproduced inside previews and OG images", () => {
    const content = readRepoFile("LICENSE-CONTENT")
    expect(content).toContain("public/preview/** and public/og/**")
    expect(content).toContain("Third-party fonts and photographs")
    expect(content).toContain("National emblems")
  })

  it("describes krds.svg as a national emblem without asserting one license", () => {
    const notice = readRepoFile("NOTICE")
    expect(notice).toContain("government symbol")
    expect(notice).toContain("정부기에 관한 공고")
    expect(notice).toContain("KOGL Type 1")
    expect(notice).toContain("NOT verified")
  })

  it("lists which brand each logo file belongs to", () => {
    const notice = readRepoFile("NOTICE")
    expect(notice).toContain("Asset inventory")
    expect(notice).toContain("greeting.svg")
    expect(notice).toContain("toss.png")
  })

  it("keeps the footer free of provisional and US-law wording", () => {
    const footer = readRepoFile("src/components/site/footer.tsx")
    expect(footer).not.toContain("잠정")
    expect(footer).not.toContain("fair use")
  })

  it("states non-affiliation in the footer", () => {
    const footer = readRepoFile("src/components/site/footer.tsx")
    expect(footer).toContain("제휴·후원 관계가 없습니다")
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `pnpm vitest run src/lib/license-notice-consistency.test.ts`
Expected: 6개 중 5개 FAIL. `"Scope (CC BY 4.0)"` 미포함, `"government symbol"` 미포함, `"Asset inventory"` 미포함, `"잠정"` 포함, `"제휴·후원 관계가 없습니다"` 미포함으로 실패한다. (`"fair use"` 단언은 `잠정` 단언과 같은 `it` 안에 있으므로 그 하나가 실패로 묶인다.)

- [ ] **Step 3: `LICENSE-CONTENT` 헤더 블록을 교체한다**

현재 1~14행은 다음과 같다:

```
The catalog content in this repository is licensed under
Creative Commons Attribution 4.0 International (CC BY 4.0).

Scope:
  - services/*.md
  - public/preview/**
  - public/og/**

Excluded (different terms):
  - Code (MIT, see LICENSE)
  - Brand logos in public/logos/* (see NOTICE)
```

이를 다음으로 바꾼다. **`Attribution:` 이하와 하단 CC BY legalcode 전문은 건드리지 않는다.**

```
The catalog content in this repository is licensed under
Creative Commons Attribution 4.0 International (CC BY 4.0).

Scope (CC BY 4.0) — what this license actually covers:
  - Prose written for this catalog in services/*.md
  - Token expressions authored here (e.g. OKLCH normalization)
  - Preview layout, CSS, and component structure in public/preview/**
  - OG card layout, typography, and breadcrumbs in public/og/**

Excluded (different terms):
  - Code (MIT, see LICENSE)
  - Brand logos in public/logos/* (see NOTICE)
  - Third-party brand logos, wordmarks, and product copy reproduced
    inside public/preview/** and public/og/**
  - Third-party fonts and photographs loaded or embedded by previews
  - National emblems (see NOTICE)
```

`public/og/**` 를 Scope에서 빼지 않는 것이 의도적이다 — OG 이미지의 레이아웃·타이포그래피·브레드크럼은 이 저장소의 저작물이고, `src/og/load-logo.ts`가 base64로 합성해 넣은 브랜드 로고만 배제 대상이다.

- [ ] **Step 4: `NOTICE`의 krds.svg 항목을 분리한다**

현재 3~5행 `The brand logos under public/logos/ (e.g., krds.svg) are / trademarks or copyrighted material of their respective owners. / They are included for identification and reference purposes only.` 에서 `(e.g., krds.svg)` 를 제거해 `The brand logos under public/logos/ are` 로 바꾼다.

그리고 11행(`independently, or remove the affected logo files.`) 다음에 빈 줄을 두고 아래 블록을 삽입한다:

```
National emblem — public/logos/krds.svg

public/logos/krds.svg is the Republic of Korea government symbol
(정부상징), not a product logo. Its terms differ from the brand
logos above.

  - Governed by 「정부기에 관한 공고」 (2016-03-29, 대통령공고 제264호)
  - krds.go.kr states its materials are published under KOGL Type 1
    (공공누리 제1유형 — attribution)
  - Whether the symbol itself falls within that scope is NOT verified
  - Treated here as identification / reference only

Do not reuse it as an identifier for any non-government product.
```

- [ ] **Step 5: `NOTICE` 하단에 자산 목록을 추가한다**

먼저 목록을 생성한다. Task 3에서 자산을 삭제하기 **전** 상태이므로, 이 단계에서는 삭제 예정 7개를 제외하고 만든다:

파일명에서 slug를 추론하면 `goorm.png`(→ vapor-ui)나 `seed-design-symbol.png` 같은 케이스가 틀린다. 대신 **실제로 그 파일을 참조하는 서비스**에서 브랜드명을 끌어온다:

```bash
cd "$(git rev-parse --show-toplevel)"
DOOMED='^(baemin\.png|baemin-symbol\.png|demo-courier\.svg|wanted-logotype\.svg|wanted-symbol\.svg|greeting-mono\.png|greeting-logotype-mono\.png)$'
for l in $(ls public/logos/ | sort); do
  echo "$l" | grep -qE "$DOOMED" && continue
  slugs=$(grep -l "/logos/$l" services/*.md public/preview/*/*.html 2>/dev/null \
          | sed -E 's|^services/||; s|\.md$||; s|^public/preview/([^/]+)/.*|\1|' \
          | sort -u)
  name=$(for s in $slugs; do
           grep -m1 '^name:' "services/$s.md" 2>/dev/null | sed 's/^name: *//; s/"//g'
         done | sort -u | head -1)
  printf "  %-30s %s\n" "$l" "$name"
done
```

각 줄의 브랜드명이 비어 있으면 그 파일은 아무 서비스도 참조하지 않는다는 뜻이므로, Task 3의 고아 목록에 빠진 항목이 있다는 신호다 — 그 경우 멈추고 Task 3의 삭제 대상을 재확인한다.

출력을 `NOTICE` 맨 아래(`See docs/TAKEDOWN.md for how takedown requests are handled.` 다음 빈 줄 뒤)에 다음 형식으로 붙인다:

```
Asset inventory — which brand each file belongs to

This list is maintained by hand. Automating it is tracked separately;
until then, update this section whenever a logo file is added or removed.

  <위 명령의 출력>
```

- [ ] **Step 6: `src/components/site/footer.tsx` 문구를 정정한다**

9~13행의 `<p>` 내용을 바꾼다. 현재:

```tsx
        <p className="leading-relaxed text-muted-foreground">
          코드 MIT (잠정) · 콘텐츠 CC-BY 4.0 (잠정) · 각 서비스명·로고는 해당
          권리자 소유, 분석 목적 fair use에 한함.
        </p>
```

변경 후:

```tsx
        <p className="leading-relaxed text-muted-foreground">
          코드 MIT · 콘텐츠 CC BY 4.0 · 각 서비스명·로고는 해당 권리자 소유이며
          식별·참조 목적으로만 사용합니다. 이 사이트는 어떤 브랜드와도 제휴·후원
          관계가 없습니다.
        </p>
```

세 가지를 고친다. (a) `(잠정)` 삭제 — `LICENSE`·`LICENSE-CONTENT`·`NOTICE`는 확정 문서인데 푸터만 잠정이라 표기해 자기 문서끼리 어긋난다. (b) `fair use` → `식별·참조 목적` — fair use는 미국 저작권법 개념이고 한국 상표법에는 대응 조문이 없다. (c) 비제휴·비후원 명시 추가 — 부정경쟁방지법 제2조 제1호 나목의 광의의 혼동을 겨냥하는 문장이 현행에는 없다.

`Issue 001 / May 2026` 머리글(15~17행)은 사이트의 편집 컨셉이므로 손대지 않는다.

- [ ] **Step 7: 테스트가 통과하는지 확인한다**

Run: `pnpm vitest run src/lib/license-notice-consistency.test.ts`
Expected: 6 passed

- [ ] **Step 8: 포맷·타입 게이트를 돌린다**

Run: `pnpm typecheck && pnpm lint && pnpm format:check`
Expected: 모두 통과. `format:check`가 `.claude/skills/docs-crawler/` 하위에서만 실패하면 CRLF 오탐이므로 무시하고 그 파일을 건드리지 않는다.

- [ ] **Step 9: 커밋한다**

```bash
git add LICENSE-CONTENT NOTICE src/components/site/footer.tsx src/lib/license-notice-consistency.test.ts
git commit -s -F - <<'EOF'
docs: 라이선스·고지를 포함 중심으로 재작성하고 국가 표장을 분리한다

LICENSE-CONTENT가 public/preview/** 와 public/og/** 를 통째로 CC BY 로 선언해,
권리가 없는 제3자 브랜드 로고·워드마크·제품 카피까지 재배포·개작을 허락하고
있었다. public/logos/* 예외는 OG 이미지에 base64 로 합성된 로고에는 미치지 않아
무력했다.

- Scope 를 이 저장소가 실제로 저작한 것(산문·토큰 표현·프리뷰 레이아웃/CSS)으로
  명시하고, 제3자 자산을 Excluded 에 열거
- NOTICE 에서 krds.svg 를 국가 표장으로 분리. 단일 라이선스로 단정하지 않고
  근거 규정과 미확인 사항을 함께 기록
- NOTICE 에 브랜드↔파일 자산 목록 추가 (takedown 시 grep 누락 방지)
- footer 의 "(잠정)" 삭제, 한국법에 대응 개념이 없는 "fair use" 를 "식별·참조
  목적"으로 교체, 상표 축에서 실제로 필요한 비제휴·비후원 문장 추가
EOF
```

---

### Task 2: 그리팅 프리뷰 정합성 복구

**Files:**
- Modify: `src/lib/design-md-skill-logo-policy.test.ts:45-77`
- Modify: `public/preview/greeting/light.html` — 144-145, 189-191, 637, 649, 730-745, 747-761, 1391, 1685
- Modify: `public/preview/greeting/dark.html` — 150-151, 195-197, 643, 655, 736-751, 753-767, 1397, 1691

**Interfaces:**
- Consumes: 없음
- Produces: `KNOWN_LOGO_GAPS: Set<string>` — Task 3이 같은 파일에 고아 자산 가드를 추가하므로 이 상수와 충돌하지 않게 파일 하단에 붙인다.

- [ ] **Step 1: 계약 테스트를 전체 순회로 일반화한다 (실패하는 테스트)**

`src/lib/design-md-skill-logo-policy.test.ts` 의 import 줄에 `readdirSync` 를 추가한다:

```ts
import { existsSync, readdirSync, readFileSync } from "node:fs"
```

그리고 두 번째 `it` 블록(45~77행) 전체를 다음으로 교체한다:

```ts
  // rubric-preview.md Item 1: the frontmatter logo must appear in both previews.
  // Known gaps — these use a different *official* asset, not a rights issue.
  // Tracked separately; do not add entries without a linked follow-up.
  const KNOWN_LOGO_GAPS = new Set(["gmarket", "socar"])

  it("keeps every service logo asset present and visible in both previews", () => {
    const servicePaths = readdirSync(join(ROOT, "services"))
      .filter((file) => file.endsWith(".md"))
      .map((file) => `services/${file}`)

    expect(servicePaths.length).toBeGreaterThan(0)

    for (const servicePath of servicePaths) {
      const frontmatter = readFrontmatter(servicePath)
      const slug = servicePath.match(/services\/(.+)\.md$/)?.[1]
      const logo = frontmatter.match(/^logo:\s*(\S+)\s*$/m)?.[1]

      expect(slug, `${servicePath} slug`).toBeTruthy()
      expect(logo, `${servicePath} logo frontmatter`).toBeTruthy()
      expect(logo, `${servicePath} logo must be absolute URL`).toMatch(
        /^https:\/\/getdesign\.kr\/logos\//
      )
      const logoSrcPath = logo!.replace(/^https:\/\/getdesign\.kr/, "")
      expect(
        existsSync(join(ROOT, "public", logoSrcPath.replace(/^\//, ""))),
        `${servicePath} logo asset must exist at public${logoSrcPath}`
      ).toBe(true)

      // KNOWN_LOGO_GAPS exempts ONLY the preview-embedding check below.
      // The absolute-URL form and asset existence above apply to every slug.
      if (KNOWN_LOGO_GAPS.has(slug!)) continue

      for (const theme of ["light", "dark"]) {
        const previewPath = `public/preview/${slug}/${theme}.html`
        expect(
          readRepoFile(previewPath),
          `${previewPath} must embed site-relative <img src> (not the absolute URL form)`
        ).toContain(`src="${logoSrcPath}"`)
      }
    }
  })
```

- [ ] **Step 2: 테스트가 greeting에서 실패하는지 확인한다**

Run: `pnpm vitest run src/lib/design-md-skill-logo-policy.test.ts`
Expected: FAIL — `public/preview/greeting/light.html must embed site-relative <img src>` 로 실패한다. 실패가 **greeting 한 건**인지 확인한다. gmarket·socar가 함께 실패하면 `KNOWN_LOGO_GAPS` 가 적용되지 않은 것이다.

- [ ] **Step 3: 헤더·네비의 심볼을 공식 벡터로 교체한다**

`light.html` 637행, 1391행, 1685행 그리고 `dark.html` 643행, 1397행, 1691행의 다음 형태를

```html
<img class="mark-sym lg-mono" src="/logos/greeting-mono.png" alt="그리팅 심볼" width="20" height="20">
```

다음으로 바꾼다 (1391/1685/1397/1691은 `alt=""` 이므로 그 값을 유지한다):

```html
<img class="mark-sym" src="/logos/greeting.svg" alt="그리팅 심볼" width="20" height="20">
```

`lg-mono` 클래스를 제거하는 것이 핵심이다 — 그 클래스가 `filter: var(--f-base)` 를 걸어 라이트에서는 그대로, 다크에서는 `invert(1)` 로 반전시킨다. 공식 벡터는 필터 없이 브랜드 파랑 `#1890FF` 로 렌더돼야 한다.

- [ ] **Step 4: 히어로 워드마크를 텍스트로 교체한다**

`light.html` 649행, `dark.html` 655행의

```html
      <img class="hero-wordmark lg-mono" src="/logos/greeting-logotype-mono.png" alt="그리팅" height="34">
```

를 다음으로 바꾼다:

```html
      <span class="hero-wordmark">그리팅</span>
```

그리고 `.hero-wordmark` CSS를 이미지용에서 텍스트용으로 바꾼다. `light.html` 207행 현재:

```css
  .hero-wordmark { height: 34px; width: auto; margin: 0 0 22px; }
```

변경 후:

```css
  .hero-wordmark { display: block; font-size: 30px; line-height: 34px; font-weight: 700;
                   letter-spacing: -0.01em; color: var(--text-1); margin: 0 0 22px; }
```

반응형 규칙도 함께 바꾼다. `light.html` 619행 현재:

```css
    .hero-wordmark { height: 28px; }
```

변경 후:

```css
    .hero-wordmark { font-size: 24px; line-height: 28px; }
```

`dark.html` 의 대응 행에도 동일하게 적용한다 (행번호는 다를 수 있으므로 `.hero-wordmark` 문자열로 찾는다). 브랜드 서체를 흉내 내지 않고 본문과 같은 Pretendard를 그대로 쓴다 — `services/greeting.md:231` 이 "워드마크는 커스텀 레터링이라 Pretendard가 아니다"라고 적었으므로, 텍스트 대체는 재현이 아니라 미수록임을 분명히 하는 처리다.

- [ ] **Step 5: 로고 쇼케이스 카드 2장을 제거한다**

`light.html` 에서 **730~745행**을 삭제한다. 시작 앵커는 `<div class="card-hd"><b>Greeting logo</b>` 바로 위의 `<article class="card wide">` 이고, 끝 앵커는 그에 대응하는 `</article>` 이다. 이어지는 빈 줄(746행)도 함께 지운다.

이어서 **747~761행**을 삭제한다. 시작 앵커는 `<div class="card-hd"><b>Greeting symbol</b>` 바로 위의 `<article class="card">` 이고, 끝 앵커는 대응 `</article>` 이다. 이어지는 빈 줄도 함께 지운다.

`dark.html` 에서는 각각 **736~751행**(`<article class="card wide">` + `Greeting logo`)과 **753~767행**(`<article class="card">` + `Greeting symbol`)이 대상이다.

삭제 후 Brand 섹션에는 `Doodlin wordmark` · `Brand imagery` · `Naming` 3장만 남고, 셋 다 이미지 없는 서술 카드가 된다. 삭제된 카드 안에 있던 두 `<p class="note">` 도 함께 사라진다 — 이것이 "mono / reverse 쌍 밖으로 다시 그리거나 색을 바꾸지 않는다"와 "앱 아이콘 플레이트는 radius20 자리다"를 제거하는 방법이다. 별도 캡션 재작성 작업은 없다.

- [ ] **Step 6: 고아가 된 CSS를 제거한다**

두 파일에서 다음 규칙을 삭제한다 (`light.html` 189~191행, `dark.html` 195~197행):

```css
  .lg-mono { filter: var(--f-base); }
  .lg-rev { filter: invert(1); }
  .lg-plate { filter: var(--f-inv); }
```

그리고 `--f-base` · `--f-inv` 커스텀 프로퍼티 선언을 삭제한다 (`light.html` 144~145행의 `--f-base: none;` / `--f-inv: invert(1);`, `dark.html` 150~151행의 `--f-base: invert(1);` / `--f-inv: none;`).

`.app-icon`, `.app-icon.neutral`, `.ladder` 규칙도 사용처가 카드 안에만 있었으므로 고아가 된다. `.plate` 는 문자열이 `.lg-plate` 등과 겹치므로 **반드시 개별 확인**한다. 다음으로 실제 잔여 사용을 검사한다:

```bash
for c in app-icon ladder plate lg-mono lg-rev lg-plate f-base f-inv; do
  printf "%-10s light=%s dark=%s\n" "$c" \
    "$(grep -c "class=\"[^\"]*$c" public/preview/greeting/light.html)" \
    "$(grep -c "class=\"[^\"]*$c" public/preview/greeting/dark.html)"
done
```

`0 0` 인 클래스만 CSS 규칙을 지운다. 하나라도 남아 있으면 그 규칙은 존치한다.

- [ ] **Step 7: 테스트가 통과하는지 확인한다**

Run: `pnpm vitest run src/lib/design-md-skill-logo-policy.test.ts`
Expected: 2 passed

- [ ] **Step 8: 프리뷰 검증기와 용량을 확인한다**

```bash
pnpm validate:previews --slug greeting --verbose
ls -l public/preview/greeting/
```

Expected: 검증 통과. 파일 크기가 이전(light 127,048 B / dark 128,826 B)보다 **줄어야** 한다. 늘었다면 편집이 잘못된 것이다.

- [ ] **Step 9: 커밋한다**

```bash
git add public/preview/greeting/light.html public/preview/greeting/dark.html src/lib/design-md-skill-logo-policy.test.ts
git commit -s -F - <<'EOF'
fix(catalog): 그리팅 프리뷰가 개작본 대신 공식 심볼을 쓰도록 되돌린다

frontmatter logo 는 greeting.svg(공식 벡터, 파랑 #1890FF)인데 프리뷰는 그것을
한 번도 참조하지 않고, 번들에서 알파 추출한 검정 실루엣 파생본 2종을 14회
임베드하고 있었다. rubric-preview.md Item 1 위반이다.

더해서 CSS 가 그 파생본에 filter: invert(1) 을 거는 셀의 캡션이 "다시 그리거나
색을 바꾸지 않는다"라고 적혀 있었고, 같은 캡션의 "앱 아이콘 플레이트는 radius20
자리다"는 greeting.md:341(용도 매핑 금지)과 :521(radius20 미사용)을 동시에
위반했다. 두 캡션 모두 md 에 근거가 없다 — 심볼·reverse·여백·mono·플레이트
어휘가 md 570 줄에 0 건이다.

- 헤더·네비 심볼 3곳을 /logos/greeting.svg 로 교체하고 lg-mono 필터 제거
- 히어로 워드마크는 공식 자산이 없으므로 이미지 대신 텍스트로 대체
  (두들린 워드마크를 "자산 미수록"으로 처리한 기존 방식과 동일)
- 로고 사용 규격 쇼케이스 카드 2장 제거 — 근거 없는 규범문과 radius20 모순이
  카드와 함께 사라진다. 임베드 14 → 4
- 고아가 된 .lg-mono/.lg-rev/.lg-plate 와 --f-base/--f-inv 제거
- 계약 테스트를 slug 4개 하드코딩에서 services/*.md 전체 순회로 일반화.
  이 위반이 새어나간 원인이 그 하드코딩이었다. gmarket·socar 는 공식 자산끼리의
  불일치라 성격이 달라 KNOWN_LOGO_GAPS 로 분리하고, 예외는 프리뷰 임베드
  검사에만 적용한다
EOF
```

---

### Task 3: 렌더에 쓰이지 않는 로고 자산 제거

**Files:**
- Modify: `src/lib/design-md-skill-logo-policy.test.ts` (고아 가드 `it` 추가)
- Delete: `public/logos/greeting-mono.png`, `greeting-logotype-mono.png`, `baemin.png`, `baemin-symbol.png`, `demo-courier.svg`, `wanted-logotype.svg`, `wanted-symbol.svg`

**Interfaces:**
- Consumes: Task 2의 `readdirSync` import (이미 추가돼 있다)
- Produces: 없음

> **스펙과의 차이 — 고아는 4개가 아니라 5개다.** 스펙은 `wanted-logotype.svg` 를 "참조가 있어 제외"했으나, 그 참조는 `services/wanted.md:819` 가 상류 SSOT 번들의 파일명을 **산문으로 언급**한 것이고 `/logos/` 참조가 아니다. 정밀 참조형(`/logos/<파일명>`)으로 재판정하면 고아다. 총 삭제 대상은 그리팅 개작본 2개 + 고아 5개 = **7개**다.

- [ ] **Step 1: 고아 자산 가드 테스트를 추가한다 (실패하는 테스트)**

`src/lib/design-md-skill-logo-policy.test.ts` 의 `describe` 블록 안, Task 2에서 만든 `it` 다음에 추가한다:

```ts
  it("keeps no unreferenced files in public/logos", () => {
    const logoFiles = readdirSync(join(ROOT, "public/logos"))
    expect(logoFiles.length).toBeGreaterThan(0)

    const haystackPaths = [
      ...readdirSync(join(ROOT, "services"))
        .filter((file) => file.endsWith(".md"))
        .map((file) => `services/${file}`),
      ...readdirSync(join(ROOT, "public/preview"), { recursive: true })
        .map((entry) => `public/preview/${String(entry).replace(/\\/g, "/")}`)
        .filter((path) => path.endsWith(".html")),
      ...readdirSync(join(ROOT, "src"), { recursive: true })
        .map((entry) => `src/${String(entry).replace(/\\/g, "/")}`)
        .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx")),
    ]

    const haystack = haystackPaths.map(readRepoFile).join("\n")

    // Match the reference form (/logos/<file>), not a bare filename — prose
    // that merely names an upstream asset is not a reference.
    const orphans = logoFiles.filter(
      (file) => !haystack.includes(`/logos/${file}`)
    )

    expect(
      orphans,
      "unreferenced logo files must be deleted; NOTICE's identification-and-reference justification does not apply to assets nothing renders"
    ).toEqual([])
  })
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

Run: `pnpm vitest run src/lib/design-md-skill-logo-policy.test.ts`
Expected: FAIL — orphans 배열에 `baemin-symbol.png`, `baemin.png`, `demo-courier.svg`, `greeting-logotype-mono.png`, `greeting-mono.png`, `wanted-logotype.svg`, `wanted-symbol.svg` 7개가 담겨 실패한다. **7개가 정확히 나오는지 확인한다.** 더 나오면 Task 2의 프리뷰 편집이 예상보다 많은 참조를 지운 것이므로 되짚는다.

- [ ] **Step 3: 자산 7개를 삭제한다**

```bash
git rm public/logos/greeting-mono.png \
       public/logos/greeting-logotype-mono.png \
       public/logos/baemin.png \
       public/logos/baemin-symbol.png \
       public/logos/demo-courier.svg \
       public/logos/wanted-logotype.svg \
       public/logos/wanted-symbol.svg
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

Run: `pnpm vitest run src/lib/design-md-skill-logo-policy.test.ts`
Expected: 3 passed

- [ ] **Step 5: `NOTICE` 자산 목록에 삭제분이 남아 있지 않은지 확인한다**

Task 1 Step 5에서 이미 7개를 제외하고 목록을 만들었으므로 정상이면 아무것도 나오지 않는다:

```bash
grep -n -E 'baemin\.png|baemin-symbol\.png|demo-courier\.svg|wanted-logotype\.svg|wanted-symbol\.svg|greeting-mono\.png|greeting-logotype-mono\.png' NOTICE
```

Expected: 출력 없음. 나오면 해당 줄을 지운다.

- [ ] **Step 6: 커밋한다**

```bash
git add -A public/logos src/lib/design-md-skill-logo-policy.test.ts NOTICE
git commit -s -F - <<'EOF'
chore: 렌더에 쓰이지 않는 로고 자산을 제거한다

NOTICE 의 "identification and reference purposes only" 라는 정당화는 어떤
화면에서도 식별·참조에 쓰이지 않는 파일에는 적용될 사실관계 자체가 없다.

- 그리팅 개작본 2개 — 직전 커밋으로 프리뷰가 공식 벡터를 쓰게 되어 고아가 됐다
- 고아 5개 — baemin.png, baemin-symbol.png, demo-courier.svg,
  wanted-logotype.svg, wanted-symbol.svg
  wanted-logotype.svg 는 services/wanted.md 산문이 상류 번들의 파일명을 언급할
  뿐 /logos/ 참조가 아니어서, 느슨한 grep 으로는 사용 중으로 보였다
- 참조형(/logos/<파일명>) 기준 고아 가드 테스트를 추가해 재발을 막는다
EOF
```

---

### Task 4: 전체 게이트 및 육안 검증

**Files:**
- 없음 (검증 전용). 회귀가 발견되면 해당 파일을 고치고 `fixup` 커밋을 만든다.

**Interfaces:**
- Consumes: Task 1~3의 모든 변경
- Produces: 없음

- [ ] **Step 1: CI와 동일한 게이트를 전부 돌린다**

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test
pnpm validate:catalog
pnpm validate:previews
pnpm tokens:check
pnpm audit:oklch
```

Expected: 전부 통과. `pnpm test` 가 cleanup 단계에서 `ReferenceError` + 10s timeout 을 내도 테스트 자체가 PASS 면 통과다 (vitest 4.1.6 + vite 8.0.13 조합의 알려진 증상). `format:check` 가 `.claude/skills/docs-crawler/` 하위에서만 실패하면 CRLF 오탐이므로 그 파일을 건드리지 않는다. `tokens:check` 실패는 오탐이 아니므로 안내대로 `pnpm tokens:build` 를 돌린다.

- [ ] **Step 2: 프리뷰 서버를 띄운다**

`.claude/launch.json` 의 dev 설정을 쓴다. 워크트리이므로 `pnpm install` 이 선행돼야 한다. Windows 예약 포트(2963–3162)에 3000이 걸리므로 임시 포트로 띄우고, **커밋 전에 `git checkout -- .claude/launch.json` 으로 되돌린다.**

- [ ] **Step 3: 8조합 스크린샷을 찍는다**

`375 / 768 / 976 / 1440` × `light / dark` 8조합으로 `/preview/greeting/light.html` 과 `/preview/greeting/dark.html` 을 캡처한다. 이 저장소에서 `preview_screenshot` 은 행이 걸리므로 **Playwright MCP** 를 쓴다.

확인할 것:
- 헤더 심볼이 브랜드 파랑(`#1890FF`) 라운드 사각형 + 흰 손으로 렌더되는가. 라이트·다크 양쪽에서 배경 대비가 충분한가 — 이전에는 무채색(라이트 검정 / 다크 흰색)이었으므로 인상이 바뀌는 지점이다.
- 히어로 워드마크가 텍스트 "그리팅"으로 렌더되고, 이전 이미지(34px 높이)와 광학적으로 비슷한 크기인가. 아래 `hero-eyebrow` 와의 간격이 무너지지 않았는가.
- Brand 섹션이 카드 3장으로 줄면서 그리드에 빈 칸이나 어색한 정렬이 생기지 않았는가. 특히 `card wide` 가 빠진 자리.
- 976px 에서 가로 오버플로가 없는가 (이 저장소의 알려진 사각지대).

- [ ] **Step 4: 카탈로그 목록과 상세 페이지를 확인한다**

`/` 목록에서 그리팅 항목의 아이콘이, 그리고 `/services/greeting` 상세에서 iframe 임베드가 정상인지 본다. `public/logos/greeting.svg` 는 삭제 대상이 아니므로 목록 아이콘은 변화가 없어야 한다.

- [ ] **Step 5: 회귀가 있으면 고치고 커밋한다**

발견된 문제는 해당 태스크의 커밋에 `--fixup` 으로 붙이지 말고 별도 커밋으로 남긴다:

```bash
git add <수정 파일>
git commit -s -m "fix(catalog): 그리팅 프리뷰 <구체적 회귀> 수정"
```

- [ ] **Step 6: 최종 diff를 검토한다**

```bash
git log --oneline origin/main..HEAD
git diff origin/main..HEAD --stat
```

Expected: 커밋 4개(스펙 1 + 구현 3) 또는 회귀 수정 포함 5개. `--stat` 에 이 계획이 명시하지 않은 파일이 있으면 원인을 확인한다.

---

## 범위 밖 (이 플랜이 다루지 않음)

- 접수 이메일 채널 추가
- `public/preview/seed-design/assets/` 실사진 2장 교체, 로고 리사이즈
- 프리뷰 고지 배너 34파일, 원티드 표 캡션, 스킬·루브릭·계약테스트 연동
- KRDS 주민등록번호 필드·정부24 문구·인증실패 오류 중립화
- `rubric-preview.md` 로고 조항, `parseRobots` 이름지정 UA 지원, `/preview/` noindex
- gmarket·socar 의 frontmatter ↔ 프리뷰 로고 불일치 (`KNOWN_LOGO_GAPS` 로 가시화만 함)
