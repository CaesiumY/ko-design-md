# V0 Minimal Core Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the working V0 minimal core scaffold for the 한국형 design.md catalog — a TanStack Start site that auto-routes from `services/*.md` files, renders them with a 1-click Copy UX, and is ready for content authoring.

**Architecture:** TanStack Start file-based routing + Vite `import.meta.glob` for build-time content collection from a flat root `services/` directory + react-markdown rendering pipeline + shadcn(base-luma) UI primitives. UI lives in `src/features/<domain>/`, content lives at the project root, library glue in `src/lib/`. Dark mode is system-driven via `prefers-color-scheme`.

**Aesthetic Direction (frontend-design):** *Korean Editorial Sleek* — warm charcoal/ivory base (slate 회피), Pretendard Variable으로 weight 900 디스플레이 + 400 본문 대비, 카테고리별 vibrant 그라디언트 cover에 SVG grain noise overlay, 작은 메타 caps(`LAST UPDATED — 2026-05-07`)로 매거진 단서, 디테일 aside는 gradient veil + backdrop-blur 영웅적 카드. Copy 액션이 사이트의 시그니처 모먼트.

**Tech Stack:** TanStack Start, TanStack Router, Tailwind v4, shadcn (base-ui), Pretendard, jotai, gray-matter, react-markdown, remark-gfm, rehype-slug, rehype-autolink-headings, shiki, gpt-tokenizer, sonner, vitest.

**Spec:** [docs/superpowers/specs/2026-05-07-ko-design-md-scaffold-design.md](../specs/2026-05-07-ko-design-md-scaffold-design.md)

---

## Conventions

- All paths are relative to repo root (`C:\Users\mn065\Desktop\projects\ko-design-md`).
- Shell: **PowerShell**. Chain with `;` (no `&&`).
- Package manager: **pnpm** (already configured).
- Test framework: **vitest** + Testing Library. Co-locate tests next to source: `foo.ts` → `foo.test.ts`.
- shadcn install: `pnpm dlx shadcn@latest add <component>`.
- Use existing `cn()` from `@/lib/utils`.
- Commit style: Conventional Commits, English imperative subject.
- After each task ends with a commit, run `pnpm typecheck` if any TS file changed in that task and ensure it passes before committing.
- **Aesthetic discipline:** No `text-xl/2xl` only — use the `.text-display` utility on headings. No bare gradient backgrounds — pair with `.bg-grain` overlay. Always `tabular-nums` for token/numeric counts.

---

## Task 1: Swap dependencies (Inter → Pretendard, add markdown libs)

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Remove Inter, add new runtime libs**

Run:
```powershell
pnpm remove "@fontsource-variable/inter"
pnpm add jotai pretendard gray-matter react-markdown remark-gfm rehype-slug rehype-autolink-headings shiki gpt-tokenizer
```
Expected: `package.json` `dependencies` contains the new packages, no peer-dep errors. `@fontsource-variable/inter` removed.

> **Note (corrected during implementation):** `@fontsource-variable/pretendard` does NOT exist on NPM — earlier plan draft was wrong. The official `pretendard` NPM package (v1.3.9+) ships the variable font CSS at `pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css` and that is what we use. `@fontsource/pretendard` would be static weights only (avoid).

- [ ] **Step 2: Verify gray-matter ships its own types**

Run:
```powershell
Get-ChildItem node_modules/gray-matter/*.d.ts -ErrorAction SilentlyContinue
```
Expected: at least one `.d.ts` file. If empty, add types: `pnpm add -D @types/gray-matter`.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add package.json pnpm-lock.yaml
git commit -m "chore: swap fontsource-inter for pretendard and add markdown pipeline libs"
```

---

## Task 2: Add shadcn UI primitives (Card / Badge / Sonner / Tooltip)

**Files:**
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/sonner.tsx`
- Create: `src/components/ui/tooltip.tsx`

- [ ] **Step 1: Run shadcn add**

```powershell
pnpm dlx shadcn@latest add card --yes; pnpm dlx shadcn@latest add badge --yes; pnpm dlx shadcn@latest add sonner --yes; pnpm dlx shadcn@latest add tooltip --yes
```
Expected: 4 new files under `src/components/ui/`. `sonner` install adds `sonner` npm package automatically.

- [ ] **Step 2: Verify generated files**

Run:
```powershell
Get-ChildItem src/components/ui
```
Expected: button.tsx, card.tsx, badge.tsx, sonner.tsx, tooltip.tsx.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/ui pnpm-lock.yaml package.json components.json
git commit -m "chore(ui): add shadcn card / badge / sonner / tooltip primitives"
```

---

## Task 3: Editorial design tokens, Pretendard font, system dark mode

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace top imports and dark variant**

Edit `src/styles.css`. Replace lines 1-6:

old:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/inter";

@custom-variant dark (&:is(.dark *));
```

new:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

@custom-variant dark (&:is([data-theme="dark"] *));
```

Note: `@custom-variant dark` is kept so shadcn's `dark:` utilities still resolve in source — no element ever sets `data-theme="dark"` in V0. The actual color flip uses `prefers-color-scheme` (Step 3).

- [ ] **Step 2: Replace --font-sans token in `@theme inline`**

Edit `src/styles.css`. Replace:
```css
    --font-sans: 'Inter Variable', sans-serif;
```
with:
```css
    --font-sans: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
```

- [ ] **Step 3: Replace `:root` light tokens with warm ivory + copper accent**

In the existing `:root { ... }` block (the light-mode block), replace these specific lines:

```css
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
```
with:
```css
    --background: oklch(0.985 0.006 85);
    --foreground: oklch(0.18 0.012 270);
    --card: oklch(0.998 0.003 85);
    --card-foreground: oklch(0.18 0.012 270);
    --popover: oklch(0.998 0.003 85);
    --popover-foreground: oklch(0.18 0.012 270);
