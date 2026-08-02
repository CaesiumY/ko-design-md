# 프리뷰 HTML 용량 전략 재검토 설계

## 배경

PR #197(그리팅 온보딩) 리뷰에서 claude-review 가 후속 과제를 남겼다 — "카탈로그가 커질수록
이런 대형 프리뷰가 누적되는 추세라, 장기적으로 카드 갤러리를 공용 컴포넌트/압축 방식으로
다루는 논의는 언젠가 필요해 보인다".

2026-07-29 시점 `public/preview/*/` 전수에서 100 KiB 가이드라인 초과는 2건(greeting,
bezier)이었고, greeting dark 는 125.7 KiB 로 `scripts/validate-preview.ts` 의 128 KiB
하드캡까지 여유가 2.3 KiB 뿐이었다. 다음 항목이 조금만 커져도 CI 가 block 하는 상태다.

착수 전 가설은 "카드 46장이 원인이고, light/dark 중복 제거·minify 로 줄인다" 였다.
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
| greeting light | 124.0 KiB | 19.8 KiB |
| bezier light | 105.6 KiB | 16.2 KiB |
| light 17개 합계 | 1,140 KiB | 187 KiB |

### light/dark 중복은 실재하나 기계적으로 접히지 않는다

greeting 기준 `<style>` 블록의 91.4%, `<body>` 의 87.7% 가 바이트 단위로 동일하다.
그러나 나머지 12% 는 사고가 아니라 의도다 — 다크 전용 해설 산문과 **다크 실측 OKLCH 값**을
텍스트로 인쇄하는 부분이다. 두 파일을 `[data-theme]` 단일 파일로 병합해도 이 12% 는 양쪽
모두 남아야 한다.

### greeting 의 이상치는 카드 수가 아니라 스와치 밀도

섹션별 바이트 (light 기준, body 총 81,890 B):

| 섹션 | 카드 | 바이트 | body 비중 |
|---|---|---|---|
| Components | 19 | 25,376 | 31.0% |
| **Colors** | **11** | **22,147** | **27.0%** |
| **Type** | **5** | **8,300** | **10.1%** |
| Greeting ATS | 1 | 8,083 | 9.9% |
| Brand | 5 | 6,206 | 7.6% |
| Shape | 4 | 6,092 | 7.4% |
| Spacing | 1 | 2,291 | 2.8% |

`<style>` 블록은 43.6 KiB 인데 toss 가 43.7, bezier 가 40.2 다 — style 은 이상치가 아니다.
body 80.0 KiB(코퍼스 중앙값 약 26 KiB)가 전부다.

### 그 콘텐츠는 루브릭이 이미 금지하고 있다

`.claude/skills/design-md/references/rubric-preview.md` 가 두 조항으로 못박고 있다.

- L23: *"The preview is a **component demo**, not a swatch catalog — the standalone
  color-swatch grid moved to the token cards … **Failure modes**: rebuilding a
  color-swatch showcase grid"*
- L34: *"**No standalone type-scale showcase** — the documented scale lives in the token cards"*

그리고 `services/greeting.tokens.json` 이 이미 `colors: 65`, `typography: 22` 를 담아
상세 페이지 토큰 카드로 렌더한다. 즉 Colors + Type 29.7 KiB(body 의 37.2%)는 토큰 카드와의
순수 중복이다.

**진짜 갭은 "용량 전략 부재"가 아니라 이 두 산문 조항에 결정론적 검사가 없다는 것이다.**
용량은 위반의 증상이었다.

### 하드캡이 노린 사고는 한 번도 일어나지 않았다

캡의 자체 에러 문구는 `"inline assets or duplicated markup have run away"` 인데, 현재
17개 프리뷰 34개 파일에 `data:` / base64 인라인 자산은 0건이다. 지금까지 이 캡을 위협한
것은 정당한 콘텐츠뿐이었다.

## 목표

- greeting 프리뷰를 기존 루브릭 조항에 맞춰 정리해 하드캡 여유를 회복한다.
- 그 루브릭 조항 두 개를 결정론적 규칙으로 승격해 재발을 기계로 막는다.
- 크기 게이트의 측정 단위를 실제 배포되는 형태(brotli)로 바꿔, 소스 가독성에 물리던
  세금을 없앤다.
- slug 별 `shared.css` 도입으로 light/dark 간 CSS 중복을 제거한다.
- 기존 16개 프리뷰 중 회귀하는 항목이 0개임을 캘리브레이션으로 보장한다.

## 비목표

