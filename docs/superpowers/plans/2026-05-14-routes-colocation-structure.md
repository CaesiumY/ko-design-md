# Routes Colocation Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move route-only UI and hooks out of `src/features` into TanStack Router ignored route-colocated folders.

**Architecture:** Keep `src/routes` as the screen/domain boundary for route-only code. Use TanStack Router's `-` prefix convention so colocated implementation folders are not added to `routeTree.gen.ts`. Keep shared primitives in `src/components`, pure content logic in `src/lib`, and reserve `src/features` for future cross-route user features only.

**Tech Stack:** TanStack Start, TanStack Router file-based routing, React 19, TypeScript, Vite, ESLint, Vitest.

---

## File Structure

Create:

- `src/routes/-home/components/category-sidebar.tsx`
- `src/routes/-home/components/design-search.tsx`
- `src/routes/-home/components/hero.tsx`
- `src/routes/-home/components/service-list-row.tsx`
- `src/routes/-home/components/service-logo.tsx`
- `src/routes/-home/hooks/use-filtered-services.ts`
- `src/routes/services/-components/copy-button.tsx`
- `src/routes/services/-components/detail-tabs.tsx`
- `src/routes/services/-components/inline-copy-button.tsx`
- `src/routes/services/-components/preview-frame.tsx`
- `src/routes/services/-components/preview-theme-toggle.tsx`
- `src/routes/services/-components/raw-design-md.tsx`
- `src/routes/services/-components/service-meta.tsx`
- `src/routes/services/-components/token-badge.tsx`

Modify:

- `src/routes/index.tsx`
- `src/routes/services/$slug.tsx`

Remove after moves:

- `src/features/home/components/category-sidebar.tsx`
- `src/features/home/components/design-search.tsx`
- `src/features/home/components/hero.tsx`
- `src/features/home/components/service-list-row.tsx`
- `src/features/home/components/service-logo.tsx`
- `src/features/home/hooks/use-filtered-services.ts`
- `src/features/service-detail/components/copy-button.tsx`
- `src/features/service-detail/components/detail-tabs.tsx`
- `src/features/service-detail/components/inline-copy-button.tsx`
- `src/features/service-detail/components/preview-frame.tsx`
- `src/features/service-detail/components/preview-theme-toggle.tsx`
- `src/features/service-detail/components/raw-design-md.tsx`
- `src/features/service-detail/components/service-meta.tsx`
- `src/features/service-detail/components/token-badge.tsx`
- `src/features` if empty

Do not modify:

- `src/lib/**`
- `src/components/ui/**`
- `src/components/site/**`
- `src/og/**`
- `vite.config.ts`
- `tsconfig.json`
- `src/routeTree.gen.ts` unless the TanStack generator rewrites it with equivalent route entries

Known unrelated worktree changes at plan time:

- `README.md`
- `.agents/`
- `.codex/`
- `public/logos/seed-design.webp`
- `public/preview/seed-design/`
- `services/seed-design.md`

Do not stage or commit those unrelated paths during this refactor.

---

### Task 1: Create Implementation Branch and Confirm Baseline

**Files:**

- Modify: none
- Test: current route and feature tree scan

- [ ] **Step 1: Confirm current branch and dirty state**

Run:

```bash
git status --short --branch
```

Expected:

```txt
## main...origin/main [ahead 2]
 M README.md
?? .agents/
?? .codex/
?? public/logos/seed-design.webp
?? public/preview/seed-design/
?? services/seed-design.md
```

If the branch has already been switched for implementation, continue on that branch. Keep unrelated dirty paths unstaged.

- [ ] **Step 2: Create a refactor branch before code changes**

Run:

```bash
git switch -c refactor/routes-colocation-20260514
```

Expected:

```txt
Switched to a new branch 'refactor/routes-colocation-20260514'
```

- [ ] **Step 3: Capture the baseline source tree**

Run:

```bash
find src/routes src/features -maxdepth 4 -type f | sort
```

Expected key entries:

```txt
src/features/home/components/category-sidebar.tsx
src/features/home/components/design-search.tsx
src/features/home/components/hero.tsx
src/features/home/components/service-list-row.tsx
src/features/home/components/service-logo.tsx
src/features/home/hooks/use-filtered-services.ts
src/features/service-detail/components/copy-button.tsx
src/features/service-detail/components/detail-tabs.tsx
src/features/service-detail/components/inline-copy-button.tsx
src/features/service-detail/components/preview-frame.tsx
src/features/service-detail/components/preview-theme-toggle.tsx
src/features/service-detail/components/raw-design-md.tsx
src/features/service-detail/components/service-meta.tsx
src/features/service-detail/components/token-badge.tsx
src/routes/__root.tsx
src/routes/index.tsx
src/routes/services/$slug.tsx
```

---

### Task 2: Colocate Home Route Files

**Files:**

- Create: `src/routes/-home/components/*.tsx`
- Create: `src/routes/-home/hooks/use-filtered-services.ts`
- Modify: `src/routes/index.tsx`
- Remove: `src/features/home/**`
- Test: `npm run typecheck`

- [ ] **Step 1: Create home route-private folders**

Run:

```bash
mkdir -p src/routes/-home/components src/routes/-home/hooks
```

Expected: command exits with code 0.

- [ ] **Step 2: Move home components with git history**

Run:

```bash
git mv src/features/home/components/category-sidebar.tsx src/features/home/components/design-search.tsx src/features/home/components/hero.tsx src/features/home/components/service-list-row.tsx src/features/home/components/service-logo.tsx src/routes/-home/components/
```

Expected: command exits with code 0.

- [ ] **Step 3: Move home hook with git history**

Run:

```bash
git mv src/features/home/hooks/use-filtered-services.ts src/routes/-home/hooks/
```

Expected: command exits with code 0.

- [ ] **Step 4: Replace the import block in `src/routes/index.tsx`**

Set the top imports to this exact block:

```tsx
import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import type { Category } from "@/lib/content-types"
import { HomeHero } from "./-home/components/hero"
import { CategorySidebar } from "./-home/components/category-sidebar"
import { DesignSearch } from "./-home/components/design-search"
import { ServiceListRow } from "./-home/components/service-list-row"
import { useFilteredServices } from "./-home/hooks/use-filtered-services"
import { getAllServices } from "@/lib/content-collection"
import { CATEGORIES } from "@/lib/content-types"
```

Keep the rest of `src/routes/index.tsx` unchanged.

- [ ] **Step 5: Verify home feature imports are gone**

Run:

```bash
rg -n "@/features/home|src/features/home" src
```

Expected: no output and exit code 1.

- [ ] **Step 6: Verify TypeScript after the home move**

Run:

```bash
npm run typecheck
```

Expected: command exits with code 0.

---

### Task 3: Colocate Service Detail Route Files

**Files:**

- Create: `src/routes/services/-components/*.tsx`
- Modify: `src/routes/services/$slug.tsx`
- Remove: `src/features/service-detail/**`
- Test: `npm run typecheck`

- [ ] **Step 1: Create service detail route-private folder**

Run:

```bash
mkdir -p src/routes/services/-components
```

Expected: command exits with code 0.

- [ ] **Step 2: Move service detail components with git history**

Run:

```bash
git mv src/features/service-detail/components/copy-button.tsx src/features/service-detail/components/detail-tabs.tsx src/features/service-detail/components/inline-copy-button.tsx src/features/service-detail/components/preview-frame.tsx src/features/service-detail/components/preview-theme-toggle.tsx src/features/service-detail/components/raw-design-md.tsx src/features/service-detail/components/service-meta.tsx src/features/service-detail/components/token-badge.tsx src/routes/services/-components/
```

Expected: command exits with code 0.

- [ ] **Step 3: Replace the import block in `src/routes/services/$slug.tsx`**