```

Then **append** to the same `:root { ... }` block (just before the closing `}`):
```css
    --accent-glow: oklch(0.7 0.15 60);
```

- [ ] **Step 4: Convert `.dark` block to a media query with warm charcoal**

Replace the entire `.dark { ... }` block with:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --background: oklch(0.13 0.01 60);
        --foreground: oklch(0.97 0.005 90);
        --card: oklch(0.18 0.012 60);
        --card-foreground: oklch(0.97 0.005 90);
        --popover: oklch(0.18 0.012 60);
        --popover-foreground: oklch(0.97 0.005 90);
        --primary: oklch(0.398 0.195 277.366);
        --primary-foreground: oklch(0.962 0.018 272.314);
        --secondary: oklch(0.27 0.012 60);
        --secondary-foreground: oklch(0.97 0.005 90);
        --muted: oklch(0.25 0.01 60);
        --muted-foreground: oklch(0.72 0.012 80);
        --accent: oklch(0.25 0.01 60);
        --accent-foreground: oklch(0.97 0.005 90);
        --destructive: oklch(0.704 0.191 22.216);
        --border: oklch(1 0 0 / 10%);
        --input: oklch(1 0 0 / 15%);
        --ring: oklch(0.556 0 0);
        --chart-1: oklch(0.785 0.115 274.713);
        --chart-2: oklch(0.585 0.233 277.117);
        --chart-3: oklch(0.511 0.262 276.966);
        --chart-4: oklch(0.457 0.24 277.023);
        --chart-5: oklch(0.398 0.195 277.366);
        --sidebar: oklch(0.18 0.012 60);
        --sidebar-foreground: oklch(0.97 0.005 90);
        --sidebar-primary: oklch(0.585 0.233 277.117);
        --sidebar-primary-foreground: oklch(0.962 0.018 272.314);
        --sidebar-accent: oklch(0.25 0.01 60);
        --sidebar-accent-foreground: oklch(0.97 0.005 90);
        --sidebar-border: oklch(1 0 0 / 10%);
        --sidebar-ring: oklch(0.556 0 0);
        --accent-glow: oklch(0.78 0.13 60);
    }
}
```

- [ ] **Step 5: Append editorial utilities + animations + markdown prose at end of file**

Append:

```css
@layer utilities {
    .text-display {
        font-feature-settings: 'ss01', 'cv11';
        letter-spacing: -0.04em;
    }
    .text-meta-caps {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted-foreground);
    }
    .bg-grain {
        position: relative;
    }
    .bg-grain::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
        background-size: 160px 160px;
        mix-blend-mode: overlay;
        opacity: 0.35;
        pointer-events: none;
    }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 480ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

@layer components {
    .markdown-body { @apply text-foreground/90 leading-7; }
    .markdown-body h1 { @apply mt-12 text-3xl font-semibold tracking-tight; }
    .markdown-body h2 { @apply mt-12 text-2xl font-semibold tracking-tight border-b border-border/60 pb-2; }
    .markdown-body h3 { @apply mt-8 text-xl font-semibold; }
    .markdown-body p { @apply mt-4; }
    .markdown-body ul { @apply mt-4 ml-6 list-disc space-y-1; }
    .markdown-body ol { @apply mt-4 ml-6 list-decimal space-y-1; }
    .markdown-body code:not(pre code) { @apply rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono; }
    .markdown-body pre { @apply mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm; }
    .markdown-body pre code { @apply bg-transparent p-0; }
    .markdown-body blockquote { @apply mt-4 border-l-2 border-border pl-4 text-muted-foreground italic; }
    .markdown-body table { @apply mt-4 w-full border-collapse text-sm; }
    .markdown-body th, .markdown-body td { @apply border-b border-border/60 px-3 py-2 text-left; }
    .markdown-body a { @apply text-primary underline-offset-4 hover:underline; }
    .markdown-body h2 .heading-anchor, .markdown-body h3 .heading-anchor {
        @apply ml-2 text-muted-foreground/40 no-underline hover:text-foreground;
    }
    .markdown-body hr { @apply my-8 border-border/60; }
}
```

- [ ] **Step 6: Verify dev compiles**

Run `pnpm dev` in a separate terminal. Open http://localhost:3000.
Expected: existing "Project ready!" page renders without console errors, ivory-warm background instead of pure white. Switch OS to dark mode → page becomes warm charcoal. Stop dev.

- [ ] **Step 7: Commit**

```powershell
git add src/styles.css
git commit -m "feat(style): editorial Pretendard tokens, warm dark mode, grain + display utilities"
```

---

## Task 4: Content type definitions

**Files:**
- Create: `src/lib/content-types.ts`

- [ ] **Step 1: Write the type module**

Create `src/lib/content-types.ts`:

```ts
export type Category =
  | "finance"
  | "messenger"
  | "commerce"
  | "delivery"
  | "mobility"
  | "content"
  | "community"
  | "travel"
  | "etc"

export type Tier = 1 | 2 | 3
export type Lang = "ko" | "en"

export interface ServiceFrontmatter {
  name: string
  slug: string
  category: Category
  tier: Tier
  last_updated: string
  sources: string[]
  related_services: string[]
  lang: Lang
  estimated_tokens?: number
}

export interface ServiceDoc {
  frontmatter: ServiceFrontmatter
  raw: string
  body: string
  tagline: string
  filePath: string
  estimatedTokens: number
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```powershell
git add src/lib/content-types.ts
git commit -m "feat(content): add ServiceFrontmatter and ServiceDoc types"
```

---

## Task 5: Category style lookup (TDD)

**Files:**
- Create: `src/lib/category-style.ts`
- Create: `src/lib/category-style.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/category-style.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { getCategoryStyle } from "./category-style"

