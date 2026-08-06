# 프리뷰 산문 감사 9차 — bezier (첫 서술 전수)

- 날짜: 2026-08-06
- 선행: #215(1차) · #216(2차) · #220(3차) · #232(4차) · #236(5차 toss) ·
  #238(6차 seed-design) · #242(7차 line-design-system) · #248(8차 wanted)
- 대상: `public/preview/bezier/{light,dark}.html`
- **감사 기준 커밋: `8cb74a6`**

## 배경

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
어떤 기계 검사도 받지 않으므로 이 대조는 사람이 한다.

`bezier`(채널톡)는 **H-1(#215)이 저작권 축만 판정하고 서술 전수를 남긴 마지막
항목**이었다. 8차까지 `wanted` 와 `line-design-system` 이 끝나 이제 셋 다 닫힌다.

> **H-1 이 이미 정한 것(다시 열지 않는다).** footer 의 `License` 열
> (`Apache-2.0` · `© Channel Corp.` · `channel-io/bezier-react`)은 **무변경**이다 —
> 라이브러리에 대한 정확한 귀속이고 E 스펙이 *"올바른 귀속의 모범"* 으로 지정했다.
> 8차에서 걷어낸 `wanted` 의 `SSOT: …` 와 형태는 같지만 참거짓이 다르다.

## 서술 표면 특정 — 92 개

**검산 내역**: `.cell-name` 60(그중 59가 `.var` 스펙 노트를 품는다) + footer 14
(`.desc` 1 · `h4` 3 · `a` 7 · `p` 3) + `.fh-cap` 7 + `.hero-stats` 4 +
`.sec-head .cap` 2 + 히어로/스트립 4(`.hero-lede` · `.hero-eyebrow` ·
`.hero-wordmark .system` · `.topbar-meta`) + 한글 CSS 주석 1 = **92**.

> **정오 (9차) — 후보 표의 `bezier · fam-head · 7` 은 실제의 1/13 이었다.** 8차 문서가
> *"여기 적힌 수는 슬러그별 대표 클래스 하나의 후보 수"* 라고 경고한 그대로다.
> `.fam-head .fh-cap` 은 정확히 7개가 맞았지만, 그건 14개 서술 클래스 중 하나였다.

`<pre>`·코드카드는 **0개**다. 대신 `.cell-name` + 중첩 `.var` 쌍이 그 역할을 한다 —
컴포넌트 60개 각각에 스펙 노트가 붙는 구조다.

**감사 대상이 아닌 것** — `.li`/`.conv`/`.hc-*`(가짜 상담 대화·이름·시각),
`.kvi` 데모의 주문번호·플랜, `.m-title`/`.m-text`, `.help`/`.ph`. 고지 스트립이
더미임을 밝힌다.

### 폭에 따라 사라지는 표면이 있다

`.fh-cap` 7개는 **`@media (max-width: 720px)` 에서 `display:none`** 이다. 좁은 폭만
보는 점검은 **7개 주장의 존재 자체를 놓친다.** 8차 `wanted` 의 `.strip-meta`
(≥1024px 전용)와 같은 부류이므로 이번엔 **넓은 폭에서 먼저 읽었다.**
`.desk-chat` 은 ≤900px, `.desk-gnb` 는 ≤480px 에서 숨는다.

## 대조 결과 — 8 개 표면 정정

**검산 내역**: 전부 `.cell-name` 셀이다 — 60개 중 8개를 고쳤고 **52개는 무변경**이다.
Toast 는 다크에서만 문구가 달라 다크에만 적용됐다.

| 표면 | 종전 | 판정 |
| --- | --- | --- |
| `Button` | `primary / secondary / **tertiary**` | md 의 하위 변종은 `button-primary` · `button-secondary` · `button-floating` 이다. **`tertiary` 는 md 에 0건** → `floating` |
| `TextField` | `border = **inner-shadow ring**` | md 의 inner-shadow 는 `--ev-1~6` 전용이고 TextField 에 귀속시키지 않는다. **프리뷰 `.field` 는 실제로 `--state-input-default` box-shadow 로 테두리를 그린다** — md 가 명명한 그 토큰으로 |
| `Tabs` | `**line style** · indigo active **underline**` | md `### Tabs` 는 accent blue + `radius-6`~`radius-12` 만 적는다 → `accent blue active · radius-6~12` |
| `CheckableAvatar` | `선택 = **blue ring** + check` | md 는 "체크 표식" 과 `--layer-z-index-base/floating` 만 적는다. ring 도 그 색도 없다 |
| `Badge` | `count · **red fill**` | md 는 `BadgeSize`·`BadgeVariant`(Primary·Secondary 스토리)만 적는다. **red 없음** |
| `Divider` | `**1px** neutral hairline` | md 는 `--b-divider-thickness/indent-size` 를 **이름만** 적고 값을 안 낸다 |
| `Modal` | `scrim **40%**`(light) / `**55%**`(dark) | md 는 `--color-dim-absolute-black` 을 **이름만** 적고 딤 불투명도를 안 낸다 → 토큰 이름으로 |
| `Toast`(dark) | `floating **raised** bar · **grey-800**` | 아래 |

### 다크 Toast — 재현임을 밝히는 쪽으로

md 는 Toast 를 *"떠 있는 다크 바"* 로 적고 배경을 `fill-neutral-heaviest`(흑 85%)로
지정한다. 그런데 **이 프리뷰의 다크에서 그 토큰은 `rgba(255,255,255,.90)` 으로
뒤집힌다** — Bezier 가 다크를 1급으로 지원하며 시맨틱 토큰이 테마별로 분기하기
때문이다. 그대로 쓰면 "다크 바" 가 **흰 바**가 된다.

그래서 다크 재현이 `grey-800` 을 골랐고(실측 `rgb(41,41,45)`), 종전 캡션은 그 값을
**스펙처럼** 적고 있었다. md 는 `## Known Gaps` 에서 *"컴포넌트 정본 스펙(Banner/
Toast 처리 등)"* 을 미확인으로 둔다 — 즉 이 자리는 md 가 답을 갖고 있지 않다.

