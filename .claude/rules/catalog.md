---
paths:
  - "services/**"
  - "src/lib/draft-validator*"
  - "src/lib/frontmatter*"
  - "src/lib/site-frontmatter*"
  - "src/lib/token-*"
  - "src/lib/oklch-drift*"
  - "src/lib/logo-takedowns.ts"
  - "src/lib/spec-limitations.ts"
  - "src/lib/google-designmd-corpus.test.ts"
  - "src/lib/role-reference-rows.test.ts"
  - "src/lib/license-notice-consistency.test.ts"
  - "scripts/validate-draft.ts"
  - "scripts/validate-spec.ts"
  - "scripts/spec-report.ts"
  - "scripts/validate-sources.ts"
  - "scripts/build-tokens.ts"
  - "public/logos/**"
  - "NOTICE"
  - ".github/dependabot.yml"
  - ".claude/skills/design-md/**"
  - ".claude/agents/design-md-*.md"
  - ".claude/agents/research-collector.md"
  - ".claude/cache/design-md/**"
---

# 카탈로그 항목 규칙

토큰 위치(frontmatter 맵 · 본문 yaml 펜스 금지)와 값 모양(색은 `oklch(…)` 또는 `"{colors.x}"` 참조, hex 는
트레일링 주석이나 같은 줄 `(≈ oklch(…))` 병기로만)은 검증기가 막고, 막을 때 옮길 곳과 고쳐 쓰는 법을 말한다. 아래는 검증기가 말하지 않거나
판정할 수 없는 것이다. 예외 하나: 참조는 ASCII 키만 가리킬 수 있어 한글 키를 가리키는 `"{colors.빨강}"` 은
막히는데, 메시지는 원인을 말하지 않는다 — 키를 ASCII 로 짓거나 값을 `oklch(…)` 로 직접 쓴다.

## 카탈로그 정책

- **frontmatter 는 한 모듈이 진짜 YAML 로 한 번 읽는다**(`src/lib/frontmatter.ts` 의 `readFrontmatter`,
  ADR 0011). **"사이트와 YAML 이 다르게 읽는 경우"를 막는 규칙은 다시 만들지 않는다** — 그런 경우가 보이면
  이 모듈을 거치지 않는 독자를 고친다. 그 대신 YAML 이 읽는 대로 읽으므로, 따옴표로 시작하는 값은 YAML 문법을
  따라야 한다 — 폰트 스택 `"Pretendard", sans-serif` 는 값 전체를 다른 따옴표로 한 번 더 감싸야
  (`'"Pretendard", sans-serif'`) 읽히고, 참조는 `"{colors.x}"` 처럼 따옴표가 있어야 참조로 읽힌다. 감싸지 않은
  폰트 스택 하나가 frontmatter 전체를 못 읽게 만드는데, 검증기는 파서 오류만 알리고 고치는 법은 말하지 않는다.
- **인용은 존재가 아니라 내용 일치.** `[src:N]`이 가리키는 소스가 실제로 그 주장을
  담고 있어야 한다 (리뷰어의 의미적 스팟체크 대상).
- **`logo`는 필수다.** 고르는 순서(심볼 → 앱 아이콘 예외 → 확인받은 워드마크 → 멈춤)의 정본은 design-md
  `SKILL.md` 의 **Logo candidates** 단락이다. 값은 `https://getdesign.kr/logos/*.{svg,png,webp,avif}` 절대
  URL(파일이 사이트 밖으로 복사돼도 유효해야 함)이고, 프리뷰 HTML 안에서는 반대로 site-relative `/logos/...` 다.
  로고 없이 남는 항목은 권리자 요청으로 로고만 뺀 경우뿐이다 — 그 슬러그는 요청 참조와 함께
  `src/lib/logo-takedowns.ts` 의 `LOGO_TAKEDOWNS` 에 적고(docs/TAKEDOWN.md), 스킬로 갱신하지 않고 손으로
  재감사한다. 로고 복원은 관리자 몫이다.
- **테마별 팔레트는 이름을 갈라 쓴다** (`bg-canvas` / `dark-bg-canvas`). 한 이름을 두 값으로
  선언하면 어느 쪽이 정본인지 알 수 없어 프리뷰 대조가 그 토큰에서 꺼진다. 관례는 `dark-` 접두다.
- **Dimension 값은 0이어도 단위를 붙인다** — `tracking: 0` 이 아니라 `0em`. 검증기는 `components:` 값에서만 이것을
  막으므로, 다른 맵에서는 이 규칙이 유일한 안내다.