describe("getCategoryStyle", () => {
  it("returns gradient + label for known category", () => {
    const s = getCategoryStyle("finance")
    expect(s.label).toBe("Finance")
    expect(s.coverGradient).toMatch(/from-/)
  })

  it("falls back to 'etc' style for unknown category", () => {
    const s = getCategoryStyle("not-a-category" as never)
    expect(s.label).toBe("Etc")
  })
})
```

- [ ] **Step 2: Run test (expect fail)**

Run: `pnpm vitest run src/lib/category-style.test.ts`
Expected: FAIL — module `./category-style` not found.

- [ ] **Step 3: Implement**

Create `src/lib/category-style.ts`:

```ts
import type { Category } from "./content-types"

export interface CategoryStyle {
  label: string
  coverGradient: string
}

const STYLES: Record<Category, CategoryStyle> = {
  finance: { label: "Finance", coverGradient: "from-blue-500 via-indigo-500 to-cyan-400" },
  messenger: { label: "Messenger", coverGradient: "from-yellow-300 via-amber-400 to-orange-300" },
  commerce: { label: "Commerce", coverGradient: "from-emerald-500 via-teal-500 to-emerald-300" },
  delivery: { label: "Delivery", coverGradient: "from-orange-500 via-rose-500 to-amber-300" },
  mobility: { label: "Mobility", coverGradient: "from-indigo-600 via-violet-500 to-fuchsia-400" },
  content: { label: "Content", coverGradient: "from-rose-500 via-pink-500 to-fuchsia-400" },
  community: { label: "Community", coverGradient: "from-fuchsia-500 via-purple-500 to-indigo-400" },
  travel: { label: "Travel", coverGradient: "from-sky-500 via-cyan-500 to-blue-400" },
  etc: { label: "Etc", coverGradient: "from-zinc-600 via-zinc-500 to-zinc-400" },
}

export function getCategoryStyle(category: Category): CategoryStyle {
  return STYLES[category] ?? STYLES.etc
}
```

- [ ] **Step 4: Run test (expect pass)**

Run: `pnpm vitest run src/lib/category-style.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/category-style.ts src/lib/category-style.test.ts
git commit -m "feat(content): add category gradient and label lookup"
```

---

## Task 6: Demo markdown content (two fictional services)

**Files:**
- Create: `services/_demo-pay.md`
- Create: `services/_demo-courier.md`

- [ ] **Step 1: Create `services/_demo-pay.md`**

Write the file exactly:

```markdown
---
name: Demo Pay
slug: demo-pay
category: finance
tier: 1
last_updated: 2026-05-07
sources:
  - https://example.com/demo-pay/design
  - https://example.com/demo-pay/tech-blog
related_services: [demo-courier]
lang: ko
---

# Demo Pay — design.md

> Fictional service used to validate the rendering pipeline. Not a real product.

## 디자인 철학

Demo Pay는 **결제는 무조건 짧고 단호하게**라는 원칙을 본다. 한 손으로 잡은 화면 안에서, 사용자의 시선은 금액과 다음 행동(확인 버튼) 사이를 두 번만 오간다. 다른 모든 보조 정보는 그 두 시선의 바깥으로 밀어낸다.

이 단호함은 시각적으로도 같은 결을 갖는다. 색은 한 가지 핵심 액션 컬러 외에는 거의 무채색에 가깝게 운영하고, 모션은 사용자의 결정을 재촉하지 않으면서도 망설임을 끊어주는 역할만 한다. "결제는 신중해야 하지만, 망설이게 두지는 말자"가 시각 언어의 한 줄 요약이다.

## 비주얼 언어

- **Color tokens**: primary는 강한 단일 블루 (`oklch(0.55 0.18 250)`), surface는 거의 흰색에 가까운 ivory 톤, text는 high-contrast 무채색 2단(primary text / muted)
- **Typography**: Pretendard Variable. 금액은 tabular-nums + 700 weight, 설명은 400, 보조 정보는 500 muted
- **Iconography**: stroke 1.5px, rounded join, 아이콘은 액션 보조 역할만 — 메인 정보는 항상 텍스트
- **Radius / Elevation**: 카드 14px, 버튼 12px. shadow는 거의 없음 (border + 미세한 inner glow로 깊이 표현)
- **Motion**: 200ms ease-out 기준. 결제 confirm 시에만 240ms로 살짝 길게 — 사용자의 결정을 시각적으로 인식

## 핵심 UX 패턴

1. **금액 우선 (Amount-first)** — 어떤 결제 화면이든 금액이 화면 상단 1/3 안에 가장 큰 글자로. 다른 정보는 모두 그 아래로.
2. **단일 다음 행동 (Single primary action)** — 화면당 강조 버튼은 정확히 1개. 보조 행동은 ghost 또는 텍스트 링크.
3. **마찰 없는 인증 (Frictionless auth)** — 생체 인증을 default로, PIN은 fallback. 카드 추가는 카메라 OCR이 default.
4. **취소는 항상 한 번** — 결제 직전 화면에서 취소 버튼은 항상 좌상단의 X 위치에 일관되게.

## 시그니처 컴포넌트

### AmountDisplay

화면 상단에 노출되는 금액 컴포넌트. tabular-nums + 큰 weight + 통화 단위가 작게 따라온다.

```tsx
<div className="flex items-baseline gap-2">
  <span className="text-4xl font-bold tabular-nums">{amount.toLocaleString()}</span>
  <span className="text-base text-muted-foreground">원</span>
</div>
```

### ConfirmSheet

화면 하단에서 올라오는 결제 확인 시트. swipe down으로 dismiss, 메인 버튼은 탭 영역이 시트 너비 전체.

## 대표 화면

