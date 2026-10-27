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

## 카탈로그 정책 (위반은 CI가 block)

- **토큰은 frontmatter 에 산다.** `colors:` · `typography:` · `spacing:` · `rounded:` 맵이 Google DESIGN.md
  형태다. 그룹은 `  ## 라벨` 주석 행이 열고(사이드카 `group`), 토큰별 단서는 그 줄의 트레일링 `#` 주석이
  나른다(사이드카 `note` — 기계 소비자에게 닿는 유일한 경로).
- **본문에는 yaml 펜스가 하나도 없다.** 항목 파일이 그대로 표준 DESIGN.md 로 발행되고, 공식 린터는 본문
  yaml 펜스를 frontmatter 와 한 네임스페이스로 병합해 읽기 때문이다(`wanted` 는 그래서 문서 전체가 0토큰이
  됐었다). 그림자는 frontmatter `elevation:` 맵(행 하나에 그림자 하나)에, 모션 값 · `## Components` 스펙 ·
  그림자가 아닌 elevation 표 · `## Spacing` 치수 표는 본문 ```` ```text ```` 펜스에 산다.
- **색상 토큰 값은 OKLCH만.** `colors:` 값은 소문자 `oklch(…)` 하나이거나 따옴표 친 `"{colors.이름}"`
  참조다. 브랜드 hex는 `# #FAFAFA` 트레일링 주석이나 같은 줄 `(≈ oklch(...))` 병기로만 기록. 참조는 ASCII
  키만 가리킬 수 있다 — 한글 키(`빨강`)는 ASCII 로 짓거나 값을 `oklch(…)` 로 직접 쓴다.
- **frontmatter 는 한 모듈이 진짜 YAML 로 한 번 읽는다**(`src/lib/frontmatter.ts` 의 `readFrontmatter`,
  ADR 0011). **"사이트와 YAML 이 다르게 읽는 경우"를 막는 규칙은 다시 만들지 않는다** — 그런 경우가 보이면
  이 모듈을 거치지 않는 독자를 고친다. 그 대신 YAML 이 읽는 대로 읽으므로, 따옴표로 시작하는 값은 YAML 문법을
  따라야 한다 — 폰트 스택 `"Pretendard", sans-serif` 는 값 전체를 다른 따옴표로 한 번 더 감싸야
  (`'"Pretendard", sans-serif'`) 읽히고, 참조는 `"{colors.x}"` 처럼 따옴표가 있어야 참조로 읽힌다. 감싸지 않은
  폰트 스택 하나가 frontmatter 전체를 못 읽게 만드는데, 검증기는 파서 오류만 알리고 고치는 법은 말하지 않는다.
- **사이트가 읽는 키(`CONSUMED_KEYS`)를 값 없이 쓰면 사이트 빌드가 실패한다**(`site-frontmatter.ts`) —
  빈 값이 기본값으로 조용히 바뀌지 않게 하려는 것이다. 키를 아예 안 쓰면 기본값으로 떨어진다. `name`·
  `category`·`lang` 은 지워도 게이트가 받아 주지만 스킬 루브릭(`rubric-design.md`)은 필수로 요구한다.
- **출처 목록은 `## References` 한 곳이다.** frontmatter `sources` 는 References 와의 중복이라
  걷어냈다(ADR 0004) — 되살리지 말 것. 인용은 `[src:N]` 정수 인덱스.
- **인용은 존재가 아니라 내용 일치.** `[src:N]`이 가리키는 소스가 실제로 그 주장을
  담고 있어야 한다 (리뷰어의 의미적 스팟체크 대상).
