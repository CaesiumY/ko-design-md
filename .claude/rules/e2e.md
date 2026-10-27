---
paths:
  - "e2e/**"
  - "playwright.config.ts"
  - "scripts/e2e-server.ts"
---

# E2E 스모크 (`pnpm test:e2e`)

홈 검색·카테고리, 상세 탭과 `?tab=`, 프리뷰 테마 토글을 Playwright 로 실제 브라우저에서 돈다.
Chromium 이 필요해 CI 에서는 **별도 `e2e` 잡**이다. 로컬은 `pnpm exec playwright install chromium` 이 선행이다.
- **dev 서버가 아니라 빌드된 서버(포트 4174)를 상대한다** — dev 는 일부 라우트가 다르게 답한다
  (`catalog.md` 의 `.md` 404 항). `scripts/e2e-server.ts` 가 `.output/` 이 빌드 입력보다 낡았으면 `pnpm build` 부터 한다.
  포트에 떠 있는 서버는 재사용하지 않는다 — 재사용하면 낡음 검사를 건너뛴다. 4174 가 차 있으면 그 서버를
  끈다(4173 은 `test:http` 와 미리보기 몫이다).
- **기대값은 `services/*.md` 에서 계산한다**(`e2e/support/catalog.ts`) — 항목 수·순서를 테스트에 적지 않아
  새 항목이 E2E 를 깨지 않는다. 고정 기준점은 `toss` 하나다. 사이트의 필터 코드를 가져다 기대값을 만들지
  말 것 — 함께 틀려 늘 통과한다. 항목 읽기(`buildDoc`)와 카테고리 라벨은 사이트 것을 쓰므로 그 둘의 회귀는
  단위 테스트 몫이다.
- `e2e/` 는 vitest 에서 제외돼 있다 — `*.spec.ts` 가 vitest 기본 수집 패턴에 걸리기 때문이다.
- 구조는 e2e-flow 스킬 관례다(저장소 밖 도구 — 없어도 구조만 따르면 된다). `e2e/tests/{도메인}/specs`·
  `flows`·`e2e/helpers`. 스킬 템플릿 9종 중 안 쓰는 것도 스킬이 그 9개 이름으로 셋업 완료를 판정하므로
  남겨 둔다. `@smoke` 표시는 이 저장소가 범위를 나누지 않아 효과가 없다.
- `@playwright/test` 와 `playwright` 는 같은 버전이어야 한다(다르면 Chromium 이 두 벌 깔린다).