- **결제 confirm 화면**: 상단 1/3에 금액 + 결제 대상 한 줄, 중간에 결제 수단 카드 한 장, 하단에 단일 confirm 버튼. 보조 정보(영수증 옵션 등)는 작은 텍스트 링크.
- **결제 수단 관리**: 카드 리스트는 가로 스와이프 캐러셀이 아닌 세로 리스트 — 한 번에 한 카드씩 명확하게 보이도록.

## 한국적 맥락 (WHY)

한국의 모바일 결제는 한 손 사용 비중이 높고, 결제 빈도가 일상의 작은 단위(편의점, 카페)까지 깊게 들어와 있다. 이 환경에서는 "한 번 더 누르게 만드는 디자인"이 곧 이탈로 이어지기 쉽다. Demo Pay의 단호한 두 시선 원칙은 이런 환경에 대한 직접적인 응답이다.

또한 한국의 결제는 본인인증(PASS), 카드사 약관 표시, 영수증 옵션 같은 규제적 요소가 많다. 이 정보들을 "단호한 메인 흐름"의 흐름을 깨지 않으면서 어떻게 배치할 것인가가 한국 결제 디자인의 본질적 도전이다 — Demo Pay는 이를 보조 시트로 분리하고, 메인 흐름에는 한 줄 요약만 노출하는 패턴을 택한다.

## References

- https://example.com/demo-pay/design
- https://example.com/demo-pay/tech-blog
```

- [ ] **Step 2: Create `services/_demo-courier.md`**

Write the file exactly:

```markdown
---
name: Demo Courier
slug: demo-courier
category: delivery
tier: 2
last_updated: 2026-05-07
sources:
  - https://example.com/demo-courier/design
related_services: [demo-pay]
lang: ko
---

# Demo Courier — design.md

> Fictional service used to validate the rendering pipeline. Not a real product.

## 디자인 철학

Demo Courier는 **사용자의 기분을 같이 배달한다**고 본다. 음식을 기다리는 시간은 종종 지루하고, 때로 불안하다. 화면은 그 시간을 따뜻한 친구처럼 채워야 한다 — 그래서 시각 언어 전체에 약간의 캐릭터성과 따뜻한 색감을 둔다.

동시에, 핵심 정보(언제 도착하는가, 어디까지 왔는가)는 한눈에 들어와야 한다. "감성적이지만 정확한" — 이 두 마리 토끼를 잡는 것이 Demo Courier의 디자인 과제다.

## 비주얼 언어

- **Color tokens**: primary는 따뜻한 오렌지 (`oklch(0.7 0.18 50)`), accent는 부드러운 옐로우. surface는 크림 톤, text는 dark-warm gray
- **Typography**: Pretendard Variable. 제목은 Display 700, 본문은 500. 캐릭터 대사는 italic
- **Iconography**: rounded, 약간 통통한 형태. 핵심 아이콘은 미세한 마스코트 표정
- **Radius / Elevation**: 모든 radius 풍부 (16-20px). shadow는 가볍게 떠 있는 느낌
- **Motion**: 250-300ms, slight bounce. 도착 임박 알림에는 살짝 큰 motion으로 emphasis

## 핵심 UX 패턴

1. **실시간 위치 + 캐릭터 합성** — 지도 위에 라이더 캐릭터가 직접 움직임. 단순한 dot보다 "사람이 가져온다"는 감각을 강화.
2. **예상 도착 시간을 항상 상단 (ETA-first)** — 화면 어디에서든 ETA가 가장 위에. 사용자가 가장 자주 확인하는 정보.
3. **주문 단계별 마이크로카피** — "이제 픽업해요!", "거의 다 왔어요" 같은 친근한 톤으로 단계 변화 알림.
4. **재주문 한 탭 (1-tap reorder)** — 최근 주문은 홈 상단 카드에서 바로 재주문.

## 시그니처 컴포넌트

### EtaBanner

화면 상단에 sticky로 떠있는 ETA 표시. 시간이 줄어들수록 색이 살짝 밝아지며 강조 강도가 올라간다.

```tsx
<div className="sticky top-0 rounded-2xl bg-primary/10 p-4">
  <p className="text-sm text-muted-foreground">예상 도착</p>
  <p className="text-3xl font-bold">{minutes}분 후</p>
</div>
```

### RiderMapPin

지도 위 라이더 위치 핀. 단순 dot이 아닌 캐릭터 아이콘 + 진행 방향 표시.

## 대표 화면

- **주문 추적 화면**: 상단 EtaBanner, 가운데 큰 지도(라이더 캐릭터 핀 + 경로), 하단에 라이더/매장 정보 카드.
- **홈**: 상단 가까운 음식 카테고리 캐러셀 + 최근 주문 재주문 카드 + 추천 매장 그리드.

## 한국적 맥락 (WHY)

한국의 배달은 도시 밀도가 높고 배달 주기가 짧다. 사용자는 "배달이 왔는지" 궁금해 화면을 자주 들여다보는데, 이때 화면이 차갑거나 정보만 가득하면 기다림의 부담이 더 커진다. Demo Courier의 캐릭터/마이크로카피 톤은 이런 짧고 잦은 확인 행동에 작은 즐거움을 더하는 장치다.

또한 한국 배달 시장은 라이더 가시성이 중요한 사용자 경험 요소다 — "내 음식이 어디쯤 왔는지" 정확히 보는 것이 만족도와 직결. 라이더 캐릭터 핀은 이 정보 욕구를 정보 + 감성 두 축으로 동시에 만족시키는 한국 시장 특화 패턴이다.

## References

- https://example.com/demo-courier/design
```

- [ ] **Step 3: Commit**

```powershell
git add services
git commit -m "feat(content): add fictional Demo Pay and Demo Courier scaffolds"
```

---

## Task 7: Content collection module (TDD)

**Files:**
- Create: `src/lib/content-collection.ts`
- Create: `src/lib/content-collection.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/content-collection.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { getAllServices, getServiceBySlug } from "./content-collection"

