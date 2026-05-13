---
name: 한솔제지
slug: hansol-paper
category: etc
last_updated: "2026-05-13"
sources:
  - https://www.hansolpaper.co.kr/main?homepage
  - https://www.hansolpaper.co.kr/intro/company
  - https://www.hansolpaper.co.kr/intro/vision
  - https://www.hansolpaper.co.kr/intro/history
  - https://www.hansolpaper.co.kr/intro/place?p=1
  - https://www.hansolpaper.co.kr/product/paper1
  - https://www.hansolpaper.co.kr/product/paper2
  - https://www.hansolpaper.co.kr/product/paper3
  - https://www.hansolpaper.co.kr/product/paper4
  - https://www.hansolpaper.co.kr/product/new_material
  - https://www.hansolpaper.co.kr/management/environ
  - https://www.hansolpaper.co.kr/management/data
  - https://www.hansolpaper.co.kr/board/news
  - https://www.mt.co.kr/industry/2026/04/02/2026040209193019461
related_services: []
lang: ko
logo: /logos/hansol-paper.svg
---

# 한솔제지 (Hansol Paper) — design.md

> 한솔제지는 한솔그룹의 출발점이자 근간으로, 종이를 통해 국민문화 창달과 국가경제 발전을 실천해 온 제지 기업이다 [src:2]. 현재 공개 사이트는 인쇄용지, 산업용지, 특수지, 감열지, 신소재를 같은 내비게이션 체계 안에서 다루며, 친환경 종이 포장재와 소재 전환을 중요한 제품 맥락으로 배치한다 [src:1][src:6][src:7][src:8][src:9][src:10].

## Brand & Style

한솔제지의 브랜드 표면은 **종이의 백색, 공정의 정밀함, 친환경 소재의 온도**를 함께 다룬다. 공식 홈페이지는 "국내 제지산업의 중심"이라는 선언을 반복하고, 회사 소개는 1965년 새한제지 인수와 1968년 첫 제품 출시 이후 종이를 통한 문화·경제 기여를 핵심 정체성으로 설명한다 [src:1][src:2]. 따라서 디자인은 단순한 기업 홍보 페이지보다 **산업재 카탈로그와 지속가능 소재 랩** 사이에 위치해야 한다.

제품 맥락은 넓지만 중심은 명확하다. 인쇄용지는 서적·교과서·카탈로그 같은 출판/상업 인쇄를, 산업용지는 재활용 고지와 산림인증 원료 기반의 포장재를, 특수지는 프로테고·테라바스·라벨·난연벽지 같은 기능성 소재를 담당한다 [src:6][src:7][src:8]. 최근 공개 뉴스에서는 기존 플라스틱 연포장을 종이 기반 소재로 전환하는 `프로테고 HS`가 소개되었고, 사전 공정 테스트와 PPWR 재활용성 A등급 대응까지 언급된다 [src:13][src:14].

시각 톤은 현재 사이트의 큰 여백, 굵은 한글 헤드라인, 흰 제품 사진을 유지하되 정보 구조를 더 촘촘하게 만든다. 기존 스크린샷은 제품 이미지가 크고 텍스트가 정적인 슬라이드에 의존해 사업 축과 소재 특성이 한 번에 읽히지 않는다. 새 방향은 **paper-white 캔버스, sage-green 소재 배경, 공정 라인, 제품 스펙 테이블**을 결합해 B2B 구매자와 지속가능경영 독자가 같은 화면에서 근거를 찾게 한다.

## Colors

공개된 공식 디자인 토큰은 발견되지 않았다. 아래 값은 공식 홈페이지, 로고, 제공된 스크린샷, 제품 사진의 지배 색을 OKLCH로 근사한 값이며 `≈` 표기는 추정 토큰임을 뜻한다 [src:1].

