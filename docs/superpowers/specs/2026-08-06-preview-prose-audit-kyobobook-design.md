# 프리뷰 산문 감사 — kyobobook (교보문고 KDS)

- 날짜: 2026-08-06
- 선행: #215 · #216 · #220 · #232 · #236(toss) · #238(seed-design) ·
  #242(line-design-system) · #248(wanted) · #250(11st·yeogi·teamsparta) · #251(bezier)
- 대상: `public/preview/kyobobook/{light,dark}.html`
- **감사 기준 커밋: `454d79a`**

## 차수 표기를 버린다 — 슬러그로 식별한다

**이 문서부터 커밋 제목과 파일명에서 차수를 뺀다.** `프리뷰 산문 감사 — <슬러그>`
로만 적는다.

> **정오 — main 에 9차가 둘이다.** `#250`(11번가·여기어때·스파르타 묶음, `2d63f73`)과
> `#251`(bezier, `454d79a`)이 모두 `9차` 로 착지했다. 앞서 6차·8차에서도 같은 충돌이
> 있었으니 **세 번째다.**

세 번 다 원인이 같다. 차수는 **선착순으로 집는 공유 자원**인데 락이 없다.

- 6차 때 세운 규칙 — *"착수 순서가 아니라 착지 순서를 따른다"* — 은 값을 정하는
  시점을 옮겼을 뿐이다.
- `#250` 문서가 독립적으로 더 나은 해법을 제안했다 — *"PR 을 열기 전이 아니라
  **머지 직전에** 번호를 확정하는 편이 낫다."*
- **그 해법으로도 막히지 않았다.** `#251`(이 작업)은 커밋 시점(21:06)에 8을 세어
  9차로 적었고, `#250` 이 21:11 에 9차로 착지했으며, `#251` 은 21:35 에 머지됐다.
  머지 직전에 확인했더라도 21:34 에 상대가 머지하면 결과는 같다 — **"직전" 은 여전히
  경쟁 구간이다.**

**슬러그는 경쟁하지 않는다.** 두 세션이 같은 슬러그를 동시에 감사할 일이 없고,
있다면 그건 번호 충돌이 아니라 **진짜 작업 충돌이라 드러나야 마땅하다.** 계열 순서가
필요하면 `git log --grep "프리뷰 산문 감사"` 가 언제든 답한다 — 제목에 박아 둘 이유가
없다.

파일명은 이미 `toss` · `lds` · `batch1` 이 슬러그를 쓰고 있었다. 그쪽으로 통일한다.

## 배경

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
어떤 기계 검사도 받지 않으므로 이 대조는 사람이 한다.

`kyobobook` 을 고른 이유는 **`<pre class="code-card">` 4장**이다. 이 형식은 이 계열에서
결함률이 가장 높았다 — seed-design 에서 코드카드 4장의 15개 주장 중 **13개가
무근거**였다. 표면 수가 적어도 밀도가 높은 쪽을 먼저 열었다.

## 서술 표면 특정 — 51 개

**검산 내역**: `.demo-label` 11 + `.panel-note` 7 + `.panel-title` 7(중첩 `<small>`
포함) + `<pre class="code-card">` 4 + `.meta-chip` 4 + `.help` 4 + `.section-desc` 2 +
`h2` 2 + `.kicker` 2 + `.hero-copy` · `.eyebrow` · `h1` · `.loading-caption` ·
`.footer-note` · `.theme-pill` 각 1 + 고지 2(`.catalog-disclaimer` ·
`.catalog-dummy`) = **51**. 고지 2개는 D-1 소관이라 판정 대상에서 뺐다 → **49**.

> **이 파일에 대한 네 번째 계수다.** H-1 이 술어 A 로 16, 술어 B 로 31 을 얻었고,
> H-2 의 후보 표는 대표 클래스 `panel-note` 로 7 을 적었다. 이번 실측은 51 이다.
> **숫자가 다른 게 아니라 포함 규칙이 다르다** — 그래서 이 계열은 계수를 여섯 번
> 연속 틀렸다. **앞 문서의 수를 물려받지 말고 경계를 밝히고 다시 셀 것.**

한글 CSS 주석은 **0개**다(양 테마 모두 확인). `@media` 로 숨는 서술 표면도 **없다** —
bezier 의 `.fh-cap`(≤720px 숨김)·wanted 의 `.strip-meta`(≥1024px 전용) 같은 자리가
여기엔 없고, 두 `@media` 블록은 폭·간격·글꼴만 건드린다.

## 대조 결과 — 5 개 표면 정정

**검산 내역**: 라이트 5(코드카드 `size` · 코드카드 `fill` · `.panel-note` Button ·
`.panel-note` BottomSheet · `.help` focus) / 다크 4(코드카드 `size` · `.help` focus +
다크 고유 문구 2). 겹치는 표면을 하나로 세면 **5개**다.

| 표면 | 종전 | 판정 |
| --- | --- | --- |
| `<pre>` Button `size` | `// L(H50) MO · M(H44) PC · S(H38)` | **md 는 이 수치를 `Input/Dropdown 높이` 로 적는다**(`services/kyobobook.md:417`, `:423`). Button 에는 픽셀값을 내지 않는다 — **입력류 수치를 버튼에 귀속**시킨 것이다 |
| `<pre>` Button `fill` | `// blue-700 · **hover** blue-800` | md 의 시맨틱 토큰은 `accent-press: blue-800 — **pressed**`(`:126`). blue-800 은 hover 가 아니다 |
| `.panel-note` Button | `hover는 blue-800, disabled는 **gray-200**/gray-400` | 위와 같은 상태 오귀속 + md 는 `fg-disabled: gray-400`(`:118`)만 두고 **disabled 배경색을 발행하지 않는다**(`gray-200` 은 `bg-muted`) |
| `.panel-note` BottomSheet | `상단 코너는 16~24px 구간, **딤은 검정 45% 알파**다` | 코너 범위는 md 에 있으나 **딤 알파는 md 에 없다** |
| `.help` | `focus 보더는 **1.5px** blue-700.` | md 는 Focused 상태의 존재만 적고 **보더 두께를 발행하지 않는다** |

