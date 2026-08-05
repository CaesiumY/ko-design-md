# 프리뷰 HTML 용량 전략 재검토 설계

> **측정 기준선**: `origin/main` = `6420c0a` (2026-08-02). 초안은 `f7b2554` 기반이었고
> 그 사이 15커밋이 들어와 전 수치를 재측정했다. 바뀐 것과 그대로인 것은
> "재측정 결과" 절에 정리했다.

## 배경

PR #197(그리팅 온보딩) 리뷰에서 claude-review 가 후속 과제를 남겼다 — "카탈로그가 커질수록
이런 대형 프리뷰가 누적되는 추세라, 장기적으로 카드 갤러리를 공용 컴포넌트/압축 방식으로
다루는 논의는 언젠가 필요해 보인다".

`public/preview/*/` 전수에서 100 KiB 가이드라인 초과는 2건(greeting, bezier)이고,
greeting dark 는 121.7 KiB 로 `scripts/validate-preview.ts` 의 128 KiB 하드캡까지 여유가
**6.3 KiB** 뿐이다. 코퍼스에서 두 번째로 빠듯한 bezier 가 21.4 KiB 이니 3.4 배 차이다.
다음 대형 항목이 들어오면 바로 block 된다.

착수 전 가설은 "카드가 많은 게 원인이고, light/dark 중복 제거·minify 로 줄인다" 였다.
실측 결과 이 가설의 절반이 틀렸다.

## 실측 결과

### 전송 성능은 이미 비문제

Vercel 이 프리뷰 HTML 을 brotli 로 서빙 중이다. 라이브 헤더 확인:

```
$ curl -sI -H 'Accept-Encoding: br' https://getdesign.kr/preview/bezier/light.html
content-encoding: br
$ curl -s -o /dev/null -w '%{size_download}' ... → 21817
```

raw 105.6 KiB 가 실제로는 21.3 KiB 만 내려간다. 압축률은 전 프리뷰가 14.6~22.4% 로 균일하고,
카드가 반복될수록 사전이 잘 먹혀 **파일이 클수록 압축률이 좋아지는** 역설이 있다 (가장 작은
teamsparta 가 22.4% 로 압축률 꼴찌).

| | raw | brotli |
|---|---|---|
| greeting light | 119.8 KiB | 18.9 KiB |
| bezier light | 106.0 KiB | 16.4 KiB |
| light 17개 합계 | 1,146 KiB | 190 KiB |

(위 `21817` 은 실측 시점 배포본 기준이다. 로컬 q11 재압축은 16.4 KiB 로, 호스트가 쓰는
품질 설정이 달라 몇 백 바이트 차이가 난다 — 결론에는 영향이 없다.)

### light/dark 중복은 실재하나 기계적으로 접히지 않는다

greeting 기준 `<style>` 블록의 91.4%, `<body>` 의 87.7% 가 바이트 단위로 동일하다.
나머지 12% 는 사고가 아니라 의도다 — 다크 전용 해설 산문과 **다크 실측 OKLCH 값**을
텍스트로 인쇄하는 부분이다. 따라서 이 12% 는 **중복 제거 대상이 아니다.**

다만 "중복을 제거할 수 없다"와 "한 파일에 담을 수 없다"는 다른 명제다. 후자는 거짓이며,
`data-theme-only` 속성 + CSS 한 줄이면 양쪽을 공존시킬 수 있다 (설계 4).

### 두 파일 구조는 드리프트를 구조적으로 허용한다

이건 용량과 무관한, 더 무거운 비용이다. 라이트의 오타를 고치고 다크를 빠뜨리는 사고가
막을 장치 없이 열려 있다. 실제로 열려 있는 이슈 #187 이 같은 뿌리다 —
`scripts/audit-oklch.ts:319` 의 드리프트 루프는 **`light.html` 만** 검사한다. 다크는
`[data-theme="dark"]` 스코프에서 토큰을 설계상 다른 값으로 재정의하므로 라이트 기준 md 와
비교하면 오탐이 231건 쏟아지기 때문이다. 파일 단위로는 "이 파일이 어느 테마인지"가
암묵적이라 이 구분을 못 한다.

### greeting 의 이상치는 카드 수가 아니라 스와치 밀도

섹션별 바이트 (light 기준, body 총 78.2 KiB):

| 섹션 | 카드 | 바이트 | `fillOnly` |
|---|---|---|---|
| Components | 19 | 25,106 | 1 |
| **Colors** | **11** | **22,147** | **78** |
| Greeting ATS | 1 | 8,075 | 0 |
| **Type** | **5** | **8,287** | **0** |
| Shape | 4 | 6,056 | 3 |
| Brand | 3 | 2,602 | 0 |
| Spacing | 1 | 2,291 | 0 |

