# ko-design-md

한국 브랜드의 디자인 시스템을 Stitch v0.1 마크다운(`services/{slug}.md`)으로 정리한 오픈 카탈로그.
TanStack Start 사이트(getdesign.kr)가 이를 서빙하고, `/design-md` 스킬(.claude/skills/design-md)이
새 항목 온보딩 파이프라인을 자동화한다. 패키지 매니저는 **pnpm** (npm 금지).

## 검증 커맨드 (CI 게이트와 동일)

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test               # vitest — .claude/ 하위는 제외됨
pnpm validate:catalog   # services/*.md 전수: frontmatter·섹션 순서·OKLCH·인용 무결성
pnpm validate:previews  # public/preview/*/ 전수: 구조 block + 반응형 휴리스틱 warn
pnpm tokens:check       # services/*.tokens.json 이 소스 md 와 일치하는지 (drift 게이트)
pnpm audit:oklch        # OKLCH↔병기 hex 일치 + 프리뷰가 md 정의와 어긋나지 않는지
pnpm check:last-updated # 이 브랜치가 바꾼 services/*.md 의 last_updated 가 최신인지
pnpm validate:spec      # Google DESIGN.md 명세 준수 (공식 린터 @google/design.md)
pnpm build              # build:og + vite build
```

단일 파일 검사: `pnpm validate:draft <file.md> [--slug X --expected-logo <url> --lang ko]`,
`pnpm validate:previews --slug <slug> --verbose`. 스킬 파이프라인은 이 검증기를
author→reviewer 사이 기계 게이트(Stage 6a2/9a2)로 실행한다.

## 카탈로그 정책 (위반은 CI가 block)

- **토큰은 frontmatter 에 산다.** `colors:` · `typography:` · `spacing:` · `rounded:`
  맵이 Google DESIGN.md 형태다. 이 네 섹션의 본문 yaml 펜스는 폐기된 형태로, 추출기가
  폴백으로만 읽는다 — 카탈로그 17개 전부 이전돼 **토큰 섹션의 펜스는 0개**다.
  그룹은 `  ## 라벨` 주석 행이 열고(사이드카 `group`), 토큰별 단서는 그 줄의 트레일링
  `#` 주석이 나른다(사이드카 `note` — 기계 소비자에게 닿는 유일한 경로).
- **다만 본문 펜스가 전부 사라진 건 아니다.** 39개가 남아 있고 **의도된 것**이다 —
  `## Elevation & Depth` 의 shadow 22개 · `## Components` 의 스펙 16개 · `## Motion` 1개.
  사이드카(`ServiceTokens`)에도 스펙의 토큰 맵에도 이들을 담을 자리가 없어서 본문에
  남는다. 이게 어댑터를 유지하는 이유이기도 하다 — `wanted` 의 컴포넌트 펜스는 0열
  `height:` 행을 갖고, 린터가 그걸 최상위 스키마 섹션 중복으로 읽어 문서 전체를
  실패시킨다. 어댑터가 본문 펜스를 걷어내므로 `/services/{slug}/DESIGN.md` 는 통과한다.
- **색상 토큰 값은 OKLCH만.** frontmatter `colors:` 맵의 `name: oklch(...)` 형식. 원본 hex는
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
- **frontmatter `sources` == `## References` (순서·내용 동일).** 이 중복은 의도된
  자기완결 포맷이다 — 제거하거나 한쪽만 고치지 말 것. 인용은 `[src:N]` 정수 인덱스.
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

## Google DESIGN.md 표준 (`pnpm validate:spec`)

Google Labs 가 발행한 DESIGN.md 명세(`github.com/google-labs-code/design.md`, 버전
`alpha`, Apache-2.0)를 **공식 린터로** 판정한다. 룰을 재진술하지 않으므로 상류가 바뀌면
자동 추종된다. 명세 자체를 확인할 일이 생기면 `packages/cli/src/linter/spec-config.yaml`
하나가 단일 진실 원천이고, 산문 요약본들은 서로 어긋나므로 믿지 말 것.

- **본문 섹션 구조는 이미 명세를 만족한다.** 8개 정규 섹션이 전부 optional 이고,
  순서 검사는 명세가 아는 헤딩만 추린다. `Brand & Style` 은 `Overview` 의 공식 별칭이다.
  `Spacing`+`Rounded` 를 `Layout` 하나로 합치지 말 것 — 토큰은 이제 frontmatter
  `spacing:`·`rounded:` 키가 가르므로 추출은 안 깨지지만, `REQUIRED_SECTIONS` 가 두
  헤딩을 모두 요구해 `missing-section` 으로 막힌다.