```yaml
hansol-blue:   ≈ oklch(0.58 0.18 245)  # 로고 블루, 주요 링크와 공정 체크 포인트
hansol-green:  ≈ oklch(0.62 0.16 154)  # 로고 그린, 지속가능/재활용 상태
paper-white:   ≈ oklch(0.99 0.004 96)  # 종이와 포장재의 기본 표면
fiber-cream:   ≈ oklch(0.95 0.026 96)  # 미색지, 내지, 따뜻한 배경
pulp-sage:     ≈ oklch(0.78 0.055 122) # 프로테고 히어로 배경에서 추정한 연녹색
process-mist:  ≈ oklch(0.91 0.016 204) # 우유팩 재활용 캠페인 이미지의 청량한 보조색
graphite:      ≈ oklch(0.18 0.01 250)  # 본문 1차 텍스트, 굵은 타이틀
ink-gray:      ≈ oklch(0.44 0.01 250)  # 보조 본문, 캡션
line-gray:     ≈ oklch(0.84 0.006 250) # 헤어라인과 제품 구분선
kraft-brown:   ≈ oklch(0.52 0.095 62)  # 포장 인쇄, 스펙 라벨, 소재 샘플
safety-yellow: ≈ oklch(0.83 0.14 85)   # 공정 현장, 안전모, 경고성 강조
stamp-cyan:    ≈ oklch(0.74 0.108 214) # 우유팩 순환 스탬프와 인증 마크 보조색
dark-surface:  ≈ oklch(0.16 0.018 148) # 다크 모드의 숲/펄프 계열 배경
dark-panel:    ≈ oklch(0.22 0.022 143) # 다크 모드 패널 표면
dark-paper:    ≈ oklch(0.88 0.014 96)  # 다크 모드에서도 종이 샘플을 잃지 않는 밝은 표면
```

색 사용은 무채색 흑백 대비만으로 끝내지 않는다. `paper-white`와 `fiber-cream`으로 종이 표면을 만들고, `pulp-sage`와 `hansol-green`으로 친환경 소재 전환을 표시한다. `hansol-blue`는 로고, 링크, 가상전시관 같은 디지털 액션에만 제한적으로 사용한다.

## Typography

공식 사이트는 굵은 한글 제목과 비교적 넓은 행간의 본문을 사용한다 [src:1]. 카탈로그 구현에서는 한글 커버리지와 웹 접근성을 위해 `Pretendard Variable`을 기본으로 둔다. 로고 자체의 라틴 워드마크는 이미지 자산 영역으로 분리하고, 제품/공정 정보는 산세리프의 정돈된 숫자와 표 구조로 읽힌다.

```yaml
font-family-sans: >
  "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
  "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif
font-family-mono: "SF Mono", Menlo, Consolas, monospace

display-hero: { size: 72px, line-height: 0.98, weight: 800, tracking: 0 }
display-section: { size: 48px, line-height: 1.12, weight: 800, tracking: 0 }
heading-l: { size: 32px, line-height: 1.25, weight: 800, tracking: 0 }
heading-m: { size: 24px, line-height: 1.35, weight: 700, tracking: 0 }
body-l: { size: 19px, line-height: 1.65, weight: 500, tracking: 0 }
body-m: { size: 16px, line-height: 1.7, weight: 400, tracking: 0 }
caption: { size: 13px, line-height: 1.5, weight: 600, tracking: 0 }
spec: { size: 14px, line-height: 1.45, weight: 600, tracking: 0 }
```

숫자와 평량, 인증 등급은 `font-variant-numeric: tabular-nums`를 사용한다. 제지 제품은 `54g`, `215g~370g`, `90% 이상`처럼 숫자 단위가 많으므로 스펙 테이블과 메트릭은 폭이 흔들리지 않아야 한다 [src:7][src:8].

## Spacing

기본 단위는 4px이며, 제품 정보와 공정 정보를 읽기 쉽게 하기 위해 8px 배수의 큰 간격을 함께 사용한다. 현재 홈페이지의 넓은 여백은 유지하되, 정보 밀도가 낮아지는 부분은 제품군 탭과 스펙 행으로 보완한다 [src:1].

```yaml
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-6: 24px
space-8: 32px
space-10: 40px
space-12: 48px
space-16: 64px
space-20: 80px
space-24: 96px
section-y: 96px
container-x: 32px
```

섹션은 `section-y`로 충분히 숨을 쉬게 하고, 반복 제품 카드 내부는 `space-6` 이하로 압축한다. 모바일에서는 섹션 간격을 64px로 줄이고, 제품 탭은 가로 스크롤 대신 2열 그리드로 전환한다.

## Rounded

한솔제지의 화면은 종이 샘플, 포장 파우치, 제품 보드를 다루므로 과한 pill보다 절제된 둥근 모서리가 맞다. 현재 사이트의 버튼은 원형 화살표를 쓰지만, 새 시스템은 카드와 스펙 박스에 낮은 반경을 적용해 산업재의 정밀함을 유지한다 [src:1].