Colors + Type = 30,434 B. `fillOnly` 82 중 **78 이 Colors 한 섹션**에 몰려 있다.

`<style>` 블록은 43.0 KiB 인데 toss 가 43.7, bezier 가 40.2 다 — style 은 이상치가 아니다.
body 78.2 KiB(코퍼스 중앙값 약 27 KiB)가 전부다.

### 그 콘텐츠는 루브릭이 이미 금지하고 있다

`.claude/skills/design-md/references/rubric-preview.md` 가 두 조항으로 못박고 있다.

- L23: *"The preview is a **component demo**, not a swatch catalog — the standalone
  color-swatch grid moved to the token cards … **Failure modes**: rebuilding a
  color-swatch showcase grid"*
- L34: *"**No standalone type-scale showcase** — the documented scale lives in the token cards"*

그리고 `services/greeting.tokens.json` 이 이미 `colors: 65`, `typography: 22` 를 담아
상세 페이지 토큰 카드로 렌더한다. 즉 Colors + Type 29.7 KiB(body 의 38%)는 토큰 카드와의
순수 중복이다.

**진짜 갭은 "용량 전략 부재"가 아니라 이 두 산문 조항에 결정론적 검사가 없다는 것이다.**
용량은 위반의 증상이었다.

### 하드캡이 노린 사고는 한 번도 일어나지 않았다

캡의 자체 에러 문구는 `"inline assets or duplicated markup have run away"` 인데, 현재
17개 프리뷰 34개 파일에 `data:` / base64 인라인 자산은 0건이다. 지금까지 이 캡을 위협한
것은 정당한 콘텐츠뿐이었다.

## 재측정 결과 (`f7b2554` → `6420c0a`)

초안 이후 main 에 15커밋이 들어왔고 셋이 측정 기반을 직접 건드렸다.

- `0ef7891` — greeting 이 main 에 머지됐다 (초안은 미머지 브랜치 기준이었다).
- `4198b38` — **프리뷰 34개 전부에 고지 스트립이 추가**됐다. 모든 파일 크기가 바뀌었다.
- `b0d88f5` — 그 스트립이 **block 규칙 3종**으로 승격됐다 (아래 "공존해야 하는 기존 게이트").
- `770e4cc` · `6420c0a` — greeting 프리뷰를 두 번 더 다듬었다 (카드 46 → 44).

**바뀐 것**

| | 초안 | 현재 main |
|---|---|---|
| greeting light / dark | 124.0 / 125.7 KiB | **119.8 / 121.7 KiB** |
| 하드캡 여유 | 2.3 KiB | **6.3 KiB** |
| 카드 수 | 46 | **44** (Brand 5 → 3) |
| 최대 brotli (코퍼스) | 20.2 KiB | **19.4 KiB** |

**그대로인 것** — 결론을 떠받치는 것들은 전부 살아남았다.

- 캘리브레이션 표가 **한 숫자도 바뀌지 않았다**: greeting `colorLabels` 26 / `typoLabels` 22 /
  `fillOnly` 82, socar 16 / 1 / 0, bezier 0 / 0 / 7. 임계값 재조정이 필요 없다.
- PR-1 의 제거 대상 카드 9장이 **전부 그대로 존재**한다 (Colors 11장 · Type 5장 무변).
  카드 46 → 44 는 Brand 섹션 감소분이다.
- 100 KiB raw warn 발화 대상은 여전히 greeting 과 bezier 둘뿐이다.
- 검증기의 `BLOCK_BYTES` / `WARN_BYTES` 는 128 / 100 KiB 그대로다.
- 병합의 구조적 전제도 유지된다: `:root` 뒤 컴포넌트 규칙 445줄이 양 테마 동일,
  body 차이 39 + 39줄이 전부 자기완결 균형 요소.

## 공존해야 하는 기존 게이트 (#210 / #212)

`preview-validator.ts` 에 이미 block 규칙 3종이 있다. 설계 4(병합)가 이것들을 깨지 않아야 한다.

- `missing-disclaimer-banner` — `<div class="catalog-disclaimer" role="note">` 필수
- `disclaimer-banner-misplaced` — **`<body>` 의 첫 자식**이어야 함
- `disclaimer-banner-incomplete` — 비제휴 · 더미데이터 두 문장 필수

