# vapor-ui `## Components` — 상류 전수 대조

- 날짜: 2026-08-16
- 기준 커밋: `6dd0dea`
- 발단: `2026-08-07-preview-prose-audit-false-positive-ledger.md` §「상류 미확인으로 남긴 것」
  — 되돌리기가 `DesignSync` 없이 집행돼 2건을 유보했고, 대장이 **"상류를 읽을 수 있는
  세션이 이 둘을 다시 볼 것"** 으로 남겼다
- 상위 규칙: `CLAUDE.md` §「인용은 존재가 아니라 내용 일치」 ·
  §「다만 상류가 늘 이기는 건 아니다」

## 결론 요약

**`## Components`(md `:384`–`:590`, `###` 항목 36개)는 상류가 뒷받침하지 않는다.** 값 몇
개가 어긋난 것이 아니라 **기술 대상 자체가 다르다.** 이 문서는 그 실측을 남기고, 재저작은
별건으로 넘긴다 — **이 PR 은 md 값을 고치지 않는다.**

> **두 개의 35 를 섞지 말 것.** md 의 `###` 항목은 **36개**이고, 대조에 쓴 1.3.0 배포본의
> 컴포넌트 CSS 파일은 **35개**다. 서로 다른 수이고 1:1 대응도 아니다 — md 는 `button` 을
> variant 별로 8개 항목(`button-primary` · `button-danger-outline` …)으로 쪼개 싣는 반면
> 패키지는 `button.css` 하나이고, 반대로 패키지의 `field` · `text` · `grid` 는 md 에
> 항목이 없다.

## vapor-ui 는 번들이 상류가 아니다

md 의 `sources` 5개가 전부 공개 출처이고 번들을 가리키지 않는다:

| # | 출처 |
| ---: | --- |
| 1 | `vapor-ui.goorm.io` (공식 문서) |
| 2 | `blog.goorm.io/vapor-figma-seoul/` |
| 3 | Figma Community 파일 |
| 4 | npm `@vapor-ui/core` |
| 5 | **`github.com/goorm-dev/vapor-ui`** (공개 저장소) |

`CLAUDE.md` 「번들이 상류인 것은 md 가 번들에서 나왔을 때뿐이다」 항에 따라
**`seed-design` · `class101` 과 같은 경우**다. 판정은 공개 저장소와 npm 배포본으로 한다.

## 방법 — md 가 스스로 고정한 버전으로 대조했다

md `:37` 감사 메모가 팔레트를 **`@vapor-ui/core` 1.3.0** 기준으로 고정해 두었으므로,
같은 1.3.0 배포본을 받아 대조했다. **HEAD 로 비교하면 버전 드리프트를 결함으로
오인한다** — 저장소는 어제(2026-08-15)도 푸시됐고 문서 사이트는 1.5.0 을 서빙한다.

절차:

1. `@vapor-ui/core@1.3.0` 의 컴포넌트 CSS 35개 + 믹스인 CSS 를 jsDelivr 로 받았다
   (패키지 전체 553 파일)
2. `themes.css.ts.vanilla.css` 에서 CSS 변수 239개를 추출해 재귀 해석했다
3. `--vapor-scale-factor` · `--vapor-radius-factor` 는 `variables.css.ts` 가
   `@property … initialValue: '1'` 로 선언하므로 **배율 1** 로 두었다
4. 해석된 선언을 md 의 각 `###` 항목과 대조했다

## 실측 — 값 자체가 존재하지 않는다

**1.3.0 배포본 전체(컴포넌트 35 + 타이포/포어그라운드 믹스인)에서:**

| 검사 | 결과 |
| --- | --- |
| `font-size: 13px` | **0건** |
| `font-weight: 600` | **0건** |
| 실재 font-size | 10 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 38 · 48 · 64 · 80 · 120 |
| 실재 font-weight | 400 · 500 · 700 · 800 |