describe("content-collection", () => {
  it("loads at least one service from /services/*.md", () => {
    const all = getAllServices()
    expect(all.length).toBeGreaterThan(0)
  })

  it("strips leading underscore from filename to derive slug", () => {
    const all = getAllServices()
    const slugs = all.map((s) => s.frontmatter.slug)
    expect(slugs).toContain("demo-pay")
  })

  it("returns ServiceDoc by slug, undefined when missing", () => {
    expect(getServiceBySlug("demo-pay")?.frontmatter.name).toBe("Demo Pay")
    expect(getServiceBySlug("does-not-exist")).toBeUndefined()
  })

  it("populates body without frontmatter fences and computes a positive token count", () => {
    const doc = getServiceBySlug("demo-pay")
    expect(doc).toBeDefined()
    expect(doc!.body.startsWith("---")).toBe(false)
    expect(doc!.estimatedTokens).toBeGreaterThan(100)
  })

  it("derives a non-empty tagline", () => {
    const doc = getServiceBySlug("demo-pay")
    expect(doc!.tagline.length).toBeGreaterThan(10)
  })
})
```

- [ ] **Step 2: Run test (expect fail)**

Run: `pnpm vitest run src/lib/content-collection.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/content-collection.ts`:

```ts
import matter from "gray-matter"
import { encode } from "gpt-tokenizer"
import type { ServiceDoc, ServiceFrontmatter } from "./content-types"

const RAW_MODULES = import.meta.glob("/services/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

function deriveSlug(filePath: string, frontmatterSlug: string | undefined): string {
  if (frontmatterSlug && frontmatterSlug.length > 0) return frontmatterSlug
  const fileName = filePath.split("/").pop() ?? ""
  return fileName.replace(/^_+/, "").replace(/\.md$/, "")
}

function deriveTagline(body: string): string {
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.startsWith("#")) continue
    if (trimmed.startsWith(">")) continue
    return trimmed.replace(/\*\*/g, "").slice(0, 200)
  }
  return ""
}

function buildDoc(filePath: string, raw: string): ServiceDoc {
  const parsed = matter(raw)
  const fm = parsed.data as Partial<ServiceFrontmatter>
  const slug = deriveSlug(filePath, fm.slug)
  const frontmatter: ServiceFrontmatter = {
    name: fm.name ?? slug,
    slug,
    category: fm.category ?? "etc",
    tier: (fm.tier as ServiceFrontmatter["tier"]) ?? 3,
    last_updated: fm.last_updated ?? "",
    sources: fm.sources ?? [],
    related_services: fm.related_services ?? [],
    lang: fm.lang ?? "ko",
    estimated_tokens: fm.estimated_tokens,
  }
  const estimatedTokens = frontmatter.estimated_tokens ?? encode(raw).length
  return {
    frontmatter,
    raw,
    body: parsed.content,
    tagline: deriveTagline(parsed.content),
    filePath,
    estimatedTokens,
  }
}

const DOCS: ServiceDoc[] = Object.entries(RAW_MODULES)
  .map(([filePath, raw]) => buildDoc(filePath, raw))
  .sort((a, b) => a.frontmatter.tier - b.frontmatter.tier || a.frontmatter.name.localeCompare(b.frontmatter.name))

const BY_SLUG = new Map(DOCS.map((d) => [d.frontmatter.slug, d]))

export function getAllServices(): ServiceDoc[] {
  return DOCS
}

export function getServiceBySlug(slug: string): ServiceDoc | undefined {
  return BY_SLUG.get(slug)
}
```

- [ ] **Step 4: Run test (expect pass)**

Run: `pnpm vitest run src/lib/content-collection.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Run full vitest**

Run: `pnpm vitest run`
Expected: all green.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/content-collection.ts src/lib/content-collection.test.ts
git commit -m "feat(content): collect /services/*.md at build time with gpt-tokenizer"
```

---

## Task 8: Markdown rendering pipeline

**Files:**
- Create: `src/lib/markdown-pipeline.ts`

- [ ] **Step 1: Implement**

Create `src/lib/markdown-pipeline.ts`:

```ts
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import type { Options as ReactMarkdownOptions } from "react-markdown"

export const markdownPlugins: Pick<
  ReactMarkdownOptions,
  "remarkPlugins" | "rehypePlugins"
> = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: {
          className: ["heading-anchor"],
          "aria-label": "Link to this section",
        },
        content: { type: "text", value: "  #" },
      },
    ],
  ],
}
```

Note: `shiki` is installed but **plugin wiring is deferred** to a later optional step. Demo md uses one or two small TS snippets; default monospace `<pre><code>` is acceptable for V0 visual check. When real services land we'll add `rehype-pretty-code` or a shiki rehype transformer.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```powershell
git add src/lib/markdown-pipeline.ts
git commit -m "feat(content): wire react-markdown with gfm and heading anchors"
```

---

## Task 9: Site shell — Header and Footer (editorial)

**Files:**
- Create: `src/components/site/header.tsx`
- Create: `src/components/site/footer.tsx`

- [ ] **Step 1: Header**

Create `src/components/site/header.tsx`:

```tsx
import { Link } from "@tanstack/react-router"
import { Github } from "lucide-react"

const SITE_NAME = "ko/design.md"
const SITE_TAGLINE = "korean design — llm context"
const REPO_URL = "https://github.com/caesiumy/ko-design-md"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group inline-flex items-center gap-2.5">
          <span
            className="inline-block size-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:bg-[var(--accent-glow)] group-hover:shadow-[0_0_12px_var(--accent-glow)]"
            aria-hidden
          />
          <span className="text-display text-sm font-bold tracking-tight">
            {SITE_NAME}
          </span>
          <span className="text-meta-caps hidden sm:inline">— {SITE_TAGLINE}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            aria-label="GitHub repository"
          >
            <Github className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Footer**

