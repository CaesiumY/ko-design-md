# ko-design-md

한국 브랜드의 디자인 언어를 DESIGN.md 문서(`services/{slug}.md`)로 정리한 오픈 카탈로그.
TanStack Start 사이트(getdesign.kr)가 이를 서빙하고, `/design-md` 스킬(.claude/skills/design-md)이
새 항목 온보딩 파이프라인을 자동화한다. 패키지 매니저는 **pnpm** (npm 금지).

## 검증 커맨드 (CI 게이트와 동일)

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test               # vitest — .claude/{worktrees,cache}/ 만 제외됨
pnpm validate:catalog   # services/*.md 전수: frontmatter·섹션 순서·OKLCH·인용 무결성
pnpm validate:previews  # public/preview/*/ 전수: 구조 block + 반응형 휴리스틱 warn
pnpm tokens:check       # services/*.tokens.json 이 소스 md 와 일치하는지 (drift 게이트)
pnpm audit:oklch        # OKLCH↔병기 hex 일치 + 프리뷰가 md 정의와 어긋나지 않는지
pnpm check:last-updated # 이 브랜치가 바꾼 services/*.md 의 last_updated 가 최신인지
pnpm validate:spec      # 로컬 진단용 출력. 실제 게이트는 pnpm test 안의
                        # google-designmd-corpus.test.ts (같은 공식 린터를 vitest 로)
pnpm build              # build:og + vite build
pnpm test:http          # pnpm build 뒤 빌드된 Nitro 서버 HTTP 회귀 검사
```

**`pnpm gate:contrast` 는 위 묶음에 없다** — Chromium 이 필요해 CI 의 **별도 `contrast` 잡**
에서 돈다(`build` 잡이 아니다). 프리뷰 대비를 라이트·다크 × 4폭으로 전수 재고
`docs/preview-contrast-baseline.md` 의 총계 표와 대조한다. 개별 미달은 막지 않고 **그 수가
움직였는지**만 막는다(어긋남 = exit 3, 측정기 고장 = `--self-check` 의 exit 1, 인자 오류 = 2).
로컬에서 돌리려면 `pnpm exec playwright install chromium` 이 선행돼야 하고, **수치는 CI 가
정본이다** — 폰트 폴백이 OS 마다 달라 줄바꿈이 달라지고 판정이 기대는 줄이 바뀔 수 있다.

단일 파일 검사: `pnpm validate:draft <file.md> [--slug X --expected-logo <url> --lang ko]`,
`pnpm validate:previews --slug <slug> --verbose`. 스킬 파이프라인은 이 검증기를
author→reviewer 사이 기계 게이트(Stage 6a2/9a2)로 실행한다.

## 카탈로그 정책 (위반은 CI가 block)

- **토큰은 frontmatter 에 산다.** `colors:` · `typography:` · `spacing:` · `rounded:`
  맵이 Google DESIGN.md 형태다. 이 네 섹션의 본문 yaml 펜스(토큰 펜스)는 폐기된 형태로,
  **`validate:draft`·`validate:catalog` 가 block 한다**(`token-fence`). 추출기의 본문
  폴백은 frontmatter 에 토큰 맵이 하나도 없을 때만 타고, 펜스가 막힌 뒤 거기 닿는 입력은
  `## Typography` 의 마크다운 표뿐이다(표는 block 대상이 아니다).
  그룹은 `  ## 라벨` 주석 행이 열고(사이드카 `group`), 토큰별 단서는 그 줄의 트레일링
  `#` 주석이 나른다(사이드카 `note` — 기계 소비자에게 닿는 유일한 경로).