greeting 의 고지 스트립은 **라이트/다크 바이트 동일**(192 B)하고 양쪽 다 첫 자식이므로,
LCS 병합이 공유 줄로 처리해 단일 스트립 · 첫 자식 · `data-theme-only` 미부착으로 나온다.
POC 로 확인했다. 다만 이는 스트립이 두 테마에서 동일하다는 사실에 의존하므로, 검증기의
병합 대응은 **스트립이 `data-theme-only` 를 달고 있으면 block** 하는 규칙을 추가해야 한다
(한쪽 테마에서 고지가 사라지는 것을 막는다).

## 목표

- greeting 프리뷰를 기존 루브릭 조항에 맞춰 정리해 하드캡 여유를 회복한다.
- 그 루브릭 조항 두 개를 결정론적 규칙으로 승격해 재발을 기계로 막는다.
- 크기 게이트의 측정 단위를 실제 배포되는 형태(brotli)로 바꿔, 소스 가독성에 물리던
  세금을 없앤다.
- light/dark 를 단일 파일로 병합해 CSS·마크업 중복과 **테마 간 드리프트 자체**를 없앤다.
- 기존 16개 프리뷰 중 회귀하는 항목이 0개임을 캘리브레이션으로 보장한다.

## 비목표

- slug 별 `shared.css` 를 도입하지 않는다 — 단일 파일 병합이 같은 목표를 더 크게 달성한다
  (디스크 120.3 vs 209.8 KiB). 아래 "기각한 대안" 참조.
- 배포 시 minify 를 도입하지 않는다.
- 프리뷰의 **시각적 결과물과 레이아웃**을 바꾸지 않는다 (테마 전환 *방식*은 바뀐다).
- greeting 외 기존 16개 프리뷰를 이번에 재생성하지 않는다.
- 카드 **수** 자체에 상한을 두지 않는다 — 문제는 수가 아니라 종류였다.

## 설계

### 1. greeting 프리뷰 루브릭 정합 (PR-1)

Colors 섹션 11장, Type 섹션 5장 중 **스탠드얼론 스와치 그리드 / 스케일 쇼케이스**에 해당하는
카드를 제거한다. 판정 기준은 루브릭 L23 의 "in application" 원칙이다.

- **제거**: 램프 단계를 열거하는 카드 (Accent ramps, Blue ramp, Gray ramp, Murky ramps,
  Neutral overlay, Dark mirror), 스케일 이름을 열거하는 카드 (Body scale, Item scale,
  Title scale)
- **유지**: 토큰을 사용 맥락에서 보여주는 카드 (Murky in use 의 "Fill = ramp 100,
  text = ramp 800" 레시피, Borders & surfaces, Text colours, InterviewColor 처럼
  이 브랜드 고유의 시맨틱 그룹)

`<style>` 의 `:root` 토큰 선언은 **그대로 둔다**. `coverage()` 는 파일 전체를 스캔하므로
body 스와치를 걷어내도 커버리지가 유지된다 — greeting 의 body 전용 OKLCH 리터럴은 0개다.
더 공격적인 가정(Colors·Type **섹션 전체** 제거)으로 실측해도 커버리지는 75/84 → 75/84 로
불변이었으므로, 그보다 보수적인 카드 단위 제거는 당연히 유지된다.
(애초에 `coverage` 는 `metrics` 로만 리포트되고 `issues` 를 만들지 않는다.)

**판단 경계선**: "Brand & System"(brand·link·info·success·warning·danger 6칩)은 엄밀히
말하면 작은 스와치 그리드지만, 컴포넌트 데모의 **범례** 역할을 하므로 유지한다. 이 카드까지
제거하면 시맨틱 역할↔램프 단계 매핑을 프리뷰에서 읽을 수 없게 된다.

실측 결과 (제거/유지 목록을 카드 단위로 적용, `origin/main` `6420c0a` 기준):

| | 현재 main | PR-1 후 |
|---|---|---|
| light.html | 119.8 KiB (br 18.9) | **101.5 KiB (br 17.1)** |
| dark.html | 121.7 KiB (br 19.4) | **103.0 KiB (br 17.5)** |
| 하드캡 여유 (raw 128 KiB) | 6.3 KiB | **25.0 KiB** |
| `fillOnly` | 82 | **18** |
| `typoLabels` | 22 | **0** |

**순서상 주의**: PR-1 직후 light 101.5 KiB 는 기존 100 KiB raw warn 라인을 여전히 넘는다
(block 이 아니라 warn 이므로 CI 는 통과한다). 이 warn 은 PR-2 의 brotli 전환으로 해소된다.
Colors·Type **섹션 전체**를 들어내면 warn 도 사라지지만, 그러면 적용 맥락 카드까지 잃으므로
채택하지 않는다.