값을 지우지 않고 **재현 표기**로 낮췄다: `floating dark bar · 이 재현은 grey-800`.
H-1 의 *"지우면 시연할 것이 사라진다"* 와 유보 보존을 함께 지키는 형태다.

## 고치지 않은 것

**정정하지 않은 것이 결과의 대부분이다.** 0 건은 정당한 결과이고, 억지로 고치면
근거 있는 서술을 무근거로 대체한다 — H-1 에서 두 번 일어났다.

- **`.cell-name` 60 개 중 52 개 무변경.** `Checkbox · green-heavier fill` ·
  `Slider · track r3` · `Tooltip · surface-high · elevation-3 · z 1300` ·
  `Icon · 602 SVG · 24×24 · currentColor · outline + -filled` ·
  `Banner · accent 20% tint + leading filled icon …` 등 md 축자에 가깝다.
- **`.fh-cap` 7 개 전부 무변경.** z-index 사슬(`overlay 1000 → modal 1100 → toast
  1200 → tooltip 1300`)·`invalid는 orange 링`(md 도 "orange 계열" 로 헤지)·
  Banner 색 매핑 모두 md 가 적는다.
- **`#6157ea` 무변경 — 실측해서 지켰다.** md 의 `blue-400` 은 `oklch(0.554 0.214 280)`
  이고 hex 병기가 없다. 저장소 값으로 교정한 변환기(md 가 병기한 `#242428` ·
  `#1d1d20` 두 쌍과 소수점 3자리까지 일치)로 재니 `#6157ea` 가 **정확히 그 값**이었다.
  md 의 Don't `색을 hex 로 하드코딩하지 않는다` 는 소비처 구현 지침이지 값 서술
  금지가 아니다.
