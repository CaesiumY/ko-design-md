# 묶음 H-5 — seed-design 프리뷰 산문 감사

- 날짜: 2026-08-06
- 선행: #215(H-1), #216(H-2), #220(H-3), #232(H-4), **#231(seed-design 리뉴얼 — 제외 해제)**
- 대상: `public/preview/seed-design/{light,dark}.html`

## 배경

브랜드 자산 리스크 감사 계열의 열 번째다. seed-design 은 #209 가 "리뉴얼 준비 중"
이라며 묶음 C~H 전체에서 제외해 둔 **유일한 항목**이었고, 그 리뉴얼이 #231(`227fd36`)
로 착지하며 제외가 풀렸다. #231 의 9회차 리뷰도 이 후속이 누락되지 않았는지 확인을
요청했다.

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
무게이트라 이 대조는 사람이 한다.

## 서술 표면 특정 — 37 개

H-2 가 정한 절차(파일을 열어 그 슬러그의 서술 클래스를 먼저 특정한다)를 따랐다.

| 클래스 | 개수 | 성격 |
| --- | --- | --- |
| `.panel-title` (+`small` 부제) | 18 | 컴포넌트/축 이름과 부제 |
| `.code-card` | 4 | 구현 메모. **노트 하나가 4개 주장을 담는다** |
| `.section-desc` | 3 | 섹션 설명 |
| `.section-head h2` | 3 | 섹션 표제 |
| `.kicker` | 3 | 번호 라벨 |
| `.ramp-note` | 4 | Foundations 각주 |
| `.hero-copy` · `.eyebrow` | 2 | 히어로 |

**감사 대상이 아닌 것** — `.sd-*` 목업 콘텐츠(이웃 이름·동네·온도), 고지 스트립,
더미 캡션. H-2 가 이것들을 대상으로 세어 계수가 틀렸던 전례가 있다.

**라이트·다크 산문이 완전히 동일했다**(각 37, 발산 0). H-4 가 greeting 에서 찾은
"다크가 근거 있는 두 사실을 버리고 없는 사실 하나를 얻은" 부류는 여기 없었다.

## 대조 결과 — 8 개 표면 정정

**판정 단위는 노트가 아니라 주장이다.** `.code-card` 4개가 16개 주장을 담았고 그중
13개가 무근거였다. 세는 단위는 **고친 표면**이다.

| 표면 | 정정 | 근거 |
| --- | --- | --- |
| `.eyebrow` | 1 | `당신 근처의 지역 생활 커뮤니티` 는 당근 서비스의 마케팅 포지셔닝이고 md 가 적지 않는다 → md `## Brand & Style` 이 인용한 공식 자기소개 `당근 제품을 위한 통합 디자인 언어` |
| `.hero-copy` | 1 | `흰 배경` · `선명한 행 구조` · `동네 맥락의 짧은 문장` 세 주장이 md 에 없다. 근거 있는 둘(역할 기반 색 · 브랜드 절제)만 남기고 나머지를 재현 서술로 대체 |
| `01 / Components` h2 | 1 | `당근 제품의 실제 흐름 위에서 **보여야 한다**` — 무근거 규범문. 이 프리뷰가 실제로 한 일을 적는 관찰문으로 |
| `01 / Components` desc | 1 | `Brand 컬러는 **핵심 연결 액션**에만` → md `### action-button`·`### badge` 가 둘 다 적는 `꼭 필요한 곳에만` |
| `.code-card` ActionButton | 1 | 네 주장 모두 무근거 (아래) |
| `.code-card` ListItem | 1 | 네 주장 중 넷 무근거 (아래) |
| `.code-card` BottomSheet | 1 | 네 주장 중 넷 무근거 (아래) |
| `.code-card` Color | 1 | `brand="사용자 연결 액션에만 제한"` → `꼭 필요한 곳에만`. fg·bg 두 줄은 md 의 역할 이름 그대로라 무변경 |

### `.code-card` 세 장의 무근거 주장 13 건

| 주장 | 판정 |
| --- | --- |
| `variant="brandSolid"` · `size="large"` | md 는 Variant·Size 속성의 **존재**만 적고 값을 발행하지 않는다 — API 값 발명 |
| `usage="채팅하기 / 글쓰기 / 단골맺기"` | 당근 제품 기능. md 에 없다 |
| `limit="high emphasis는 한 화면에 하나"` | **종전 md 에 있다가 #231 재생성에서 빠진 문장이다.** md 가 지금 적는 것은 `Brand 컬러는 꼭 필요한 곳에만` 뿐 |
| `prefix="thumbnail \| avatar \| icon"` · `suffix="price \| action \| chevron"` | md `### list` 는 네 슬롯의 **존재**만 적고 무엇이 들어가는지 열거하지 않는다 |
| `title="한 줄 우선"` · `detail="동네 · 시간 · 보조 정보"` | md 에 없다 |
| `maxWidth="640px"` · `handle="36x4"` | md 에 없는 수치. md 의 유일한 "640" 은 `red-700` 색값이다 |
| `topCornerRadius="$radius.r6"` · `layer="bg.layer-floating"` | 토큰은 실재하나 **바텀시트 용도 매핑을 md 가 적지 않는다.** greeting `radius20` 과 같은 부류 |
| `brand="사용자 연결 액션에만 제한"` | 종전 md 문장의 잔재 |

