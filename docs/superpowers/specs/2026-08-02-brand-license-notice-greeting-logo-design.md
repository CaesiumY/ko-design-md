# 브랜드 자산 리스크 정정 — PR 1: 라이선스·고지 문서 + 그리팅 정합성 복구

- 날짜: 2026-08-02
- 상태: 설계 승인됨
- 범위: 6개 서브프로젝트 중 A(라이선스·고지 문서) + B(그리팅 정합성 복구)

## 배경

k-skill / 블루리본 사건 조사를 계기로 카탈로그의 상표·저작권 노출을 감사한 결과, 형사 리스크를
만들 수 있는 축(보호조치 우회, 런타임 제3자 호출)은 이 저장소에 존재하지 않는 것으로 확인됐다.
대신 k-skill에 없던 축이 하나 확인됐다 — **브랜드 그래픽 자산과 화면 재현물의 직접 호스팅 및
재라이선싱**. 그중 저장소가 즉시 통제할 수 있고 근거가 확정된 두 묶음이 이 PR의 대상이다.

감사 과정에서 나온 판단 하나를 여기 기록한다: 프리뷰에 표시되는 **데이터**(원티드 채용보상금표,
팀스파르타 평점 등)는 제거·익명화하지 않고 더미데이터 명시로 처리하기로 확정했다. 형법 제313조·
제314조·제307조 제2항이 공통으로 요구하는 '허위의 사실' 요건을 라벨이 직접 깨기 때문이다.
그 실행분(고지 배너)은 이 PR이 아니라 묶음 D 소관이다.

## 서브프로젝트 분해

17건의 수정 항목은 의존성이 거의 없는 6개 묶음으로 갈린다. 각 묶음은 독립된 스펙 → 플랜 →
구현 사이클을 돈다.

| 묶음 | 내용 | 이 PR |
| --- | --- | --- |
| A | 라이선스·고지 문서 | ✅ |
| B | 그리팅 정합성 복구 | ✅ |
| C | 자산 정리 (로고 리사이즈) | ❌ |
| D | 프리뷰 고지 배너 34파일 | ❌ |
| E | KRDS 자산 중립화 | ❌ |
| F | 파이프라인 가드 (루브릭 로고 조항, parseRobots, noindex) | ❌ |
| G | 로고 provenance·상표정책 실대조 (`public/logos/SOURCES.json`) | ❌ |
| H | 프리뷰 산문 전수 감사 (미출처 규범문·자기반박 사실주장·용도 매핑; seed-design 제외) | ❌ |

분리 근거: D는 34개 파일을 건드려 B와 같은 PR에 넣으면 프리뷰 용량 하드캡(128 KiB, 현재 여유
2.3 KiB) 초과 시 원인 판별이 불가능하다. E는 정부 자산이라 문구마다 별도 판단이 필요하다.
CLAUDE.md의 "무관 파일 대량 변경은 별도 PR로 분리" 관례와도 일치한다.

## 확정된 사실 (실측)

구현 시 이 값들을 재확인한 뒤 편집한다. 행번호는 2026-08-02 기준이다.

- `public/preview/greeting/{light,dark}.html`의 inline `<svg>` = **0개**, `url()` = 0, `data:` = 0,
  `mask-image` = 0, 아이콘 폰트 = 0. 외부 **이미지·폰트** 자산은 **`.png` 14개가 전부**이며
  파일 2종의 반복이다 (공유 런타임 `_runtime/tokens.css` · `iframe.js` 참조는 별개로 존재한다).
  즉 그리팅 UI 아이콘 글리프 316종은 프리뷰에 어떤 형식으로도 재현되지 않았고,
  `services/greeting.md:526`의 Don't는 지켜졌다. **이 PR은 아이콘을 건드리지 않는다.**
- 그 14개 중 10개가 로고 쇼케이스 카드 2장 안에 있고, 4개가 헤더·히어로·네비에 있다
  (`light.html` 기준 637 · 649 · 1391 · 1685).
