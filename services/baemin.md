---
name: 배달의민족
slug: baemin
category: delivery
last_updated: "2026-06-01"
created_at: 2026-05-18
sources:
  - https://designcompass.org/en/2025/07/23/baemin-2-rebranding/
  - https://woowahan.com
  - https://brandfetch.com/baemin.com
  - https://www.the-pr.co.kr/news/articleView.html?idxno=19376
  - https://www.specialtimes.co.kr/news/articleView.html?idxno=241987
  - https://github.com/google/fonts
  - https://www.edaily.co.kr/news/read?newsId=01249686625639032
  - https://www.brandbrief.co.kr/news/articleView.html?idxno=5667
  - https://design.co.kr/article/15070/
  - https://bcut.baemin.com/4941/
  - https://noonnu.cc/en/font_page/53
  - https://noonnu.cc/en/font_page/55
  - https://www.newswatch.kr/news/articleView.html?idxno=57219
  - https://www.iconsumer.or.kr/news/articleView.html?idxno=4988
related_services: [toss, seed-design]
lang: ko
logo: https://getdesign.kr/logos/baemin.svg
---

> 본 문서는 Claude Design이 사용자가 제공한 배달의민족 스크린샷과 공개 브랜드 자료를 토대로 재구성한 **핸드오프 디자인 시스템 번들**(`handoff/design-system/`, README·SKILL·`colors_and_type.css`·preview HTML·chat 트레일)을 1차 출처로 합성한 결과이며, 우아한형제들이 공식 배포한 Figma·코드베이스가 아니다. 2024년 *Baemin 2.0* 리브랜드와 한명수 CCO·김봉진 의장 발언, 폰트 라이선스 사이트 등 공개 웹 자료를 보조 출처로 사용했다. 토큰을 그대로 코드에 옮기기 전 실제 앱 캡처와 1~3px·1~2단계 hex 채도 편차를 한 번 더 비교할 것을 권장한다.

## Brand & Style

배달의민족(배민)은 우아한형제들이 2010년부터 운영해 온 한국 점유율 1위 음식·생필품 배달 슈퍼앱이며, 디자이너 출신 김봉진 의장이 창업했다. 음식배달을 주력으로 한그릇(최소주문금액 없는 1인분)·B마트(자체 물류 1시간 배송)·배민스토어(편의점·마트 즉시배송)·픽업·선물하기·배민클럽 멤버십이 한 앱 안에서 탭으로 묶여 있다 [src:1].

브랜드 정체성의 출발점은 **"한국 길거리 간판 미학을 디지털로 가져온다"**는 단 한 줄로 요약된다. 1960~70년대 시트지·아크릴·붓글씨 간판의 울퉁불퉁한 손맛을 디지털 폰트와 일러스트로 옮기고, 영문 SaaS의 "Pro/Premium/Plus" 자리에 `한그릇`·`B마트`·`먹깨비` 같은 순우리말 작명을 채워 넣는다. 글로벌 핀테크 미니멀의 슬릭함을 의도적으로 피하고, **"예쁘지는 않지만 사랑스럽다"**(김봉진)는 자기 미감 메타 코멘트를 10년 이상 일관되게 노출해 왔다 [src:1][src:13][src:14].

타깃 정의도 명시적이다. 김봉진 의장은 페르소나를 *"B급 문화를 사랑하며 왠지 모르게 정이 가는 복학생 오빠 같은 사람"*으로 못박았고 [src:14], 한명수 CCO는 *"길거리 간판에서 모티브를 얻어 울퉁불퉁하고 세련되지 않은 글꼴을 만들었고, 배민의 아이덴티티가 됐다"*, *"쉽고 명확하고 위트있게"*, *"뻔하지 않은 공공재 브랜드"*를 작업 원칙으로 공개해 왔다 [src:13]. 디자이너 주도 의사결정이 폰트·일러스트·캐릭터·카피·서비스 작명까지 일관 적용된다.

### Baemin 2.0 리브랜드 (2024)

2024년 7월, 15주년에 맞춰 대규모 시각 개편 *Baemin 2.0*이 단행됐다. 7월 9일 신규 앱 아이콘, 7월 22일 신규 컬러·폰트가 차례로 공개됐고, 핵심 변화는 두 가지다. 첫째, 프라이머리 민트가 라이터·새츄레이션 높은 톤으로 교체됐다(`#0CEFD3`, 본 문서의 `{colors.primary}`). 둘째, 한나체를 대체할 자체 폰트 **WORK**가 공개됐다 — "한글의 사선 획을 블록 형태로 단순화"한 단순·명료한 디자인이다. 김범석 대표는 *"다양한 이해관계자들과 다시 한 번 뜨거운 순간을 가지기 위해 리브랜드를 결정했다"*고 코멘트했다 [src:6]. 다만 핸드오프 번들은 WORK가 외부 공개 배포되지 않은 시점에 작성됐기 때문에 본 문서의 디스플레이 폰트 스택은 여전히 BM 한나체 시리즈를 기준으로 한다 — 프로덕션 적용 전 실제 앱에서 한 번 더 확인해야 한다 [src:3].

### 한국적 맥락

배민의 디자인이 한국 시장에서 작동하는 이유는 단순한 색이나 폰트의 문제가 아니다. 적어도 일곱 가지 층위가 겹쳐 있다.

1. **fintech-minimal 흐름에 대한 의도된 반작용**: 토스·카카오뱅크가 무채색 + 그리드 + Pretendard 미니멀로 수렴하던 시기에 배민은 컬러·캐릭터·붓글씨 폰트를 의도적으로 채택해 차별점을 만들었다 [src:9][src:14].
2. **70~80년대 간판 노스탤지어의 디지털 재맥락화**: 아크릴 컷팅·붓글씨·시트지 간판의 키치한 미감을 디지털 폰트로 옮겨, 한국인이라면 즉시 공감 가능한 시각적 노스탤지어를 활성화한다 [src:1][src:13][src:14].
3. **국가 정체성 카피 활용**: *"우리가 어떤 민족입니까"*(2014, 류승룡 모델, HS애드)와 *"OOO도 우리 민족이었어"* 같은 "민족" 단어 활용 카피라이팅은 한국어 화자 외 시장에서 재현 불가능한 언어유희이며, 10년 이상 일관된 브랜드 자산이다 [src:12].
4. **무료 폰트 공공재 전략**: 한나·주아·도현체 등을 한글날에 무료 배포한 결과 한국 전역의 과자 포장지·전단지·TV 자막·소상공인 간판에 배민 폰트가 침투했다. 디지털 앱 바깥에서도 끊임없이 브랜드 노출이 유지되는 한국 토착형 브랜딩 사이클이다 [src:10][src:13][src:14].
5. **호칭 문화의 디자인 시스템 흡수**: 등급명을 형용사로 호칭(`귀한분 홍길동`, `고마운분 홍길동`)하고 닉네임에 `~님`을 붙이는 한국어 호칭 관습을 그대로 UI 마이크로카피에 옮긴다. 영문권 "Gold/Bronze member"와 달리 친밀감과 격식을 동시에 확보한다 [src:1].
6. **순우리말 작명 일관성**: `한그릇`·`B마트`·`배민스토어`·`픽업`·`선물하기`·`배민클럽`·`먹깨비`. 영문 차용을 의도적으로 피하고 토착어로 서비스 라인업을 구축했다 [src:1].
7. **본화이트(bone-white) 배경**: 페이지 배경이 순백이 아니라 옅게 따뜻한 회백색이다 — 토스의 순백이나 카카오의 옅은 옐로와 다른, 한국 UI에서 보편화되지 않은 색을 의도적으로 선택해 손맛 톤을 보강하는 작은 차별점이다 [src:3].

## Colors

색 시스템의 중심은 **2024 리브랜드 민트 `{colors.primary}`**와 **딥 네이비 `{colors.navy}`**, 그리고 따뜻한 회색 뉴트럴 스택이다. 핸드오프 `colors_and_type.css`가 토큰 표면을 명시한다 [src:3].

### Brand mint (Baemin 2.0)

```yaml
# 현재 프라이머리 — 2024 Baemin 2.0 리브랜드 적용 [src:3][src:6]
primary:        oklch(0.88 0.18 178)   # 히어로 풀블리드·CTA·라이더 헬멧·카테고리 강조
primary-hover:  oklch(0.69 0.13 184)   # 버튼 hover/pressed (mint-deep)
primary-tint:   oklch(0.97 0.05 178)   # 옅은 민트 배경 (체크리스트 등)
primary-legacy: oklch(0.72 0.10 187)   # 레거시 민트 (pre-2024, 호환용)

# Mint scale 050 → 900 [src:3]
mint-050: oklch(0.99 0.03 178)
mint-100: oklch(0.96 0.07 178)
mint-200: oklch(0.92 0.13 178)
mint-300: oklch(0.91 0.16 178)
mint-400: oklch(0.89 0.18 178)
mint-500: oklch(0.88 0.18 178)   # = primary
mint-600: oklch(0.69 0.13 184)   # = primary-hover
mint-700: oklch(0.55 0.10 188)
mint-800: oklch(0.40 0.07 191)
mint-900: oklch(0.24 0.04 194)
```