- **본문 `{map.name}` 참조 검사가 읽는 모양과 일부러 읽지 않는 모양의 목록은 `src/lib/draft-validator.ts` 의
  `checkTokenReferences` 주석이 정본이다** — 리뷰가 새 모양을 들고 오면 규칙을 늘리기 전에 그 목록과 대조할 것.
- **새 항목은 슬러그별 표에 자기 줄을 적는다. 아래가 그 전부이고, 다른 곳엔 통합 목록이
  없다.** 셋은 늘 필요하고 여섯은 조건부다(그중 `PREVIEW_TOKEN_ALIASES` 와 `COMPONENT_COUNTS` 는 새 항목 거의
  전부에 해당한다).

  | 등록처 | 위치 | 언제 |
  | --- | --- | --- |
  | `PREVIEW_TOKEN_ALIASES` | `src/lib/oklch-drift.ts` | 프리뷰가 커스텀 프로퍼티를 네임스페이스하면(거의 전부) |
  | `MATCH_FLOOR` | `oklch-drift-corpus.test.ts` | 항상 (하한) |
  | `TOKEN_COVERAGE` | `token-coverage.test.ts` | 항상 (양방향 정확값) |
  | `BASELINE_TABLE` | `contrast-baseline.ts` | 항상 (슬러그마다 **4행**) |
  | `NOTICE` 자산 인벤토리 | `NOTICE` | `public/logos/` 에 새 파일을 놓을 때 (로고 필수라 사실상 늘 — 기존 파일을 재사용할 때만 빠진다) |
  | missing-primary 배열 | `google-designmd-corpus.test.ts` | `primary` 라는 이름의 토큰이 **없을 때** |
  | `KNOWN_SPEC_LIMITATIONS` | `src/lib/spec-limitations.ts` | `%` radius 를 쓸 때 |
  | `COMPONENT_COUNTS` | `google-designmd-corpus.test.ts` | frontmatter `components:` 를 쓸 때 (정확값 — 새 항목은 사실상 늘) |
  | 역할 표 대조 함수 (`CASES`) | `role-reference-rows.test.ts` | 본문 역할 표를 frontmatter 참조 행으로도 실을 때 (양방향 · 누락은 가드가 막는다) |

  **`PREVIEW_TOKEN_ALIASES` 를 빠뜨리면 조용히 0건 비교가 된다** — 드리프트 게이트가 이름을
  못 맞춰 그 항목에 대해 아무것도 검사하지 않는다. `BASELINE_TABLE` 의 수치는 `pnpm gate:contrast` 의 실패 출력이 만들어 주며 같은 바이트가
  `docs/preview-contrast-baseline.md` 에도 있어야 한다.

  전부 총계가 아니라 슬러그 단위라 동시에 열린 카탈로그 PR 끼리 서로를 깨지 않는다.
  **다만 표 자체가 새로 생기는 경우는 막아 주지 않는다** — 루트 `CLAUDE.md` 「기여 관례」의 합본 재검증 항을 볼 것.

## Google DESIGN.md 표준 (`pnpm validate:spec`)

Google Labs 의 DESIGN.md 명세를 **공식 린터로** 판정한다. 명세를 확인할 일이 생기면
`packages/cli/src/linter/spec-config.yaml` 하나가 단일 진실 원천이고, 산문 요약본들은 서로 어긋나므로 믿지 말
것. 린터를 올리는 PR 에서 테스트가 초록으로 넘기는 변화와 확인법은 `.github/dependabot.yml` 주석에 있다.

- **항목의 DESIGN.md 가 변환 없이 그대로 표준 문서다**(ADR 0003·0008). 표준 도구용 판을 따로 만들던 어댑터는
  걷었다 — 되살리지 말 것: 어댑터는 항목 파일이 표준에서 멀어진 것을 가려, 파일을 직접 가져간 소비자만
  어긋난 문서를 받게 한다.
- **dev 서버에서는 `/services/{slug}/DESIGN.md` 라우트가 404 다.** Vite 미들웨어가 `.md` 요청을 라우터보다
  먼저 가로챈다. nitro 에는 없어 프로덕션은 200 이다 — dev 결과로 "라우트가 깨졌다"고 판단하지 말 것.
- **`spacing:`·`rounded:` 는 필수 맵이 아니다**(`colors:`·`typography:` 는 필수). 브랜드가 발행하지 않았으면
  비워 두고, 린터의 info 를 지우려고 값을 지어내지 말 것.