- **footer 16 개 micro-claim 무변경.** `Colors · 11 hue` · `Typography · 2 weight` ·
  `Elevation · 6단계` · `Motion · 150ms` · 패키지 3종(버전 포함) 모두 md 실측치다.
- **`BEZIER DESIGN SYSTEM` 워드마크·`Bezier Design System` 토프바 무변경.**
  md Don't 에 *"디자인시스템 이름을 생성하는 제품 UI 의 헤더·타이틀에 넣지 않는다"*
  가 있으나, 그건 **Bezier 로 만드는 제품**에 대한 지침이다. 이 프리뷰는 Bezier 를
  문서화하는 카탈로그 표면이고, 17개 프리뷰가 모두 자기 브랜드를 chrome 에 적는다.
- **`.fh-cap` #6 의 `다크 바`(light) / `라이즈드 다크 바`(dark) 무변경.** 둘 다
  참이다 — md 가 *"떠 있는 다크 바"* 라 적으므로 "라이즈드" 쪽이 오히려 md 에 가깝다.
- **`3-페인 앱 셸` 무변경.** `.desk-chat` 이 ≤900px 에서 숨어 그 폭에선 2페인이지만,
  이 문장은 데스크톱 레이아웃을 서술하고 md 는 브레이크포인트 토큰을 발행하지 않는다
  (`## Known Gaps` 첫 항). 반응형 분기는 다운스트림 몫이라는 것이 md 의 입장이다.

## 검증

```
validate:previews (bezier)  0 blocking · warn 8 (기준과 동일, 신규 0)
validate:catalog PASS   tokens:check 17 in sync   audit:oklch 0 mismatched
check:last-updated  services/*.md 무변경으로 해당 없음
typecheck / lint PASS   test 512 passed (37 files)   build PASS
```

warn 8건(`bare-1fr`·`hex-colors-present`·`no-mobile-collapse`·`rgba-colors-present`
× 양 테마)은 기준 커밋 `8cb74a6` 에 이미 있던 것으로 정정 전후 목록을 정렬 대조해
**차이 0** 을 확인했다.

**375 / 768 / 976 / 1440 × light·dark 에서 문서 오버플로우 0 · 서술 표면 잘림 0.**
`.fh-cap` 은 1440·976 에서 7개 전부 보이고 375 에서 0개로, 문서화된 `@media` 거동과
일치한다.

편집 후 라이트·다크 산문 발산은 6줄이며 **전부 의도된 것**이다 — 히어로 lede 의
테마별 캔버스 서술(`밝고 깨끗한` / `어두운 grey-900`), `.fh-cap` #6 의 수식어,
그리고 이번에 넣은 다크 Toast 재현 표기.

## 남은 것 — 10차 이후

**저작권 축만 판정된 항목은 이제 없다.** 잔여는 서술 전수 미착수 9개다.

이번에 9개 슬러그의 서술 표면을 **실측**했다. 후보 표(대표 클래스 하나의 후보 수)는
이 표로 대체한다.

| slug | 파일 줄 | 실측 서술 표면 | `<pre>` | 밀도 |
| --- | --- | --- | --- | --- |
| vapor-ui | 1933 | 32 (~40) | — | 높음 |
| kyobobook | 1529 | 26 | **4개** | 높음 (블록당 3~4주장) |
| codeit | 1358 | 24 (~28) | 1개 | 높음 |
| gmarket | 1493 | 23 | — | 높음 |
| baemin | 1779 | 19 | — | 중상 |
| class101 | 1232 | 16 | — | 중상 |
| 11st | 1717 | 14 (~25) | — | 중간 |
| yeogi | 1723 | 9 | — | 낮음 |
| teamsparta | 304 | **1** | — | 매우 낮음 |

**10차는 `teamsparta` + `yeogi`(합 10)가 유일하게 정당한 묶음이다.** 나머지는 단독
또는 이 둘 중 하나와만 짝짓는다 — bezier 92, wanted 55 가 한 PR 이 감당한 규모의
윗선이었고, 리뷰가 그 규모에서 실제 결함을 잡아 왔다.