### Deep navy & accents

```yaml
# 앱 음식배달 탭 헤더·한그릇 프로모션 [src:3]
navy:        oklch(0.30 0.13 286)
navy-deep:   oklch(0.27 0.13 287)
navy-tint:   oklch(0.94 0.04 287)   # 라벤더 칩·공지

# 시맨틱 액센트 [src:3]
red:         oklch(0.63 0.24 27)    # 할인 23% 칩 — 절대 그라데이션 아님
red-tint:    oklch(0.94 0.04 27)
orange:      oklch(0.71 0.17 32)    # 쿠폰 티켓
yellow:      oklch(0.93 0.20 100)   # 포인트 코인
pink:        oklch(0.66 0.24 4)     # 배민페이
pink-tint:   oklch(0.95 0.03 4)
frozen:      oklch(0.69 0.18 240)   # B마트 냉동 인디케이터
frozen-tint: oklch(0.94 0.04 240)
```

### Neutrals (살짝 따뜻한 회색)

배민은 순수 검정·순백을 피한다. 페이지 배경은 본화이트, 텍스트는 near-black이다 [src:3].

```yaml
bg-page:       oklch(0.97 0.00 286)   # 본화이트 — 페이지 배경
bg-surface:    oklch(1.00 0 0)        # 카드·시트 표면
bg-subtle:     oklch(0.96 0.00 286)   # 보조 배경 (입력 chips)
bg-pressed:    oklch(0.94 0.00 286)   # press 상태
bg-inverse:    oklch(0.18 0 0)        # 블랙 캡슐 (near-black)

fg-1:          oklch(0.18 0 0)        # 주요 텍스트 (near-black)
fg-2:          oklch(0.34 0 0)        # 보조 텍스트
fg-3:          oklch(0.55 0 0)        # 3차 텍스트 / placeholder
fg-4:          oklch(0.71 0 0)        # disabled / hint

border-1:      oklch(0.94 0.00 286)   # 기본 디바이더
border-2:      oklch(0.87 0.00 286)   # 폼 인풋 보더
border-strong: oklch(0.18 0 0)        # 손그림 검정 윤곽선
```

### Semantic alias (의미별 매핑)

product-facing 색은 시맨틱 alias로 호출하는 것이 권장된다. raw 토큰(`{colors.red}` 등)은 새 role을 만들 때만 직접 참조한다 — 토스 TDS의 base/semantic 분리 원칙과 동일하다 [src:3]. 핸드오프 `colors_and_type.css` §3-5는 `--tag-mint-bg: var(--baemin-mint-tint)` 형식으로 raw 민트·빨강·네이비를 product-meaning 별칭에 묶어 둔다. 다음은 그 매핑을 본 문서 토큰 어휘로 옮긴 표다.

```yaml
# product-surface meaning → token (handoff §3-5 + 시맨틱 단상 [src:3])
semantic-discount:    {colors.red}              # 23% 할인 칩 — 단색
semantic-coupon:      {colors.orange}           # 쿠폰 티켓
semantic-point:       {colors.yellow}           # 포인트 코인
semantic-frozen:      {colors.frozen}           # B마트 냉동 인디케이터
semantic-baemin-pay:  {colors.pink}             # 배민페이
semantic-hangrut:     {colors.navy}             # 한그릇 프로모션 / 음식배달 헤더
semantic-mint-tag:    {colors.primary-tint}     # NEW·신규·환영 칩
semantic-toast-bg:    {colors.bg-inverse}       # 검정 캡슐 토스트 (90% opacity)
```

새 컴포넌트를 추가할 때는 raw 컬러를 직접 박지 말고 위 시맨틱 슬롯 중 하나에 정렬하는 것을 우선한다. 의미 매핑이 비어 있는 경우(`semantic-success` 등)에는 핸드오프 토큰을 늘리기 전에 기존 alias로 표현 가능한지 한 번 더 검토한다.

## Typography

배민의 타이포그래피는 두 갈래로 분리된다. **헤드라인은 한글 손글씨 시리즈(BM 한나/주아/도현/연성/글림체)**, **본문은 Pretendard Variable**. 한나체 line-height는 1.0~1.1로 본문 1.5보다 훨씬 좁고, 디스플레이 사이즈는 일반 웹 폰트 스케일보다 1.5~2배 크다 [src:3][src:13].

### Font families

```yaml
font-display:          BM HANNA Pro, BM HANNA 11yrs, BM JUA  # 1960~70년대 아크릴 컷팅 간판 모티브 [src:13]
font-display-thin:     BM HANNA Air                          # 한나체 라이트 변형
font-display-rounded:  BM JUA                                # 붓글씨 간판 모티브 [src:13]
font-display-bold:     BM DOHYEON                            # 아크릴판 간판 — 제목용 꽉찬 고딕 [src:13][src:12]
font-display-script:   BM YEONSUNG                           # 연성체
font-display-cursive:  BM GLIM                               # "그림글자" — 배달이 마스코트가 한글 신체를 이룸 [src:13]
font-body:             Pretendard Variable, Pretendard, -apple-system, "Apple SD Gothic Neo",
                       "Noto Sans KR", "Malgun Gothic", Roboto, sans-serif
```

BM 시리즈는 모두 SIL Open Font License 1.1로 상업·임베딩 무료다 [src:6][src:11][src:12]. 핸드오프는 5종을 jsDelivr `fonts-archive` 미러를 통해 woff2/woff로 로드한다 [src:3]. 2024 리브랜드 시점에 자체 폰트 **WORK**가 공개됐지만 외부 배포 전이므로 본 문서 스택은 한나체 시리즈를 유지한다 [src:6].

### Type scale & semantic classes

```yaml
display-1 (h1.hero):  96px / line-height 1.02 / {typography.font-display-bold} (도현체) / 400
display-2:            72px / 1.04 / {typography.font-display} / 400
display-3:            56px / 1.06 / {typography.font-display} / 400
h1:                   40px / 1.15 / {typography.font-display-bold} (도현체) / 400
h2:                   32px / 1.20 / Pretendard / 800
h3:                   24px / 1.30 / Pretendard / 700
h4:                   20px / 1.35 / Pretendard / 700
body-lg:              17px / 1.55 / Pretendard
body:                 15px / 1.50 / Pretendard
body-sm:              13px / 1.45 / Pretendard / {colors.fg-2}
caption:              12px / 1.40 / Pretendard / {colors.fg-3}
micro:                11px / 1.30 / Pretendard / {colors.fg-3}

# 가격 강조 [src:3]
price:        font-weight 800, letter-spacing -0.02em, font-variant-numeric tabular-nums
price--sale:  {colors.red}
strike:       {colors.fg-3}, text-decoration line-through

# letter-spacing 규칙 [src:3]
display:  -0.02em ~ -0.01em
h1~h4:    -0.02em ~ -0.015em
price:    -0.02em
```

헤드라인 규칙은 **한 줄에 4~7자, 2~3줄까지** — 시처럼 라인 브레이크한다(`배달의민족 / 세상 모든 것이 / 식지 않도록`). 가격 라벨은 카피의 중심이라 `tabular-nums`가 디폴트다 [src:1][src:3].

## Spacing

4px base의 12-step 스케일이다. 카드 내부 패딩은 보통 14~20px, 섹션 간 여백은 32~48px 수준이 관찰된다 [src:3].

```yaml
space-1:  4px       # 마이크로 갭
space-2:  8px       # 칩 내부 패딩
space-3:  12px      # 타이트 인라인 갭
space-4:  16px      # 카드 표준 패딩
space-5:  20px      # 큰 카드 패딩
space-6:  24px      # 컴포넌트 간 갭
space-7:  32px      # 섹션 시작 갭
space-8:  40px      # 섹션 간 표준 여백
space-9:  48px      # 큰 섹션 분리
space-10: 64px      # 히어로 상하 여백
space-11: 80px      # 페이지 영역 분리
space-12: 120px     # 풀 페이지 호흡
```

## Rounded

모서리는 살짝 큼지막하다. 버튼은 풀 알약(`pill`), 카드는 16~20px, 카테고리 아이콘 컨테이너는 원(50%) [src:3].

```yaml
xs:     4px       # 미세 칩·작은 배지
sm:     8px       # 인풋 corner
md:     12px      # 미디엄 카드·상품 썸네일
lg:     16px      # 표준 카드
xl:     20px      # 큰 카드
2xl:    24px      # 시트·다이얼로그
3xl:    32px      # 풀-스크린 시트
pill:   9999px    # 쿠폰·태그·버튼 — 풀 알약
circle: 50%       # 카테고리 아이콘 컨테이너
```

## Elevation & Depth

배민은 **그림자를 거의 안 쓴다**. 카드는 배경색 차이로 구분하고, 섀도우가 들어가도 opacity 4~8%로 매우 옅다 [src:1][src:3].

```yaml
shadow-1:       0 1px 2px  oklch(0.18 0 0 / 0.04)   # 칩
shadow-2:       0 4px 12px oklch(0.18 0 0 / 0.06)   # 카드
shadow-3:       0 8px 24px oklch(0.18 0 0 / 0.08)   # 시트
# 시그니처 — 손그림 스티커 드롭 (블랙 단색 6px 오프셋, 만화·스티커 톤)
shadow-sticker: 0 6px 0    oklch(0.18 0 0 / 1.0)
```