- light/dark 를 단일 파일로 병합하지 않는다 (아래 "기각한 대안" 참조).
- 배포 시 minify 를 도입하지 않는다.
- 프리뷰의 시각적 결과물·레이아웃·테마 모델을 바꾸지 않는다.
- `/preview/{slug}/{theme}.html` URL 계약과 iframe key 리마운트 방식을 바꾸지 않는다.
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

실측 결과 (제거/유지 목록을 카드 단위로 적용):

| | 현재 | PR-1 후 |
|---|---|---|
| light.html | 124.0 KiB (br 19.8) | **105.6 KiB (br 17.9)** |
| dark.html | 125.7 KiB (br 20.2) | **107.0 KiB (br 18.4)** |
| 하드캡 여유 (raw 128 KiB) | 2.3 KiB | **21.0 KiB** |
| `fillOnly` | 82 | **18** |

**순서상 주의**: PR-1 직후 light 105.6 KiB 는 기존 100 KiB raw warn 라인을 여전히 넘는다
(block 이 아니라 warn 이므로 CI 는 통과한다). 이 warn 은 PR-2 의 brotli 전환으로 해소된다.
Colors·Type **섹션 전체**를 들어내면 94.2 / 95.3 KiB 로 warn 도 사라지지만, 그러면 적용
맥락 카드까지 잃으므로 채택하지 않는다.

### 2. 결정론적 규칙 2종 추가 (PR-2)

`src/lib/preview-validator.ts` 에 두 규칙을 추가한다. 두 지표는 서로 직교하고, 클래스명·
마크업 구조와 무관해 이름을 바꿔 우회할 수 없다.

#### `swatch-catalog` (block)

**지표**: 인라인 `background` 선언이 있고 자기 텍스트 노드가 없는 요소 수 (`fillOnly`).
오직 색을 보여주려고 존재하는 요소를 센다.

**임계값**: `fillOnly >= 24` 이면 block.

#### `type-scale-showcase` (block)

**지표**: design.md `## Typography` 토큰 **이름**이 프리뷰 본문에 **텍스트 라벨**로
등장한 개수 (`typoLabels`). 태그와 속성은 제거한 텍스트 노드에서만 세고, 이름은 공백·
구두점 경계로 감싸인 단독 라벨일 때만 계수한다 (산문 안 부분 문자열 히트 배제).

**임계값**: `typoLabels >= 6` 이면 block.

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

- `typoLabels`: greeting 22 vs 코퍼스 최대 1 → 임계값 6 은 아래로 6×, 위로 3.7× 여유
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
전수 32파일 압축 비용은 1.65초로 CI 부담이 없다.

입력 인터페이스(`lightBytes`/`darkBytes`)는 유지한다 — raw 바이트는 안전망으로 계속 쓴다.

**임계값**:

| 게이트 | 값 | 근거 |
|---|---|---|
| `file-size-budget` (warn) | brotli 24 KiB | 현 코퍼스 최대 20.2 KiB 대비 19% 여유. PR-1 후 최대는 bezier 16.2 KiB 라 48% 여유 |
| `file-too-large` (block) | brotli 40 KiB | 현 최대의 2× |
| `file-too-large-raw` (block, 안전망) | raw 256 KiB | 압축이 잘 되는 폭주(생성된 마크업 무한 반복)도 잡음 |

q11 은 "Vercel 이 내보내는 정확한 바이트"의 약속이 아니라 **결정론적 프록시**다. 문서에
그렇게 명시한다.

**전환의 부작용 — 크기 warn 이 조용해진다**: 현재 100 KiB raw warn 은 greeting 과 bezier
두 항목에서 발화 중이다. brotli 24 KiB 기준으로는 둘 다(17.9~18.4, 16.2) 통과한다.
이것은 의도한 결과다 — 콘텐츠 정책 단속은 설계 2 의 두 규칙으로 옮겨가고, 크기 게이트는
**폭주 탐지기**라는 본래 역할만 남는다. bezier 는 스와치가 아니라 컴포넌트 마크업으로 큰
것이고(`fillOnly` 7, `typoLabels` 0), 지금까지도 warn 만 달고 정상 배포돼 왔다.

### 4. slug 별 `shared.css` (PR-3 — 이슈 #202 합의 후)

`<style>` 블록에서 light/dark 공통 규칙을 `public/preview/{slug}/shared.css` 로 빼고,
각 HTML 의 인라인 `<style>` 에는 테마별 커스텀 프로퍼티 블록만 남긴다.