다크의 대응 문구도 같은 기준으로 손봤다 — `hover는 라이트와 반대로 더 밝은 단계로
간다` → `pressed 는 …`, `다크에서는 딤을 검정 60% 알파로 깊게 둔다` → 수치를 뺀
`다크에서는 딤을 더 깊게 둔다`.

## 고치지 않은 것

**정정하지 않은 것이 결과의 대부분이다.** 0 건은 정당한 결과이고, 억지로 고치면
근거 있는 서술을 무근거로 대체한다.

- **`shadow-green-100(green 40% alpha)` 무변경 — 하마터면 잘못 고칠 뻔했다.**
  `40%` 로 grep 하니 md 에 0건이라 무근거로 보였는데, md 는 `:217` 에서
  `oklch(0.662 0.188 139 / **0.40**)` 로 적는다. **5차(toss)가 남긴 *"리터럴 grep
  0건은 근거가 아니다"* 가 그대로 재현됐다** — 퍼센트↔소수 표기 차이다.
- **`element="box" // box | text | icon | capsule` 무변경.** md 가 enum 을 발행하지
  않아 발명으로 보였으나, `### button-primary` 가 *"**Box 버튼**의 width는 가변"*,
  `### button-tertiary` 가 *"text/icon-only"*, `### button-capsule` 이 각각 그 네
  이름을 쓴다. md 어휘를 모은 것이다.
- **`<pre>` 나머지 10줄 무변경.** `action="accent"` · `surface="bg / border"` ·
  `brand="navy / green" // LOGO ONLY` · `chip="radius-round"` · `badge="h 22px"` ·
  `loading="4-color ↺"` · `motion="150 / 240ms"` 모두 md 축자에 가깝다.
- **`.panel-note` 5개 · `.demo-label` 11개 · `.meta-chip` 4개 무변경.** 20자 칩 라벨 ·
  22px 배지 높이와 4/6px 패딩 · 입력 상태 7종 · 55×55 MY 아바타 · 특수 26px 아이콘 ·
  Hottracks 빨강과 Negative 빨강 구분 모두 md 가 적는다.
- **다크 프리뷰의 자기 서술 무변경 — 이미 정직하다.** md 는 *"공개된 다크 팔레트가
  없으며 이 문서는 다크 토큰을 추정하지 않는다"* 고 못 박는데, 다크 프리뷰는
  `mode="dark-derived" // 공개 다크 팔레트 없음` · *"이 다크는 파생 표면 위 적응이며,
  공개 다크 토큰이 나오면 교체해야 한다"* 로 스스로를 파생물로 밝힌다. **md 가 하지
  않기로 한 일을 대신 한 게 아니라, 한 뒤 그렇다고 적었다.** bezier 의 Toast 를
  재현 표기로 낮춘 것과 같은 형태가 여기엔 이미 있었다.
- **`KDS` 워드마크 무변경.** md Don't 의 *"디자인시스템 이름을 생성하는 제품 UI 의
  헤더·타이틀에 넣지 않는다"* 는 **KDS 로 만드는 제품**에 대한 지침이고, 이 프리뷰는
  KDS 를 문서화하는 카탈로그 표면이다(bezier 에서 내린 판단과 같다).

## 검증

```
validate:previews (kyobobook)  0 blocking · warn 4 (기준과 동일, 신규 0)
validate:catalog PASS   tokens:check 17 in sync   audit:oklch 0 mismatched
check:last-updated  services/*.md 무변경으로 해당 없음
typecheck / lint PASS   test PASS   build PASS
```

375 / 768 / 976 / 1440 × light·dark 에서 문서 오버플로우 0 · 서술 표면 잘림 0.

## 남은 것

잔여 5개. 표면 수는 **대표 클래스 하나가 아니라 전수 실측**이며, 그래도 상한이지
작업량이 아니다(kyobobook 이 후보 표 7 → 실측 51 이었다).

| slug | 실측 서술 표면 | `<pre>` |
| --- | --- | --- |
| vapor-ui | 32 (~40) | — |
| codeit | 24 (~28) | 1개 |
| gmarket | 23 | — |
| baemin | 19 | — |
| class101 | 16 | — |

`codeit` 만 `<pre>` 를 갖고 있어 밀도가 높다. 나머지는 표면 수 순으로 보면 된다.
**전부 단독감이다** — `#250` 이 작은 셋을 가져가 묶을 짝이 남지 않았다.

> **`#250` 과 이 문서의 표면 수 경계가 다르다.** `#250` 은 `teamsparta` 를 16 으로
> 셌고 이 계열의 다른 실측은 1 이었다(`.course-sub` 15개를 목업 대시보드 문구로
> 볼 것인가). 둘 중 하나가 틀렸다기보다 **경계를 밝히지 않으면 비교가 성립하지
> 않는다**는 예다. 앞으로 표면 수를 적을 때는 무엇을 넣고 뺐는지 함께 적는다.