`{elevation.shadow-sticker}`는 다른 토큰과 결이 다르다. 옅게 흐려진 그림자가 아니라 **검정 단색이 6px 아래로 평행 이동한 만화 컷의 그림자** — 손글씨 일러스트·스티커·핸드드로잉 톤을 강조할 때만 쓴다. 블러나 backdrop-filter는 iOS 시스템 영역 외에는 거의 등장하지 않는다 [src:1][src:3].

### Animation

```yaml
ease-out:    cubic-bezier(0.16, 1, 0.3, 1)   # 기본
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
dur-fast:    120ms
dur-base:    200ms
dur-slow:    400ms
```

"빠르고 짧음. 200ms 내외 ease-out 페이드+슬라이드 4~12px. 통통 튀는 spring은 안 씀 — 한국 UI의 차분한 톤"이 핸드오프 가이드의 표현이다. 카테고리 아이콘 탭 시 `scale(0.96)`, 버튼 active 시 `scale(0.98)`이 권장된다 [src:1][src:3].

## Shapes

배민의 시각 언어는 **풀-블리드 단색 + 손그림 콜라주**로 요약된다. 그라데이션을 거의 쓰지 않고, 평면색과 하드 컬러 블로킹이 룰이다 [src:1].

- **풀-블리드 평면색** + **손그림 일러스트의 자유 배치**: 마케팅 화면은 패턴·텍스처 없이 풀블리드 위에 손그림을 `position: absolute` 느낌으로 흩뿌린다 [src:1].
- **그라데이션 거의 안 씀**: 할인 태그조차 단색 빨강 사각 칩이다. 흰 배경 위 강조 라벨은 둥근 사각 칩, 색상 배경 위 텍스트는 블랙 캡슐(pill)로 보호한다 [src:1][src:3].
- **모서리는 살짝 큼**: 카테고리 아이콘은 원형 컨테이너, 카드는 16~20px 라운드. 직각·날카로운 모서리는 회피한다 [src:1][src:3].
- **카드 보더는 거의 없음**: 배경색 차이로 카드를 구분한다. 보더가 필요한 위치는 폼 인풋 정도다 [src:3].
- **촉감 있는 비주얼 4종 동시 운영**: (1) 두꺼운 검정 윤곽선 손그림 라인, (2) 점토 한글, (3) 3D 굿즈, (4) 3D 미니어처 음식 — 글로벌 SaaS의 AI생성 일러스트나 무거운 shadow 카드는 의도적으로 피한다 [src:1].
- **이모지 없음, 유니코드 글리프 일부만**: 별점(★), 화살표(›), 체크(✓) 정도. 이모지 자리는 캐릭터·일러스트로 대체한다 [src:1].

### Iconography

배민 아이콘은 단일 시스템이 아니라 **목적별로 4종이 혼용된다**. 토스 TDS의 단일 라인 아이콘 세트나 SEED의 통합 심볼 시스템과 가장 두드러진 차이점이며, 어휘를 분리해 호명하는 것이 디자인 의사결정의 첫 단추다 [src:1][src:3].

- **UI 라인 아이콘** — 하단탭·헤더 액션·`>` 더보기·`×` 닫기 등 시스템 액션. stroke 2~2.5px의 라인이 기본이고, 활성 상태에서만 검정 채움으로 전환된다. 핸드오프는 코드베이스 부재로 SVG sprite 추출이 불가능해 **Lucide Icons**(`lucide.dev`, stroke 2px, CDN-available)를 1:1 매칭으로 사용하며 색상은 `{colors.fg-1}`이다. 다만 Lucide는 배민 자체 아이콘과 비슷할 뿐 정확히 동일하지 않다 — 핸드오프는 이를 **SUBSTITUTION FLAG**로 명시하고, 정확한 시스템이 필요하면 실제 앱에서 SVG를 추출해 갈음하라고 가이드한다 [src:3].
- **3D 미니어처 카테고리 아이콘** — 음식배달 카테고리 그리드(`한그릇`·`치킨`·`중식`·`돈까스·회` 등 10종) 전용. 흰 원형 그라데이션 배경 위에 음식 한 접시를 3D 미니어처 사진처럼 렌더한다. Apple emoji와 결이 닮았지만 배민 전용으로 별도 제작된 자산이다 [src:3].
- **벡터 일러스트 (배민스토어·B마트)** — 편의점 비닐봉투·꽃다발·핸드폰 등. 손그림 느낌의 라인과 색채움이 혼합된 형태로, 음식배달 카테고리의 3D 톤과 다르다 [src:3].
- **로고 워드마크** — `배달의민족` 5글자를 `{typography.font-display}` 한나체로 그대로 쓴 워드마크다. 별도 심볼 마크는 없다. 앱 아이콘은 2024 리브랜드 후 민트 배경 + 흰 "배민" 텍스트로 통일됐다 [src:1][src:3].

핸드오프는 **공식 마스코트·캐릭터 SVG를 포함하지 않는다** — 배달이친구들(독고배달이·메이배달이·냥이배달이 등 15종)을 비롯한 캐릭터 자산은 외부 배포되지 않았기 때문이다. 사용자는 `assets/illustrations/` 폴더에 image-slot placeholder를 끼워 넣는 방식으로 우회한다 [src:3][src:5][src:13].

## Components

핸드오프 번들은 마케팅·앱·B마트·빈 상태 전반에 걸친 명명 컴포넌트 모음을 제공한다. 본 카탈로그는 시그니처가 분명한 컴포넌트와 버튼·태그·뱃지의 변형을 추렸다.

### hero-slide

웹 메인 히어로. 풀-블리드 `{colors.primary}` 배경 위 굵은 한나체 헤드라인(`배달의민족 / 세상 모든 것이 / 식지 않도록`)과 우하단 손그림 라인 일러스트, 우측 점 인디케이터 — 한 viewport = 한 메시지 원칙으로 구성한다 [src:1].

```tsx
<HeroSlide
  background={`{colors.primary}`}
  title="배달의민족 / 세상 모든 것이 / 식지 않도록"
  subtitle="오늘도 가장 앞서 뜨겁게 달립니다."
  illustration="hand-line"       // 두꺼운 검정 윤곽선, fill 없음
  indicator="side-dots"
/>
```

### search-bar

`{colors.primary}` 풀 배경 위 흰 캡슐 입력창. placeholder는 위트 카피(`찾는 메뉴가 뭐예요?`, `브런치 나와라 뚝딱!!`) — 핸드오프는 이를 "마법주문어"라 부른다 [src:1].

```tsx
<SearchBar
  bg={`{colors.primary}`}
  fieldBg={`{colors.bg-surface}`}
  radius={`{rounded.pill}`}
  placeholder="찾는 메뉴가 뭐예요?"   // 또는 "브런치 나와라 뚝딱!!"
/>
```

### text-field

`{component.search-bar}`와 별개의 일반 폼 인풋. 높이 48px, `{rounded.md}` 12px radius, `{colors.bg-subtle}` resting 배경, 1px `{colors.border-2}` 보더. focus 시 `{colors.bg-surface}` 흰 배경 + 1.5px `{colors.border-strong}` 검정 보더로 전환된다 — `{component.button-ghost}` 보더 패턴과 같은 두께를 공유해 폼 영역의 시각 일관성을 유지한다 [src:3].

```tsx
<TextField
  height={48}
  radius={`{rounded.md}`}
  bg={`{colors.bg-subtle}`}
  borderColor={`{colors.border-2}`}
  borderWidth={1}
  focusBg={`{colors.bg-surface}`}
  focusBorderColor={`{colors.border-strong}`}
  focusBorderWidth={1.5}
/>
```

### category-grid

음식배달 탭의 5×2 그리드(`한그릇`·`치킨`·`중식`·`돈까스·회`·`피자`·`패스트푸드`·`찜·탕`·`족발·보쌈`·`한식`·`분식`). 흰 원형 컨테이너(`{rounded.circle}`) 위에 3D 미니어처 음식 렌더 — Apple emoji 결을 닮은 배민 전용 자산이다 [src:1].

```tsx
<CategoryGrid columns={5} rows={2}>
  <CategoryTile container={`{rounded.circle}`} bg={`{colors.bg-surface}`}>
    <FoodMiniature kind="chicken" />  {/* 3D 미니어처 */}
    <Label className="body-sm">치킨</Label>
  </CategoryTile>
  {/* ... 9 more */}
</CategoryGrid>
```

### service-cards

음식배달 홈 최상단의 3분할 서비스 진입 카드(`가게배달`·`B마트`·`배민스토어`). 로그인 직후 가장 먼저 만나는 핵심 도메인 내비게이션이다. 3-컬럼 그리드(`{spacing.space-2}` 8px gap, max-width 380px)에 각 카드는 14px(`{rounded.lg}`에 근접) radius + 1px `{colors.border-1}` 보더 + `{colors.bg-surface}` 흰 표면, 패딩 12/12/8, 최소 높이 96px. 카드 내부는 세로 `space-between`으로 상단 텍스트 / 하단 일러스트 슬롯을 분리한다 — 타이틀 `{typography.body}` 800 `{colors.fg-1}`, 서브 11px `{colors.fg-3}` line-height 1.3(2줄 `white-space: pre-line`), 우하단 30px 일러스트 슬롯(실제 앱은 3D 미니어처, 핸드오프는 이모지 placeholder) [src:1][src:3].