Set the top imports to this exact block:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import type { PreviewTheme } from "./-components/preview-theme-toggle"
import { CopyButton } from "./-components/copy-button"
import {
  DetailTabs,
  DetailTabsList,
  DetailTabsPanel,
  DetailTabsTab,
} from "./-components/detail-tabs"
import { InlineCopyButton } from "./-components/inline-copy-button"
import {
  PreviewFrame,
  PreviewUnavailable,
} from "./-components/preview-frame"
import { PreviewThemeToggle } from "./-components/preview-theme-toggle"
import { RawDesignMd } from "./-components/raw-design-md"
import { ServiceMeta } from "./-components/service-meta"
import { TokenBadge } from "./-components/token-badge"
import {
  getServiceBySlug,
  hasPreview,
  truncateForMeta,
} from "@/lib/content-collection"
import { highlightRawMarkdown } from "@/lib/shiki"
import { absoluteUrl } from "@/lib/site-config"
```

Keep the rest of `src/routes/services/$slug.tsx` unchanged.

- [ ] **Step 4: Verify service detail feature imports are gone**

Run:

```bash
rg -n "@/features/service-detail|src/features/service-detail" src
```

Expected: no output and exit code 1.

- [ ] **Step 5: Verify TypeScript after the service detail move**

Run:

```bash
npm run typecheck
```

Expected: command exits with code 0.

---

### Task 4: Remove Empty `features` Folders and Check Route Tree Safety

**Files:**

- Remove: empty `src/features/**` directories
- Test: import scan and route tree scan

- [ ] **Step 1: Remove empty feature directories**

Run:

```bash
rmdir src/features/home/components src/features/home/hooks src/features/home src/features/service-detail/components src/features/service-detail src/features
```

Expected: command exits with code 0. If this fails, run `find src/features -maxdepth 4 -type f | sort` and stop; a file remains in `src/features` that must be classified before deletion.

- [ ] **Step 2: Confirm `src/features` no longer exists**

Run:

```bash
test ! -e src/features && printf 'src/features removed\n'
```

Expected:

```txt
src/features removed
```

- [ ] **Step 3: Confirm no source import references `features`**

Run:

```bash
rg -n "@/features|src/features" src
```

Expected: no output and exit code 1.

- [ ] **Step 4: Confirm ignored route folders are not in the generated route tree**

Run:

```bash
rg -n -- "-home|-components|features" src/routeTree.gen.ts
```

Expected: no output and exit code 1.

- [ ] **Step 5: Confirm the public route entries are still present**

Run:

```bash
rg -n "'/'|'/services/\\$slug'" src/routeTree.gen.ts
```

Expected output includes route type entries for:

```txt
'/'
'/services/$slug'
```

---

### Task 5: Full Verification and Commit

**Files:**

- Verify: all moved files and route imports
- Commit: route colocation refactor only

- [ ] **Step 1: Check whitespace and patch safety**

Run:

```bash
git diff --check
```

Expected: command exits with code 0.

- [ ] **Step 2: Run TypeScript**

Run:

```bash
npm run typecheck
```

Expected: command exits with code 0.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: command exits with code 0.

- [ ] **Step 4: Run tests**

Run:

```bash
npm run test
```

Expected: command exits with code 0.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: command exits with code 0.

- [ ] **Step 6: Review changed paths before staging**

Run:

```bash
git status --short
```

Expected refactor paths include moved files under:

```txt
src/routes/-home/
src/routes/services/-components/
src/routes/index.tsx
src/routes/services/$slug.tsx
src/features/
```

Unrelated paths such as `README.md`, `.agents/`, `.codex/`, `public/logos/seed-design.webp`, `public/preview/seed-design/`, and `services/seed-design.md` may still appear. Do not stage them.

- [ ] **Step 7: Stage only the refactor paths**

Run:

```bash
git add src/routes/-home src/routes/services/-components src/routes/index.tsx 'src/routes/services/$slug.tsx'
git add -u src/features
```

Expected: command exits with code 0.

- [ ] **Step 8: Confirm staged diff contains only the refactor**

Run:

```bash
git diff --cached --stat
```

Expected: staged paths are limited to route colocation moves, `src/routes/index.tsx`, and `src/routes/services/$slug.tsx`.

- [ ] **Step 9: Commit the refactor**

Run:

```bash
git commit -m "refactor(routes): colocate route-only feature files" -m "TanStack Router의 - prefix ignore 규칙에 맞춰 홈과 서비스 상세 라우트 전용 컴포넌트, 훅을 routes 하위로 이동합니다." -m "현재 features 폴더에 남길 cross-route 기능이 없어 빈 features 구조를 제거하고, 공유 코드는 components/ui, components/site, lib에 남겨둡니다." -m "검증" -m "- npm run typecheck" -m "- npm run lint" -m "- npm run test" -m "- npm run build" -m "- git diff --check"
```

Expected: commit succeeds on `refactor/routes-colocation-20260514`.

- [ ] **Step 10: Do not push to `main` or `dev`**

Run:

```bash
git branch --show-current
```

Expected:

```txt
refactor/routes-colocation-20260514
```

No push should be performed until the user explicitly approves the target branch and PR flow.