### 2. 결정론적 규칙 2종 추가 (PR-2)

`src/lib/preview-validator.ts` 에 두 규칙을 추가한다. 두 지표는 서로 직교하고, 클래스명·
마크업 구조와 무관해 이름을 바꿔 우회할 수 없다.

#### `swatch-catalog` (block)

**지표**: 인라인 `background` 선언이 있고 자기 텍스트 노드가 없는 요소 수 (`fillOnly`).
오직 색을 보여주려고 존재하는 요소를 센다.

**임계값**: `fillOnly >= 24` 이면 block.

**⚠️ 설계 4(병합)와의 충돌 — 반드시 함께 구현할 것.** 병합 파일은 양 테마의 fill 요소를
**둘 다** 담고 한쪽을 CSS 로 숨긴다. 단순 합계로 세면 PR-1 을 마친 greeting 이 18 이 아니라
**27** 이 되어 **PR-2 가 PR-3b 의 산출물을 자기 자신의 규칙으로 block 한다.**

정의를 "한 테마가 실제로 렌더하는 수"로 고정한다:

```
fillOnly = shared + max(lightOnly, darkOnly)
```

`data-theme-only` 조상 기준으로 분류한다. DOM 실측으로 검증했다 — 이 정의는 두-파일 시절
측정치를 **정확히 재현**하고 `visible` 과 모든 경우에 일치한다.

| 파일 | total | shared | light | dark | **perTheme** | visible |
|---|---|---|---|---|---|---|
| light (PR-1 후) | 18 | 18 | 0 | 0 | **18** | 18 |
| 병합 (PR-1 후) | 27 | 9 | 9 | 9 | **18** | 18 |
| 병합 (PR-1 전) | 93 | 71 | 11 | 11 | **82** | 82 |

`data-theme-only` 요소가 자기완결 균형 줄이라는 전제(위에서 검증) 덕분에 **줄 단위 귀속으로
DOM 결과를 그대로 재현**할 수 있다 — 18 / 18 / 82 일치 확인. 따라서 `preview-validator.ts`
는 현재의 정규식 기반을 유지해도 되며, DOM 파서를 들일 필요가 없다.

#### `type-scale-showcase` (block)

**지표**: design.md `## Typography` 토큰 **이름**이 프리뷰 본문에 **텍스트 라벨**로
등장한 개수 (`typoLabels`). 태그와 속성은 제거한 텍스트 노드에서만 세고, 이름은 공백·
구두점 경계로 감싸인 단독 라벨일 때만 계수한다 (산문 안 부분 문자열 히트 배제).

**임계값**: `typoLabels >= 5` **그리고** `typoLabels >= 전체 typography 토큰 수 × 0.5`
이면 block.

절대 개수가 아니라 비율인 이유 — 위반의 정체가 "스케일을 통째로 열거"하는 것이라
본질적으로 비율 문제다. 절대 개수만 쓰면 타입 토큰이 7개인 시스템이 7개를 다 열거해도
통과하고, 22개인 시스템이 적용 맥락에서 6개만 언급해도 걸린다. 바닥(5)은 스케일이
작은 시스템에서 우연한 언급 두어 개가 50%를 넘겨 오탐하는 것을 막는다.