```tsx
<ServiceCards columns={3} gap={`{spacing.space-2}`}>
  <ServiceCard title="가게배달"  sub={"가게에서\n자체 배달"}  illust="3d-slot" />  {/* 🍔 */}
  <ServiceCard title="B마트"     sub={"장보기도\n더 빠르게!"} illust="3d-slot" />  {/* 🛍️ */}
  <ServiceCard title="배민스토어" sub={"배달은 지금\n옵니다"}   illust="3d-slot" />  {/* 🛒 */}
</ServiceCards>
```

### product-card

B마트 상품 카드. 1:1 정사각 썸네일(`{rounded.md}`) + 좌상단 빨강 할인 배지(`23%`, `{colors.red}`) + 좌하단 냉동 인디케이터(`{colors.frozen}` 원, 28×28) + 우하단 `+` 추가 버튼(흰 원, `{elevation.shadow-1}`). 가격은 `{colors.fg-1}` 800, 세일 % 접두는 `{colors.red}`. 할인 배지 콤마 라인 보정을 위해 `text-decoration-skip-ink: none`을 명시한다 [src:3][src:4].

```tsx
<ProductCard>
  <Thumbnail aspect="1:1" radius={`{rounded.md}`} />
  <DiscountBadge bg={`{colors.red}`} fg="white" topLeft>23%</DiscountBadge>
  <FrozenChip bg={`{colors.frozen}`} bottomLeft size={28} />
  <AddButton
    bg={`{colors.bg-surface}`}
    shadow={`{elevation.shadow-1}`}
    bottomRight
  >+</AddButton>
  <Price className="price">2,980원</Price>
</ProductCard>
```

### list-row

음식점 리스트·주문 내역의 표준 행 단위. 좌측 정사각 썸네일(`{rounded.md}`, 64~80px) + 중앙 가게명·리뷰·배달비·배달시간 메타 스택 + 우측 찜 아이콘. 가게명은 `{typography.h4}` Pretendard 700, 메타는 `{typography.body-sm}` `{colors.fg-2}` — 가격 라벨에는 `{typography.price}`의 tabular-nums가 적용된다 [src:1][src:3].

```tsx
<ListRow>
  <Thumbnail aspect="1:1" radius={`{rounded.md}`} size={72} />
  <Meta>
    <Title className="h4">왓더버거 합정점</Title>
    <Sub className="body-sm" color={`{colors.fg-2}`}>★ 4.8 · 배달비 2,000원 · 30~40분</Sub>
  </Meta>
  <HeartIcon variant="outline" />
</ListRow>
```

### rating

별점 컴파운드 칩. `{component.list-row}`·`{component.restaurant-row}`·`{component.product-card}` 메타에 반복 등장하는 재사용 단위다. inline-flex(gap 2px), 별은 별점 전용 골드 `oklch(0.82 0.16 85)`(`#FFC42E` — 포인트 코인 `{colors.yellow}`보다 약간 어둡고 채도 낮은 별 전용 색) 14px, 평점 숫자는 `{typography.body-sm}` 800 `{colors.fg-1}`, 회색 리뷰수는 `{colors.fg-3}` 600 좌측 margin 4px. 리뷰수 표기는 `리뷰 999`·`리뷰 1만+`·`리뷰 9`처럼 한국어 수 표기를 그대로 쓴다 [src:3].

```tsx
<Rating>
  <Star color="oklch(0.82 0.16 85)">★</Star>
  <Score className="body-sm" weight={800}>4.8</Score>
  <Reviews color={`{colors.fg-3}`}>리뷰 999</Reviews>   {/* 1만+ · 9 */}
</Rating>
```

### coupon-banner

쿠폰함 진입 배너. `{colors.orange}` 또는 `{colors.primary-tint}` 배경 위에 한나체 헤드라인 + Pretendard 작은 안내 카피 + 우측 화살표(`›`) 구조다. 카피 패턴은 닉네임 호명을 포함한다(`왓더님, 바로 쓸 수 있는 / 5,000원 쿠폰이 있어요!`) — `{typography.font-display}` 헤드라인 4~7자 라인 브레이크 규칙이 이 컴포넌트에서도 그대로 적용된다 [src:1][src:3].

```tsx
<CouponBanner bg={`{colors.orange}`}>
  <Headline className="display-3">
    왓더님, 바로 쓸 수 있는<br />5,000원 쿠폰이 있어요!
  </Headline>
  <Hint className="body-sm" color={`{colors.fg-2}`}>쿠폰함에서 확인 ›</Hint>
</CouponBanner>
```

### coupon-card-light

홈·지갑 화면의 흰 쿠폰 카드. `{component.coupon-banner}`(오렌지/네이비 풀배경 배너)와 시각 어휘가 다른 **흰 표면 + 민트 보더** 패턴이라 별도 컴포넌트로 분리한다. flex row(gap 12px, max-width 380px), 컨테이너는 1.5px `{colors.primary}` 민트 보더 + 14px radius + 14/16 패딩 + `{colors.bg-surface}` 흰 배경. 좌측 안내 텍스트는 `{typography.body}` 700(`고객님을 위해 준비한 **할인 쿠폰**`), 우측은 64×44 오렌지 티켓(`{colors.orange}`, radius 10, `{typography.font-display}` 16px, `rotate(-4deg)`, `box-shadow: 2px 3px 0 oklch(0.18 0 0 / 0.12)`). 티켓 우상단(−6px)에 20px 원형 B코인 뱃지(`{colors.fg-1}` 배경 + `{colors.primary}` 민트 "B", 11px 900)가 겹친다 [src:1][src:3].

```tsx
<CouponCardLight border={`1.5px {colors.primary}`} radius={14}>
  <Text className="body">고객님을 위해 준비한 <strong>할인 쿠폰</strong></Text>
  <Ticket bg={`{colors.orange}`} w={64} h={44} radius={10} rotate={-4}
          shadow="2px 3px 0 oklch(0.18 0 0 / 0.12)">
    쿠폰
    <BCoin bg={`{colors.fg-1}`} fg={`{colors.primary}`} size={20}>B</BCoin>
  </Ticket>
</CouponCardLight>
```

### empty-state-clay

페이지 배경(`{colors.bg-page}`) 위 단일 한글자 점토 일러스트(`찜`, `탕`) + 작은 회색 안내 카피(`{typography.caption}` / `{colors.fg-3}`, `자주 찾는 가게를 찜 해보세요`). 글자 하단에 점토 캐릭터(누운 인형)가 살짝 겹쳐 누워 손맛 톤을 강조한다 [src:1].

```tsx
<EmptyState>
  <ClayLetter char="찜" overlay={<ClayCharacter pose="lying" />} />
  <Caption color={`{colors.fg-3}`}>자주 찾는 가게를 찜 해보세요</Caption>
</EmptyState>
```

### points-empty

배민포인트·쿠폰함의 빈 상태. `{colors.bg-page}` 풀 배경 + 보물상자·하트박스·동전 3D 굿즈 렌더 + 작은 회색 안내 카피(`{typography.caption}` `{colors.fg-3}`, `포인트 상세내역이 없습니다.` — 격식 종결어미)로 구성된다. `{component.empty-state-clay}`(점토 한 글자)와는 시각 어휘가 다르므로 — 점토는 마케팅·찜 영역, 3D 굿즈는 지갑·포인트·쿠폰 영역 — 별도 컴포넌트로 분리한다 [src:1][src:3].

```tsx
<PointsEmpty bg={`{colors.bg-page}`}>
  <Goods3d kind="treasure-box" />
  <Caption color={`{colors.fg-3}`}>포인트 상세내역이 없습니다.</Caption>
</PointsEmpty>
```

### button-primary

높이·폰트·좌우 패딩이 사이즈별로 묶인다 — **SM** 40px / 14px / 좌우 16px, **MD** 56px / 16px / 좌우 24px, **LG** 64px / 18px / 좌우 32px. 모든 사이즈 `{rounded.pill}`. 기본은 `{colors.fg-1}` 배경 + 흰 텍스트로, 검정 알약이 가장 표준이다 [src:3].

```tsx
<Button.Primary size="md"
  bg={`{colors.fg-1}`}
  fg={`{colors.bg-surface}`}
  radius={`{rounded.pill}`}
>단골메뉴 바로 주문하기 ›</Button.Primary>
```

### button-mint

민트 변형. `{colors.primary}` 배경 + `{colors.fg-1}` 텍스트, hover/pressed에서 `{colors.primary-hover}` 배경 + 흰 텍스트로 전환된다 [src:3].

```tsx
<Button.Mint
  bg={`{colors.primary}`}
  fg={`{colors.fg-1}`}
  hoverBg={`{colors.primary-hover}`}
  hoverFg={`{colors.bg-surface}`}
  radius={`{rounded.pill}`}
>주문해 보세요</Button.Mint>
```

### button-ghost