| | 현재 | 적용 후 |
|---|---|---|
| light.html | 124.0 KiB | 84.1 KiB |
| dark.html | 125.7 KiB | 85.8 KiB |
| shared.css | — | 39.9 KiB |
| 디스크 합계 | 249.7 KiB | 209.8 KiB (-16%) |

URL 계약과 테마 모델은 불변이다. 테마 토글 시 공유 CSS 가 캐시에 남아 오히려 유리하다.

**연동 변경**:

- `preview-validator.ts` — `identical-style-blocks` 규칙의 의미 재정의. 이제 인라인
  `<style>` 은 토큰 블록만 담으므로 "동일하면 복사"라는 전제가 그대로 유효하지만,
  비교 대상이 좁아진다. `shared.css` 링크 존재를 검사하는 규칙을 추가한다.
- `scripts/audit-oklch.ts` — 스캔 경로에 `shared.css` 추가 (현재 `light.html`/`dark.html`
  만 본다). 누락 시 OKLCH 드리프트 감사에 사각지대가 생긴다.
- `src/lib/oklch-sync.ts` — 동일한 경로 확장.
- `.claude/skills/design-md/` `preview-html-author` 프롬프트 — 3파일 산출로 변경.

**적용 범위**: greeting 1개로 개념 검증한다. 기존 16개는 소급하지 않고 신규 온보딩부터
적용하는 것을 기본안으로 하되, 이슈 #202 에서 확정한다.

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
- **PR-3**: greeting 프리뷰를 dev 서버에서 렌더해 `shared.css` 가 실제로 로드되고
  라이트/다크 양쪽이 정상인지 확인.

Windows 로컬 주의: `pnpm format:check` 가 로컬에서만 실패하면 CRLF 오탐이므로 CI 결과를
진실로 본다. `pnpm tokens:check` 는 오탐이 없으므로 실패하면 진짜 drift 다.

## 진행 순서

1. **PR-1** (스킬 무관) — greeting 프리뷰 루브릭 정합. 이슈 합의를 기다리지 않는다.
2. **PR-2** (스킬 무관) — 결정론적 규칙 2종 + 크기 게이트 brotli 전환.
   PR-1 이 먼저 머지돼야 greeting 이 새 규칙에 걸리지 않는다.
3. **PR-3** (이슈 #202 합의 후) — `SKILL.md:342` hard-check 목록 동기화,
   `rubric-preview.md:14` 크기 기준 문구 전환, `shared.css` 3파일 산출.

## 기각한 대안

### light/dark 를 `[data-theme]` 단일 파일로 병합

디스크는 249.7 → 139.3 KiB (-44%) 로 줄지만:

- **1회 전송이 127 → 139 KiB 로 악화**한다. 보지 않는 테마까지 다운로드하기 때문이다.
- 단일 파일 139.3 KiB 가 현재 128 KiB 하드캡을 초과한다.
- 다른 12% 는 다크 전용 해설 산문과 다크 실측 OKLCH 값이라 기계적으로 접히지 않는다.
- 블래스트 반경이 크다 — `src/routes/services/-components/preview-frame.tsx:73`,
  `preview-validator.ts`(data-theme-mismatch 등 8개 지점), `scripts/validate-preview.ts`,
  `scripts/audit-oklch.ts:208`, `src/lib/content-collection.ts`, `vite.config.ts` 의
  `previewSlugsPlugin`, 그리고 design-md 스킬 프롬프트와 계약 테스트.

`shared.css`(설계 4)가 같은 목표(레포 위생)를 더 낮은 비용으로 달성한다.

### 배포 시 minify

보수적 근사(주석 제거 + 들여쓰기·태그간 공백 축약)로 실측한 결과:

- raw 249.7 → 196.5 KiB (-21.3%)
- **brotli 40.0 → 35.4 KiB (-11.5%)** — 뷰당 2.2 KiB

Vercel 이 이미 압축하고 있어 실제 이득이 뷰당 2.2 KiB 에 그친다. 빌드 파이프라인 복잡도와
소스/배포본 분기 비용에 비해 이득이 맞지 않는다. 설계 3(brotli 게이트)이 minify 가 노리던
문제 — 포맷팅이 예산을 잡아먹는 것 — 를 원천 해소한다.

### 스킬 프롬프트에 카드 수 상한 부과

greeting 46장이 이상치인 것은 맞지만 codeit 24장, line-design-system 21장, baemin 17장이
정상 통과하고 있어 카드 수 자체는 판별력이 없다. 문제는 카드의 **종류**였고, 그것은
설계 2의 두 지표가 훨씬 정확하게 잡는다.