- **본문에는 yaml 펜스가 하나도 없다 — 섹션을 가리지 않고 block 이다**(`body-yaml-fence`,
  네 토큰 섹션 안은 위의 `token-fence`). 항목 파일이 그대로 표준 DESIGN.md 로 발행되고,
  공식 린터는 본문 yaml 펜스를 frontmatter 와 한 네임스페이스로 병합해 행마다 최상위 키로
  읽기 때문이다(`wanted` 는 펜스 사이 키 7개 충돌로 문서 전체가 0토큰이 됐었다). 그래서:
  - **그림자는 frontmatter `elevation:` 맵에 산다.** 한 줄에 하나, 인용 없이, 다중 레이어는
    콤마로 잇고 단서는 트레일링 주석으로 — 블록 스칼라·인용값·중첩 행은 토큰 맵과 같이
    block 이다. 사이드카 `elevation` 은 이 맵만 읽고, 그림자 모양이 아닌 값(모션·z-index)
    은 걸러 낸다. 스펙 모델에 elevation 범주는 없지만 린터는 이 키를 문제 삼지 않는다.
  - **모션과 컴포넌트 스펙은 본문 ```` ```text ```` 펜스다.** 26개가 있다 — 모션 8개
    (`## Elevation & Depth` 아래 6 · `## Motion` 2), `## Components` 의 스펙 16개, 그림자가
    아닌 elevation 표 2개(bezier 용도 라벨 · class101 z-index). 독자에게는 값이 닿고 린터는
    읽지 않는다. 컴포넌트 스펙은 스펙의 `components:` 맵이 8속성만 담으므로 펜스가 남는다
    (아래 표준 절의 파일럿 항).
- **색상 토큰 값은 OKLCH만.** frontmatter `colors:` 맵의 `name: oklch(...)` 형식. 브랜드 hex는
  `# #FAFAFA` 트레일링 주석이나 같은 줄 `(≈ oklch(...))` 병기로만 기록.
- **값을 인용하지 말 것 — 이제 block 이다**(`quoted-token-value`). 인용하면
  `audit:oklch` 와 드리프트 검사가 그 토큰을 못 보고 둘 다 통과를 보고한다. 벌거벗은
  `#FF0038` 은 YAML 이 주석으로 읽어 애초에 무효라, **인용형이 hex 를 쓸 수 있는 유일한
  철자였고 그래서 정확히 그것이 잡혀야 했다.** 참조(`"{colors.x}"`)와 따옴표로 시작하는
  폰트 스택만 인용한다.
- **frontmatter 는 진짜 YAML 파서를 통과해야 한다**(`frontmatter-yaml-invalid`, block).
  `buildDoc` 의 손수 만든 파서는 스스로 밝히듯 무효 입력에서 조용히 열화하고 나머지
  게이트는 정규식이라, 인용 없는 폰트 스택 하나가 문서 전체를 0토큰으로 만들어도
  아무도 몰랐다(실제로 7개 항목에서 났다).
- **출처 목록은 `## References` 한 곳이다.** frontmatter `sources` 는 References 와의 중복이라
  걷어냈다(ADR 0004) — 되살리지 말 것. 인용은 `[src:N]` 정수 인덱스.
- **인용은 존재가 아니라 내용 일치.** `[src:N]`이 가리키는 소스가 실제로 그 주장을
  담고 있어야 한다 (리뷰어의 의미적 스팟체크 대상).
- `logo`는 `https://getdesign.kr/logos/*.{svg,png,webp,avif}` 절대 URL (파일이 사이트
  밖으로 복사돼도 유효해야 함). 프리뷰 HTML 안에서는 반대로 site-relative `/logos/...`.
- 10개 Stitch 표준 섹션은 상대 순서 유지 (사이 비표준 섹션 추가는 허용).
- **테마별 팔레트는 이름을 갈라 쓴다** (`bg-canvas` / `dark-bg-canvas`). 한 이름을 두 값으로
  선언하면 어느 쪽이 정본인지 알 수 없어 프리뷰 대조가 그 토큰에서 꺼진다. 관례는
  `dark-` 접두다(codeit 78개·seed-design 109개). `wanted`가 21개를 충돌시켜 대조 22건을
  잃고 있었다.