투명 배경 + 1.5px `{colors.border-2}` 보더 — 흰/본화이트 배경 위 보조 액션 전용이다. 색상 풀 배경(`{colors.primary}` 등) 위에 둘 경우에는 fill 반전 — `{colors.bg-surface}` 흰 알약 + `{colors.fg-1}` 검정 텍스트 — 으로 inline override한다. primary 검정 알약과 색 반전으로 위계를 형성하되 알약 형태는 통일된다 [src:3].

```tsx
<Button.Ghost
  bg="transparent"
  borderColor={`{colors.border-2}`}
  borderWidth={1.5}
  radius={`{rounded.pill}`}
>등급별 혜택 ›</Button.Ghost>
```

### bottom-cta

화면 최하단에 고정되는 액션 영역. 높이 56pt, 좌우 16px padding, `env(safe-area-inset-bottom)`을 자동 인식해 노치·홈 인디케이터 영역을 회피한다. 음식배달 주문 플로우의 최종 결제 액션이 이 자리에 들어간다. 패턴 자체는 토스의 동명 컴포넌트와 같은 모바일 관습이지만, 채우는 알약은 `{colors.fg-1}` 검정 또는 `{colors.primary}` 민트 둘 다 허용된다 — 시각 무게는 화면 배경과의 대비로 정한다 [src:3].

```tsx
<BottomCta
  height={56}
  paddingX={16}
  safeArea="bottom"
>
  <Button.Primary size="md" full>주문하기 · 23,800원</Button.Primary>
</BottomCta>
```

### tag-discount

높이 22px의 `{rounded.pill}` 칩, 11px / 700 폰트. 빨강 할인 칩은 `{colors.red}` 배경 + 흰 글자(`23%`), 민트 칩은 `{colors.primary-tint}` 배경 + `{colors.mint-700}` 텍스트, 보라 칩은 `{colors.navy-tint}` + `{colors.navy}` 텍스트, 냉동 칩은 `{colors.frozen}` 원(28×28) [src:3].

```tsx
<Tag kind="discount" bg={`{colors.red}`} fg="white">23%</Tag>
<Tag kind="mint"     bg={`{colors.primary-tint}`} fg={`{colors.mint-700}`}>NEW</Tag>
<Tag kind="purple"   bg={`{colors.navy-tint}`} fg={`{colors.navy}`}>한그릇</Tag>
<Tag kind="frozen"   bg={`{colors.frozen}`} fg="white" shape="circle" size={28} />
```

### badge-status

`{component.tag-discount}`(빨강 할인 칩)와 같은 칩 계열이지만 상태·분류를 나타내는 변형군이다. 상품·가게·리스트 메타 전반에 쓰인다 [src:3].

- **냉동 인디케이터** — 32px 원형(`{rounded.circle}`), `{colors.frozen}` 배경 + 흰 `냉동` 11px 800. `{component.product-card}` 썸네일 안에서는 26~28px로 축소돼 우상단에 겹친다.
- **NEW 뱃지** — 18px 높이, 패딩 0 6px, `{colors.pink}` 배경 + 흰 글자, 9px 800, `{rounded.pill}`, letter-spacing 0.04em. 신규·미확인 항목 표식(예: `My배민` 설정의 `배민페이 등록` 옆 `NEW`).
- **민트 분류 태그** — 22px, `{colors.primary-tint}` 배경 + `{colors.mint-700}` 텍스트, 11px 700(`이마트슈퍼무배`, `✓ 5회 구매한 상품`).
- **핑크 아웃라인 태그** — 22px, `{colors.bg-surface}` 흰 배경 + 1px `{colors.pink}` 보더 + `{colors.pink}` 텍스트, 11px 700(`혼밥추천`). 채움 대신 보더로 약한 강조를 만든다.

```tsx
<TagFrozen shape="circle" size={32} bg={`{colors.frozen}`} fg="white">냉동</TagFrozen>
<BadgeNew bg={`{colors.pink}`} fg="white" tracking="0.04em">NEW</BadgeNew>
<Tag bg={`{colors.primary-tint}`} fg={`{colors.mint-700}`}>이마트슈퍼무배</Tag>
<Tag bg={`{colors.bg-surface}`} border={`1px {colors.pink}`} fg={`{colors.pink}`}>혼밥추천</Tag>
```

### toast-notice

색상 배경 위에 띄우는 안내 토스트는 **검정 캡슐 + 흰 텍스트(약 90% opacity)**다. 블러·backdrop-filter 없음 — 한국 길거리 간판의 평면 미감을 토스트까지 일관시킨다 [src:1].

```tsx
<Toast
  bg={`{colors.bg-inverse}`}
  fg="oklch(1 0 0 / 0.9)"
  radius={`{rounded.pill}`}
>잠깐! 이 주소가 맞나요?</Toast>
```

### bottom-tab-bar

5탭(검색·배민스토어·찜·주문내역·my배민). 활성 탭은 **검정 채움 아이콘**, 비활성은 라인. 높이 84px [src:1].

```tsx
<BottomTabBar height={84}>
  <Tab icon="search"   label="검색"     active fill />
  <Tab icon="store"    label="배민스토어" />
  <Tab icon="heart"    label="찜" />
  <Tab icon="receipt"  label="주문내역" />
  <Tab icon="my"       label="my배민" />
</BottomTabBar>
```

### role-title-banner

사용자 인사 영역: `귀한분, 홍길동` / `고마운분, 홍길동` — 등급명을 형용사 호칭으로 노출하고 옆에 `등급별 혜택 ›` 회색 캡슐을 둔다. 영문권 "Gold/Bronze member"의 자리에 한국어 호칭 문화를 그대로 흡수한 시그니처 패턴이다 [src:1].

```tsx
<RoleTitle>
  <strong className="h3">고마운분, </strong>
  <span className="h3">홍길동</span>
  <Button.Ghost size="sm">등급별 혜택 ›</Button.Ghost>
</RoleTitle>
```

### search-app-bar

iOS 상태표시줄 아래 위치하는 검색 화면 헤더. 좌측 `←` back, 중앙 `{rounded.pill}` 알약 검색 입력(`{colors.bg-subtle}` 배경 + 돋보기 + 텍스트 + 우측 `×` clear), 우측 카트 아이콘 + `{colors.red}` 빨강 cart-badge로 구성한다. 헤더 높이 약 48~52pt, 카트 뱃지는 absolute로 우상단에 −2px offset되어 카트 아이콘 위에 겹친다 [src:3].

```tsx
<SearchAppBar>
  <IconButton icon="back" />
  <SearchField placeholder="칭찬강정 딜리점" clearable />
  <IconButton icon="cart" badge="2" />
</SearchAppBar>
```

### tab-bar-scroll

가게 목록 상단의 카테고리 탭(전체 / 배달 / 포장 / B마트 / 배민스토어). 가로 스크롤 가능, 활성 탭은 `{colors.fg-1}` 검정 텍스트 + `{typography.body}` 700 weight + 3px 하단 underline. 비활성은 `{colors.fg-3}` 회색 + 500 weight. 탭에 카운트가 붙는 경우 `<em>99+</em>` 형식으로 라벨 옆에 같은 weight로 노출한다 [src:3].

```tsx
<TabBarScroll>
  <Tab>전체</Tab>
  <Tab active>배달 <Count>99+</Count></Tab>
  <Tab>포장 <Count>99+</Count></Tab>
  <Tab>B마트 <Count>6</Count></Tab>
</TabBarScroll>
```

### filter-chip-row

`{rounded.pill}` 캡슐 필터 칩들의 가로 스크롤 row. 4가지 종류 혼합 사용:

- **정렬 chip** — `↕` 글리프 + 라벨 (`기본순`)
- **active filter chip** — 빨강 ✕ 글리프(`{colors.red}` 원 안 흰 ✕) + 라벨 (`무료배달`, `쿠폰`)
- **dropdown chip** — 라벨 + `⌄` caret (`배달방식`)

공통적으로 `{colors.bg-surface}` 흰 fill + 1px `{colors.border-2}` 보더 + 13px 500 weight. 클릭 시 상태 변환은 빨강 ✕ 글리프 유무로 표현된다 [src:3].

```tsx
<FilterChipRow>
  <Chip kind="sort">기본순</Chip>
  <Chip kind="filter-active">무료배달</Chip>
  <Chip kind="filter-active">쿠폰</Chip>
  <Chip kind="dropdown">배달방식</Chip>
</FilterChipRow>
```

### restaurant-row

가게 목록의 표준 행. 좌측 88×88 정사각 썸네일(`{rounded.md}`, 음식 사진), 우측 가게 정보 4줄:

1. `rest-name` — `{typography.body}` 700, 15px
2. `rest-rating` — `★ 4.7(312) · 카테고리 텍스트`, `{colors.fg-2}` 12.5px
3. `rest-eta` — `⏱ 30~45분` + `free-delivery-pill` (`{colors.red}` 단색 빨강 배지)
4. `rest-min` — `최소주문 14,000원`, `{colors.fg-3}` 12px

좌하단에 `{component.club-mini-badge}` 배민클럽 배지가 thumb 좌하단에 absolute로 살짝 겹쳐 노출되어 클럽 가맹점임을 알린다. 행 끝은 1px `{colors.border-1}` 헤어라인 디바이더 [src:3].