- `services/greeting.md`의 frontmatter `logo:`는 `https://getdesign.kr/logos/greeting.svg`인데
  프리뷰의 `greeting.svg` 참조는 **양쪽 파일 모두 0건**이다. `rubric-preview.md` Item 1
  ("frontmatter에 logo가 있으면 양쪽 HTML 모두 site-relative `<img src>`를 눈에 보이는
  브랜드/히어로 위치에 렌더") **위반**이며, 현행 루브릭 기준 Item 1은 0/2다.
- `greeting.svg`(5,218 B)는 파랑 `#1890FF` 라운드 사각형 + 흰색 손 도형인 공식 벡터다.
  `greeting-mono.png`(38,347 B)는 배경색이 제거되고 명암이 반전된 **검정 실루엣 파생본**이다.
- 프리뷰 CSS는 그 파생본에 런타임 필터를 한 번 더 건다:
  `.lg-mono { filter: var(--f-base) }` / `.lg-rev { filter: invert(1) }` /
  `.lg-plate { filter: var(--f-inv) }`. `--f-base`는 light에서 `none`, dark에서 `invert(1)`이다.
  결과적으로 `filter: invert(1)`이 걸린 셀의 캡션이 "색을 바꾸지 않는다"라고 적혀 있다.
- `services/greeting.md` 570줄에 `심볼` · `reverse` · `여백` · `mono` · `클리어` · `플레이트`
  어휘가 **전부 0건**이다. 쇼케이스 캡션의 규범은 design.md에서 유도되지 않았다.
- 캡션의 "앱 아이콘 플레이트는 radius20 자리다"는 `greeting.md:341`("용도 매핑을 만들어 인용하지
  말 것", "radius14와 radius20은 컴포넌트 스케일에서 사실상 미사용")과 `:521` Don't
  ("radius14·radius20을 컴포넌트에 쓰지 않는다")를 동시에 위반한다. 같은 프리뷰의
  `light.html:1554`는 `20px · 미사용`으로 정확히 쓰고 있어, 모순은 로고 캡션에만 있다.
- ⚠️ **정정 (2026-08-02, 플랜 작성 중 발견): 고아는 4개가 아니라 5개다.** 아래 4개 판정은 느슨한
  파일명 grep 기준이었다. `wanted-logotype.svg`의 유일한 "참조"는 `services/wanted.md:819`가 상류
  SSOT 번들의 파일명을 **산문으로 언급**한 것이고 `/logos/` 참조가 아니다. 정밀 참조형
  (`/logos/<파일명>`)으로 재판정하면 고아다. 반대로 `wanted-symbol.svg`는 상류 이름이
  `wanted-symbol-mask.svg`라 문자열이 겹치지 않아 처음부터 잡혔다 — 순전히 우연한 차이였다.
  **최종 삭제 대상은 그리팅 개작본 2개 + 고아 5개 = 7개.**
  또한 `demo-courier.svg`는 브랜드 자산이 아니라 `viewBox 24×24 stroke=currentColor` 일반 트럭
  픽토그램이므로 상표 축 성과로 계상하지 않는다 (순수 청소).
- ~~`public/logos/` 고아 파일 4개 (services · public/preview · src 전수 grep 결과 참조 0건):~~
  `baemin.png` · `baemin-symbol.png` · `demo-courier.svg` · `wanted-symbol.svg`.
  `wanted-logotype.svg`는 참조가 있어 **제외**한다.
- `src/lib/design-md-skill-logo-policy.test.ts:46`이 Item 1 불변식을 계약 테스트로 고정하지만
  대상 slug가 `krds` · `toss` · `vapor-ui` · `wanted` 4개로 하드코딩돼 있어 greeting이 새어나갔다.
- 전체 순회 측정 결과 Item 1 위반은 **17개 중 3개**다.

| slug | frontmatter | 프리뷰 실제 사용 | 성격 |
| --- | --- | --- | --- |
| gmarket | `gmarket.png` | `gmarket-logotype.png` | 공식 자산끼리 불일치 |
| socar | `socar.png` | `socar.svg` | 같은 로고, 다른 포맷 |
| greeting | `greeting.svg` | `greeting-mono.png`, `greeting-logotype-mono.png` | **자체 제작 개작본** |

gmarket · socar는 다른 **공식** 자산을 쓰는 표기 불일치이고, greeting만 우리가 만든 파생본이다.
이 PR의 주제(브랜드 자산 권리)에 해당하는 것은 greeting뿐이므로 나머지 둘은 범위 밖으로 두되
코드에 보이게 남긴다.

## 설계

### A-1. `LICENSE-CONTENT` — 포함 중심 재작성

헤더 블록만 교체한다. 하단 CC BY 4.0 legalcode 전문은 **건드리지 않는다**.

```
Scope (CC BY 4.0) — what this license actually covers:
  - Prose written for this catalog in services/*.md
  - Token expressions authored here (e.g. OKLCH normalization)
  - Preview layout, CSS, and component structure in public/preview/**
  - OG card layout, typography, and breadcrumbs in public/og/**

Excluded (different terms):
  - Code (MIT, see LICENSE)
  - Brand logos in public/logos/* (see NOTICE)
  - Third-party brand logos, wordmarks, and product copy reproduced
    inside public/preview/** and public/og/**
  - Third-party fonts and photographs loaded or embedded by previews
  - National emblems (see NOTICE)
```

배제 목록만 늘리지 않고 포함을 먼저 쓰는 이유: 배제만 확대하면 다운스트림 소비자
(`use-design-md` 스킬 사용자, 포크)가 "프리뷰를 아예 못 쓰나"로 읽어 카탈로그의 효용이 깎인다.
영국 Open Government Licence가 Royal Arms와 부처 로고를 명시 배제하면서 나머지의 자유이용은
분명히 하는 것과 같은 편집이다.

`public/og/**`를 Scope에서 통째로 빼지 않는다. OG 이미지의 레이아웃·타이포그래피·브레드크럼은
이 저장소의 저작물이고, `src/og/load-logo.ts`가 base64로 합성해 넣은 브랜드 로고만 배제 대상이다.

### A-2. `NOTICE` — krds.svg 분리 + 자산 목록

**krds.svg 항목.** 현행은 `krds.svg`를 "trademarks or copyrighted material of their respective
owners"로 묶는데, 국가 표장은 그 범주가 아니다. 단일 라이선스로 단정하지 않고 확인된 것과
미확인을 구분해 적는다 — 단정하는 순간 이 PR이 고치려는 오류(근거 없는 단정)를 반복하게 된다.

```
public/logos/krds.svg is the Republic of Korea government symbol (정부상징),
not a product logo.

  - Governed by 「정부기에 관한 공고」 (2016-03-29, 대통령공고 제264호)
  - krds.go.kr states its materials are published under KOGL Type 1 (attribution)
  - Whether the symbol itself falls within that scope is NOT verified
  - Treated here as identification / reference only; see docs/TAKEDOWN.md
```

**자산 목록.** 하단에 브랜드명 ↔ 파일명 대응표를 **수동으로** 추가한다. takedown 요청이 왔을 때
grep 누락을 막는 것이 목적이다. 자동 생성 스크립트는 묶음 F 소관이며, 여기서 스크립트를 추가하면
A의 "문서만 변경, 코드 무영향" 성격이 깨진다. 목록 상단에 생성 방식이 후속임을 주석으로 남긴다.

### A-3. `src/components/site/footer.tsx:9-13`

```
현행: 코드 MIT (잠정) · 콘텐츠 CC-BY 4.0 (잠정) · 각 서비스명·로고는 해당 권리자 소유,
      분석 목적 fair use에 한함.

변경: 코드 MIT · 콘텐츠 CC BY 4.0 · 각 서비스명·로고는 해당 권리자 소유이며 식별·참조
      목적으로만 사용합니다. 이 사이트는 어떤 브랜드와도 제휴·후원 관계가 없습니다.
```

세 가지를 고친다.

1. `(잠정)` 삭제 — `LICENSE` · `LICENSE-CONTENT` · `NOTICE`는 확정 문서인데 푸터만 잠정이라
   표기해 자기 문서끼리 어긋난다.
2. `fair use` → `식별·참조 목적` — fair use는 미국 저작권법 개념이고 한국 상표법에는 대응 조문이
   없다. 한국 저작권법의 대응 개념은 제35조의5(공정한 이용)이며 상표 축에는 적용되지 않는다.
   PR 설명에서도 fair use를 상표 축 근거로 적지 않는다.
3. **비제휴·비후원 명시 추가** — 상표 축(부정경쟁방지법 제2조 제1호 나목의 광의의 혼동)에서
   실제로 필요한 문장이 현행 문구에 없다. 데이터 고지가 아니라 이 문장이 혼동 요건을 겨냥한다.

`Issue 001 / May 2026` 머리글은 사이트의 편집 컨셉이므로 **손대지 않는다**.

### B-1. 그리팅 프리뷰 — 공식 심볼만 사용

`public/preview/greeting/light.html`과 `dark.html` 양쪽에 동일하게 적용한다.

| 대상 | 변경 |
| --- | --- |
| 637 · 1391 · 1685 `mark-sym` | `src` → `/logos/greeting.svg`, `lg-mono` 클래스 제거 |
| 649 `hero-wordmark` | `<img>` → `<span class="hero-wordmark">그리팅</span>` (아래 CSS 교체 참조) |
| 카드 `Greeting logo` (731~) | 제거 |
| 카드 `Greeting symbol` (748~) | 제거 |
| CSS `.lg-mono` `.lg-rev` `.lg-plate` | 제거 |
| `--f-base` `--f-inv` | 다른 사용처가 있으면 존치, 없으면 제거 |

`hero-wordmark` CSS는 이미지 전용이므로(`height: 34px; width: auto; margin: 0 0 22px`, 반응형
`light.html:619`에서 `height: 28px`) 텍스트용으로 교체한다. 높이 대신 `font-size`로 크기를 잡고,
워드마크가 커스텀 레터링이라는 md 서술과 어긋나지 않도록 **본문과 같은 Pretendard를 그대로 쓰되
브랜드 서체를 흉내 내지 않는다**. 기존 34px/28px 광학 크기에 맞춘 값과 굵기를 쓰고, `margin`은
유지한다. 실제 값은 8조합 육안 검증에서 확정한다.

공식 벡터는 심볼뿐이고 워드마크는 공식 자산이 존재하지 않는다(앱 번들에서 찾은 것은
`greeting-symbol-*.svg`). 따라서 워드마크는 이미지를 쓰지 않고 텍스트로 대체한다.
`services/greeting.md:231`이 "워드마크는 로고 이미지 안의 커스텀 레터링이라 Pretendard가 아니다"를
`[src:3]` 근거와 함께 이미 서술하므로 정보 손실이 작고, 이미지 미수록은 이 항목이 이미 두들린
워드마크에 쓴 방식("자산 미수록" 빈 슬롯)과 동일하다.

부수 효과 세 가지가 자동으로 따라온다.

- 문제 캡션이 제거 대상 카드 **안에** 있어 함께 사라진다 (`light:743` 로고 카드,
  `light:759` · `dark:765` 심볼 카드). 별도 캡션 재작성 작업이 필요 없다.
- `radius20` 모순 문장이 사라진다. 프리뷰의 다른 `radius20` 언급(`light:1554`,
  `20px · 미사용`)은 md와 일치하므로 그대로 둔다.
- Brand 섹션이 5장 → 3장이 되고, 남는 3장(`Doodlin wordmark` · `Brand imagery` · `Naming`)은
  전부 이미지 없는 서술 카드가 되어 일관성이 올라간다. 파일 크기가 줄어 128 KiB 하드캡 여유가
  늘어난다.

나머지 `<p class="note">` 3개(`light:1163` · `1229` · `1368`)는 컴포넌트 관찰 서술이고 md에 근거가
있다. 손대지 않는다.

### B-2. 자산 삭제

- `public/logos/greeting-mono.png`
- `public/logos/greeting-logotype-mono.png`
- 고아 **5개** (위 정정 참조 — `wanted-logotype.svg` 추가): `public/logos/baemin.png` ·
  `baemin-symbol.png` · `demo-courier.svg` · `wanted-logotype.svg` ·
  `wanted-symbol.svg`

고아 4개는 원래 묶음 C 소관이지만 삭제만 하면 되고 판단 요소가 0이라 여기 포함한다.
`NOTICE:5`의 "식별 및 참조 목적"이라는 정당화가 적용될 사실관계 자체가 없는 파일들이다.
로고 리사이즈는 C에 남긴다.

삭제 전 각 파일에 대해 `services` · `public` · `src` 전수 grep으로 참조 0건을 재확인한다.

### B-3. 계약 테스트 — 전체 순회 + 명시적 예외 집합

`src/lib/design-md-skill-logo-policy.test.ts`의 하드코딩 slug 4개를 `services/*.md` 전체 순회로
교체하고, 알려진 갭을 코드에 드러낸다.

```ts
// rubric-preview.md Item 1: the frontmatter logo must appear in both previews.
// Known gaps — these use a different *official* asset, not a rights issue.
// Tracked separately; do not add new entries without a linked follow-up.
const KNOWN_LOGO_GAPS = new Set(["gmarket", "socar"])
```

하드코딩 목록에 greeting을 한 줄 추가하는 것으로는 다음 신규 항목이 또 새어나간다. 전체 순회로
바꾸면 greeting이 커버되고, 신규 항목이 기본 커버되며, 남은 2건이 보이지 않게 묻히지 않는다.

**예외 집합이 면제하는 범위를 좁게 유지한다.** 현행 테스트는 slug마다 세 가지를 검사한다 —
(a) frontmatter `logo:`가 `https://getdesign.kr/logos/` 절대 URL 형식인지, (b) 그 자산 파일이
`public/` 아래 실재하는지, (c) 양쪽 프리뷰가 site-relative `<img src>`로 임베드하는지.
`KNOWN_LOGO_GAPS`는 **(c)만 면제**한다. (a)와 (b)는 17개 전체에 예외 없이 적용한다.

`rubric-preview.md`의 로고 조항 추가는 묶음 F로 넘긴다. Item 2("standalone color-swatch grid는
토큰 카드로 이동")·Item 3("No standalone type-scale showcase")과 문장을 맞춰야 하고 스킬
프롬프트·계약 테스트가 연동되므로 D/F와 함께 가는 것이 맞다.

## 검증

```bash
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test
pnpm validate:catalog
pnpm validate:previews
pnpm tokens:check
pnpm audit:oklch
```

Windows 로컬 주의사항은 CLAUDE.md를 따른다 — `format:check` CRLF 오탐과 잔여 워크트리 vitest 오염은
CI 결과가 진실이다. 반대로 `tokens:check` 실패는 진짜 drift다.

**육안 검증이 필수다.** 헤더 심볼이 무채색(light 검정 / dark 흰색)에서 브랜드 파랑 `#1890FF`으로
바뀌므로 `375 / 768 / 976 / 1440` × `light / dark` 8조합을 확인한다. 976px은 상세페이지 임베드
폭이자 이 저장소의 알려진 사각지대다. 이 저장소에서 `preview_screenshot`은 행이 걸리므로
Playwright MCP로 스크린샷을 찍고, 워크트리에서는 `pnpm install`을 선행한다.

히어로 워드마크가 이미지에서 텍스트로 바뀌므로 히어로 레이아웃 회귀도 같은 8조합에서 확인한다.

## 커밋 구조

DCO 서명(`git commit -s`)으로 3개 커밋으로 나눈다.

1. `docs: 라이선스·고지를 포함 중심으로 재작성하고 국가 표장을 분리한다` — A-1, A-2, A-3
2. `fix(catalog): 그리팅 프리뷰가 개작본 대신 공식 심볼을 쓰도록 되돌린다` — B-1, B-3
3. `chore: 렌더에 쓰이지 않는 로고 자산을 제거한다` — B-2

## 범위 밖 (명시)

- 접수 이메일 채널 추가 (A 잔여)
- 로고 리사이즈 (C)
- 프리뷰 고지 배너 34파일, 원티드 표 캡션, 스킬·루브릭·계약테스트 연동 (D)
- KRDS 주민등록번호 필드·정부24 문구·인증실패 오류 중립화 (E)
- `rubric-preview.md` 로고 조항, `parseRobots` 이름지정 UA 지원, `/preview/` noindex (F)
- gmarket · socar의 frontmatter ↔ 프리뷰 로고 불일치
- **묶음 H — 프리뷰 산문 전수 감사.** 그리팅 전수 스윕에서 이 PR이 다루지 않는 동종 결함이
  나왔고, 나머지 프리뷰는 아직 감사되지 않았다. 이월 항목:
  - Drawer 노트(`light:1184`/`dark:1190`) — `모서리를 굴리지 않는다(radius0)` · `0.3s 듀레이션
    자리다`. `greeting.md`에 `Drawer` 0건이고 `0.3s`는 ToggleSwitch 트랙 전용(md:364)
  - Icon 부제(`light:1240`/`dark:1246`) — `⚠ Lucide substitutes`. 같은 카드 노트가 "대체본조차
    그리지 않고"라 반박하고 마크업은 중립 슬롯(`.isl`)
  - Naming 카드 잔여 규범문 — `법인명은 (주)두들린` · `✕ Greeting HR, 그리팅HR` ·
    `greetinghr.com은 도메인일 뿐 제품명이 아닙니다` · 기능명 나열. md 근거는 md:22뿐
  - 두들린 워드마크 자형 서술(`light:700`·`703`) · `DropdownItemSelect`(md:499 부재, light 전용) ·
    Table 노트 `데이터 행 48px`·`세로선이 없다`(md:548은 헤더 40px만)
  - **나머지 프리뷰 전수 스윕** — 같은 5개 기준(미출처 규범문 / 자기반박 사실주장 /
    고아 서술 / 용도 매핑 / 벤더 중립)으로. ~~seed-design 은 대상에서 제외~~ —
    리뉴얼이 2026-08-05 에 착지해 제외가 해제됐다(아래 참조)

## seed-design 은 모든 후속 묶음의 범위 밖이다 — 리뉴얼 착지로 해제됨 (2026-08-05)

**seed-design 은 리뉴얼 준비 중이므로 묶음 C~H 어디에서도 작업 대상이 아니다**(2026-08-02 결정).
`public/preview/seed-design/` 의 실사진·산문·자산은 이 감사 계열에서 손대지 않는다. 해당 항목의
정정이 필요하다면 리뉴얼 작업에서 함께 다룬다.

**그 리뉴얼이 2026-08-05 에 착지했으므로 이 제외는 끝났다.** 위 문단은 그때의 판단을 그대로
남겨 둔 기록이고, 지금 유효한 지시는 아래다.

- **묶음 C 의 seed-design 몫은 종결됐다.** 실사진 2장(`service-fleamarket-photo.jpg` ·
  `service-community-photo.jpg`, 합계 178 KB)을 삭제하고 SEED 의 Content Placeholder 로
  대체했다. C 에 남은 것은 로고 리사이즈뿐이다.
- **묶음 H 는 이제 seed-design 을 포함해야 한다.** 리뉴얼은 토큰·컴포넌트 서술과 프리뷰의
  토큰 시연을 다시 썼을 뿐, H 의 5개 기준(미출처 규범문 / 자기반박 사실주장 / 고아 서술 /
  용도 매핑 / 벤더 중립)으로 프리뷰 산문을 훑지는 않았다. 스윕 대상 목록에서 빼지 말 것.
- **프리뷰 자산의 NOTICE 범위 공백은 해소됐다 (2026-08-05).** `public/preview/seed-design/
  assets/` 에 당근 공식 서비스 앱아이콘 4개가 남아 있는데, NOTICE 의 "identification and
  reference purposes only" 선언은 `public/logos/` 만 덮고 `preview/` 를 한 번도 언급하지
  않았다. 프리뷰 로컬 asset 디렉터리를 가진 항목은 카탈로그에서 seed-design 뿐이다
  (나머지 16개는 전부 `/logos/` 참조).

  `NOTICE` 의 범위 문장을 두 위치로 넓히고 `Preview asset inventory` 절을 뒀다.
  `README.md` · `CONTRIBUTING.md` 의 브랜드 자산 스코프도 함께 넓혔다 — **#206 이 놓쳤던
  그 두 표면이 이번에도 같은 자리였다.** `LICENSE-CONTENT` 는 이미 덮고 있어 손대지 않았다.
  같은 자리가 두 번 놓쳤으므로 `src/lib/license-notice-consistency.test.ts` 에 가드 2개를
  추가했다(범위 문구 · 목록 양방향 동기화). 묶음 G 로 넘길 몫은 남지 않았다.

## 정오표 — 라이선스 선언 표면은 3개가 아니라 5개였다

A-1~A-3은 `LICENSE-CONTENT` · `NOTICE` · `footer.tsx` 세 표면만 열거했으나, 최종 whole-branch
리뷰가 **`README.md:117`과 `CONTRIBUTING.md:164`**에 같은 과대 선언이 원문 그대로 남아 있음을
찾았다. 특히 `CONTRIBUTING.md` 쪽은 **기여자 동의 취득 조항**("본 리포에 기여하면 다음 3-tier
라이선스에 동의하는 것으로 간주됩니다") 안에 있어 `LICENSE-CONTENT`의 Scope 줄보다 법적으로 더
작동한다. 커밋 `47214c8`로 해소했고, 재발 방지를 위해 세 텍스트 표면 전부에 대해
`public/preview/**`와 `CC BY`가 같은 줄에 오면 실패하는 부정 단언을 추가했다.

**교훈:** "선언이 실린 표면"을 열거할 때 문서를 떠올리지 말고 문자열로 grep 할 것.

## 정오표 — Scope 의 `public/og/**` 줄은 구현 중에 추가됐다

A-1 의 산문은 `public/og/**` 를 Scope 에 남긴다고 적었으나 그 아래 처방한 코드 블록에는 해당 줄이
없었다. 산문과 코드가 어긋난 채 Task 1 이 코드 블록을 그대로 옮겨, OG 이미지의 자체 저작물(레이아웃
·타이포그래피·브레드크럼)에 대한 라이선스 부여가 통째로 사라졌다. 커밋 `dec72d1` 로
`- OG card layout, typography, and breadcrumbs in public/og/**` 를 복원했고, 이 문서와 플랜의 코드
블록도 실제 `LICENSE-CONTENT` 와 일치하도록 갱신했다(PR #206 리뷰 지적).

**교훈:** 문서가 산문으로 의도를 적고 코드 블록으로 처방할 때, **둘이 같은 말을 하는지 대조**할 것.
구현자는 산문이 아니라 코드 블록을 옮긴다.

## 미확인 (이 PR이 해소하지 않음)

- 정부상징이 공공누리 체계의 적용 대상인지에 대한 유권해석. A-2의 문안은 이 불확실성을 그대로
  기록하는 방식으로 처리한다.
- 행정안전부/대한민국 명의의 정부상징 상표 등록 여부(KIPRIS 미검색).
- ~~`public/logos/*` 각 파일의 취득 경로. 브랜드 상표정책을 실제 대조한 기록은 LINE 1건뿐이다.~~
  → **묶음 G로 배정됨** (2026-08-02). 라벨링 감사가 이 항목을 상표 축 3대 결함 중 하나인데
  A~F 어디에도 소관이 없는 상태로 지적했다. `public/logos/SOURCES.json`에 파일별 취득 URL·확인일,
  브랜드 상표/미디어 정책 URL, editorial use 허용 여부를 기록한다. 선례는 LINE 1건(커밋 `fc06bcd`가
  line.me/en/logo의 editorial·informational use 범주 준수를 명시). 사전 클리어런스를 받자는 것이
  **아니다** — Simple Icons가 약 3,300개 로고에 사전 허락 0건으로 운영하듯 그건 업계 관행이 아니고,
  선행 검증에서도 기각됐다. 목적은 근거를 파일 단위로 추적 가능하게 만드는 것이다.
- 두들린·그리팅 공식 브랜드 가이드라인의 존재. 관례 경로 404 + 검색 인덱스 0건 기준이며
  "없다"가 아니라 "확인되지 않았다"로 읽어야 한다.