- **원문 md 는 이제 17개 중 16개가 그대로 린트된다.** 토큰이 frontmatter 로 옮겨가
  스펙 파서가 실제로 해석한다(이전에는 17개 전부 0토큰이었다). 남은 하나가 `wanted`
  인데, `## Components` 의 펜스 5개가 각각 0열 `height:` 를 갖고 린터가 그걸 스키마
  섹션 중복으로 읽어 문서 전체를 실패시킨다. **그래서 어댑터
  (`src/lib/google-designmd-adapter.ts`)를 유지한다** — 본문 펜스를 걷어내 17개 전부
  통과시키고 사이드카에서 렌더한다. "md 자체가 스펙 문서" 는 16/17 에서만 참이므로
  어댑터 제거 결정은 실측으로 철회됐다.
- **`/services/{slug}/DESIGN.md`** 가 그 결과를 서빙한다. `llms.txt` 와 같은 라우트 패턴
  으로 요청마다 계산하므로 저장되는 사본이 없다. `llms.txt` 를 대체하지 않는다 — 인용
  `[src:N]` 과 프로비넌스는 표준 스키마에 자리가 없어 그쪽에만 남는다.
- **dev 서버에서는 이 라우트가 404 다.** Vite 미들웨어가 `.md` 요청을 라우터보다 먼저
  가로챈다. nitro 에는 없어 프로덕션은 200 이다 — dev 결과로 "라우트가 깨졌다"고 판단하지
  말 것.
- **카탈로그가 명세보다 표현력이 높은 자리가 둘 있다.** `%` 단위 radius(`50%`)와 다중 스톱
  그라디언트다. 준수하려면 실제 발행값을 버려야 하므로 고치지 않고 기록한다 —
  `src/lib/google-designmd-corpus.test.ts` 의 `KNOWN_SPEC_LIMITATIONS` 가 슬러그별 개수를
  **양방향 래칫**으로 고정한다(새 에러도, 조용한 수정도 실패시킨다).
- **`primary` 라는 이름의 토큰을 지어내지 말 것.** 명세가 없으면 경고하지만, 어느 브랜드
  색이 primary 인지는 의미 판단이다. 같은 코퍼스 테스트가 현재 14개 슬러그 목록을 고정해
  둬서, 붙이려면 근거와 함께 명시적으로 해야 한다.

## 감사 메모 (인용 재검증 결과를 문서에 남기는 형식)

기존 항목을 공개 원본과 재대조하면 그 결과를 문서에 남긴다. **형식이 배치마다
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
  잘못된 신호다. 면제해도 위반 목록은 그대로 출력되니 리뷰가 볼 수 있다.
- **References 항목 설명에는 소스의 성격만.** "이 URL은 JS 셸이라 렌더해야
  읽힌다", "값은 여기가 아니라 [src:N]에 있다" 같은 **정적 사실**은 쓴다.
  같은 문서의 다른 출처를 `[src:N]`으로 가리키는 상호 참조도 허용한다(셸 URL과
  그 데이터 엔드포인트를 짝지어야 하는 경우가 반복된다). 재감사할 때마다 늘어나는
  "N차 확인" 이력은 쓰지 말 것 — 그건 커밋 메시지와 PR 설명의 몫이다.
- **md와 상류의 값이 어긋나면 어느 쪽을 정본으로 삼을지는 따로 정해져 있다.**
  아래 「프리뷰 산문 감사 — 판정 근거의 등급」의 **"다만 상류가 늘 이기는 건 아니다"**
  항이 그 기준이다 — 그 항은 프리뷰 감사에서 나왔지만 **판정 기준 자체는 카탈로그
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

프리뷰 캡션이 `services/*.md`가 뒷받침하지 않는 주장을 하는지 사람이 대조하는
작업이 이어져 왔다(`docs/superpowers/specs/*-preview-prose-audit-*`). **그 판정에는
근거 등급이 있고, 낮은 등급을 근거로 쓰면 프리뷰를 망가뜨린다.**

- ❌ **"md에 없음"은 결함의 근거가 아니다.** md와 프리뷰는 **둘 다 같은 Claude
  Design 핸드오프 번들에서 갈라졌고**, md는 컴포넌트 상태·수치·변형명을 상당 부분
  옮기지 않은 **손실 전사**다. md의 침묵은 "프리뷰가 지어냈다"가 아니라 "md가 안
  적었다"인 경우가 많다.
- ✅ **"md 또는 상류 원본이 반증함"만 결함이다.** 값이 다르거나, 다른 컴포넌트의
  값을 귀속했거나, 원본에 그 이름이 없을 때.