- **`logo`는 필수다** — 없으면 그리드 카드는 이름 첫 글자 배지로, OG 는 텍스트 전용으로 떨어진다. 스킬
  인테이크에 "없음" 답은 없다. 고르는 순서:
  - 심볼을 발행하지 않는 브랜드는 앱스토어 앱 아이콘으로 대신한다(프레임 박힌 아이콘 금지 규칙의 유일한 예외).
  - 심볼을 **웹 아이콘으로만** 발행하는 브랜드도 앱 아이콘을 쓸 수 있다 — 자기 도메인에서 프레임 없는 심볼이
    파비콘·웹 앱 매니페스트 아이콘·`apple-touch-icon` 으로만 나오고 SVG 나 따로 낸 로고 파일로는 나오지 않을
    때다(워드마크와 한 파일인 락업은 단독 심볼로 치지 않는다. 파비콘만 있는 브랜드도 든다). 판정은 선명도가
    아니라 파일이 어디서 나오는지로 하고, 두 후보를 함께 보여 고르게 하고, 이 예외를 쓰면 그 사유를 `NOTICE`
    줄에 적는다. 기존 항목은 일괄로 바꾸지 않고 재감사 때 항목마다 판단한다.
  - 앱 아이콘도 없으면 워드마크를 경고와 함께 확인받아 쓰고, 그것도 없으면 온보딩을 멈춘다.
  - 로고 없이 남는 항목은 권리자 요청으로 로고만 뺀 경우뿐이다. 그 슬러그는 요청 참조(공개 이슈 `#N` 또는
    비공개 advisory `GHSA-…`)와 함께 `src/lib/logo-takedowns.ts` 의 `LOGO_TAKEDOWNS` 에 적는다(docs/TAKEDOWN.md).
    그 슬러그는 스킬이 로고를 다시 찾지 않고 멈춘다(손으로 재감사한다). 로고 복원은 관리자 몫이다.

  값은 `https://getdesign.kr/logos/*.{svg,png,webp,avif}` 절대 URL (파일이 사이트
  밖으로 복사돼도 유효해야 함). 프리뷰 HTML 안에서는 반대로 site-relative `/logos/...`.
- **테마별 팔레트는 이름을 갈라 쓴다** (`bg-canvas` / `dark-bg-canvas`). 한 이름을 두 값으로
  선언하면 어느 쪽이 정본인지 알 수 없어 프리뷰 대조가 그 토큰에서 꺼진다. 관례는 `dark-` 접두다.
- **Dimension 값은 0이어도 단위를 붙인다** — `tracking: 0` 이 아니라 `0em`. 검증기는 `components:` 값에서만 이것을
  막으므로, 다른 맵에서는 이 규칙이 유일한 안내다.
- **본문의 `{map.name}` 참조는 그 맵에 실제로 있는 키를 가리켜야 한다** — 이 파일이 표준 DESIGN.md 로
  그대로 발행되므로, 없는 키를 가리키는 참조는 소비자가 끝낼 수 없는 조회다. 토큰이 없는 이름(`text` 펜스의
  모션 값, 본문 표에만 있는 역할 이름)은 괄호 없이 코드 스팬으로 쓰고, 참조를 살리려고 `[src:N]` 근거 없는
  토큰을 만들지 말 것. 검사가 읽는 모양과 일부러 읽지 않는 모양의 목록은 `src/lib/draft-validator.ts` 의
  `checkTokenReferences` 주석이 정본이다 — 리뷰가 새 모양을 들고 오면 규칙을 늘리기 전에 그 목록과 대조할 것.
