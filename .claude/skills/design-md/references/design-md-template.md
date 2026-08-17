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
| `Spacing` · `Rounded` | `Layout` | **의도적 분리.** 명세는 한 섹션이지만 카탈로그는 둘로 나눈다. 토큰 추출기가 두 섹션을 각각 슬라이스하므로 합치지 말 것 |
| `Elevation & Depth` | `Elevation & Depth` | 동일 |
| `Shapes` | `Shapes` | 동일 |
| `Components` | `Components` | 동일 |
| `Do's and Don'ts` | `Do's and Don'ts` | 동일 |
| `Responsive Behavior` · `Known Gaps` · `References` | — | 카탈로그 고유. 명세는 모르는 헤딩이지만 **결함으로 잡지 않는다** |

`/services/{slug}/DESIGN.md` 라우트가 이 md 를 명세 형식(토큰을 frontmatter 로)
으로 렌더해 서빙한다. **그 변환을 위해 이 파일에서 따로 할 일은 없다** — 본문
```yaml 펜스만 규칙대로 써 두면 어댑터가 알아서 옮긴다.

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
---

# {{브랜드명}} — design.md

<!-- 아래 첫 산문 줄이 태그라인이 된다(그리드·OG·meta 설명이 여기서 파생).
     "[브랜드]는 [정체성] + [시그니처 특색]" 꼴로 색이 있게 쓸 것.
     "디자인 시스템은 ~이다" 류 메타 정의 금지. -->

## Brand & Style

{{디자인 철학·타깃·정서적 톤. 기업 미션이 아니라 시각/UX 의도를 쓴다.
  무드를 한 문단으로 요약하고, 그 판단의 근거를 [src:N] 으로 붙인다.}}

## Colors

<!-- 값이 OKLCH 가 아니면 CI 가 막는다. 원본 hex 는 트레일링 주석으로만 남긴다.
     한 줄에 hex 를 두 개 넣지 말 것 — 검증기가 그 토큰을 통째로 건너뛴다. -->

```yaml
{{token-name}}: oklch({{L C H}})   # {{용도. 원본 #HEX}}
```

<!-- 라이트/다크를 모두 발행하는 브랜드라면 다크는 반드시 이름을 갈라 쓴다.
     같은 이름으로 두 번 선언하면 어느 쪽이 정본인지 알 수 없어
     프리뷰 대조가 그 토큰에서 통째로 꺼진다(wanted 에서 21개가 그랬다).
     카탈로그 관례는 dark- 접두다(codeit·seed-design). -->

### {{Dark 램프가 있다면}}

```yaml
dark-{{token-name}}: oklch({{L C H}})
```

## Typography

<!-- letterSpacing 이 0 이어도 단위를 붙인다 — `0` 이 아니라 `0em`.
     Pretendard 밖의 자체 서체를 쓰면 같은 펜스 안에 font-display-src 로
     로드 가능한 CSS 진입점 URL 을 적는다(없으면 프리뷰가 조용히 폴백한다). -->

```yaml
{{style-name}}: { size: {{px}}, line-height: {{ratio}}, tracking: {{0em}}, weight: {{400}} }
```

## Spacing

```yaml
{{space-1}}: {{4px}}
```

## Rounded

```yaml
{{radius-s}}: {{8px}}
```

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

- **테마별 팔레트에 같은 이름을 두 번 쓰기.** `dark-` 로 가른다. 위 Colors 주석 참고.
- **출처를 추가하고 인용하지 않기.** `sources` 에 URL 을 넣었으면 **같은 커밋에서**
  본문 어딘가에 `[src:N]` 으로 쓴다. 나중에 지우려면 `[src:N]` 이 정수 인덱스라
  뒤 번호가 전부 밀린다 — 실측으로 한 항목에서 인용 214회 재번호가 필요했다.

여기에 하나 더:

- **`letterSpacing`/`tracking` 에 단위 빼먹기.** `0` 은 CSS 로는 유효하지만 명세의
  Dimension 은 px/em/rem 만 받는다. `0em` 으로 쓴다.

## 명세가 표현하지 못하는 값

아래는 **카탈로그가 맞고 명세가 못 담는** 경우다. 고치지 말고 그대로 두면 된다
(`validate:spec` 이 error 로 보고하지만 코퍼스 테스트가 알려진 한계로 고정해 둔다).

- `border-radius: 50%` 같은 **`%` 단위** — 표준 CSS 인데 명세 Dimension 은 px/em/rem 만 받는다.
- **다중 스톱 그라디언트** 를 색 토큰으로 둔 경우 — 명세의 Color 는 단색만이다.

새로 이런 값을 넣게 되면 `src/lib/google-designmd-corpus.test.ts` 의
`KNOWN_SPEC_LIMITATIONS` 를 함께 갱신한다. 그 표는 양방향 래칫이라 수를 안 맞추면
테스트가 실패한다.
