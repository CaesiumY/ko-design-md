# design.md 스켈레톤

`services/{slug}.md` 를 새로 만들 때 통째로 복사해 채우는 뼈대다. 규칙의 근거와
예외는 [`stitch-format.md`](./stitch-format.md) 가 갖는다 — 이 문서는 **무엇을 어느
순서로 쓰는지**만 보여 준다. 둘이 어긋나면 `stitch-format.md` 가 정본이다.

채우고 나면 `pnpm validate:draft <file> --slug <slug>` 로 확인한다.

## Google DESIGN.md 정규명 대응

카탈로그 섹션 순서는 Google 이 발행한 DESIGN.md 명세
(`github.com/google-labs-code/design.md`, 버전 `alpha`) 의 정규 순서와 어긋나지
않는다. 명세의 8개 섹션은 **전부 optional** 이고, 순서 검사도 명세가 아는 섹션만
추려서 보므로 카탈로그 고유 섹션이 사이에 끼어도 문제가 없다.

| 카탈로그 섹션 | 명세 정규명 | 관계 |
| --- | --- | --- |
| `Brand & Style` | `Overview` | 명세가 인정하는 **별칭** — 그대로 쓰면 된다 |
| `Colors` | `Colors` | 동일 |
| `Typography` | `Typography` | 동일 |
| `Spacing` · `Rounded` | `Layout` | **의도적 분리.** 명세는 한 섹션이지만 카탈로그는 둘로 나눈다. 토큰은 frontmatter `spacing:`·`rounded:` 키가 가르므로 헤딩을 합쳐도 추출은 안 깨지지만, `REQUIRED_SECTIONS` 가 두 헤딩을 모두 요구해 `missing-section` 으로 막힌다 |
| `Elevation & Depth` | `Elevation & Depth` | 동일 |
| `Shapes` | `Shapes` | 동일 |
| `Components` | `Components` | 동일 |
| `Do's and Don'ts` | `Do's and Don'ts` | 동일 |
| `Responsive Behavior` · `Known Gaps` · `References` | — | 카탈로그 고유. 명세는 모르는 헤딩이지만 **결함으로 잡지 않는다** |