```tsx
<RestaurantRow>
  <Thumbnail aspect="1:1" />
  <RestBody>
    <Name>칭찬강정 딜리점</Name>
    <Rating>★ 4.7(312) <Cats>순살 후라이드 치킨, 통통양념강정…</Cats></Rating>
    <ETA>⏱ 30~45분 <FreeDeliveryPill /></ETA>
    <MinOrder>최소주문 14,000원</MinOrder>
  </RestBody>
  <ClubMiniBadge />
</RestaurantRow>
```

### club-mini-badge

배민클럽 멤버십 가맹점 표식. `{colors.primary}` 민트 fill + `{colors.fg-1}` 검정 텍스트, `{typography.font-display-bold}` 도현체 10px 700, `{rounded.xs}` 4px 라운드, 좌우 padding 7px. `{component.restaurant-row}` 안에서는 absolute로 thumb 좌하단에 8px offset으로 겹쳐 노출 — "이 가게는 배민클럽 가맹입니다" 신호가 썸네일 위에 직접 박힌다 [src:3].

```tsx
<ClubMiniBadge>배민클럽</ClubMiniBadge>
```

### ad-banner-dark

검정 풀-블리드 캡슐(`oklch(0.18 0 0)`, `{rounded.md}` 12px) 안에 흰 텍스트 + 우측 노란 캐릭터 일러스트(배달팁 무료 배지 + 손). 카피 톤은 마법주문어형 — "쉿~ 고객님은 **배달팁이 무료!**". 다크 모드에서도 **검정 배경 유지** — 토큰을 `{colors.bg-inverse}` 대신 명시적 `oklch(0.18 0 0)` 리터럴로 잠그는 게 브랜드 의도 보존의 핵심이다. 그라데이션·텍스처는 일절 쓰지 않는 평면 광고 패턴이다 [src:1][src:3].

```tsx
<AdBannerDark
  bg="oklch(0.18 0 0)"
  text="쉿~ 고객님은 배달팁이 무료!"
  characterIllust={<DeliveryTipFreeBadge />}
/>
```

### empty-area-note

리스트가 비어 있거나 끝났을 때 노출하는 작은 회색 안내. center 정렬, `{typography.body-sm}` 13px `{colors.fg-3}`. 카피 톤은 격식체 — "설정하신 주소 근처 가게만 보여요." 같은 단일 라인 안내. 일반 빈 상태(`{component.empty-state-clay}`, `{component.points-empty}`)보다 더 가볍고 침묵에 가까운 톤 [src:3].

```tsx
<EmptyAreaNote>설정하신 주소 근처 가게만 보여요.</EmptyAreaNote>
```

## Key Screens

배민 디자인 시스템의 시그니처 컴포넌트들이 실제로 어떤 화면에서 어떤 조합으로 묶여 사용되는지 정리한다. 컴포넌트 카탈로그가 "vocabulary"라면 본 절은 "sentence"에 해당한다.

### 가게 목록 (배달 99+)

검색어로 가게를 찾은 뒤 카테고리·필터로 좁히는 화면. 배민 앱의 가장 핵심적인 의사결정 surface — 음식 카테고리 탐색에서 실제 주문 가게 선택으로 좁혀가는 funnel의 한가운데에 위치한다. 7개 시그니처 컴포넌트가 한 화면에 묶인다 [src:3].

**수직 적층 순서**:

1. **iOS status bar** (시간 + 통신/배터리 글리프, 14px 700)
2. **`{component.search-app-bar}`** — 검색어(`칭찬강정 딜리점`) + cart-badge `2`
3. **`{component.tab-bar-scroll}`** — 전체 / **배달 99+** (active) / 포장 99+ / B마트 6 / 배민스토어
4. **`{component.filter-chip-row}`** — `↕ 기본순` 정렬 + `✕ 무료배달` / `✕ 쿠폰` 활성 필터 + `배달방식 ⌄` 드롭다운
5. **list-subhdr** — `기본순 ⓘ` 정렬 라벨 + 우측 `광고` 표식(회색 chip)
6. **`{component.restaurant-row}`** — 음식 썸네일 + 가게명 + `★ 4.7(312)` + ETA + 빨강 `무료배달` pill + 최소주문 + 좌하단 겹친 `{component.club-mini-badge}`
7. **`{component.ad-banner-dark}`** — 검정 캡슐 + 흰 텍스트 + 노란 캐릭터 일러스트 (다크 모드에서도 검정 유지)
8. **`{component.empty-area-note}`** — "설정하신 주소 근처 가게만 보여요." 단일 라인 안내

**핵심 디자인 결정**:

- **활성 탭 = 검정 3px 하단 underline** — 한 화면에 active state가 즉시 인식 가능한 가장 강한 신호. iOS HIG의 segmented control fill 패턴 대신 underline을 선택해 한국 톤의 정제된 느낌 유지 [src:3].
- **무료배달 = 빨강 단색 pill** — 그라데이션·아이콘 일체 없음. 가격·할인 라벨이 카피의 중심이라는 원칙(`## Do's and Don'ts`)을 가게 카드 차원에서 그대로 적용 [src:1][src:3].
- **club-mini-badge가 썸네일에 겹침** — 가게가 클럽 가맹임을 시각적으로 강조하는 시그니처. 일반 list-row의 단순 텍스트 메타와 분리되어 멤버십 차원 정보임을 표면화한다 [src:3].
- **광고 배너 = 검정 + 노랑 캐릭터** — 글로벌 SaaS의 그라데이션 광고 카드와 정반대. 평면색 + 손그림 톤이 일관되게 광고 surface에도 확장된다 [src:1].
- **빈 상태 = 단일 라인** — 점토 한 글자 일러스트(`empty-state-clay`)는 콘텐츠 영역이 통째로 비어 있을 때, `empty-area-note`는 일부가 비었을 때. 두 패턴이 의도적으로 가벼움이 다르다 [src:3].

```tsx
<SearchListScreen>
  <IOSStatusBar />
  <SearchAppBar query="칭찬강정 딜리점" cartBadge={2} />
  <TabBarScroll activeKey="delivery" />
  <FilterChipRow
    sortBy="기본순"
    activeFilters={["무료배달", "쿠폰"]}
    dropdowns={["배달방식"]}
  />
  <ListSubHeader sort="기본순" showAdLabel />
  <RestaurantRow
    name="칭찬강정 딜리점"
    rating={4.7}
    reviewCount={312}
    cats="순살 후라이드 치킨, 통통양념강정"
    eta="30~45분"
    freeDelivery
    minOrder={14000}
    clubMember
  />
  <AdBannerDark text="쉿~ 고객님은 배달팁이 무료!" />
  <EmptyAreaNote>설정하신 주소 근처 가게만 보여요.</EmptyAreaNote>
</SearchListScreen>
```

### 음식배달 홈 (민트 헤더)

앱 진입 기본 화면이자 배민 비주얼 조합의 표준. 2024 *Baemin 2.0* 이후 음식배달 탭 헤더가 네이비에서 **민트 풀블리드**로 통일됐다 — 사용자가 핸드오프 chat 트레일에서 직접 교정해 확정한 캐논 레이아웃이다 [src:1][src:3].

**수직 적층 순서**:

1. **민트 헤더** — `{colors.primary}` 풀블리드, 위치 셀렉터(좌) + 알림·장바구니(우), 하단에 흰 캡슐 `{component.search-bar}`(`찾는 메뉴가 뭐예요?`)
2. **`{component.coupon-card-light}`** — 흰 카드 + 민트 보더 + 오렌지 티켓 + B코인
3. **`{component.service-cards}`** — `가게배달` / `B마트` / `배민스토어` 3분할 진입 카드
4. **섹션 헤더** — `배민배달` 18px 800 + `알뜰·한집 배민이 직접 챙겨요` 회색 보조 카피 + `›`
5. **`{component.category-grid}`** — 5×2(`족발·보쌈`·`돈까스·회`·`피자`·`중식`·`치킨`·`버거`·`분식`·`디저트`·`찜·찌개`·`전체보기`), 흰 원형 컨테이너 위 3D 미니어처
6. **핑크 쿠폰팩 배너** — `{colors.pink-tint}` 배경, `국민 장보기 아이템` 보조 + `{typography.font-display}` `첫주문이라 드려요` + `{colors.pink}` `총 1만 5천원 쿠폰팩`, 우하단 `1 / 16 모두보기` 캡슐. 오렌지 `{component.coupon-banner}`와 색·맥락이 구분되는 별도 프로모 패턴이다.
7. **검색-우선 `{component.bottom-tab-bar}`** — 첫 탭이 홈이 아니라 **검색(돋보기)**

**핵심 디자인 결정**:

- **민트 헤더 = 비양보 브랜드 색의 화면 최상단 적용** — "한 화면에 민트가 1회 이상 등장한다"는 원칙을 진입 화면에서 헤더 전면으로 실현한다 [src:1].
- **핑크 ≠ 오렌지 쿠폰** — 핑크 쿠폰팩 배너(프로모)와 오렌지 `{component.coupon-banner}`(쿠폰함 진입)는 의미가 다른 별도 컴포넌트다. 색으로 맥락을 분리한다 [src:3].
- **검색-우선 하단탭** — 첫 탭을 검색으로 둔 것은 "메뉴부터 찾는다"는 음식배달 멘탈모델을 반영한 의도된 선택이다 [src:3].