**실행 중 발견해 정정한 값이다.** 초안은 절대값 6 이었는데, 정리된 greeting 이 정확히
6 이라 자기 자신을 block 했다. 남은 6개(`title7`·`body5`·`body6`·`item4`·`item5`·`item6`)를
열어보니 `Line-height roles` 카드의 논지("`body5` 와 `item5` 는 둘 다 16px 이지만 배율이
1.6em 과 1.5em")와 Fields·Button 컴포넌트 스펙이었다 — 루브릭이 **오히려 요구하는** 적용
맥락이다.

#### 캘리브레이션 (17개 전수, light 기준)

| slug | colorTok | labeled | typoTok | typoLabels | fillOnly |
|---|---|---|---|---|---|
| **greeting** | 65 | 26 | 22 | **22** | **82** |
| socar | 59 | 16 | 18 | 1 | 0 |
| krds | 55 | 10 | 12 | 0 | 0 |
| class101 | 34 | 9 | 21 | 0 | 0 |
| kyobobook | 56 | 8 | 8 | 0 | 0 |
| gmarket | 89 | 6 | 7 | 0 | 0 |
| toss | 37 | 6 | 16 | 0 | 1 |
| bezier | 43 | 0 | 12 | 0 | 7 |
| line-design-system | 24 | 0 | 10 | 0 | 2 |
| 그 외 8개 | — | 0~3 | — | 0 | 0~1 |

- `typoLabels`: greeting 정리 전 22/22(100%) vs 코퍼스 최대 socar 1/18(6%). 정리 후
  greeting 은 6/22(27%) 로 통과한다 — 바닥 5 는 넘지만 비율 50% 를 넘으려면 11 개가
  필요하다
- `fillOnly`: greeting 82 vs 코퍼스 최대 7(bezier) → 임계값 24 는 아래로 3.4×, 위로 3.4× 여유

기존 16개 중 회귀 **0건**.

`colorLabels`(design.md 색 토큰 이름의 텍스트 라벨 수)는 greeting 26 vs socar 16 으로
분리가 깨끗하지 않아 **규칙으로 채택하지 않는다**. `fillOnly` 가 같은 위반을 더 큰
마진으로 잡는다.

#### PR-1 과의 정합성 (검증 완료)

PR-1 의 제거 목록을 적용한 파일로 두 지표를 다시 측정했다.

| 지표 | 현재 | PR-1 후 | 임계값 | 판정 |
|---|---|---|---|---|
| `fillOnly` | 82 | **18** | 24 | 통과 (여유 25%) |
| `typoLabels` | 22 | **0** | 6 | 통과 |

`fillOnly` 의 섹션별 내역은 Colors 78 → 14, Components 1, Shape 3 이다.
두 PR 이 서로 모순되지 않음을 실측으로 확인했다.

다만 PR-1 이후에도 greeting 18 은 코퍼스 최대값이 된다(2위 bezier 7). 임계값 24 는 이
현실을 수용하되 재발(82 수준)은 막는 위치다.

### 3. 크기 게이트를 brotli 바이트 기준으로 전환 (PR-2)

**근거**: 캡의 자체 문구가 "inline assets **or** duplicated markup" 인데 brotli 는
정확히 그 둘을 갈라낸다 — 반복 마크업은 압축돼 사라지고, base64 인라인 자산은 압축이
안 돼 그대로 남는다. 부수 효과로 들여쓰기·가독성에 물리던 세금이 사라진다 (프리뷰는
사람이 읽고 고치는 산출물이고 prettier 대상이 아니다).

**구현**: `preview-validator.ts` 안에서 `node:zlib` 의 `brotliCompressSync` 를
`BROTLI_PARAM_QUALITY: 11` 고정으로 계산한다. 이 모듈은 `scripts/validate-preview.ts` 와
자기 테스트만 import 하므로 (클라이언트 번들 비포함) `node:zlib` 사용이 안전하다.
전수 34파일 압축 비용은 리뷰 머신 실측 약 4.66초로 CI 부담이 없다.

입력 인터페이스(`lightBytes`/`darkBytes`)는 유지한다 — raw 바이트는 안전망으로 계속 쓴다.

**임계값**:

| 게이트 | 값 | 근거 |
|---|---|---|
| `file-size-budget` (warn) | brotli 24 KiB | 현 코퍼스 최대 19.4 KiB 대비 24% 여유 (p50 11.3 · min 5.2). PR-1 후 최대는 bezier 16.5 KiB 라 45% 여유 |
| `file-too-large` (block) | brotli 40 KiB | 현 최대의 2× |
| `file-too-large-raw` (block, 안전망) | raw 256 KiB | 압축이 잘 되는 폭주(생성된 마크업 무한 반복)도 잡음 |

q11 은 "Vercel 이 내보내는 정확한 바이트"의 약속이 아니라 **결정론적 프록시**다. 문서에
그렇게 명시한다. q11 을 고른 이유는 근사가 아니라 방향성이다 — 품질 설정 중 q11 이
내놓는 바이트 수가 가장 작다. 즉 호스트가 실제로 내보내는 전송량의 **하한**이라,
가장 관대하면서도 거짓 block 을 만들지 않는 쪽으로 결정론적이다. 더 낮은 품질
설정도 똑같이 결정론적이지만 측정치를 부풀려 실제로는 게이트를 넘지 않는 파일을
false-block 할 수 있다.

**전환의 부작용 — 크기 warn 이 조용해진다**: 현재 100 KiB raw warn 은 greeting 과 bezier
두 항목에서 발화 중이다. brotli 24 KiB 기준으로는 둘 다(17.9~18.4, 16.2) 통과한다.
이것은 의도한 결과다 — 콘텐츠 정책 단속은 설계 2 의 두 규칙으로 옮겨가고, 크기 게이트는
**폭주 탐지기**라는 본래 역할만 남는다. bezier 는 스와치가 아니라 컴포넌트 마크업으로 큰
것이고(`fillOnly` 7, `typoLabels` 0), 지금까지도 warn 만 달고 정상 배포돼 왔다.

### 4. light/dark 단일 파일 병합 (PR-3 — 이슈 #202 합의 후)

`public/preview/{slug}/{light,dark}.html` 쌍을 `preview.html` 하나로 합친다.

```
<style>  :root[data-theme="light"] { …라이트 토큰… }
         :root[data-theme="dark"]  { …다크 토큰… }
         [data-theme="light"] [data-theme-only="dark"],
         [data-theme="dark"]  [data-theme-only="light"] { display: none !important; }
         …공통 컴포넌트 규칙 한 벌…
<body>   공통 마크업 + 테마 전용 요소는 data-theme-only 로 양쪽 모두 탑재
```

#### 구조적 전제 (greeting 실측 검증 완료)

- `<style>` 에서 다른 것은 `:root` 토큰 블록뿐(라이트 162줄 / 다크 166줄)이고,
  **그 뒤 453줄 컴포넌트 규칙은 양 테마 완전 동일**하다 → 한 벌만 유지하면 된다.
- `<body>` 에서 차이 나는 41 + 41줄이 **전부 자기완결 균형 요소**(불균형 0)라
  `data-theme-only` 래핑이 중첩을 깨지 않는다.
- 차이 나는 12% 는 다크 전용 해설 산문과 다크 실측 OKLCH 값이라 **중복 제거는 불가하나
  한 파일 공존은 가능하다.** LCS 정렬로 각 차이를 제자리에 짝지어 배치한다
  (단순 연결은 레이아웃을 파괴한다).

#### 테마 전환

초기 테마는 `?theme=` / `#dark` 를 **head 인라인 스크립트**에서 확정한다 — `defer` 인
`_runtime/iframe.js` 는 first paint 이후라 깜빡인다. 이후 전환은 부모가 postMessage
(`{type:"preview-theme", value:"light"|"dark"}`)로 보내며 **네트워크 왕복이 0** 이다.

`hashchange` 리스너를 반드시 함께 단다. `preview.html` → `preview.html#dark` 는
same-document fragment navigation 이라 문서가 재파싱되지 않는다 — POC 에서 이 리스너를
빠뜨려 해시만 바꿨을 때 테마가 안 바뀌는 결함이 실제로 발생했다.

`preview-frame.tsx` 는 `key={src}` 리마운트가 불필요해진다. 그 주석이 우려하던
"joint session history 오염"은 내비게이션이 사라지므로 함께 해소된다.

#### POC 검증 결과 (greeting, `origin/main` `6420c0a` 기준)

| | raw | brotli |
|---|---|---|
| 현행 쌍 | 241.5 KiB | 38.3 KiB |
| ㄴ 1회 조회 | 119.8 KiB | 18.9 KiB |
| **병합 단일** | **142.2 KiB** | **21.4 KiB** |
| **PR-1 + 병합** | **120.9 KiB** | **19.3 KiB** |

1회 조회 +2.5 KiB, **토글 포함 −16.9 KiB**, 디스크 −41%.

원본 대비 등가성 — 렌더된 텍스트가 라이트 15,609자 / 다크 16,071자 **완전 일치**,
토큰 11종 불일치 0, 카드 44/44, 고지 스트립 1개·첫 자식 유지, 폭 375 / 768 / 976 / 1440
× 2테마에서 문서 폭이 360 / 753 / 961 / 1425 로 **원본과 수치까지 동일**하고 오버플로우 0.

**⚠️ PR-2 없이는 병합이 캡 문제를 풀지 못한다.** PR-1 + 병합의 raw 는 120.9 KiB 로
하드캡 여유가 **7.1 KiB** 뿐이다 — 오늘의 6.3 KiB 와 거의 같다. 반면 PR-1 만 하고 쌍을
유지하면 여유가 25.0 KiB 다. 즉 병합은 **brotli 게이트(설계 3)를 전제로만 성립한다**
(brotli 19.3 KiB 는 warn 24 · block 40 대비 넉넉하다). 순서를 지키지 않으면 병합이
용량 측면에서 **퇴보**다.

#### 연동 변경 — ⚠️ `audit-oklch` 를 **먼저** 고쳐야 한다

단일 파일 최종 상태로 게이트를 돌린 실측:

| 게이트 | 반응 | 위험도 |
|---|---|---|
| `validate:previews` | `missing-preview-file` **2 block** | 안전 (시끄럽게 실패) |
| `audit:oklch` | **exit 0, 해당 슬러그 언급 0건** | ★ **조용한 누락** |

`scripts/audit-oklch.ts:208` 이 `light.html`/`dark.html` 을 파일명으로 찾기 때문에,
병합된 슬러그는 **OKLCH 드리프트 감사에서 소리 없이 빠진다.** 순서가 뒤바뀌면 게이트는
초록인데 실제 검사는 안 되는 상태가 된다 — 이슈 #187 과 같은 뿌리다.

바꿔야 하는 것:

- `scripts/audit-oklch.ts` · `src/lib/oklch-sync.ts` — **병합보다 선행.** 파일명 대신
  디렉터리의 모든 `*.html` 을 스캔하도록. 겸사겸사 병합 파일은 `:root[data-theme=…]`
  스코프가 명시적이라 #187 이 말한 "라이트 기준 md 와 다크 값을 구분 못 함" 문제를
  풀 토양이 생긴다 (자동 해결은 아니며 별도 작업).
- `src/lib/preview-validator.ts` — 쌍 전제를 단일 파일로. `data-theme-mismatch` 는
  "초기 `data-theme` 가 light" + "양 테마 토큰 블록이 모두 존재" 로, `identical-style-blocks`
  는 "두 `:root[data-theme=…]` 블록이 동일하면 warn" 으로 재정의.
- `scripts/validate-preview.ts` — 쌍 입출력을 단일 파일로.
- `src/lib/content-collection.ts` · `vite.config.ts` — 슬러그 존재 판정 파일명.
- `src/routes/services/-components/preview-frame.tsx` — src 고정 + postMessage 전환.
- `public/preview/_runtime/iframe.js` — message / hashchange 리스너 수용.
- `.claude/skills/design-md/` `preview-html-author` 프롬프트 — 1파일 산출로 변경.

**적용 범위**: greeting 1개로 개념 검증을 마쳤다. 기존 16개는 소급하지 않고 신규 온보딩부터
적용하는 것을 기본안으로 하되, 이슈 #202 에서 확정한다. 소급하지 않는 동안 검증기는
**단일 파일과 쌍 구조를 모두 받아들여야** 한다.

## 검증

각 PR 마다:

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test
pnpm validate:catalog
pnpm validate:previews
pnpm tokens:check
pnpm audit:oklch
```

추가로:

- **PR-1**: `pnpm validate:previews --slug greeting --verbose` 로 block 0 확인.
  프리뷰 폭 375 / 768 / 976 / 1440 전수 육안 확인 (976 은 상세페이지 임베드 폭 —
  중간 다열 폭에서만 터지는 오버플로우가 있어 375px 만 보고 통과 판정 금지).
  OKLCH 커버리지가 75/84 로 유지되는지 확인.
- **PR-2**: 새 규칙 2종의 단위 테스트를 `preview-validator.test.ts` 에 추가.
  `pnpm validate:previews` 전수에서 기존 16개가 새 규칙으로 block 되지 않음을 확인
  (회귀 0건 보장).
- **PR-3**: 병합 파일이 **원본 쌍과 등가**임을 기계로 확인한다 — 라이트/다크 각각의
  `body.innerText` 전문 일치, design.md 색 토큰 전수의 computed value 일치, 카드 수 일치.
  폭 375 / 768 / 976 / 1440 × 2테마에서 `documentElement.scrollWidth` 가 원본과 같고
  오버플로우 0 인지 확인.
  테마 전환 3경로를 **모두** 확인한다 — 초기 `#dark` 파싱 / 주소창 해시 변경
  (`hashchange`, same-document navigation) / 부모 postMessage.
  ⚠️ 브라우저 자동화 툴에 따라 해시 변경을 강제 리로드로 처리해 `hashchange` 결함을
  가려버린다. POC 에서 실제로 그랬으므로 **두 종류 이상의 드라이버로 교차 확인**할 것.

Windows 로컬 주의: `pnpm format:check` 가 로컬에서만 실패하면 CRLF 오탐이므로 CI 결과를
진실로 본다. `pnpm tokens:check` 는 오탐이 없으므로 실패하면 진짜 drift 다.
프리뷰 스크린샷은 이 repo 에서 `preview_screenshot` 이 행(hang)하므로 Playwright 로 찍는다.

## 진행 순서

1. **PR-1** (스킬 무관) — greeting 프리뷰 루브릭 정합. 이슈 합의를 기다리지 않는다.
2. **PR-2** (스킬 무관) — 결정론적 규칙 2종 + 크기 게이트 brotli 전환.
   PR-1 이 먼저 머지돼야 greeting 이 새 규칙에 걸리지 않는다.
3. **PR-3a** (스킬 무관, 병합보다 **선행 필수**) — `scripts/audit-oklch.ts` ·
   `src/lib/oklch-sync.ts` 의 프리뷰 스캔을 파일명 하드코딩에서 디렉터리 내 `*.html`
   전수로 전환. 이걸 먼저 하지 않으면 병합된 슬러그가 드리프트 감사에서 **조용히** 빠진다.
4. **PR-3b** (이슈 #202 합의 후) — `SKILL.md:342` hard-check 목록 동기화,
   `rubric-preview.md:14` 크기 기준 문구 전환, 단일 파일 병합 + 검증기·라우트 배선.

순서가 임의가 아니다. 셋 다 강제 조건이다:

- **PR-1 → PR-2**: greeting 이 정리되기 전에 규칙을 켜면 자기 항목이 block 된다.
- **PR-2 → PR-3b**: brotli 게이트 없이 병합하면 raw 여유가 7.1 KiB 로 오늘과 같아
  용량 문제가 안 풀린다. 그리고 `swatch-catalog` 를 `shared + max` 정의로 **함께** 고쳐야
  병합 산출물이 27 로 세어져 block 되는 일이 없다.
- **PR-3a → PR-3b**: `audit-oklch` 를 먼저 고치지 않으면 병합된 슬러그가 드리프트 감사에서
  **조용히** 빠진다 (게이트는 초록, 검사는 없음).

## 기각한 대안

### slug 별 `shared.css` (초안에서 설계 4 였다가 병합으로 교체)

공통 CSS 만 `public/preview/{slug}/shared.css` 로 빼는 안. 디스크 −16% 수준.
단일 파일 병합이 같은 목표를 훨씬 크게 달성하고(−41%), 무엇보다 **테마 간 드리프트를
없애지 못한다** — CSS 만 합칠 뿐 마크업과 산문은 여전히 두 벌이라 한쪽만 고치는 사고가
그대로 남는다. 병합을 채택하면 둘 다 할 이유가 없다.

### 초안이 병합을 기각했던 근거 (실측으로 철회)

이 문서의 초안은 병합을 기각했다. 근거 다섯 중 넷이 틀렸다. 기록해 둔다.
(아래 수치는 초안 기준선 `f7b2554` 의 것이다. `6420c0a` 재측정에서도 결론은 동일하다 —
1회 조회 +2.5 KiB, 토글 포함 −16.9 KiB.)

| 초안의 기각 근거 | 실측 |
|---|---|
| "1회 전송 127 → 139 KiB 악화" | **+2.6 KiB** (brotli 19.8 → 22.4). raw 로 잰 오류 — 같은 문서가 raw 는 전송량이 아니라고 논증해 놓고 |
| (따져보지 않음) 토글 시 | **−17.6 KiB.** 토글 1회면 순이득 |
| "단일 파일이 128 KiB 캡 초과" | PR-1 정리 후 현행 캡도 통과. 139.3 은 정리 전 수치. 게다가 PR-2 가 캡을 brotli 로 바꾸면 무의미해지는 기준이었다 |
| "12% 는 기계적으로 못 접는다" | 중복 *제거*와 한 파일 *공존*을 혼동. body 차이가 전부 균형 요소라 래핑으로 해결 |
| "블래스트 반경이 크다" | **유효.** 다만 감수할 값이 있다 |

단, 재측정에서 **캡 여유는 다시 봐야 한다** — PR-1 + 병합의 raw 여유는 7.1 KiB 로
쌍 구조 유지(25.0 KiB)보다 나쁘다. 병합은 brotli 게이트를 전제로만 성립한다(설계 4 참조).

### 배포 시 minify

보수적 근사(주석 제거 + 들여쓰기·태그간 공백 축약)로 실측한 결과 (`f7b2554` 기준):

- raw 249.7 → 196.5 KiB (-21.3%)
- **brotli 40.0 → 35.4 KiB (-11.5%)** — 뷰당 2.2 KiB

Vercel 이 이미 압축하고 있어 실제 이득이 뷰당 2.2 KiB 에 그친다. 빌드 파이프라인 복잡도와
소스/배포본 분기 비용에 비해 이득이 맞지 않는다. 설계 3(brotli 게이트)이 minify 가 노리던
문제 — 포맷팅이 예산을 잡아먹는 것 — 를 원천 해소한다.

### 스킬 프롬프트에 카드 수 상한 부과

greeting 44장이 이상치인 것은 맞지만 codeit 24장, line-design-system 21장, baemin 17장이
정상 통과하고 있어 카드 수 자체는 판별력이 없다. 문제는 카드의 **종류**였고, 그것은
설계 2의 두 지표가 훨씬 정확하게 잡는다.
