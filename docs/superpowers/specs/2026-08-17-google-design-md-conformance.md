# Google DESIGN.md 표준 준수 감사 (2026-08-17)

**질문**: 카탈로그 17개 항목이 Google 이 발행한 DESIGN.md 표준을 충족하는가.

**답**: 섹션 구조는 처음부터 충족했다. 실제 갭은 하나였고 — 기계가 읽는 토큰 레이어가
통째로 비어 보였다 — 어댑터로 해소했다. 남은 미충족 17건은 **카탈로그가 명세보다
표현력이 높은** 경우이며, 준수하려면 브랜드 발행값을 버려야 하므로 고치지 않는다.

판정은 전부 **공식 린터**(`@google/design.md@0.4.0`, Apache-2.0)로 했다.
재현: `pnpm validate:spec`.

## 표준이 실제로 요구하는 것

1차 출처는 명세 저장소의 `packages/cli/src/linter/spec-config.yaml` **한 파일**이다.
섹션·별칭·타입·룰이 전부 여기서 파생된다. **산문 요약본은 믿지 말 것** — 조사 중 만난
2차 자료들이 "9개 섹션" 과 "8개 섹션" 으로 서로 어긋났다.

정규 섹션 8개, **전부 optional**:

| # | 정규명 | 별칭 | 카탈로그 대응 |
| --- | --- | --- | --- |
| 1 | `Overview` | `Brand & Style` | ✅ 별칭 정확 일치 |
| 2 | `Colors` | — | ✅ |
| 3 | `Typography` | — | ✅ |
| 4 | `Layout` | `Layout & Spacing` | `Spacing` + `Rounded` 로 **의도적 분리** |
| 5 | `Elevation & Depth` | `Elevation` | ✅ |
| 6 | `Shapes` | — | ✅ |
| 7 | `Components` | — | ✅ |
| 8 | `Do's and Don'ts` | — | ✅ |

린트 룰은 11개이고 **`error` 는 `broken-ref` 하나뿐**, 나머지는 warning/info 다.

두 가지가 판정을 크게 바꿨다.

- **섹션 누락은 룰이 아니다.** `missing-sections` 는 본문 헤딩이 아니라 frontmatter 의
  `spacing`/`rounded` 토큰 맵이 비었는지를 info 로 볼 뿐이다.
- **순서 검사는 아는 헤딩만 추린다.** `Spacing`·`Rounded`·`References`·
  `Responsive Behavior`·`Known Gaps` 는 조용히 무시된다.

→ **`## Layout` 이 없는 것은 결함이 아니고**, 17개 전부가 순서까지 통과한다.

## 진짜 갭 — 토큰이 frontmatter 에 없었다