- **`%` 단위 radius(`50%`)와 다중 스톱 그라디언트는 명세보다 표현력이 높은 자리라 값을 고치지 않는다.**
  그라디언트는 카탈로그 전용 `gradients:` 맵에 둔다(`colors:` 에 두면 단색으로 읽혀 에러가 나고 스와치가 빈
  칸이 된다). `%` radius 는 `rounded:` 에 그대로 두고 `KNOWN_SPEC_LIMITATIONS` 에 개수를 적는다 — 명세
  단위로 옮기면 뜻이 바뀐다(`50%` 는 직사각형에서 타원, `9999px` 는 알약). 코퍼스 테스트가 그 개수를
  **양방향 래칫**으로 고정한다(새 에러도, 조용한 수정도 실패시킨다).
- **`primary` 라는 이름의 토큰을 지어내지 말 것.** 어느 브랜드 색이 primary 인지는 의미 판단이라, 코퍼스
  테스트가 해당 슬러그 목록을 고정해 둔다. 붙일 때의 형식(브랜드 대표색 별칭):
  - **참조 행 한 줄** `primary: "{colors.x}"` 를 대상 토큰 바로 앞에 둔다. 가리킬 대상은 브랜드가 대표색으로
    **발행한** 값이지 시맨틱 fill 역할이 아니다(toss 는 `fill-brand` 가 아니라 `blue-500`).
  - **근거는 커밋/PR 본문에** 둔다(인용 번호 + 상류 재확인). 감사 메모 자리가 아니다. 토큰 줄 주석은 같은
    이름의 다른 뜻 토큰(`text-primary` 등)과 가르는 단서가 필요할 때만 쓴다.
  - 참조 행은 사이드카에 실리지 않아 **사이트 Tokens 탭과 `use-design-md` 는 이 별칭을 못 본다**.
  - `last_updated` 는 올리지 않고 `Skip-Last-Updated` 트레일러를 단다(`audit-notes.md` 의 날짜 항).
- **새 항목은 컴포넌트를 명세의 `components:` 맵에도 싣는다**(기존 항목은 소급하지 않는다). 저작 규칙의
  정본은 `stitch-format.md` 의 "Component tokens in the frontmatter `components:` map" 이다. 본문 스펙 펜스
  (`text`)도 그대로 남는다 — 두 벌의 어긋남은 리뷰 루브릭이 본다.
- **브랜드가 발행한 역할→팔레트 계층은 frontmatter 참조 행으로 싣는다.** 형식은
  `bg-brand-solid: "{colors.carrot-600}"` 이고, 다크 짝은 `dark-` 접두로 다크 팔레트를 가리킨다(테마를 타지
  않는 팔레트 — seed-design `static-*` — 는 다크 짝도 접두 없는 키를 가리킨다).
  - **상류가 역할을 단일 팔레트 토큰으로 가리킬 때만 싣는다.** 불투명도 램프를 거치는 역할은 값이
    같아도 싣지 않는다(codeit `txt-primary` 는 `gray-100` 이 아니라 `gray-100-opacity-100` 을 가리킨다).
    이런 역할과, 상류가 표와 어긋나는 짝은 본문 표에만 둔다.
  - **명세 `color_roles`(`primary` · `secondary` · `tertiary` · `neutral`)와 같은 이름으로 표의 역할을 싣지 않는다**
    — greeting 의 `primary`~`tertiary` 는 텍스트색인데, 그 이름으로 발행하면 도구가 브랜드 역할로 읽는다.
    `primary` 만은 위의 브랜드 대표색 별칭으로 둘 수 있고, 브랜드가 그 이름으로 발행한 색(remember 의
    `secondary`)도 해당하지 않는다.
  - **본문 표와 참조 행은 같은 대응의 두 벌이다.** 한쪽을 고치면 다른 쪽도 고친다. 기계로 대조하는 것은
    `role-reference-rows.test.ts` 의 `CASES` 에 등록된 항목뿐이고, 등록을 빠뜨린 항목을 찾는 가드는 `## Colors`
    표 **첫 열의 백틱 스팬**만 본다 — 역할을 백틱 없이 쓰거나 첫 열 밖에 두면 대조가 조용히 빠진다.
  - 이 형식 이전부터 있던 참조 행(toss · vapor-ui · likelion · teamsparta · baemin)은 이 규칙의 대상이 아니다.
    이 형식에 맞추려고 고치지 말 것.