```yaml
radius-none: 0px
radius-paper: 2px
radius-small: 4px
radius-medium: 8px
radius-large: 12px
radius-pouch: 20px
radius-round: 999px
```

`radius-paper`는 시트 샘플과 공정 라인에, `radius-medium`은 제품 스펙 카드에, `radius-pouch`는 포장재 시각화에 사용한다. `radius-round`는 상태 점, 슬라이더 핸들, 매우 작은 인증 뱃지에만 제한한다.

## Elevation & Depth

기본 깊이는 그림자보다 레이어, 선, 종이 겹침으로 만든다. 현재 사이트도 검은 버튼과 얇은 구분선 중심으로 동작하며, 깊은 드롭 섀도우는 제품 사진 외에는 거의 보이지 않는다 [src:1].

```yaml
shadow-paper: 0 1px 0 oklch(0.18 0.01 250 / 0.08)
shadow-lift: 0 18px 44px oklch(0.18 0.01 250 / 0.10)
shadow-process: 0 10px 30px oklch(0.58 0.18 245 / 0.12)
```

카드는 기본적으로 `line-gray` 1px 경계와 `paper-white` 표면을 쓴다. 중요한 포장재 샘플이나 CTA만 `shadow-lift`를 받으며, 공정 단계의 활성 점은 `shadow-process`로 디지털 인터랙션임을 알린다.

## Shapes

주요 형태는 **시트, 롤, 파우치, 탭, 공정 라인**이다. 종이 기업의 물성을 위해 완전한 사각형만 쓰지 않고, 얇은 시트가 겹친 듯한 2px 모서리와 파우치 상단의 둥근 모서리를 병행한다. 화려한 장식 패턴은 피하고, 섬유 결을 연상시키는 매우 얇은 선형 반복은 배경이 아니라 소재 샘플 내부에서만 사용한다.

아이콘은 단색 라인 아이콘보다 공정 기호에 가깝게 처리한다. 재활용, 차단성, 감열, 산림인증 같은 상태는 `hansol-green`, `stamp-cyan`, `safety-yellow`의 작은 칩과 숫자 스펙으로 표현한다. 화살표 CTA는 원형 버튼 안에 넣되 텍스트 CTA보다 커지지 않게 한다.

## Components

### brand-header

상단 헤더는 로고, 제품소개, 회사소개, 지속가능경영, 투자정보, 인재채용, 소식, 고객문의, 가상전시관, 언어 전환을 한 줄에 배치한다 [src:1]. 새 버전에서는 CTA 성격의 `가상전시관`만 `hansol-blue` 배경으로 분리하고, 나머지 메뉴는 검은 텍스트와 얇은 하단선으로 정리한다.

### material-hero

히어로는 대형 제품명만 보여주는 슬라이드 대신 소재 전환 서사를 함께 보여준다. 왼쪽에는 `종이로 대체하는 포장재` 같은 명확한 명제를 두고, 오른쪽에는 파우치·시트·공정 라인을 겹쳐 `Protego`, `Terravas`, `Duracle`의 관계를 시각화한다 [src:8][src:10][src:14].

### product-family-tabs

제품군은 인쇄용지, 산업용지, 특수지, 감열지, 신소재의 다섯 축으로 나눈다 [src:1]. 각 탭은 설명 한 줄, 대표 용도, 핵심 스펙을 포함하고 선택 상태는 `hansol-green` 상단선과 `paper-white` 표면으로 표시한다.

### paper-spec-card

제지 제품의 의사결정은 감성 이미지보다 평량, 색상, 주요 용도, 인증/특성에서 일어난다 [src:6][src:7][src:8][src:9]. `paper-spec-card`는 제품명, 해시태그형 특성, 평량, 용도, 소재 상태를 한 카드 안에 담는다.

```tsx
<PaperSpecCard
  name="Protego"
  tags={["차단성", "인쇄적성", "재활용성"]}
  grammage="54 / 70 / 90g"
  usage="커피, 화장품, 식품, 생활용품 포장"
  tone="barrier"
/>
```

### process-timeline

종이팩 재활용, 플라스틱 대체, 공정 테스트 같은 흐름은 시간축으로 보여준다 [src:1][src:11][src:14]. 각 노드는 `수거`, `원료화`, `코팅`, `인쇄`, `패키징 전환`처럼 짧은 명사형 라벨을 쓰고, 활성 단계만 컬러 점을 받는다.

### sustainability-metric