- **새 항목은 슬러그별 표에 자기 줄을 적는다. 아래가 그 전부이고, 다른 곳엔 통합 목록이
  없다** — 스킬(Stage 10 의 등록처 안내)은 아홉 전부를 안다. 템플릿은 `KNOWN_SPEC_LIMITATIONS`
  하나를 이름으로 대고, `CASES` 의무는 저작 명세(`stitch-format.md`)를 가리켜서만 안다.
  셋은 늘 필요하고 여섯은 조건부다(그중 `PREVIEW_TOKEN_ALIASES` 와 `COMPONENT_COUNTS` 는 새 항목 거의
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
  못 맞춰 그 항목에 대해 아무것도 검사하지 않는다. `MATCH_FLOOR` 에 `0` 을 적는 것이 거부되는
  이유가 이것이다. `BASELINE_TABLE` 의 수치는 `pnpm gate:contrast` 의 실패 출력이 만들어 주며 같은 바이트가
  `docs/preview-contrast-baseline.md` 에도 있어야 한다.

  전부 총계가 아니라 슬러그 단위라 동시에 열린 카탈로그 PR 끼리 서로를 깨지 않는다.
  **다만 표 자체가 새로 생기는 경우는 막아 주지 않는다** — 루트 `CLAUDE.md` 「기여 관례」의 합본 재검증 항을 볼 것.

## Google DESIGN.md 표준 (`pnpm validate:spec`)

Google Labs 가 발행한 DESIGN.md 명세(`github.com/google-labs-code/design.md`, 버전 `alpha`, Apache-2.0)를
**공식 린터로** 판정한다. 룰을 재진술하지 않으므로 명세가 바뀌면 자동 추종된다. 명세 자체를 확인할 일이
생기면 `packages/cli/src/linter/spec-config.yaml` 하나가 단일 진실 원천이고, 산문 요약본들은 서로 어긋나므로
믿지 말 것. 린터를 올리는 PR 에서 테스트가 초록으로 넘기는 변화와 확인법은 `.github/dependabot.yml` 주석에 있다.

- **`Spacing`+`Rounded` 를 `Layout` 하나로 합치지 말 것** — `REQUIRED_SECTIONS` 가 두 헤딩을 모두 요구한다.
  `Brand & Style` 은 `Overview` 의 공식 별칭이다.
- **항목의 DESIGN.md 가 변환 없이 그대로 표준 문서다**(ADR 0003·0008). 표준 도구용 판을 따로 만들던 어댑터는
  걷었다 — 되살리지 말 것: 어댑터는 항목 파일이 표준에서 멀어진 것을 가려, 파일을 직접 가져간 소비자만
  어긋난 문서를 받게 한다.
- **`spacing:`·`rounded:` 는 필수 맵이 아니다**(`colors:`·`typography:` 는 필수) — 브랜드가 발행하지 않았을
  수 있어, 필수로 하면 값을 지어내라는 압력이 된다. 타입 스케일 block 에는 예외 경로가 없다 — 코퍼스 테스트의
  `NO_TYPE_SCALE` 에 기록해도 `validate:catalog` 는 통과하지 못한다.
- **dev 서버에서는 `/services/{slug}/DESIGN.md` 라우트가 404 다.** Vite 미들웨어가 `.md` 요청을 라우터보다
  먼저 가로챈다. nitro 에는 없어 프로덕션은 200 이다 — dev 결과로 "라우트가 깨졌다"고 판단하지 말 것.
- **카탈로그가 명세보다 표현력이 높은 자리가 둘 있다.** `%` 단위 radius(`50%`)와 다중 스톱
  그라디언트다. 준수하려면 실제 발행값을 버려야 하므로 값은 고치지 않는다.
  - **그라디언트는 카탈로그 전용 `gradients:` 맵에 둔다** — `colors:` 에 두면 명세의 Color(단색)
    로 읽혀 토큰마다 에러가 나고, 사이트 스와치도 빈 칸이 된다.
  - **`%` radius 는 `rounded:` 에 그대로 두고 기록한다** — 명세 단위로 옮기면 뜻이 바뀌고(`50%` 는
    직사각형에서 타원, `9999px` 는 알약), 맵 밖으로 빼면 표준 도구와 Tokens 탭이 값을 못 본다.
    `KNOWN_SPEC_LIMITATIONS` 가 슬러그별 개수를 적고, 코퍼스 테스트가 그것을 **양방향 래칫**으로
    고정한다(새 에러도, 조용한 수정도 실패시킨다).
- **`primary` 라는 이름의 토큰을 지어내지 말 것.** 명세가 없으면 경고하지만, 어느 브랜드
  색이 primary 인지는 의미 판단이다. 같은 코퍼스 테스트가 해당 슬러그 목록을 고정해
  둬서, 붙이려면 근거와 함께 명시적으로 해야 한다. 붙일 때의 형식(브랜드 대표색 별칭):
  - **참조 행 한 줄** `primary: "{colors.x}"` — 값을 리터럴로 복제하지 않는다. 가리킬
    대상은 브랜드가 대표색으로 **발행한** 값이지 시맨틱 fill 역할이 아니다(toss 는
    `fill-brand` 가 아니라 `blue-500`). 대상 토큰 바로 앞에 둔다.
  - **근거는 커밋/PR 본문에** 둔다(인용 번호 + 상류 재확인). 감사 메모 자리가 아니다.
    토큰 줄 주석은 같은 이름의 다른 뜻 토큰(`text-primary` 등)과 가르는 단서가 필요할
    때만 쓴다.
  - 참조 행은 사이드카·`TOKEN_COVERAGE`·`MATCH_FLOOR` 어디에도 안 잡힌다 — 움직이는
    것은 missing-primary 배열 하나다. 그래서 **사이트 Tokens 탭과 `use-design-md` 는
    이 별칭을 못 본다**(DESIGN.md 파일의 frontmatter 에만 있다).
  - `last_updated` 는 올리지 않고 `Skip-Last-Updated` 트레일러를 단다(`audit-notes.md` 의 날짜 항).
- **새 항목은 컴포넌트를 명세의 `components:` 맵에도 싣는다**(기존 항목은 소급하지 않는다). 저작 규칙의
  정본은 `stitch-format.md` 의 "Component tokens in the frontmatter `components:` map" 이고, 검증기는 행의
  모양·속성·값 형태·참조를 막는다. 맵이 아예 없거나, 행이 본문 스펙과 다르거나, 참조가 속성에 맞지 않는 것
  (`height: "{colors.x}"`)은 리뷰어 루브릭만 본다. 본문 스펙 펜스(`text`)는 그대로 남는다(두 벌의 어긋남은
  리뷰 루브릭이 본다). 사이드카가 싣지 않으므로 사이트 Tokens 탭과 `use-design-md` 는 못 본다. 컴포넌트가
  생기면 린터 경고 `orphaned-tokens`·`contrast-ratio` 가 깨어나지만 게이트는 막지 않는다.
- **브랜드가 발행한 역할→팔레트 계층은 frontmatter 참조 행으로 싣는다.** 형식은
  `bg-brand-solid: "{colors.carrot-600}"` 이고, 다크 짝은 `dark-` 접두로 다크 팔레트를 가리킨다
  (`dark-bg-brand-solid`). 테마를 타지 않는 팔레트(seed-design `static-*`)에는 `dark-` 짝이 없으므로 다크 짝도
  접두 없는 키를 가리킨다. 다음을 지킨다.
  - **상류가 역할을 단일 팔레트 토큰으로 가리킬 때만 싣는다.** 불투명도 램프를 거치는 역할은 값이
    같아도 싣지 않는다. codeit `txt-primary` 는 `gray-100` 이 아니라 `gray-100-opacity-100` 을
    가리킨다. 이런 역할과, 상류가 표와 어긋나는 짝은 본문 표에만 둔다.
  - **명세 `color_roles`(`primary` · `secondary` · `tertiary` · `neutral`)와 같은 이름으로 표의 역할을 싣지 않는다.**
    greeting 의 `primary` · `secondary` · `tertiary` 는 텍스트색이다. 그 이름으로 발행하면 도구가 브랜드 역할로 읽는다.
    `primary` 만은 위의 브랜드 대표색 별칭으로 둘 수 있다. 이 금지는 **본문 역할 표의 역할을 그 이름으로 싣는
    경우**에 한한다 — remember 의 `secondary` 처럼 브랜드가 그 이름으로 발행한 색은 해당하지 않는다.
  - **본문 표와 참조 행은 같은 대응의 두 벌이다.** 한쪽을 고치면 다른 쪽도 고친다.
    `role-reference-rows.test.ts` 가 `CASES` 에 등록된 항목마다 둘을 양방향으로 대조한다(`tokens:check` 로는
    못 잡는다). 새 항목이 이 형식을 쓰면 그 맵에 대조 함수를 더한다 — 빠뜨리면 같은 파일의 가드가 실패한다.
    가드는 `## Colors` 표 **첫 열의 백틱 스팬**을 보므로, 역할을 백틱 없이 쓰거나 첫 열 밖에 두면 못 본다.
  - **기계로 막는 곳은 `CASES` 에 등록된 항목뿐이다**(텍스트 사다리 `primary` 검사는 greeting 에만 있다). 이 형식
    이전부터 있던 참조 행 — toss 의 알파 토큰·`tds-*` 사슬, vapor-ui 의 `-dark` 접미 별칭, likelion · teamsparta ·
    baemin 의 참조 행 — 은 이 규칙과 테스트의 대상이 아니다. 이 형식에 맞추려고 고치지 말 것.
