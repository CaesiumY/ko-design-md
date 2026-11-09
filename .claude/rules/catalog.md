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

토큰 위치(frontmatter 맵 · 본문 yaml 펜스 금지)와 색 값 모양(`oklch(…)` 또는 `"{colors.x}"` 참조)은 검증기가
막고, 막을 때 옮길 곳과 고쳐 쓰는 법을 말한다. 예외 하나: 참조는 ASCII 키만 가리킬 수 있어 한글 키를 가리키는
`"{colors.빨강}"` 은 막히는데, 메시지는 원인을 말하지 않는다 — 키를 ASCII 로 짓거나 값을 `oklch(…)` 로 직접
쓴다. 브랜드 hex 는 트레일링 주석이나 같은 줄 `(≈ oklch(…))` 병기로만 적는다(산문의 맨 hex 는 경고만 난다).
아래는 검증기가 말하지 않거나 판정할 수 없는 것이다.

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
  선언하면 어느 쪽이 정본인지 알 수 없어 프리뷰 대조가 그 토큰에서 꺼진다. 다크 쪽에 `dark-` 접두를 붙이고 라이트
  쪽 이름은 그대로 둔다 — 테마를 가르는 `…-dark`·`…-light` 접미는 쓰지 않는다(같은 바탕 위의 명도 단계인
  `primary-dark` 는 테마 짝이 아니다). 이것을 지키는 기계 검사는 없고(#636 이 오탐 때문에 가드를 두지 않았다)
  리뷰 루브릭이 본다.
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
  | 역할 표 대조 함수 (`CASES`) | `role-reference-rows.test.ts` | 본문 역할 표의 역할을 frontmatter 참조 행으로도 실을 때 — 브랜드가 역할 계층을 발행했고 상류가 단일 팔레트 토큰이나 다른 역할을 가리키는 역할이 있으면 늘 그렇다 (양방향 · 등록 누락은 가드가 막는다) |

  **`PREVIEW_TOKEN_ALIASES` 를 빠뜨리면 조용히 0건 비교가 된다** — 드리프트 게이트가 이름을
  못 맞춰 그 항목에 대해 아무것도 검사하지 않는다. `BASELINE_TABLE` 의 수치는 `pnpm gate:contrast` 의 실패 출력이 만들어 주며 같은 바이트가
  `docs/preview-contrast-baseline.md` 에도 있어야 한다.

  위 등록처는 전부 총계가 아니라 슬러그 단위라 동시에 열린 카탈로그 PR 끼리 서로를 깨지 않는다.
  **다만 표 자체가 새로 생기는 경우는 막아 주지 않는다** — 루트 `CLAUDE.md` 「기여 관례」의 합본 재검증 항을 볼 것.
- **기존 항목의 팔레트(`colors:` 나 `OBSERVED_COLOURS` 의 관찰색 목록)를 바꾸면, 그 항목이 발행색 분류표에 행이
  있는 한 그 PR 의 CI run 으로 `pnpm audit:contrast:rebaseline <run id>` 를 돌린다**(#669). 분류 run 기록이 분류에
  쓴 팔레트의 지문을 담아, 어긋나면 `pnpm test` 가 그 슬러그 이름으로 막는다. 무엇이 지문을 바꾸는지와, 이 기록이
  슬러그 단위가 아니라서 재기록하는 PR 끼리 부딪힐 때 어떻게 하는지는 `docs/preview-contrast-baseline.md`
  「발행색끼리의 경계선」 절 끝에 있다.

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
    **발행한** 값이지 시맨틱 fill 역할이 아니다(likelion 의 `primary` 는 같은 색을 가리키는 역할 `bg-primary` 가
    아니라 발행 팔레트 `primary-500` 을 가리킨다).
  - **근거는 커밋/PR 본문에** 둔다(인용 번호 + 상류 재확인). 감사 메모 자리가 아니다. 토큰 줄 주석은 같은
    이름의 다른 뜻 토큰(socar 의 본문색 `text-primary` 등)과 가르는 단서가 필요할 때만 쓴다.
  - `last_updated` 는 올리지 않고 `Skip-Last-Updated` 트레일러를 단다(`audit-notes.md` 의 날짜 항).
- **새 항목은 컴포넌트를 명세의 `components:` 맵에도 싣는다**(기존 항목은 소급하지 않는다). 저작 규칙의
  정본은 `stitch-format.md` 의 "Component tokens in the frontmatter `components:` map" 이다. 본문 스펙 펜스
  (`text`)도 그대로 남는다 — 두 벌의 어긋남은 리뷰 루브릭이 본다.
- **브랜드가 팔레트 위에 발행한 역할 계층은 두 벌로 반드시 싣는다 — 본문 `## Colors` 의 역할 표와
  frontmatter 역할 참조 행이다**(ADR 0012). 본문을 어떻게 썼는지는 조건이 아니다. 역할 계층을 산문이나 토큰 줄
  주석으로만 적었거나, 상류가 팔레트 단계를 가리키는 역할을 frontmatter 에 그 단계와 같은 값으로 실었어도 의무는
  같다. 팔레트 없이 역할이 값을 직접 갖는 체계는 역할 계층이 아니어서 대상이 아니다. 참조 행의 형식은
  `bg-brand-solid: "{colors.carrot-600}"` 이다.
  - **"발행"은 브랜드 발행물(공개 문서·패키지)이나 배포 코드가 그 이름으로 역할을 정의한 경우다.** 카탈로그
    작성자가 관찰한 값에 스스로 붙인 이름(번들에서 보았든 배포 코드에서 보았든), 본문이 공식 이름이 아니라고
    밝힌 이름, 합성 이름은 발행이 아니어서 의무 밖이다.
  - **본문 표는 의무이고, 역할 이름은 표 첫 열의 백틱 스팬에 둔다**(가드가 보는 자리 — 아래 「두 벌」 항).
  - **참조 행은 상류가 역할을 단일 팔레트 토큰이나 다른 역할 하나로 가리킬 때만 싣는다.** 불투명도 램프를
    거치는 역할은 값이 같아도 싣지 않는다(codeit `txt-primary` 는 `gray-100` 이 아니라 `gray-100-opacity-100` 을
    가리킨다). 이런 역할과, 상류가 표와 어긋나는 짝은 본문 표에만 둔다. 가리킬 팔레트 토큰이나 대응 값이
    상류에 없으면 지어내지 말고 알려진 공백에 적는다.
  - **상류가 역할을 다른 역할로 가리키면 역할 참조로 싣는다**(2026-11-08 결정, #661). 채널톡 alpha 의
    `--alpha-color-primary-bg-normal: var(--alpha-color-bg-blue-normal)` 은 `primary-bg-normal:
    "{colors.bg-blue-normal}"` 꼴로 싣는다. tier 접두는 아래 두 tier 항(팔레트 접두, 역할 이름 접두)을
    따르므로, 채널톡 alpha 에서는 실제 키가 `alpha-primary-bg-normal: "{colors.alpha-bg-blue-normal}"` 이
    된다. 끝까지 따라가 팔레트 단계에 걸지 않는다 — 상류의 구조가 그대로 남아, 가운데 역할이 바뀌면 그 역할을
    가리키는 역할도 함께 따라간다. 토큰 추출기는 참조의 참조를 끝까지 따라가 칠할 색으로 풀고 첫 홉을 `ref` 에
    둔다. 가리킨 역할도 이 절의 규칙대로 실려 있어야 하고, 그 역할이 참조 행 없이 표에만 있으면(불투명도 램프,
    상류가 값을 직접 적은 역할) 가리키는 역할도 표에만 둔다. 브랜드 대표색 별칭 `primary` 는 역할이 아니므로
    대상이 될 수 없다. 다크 짝은 가리킨 역할의 `dark-` 짝을 가리킨다(`dark-primary-bg-normal` →
    `dark-bg-blue-normal`). 상류는 테마 블록마다 같은 홉을 적고 블록이 색을 고르지만, 카탈로그는 키 이름이
    테마를 지니므로 접두 없는 역할을 가리키면 다크에 라이트 색이 칠해진다. 가리킨 역할의 다크 쪽이 표에만
    있으면(다크 칸이 불투명도 램프 등이라 `dark-` 짝 행이 없으면) 가리키는 역할의 다크 쪽도 표에만 둔다. 가리킨
    역할에 `dark-` 짝 행이 없고 표에도 다크 칸이 없으면(테마를 타지 않는 역할) 두 짝 모두 그 역할을 가리킨다.
    `role-reference-rows.test.ts` 의 픽스처가 이 꼴을 받아들이고, 테마를 건넌 짝(가리킨 역할의 다크 쪽이 표에만
    있는 경우 포함)과 `primary` 를 거치거나 팔레트에 닿지 않는 대상을 막는 것을 고정한다.
  - **다크 짝은 `dark-` 접두로만 이름 짓는다.** `…-dark` 같은 접미형은 쓰지 않는다. 가리키는 곳은 상류가
    다크 테마에서 그 역할을 무엇으로 칠하는지를 따른다. 팔레트를 테마마다 다시 정의하는 체계는 다크 팔레트를
    가리킨다(seed-design `dark-bg-brand-solid` → `dark-carrot-700`). 팔레트는 한 벌이고 다크 블록이 역할만 다시
    가리키는 체계에서는 다크 짝도 `dark-` 없는 키를 가리키며, 라이트와 다른 단계여도 그렇다(bezier 기본 tier
    `bg-grey-lightest` → `stable-grey-50`, `dark-bg-grey-lightest` → `stable-grey-850`. beta `text-neutral` →
    `black-85`, `dark-text-neutral` → `white-80`). 테마를 타지 않는
    팔레트(seed-design `static-*`)를 가리키는 짝은 라이트와 같은 키를 가리킨다(`bg-overlay` 와
    `dark-bg-overlay` 둘 다 `static-black-alpha-700`).
  - **브랜드가 역할 계층을 여러 tier 로 발행하면 tier 마다 자기 tier 의 원시값에 건다**(2026-11-02 결정, bezier
    #647). tier 는 한 패키지가 같은 원시값 이름으로 따로 발행한 토큰 벌이다(채널톡의 기본, beta, alpha). 이름이
    같아도 tier 가 다르면 값이 다를 수 있는 다른 토큰이므로, 접두 없는 팔레트로 싣는 tier 하나 밖의 tier 는
    원시값을 tier 접두 팔레트로 따로 싣고 그 tier 역할의 참조 행을 접두 키에 건다 — 채널톡 기본 tier 역할이
    가리키는 `var(--grey-900)` 은 `stable-grey-900` 이다. 값이 같아도 다른 tier 의 키를 가리키지 않는다. 한
    tier 만 바뀌면 조용히 거짓이 되기 때문이다. alpha tier 도 같은 꼴로 `alpha-` 를 쓴다.
  - **tier 의 역할 이름이 이미 실린 역할과 하나라도 겹치면 그 tier 역할 전부에 같은 tier 접두를 붙인다**
    (2026-11-09 메인테이너 결정, #661 의 PR #667, 처음 적용은 #664). frontmatter 키는 겹칠 수 없기 때문이다 —
    채널톡 alpha 역할 이름 12개가 이미 실린 기본 tier 역할과 같다. 표 첫 열 이름도 같은 접두를 달고, `dark-` 는
    그 바깥에 둔다(`dark-alpha-bg-grey-light`). 역할 → 역할 참조도 접두 붙은 이름끼리 잇는다. 위 항의 팔레트
    접두와는 따로 정한 규칙이다.
  - **기본 테마 없이 나란한 테마 여럿의 역할 이름이 하나라도 겹치면 모든 테마의 역할 전부에 테마 접두를 붙인다**
    (2026-11-09 메인테이너 결정, #624 와 PR #675 댓글에 기록, 처음 적용은 baemin #665). 여기서 테마는 상류가 한
    요소에 동시에 거는 역할 묶음이다. 배민 웹의 `base` 와 `mint` 는 페이지 `body` 에 두 클래스가 함께 걸려, 두 역할
    묶음(`--sem-base-*`, `--sem-mint-*`)이 동시에 쓰인다. tier 와 가르는 기준은 이것이다 — 상류가 벌들을 한 요소에
    동시에 걸면 테마, 하나를 골라 쓰게 하면 tier 다. 두 정의에 모두 맞으면(같은 원시값 이름을 벌마다 선언하면서
    한 요소에 동시에 걸리면) 이 항이 우선한다. 어느 테마도 기본이 아니므로 위 tier 항처럼 한 벌을 접두 없이
    남기지 않는다. 접두는 각 테마의 역할 전부(한 테마에만 있는 역할, 표에만 있는 역할 포함), 표 첫 열
    이름, 역할 → 역할 참조의 양끝에 붙인다. 테마 이름은 상류 그대로 쓰고(`base-systemMainPrimary`), `dark-` 는 그
    바깥에 둔다(`dark-mint-systemMainPrimary`).
  - **위 항의 테마 블록이 팔레트를 다시 선언해도 모든 블록에서 값이 같으면 공용 팔레트 한 벌(접두 없음)로 싣는다**
    (2026-11-09 메인테이너 결정, #624 댓글에 기록). 테마 역할은 모두 그 키를 가리킨다. 배민 `--ref-color-*` 는
    `base` 와 `mint` 블록에 따로 선언되지만 라이트끼리, 다크끼리 값이 모두 같다(#668 감사 메모). 위 tier 항의 "값이
    같아도 다른 tier 의 키를 가리키지 않는다"를 이 경우에 푼다. 테마 클래스가 한 요소에 동시에 걸리는 체계에만
    적용하고, 클래스를 번갈아 거는 체계는 이 항 밖이다. 이 규칙을 적용한 항목은 팔레트 감사 메모에 같음을 확인한
    블록과 조회일을 적고, 재감사는 블록마다 값을 맞대 본다. 블록 값이 갈리는 경우는 실제 사례가 생길 때 다시
    정한다.
  - **명세 `color_roles`(`primary` · `secondary` · `tertiary` · `neutral`)와 같은 이름으로 표의 역할을 싣지 않는다**
    — greeting 의 `primary`~`tertiary` 는 텍스트색인데, 그 이름으로 발행하면 도구가 브랜드 역할로 읽는다.
    `primary` 만은 위의 브랜드 대표색 별칭으로 둘 수 있고, 브랜드가 그 이름으로 발행한 색(remember 의
    `secondary`)도 해당하지 않는다.
  - **본문 표와 참조 행은 같은 대응의 두 벌이다.** 한쪽을 고치면 다른 쪽도 고친다. 기계로 대조하는 것은
    `role-reference-rows.test.ts` 의 `CASES` 에 등록된 항목뿐이고, 등록을 빠뜨린 항목을 찾는 가드는 `## Colors`
    표 **첫 열의 백틱 스팬**만 본다 — 역할을 백틱 없이 쓰거나 첫 열 밖에 두면 대조가 조용히 빠진다.
  - **기존 항목도 이 규칙의 대상이다**(이름을 단 예외는 두지 않는다 — #624). 아직 맞지 않는 항목은 #624 의
    항목별 하위 티켓이 상류와 다시 맞춰 위 하위 규칙에 맞게 고친다. 그 티켓이 없는 항목에서 어긋남을
    찾으면 찾은 PR 이 고치거나 이슈를 연다. #624 를 닫는 PR 이 이 과도기 문장을 지운다.