**상류를 확인하는 법**: `DesignSync` MCP(`list_projects` → `list_files` →
`get_file`)로 슬러그별 Claude Design 프로젝트를 읽는다. 거의 모든 카탈로그 항목에
대응 프로젝트가 있다.

**다만 번들이 상류인 것은 md가 번들에서 나왔을 때뿐이다.** md가 브랜드 공개 문서·
오픈소스 저장소·npm 패키지에서 직접 만들어졌다면 **그것들이 상류이고 번들은 형제**다 —
같은 출처에서 갈라진 또 하나의 재구성물이라 md를 뒤엎을 권위가 없다. **md의 sources를
먼저 보라**: 번들을 가리키지 않고 공개 URL만 열거하면 이 경우다.

| 슬러그 | 상태 |
| --- | --- |
| `seed-design` | 번들 **없음** — 공개 문서와 npm 패키지에서 직접 만들었다 |
| `class101` | 번들 **있으나 상류 아님** — 번들 README가 스스로를 *"a faithful recreation of CLASS101's open-source Vibrant Design System"* 이라 적고, 출처로 크롤 코퍼스 58쪽 · `vibrant-design.com` · `github.com/pedaling/opensource`(MIT)를 든다. md도 같은 공개 출처 48개를 인용 190개로 쓴다 — **둘이 형제다.** 판정은 공개 문서·오픈소스 코드로 한다 |
| `vapor-ui` | 번들에서 **만들었으나 이미 뒤집혔다** — md 머리말이 번들을 1차 출처로 밝히지만 sources 5개는 전부 공개(`vapor-ui.goorm.io` · goorm 블로그 · Figma Community · npm · 공개 저장소 `goorm-dev/vapor-ui`). 번들값이 **공개 발행값과 크게 어긋나** `## Colors` 110개를 npm `@vapor-ui/core` 1.3.0 값으로 전량 교체했고(md `:35`), `## Components`도 같은 이유로 상류 미대조 판정을 받았다(`13px`·무게 `600`·`vp-*` 클래스가 배포본 553파일에 0건). **번들이 아니라 npm 배포본과 공개 저장소로 판정한다** |

**이 표는 발견되는 대로 늘어난다** — 새 슬러그를 감사하기 전에 md의 sources를 먼저
확인하고, 번들이 상류가 아니면 여기에 적을 것.

**`DesignSync`를 못 쓰면 판정하지 말 것.** 이 규칙은 상류 확인을 요구하는데 그 MCP는
모두에게 열려 있지 않다. 대안 경로는 두 가지다 — 슬러그의 크롤 캐시
(`.claude/cache/design-md/<slug>/`, gitignore됨)와 브랜드가 실제로 발행한 공개 문서.
**셋 다 없으면 결함으로 올리지 말고 "상류 미확인"으로 남긴다.** 확인할 수 없는 것을
"md에 없으니 결함"으로 처리하는 것이 바로 이 절이 막으려는 오류다.

상류가 프리뷰를 뒷받침하는데 md가 비어 있으면 **고칠 것은 프리뷰가 아니라 md다.**

**다만 상류가 늘 이기는 건 아니다.** 이 규칙이 상류를 앞세우는 이유는 md가 번들의
**손실 전사**이기 때문이다 — **그 관계가 성립하지 않으면 적용되지 않는다.** 번들도
재구성물이라 브랜드 발행물과 어긋날 수 있다. 상류를 확인했는데 md와 다르면 **어느
쪽이 브랜드 발행물에 더 가까운가**로 가른다.

**단, 그 판단은 브랜드 발행물을 직접 열어서 한다.** md가 "공개 문서와 대조했다"고
적어 둔 것만으로는 부족하다 — 그건 md의 **자기 서술**이고, 이 문서의
「인용은 존재가 아니라 내용 일치」 원칙이 바로 그것을 검사 대상으로 삼는다.
**md의 주장을 근거로 md를 신뢰하면 순환이다.** 인용된 URL을 열어 값을 세어 보고,
확인하지 못하면 어느 쪽도 정본으로 삼지 말고 유보한다.

> **사례 (wanted 타입 스타일 수).** 번들 README는 `18`, md는 `19`로 적는다.
> **`[src:5]`(몽타주 공식 타이포그래피 문서)를 직접 열어 세었더니 19개**였고 md의
> 표와 이름까지 일치했다. 즉 **번들 README가 브랜드 발행물과 어긋난 경우**이고,
> "상류 우선"만 기계적으로 적용하면 브랜드 공식값을 버리고 번들값으로 되돌리게 된다.
> 스타일 이름 전수와 확인 경위는 대장의 wanted 절이 갖는다 — **여기에 복제하지 말 것.**