```tsx
<HomeFoodScreen>
  <MintHeader bg={`{colors.primary}`}>
    <LocationSelector>우리집 ▾</LocationSelector>
    <SearchBar fieldBg={`{colors.bg-surface}`} placeholder="찾는 메뉴가 뭐예요?" />
  </MintHeader>
  <CouponCardLight />
  <ServiceCards />                                   {/* 가게배달 · B마트 · 배민스토어 */}
  <SectionHeader title="배민배달" sub="알뜰·한집 배민이 직접 챙겨요" />
  <CategoryGrid columns={5} rows={2} />
  <PinkPromoBanner bg={`{colors.pink-tint}`}>
    <Eyebrow className="body-sm">국민 장보기 아이템</Eyebrow>
    <Headline className="display-3">첫주문이라 드려요</Headline>
    <Amount color={`{colors.pink}`}>총 1만 5천원 쿠폰팩</Amount>
  </PinkPromoBanner>
  <BottomTabBar firstTab="search" />
</HomeFoodScreen>
```

### B마트 홈

자체 물류 1시간 배송 쇼핑 허브. 음식배달 홈과 같은 토큰을 쓰되 상품 그리드 중심으로 구성된다 [src:3].

**수직 적층 순서**:

1. **검정 주소 확인 토스트** — `{component.toast-notice}` 패턴(`잠깐! 이 주소가 맞나요?` + `×`)
2. **히어로 프로모** — `오늘 우산이라 / 배달팁 돌려드려요!` `{typography.font-display}` 헤드라인. (관찰상 이 B마트 히어로만 옅은 민트 톤 그라데이션을 예외적으로 쓴다 — 마케팅 풀블리드 단색 원칙에 대한 국소 예외이므로 다른 surface로 전파하지 않는다.)
3. **카테고리 디스크 그리드** — 5열(`편의점·마트`·`반찬`·`정육·과일`·`대용량특가`·`전국별미`·`픽업`·`꽃`·`디지털`·`반려용품`·`전체`), 일부 항목에 `택배` 코너 뱃지
4. **2-컬럼 상품 그리드** — `{component.product-card}` 반복. 좌상단 빨강 `23%`, 우상단 `{component.badge-status}` 냉동 원, 우하단 민트 `+`, 하단 `{component.rating}` + `{colors.primary-tint}` 분류 뱃지(`배민이지`·`증정`·`✓ 5회 구매한 상품`·`마감세일·증정`)

**핵심 디자인 결정**:

- **냉동 = 파랑 원 인디케이터** — `{colors.frozen}`만 별도 색군을 가져 콜드체인 상품을 즉시 구분한다 [src:3].
- **분류 뱃지 = 민트 틴트** — 빨강(할인)·파랑(냉동)과 색을 분리해 가격·물류·분류 정보 층위를 나눈다 [src:3].

```tsx
<BMartScreen>
  <Toast bg={`{colors.bg-inverse}`}>잠깐! 이 주소가 맞나요?</Toast>
  <HeroPromo tone="mint">배달팁 돌려드려요!</HeroPromo>
  <CategoryGrid columns={5} variant="bmart" />
  <ProductGrid columns={2}>
    <ProductCard discount="23%" frozen rating="4.8" reviews="999" badge="✓ 5회 구매한 상품" />
    {/* … */}
  </ProductGrid>
</BMartScreen>
```

### My배민

마이페이지. 등급 호칭 문화가 가장 짙게 드러나는 화면이다 [src:1][src:3].

**수직 적층 순서**:

1. **헤더** — `←` back + `My배민` 17px 800 + 홈 아이콘. 상태바 안전영역(top ≈ 50px) 확보
2. **프로필 행** — `{component.role-title-banner}` 어휘로 `고마운분, 홍길동` 16px 700 + `›`
3. **등급 스트립** — 말 코인 + `{typography.font-display-script}`(BM 연성체) `고마운분 출두요~!`(살짝 rotate) + `등급별 혜택` 고스트 버튼. 등급명을 형용사로 호칭하는 시그니처가 코인·카피·버튼에 겹쳐 표현된다.
4. **3분할 액션 그리드** — 찜·주문내역·리뷰관리 등, `{colors.bg-surface}` 흰 카드 + `{colors.border-1}` 분할선
5. **광고/혜택 행** — `{component.list-row}` 톤 + 우측 고스트 CTA
6. **설정 리스트** — 행 우측에 `{component.badge-status}` NEW(핑크) 뱃지(예: `배민페이 등록` 옆)

**핵심 디자인 결정**:

- **등급 = 형용사 호칭** — `고마운분`·`귀한분`이 코인·연성체 카피·버튼에 일관 적용된다. 영문 "Gold/Bronze"의 자리를 한국어 호칭이 대체한다 [src:1].
- **연성체의 국소 사용** — 본문은 Pretendard지만 등급 카피 같은 정감 포인트에 `{typography.font-display-script}`(BM 연성체)를 미세하게 섞어 손맛 톤을 더한다 [src:3].

```tsx
<MyBaeminScreen>
  <Header title="My배민" safeTop />
  <ProfileRow className="role-title">고마운분, 홍길동 ›</ProfileRow>
  <GradeStrip coin="horse" font={`{typography.font-display-script}`}>고마운분 출두요~!</GradeStrip>
  <ActionGrid items={["찜", "주문내역", "리뷰관리"]} />
  <SettingsList>
    <Row badge={<BadgeNew>NEW</BadgeNew>}>배민페이 등록</Row>
  </SettingsList>
</MyBaeminScreen>
```

## Voice & Copy

배민의 카피는 시그니처 디자인 자산이다 — 컬러·폰트와 동급으로 다뤄야 한다. 영문 SaaS 관행을 그대로 직역하면 배민 톤이 즉시 무너지므로, 본 절은 자주 등장하는 자리별 매핑을 표로 정리한다. 핸드오프 README §3-2/§3-3/§3-4가 이 톤을 콘텐츠 비협상 규칙으로 못박는다 [src:1][src:3].

기본 원칙은 세 가지다. 첫째, **인칭과 격식**: 사용자는 `고객님` / `왓더님`(닉네임 + `~님`) / `귀한분, 홍길동` 등급 호명으로 부른다. 시스템은 `~요/~입니다` 끝맺음을 쓰고, 명령형 대신 청유형을 택한다(`주문해 보세요`, `함께해요`). 둘째, **이모지·느낌표 절제**: UI에 이모지는 거의 쓰지 않는다 — 캐릭터·일러스트가 그 자리를 대체한다. 느낌표는 강조용 1개만 허용하고, 두 개 이상은 마법주문어 예외(`뚝딱!!`)에 한한다. 셋째, **한국어 토착성**: 영문 차용을 의도적으로 피하고 `한그릇`·`B마트`·`먹깨비` 같은 순우리말로 서비스 라인업을 채운다.

| 상황 | 영문 관행 | 배민 카피 |
|---|---|---|
| 검색 placeholder | "Search restaurants…" | `찾는 메뉴가 뭐예요?` / `브런치 나와라 뚝딱!!` (마법주문어) |
| 빈 상태 | "No items found" | `근처에 주문할 수 있는 가게가 없어요` + 점토 일러스트 |
| CTA | "Buy now" | `단골메뉴 바로 주문하기 ›` / `기업용 상품권 구매하기` |
| 알림 | "Coupon available" | `5,000원 쿠폰이 있어요!` (느낌표·강조) |
| 등급 호명 | "Bronze / Gold member" | `귀한분, 홍길동` / `고마운분, 홍길동` (등급=형용사) |
| 빈 카트·지갑 | "Empty cart" | `포인트 상세내역이 없습니다.` (격식 종결어미) |

표의 좌측 영문 관행을 우측 배민 카피로 그대로 대체해도 톤이 무너지지 않는 경우만 모았다. 새 카피를 작성할 때는 행 단위로 매칭되는 자리를 먼저 찾고, 매칭되는 행이 없으면 위 세 가지 원칙을 거꾸로 적용한다.

## Do's and Don'ts

### Do

- 헤드라인은 `{typography.font-display}`(한나체) 한 줄 4~7자, 2~3줄까지 시처럼 라인 브레이크한다. 본문은 `{typography.body}` Pretendard 13~17px 범위 [src:1][src:3].
- 마케팅 풀-블리드는 `{colors.primary}` 단색 위에 손그림 라인 일러스트(`{colors.border-strong}` 두꺼운 검정 윤곽선)를 자유 배치한다 [src:1].
- 할인은 항상 `{colors.red}` 사각/캡슐 칩 단색이며, 가격은 `{typography.price}`(800 weight, tabular-nums)를 쓴다 [src:3].
- 색상 풀 배경 위 안내 텍스트는 `{component.toast-notice}` 패턴(블랙 캡슐 + 90% 흰 텍스트)으로 보호한다 [src:1].
- 카테고리·서비스 행은 순우리말로 명명한다(`한그릇`·`B마트`·`먹깨비`·`픽업`). 영문 SaaS의 "Pro/Premium/Plus" 자리를 토착어로 채운다 [src:1].
- 등급 호명은 `귀한분`·`고마운분` 같은 형용사 + 사용자 이름 형태로 한다 [src:1].
- placeholder·CTA는 **위트 카피**를 허용한다(`찾는 메뉴가 뭐예요?`, `뚝딱!!`, `함께해요!`). 강조용 느낌표 1개, 마법주문어 예외에 한해 두 개 [src:1].
- 빈 상태는 점토 한글이나 3D 굿즈 일러스트 중 하나로 채우고, 안내 카피는 작은 회색(`{colors.fg-3}` / `{typography.caption}`)으로 짧게 단다 [src:1].
- 새 컴포넌트의 색은 `### Semantic alias` 슬롯에 먼저 정렬한다. raw 토큰(`{colors.red}` 등)을 직접 박는 것은 새 role을 만들 때로 한정한다 [src:3].