Create `src/components/site/footer.tsx`:

```tsx
const REPO_URL = "https://github.com/caesiumy/ko-design-md"

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 py-12 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <p className="text-meta-caps">CATALOG</p>
          <p className="mt-3 leading-relaxed">
            한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs sm:items-end sm:text-right">
          <p className="text-meta-caps">License</p>
          <p>코드 MIT (잠정) · 콘텐츠 CC-BY 4.0 (잠정)</p>
          <p className="max-w-xs leading-relaxed">
            각 서비스명 · 로고는 해당 권리자 소유. 분석 목적 fair use에 한함.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            GitHub <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/site
git commit -m "feat(site): add editorial header and footer with meta caps"
```

---

## Task 10: Home features — Hero and ServiceCardGrid (editorial)

**Files:**
- Create: `src/features/home/components/hero.tsx`
- Create: `src/features/home/components/service-card-grid.tsx`

- [ ] **Step 1: Hero**

Create `src/features/home/components/hero.tsx`:

```tsx
export function HomeHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
      <p className="text-meta-caps animate-fade-in-up">
        CATALOG · KOREAN DESIGN — LLM CONTEXT
      </p>
      <h1
        className="text-display mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl animate-fade-in-up"
        style={{ animationDelay: "60ms" }}
      >
        한국 서비스의<br />
        시그니처 디자인을<br />
        <span className="text-muted-foreground">LLM 컨텍스트로,</span>{" "}
        <span className="font-light italic">사람이 읽기 즐겁게.</span>
      </h1>
      <p
        className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground animate-fade-in-up"
        style={{ animationDelay: "140ms" }}
      >
        각 카드 상세 페이지에서{" "}
        <strong className="text-foreground">한 번의 클릭으로 design.md 전체를 복사</strong>해
        Claude · Cursor · v0 같은 도구에 그대로 붙여넣으세요.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: ServiceCardGrid**

Create `src/features/home/components/service-card-grid.tsx`:

```tsx
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getCategoryStyle } from "@/lib/category-style"
import type { ServiceDoc } from "@/lib/content-types"

interface Props {
  services: ServiceDoc[]
}

function formatTokens(n: number): string {
  if (n >= 1000) return `~${(n / 1000).toFixed(1)}k`
  return `~${n}`
}

export function ServiceCardGrid({ services }: Props) {
  if (services.length === 0) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        아직 추가된 design.md가 없습니다. <code>services/</code>에 .md 파일을 추가해 보세요.
      </p>
    )
  }
  return (
    <section className="mx-auto max-w-6xl px-4 pb-32">
      <div className="mb-8 flex items-baseline justify-between border-b border-border/60 pb-4">
        <p className="text-meta-caps">
          CATALOG · {services.length} {services.length === 1 ? "ENTRY" : "ENTRIES"}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">tier · last updated</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((doc, i) => {
          const style = getCategoryStyle(doc.frontmatter.category)
          return (
            <Link
              key={doc.frontmatter.slug}
              to="/services/$slug"
              params={{ slug: doc.frontmatter.slug }}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Card className="overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-foreground/40 group-hover:shadow-[0_8px_24px_-12px_oklch(0_0_0/0.25)]">
                <div
                  className={cn(
                    "bg-grain relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br",
                    style.coverGradient,
                  )}
                  aria-hidden
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/30 to-transparent" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-meta-caps !tracking-[0.16em]"
                    >
                      {style.label}
                    </Badge>
                    {doc.frontmatter.tier === 1 && (
                      <span
                        className="text-meta-caps text-foreground"
                        aria-label="Tier 1 — Signature"
                      >
                        ★ TIER 1
                      </span>
                    )}
                  </div>
                  <h3 className="text-display text-xl font-bold tracking-tight">
                    {doc.frontmatter.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {doc.tagline}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                    <span
                      className="inline-block size-1.5 rounded-full bg-foreground/40"
                      aria-hidden
                    />
                    <span>{formatTokens(doc.estimatedTokens)} tokens</span>
                    {doc.frontmatter.last_updated && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{doc.frontmatter.last_updated}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/features/home
git commit -m "feat(home): add editorial hero and grain-textured card grid"
```

---

## Task 11: Service detail features (hero copy aside)

**Files:**
- Create: `src/features/service-detail/components/markdown-body.tsx`
- Create: `src/features/service-detail/components/service-meta.tsx`
- Create: `src/features/service-detail/components/token-badge.tsx`
- Create: `src/features/service-detail/components/copy-button.tsx`

- [ ] **Step 1: MarkdownBody**

Create `src/features/service-detail/components/markdown-body.tsx`:

```tsx
import ReactMarkdown from "react-markdown"
import { markdownPlugins } from "@/lib/markdown-pipeline"

interface Props {
  body: string
}

export function MarkdownBody({ body }: Props) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={markdownPlugins.remarkPlugins}
        rehypePlugins={markdownPlugins.rehypePlugins}
      >
        {body}
      </ReactMarkdown>
    </article>
  )
}
```

- [ ] **Step 2: ServiceMeta**

Create `src/features/service-detail/components/service-meta.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import { getCategoryStyle } from "@/lib/category-style"
import type { ServiceFrontmatter } from "@/lib/content-types"

interface Props {
  frontmatter: ServiceFrontmatter
}

export function ServiceMeta({ frontmatter }: Props) {
  const style = getCategoryStyle(frontmatter.category)
  return (
    <header className="border-b border-border/60 pb-8">
      <div className="flex flex-wrap items-center gap-3 text-meta-caps">
        <Badge variant="secondary" className="text-meta-caps !tracking-[0.16em]">
          {style.label}
        </Badge>
        {frontmatter.tier === 1 && <span>★ TIER 1 — SIGNATURE</span>}
        {frontmatter.last_updated && (
          <span className="tabular-nums">UPDATED · {frontmatter.last_updated}</span>
        )}
      </div>
      <h1 className="text-display mt-5 text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl">
        {frontmatter.name}
      </h1>
    </header>
  )
}
```

- [ ] **Step 3: TokenBadge**

Create `src/features/service-detail/components/token-badge.tsx`:

```tsx
interface Props {
  tokens: number
}

function formatTokens(n: number): string {
  if (n >= 1000) return `~${(n / 1000).toFixed(1)}k tokens`
  return `~${n} tokens`
}

export function TokenBadge({ tokens }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2">
        <span
          className="inline-block size-1.5 rounded-full bg-foreground/60"
          aria-hidden
        />
        <span className="font-medium text-foreground tabular-nums">
          {formatTokens(tokens)}
        </span>
      </span>
      <span className="text-meta-caps">CLAUDE · GPT-4</span>
    </div>
  )
}
```

- [ ] **Step 4: CopyButton (signature interaction)**

Create `src/features/service-detail/components/copy-button.tsx`:

```tsx
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  raw: string
  filename: string
}