md 는 바텀시트에 대해 "최대 너비·최대 높이·Snap Point·키보드 등장 시 동작이 각각
**규정돼 있다**" 는 사실까지만 적는다. 그래서 대체 문구도 거기까지만 옮겼다 —
값을 옮기지 않고 "규정된다" 는 사실을 남기는 쪽이 md 와 일치한다.

## CSS 주석에서 나온 2 건 — 렌더되지 않아도 주장이다

한글을 담은 CSS 주석 13개를 함께 훑었고 2개가 무근거였다.

- `/* Notification Badge — Large(숫자) / **Small(점)** 두 형태 */` — md 는 Small 의
  **형태를 적지 않는다**. 이 문장은 #231 리뷰 라운드에서 발명으로 판정돼 **본문에서
  이미 지워졌는데 주석에 남아 있었다.** 이 계열이 기록한 *"부분 수정을 전체 수정으로
  읽는다"* 실패 유형이 그대로 재현된 사례다.
- `/* Action Button — Brand Solid 는 한 화면에 하나 */` — 위 `limit` 과 같은 잔재.

렌더되지 않는 주석은 사용자에게 닿지 않지만 **다음 편집자에게 닿는다.** 산문을
고치면서 주석을 두면 같은 주장이 다시 마크업으로 올라온다.

## 고치지 않은 것

**정정하지 않은 것이 결과의 대부분이다.** 0 건은 정당한 결과이고, 억지로 고치면
근거 있는 서술을 무근거로 대체하게 된다 — H-1 에서 두 번 일어났다.

- **`.panel-title` 18 개 전부 무변경.** 부제가 전부 md 가 적는 사실이다 —
  `root / standard`(md `### top-navigation` 의 두 타입), `prefix / title / detail /
  suffix`(md `### list`), `4px 배수 사다리`(md `## Spacing`), `2 – 24px + full`
  (md `## Rounded`), `0.2초 경계`(md `## Motion`) 등.
- **`.ramp-note` 4 개 전부 무변경.** 10단계 램프의 색 이동 · 다크 shadow 알파 상승 ·
  0.2초 경계 · 그라디언트의 용도 모두 md 가 적는다.
- **`.kicker` 3 개** 는 번호 라벨이라 주장이 없다.
- **`.sd-*` 목업 라벨(`단골맺기` 등) 무변경.** H-2 가 표시 데이터를 D-1 의 더미
  라벨링 소관으로 정했다. 고지 스트립이 이미 더미임을 밝힌다.
- **`data-note` 속성 무변경.** CSS 에 `attr(data-note)` 가 없어 렌더되지 않는다 —
  주석과 달리 사람이 읽는 자리도 아니다.
- **`.banner-copy strong` 의 375px 말줄임 무변경.** `text-overflow: ellipsis` 로
  의도된 절단이고 이 묶음(산문)의 범위도 아니다.

## 검증

```
validate:previews  PASS   validate:catalog  PASS   tokens:check      PASS
audit:oklch        PASS   check:last-updated PASS  typecheck / lint  PASS
test  429 passed
```

편집 후 **라이트·다크 산문이 여전히 동일**함을 재확인했다(각 37, 발산 0) — 한쪽만
고치는 것이 H-4 가 greeting 에서 찾은 결함이었다.

375 / 768 / 976 / 1440 × light·dark 에서 문서 오버플로우 0. `.code-card` 는 대체
문구가 길어져 좁은 폭에서 넘치지만 `overflow-x: auto` 라 **스크롤이지 절단이 아니다** —
CLAUDE.md 가 코드 블록에 허용한 형태다.

## 남은 것 — H-6 이후

잔여 13개 슬러그. **후보 개수는 상한이지 감사 단위가 아니다**(socar 14 → 33,
greeting 42 → 93).

| slug | 후보 클래스 | 후보 수 |
| --- | --- | --- |
| wanted | `cl` | 21 |
| line-design-system | `card-eyebrow` | 20 |
| gmarket | `card__note` | 19 |
| baemin | `card-note` | 16 |
| class101 | `cell-cap` | 12 |
| vapor-ui · toss | `caption` | 7 · 6 |
| bezier · kyobobook | `fam-head` · `panel-note` | 7 · 7 |
| yeogi | `card-note` | 5 |
| teamsparta | `caption` | 2 |
| codeit · 11st | 미특정 | — |

**`wanted` · `bezier` · `line-design-system` 은 저작권 축만 판정됐다**(H-1). 서술
전수는 미착수이므로 H-6 이후가 이 셋을 "완료" 로 취급하면 안 된다.