- **Dimension 값은 0이어도 단위를 붙인다** — `tracking: 0` 이 아니라 `0em`.
- **새 항목은 슬러그별 표에 자기 줄을 적는다. 아래가 그 전부이고, 다른 곳엔 통합 목록이
  없다** — 스킬은 셋만, 템플릿은 하나만 안다. 셋은 늘 필요하고 다섯은 조건부다
  (그중 `PREVIEW_TOKEN_ALIASES` 는 거의 전부에 해당한다).

  | 등록처 | 위치 | 언제 |
  | --- | --- | --- |
  | `PREVIEW_TOKEN_ALIASES` | `src/lib/oklch-drift.ts` | 프리뷰가 커스텀 프로퍼티를 네임스페이스하면(거의 전부) |
  | `MATCH_FLOOR` | `oklch-drift-corpus.test.ts` | 항상 (하한) |
  | `TOKEN_COVERAGE` | `token-coverage.test.ts` | 항상 (양방향 정확값) |
  | `BASELINE_TABLE` | `contrast-baseline.ts` | 항상 (슬러그마다 **4행**) |
  | `NOTICE` 자산 인벤토리 | `NOTICE` | `public/logos/` 에 파일을 놓으면 |
  | missing-primary 배열 | `google-designmd-corpus.test.ts` | `primary` 라는 이름의 토큰이 **없을 때** |
  | `KNOWN_SPEC_LIMITATIONS` | `src/lib/spec-limitations.ts` | `%` radius·다중 스톱 그라디언트를 쓸 때 |
  | `COMPONENT_COUNTS` | `google-designmd-corpus.test.ts` | frontmatter `components:` 를 쓸 때 (정확값) |

  **`PREVIEW_TOKEN_ALIASES` 를 빠뜨리면 조용히 0건 비교가 된다** — 드리프트 게이트가 이름을
  못 맞춰 그 항목에 대해 아무것도 검사하지 않는다. `MATCH_FLOOR` 에 `0` 을 적는 것이 거부되는
  이유가 이것이다. `NOTICE` 는 `license-notice-consistency.test.ts` 가 양방향으로 대조해 CI 가
  막고, `BASELINE_TABLE` 의 수치는 `pnpm gate:contrast` 의 실패 출력이 만들어 주며 같은 바이트가
  `docs/preview-contrast-baseline.md` 에도 있어야 한다.

  전부 총계가 아니라 슬러그 단위라 동시에 열린 카탈로그 PR 끼리 서로를 깨지 않는다 — 합계
  하드코딩은 그랬다(#324). **다만 슬러그 단위가 막아 주지 않는 경우가 하나 있다 — 표 자체가
  새로 생길 때다.** 「기여 관례」의 합본 재검증 항을 볼 것.

## Google DESIGN.md 표준 (`pnpm validate:spec`)

Google Labs 가 발행한 DESIGN.md 명세(`github.com/google-labs-code/design.md`, 버전
`alpha`, Apache-2.0)를 **공식 린터로** 판정한다. 룰을 재진술하지 않으므로 명세가 바뀌면
자동 추종된다. 명세 자체를 확인할 일이 생기면 `packages/cli/src/linter/spec-config.yaml`
하나가 단일 진실 원천이고, 산문 요약본들은 서로 어긋나므로 믿지 말 것.

- **본문 섹션 구조는 이미 명세를 만족한다.** 8개 정규 섹션이 전부 optional 이고,
  순서 검사는 명세가 아는 헤딩만 추린다. `Brand & Style` 은 `Overview` 의 공식 별칭이다.
  `Spacing`+`Rounded` 를 `Layout` 하나로 합치지 말 것 — 토큰은 이제 frontmatter
  `spacing:`·`rounded:` 키가 가르므로 추출은 안 깨지지만, `REQUIRED_SECTIONS` 가 두
  헤딩을 모두 요구해 `missing-section` 으로 막힌다.
- **항목의 DESIGN.md 가 변환 없이 그대로 표준 문서다**(ADR 0003·0008). 코퍼스 테스트와
  `validate:spec` 이 커밋된 파일을 그대로 린트한다. 표준 도구용 판을 따로 만들던 어댑터는
  #421 에서 걷었다 — 항목 파일 린트가 그 출력과 같아졌기 때문이다(2026-09-26 실측). 되살리지
  말 것: 어댑터는 항목 파일이 표준에서 멀어진 것을 가려, 파일을 직접 가져간 소비자만 어긋난
  문서를 받게 한다. 태그라인에서 만들던 명세의 `description` 은 그때 함께 잃었다.
- **`validate:draft` 도 같은 공식 린터를 돈다**(스킬의 Stage 6a2/9a2 기계 게이트). 색이 하나도
  해석되지 않으면(`spec-no-colors`), 린터가 스키마로 읽는 모르는 키가 있으면(`spec-schema-key`)
  block 이다. 타입 스케일이 없거나(`spec-no-typography`) 모델 에러 수가
  `KNOWN_SPEC_LIMITATIONS` 의 기록과 다르면(`spec-unrecorded-limitation`) warn 이다 — 둘 다
  CI 코퍼스 테스트가 막는 것을 파이프라인 단계에서 미리 알린다. 기록과 같은 수는 조용하므로
  카탈로그 전수 검사에 소음을 더하지 않는다. `missing-primary` 는 의미 판단이라 코퍼스 테스트의
  목록에만 둔다.
- **`/services/{slug}/DESIGN.md`** 는 `/services/{slug}/llms.txt` 와 **같은 바이트**를 명세의
  파일명으로 낸다. `test:http` 가 두 본문의 동일성을 고정한다. 카탈로그 메타(`slug` ·
  날짜 · `logo`)와 보조 맵(`fonts` · `gradients` 등)도 그대로 실리지만 린터는 문제 삼지
  않는다. 코퍼스 테스트는 본문 펜스가 스키마로 읽힐 때 나는 `unknown-key` ·
  `token-like-ignored` 를 0건으로 고정한다.
- **dev 서버에서는 이 라우트가 404 다.** Vite 미들웨어가 `.md` 요청을 라우터보다 먼저
  가로챈다. nitro 에는 없어 프로덕션은 200 이다 — dev 결과로 "라우트가 깨졌다"고 판단하지
  말 것.
- **카탈로그가 명세보다 표현력이 높은 자리가 둘 있다.** `%` 단위 radius(`50%`)와 다중 스톱
  그라디언트다. 준수하려면 실제 발행값을 버려야 하므로 고치지 않고 기록한다 —
  `src/lib/spec-limitations.ts` 의 `KNOWN_SPEC_LIMITATIONS` 가 슬러그별 개수를 적고, 코퍼스
  테스트가 그것을 **양방향 래칫**으로 고정한다(새 에러도, 조용한 수정도 실패시킨다).
- **`primary` 라는 이름의 토큰을 지어내지 말 것.** 명세가 없으면 경고하지만, 어느 브랜드
  색이 primary 인지는 의미 판단이다. 같은 코퍼스 테스트가 해당 슬러그 목록을 고정해
  둬서, 붙이려면 근거와 함께 명시적으로 해야 한다. 붙일 때의 형식(#381 파일럿):
  - **참조 행 한 줄** `primary: "{colors.x}"` — 값을 리터럴로 복제하지 않는다. 가리킬
    대상은 브랜드가 대표색으로 **발행한** 값이지 시맨틱 fill 역할이 아니다(toss 는
    `fill-brand` 가 아니라 `blue-500`). 대상 토큰 바로 앞에 둔다.
  - **근거는 커밋/PR 본문에** 둔다(인용 번호 + 상류 재확인). 감사 메모 자리가 아니다.
    토큰 줄 주석은 같은 이름의 다른 뜻 토큰(`text-primary` 등)과 가르는 단서가 필요할
    때만 쓴다.
  - 참조 행은 사이드카·`TOKEN_COVERAGE`·`MATCH_FLOOR` 어디에도 안 잡힌다 — 움직이는
    것은 missing-primary 배열 하나다. 그래서 **사이트 Tokens 탭과 `use-design-md` 는
    이 별칭을 못 본다**(DESIGN.md 파일의 frontmatter 에만 있다).
  - `last_updated` 는 올리지 않고 `Skip-Last-Updated` 트레일러를 단다(아래 날짜 항).
- **명세의 `components:` 맵은 파일럿 단계다(#384, teamsparta 만).** 사이드카가 싣지 않으므로
  사이트 Tokens 탭과 `use-design-md` 는 못 보고 DESIGN.md 파일의 frontmatter 에만 있다. 본문
  스펙 펜스(`text`)는 그대로 남는다(중복 발행). 컴포넌트가 하나라도 생기면 린터 규칙 둘이 깨어난다 —
  `orphaned-tokens`(참조되지 않은 색마다)와 `contrast-ratio`(컴포넌트의 배경·글자 쌍). 에러가
  아니라 경고라 게이트는 막지 않는다. 저작 규칙은 #389 가 정한다.

## 감사 메모 (인용 재검증 결과를 문서에 남기는 형식)

기존 항목을 브랜드 발행물과 재대조하면 그 결과를 문서에 남긴다. **형식이 배치마다
달라져 같은 리뷰 질문이 네 번 반복됐으므로**(PR #196·#198·#199) 아래로 고정한다.

- **값과 같은 화면에 둔다.** 대조 결과는 해당 섹션(보통 `## Colors`) **첫머리에**
  `> **<라벨>(YYYY-MM-DD).** …` 블록쿼트로 넣는다. 라벨은 무슨 일이 있었는지
  말하는 짧은 말이면 된다 — `대조 결과`(값이 맞았음), `팔레트 정정`(값을 고침),
  `프로비넌스 정정`(출처 서술을 고침)이 실제로 쓰인 예다. 고정할 것은 **블록쿼트
  · 섹션 첫머리 · 괄호 안 날짜** 세 가지이고, 라벨 문구는 정보를 담는 쪽이 낫다.
  문서 하단으로 몰지 말 것 —
  md를 읽는 사람이 값을 보기 전에 단서를 지나가야 한다. **다만 이 블록쿼트는
  마크다운 독자에게만 닿는다** — `token-extractor`는 frontmatter 토큰 맵의
  `key: value` 행과 그룹을 여는 `## 라벨` 행만 수집하고, 그 밖의 주석줄과 본문 산문은
  버리며, 사이트는 Tokens 탭과 DESIGN.md
  탭이 배타적이다. 기계 소비자에게 caveat를 전하는 건 아래 항의 몫이다.
- **개별 토큰에 걸리는 단서는 그 토큰 줄에 적는다. 이게 소비 경로에 닿는 유일한
  자리다** — 트레일링 주석만 `note` 필드로 `services/*.tokens.json`에 실리고,
  그 사이드카를 사이트 Tokens 탭과 `use-design-md` 스킬이 그대로 읽는다. 값이
  어긋나거나 발행명이 다르면 섹션 블록쿼트에만 적지 말고 반드시 그 줄에도 쓴다.
  **단 hex를 두 개 넣지 말 것** —
  `OKLCH_DEFINITION`이 짝짓기 모호로 그 줄을 통째로 스킵해, 차이를 적으려던
  주석이 그 토큰만 기계 검증에서 빼버린다. 두 번째 값이 필요하면 바로 위 순수
  `#` 주석 줄에 둔다(그 줄은 토큰 정의가 아니라 스킵 대상이 아니다).
- **섹션당 감사 메모는 하나. 재감사하면 덮어쓴다.** 새 결과를 아래에 덧붙이지
  말 것 — 그러면 이 규칙이 막으려던 감사 로그 누적이 섹션 첫머리에서 그대로
  재현된다. 이전 결과는 git 히스토리에 남으므로 문서에 쌓을 이유가 없다.
- **날짜는 조회해서 쓴다.** 세션 도중 본 타임스탬프를 기억으로 적지 말 것 —
  실제로 며칠 어긋난 사례가 있다. 문서를 편집하면 `last_updated`도 함께 올린다
  (sitemap `lastmod`·RSS 정렬·홈 Updated 뱃지를 구동한다).
  **날짜는 KST 기준이고 게이트도 그렇다** — `check-last-updated`가 `%as`(author의
  로컬 프레임)로 비교한다. 반면 `gh pr view --json commits`의 `authoredDate`와
  GitHub UI는 UTC로 정규화해 보여 주므로, **KST 저녁 커밋은 하루 이르게 보인다.**
  리뷰가 이것을 "기억으로 적은 날짜" 로 오인한 적이 세 번 있다(PR #282·#289·#290).
  raw 오프셋으로 가른다: `git log -1 --format='%ad' --date=format:'%Y-%m-%d %z'`.
  **이 항은 `check:last-updated`가 block으로 강제한다** — 브랜치가 바꾼
  `services/*.md`의 `last_updated`가 그 파일을 바꾼 커밋의 작성일보다 이르면
  실패한다. 값을 비교하므로 같은 날 후속 편집(이미 그 날짜면)은 통과하고,
  반대로 "올리긴 했는데 이틀 어긋난 날짜"는 잡힌다 — 히스토리 재생에서 둘 다
  실제로 나왔다. 카탈로그 전수가 아니라 **바꾼 파일만** 보므로, 손대지 않은
  항목의 낡은 날짜가 무관한 PR을 막지 않는다. 카탈로그 전반을 훑는 기계적 편집
  (가드레일 문구 삽입 같은)은 커밋 메시지에 `Skip-Last-Updated: <이유>` 트레일러로
  면제한다(DCO 서명과 같은 형식) — 그런 편집으로 전 항목을 RSS 상단에 올리는 건
  잘못된 신호다. **값을 바꾸지 않는 명세 역할 별칭 추가**(`primary` 참조 행)도 같은
  이유로 면제 대상이다 — 파일 수가 적어도 브랜드 발행값이 그대로라 독자가 추적할
  변경이 아니다. **본문 스펙을 참조로만 옮겨 싣는 `components:` 맵**(#384)도 같다 —
  값은 이미 본문에 있고 새 값이 아니다. 면제해도 위반 목록은 그대로 출력되니 리뷰가 볼 수 있다. **squash
  머지면 트레일러가 squash 메시지에 남아야 한다** — main push 에서는 게이트가
  squash 커밋 하나만 본다.
- **References 항목 설명에는 소스의 성격만.** "이 URL은 JS 셸이라 렌더해야
  읽힌다", "값은 여기가 아니라 [src:N]에 있다" 같은 **정적 사실**은 쓴다.
  같은 문서의 다른 출처를 `[src:N]`으로 가리키는 상호 참조도 허용한다(셸 URL과
  그 데이터 엔드포인트를 짝지어야 하는 경우가 반복된다). 재감사할 때마다 늘어나는
  "N차 확인" 이력은 쓰지 말 것 — 그건 커밋 메시지와 PR 설명의 몫이다.
- **md와 상류의 값이 어긋나면 어느 쪽을 정본으로 삼을지는 따로 정해져 있다.**
  `preview-prose-audit` 스킬의 **"다만 상류가 늘 이기는 건 아니다"** 항이 그
  기준이다 — 그 항은 프리뷰 감사에서 나왔지만 **판정 기준 자체는 카탈로그
  전반의 값 대조에 적용된다.**
- **상대평가를 쓰지 말 것.** "카탈로그에서 가장 …한 항목" 류는 다른 문서가 바뀌면
  조용히 거짓이 된다. 그 자리에서 참거짓을 확인할 수 있는 측정값으로 쓴다.

**`## Known Gaps`의 날짜 붙은 불릿은 여기 해당하지 않는다.** 위 규칙은 *"이 값을
언제 무엇과 대조했는가"*를 값 옆에 남기는 감사 메모용이다. Known Gaps는 성격이
다르다 — 아직 메워지지 않은 공백과 철회된 주장을 모아 두는 **상시 목록**이라,
`- **철회된 부재 주장 2건 (YYYY-MM-DD)** — …` 같은 불릿이 제 형식이다
(baemin·seed-design·wanted가 그 예). 둘을 한 형식으로 몰지 말 것.

**소급 범위:** 규칙 도입 시점(2026-08-02)에 값 옆 감사 메모가 있던 8개 항목
(bezier · class101 · codeit · gmarket · line-design-system · socar · vapor-ui · yeogi)은
전부 이 형식으로 맞춰 두었다. 즉 **예외 없음** — 앞으로 형식이 다른 감사 메모를
보면 구버전이 아니라 규칙 위반이니 고치면 된다.

**기계로 검사되는 부분:** 이 감사 메모 규약에 대해 `validate:catalog`가 warn 세
가지를 낸다 — `audit-note-placement`(섹션 첫 문단이 아님) ·
`audit-note-duplicate`(섹션당 2개 이상) · `reference-audit-stamp`(References
항목의 `(YYYY-MM-DD 확인)` 스탬프). **셋은 이 절의 규약에 대한 것이고
`validate:catalog` 전체의 warn 목록이 아니다** — 검증기는 그 밖에도
`oklch-hex-mismatch` · `hex-in-prose` · `duplicate-token-value` 등을 낸다.
`check:last-updated`는 별도 게이트이고 warn이 아니라 **block**이다
(위 "날짜는 조회해서 쓴다" 항).

**린트는 메모를 형태로 인식한다** — `> **<라벨>(YYYY-MM-DD).**`에 맞는 줄만
감사 메모로 센다. 그래서 형태가 어긋난 메모(블록쿼트가 아니거나 날짜가 괄호 밖)는
**잡히는 게 아니라 아예 안 보인다.** 위치·중복 검사도 같이 건너뛴다. 형태 자체는
여전히 리뷰가 봐야 하고, 라벨이 정보를 담는지 · 날짜가 실제 조회일인지 ·
`last_updated`를 올렸는지 · 상대평가를 썼는지 · 개별 토큰 단서를 그 토큰 줄에
적었는지도 마찬가지다.

## 프리뷰 HTML

- 검증 폭: **375 / 768 / 976(상세페이지 임베드 폭 — 역사적 사각지대) / 1440**.
  오버플로우는 중간 다열 폭에서 숨는다 — 375px만 보고 통과 판정 금지.
- 가드 요지: content 트랙은 `minmax(0, 1fr)`(bare `1fr` 금지), 다열 grid는 @media
  collapse 필수, 고정폭 자식을 감싼 flex/grid 아이템에 `min-width: 0`, 원자적 컨트롤
  그룹(segmented 등)은 `max-width: 100%` + `min-width: 0`.
- 컬러 표면 위 텍스트는 `var(--primary-foreground)` 계열 토큰 — 흰색 하드코딩 시
  다크 모드에서 대비 붕괴.
- 사이트 chrome은 라이트 고정; `[data-theme="dark"]`는 프리뷰 iframe 전용.

## 프리뷰 산문 감사 — 판정 근거의 등급

프리뷰 산문이 `services/*.md`가 뒷받침하지 않는 주장을 하는지 대조할 때, **그
판정에는 근거 등급이 있고 낮은 등급을 근거로 쓰면 프리뷰를 망가뜨린다.**

- ❌ **"md에 없음"은 결함의 근거가 아니다.** 번들을 거친 항목의 md는 프리뷰와 같은 번들에서 갈라진
  **손실 전사**라, md의 침묵은 "프리뷰가 지어냈다"가 아닌 경우가 많다.
- ✅ **"md 또는 상류가 반증함"만 결함이다.**
- **상류를 확인 못 하면 판정하지 말 것** — 유보로 남긴다(상류를 열어 보지 못했다고 적는다).

전체 절차(상류 확인법 · 슬러그별 상류 판정표 · 되돌리기가 남긴 판정 규칙 · 이 규칙을
낳은 사고 이력)는 `.claude/skills/preview-prose-audit/SKILL.md` 에 있다.
**프리뷰 산문을 고치기 전에 반드시 읽을 것.**

## 기여 관례

- 커밋은 DCO 서명: `git commit -s`. PR 템플릿 참고.
- **여러 줄 문서·커밋 메시지는 인용 구분자 heredoc으로 넘긴다** — `cat > f <<'EOF'`.
  `node -e "…"`나 `printf`에 큰따옴표로 넘기면 **백틱 안 내용을 셸이 명령 치환해
  통째로 날린다.** 인라인 코드 스팬이 빈 자리로 남아 문장이 깨지고, diff만 봐서는
  잘 안 보인다(2026-08-15에 두 번 났다). PowerShell here-string `@'…'@`을 Bash에
  쓰면 리터럴 `@`가 박히는 것도 같은 계열이다.
- 변경 파일은 prettier 포맷 준수 (`pnpm format:check`가 CI 게이트). 무관 파일 대량
  재포맷은 별도 `style:` PR로 분리.
- **머지 직전 `origin/main`을 가져와 합본 상태에서 게이트를 다시 돌린다** —
  `git fetch origin && git merge origin/main --no-commit --no-ff` → 게이트 → `git merge --abort`.
  PR 단위 CI 는 각 브랜치를 **자기 base** 에서 돌리므로 둘 다 green 인데 합치면 깨지는 경우를
  원리적으로 못 잡는다. 슬러그별 표를 쓰는 것이 이 위험을 줄이지만 지우지는 않는다 —
  표가 **늘어나는** 경우가 남기 때문이다. 실제로 #390 이 슬러그당 4행짜리 대비 기준선 표를
  새로 세웠고, 머지 순서가 반대였다면 같은 주에 열려 있던 카탈로그 PR 이 행 없이 착지해
  main 을 깨뜨렸을 것이다(합본에서 테스트 파일 69→76 · 1187→1327개). "순서를 조율한다"는
  해법이 아니고, **나중에 머지하는 브랜치가 수정을 싣는다.**
- `.claude/skills/design-md/` 변경은 영향이 크므로 이슈에서 사전 합의. 스킬↔검증기
  배선은 `src/lib/design-md-skill-*.test.ts` 계약 테스트가 고정한다 — 스킬 프롬프트를
  수정하면 이 테스트도 함께 갱신. 테스트가 읽는 `.claude/` 경로는 전부
  `src/lib/skill-asset-paths.ts` 한 곳에 **리터럴 그대로** 모여 있다(조립기로 바꾸지
  말 것 — 목록이 보이는 것 자체가 계약이다). 스킬을 추가하면 같은 파일의
  `PUBLIC_SKILLS`·`INTERNAL_SKILLS` 중 하나에 선언한다 — `skill-distribution.test.ts`가
  디렉터리·`metadata.internal`·`marketplace.json`을 대조해 선언이 없으면 막는다.
  **공개/내부를 디렉터리로 가르지 않는 이유**: skills.sh 가 로컬·원격 모두
  `.claude/skills/`를 스캔하므로 옮겨도 디스커버리는 그대로이고, 잃는 것(이 저장소
  안에서의 사용성·외부 링크)만 있다.
- **`.claude/skills/use-design-md/SKILL.md` 는 사이트 빌드의 소스이기도 하다.**
  `src/lib/agent-skill-index.ts` 가 이 파일을 `?raw` 로 import 해
  `/.well-known/agent-skills/use-design-md/SKILL.md` 로 그대로 서빙하고,
  같은 바이트의 SHA-256 을 `/.well-known/agent-skills/index.json` 이 발행한다
  (skills.sh·플러그인 마켓플레이스와 같은 파일을 쓰므로 세 채널이 갈라질 수 없다).
  그래서 **본문 한 글자만 바뀌어도 발행 digest 가 바뀌는 것이 정상**이다 — 드리프트가
  아니다. 다만 frontmatter 는 `name:`·`description:` 을 **한 줄 스칼라로 유지**할 것.
  `description: >` 같은 YAML block scalar 로 바꾸면 추출기가 접기 지시자 한 글자를
  값으로 읽는다. **이걸 막는 건 `pnpm build` 가 아니라 `pnpm test` 다** —
  `skillMeta()` 는 요청 시점에만 돌아서 빌드는 그대로 통과하고, 배포되면 그 엔드포인트가
  500 을 낸다. `agent-skill-index.test.ts` 가 frontmatter 모양을 고정해 CI 에서 먼저
  잡는다.

## Windows 로컬 주의

- `pnpm format:check`가 로컬에서만 실패하면 CRLF 체크아웃 오탐일 수 있다 — **CI 결과가
  진실**이며, 해당 파일을 재포맷해 커밋하지 말 것. **판별은 `git ls-files --eol`의 `i/`
  열이 아니라 `w/` 열로 한다.** `i/lf`는 인덱스가 LF라는 뜻일 뿐 작업 트리를 보증하지
  않는다 — 인덱스는 저장소 전체가 `i/lf`인데도(아래 항의 `.gitattributes`), 워크트리를
  만든 도구에 따라 체크아웃 당시의 파일이 `w/crlf`로 남은 사례가 있다(git이 이후 다시 쓴
  파일은 LF로 돌아온다). `git ls-files --eol | grep w/crlf`에 나온 파일은 지우고
  `git checkout -- <파일>`로 되살리면 된다 — 인덱스가 LF라 내용 손실이 없다. `w/crlf`가
  0개인데도 실패하면 오탐으로 넘기지 말고 진짜 포맷 위반으로 다룰 것.
- `pnpm tokens:check`는 사이드카를 **바이트 단위로** 비교하므로 같은 원인의 오탐이
  난다 — 사이드카 `services/*.tokens.json`이 `w/crlf`이면 내용이 같아도 "out of sync"를
  낸다(md 쪽 CRLF는 판정에 영향이 없다). `.gitattributes`의 `* text=auto eol=lf`가
  로컬 `core.autocrlf=true`를 덮어써 보통은 LF로 체크아웃되지만, 위 항과 같이 그게
  작업 트리를 보증하지는 않는다. 그러니 실패하면 **먼저 위 항의 `w/crlf` 판별과 복구를
  하고**, 그래도 실패하면 진짜 drift이니 안내대로 `pnpm tokens:build <slug>…`를 실행하고
  결과를 커밋할 것.

## Agent skills

### Issue tracker

이슈는 GitHub Issues(`CaesiumY/ko-design-md`)에 있고 `gh` CLI 로 다룬다. 자세한 것은 `docs/agents/issue-tracker.md`.

### Triage labels

기본 5종(`needs-triage` · `needs-info` · `ready-for-agent` · `ready-for-human` · `wontfix`)을 그대로 쓴다. 자세한 것은 `docs/agents/triage-labels.md`.

### Domain docs

single-context — 루트 `CONTEXT.md`(용어집) + `docs/adr/`(결정 기록). 둘 다 `/domain-modeling` 이 갱신한다. 자세한 것은 `docs/agents/domain.md`.