> **이 규칙은 사고 후에 생겼다.** 2026-08-06 전수 조사에서 착지한 산문 정정
> **84건 중 33건만 정당**했다. 나머지 50건을 반증 검증에 걸어 30건이 오탐으로
> 확증, 19건 기각, 1건 미판정이 나왔다. **되돌리기를 집행하며 기각도 재검토하고
> 있어 확증 수는 움직인다** — 슬러그별 최신 판정과 근거는 건별 대장
> `docs/superpowers/specs/2026-08-07-preview-prose-audit-false-positive-ledger.md`
> 를 볼 것.
> 대표 사례: kyobobook의 `State — hover`를 "md에 hover가 0건"이라며 `pressed`로
> 바꿨는데 원본에 `<span>Hover</span>`와 `.primary.hover{background:blue-800}`이
> 그대로 있었다. greeting은 `Drawer` 카드를 `Side panel`로 **개명**했는데 원본에
> `Drawer.jsx`·`drawer.card.html`·`Drawer.prompt.md`가 있다.
>
> **봇 리뷰 3~4라운드가 이 오류를 전부 통과시켰다** — 리뷰어도 md만 근거로 삼아
> 같은 전제를 공유했기 때문이다. 같은 전제를 공유한 검증은 그 전제를 검사하지
> 못한다. 값을 고치는 것보다 **이름을 바꾸는 정정이 더 위험하다** — 값은 틀리면
> 눈에 띄지만 이름은 굳어져 다음 감사가 그걸 정본으로 삼는다.

**미해소 부채**: 확증된 오탐을 되돌리는 중이다. **어디까지 됐는지는 위 대장이
슬러그별로 기록한다** — 이 문서에 PR 번호와 착지 여부를 적으면 금세 낡는다. 이 계열을
이어받는다면 **새 감사보다 되돌리기가 먼저다.** 어느 슬러그가 되돌리기 대상이고
어느 것이 미감사인지도 대장이 갖는다 — **여기에 슬러그를 나열하지 말 것.** PR 번호와
같은 이유로 낡는다(이 절을 쓰는 동안 `gmarket`·`vapor-ui` 가 "미감사" 에서
"되돌리기 대상" 으로 옮겨 갔다).

## 기여 관례

- 커밋은 DCO 서명: `git commit -s`. PR 템플릿 참고.
- **여러 줄 문서·커밋 메시지는 인용 구분자 heredoc으로 넘긴다** — `cat > f <<'EOF'`.
  `node -e "…"`나 `printf`에 큰따옴표로 넘기면 **백틱 안 내용을 셸이 명령 치환해
  통째로 날린다.** 인라인 코드 스팬이 빈 자리로 남아 문장이 깨지고, diff만 봐서는
  잘 안 보인다(2026-08-15에 두 번 났다). PowerShell here-string `@'…'@`을 Bash에
  쓰면 리터럴 `@`가 박히는 것도 같은 계열이다.
- 변경 파일은 prettier 포맷 준수 (`pnpm format:check`가 CI 게이트). 무관 파일 대량
  재포맷은 별도 `style:` PR로 분리.
- `.claude/skills/design-md/` 변경은 영향이 크므로 이슈에서 사전 합의. 스킬↔검증기
  배선은 `src/lib/design-md-skill-*.test.ts` 계약 테스트가 고정한다 — 스킬 프롬프트를
  수정하면 이 테스트도 함께 갱신.

## Windows 로컬 주의

- `pnpm format:check`가 로컬에서만 실패하면 CRLF 체크아웃 오탐일 수 있다 — **CI 결과가
  진실**이며, 해당 파일을 재포맷해 커밋하지 말 것. (현재 `.claude/skills/docs-crawler/`
  하위 파일들이 이 경우다.)
- 반대로 `pnpm tokens:check`는 사이드카를 **바이트 단위로** 비교하지만 이 오탐이 없다 —
  `.gitattributes`의 `* text=auto eol=lf`가 로컬 `core.autocrlf=true`를 덮어써
  `services/`가 어느 플랫폼에서도 LF로 체크아웃되기 때문. 즉 **실패하면 진짜 drift이니
  안내대로 `pnpm tokens:build <slug>…`를 실행하고 결과를 커밋할 것.**
- 테스트는 `.claude/` 하위(잔여 worktree 포함)를 제외하도록 설정돼 있다
  (vite.config.ts `test.exclude`).