명세는 토큰을 **frontmatter** (`colors`/`typography`/`spacing`/`rounded`/`components`)
에 둔다. 카탈로그는 본문 ```yaml 펜스에 두고 frontmatter 는 사이트 메타데이터를 담는다.
겹치는 키는 `name` 하나뿐이다(명세의 유일한 required 필드라 이미 충족).

결과적으로 공식 린터가 카탈로그를 읽으면 **디자인 시스템이 "빈 것"** 으로 보였다 —
토큰 0개. 토큰 기반 룰 5개가 전부 공회전했다. 즉 조사 전의 "깨끗한 린트 결과" 는
합격이 아니라 **무판정**이었다.

### md 를 고쳐서는 해결되지 않는다 (실측)

린터는 본문 yaml 펜스를 **최상위 스키마 키로 파싱한다.** 값이 맵인 행마다
`token-like-ignored` 가 붙는다(toss 한 항목에서 13건).

frontmatter 에 같은 토큰을 선언해도 **그 경고는 남는다.** 합성 문서로 확인했다 —
`typography:` 를 넣으면 토큰은 모델에 잡히지만(`typography=2`) 펜스발 경고 2건은 그대로다.

→ **사람이 쓰는 펜스를 유지하는 한 `services/*.md` 는 clean lint 가 나오지 않는다.**
펜스는 원본이라 지울 수 없다. 그래서 md 를 고치는 대신
`src/lib/google-designmd-adapter.ts` 가 명세가 서술하는 모양(토큰은 frontmatter, 근거는
산문, 펜스 제거)으로 렌더하고, `/services/{slug}/DESIGN.md` 가 그 결과를 서빙한다.

## 전수 판정

`pnpm validate:spec` 실측. 토큰 열은 어댑터가 해석시킨 개수(colors/typography/spacing/rounded).

| 슬러그 | 토큰 (c/t/s/r) | error | warning | 판정 |
| --- | --- | ---: | ---: | --- |
| `11st` | 33/12/20/8 | 1 | 0 | 명세 한계 |
| `baemin` | 37/12/12/9 | 1 | 0 | 명세 한계 |
| `bezier` | 43/12/12/11 | 1 | 1 | 명세 한계 |
| `class101` | 34/21/0/7 | 0 | 0 | **충족** |
| `codeit` | 166/19/29/18 | 0 | 1 | **충족** |
| `gmarket` | 89/7/9/7 | 0 | 1 | **충족** |
| `greeting` | 65/22/0/7 | 0 | 1 | **충족** |
| `krds` | 55/12/11/6 | 0 | 1 | **충족** |
| `kyobobook` | 56/8/16/7 | 0 | 1 | **충족** |
| `line-design-system` | 24/10/9/8 | 1 | 1 | 명세 한계 |
| `seed-design` | 229/14/19/11 | 12 | 1 | 명세 한계 |
| `socar` | 59/18/21/10 | 0 | 1 | **충족** |
| `teamsparta` | 28/10/8/3 | 0 | 1 | **충족** |
| `toss` | 37/16/12/9 | 0 | 1 | **충족** |
| `vapor-ui` | 112/13/21/12 | 0 | 1 | **충족** |
| `wanted` | 111/19/14/9 | 0 | 1 | **충족** |
| `yeogi` | 73/25/17/9 | 1 | 1 | 명세 한계 |

**11/17 이 error 0.** 나머지 6개가 안고 있는 17건은 전부 아래 두 유형이다.

### 고친 것 (error 22 → 17)

`letterSpacing` 이 단위 없는 `0` 이었던 5건(toss 4 · wanted 1)을 `0em` 으로 고쳤다.
명세의 `Dimension` 은 px/em/rem 만 받는다. **값은 바뀌지 않았고 표현만 정정했다.**

### 고치지 않는 것 (남은 17건)

**카탈로그가 맞고 명세가 못 담는 경우**다. 준수하려면 브랜드가 실제로 발행한 값을
버려야 한다.

| 유형 | 건수 | 슬러그 |
| --- | ---: | --- |
| `%` 단위 radius (`50%`·`42%`) — 표준 CSS 인데 명세 Dimension 은 px/em/rem 만 | 5 | `11st` `baemin` `bezier` `line-design-system` `yeogi` |
| 다중 스톱 그라디언트를 색 토큰으로 — 명세의 Color 는 단색만 | 12 | `seed-design` |

`src/lib/google-designmd-corpus.test.ts` 의 `KNOWN_SPEC_LIMITATIONS` 가 슬러그별 개수를
**양방향 래칫**으로 고정한다 — 새 에러도, 조용한 수정도 실패시킨다.

### warning 14건 — `missing-primary`

`primary` 라는 이름의 토큰을 가진 건 `11st`·`baemin`·`class101` 셋뿐이다. 나머지는
브랜드 고유명(`blue-500`·`grey-900`)을 쓴다.

**자동으로 붙이지 않았다.** 어느 색이 primary 인지는 의미 판단이고, 근거 없는 귀속은
이 저장소의 인용 원칙에 어긋난다. 코퍼스 테스트가 현재 14개 목록을 고정해 두어, 붙이려면
근거와 함께 명시적으로 해야 한다.

## 부수 효과 — 기존 게이트가 함께 좋아졌다

표준 대조가 카탈로그 자체 결함도 드러냈다.

- `wanted` 가 라이트·다크 시맨틱 alias 를 같은 이름으로 선언해 값이 어긋난 토큰이 21개였다.
  이름이 모호하면 `oklch-drift` 가 통째로 건너뛰므로 프리뷰 대조가 그만큼 꺼져 있었다.
  카탈로그 관례인 `dark-` 접두로 갈랐다(codeit 78개·seed-design 109개가 이미 그렇게 쓴다).
  **프리뷰 대조 실매칭 38 → 60건(+22)**, `audit:oklch` 는 여전히 0 mismatch —
  새로 비교된 22건이 전부 프리뷰와 일치한다. `oklch-drift.ts` 주석이 "회복 가능한 22건"
  이라 적어 둔 수와 같다.
- 인용되지 않던 출처 3건(gmarket 2 · toss 1)에 인용을 붙였다. 삭제가 아니라 추가로
  간 이유는 `[src:N]` 이 정수 인덱스라, gmarket 에서 출처 하나를 빼면 **인용 214회를
  재번호**해야 하는데 회수되는 건 수십 바이트이기 때문이다.

`validate:catalog` 경고 총계 **31 → 6**.

## 남은 부채

- `fontFamily` 를 채울 수 없다. 추출기가 폰트 패밀리를 구조화 필드가 아니라 `note` 로
  흘려서(`token-extractor.ts:266`) 어댑터가 낼 값이 없다. 명세가 요구하지는 않는다.
- `components` 토큰 맵이 없다. 사이드카에 없고 본문에서 신뢰성 있게 못 뽑는다. 비워 두면
  `orphaned-tokens`·`contrast-ratio`·`broken-ref` 가 공회전하므로 경고 홍수는 나지 않는다.
- `class101`·`greeting` 은 spacing 토큰이 0이라 info 가 뜬다. 두 브랜드가 실제로 명명
  스페이싱 스케일을 발행하지 않으며, 그 사실을 근거와 함께 md 에 적어 두었다 —
  **정확한 상태 반영이지 결함이 아니다.**

## 알아 두어야 할 함정

- **dev 서버에서 `/services/{slug}/DESIGN.md` 는 404 다.** Vite 미들웨어가 `.md` 요청을
  라우터보다 먼저 가로챈다. nitro 에는 없어 프로덕션은 200 이다. 존재하지 않는 `.txt`
  경로가 React 404 를 주는데 `.md` 는 Vite 의 "Cannot GET" 을 주는 것으로 갈랐다.
- **프로덕션 빌드를 직접 띄우려면 `VITE_SITE_URL` 이 필요하다.** 없으면 홈페이지까지
  전부 500 이라 라우트 문제로 오인하기 쉽다.