그린경영 페이지는 환경경영체계, ISO14001, 녹색기업 운영, 2030년 온실가스 감축과 친환경 인증제품 판매비율 목표를 설명한다 [src:11]. `sustainability-metric`은 목표/인증/보고서 같은 근거를 숫자 중심으로 보여주는 작은 패널이다.

### go-together-link

홈페이지 하단의 `Go together` 섹션은 페이퍼넷과 열린구매 시스템을 연결한다 [src:1]. 새 버전에서는 외부 업무 시스템 링크를 단순 리스트가 아니라 `문서`, `구매`, `운송`, `납품실적` 같은 업무 단위로 묶어 반복 방문에 적합하게 만든다.

### quote-panel

공식 홈페이지는 이어령 전 문화부 장관의 한솔 40년 사사 축사를 인용해 브랜드 정서를 만든다 [src:1]. `quote-panel`은 큰 헤드라인 옆에 얇은 수평선을 두고, 인용문은 과도한 장식 없이 `ink-gray`와 `graphite` 대비로 처리한다.

## Do's and Don'ts

- Do: 종이의 촉감, 두께, 평량, 코팅, 재활용성을 화면 구조로 번역한다.
- Do: 제품 이미지만 크게 보여주지 말고 제품군, 용도, 공정, 지속가능성 근거를 한 화면에서 연결한다.
- Do: `hansol-blue`는 디지털 액션, `hansol-green`은 친환경 상태, `kraft-brown`은 포장 인쇄와 소재 라벨에 일관되게 쓴다.
- Do: 숫자 스펙은 탭ular 숫자와 단위 고정폭으로 정돈한다.
- Don't: 무채색 대형 타이포와 흰 배경만 반복해 제품군 차이를 숨기지 않는다.
- Don't: 친환경 메시지를 잎사귀 일러스트나 과한 그린 그라디언트로 단순화하지 않는다.
- Don't: B2B 업무 링크를 마케팅 배너처럼 처리하지 않는다.
- Don't: 공개 근거가 없는 인증, 토큰, 제품 성능 수치를 단정하지 않는다.

## Responsive Behavior

| Breakpoint | Layout | Key changes |
| --- | --- | --- |
| 1200px+ | 12-column editorial grid | 히어로 2열, 제품 탭 5열, 스펙 카드 3열 |
| 768px–1199px | 8-column grid | 히어로 이미지와 텍스트를 세로로 쌓고, 제품 탭 2열 |
| <768px | single column | 헤더 메뉴 축약, 히어로 시각화 단순화, 스펙 카드는 한 열 |

모바일에서는 `display-hero`를 42px로 낮추고, 공정 라인은 가로 타임라인 대신 세로 단계 목록으로 전환한다. CTA와 탭의 터치 영역은 최소 44px 높이를 유지한다.

## Known Gaps

- 공개된 공식 디자인 시스템, 토큰 파일, 컴포넌트 명세는 발견되지 않았다.
- 로고 원본 벡터와 정확한 브랜드 컬러 값은 제공된 스크린샷과 공개 페이지에서 추정했다.
- 제품별 이미지 에셋의 라이선스가 명확하지 않아 프리뷰는 CSS 기반 추상 시각화로 구현한다.
- 다크 모드는 공식 사이트에서 관찰되지 않아 카탈로그 소비를 위한 보조 해석으로 설계했다.

## References

- [Hansol Paper main](https://www.hansolpaper.co.kr/main?homepage)
- [Company overview](https://www.hansolpaper.co.kr/intro/company)
- [Vision](https://www.hansolpaper.co.kr/intro/vision)
- [History](https://www.hansolpaper.co.kr/intro/history)
- [Locations](https://www.hansolpaper.co.kr/intro/place?p=1)
- [Printing papers](https://www.hansolpaper.co.kr/product/paper1)
- [Industrial papers](https://www.hansolpaper.co.kr/product/paper2)
- [Special papers](https://www.hansolpaper.co.kr/product/paper3)
- [Thermal papers](https://www.hansolpaper.co.kr/product/paper4)
- [New materials](https://www.hansolpaper.co.kr/product/new_material)
- [Green management](https://www.hansolpaper.co.kr/management/environ)
- [Sustainability report archive](https://www.hansolpaper.co.kr/management/data)
- [News board](https://www.hansolpaper.co.kr/board/news)
- [MoneyToday — Protego HS launch](https://www.mt.co.kr/industry/2026/04/02/2026040209193019461)