export function CopyButton({ raw, filename }: Props) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      toast.success("design.md 복사됨", {
        description: `${filename} · LLM 채팅창에 그대로 붙여넣어 보세요.`,
      })
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      toast.error("복사 실패", {
        description: err instanceof Error ? err.message : "Clipboard API 미지원",
      })
    }
  }

  return (
    <Button
      onClick={onCopy}
      size="lg"
      className="group/copy w-full transition-all duration-200 hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent-glow)_30%,transparent)] active:scale-[0.98]"
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <Copy
          className={cn(
            "absolute size-4 transition-all duration-200",
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Check
          className={cn(
            "absolute size-4 transition-all duration-200",
            copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </span>
      <span>{copied ? "Copied" : "Copy design.md"}</span>
    </Button>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```powershell
git add src/features/service-detail
git commit -m "feat(detail): add markdown body, meta, token badge, signature copy button"
```

---

## Task 12: Routes wiring (root + index + $slug with hero aside)

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Create: `src/routes/services/$slug.tsx`

- [ ] **Step 1: Update `__root.tsx`**

Replace the entire contents of `src/routes/__root.tsx` with:

```tsx
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { Provider as JotaiProvider } from "jotai"
import { Toaster } from "@/components/ui/sonner"

import { SiteHeader } from "@/components/site/header"
import { SiteFooter } from "@/components/site/footer"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "한국형 design.md 카탈로그" },
      {
        name: "description",
        content: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "한국형 design.md 카탈로그" },
      {
        property: "og:description",
        content: "한국 서비스의 시그니처 디자인을 LLM 컨텍스트와 사람이 읽기 즐거운 분석으로.",
      },
      { property: "og:image", content: "/og-default.svg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-24">
      <p className="text-meta-caps">404 — NOT FOUND</p>
      <h1 className="text-display mt-3 text-5xl font-black tracking-tighter">
        Page not found.
      </h1>
      <p className="mt-4 text-muted-foreground">요청하신 페이지를 찾을 수 없습니다.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <JotaiProvider>
          <SiteHeader />
          <main className="min-h-[calc(100svh-3.5rem)]">
            {children ?? <Outlet />}
          </main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </JotaiProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update `index.tsx`**

Replace the entire contents of `src/routes/index.tsx` with:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { HomeHero } from "@/features/home/components/hero"
import { ServiceCardGrid } from "@/features/home/components/service-card-grid"
import { getAllServices } from "@/lib/content-collection"

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: () => ({ services: getAllServices() }),
})

function HomePage() {
  const { services } = Route.useLoaderData()
  return (
    <>
      <HomeHero />
      <ServiceCardGrid services={services} />
    </>
  )
}
```

- [ ] **Step 3: Ensure folder + create `services/$slug.tsx`**

Run: `New-Item -ItemType Directory -Force src/routes/services | Out-Null`

Create `src/routes/services/$slug.tsx`:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router"
import { CopyButton } from "@/features/service-detail/components/copy-button"
import { MarkdownBody } from "@/features/service-detail/components/markdown-body"
import { ServiceMeta } from "@/features/service-detail/components/service-meta"
import { TokenBadge } from "@/features/service-detail/components/token-badge"
import { getServiceBySlug } from "@/lib/content-collection"

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const doc = getServiceBySlug(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { doc } = loaderData
    return {
      meta: [
        { title: `${doc.frontmatter.name} — design.md` },
        { name: "description", content: doc.tagline },
        { property: "og:title", content: `${doc.frontmatter.name} — design.md` },
        { property: "og:description", content: doc.tagline },
        { property: "og:type", content: "article" },
      ],
    }
  },
  component: ServiceDetailPage,
})

function ServiceDetailPage() {
  const { doc } = Route.useLoaderData()
  const filename = `${doc.frontmatter.slug}.md`
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-12 md:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <ServiceMeta frontmatter={doc.frontmatter} />
        <div className="mt-10">
          <MarkdownBody body={doc.body} />
        </div>
      </div>
      <aside className="md:sticky md:top-20 md:self-start">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-foreground/[0.04] via-transparent to-foreground/[0.06]"
            aria-hidden
          />
          <div className="flex flex-col gap-4">
            <p className="text-meta-caps">PRIMARY ACTION</p>
            <CopyButton raw={doc.raw} filename={filename} />
            <div className="border-t border-border/60 pt-4">
              <TokenBadge tokens={doc.estimatedTokens} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              전체 design.md를 복사해 LLM 채팅창에 붙여넣은 뒤,{" "}
              <span className="text-foreground">"이 컨텍스트를 따라 화면을 만들어줘"</span>처럼 이어서 쓰세요.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
```

- [ ] **Step 4: Regenerate routeTree (TanStack plugin auto-runs)**

Run: `pnpm dev`
Expected: vite starts; plugin updates `src/routeTree.gen.ts` to include `/services/$slug`. Stop dev once compiled.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```powershell
git add src/routes src/routeTree.gen.ts
git commit -m "feat(routes): wire root shell, home, and detail with hero copy aside"
```

(If your commit message contains a literal `$` for `$slug`, escape it with a backtick in PowerShell: `` `$slug ``.)

---

## Task 13: SEO placeholder OG image

**Files:**
- Create: `public/og-default.svg`

- [ ] **Step 1: Write SVG**

Create `public/og-default.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#161513"/>
      <stop offset="100%" stop-color="#23201c"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" filter="url(#grain)"/>
  <g fill="none" stroke="#3a3530" stroke-width="1">
    <line x1="80" y1="120" x2="1120" y2="120"/>
    <line x1="80" y1="510" x2="1120" y2="510"/>
  </g>
  <text x="80" y="100" fill="#a39884" font-family="Pretendard, system-ui, sans-serif" font-size="22" font-weight="500" letter-spacing="3">
    CATALOG · KOREAN DESIGN — LLM CONTEXT
  </text>
  <text x="80" y="340" fill="#f8f4ec" font-family="Pretendard, system-ui, sans-serif" font-size="92" font-weight="900" letter-spacing="-3">
    ko/design.md
  </text>
  <text x="80" y="430" fill="#bdb1a0" font-family="Pretendard, system-ui, sans-serif" font-size="28" font-weight="500">
    한국 서비스의 시그니처 디자인을 LLM 컨텍스트로
  </text>
  <text x="80" y="555" fill="#a39884" font-family="Pretendard, system-ui, sans-serif" font-size="20" font-weight="500" letter-spacing="2">
    KOREAN EDITORIAL · SLEEK · COPY-FIRST
  </text>
</svg>
```

- [ ] **Step 2: Commit**

```powershell
git add public/og-default.svg
git commit -m "feat(seo): add placeholder og:image with editorial typography"
```

---

## Task 14: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: 0 errors. If shadcn-generated files trigger lint warnings, fix only the lines we wrote — leave shadcn output as-is unless the rule is critical.

- [ ] **Step 3: Test**

Run: `pnpm vitest run`
Expected: all green (category-style + content-collection tests).

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build succeeds; `dist/` (or nitro output) populated.

- [ ] **Step 5: Dev smoke test (browser, frontend-design verification)**

Run `pnpm dev` in a separate terminal. Open http://localhost:3000.

Verify in the browser:
- (a) **Hero**: large display headline with mixed weight (black + light italic), small `CATALOG · KOREAN DESIGN — LLM CONTEXT` caps above, staggered fade-in entrance
- (b) **Card grid**: 2 demo cards (Demo Pay finance with blue/indigo/cyan gradient cover, Demo Courier delivery with orange/rose/amber). Cover has visible **grain noise overlay**. `★ TIER 1` caps on Demo Pay. tabular-nums tokens · date row at bottom of each card
- (c) **Card hover**: cover lifts subtly (translate-y -0.5), border darkens, shadow appears
- (d) **Click "Demo Pay"** → URL `/services/demo-pay`. Display heading uses font-black + tracking-tighter. Markdown body renders with section anchors `#` next to h2/h3 (visible on hover)
- (e) **Right aside**: rounded-2xl card with subtle gradient veil + backdrop-blur, "PRIMARY ACTION" caps label, Copy button, dot + token count + `CLAUDE · GPT-4` caps, helper text below
- (f) **Click Copy** → Copy icon swaps to Check via cross-fade. Toast appears top-right ("design.md 복사됨"). Verify clipboard contains full md including frontmatter (paste into a scratch buffer)
- (g) **Hover header logo dot** → dot becomes copper-glowing
- (h) Toggle OS dark mode → background becomes warm charcoal, text becomes warm cream. No cool slate tones.
- (i) GitHub link in header opens repo URL in new tab

Stop dev server.

- [ ] **Step 6: Easy-Add smoke test**

Create `services/_demo-temp.md`:

```markdown
---
name: Demo Temp
slug: demo-temp
category: etc
tier: 3
last_updated: 2026-05-07
sources: []
related_services: []
lang: ko
---

# Demo Temp

Easy-Add smoke test scaffold.

## 디자인 철학

Temporary fixture verifying that drop-in `.md` files automatically register as cards and routes without code changes.
```

Restart `pnpm dev`. Verify the new card appears on the home grid (3rd card with zinc gradient cover) and `/services/demo-temp` resolves. Then delete the file and confirm the card disappears.

- [ ] **Step 7: Commit any incidental files**

Run:
```powershell
git status --short
```
If `routeTree.gen.ts` or other auto-generated files are modified, commit them:
```powershell
git add src/routeTree.gen.ts
git commit -m "chore: regen route tree after detail route wiring"
```
If status is empty, skip.

- [ ] **Step 8: Update memory if any decisions surfaced**

If new project facts emerged (real GitHub repo URL substituted, sitename decided, additional category color tweaks), update auto-memory entries.

---

## Completion Criteria

All of the following must hold:

1. `pnpm typecheck` exits 0.
2. `pnpm lint` exits 0.
3. `pnpm vitest run` all green.
4. `pnpm build` succeeds.
5. Manual browser checks (Task 14, Step 5) all pass — including grain texture, font weight contrast, hero aside, glow on Copy hover, warm dark mode.
6. Easy-Add smoke test (Task 14, Step 6) confirms drop-in behavior.

When all six pass, the V0 minimal core scaffold is ready for the next phase (KO/EN routing, category filter, sitemap — separate plans).