**토큰은 frontmatter 에 쓴다** — 그 자체가 명세 형태다. 본문 ```yaml 펜스는 폐기된
형태이니 새로 쓰지 말 것(추출기가 폴백으로만 읽는다).

`/services/{slug}/DESIGN.md` 라우트는 계속 남아 표준 도구용으로 정리된 뷰를 서빙한다 —
본문에 남는 펜스(shadow·컴포넌트 스펙)를 걷어내고 `radius` 를 명세의 `rounded` 로
바꾼다. **그 변환을 위해 이 파일에서 따로 할 일은 없다.**

## 스켈레톤

`{{...}}` 는 채울 자리, `<!-- -->` 주석은 채우고 나서 지운다.

````markdown
---
name: {{브랜드명 — 한국어 정식 표기. 사이트 H1·OG·RSS 제목이 된다}}
design_system_name: {{디자인 시스템의 고유 이름. 브랜드명과 다를 때만 쓴다(GDS, Vapor UI). 없으면 이 줄을 지운다}}
slug: {{a-z0-9- 만. 파일명과 반드시 같아야 한다}}
category: {{finance|messenger|commerce|delivery|mobility|content|community|travel|gov|developer|education|career 중 하나}}
last_updated: "{{YYYY-MM-DD — 기억이 아니라 조회한 날짜}}"
created_at: "{{YYYY-MM-DD — 카탈로그 정렬 키. last_updated 보다 이를 수 없다}}"
sources:
  - {{https://… 공개 URL. 아래 ## References 와 순서·내용이 정확히 같아야 한다}}
lang: ko
logo: https://getdesign.kr/logos/{{slug}}.{{svg|png|webp|avif}}
colors:
  ## {{그룹 라벨 — 이 주석 행이 그룹을 연다. 사이드카 `group` 이 되어 Tokens 탭의 구분 라벨로 렌더된다}}
  {{token-name}}: oklch({{L C H}})   # {{용도. 브랜드 발행 #HEX}} ← 트레일링 주석이 사이드카 `note`
  {{token-name-2}}: oklch({{L C H}})
  ## {{다크 램프가 있으면 이름을 갈라 쓴다 — 한 이름 두 값은 대조를 꺼 버린다}}
  dark-{{token-name}}: oklch({{L C H}})
  {{semantic-alias}}: "{colors.{{token-name}}}"   # 참조는 반드시 인용 — 안 하면 YAML 이 flow mapping 으로 읽어 값이 null 이 된다
typography:
  {{style-name}}:                 # 이름 줄은 비운다 — 인라인 { … } 형태는 추출기가 못 읽어 0개가 된다
    fontSize: {{56}}px            # 속성명은 스펙 이름 (size/weight 아님)
    fontWeight: {{700}}
    lineHeight: {{1.30}}
    letterSpacing: {{0}}em
spacing:
  {{space-1}}: {{4px}}
rounded:
  {{radius-s}}: {{8px}}
---

# {{브랜드명}} — design.md

<!-- 아래 첫 산문 줄이 태그라인이 된다(그리드·OG·meta 설명이 여기서 파생).
     "[브랜드]는 [정체성] + [시그니처 특색]" 꼴로 색이 있게 쓸 것.
     "디자인 시스템은 ~이다" 류 메타 정의 금지. -->

## Brand & Style

{{디자인 철학·타깃·정서적 톤. 기업 미션이 아니라 시각/UX 의도를 쓴다.
  무드를 한 문단으로 요약하고, 그 판단의 근거를 [src:N] 으로 붙인다.}}

## Colors

{{팔레트의 의도·역할·프로비넌스를 산문으로. **값은 frontmatter 가 갖는다** —
  여기에 다시 나열하면 드리프트하는 두 번째 사본이 된다. 표는 토큰 맵이 담을 수
  없는 것(용도 매트릭스, 라이트/다크 짝)을 실을 때만 쓴다. 각 주장에 [src:N].}}

## Typography

{{서체 선택의 근거와 역할 배분. 값은 frontmatter `typography:` 에.
  Pretendard 밖의 자체 서체를 쓰면 스택은 frontmatter `fonts:` 맵에,
  로드 가능한 CSS 진입점 URL 은 **최상위** `font-display-src:` 키에 적는다
  — 없으면 프리뷰가 조용히 Pretendard 로 폴백한다.}}

## Spacing

{{그리드의 기준 단위와 그 근거. 값은 frontmatter `spacing:` 에.}}

## Rounded

{{곡률 체계가 무엇을 구분하는지. 값은 frontmatter `rounded:` 에.}}

## Elevation & Depth

{{그림자 체계와 깊이 언어. 브랜드가 발행하지 않으면 섹션을 지우지 말고
  "공개된 elevation 체계가 없다" 를 근거와 함께 한 줄로 적는다.}}

## Shapes

{{곡률·기하 언어. 각진 편인지 둥근 편인지, 아이콘 그리드가 있는지.}}

## Components

<!-- 기능이 다른 변형과 의미 있는 상태는 각각 ### 로 분해한다.
     프로즈에서 토큰을 가리킬 때는 {colors.name} 형식을 쓴다. -->

### {{component-name}}

{{치수·상태·토큰 참조. 각 주장에 [src:N].}}

## Do's and Don'ts

**Do** {{…}} [src:N]

**Don't** {{…}} [src:N]

<!-- 최소 하나는 도메인 경계 Don't 여야 한다 — 소비자는 시각 언어를 빌리는
     것이지 이 브랜드의 제품 개념·플로우·카피를 가져가는 게 아니다.
     design_system_name 이 있으면 벤더 중립 Don't 도 추가한다(시스템 이름·
     패키지명·클래스 접두를 소비자 UI 에 노출하지 않는다).
     이 둘은 카탈로그 정책이라 [src:N] 이 필요 없다. -->

## Responsive Behavior

{{브레이크포인트 표 + Key Changes, 터치 타깃, 컴포넌트별 축소 전략.}}

## Known Gaps

- {{리서치에서 끝내 확인하지 못한 것. 정직한 2~5개.}}

## References

1. {{https://… — 소스의 성격만 짧게. frontmatter sources 와 순서·내용이 같아야 한다}}
````

## 채우면서 자주 틀리는 것

이번 표준 준수 작업에서 나온 경고 31건 중 **28건이 아래 두 가지**였다.

- **테마별 팔레트에 같은 이름을 두 번 쓰기.** `dark-` 로 가른다. 위 frontmatter
  `colors:` 스켈레톤 참고.
- **출처를 추가하고 인용하지 않기.** `sources` 에 URL 을 넣었으면 **같은 커밋에서**
  본문 어딘가에 `[src:N]` 으로 쓴다. 나중에 지우려면 `[src:N]` 이 정수 인덱스라
  뒤 번호가 전부 밀린다 — 실측으로 한 항목에서 인용 214회 재번호가 필요했다.

여기에 하나 더:

- **`letterSpacing`/`tracking` 에 단위 빼먹기.** `0` 은 CSS 로는 유효하지만 명세의
  Dimension 은 px/em/rem 만 받는다. `0em` 으로 쓴다.

토큰이 frontmatter 로 옮겨오면서 생긴 함정이 둘 더 있다. 둘 다 **조용히** 틀린다.

- **색 값을 인용하기.** `primary: "oklch(...)"` 로 쓰면 `audit:oklch` 와 드리프트
  검사가 그 토큰을 못 본다. 둘 다 원문을 정규식으로 훑기 때문에, 아무것도 안 보면서
  성공을 보고한다 — 출력이 통과와 구분되지 않는다. 색 값은 벌거벗겨 쓴다.
- **반대로, 인용해야 하는 두 가지를 안 쓰기.** 참조(`"{colors.x}"`)를 벌거벗기면
  YAML 이 flow mapping 으로 읽어 값이 null 이 되고, 따옴표로 시작하는 폰트 스택을
  벌거벗기면 **frontmatter 전체 파스가 실패**해 그 항목의 토큰이 0개가 된다.
  실측으로 각각 린터 error 126건(vapor-ui 76 · toss 41 · baemin 9)과 항목 7개에서 났다.

## 명세가 표현하지 못하는 값

아래는 **카탈로그가 맞고 명세가 못 담는** 경우다. 고치지 말고 그대로 두면 된다
(`validate:spec` 이 error 로 보고하지만 코퍼스 테스트가 알려진 한계로 고정해 둔다).

- `border-radius: 50%` 같은 **`%` 단위** — 표준 CSS 인데 명세 Dimension 은 px/em/rem 만 받는다.
- **다중 스톱 그라디언트** 를 색 토큰으로 둔 경우 — 명세의 Color 는 단색만이다.

새로 이런 값을 넣게 되면 `src/lib/google-designmd-corpus.test.ts` 의
`KNOWN_SPEC_LIMITATIONS` 를 함께 갱신한다. 그 표는 양방향 래칫이라 수를 안 맞추면
테스트가 실패한다.
