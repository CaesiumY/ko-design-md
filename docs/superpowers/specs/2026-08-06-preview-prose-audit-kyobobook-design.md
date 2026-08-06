# 프리뷰 산문 감사 — kyobobook (교보문고 KDS)

- 날짜: 2026-08-06
- 대상: `public/preview/kyobobook/{light,dark}.html`
- **감사 기준 커밋: `454d79a`**

## 이 문서의 핵심 — 감사 전제가 틀렸다

**정정 5건을 올렸다가 4건을 되돌렸다.** 원본 Claude Design 프로젝트
(`교보문고 Design System (KDS)`, `e26b1c23-…`)를 열어 대조하니 **프리뷰가 맞고 내가
틀렸다.**

| 내가 "무근거" 라 판정한 것 | 원본 |
| --- | --- |
| `State — hover` · `hover는 blue-800` | `<span class="val">**Hover**</span>` + `.primary.**hover**{background:var(--kds-blue-800)}` |
| `disabled는 gray-200/gray-400` | `.primary.**dis**{background:var(--kds-gray-200);color:var(--kds-gray-400)}` |
| `focus 보더는 **1.5px** blue-700` | `.fld.**focus**{border-color:var(--kds-blue-700);**border-width:1.5px**}` |
| `딤은 검정 **45%** 알파` | `.scrim{background:rgba(0,0,0,**.45**)}` |

네 건 모두 **원본을 축자에 가깝게 재현한 것**이었다. 프리뷰는 정확했다.

### 왜 틀렸나 — md 는 원본의 손실 있는 전사다

이 계열의 규칙은 *"프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는 주장을 하지
않는다"* 이고, 그 규칙은 **md ⊇ 프리뷰의 근거**를 전제한다. **그 전제가 이 슬러그에서
성립하지 않는다.** md 와 프리뷰는 **둘 다 같은 번들에서 나왔고**, md 가 컴포넌트
상태·수치를 상당 부분 옮기지 않았다. md 에 hover 가 0건인 것은 *"hover 가 없다"* 가
아니라 *"md 가 hover 를 안 적었다"* 였다.

**md 의 침묵을 프리뷰의 오류라는 증거로 썼다.** 이것이 이 감사가 저지른 오류의
정확한 형태다.

### 규칙을 이렇게 좁힌다

- **md 가 값을 적지 않았다 = 프리뷰가 틀렸다, 가 아니다.** 상류(핸드오프 번들 ·
  Claude Design 프로젝트)를 확인하기 전에는 "md 에 없음" 을 결함으로 판정하지 않는다.
- md 가 값을 **적었는데 프리뷰가 다르게** 적은 경우(오귀속·상태 오매핑)는 그대로
  결함이다. 아래 유일한 정정이 그 형태다.
- 상류가 프리뷰를 뒷받침하는데 md 가 비어 있으면, **고칠 것은 프리뷰가 아니라
  md 다**(3차 `radius8` 이 이 계열에서 처음 md 를 고친 선례다). 이번엔 범위를 넘어
  후속으로 남긴다.

> **사용자가 먼저 알아챘다.** *"지금 다 pressed 로 바꾸고 있는 거야? hover 가 맞을
> 수도 있지 않아?"* — 세 라운드의 봇 리뷰가 모두 통과시킨 변경이었다. 리뷰어도 md 만
> 근거로 삼았기 때문에 같은 전제를 공유했고, **같은 전제를 공유한 검증은 그 전제를
> 검사하지 못한다.**

## 유효한 정정 — 1 개 표면

| 표면 | 종전 | 판정 |
| --- | --- | --- |
| `<pre>` Button `size` | `// L(H50) MO · M(H44) PC · S(H38)` | md `:417`·`:423` 이 이 수치를 **`Input/Dropdown` 높이**로 적는다. **원본에도 Button 의 L/M/S 사다리가 없다** — 버튼 44px · 캡슐 38px · 입력 44px 는 서로 다른 컴포넌트다. 즉 md 와 원본이 **함께** 이 주장을 부정한다 |

이 건이 남는 이유는 **md 의 침묵이 아니라 md 와 원본 양쪽의 반증**에 기대기 때문이다.

## 서술 표면 특정 — 51 개

`.demo-label` 11 + `.panel-note` 7 + `.panel-title` 7 + `<pre class="code-card">` 4 +
`.meta-chip` 4 + `.help` 4 + `.section-desc` 2 + `h2` 2 + `.kicker` 2 +
`.hero-copy` · `.eyebrow` · `h1` · `.loading-caption` · `.footer-note` · `.theme-pill`
각 1 + 고지 2 = **51**(고지 2 제외 시 49).

> **이 파일에 대한 네 번째 계수다.** H-1 이 술어 A 로 16, 술어 B 로 31, H-2 후보 표가
> `panel-note` 로 7, 이번 실측이 51. **숫자가 다른 게 아니라 포함 규칙이 다르다.**

한글 CSS 주석 0개. `@media` 로 숨는 서술 표면 없음.

## 고치지 않은 것

- **위 4건 전부.** 원본이 뒷받침한다.
- **`shadow-green-100(green 40% alpha)`** — `40%` grep 0건이었으나 md `:217` 이
  `oklch(… / **0.40**)` 로 적는다. 5차(toss)의 *"리터럴 grep 0건은 근거가 아니다"* 가
  퍼센트↔소수 표기에서 재현됐다.
- **`element="box" // box | text | icon | capsule`** — md 절 이름들의 어휘이고
  원본 `comp-button-patterns.html` 도 Text · Icon · Capsule 세 패턴을 카드로 그린다.
- **다크 프리뷰의 자기 서술** — md 가 다크 토큰을 추정하지 않겠다고 못 박는데 다크
  프리뷰는 `mode="dark-derived"` 로 스스로를 파생물로 밝힌다. 이미 정직하다.
- **`KDS` 워드마크** — md Don't 는 KDS 로 만드는 제품에 대한 지침이고 이 프리뷰는
  KDS 를 문서화하는 카탈로그 표면이다.

## 검증

```
validate:previews (kyobobook)  0 blocking · warn 4 (기준과 동일, 신규 0)
validate:catalog PASS   test PASS   build PASS
```

## 남은 것 — 전수 재점검이 필요하다

**이 오류 형태가 이 슬러그에만 있었는지 확인되지 않았다.** 이 계열이 지금까지 착지시킨
정정 중 *"md 에 없다"* 만을 근거로 삼은 것은 전부 같은 위험을 안는다. 각 슬러그의
Claude Design 원본과 대조해 재점검할 것 — 별도 작업으로 연다.

잔여 미감사: `vapor-ui` · `codeit` · `gmarket` · `baemin` · `class101`.