### Don't

- 글로벌 SaaS의 그라데이션 카드·AI생성 일러스트·무거운 드롭섀도우는 쓰지 않는다. shadow는 `{elevation.shadow-1}`~`{elevation.shadow-3}` 범위(opacity 4~8%) 내에서만, 만화 톤이 필요할 때만 `{elevation.shadow-sticker}`를 쓴다 [src:1][src:3].
- 본문 텍스트 색은 `{colors.fg-1}`~`{colors.fg-3}` 안에서 고른다. 순수 검정·순백은 피한다 — 배경도 `{colors.bg-page}` 본화이트가 디폴트다 [src:3].
- 이모지를 UI에 쓰지 않는다 — 캐릭터·일러스트가 그 자리를 대체한다. `★`·`›`·`✓` 같은 유니코드 글리프 일부만 허용한다 [src:1].
- 등급명을 "Gold/Bronze/VIP"로 표기하지 않는다 — 한국어 형용사 호칭(`귀한분`·`고마운분`)이 시그니처다 [src:1].
- 헤드라인을 한 줄로 길게 흘리지 않는다. 4~7자 라인 브레이크가 한나체 시각 율동의 핵심이다 [src:1].
- 할인·세일 라벨에 그라데이션을 쓰지 않는다. 단색 빨강(`{colors.red}`) 칩이 규약이다 [src:1][src:3].
- 통통 튀는 spring 애니메이션을 쓰지 않는다. 200ms 내외 `{ease-out}` 페이드+슬라이드 4~12px이 표준이다 [src:1][src:3].
- 한나체를 본문 사이즈(15px 이하)에 쓰지 않는다. line-height 1.0~1.1의 디스플레이 폰트라 작은 사이즈에서 가독성이 빠르게 떨어진다 [src:3].
- 배민의 배달 제품 도메인(가게 목록·`{component.restaurant-row}`·ETA·무료배달 흐름)과 브랜드 고유 작명·호칭(`한그릇`·`B마트` 순우리말 라인업, `귀한분`·`고마운분` 등급 호명, "민족" 언어유희)을 성격이 다른 제품에 그대로 이식하지 않는다 — 차용할 것은 시각 언어(길거리 간판 미감, 한나체 디스플레이 운용, 단색 빨강 할인 칩, 손그림 일러스트, 본화이트 배경)이지 배민의 서비스 도메인·카피 정체성이 아니다 [src:1][src:3].

## Responsive Behavior

핸드오프 가이드는 웹 컨테이너 `{layout.container-web}` = 1280px, 앱 레퍼런스 `{layout.container-app}` = 390px(iPhone 14)을 기준으로 한다. 별도의 명시적 breakpoint 그리드는 공개돼 있지 않으며 — 아래 표는 핸드오프 토큰과 관찰된 동작을 종합한 추정이다 [src:3].

| Breakpoint | Container | Key changes |
|---|---|---|
| **≥ 1280px** (desktop) | 1280px 풀 | 웹 히어로 = 한 viewport 한 메시지. 도현체 `display-1` 96px 풀 노출. 우측 점 인디케이터로 슬라이드 위치 표시 [src:1]. |
| **≥ 768px** (tablet) | 가운데 정렬, 좌우 여백 24~48px 추정 | 헤드라인 사이즈 `display-2` 72px로 축소 추정. 일러스트는 헤드라인 우하단 유지 (no published breakpoint system surfaced). |
| **≤ 480px** (mobile / 앱) | 390px 기준 | 카테고리 5×2 그리드 유지. `{component.bottom-tab-bar}` 84px 고정. `{component.bottom-cta}` 56pt + safe-area inset 보정. 헤더 56~64px. 시트는 `{rounded.3xl}` 32px [src:1][src:3]. |

- **터치 타깃**: 알약 버튼 SM 40 / MD 56 / LG 64px 모두 44×44pt iOS 가이드 이상이다. `{component.bottom-tab-bar}` 탭 영역도 동일 [src:3].
- **이미지**: 카테고리 아이콘은 `{rounded.circle}` 원형, B마트 상품 썸네일은 1:1 정사각 `{rounded.md}`. 모바일에서도 비율을 유지한다 [src:1][src:3].
- **그리드 붕괴**: 카테고리는 항상 5열 — 작은 화면에서 더 작은 아이콘으로 축소하되 행을 늘리지 않는 것이 관찰된다 (no published collapsing rule surfaced).

## Known Gaps

- **공식 토큰 시스템 미배포**: 본 문서는 Claude Design이 스크린샷과 공개 자료를 토대로 재구성한 핸드오프 번들에 기반하며, 우아한형제들이 공식 배포한 Figma·코드베이스가 아니다. 실제 프로덕션과 1~3px·1~2단계 hex 채도 편차가 존재할 수 있다 [src:1].
- **WORK 폰트 미반영**: 2024 *Baemin 2.0* 리브랜드와 함께 공개된 자체 폰트 WORK는 외부 공개 배포가 확인되지 않아 본 문서 디스플레이 스택은 여전히 BM 한나체 시리즈를 기준으로 한다. 실제 신규 앱에서 헤드라인 폰트가 WORK로 교체됐는지 확인 필요 [src:6].
- **민트 hex 표기 다원화**: 2010년대 후반 The PR 기사의 `#5EBEBB` 표기는 현행 디지털 프라이머리(`#0CEFD3`, Baemin 2.0)나 레거시 디지털 민트(`#2AC1BC`) 어느 쪽과도 정확히 일치하지 않는다 — 인쇄·홍보 자산용 다른 표기로 추정되며 디지털 토큰 적용 시 핸드오프 값을 우선한다 [src:3][src:9].
- **마스코트 SVG 미포함**: 배달이친구들(독고배달이·메이배달이·냥이배달이 등 15종) 공식 SVG는 외부 배포되지 않아 핸드오프는 image-slot placeholder만 제공한다 [src:1][src:10][src:5].
- **아이콘 시스템 단일화 미확인**: 핸드오프는 UI 라인 아이콘을 Lucide로 대체하되 SUBSTITUTION FLAG를 표시한다. 실제 배민은 (1) UI 라인 아이콘, (2) 3D 미니어처 카테고리, (3) 벡터 일러스트 배민스토어, (4) 손그림 라인 마케팅의 4종을 혼용 — 통합 아이콘 시스템은 공개되지 않았다 [src:1].

## References

1. https://designcompass.org/en/2025/07/23/baemin-2-rebranding/ — Baemin 2.0 리브랜드 (2024년 7월, 김범석 대표 코멘트, WORK 폰트 공개)
2. https://woowahan.com — 우아한형제들 공식 사이트, 모회사 / IR / 폰트 라이선스 진입
3. https://brandfetch.com/baemin.com — 브랜드 메타데이터 대조용
4. https://www.the-pr.co.kr/news/articleView.html?idxno=19376 — 배민 민트 CMYK 65:0:29:0 채택 근거 (The PR)
5. https://www.specialtimes.co.kr/news/articleView.html?idxno=241987 — 배달이친구들, 꼭두 모티브, 민트 헬멧
6. https://github.com/google/fonts — BM 시리즈 OFL TTF(한나·주아·도현·연성·개구) 라이선스 검증
7. https://www.edaily.co.kr/news/read?newsId=01249686625639032 — "우리가 어떤 민족입니까" (2014, 류승룡, HS애드)
8. https://www.brandbrief.co.kr/news/articleView.html?idxno=5667 — 한명수 CCO 인터뷰: 한나체 모티브, "쉽고 명확하고 위트있게", "공공재 브랜드"
9. https://design.co.kr/article/15070/ — 김봉진 "배민다움", "예쁘지는 않지만 사랑스럽다"
10. https://bcut.baemin.com/4941/ — 배민 글림체, 옛 간판 모티프, 을지로 글씨 장인 (B컷 by 배민)
11. https://noonnu.cc/en/font_page/53 — 주아체 SIL OFL 1.1 라이선스
12. https://noonnu.cc/en/font_page/55 — 도현체 SIL OFL 1.1 라이선스
13. https://www.newswatch.kr/news/articleView.html?idxno=57219 — 배달이친구들 한명수 CCO 인용
14. https://www.iconsumer.or.kr/news/articleView.html?idxno=4988 — 배민 폰트 마케팅, B급 문화 페르소나