**md 는 `13px` 을 8곳, 무게 `600` 을 9곳 쓴다.** 토큰 원본
(`packages/design-tokens/raws/typography.json`)도 `fontWeight` 를 400/500/700/800 으로만
정의하고 `fontSize['075']` 를 14px 로 둔다. **버전 요인이 아니다** — 1.3.0 테마 CSS 에도
`13px` 이 0건이다.

**md 자신의 Typography 절이 이 스케일을 정확히 싣는다**(`size-075: 14px` 등 13단이 토큰
원본과 완전 일치). 즉 md 는 **자기가 발행한 스케일에 없는 값을 컴포넌트 절에서 쓴다.**

## 항목별 대조

| md 항목 | md 주장 | 1.3.0 실측 |
| --- | --- | --- |
| `button` | `sm` 28×10×13 · `md` 32×12×14 · `lg` 40×16×15 · `xl` 48×20×16 | `sm` 24×8 · `md` 32×12 · `lg` 40×16 · `xl` 48×**24**; **font-size 선언 0건**(사이즈별 폰트 없음) |
| `badge` | **단일 사이즈** 22px · padding 0 8px · **600**/12px | **3사이즈** 20·24·32 · padding 0 6/8/12 · **500** · 12/14px |
| `text-input` | **36px** 단일 · padding 0 12px · border 1px | **4사이즈** 24·32·40·48 · padding-inline 8/12/16/24 · font 12/14/16 · inset box-shadow ring(border 아님) |
| `textarea` | 높이 auto · padding 8 12px | padding-block 4/6/8/14 × padding-inline 8/12/16/24 (4사이즈) |
| `select` | 36px · 옵션 34px · 팝업 padding 6px · 선택 시 **600** | 24/32/40/48 · 옵션 32px · 팝업 padding 4px · 600 없음 |
| `multi-select` | min-height 36px · 칩 **600**/12px | min-height 24/32/40/48 · 600 없음 |
| `input-group` | addon **500 / 13px** · 36px | font **12px / 400** |
| `checkbox` | **18×18** · radius 4px | **16×16**(radius 4px) / **24×24**(radius 6px) |
| `radio` | **18×18** | **16×16 / 24×24** |
| `switch` | **36×20** · knob 16×16 | **32×18 / 40×24 / 56×32** · knob 14/16/24 |
| `radio-card` | padding 14 16px · radius 12px · 타이틀 **600**/14px | padding-block 5px · padding-inline 12px · radius **8px** |
| `card` | radius **12px** · padding 콘텐츠 주도(시스템 기본값 **없음**) | radius **8px** · padding `16px 24px`·`24px` **실재** — `## Known Gaps` 의 부재 주장도 함께 철회했다 |
| `icon-button` | 32×32 · radius **8px** · SVG 18×18 | radius **9999px** · 아이콘 `max(16px, 50%)` |
| `tabs` | padding 10 14px · 500/14px · active **600** | 높이 24/32/40/48 · padding-inline 4/16 · radius 8px |
| `breadcrumb` | gap 6px · 500 / **13px** | 크기 14/16/20 · 13px 없음 |
| `menu` | padding 6px · 항목 padding 0 10px · 500 / **13px** | padding 4px · padding-left 20px / padding-right 12px · 항목 높이 32px ✅ · min-width 200px ✅ |
| `navigation-menu` | 항목 **34px** · 500 / **13px** · active **600** · 섹션 라벨 11px | 높이 24/32/40/48 · font 12/14/16 · 600 없음 |
| `pagination` | 32px · radius **6px** · 500 / **13px** | 24/32/40/48 · radius **8px** |
| `avatar` | **32×32 단일** · **600**/12px | **24/32/40/48** · font 12/14/18/20 · weight 500·700 |
| `table` | padding **12 16px** · th **600 / 13px** · th bg · row hover | padding-block **8px** / padding-inline **24px** · th `subtitle1`(14px/500) · **th bg 없음** · **hover 규칙 없음** |
| `callout` | padding 12 14px · 아이콘 22×22 · 타이틀 **600**/13px | padding `12px 16px` · gap 6px · height 22px |
| `popover` | radius **12px** · padding 16px · min-width **240px** · 본문 400/**13px** | radius **8px** · padding-block 12 / inline 16 · min-width **200px** |
| `sheet` | width **400px**(max 92vw) · radius 16px · 헤더 padding 18 20px | width **300px** · height 80svh · radius **0** · padding-top 20 / bottom 8 / inline 12 |
| `dialog` | radius **16px** · padding 24px · max-width **480px** · 스크림 `oklch(0 0 0 / .4)` | radius **8px** · padding-inline 24px · width **500 / 800 / 1140px** 3단 · 스크림 `#000000` opacity **.32** |
| `toast` | min-width 280px · gray-900 bg | width **400px** · padding 16px · bg `#393939`(+ 상태색 `#da3944`·`#058765`) |
| `tooltip` | radius **6px** · 500/12px | radius **8px** · padding-block 6 / inline 8 ✅ · bg `#393939` ✅ |

맞는 것도 있다 — `menu` 의 항목 높이 32px·min-width 200px, `tooltip` 의 padding,
`button` 의 `md`·`lg` 치수. **부분적으로 맞는 것이 이 절의 가장 위험한 성질이다**:
표본으로 몇 개만 확인하면 통과한다.

## `vp-*` 클래스 체계가 상류에 없다

md `:267` 은 이렇게 적는다:

> 시맨틱 typography 클래스는 `vapor.css` 로 컴파일되어 host 앱에서 직접 클래스 이름으로
> 호출 가능하다 `[src:5]`

그리고 `:423` · `:465` 가 `<button className="vp-btn-primary vp-btn-md">` ·
`<span className="vp-badge-soft-success">` 를 예제로 싣고, Typography 표는 `vp-display4` ·
`vp-h1` 을 클래스명으로 발행한다.

**1.3.0 배포본 553개 파일 전체에서 `vp-` 문자열이 0건이다.** 받은 CSS 전량을 바이트로
grep 했고 `.vp` 로 시작하는 클래스도 0건이다. 실제 클래스는 vanilla-extract 해시
(`.button-rdwa1t7` · `.table-f4536r2`)다. `tailwind-preset` 에도 없다. 공개 저장소에도
`vapor.css` 파일이 없다.

즉 어긋난 것은 **값이 아니라 기술 대상**이다.

## 이 PR 이 값을 고치지 않는 이유

**고치려면 `## Components` 206줄을 1.3.0 에서 다시 써야 한다** — 정정이 아니라 재저작이고
`/design-md` 의 일이다. 그리고 프리뷰가 md 에서 나왔으므로 `public/preview/vapor-ui/` 와
`services/vapor-ui.tokens.json` · OG 까지 연쇄한다. 성격과 분량이 다른 작업을 이 대조와
섞으면 리뷰가 불가능해진다 — #288 을 #287 에서 분리한 것과 같은 이유다.

**대신 값을 보기 전에 단서를 지나가게 했다.** `## Components` 첫머리에 감사 메모를 넣어
이 절이 상류 미대조 구간임을 밝힌다. `CLAUDE.md` 가 「값과 같은 화면에 둔다」로 정한
자리가 여기다.

### md 에는 결론만 넣는다 — 증거는 이 문서가 갖는다

초판 감사 메모는 실측 통계(`13px` 8곳 · 무게 `600` 9곳 · 배포본 553파일 · font-size
사다리 13단) · `vp-*` 서술의 자기 줄번호 · 이 스펙 문서 경로 · 재저작 이슈 번호를
전부 담고 있었다. **걷어냈다.**

`services/*.md` 는 브랜드의 디자인 시스템을 기술하는 **카탈로그 항목**이고 저장소 밖으로
복사돼도 유효해야 한다(`logo` 를 절대 URL 로 못박은 것과 같은 이유다). 저장소 운영 정보는
그 장르가 아니다:

- **실측 통계**는 감사 포렌식이다. 소비자에게 필요한 것은 **"이 값 믿지 마라"** 하나이고
  근거의 상세는 이 문서의 몫이다
- **`docs/superpowers/specs/…` 경로**는 저장소 밖에서 죽는다. 기존 감사 메모들은 전부
  `[src:N]` 으로 근거를 밝힌다 — 이 메모도 `[src:4]`(npm 배포본)로 바꿨다
- **이슈 번호**와 `#`+세 자리가 `hex-in-prose` 로 읽힌다는 우회 설명은 **검증기 함정**이다.
  브랜드 문서에 적을 것이 아니다

`CLAUDE.md` 가 References 규칙에서 이미 같은 선을 긋는다 — *"재감사할 때마다 늘어나는
'N차 확인' 이력은 쓰지 말 것 — **그건 커밋 메시지와 PR 설명의 몫이다**."* 감사 메모도
같다. 라벨 예로 든 `대조 결과` · `팔레트 정정` · `프로비넌스 정정` 은 전부 **값에 무슨
일이 있었나**를 말하지 **저장소가 그 값을 어떻게 처리 중인가**를 말하지 않는다.

**봇 리뷰 4라운드가 이것을 통과시켰다** — 형식(블록쿼트 · 섹션 첫머리 · 괄호 안 날짜 ·
섹션당 하나)은 완벽했고 리뷰는 매 라운드 그것을 확인했다. **장르가 맞는가는 형식 검사로
나오지 않는다.**

## 대장의 2건은 이렇게 닫힌다

- **`table th`** — 상류는 프리뷰의 `12px` 도 md 의 `13px` 도 뒷받침하지 않는다(th 는
  `subtitle1` = **14px / 500**, td 와 같은 크기). 프리뷰 캡션의 `이 프리뷰의 재현` caveat 는
  **유지가 맞다** — 다만 근거가 "md 가 13px 을 싣기 때문" 이 아니라 "어느 쪽도 상류값이
  아니기 때문" 으로 바뀐다.
- **툴팁 카피** — `삭제하면 복구할 수 없다/없습니다` 문자열이 상류에 없다(데모용
  창작). 되돌리기가 존댓말로 고친 것은 md `:31` 의 보이스 정책을 따른 것인데, **그
  정책의 상류 근거는 이 라운드에서 확인하지 못했다** — 저장소 코드 검색으로는 0건이나
  코드 검색의 0건은 약한 근거이므로 단정하지 않는다. **판정 유보**로 남기고 재저작
  단계에서 문서 사이트 `[src:1]` 로 확인할 것.

## 남기는 교훈

**md 가 자기 토큰 스케일과 어긋나면 그 자리가 먼저다.** 이 건은 상류를 열기 전에도
잡을 수 있었다 — md 의 Typography 절이 발행한 13단 스케일에 `13px` 이 없는데 컴포넌트
절이 8곳에서 쓰고, 무게 `600` 도 9곳에서 쓰는데 스케일은 400·500·700·800 뿐이다.
**한 문서 안의 자기모순은 상류 접근 없이도 검사 가능한 신호**이고, `validate:catalog` 가
기계로 잡을 여지도 있다.

**그리고 세는 것 자체를 조심할 것.** 이 문서의 초판이 `600` 을 6곳으로 적었다 — 정규식이
`font 600` · `600 /` 형태만 잡고 `+ 600으로`(2건) · `+ 600 +`(1건)을 놓쳤다. 리뷰가
잡아 9곳으로 고쳤다. **부재를 셀 때는 표기 변형을 먼저 열거하라** — 이 계열이 리터럴
grep 0건을 근거로 쓰지 말라고 반복해 경고한 것과 같은 실패다.

**팔레트만 교체하고 끝내면 나머지가 남는다.** md `:35` 의 감사 메모는 색 110개를 번들에서
공개값으로 갈아끼운 기록인데, **같은 번들에서 온 컴포넌트 절은 그때 함께 검사되지
않았다.** 출처가 통째로 의심스러우면 그 출처가 먹인 **모든 절**이 대상이다.

## 검증

```
validate:catalog    vapor-ui.md ok — 0 blocking · 0 warn (기준선 6dd0dea 와 동일)
tokens:check        17 sidecar(s) in sync
audit:oklch         0 token(s) mismatched
check:last-updated  1 changed file — 0 issue(s)
```
