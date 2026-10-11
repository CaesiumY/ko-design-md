---
name: NOL
slug: nol
category: travel
last_updated: "2026-10-11"
created_at: "2026-10-11"
lang: ko
logo: https://getdesign.kr/logos/nol.png
colors:
  ## 발행 팔레트 — NOL 브랜드 컬러 · 놀유니버스 기업 컬러 (nol-universe.com 에셋 센터)
  primary: "{colors.nol-blue}"   # 명세 대표색 별칭 — 발행 놀 블루를 가리킨다 · 서비스 CTA 파랑 primary-main 과 다른 값
  nol-blue: oklch(0.526 0.264 269.0)   # #3549FF · 발행 · NOL 브랜드 컬러 '놀 블루'(페이지 표기 NOL UNIVERSE BLUE) · RGB 53 73 255 · CMYK C95 M60 Y0 K0 · PMS 2728C
  nol-black: oklch(0.000 0.000 0.0)   # #000000 · 발행 · NOL 브랜드 컬러 NOL BLACK · CMYK 원문 C205 M20 Y0 K100(0–100 범위 밖, 정본 미상) · PMS 없음
  nol-white: oklch(1.000 0.000 0.0)   # #FFFFFF · 발행 · NOL 브랜드 컬러 NOL WHITE · CMYK C0 M0 Y0 K0 · PMS 없음
  nol-universe-blue: oklch(0.526 0.264 269.0)   # #3549FF · 발행 · 놀유니버스 기업 컬러(법인 CI) NOL UNIVERSE BLUE · nol-blue 와 같은 값, 다른 절 · PMS 2728C
  nol-universe-light-blue: oklch(0.643 0.190 264.1)   # #5085FF · 발행 · 놀유니버스 기업 컬러 NOL UNIVERSE LIGHT BLUE · CMYK C65 M30 Y0 K0 · PMS 2727C · NOL 브랜드 컬러가 아니고 NOL 웹 번들에 0건
  ## 서비스 UI 관측(미발행) — 프라이머리 (nol.yanolja.com CSS 번들)
  primary-main: oklch(0.548 0.250 270.3)   # #4154FF · 관측(미발행) · fill-primary-main·text-primary-main·text-brand-main·border-line-primary-main · CTA·선택·포커스·검색창 테두리 · 발행 놀 블루와 다른 값
  primary-presshover-strong3: oklch(0.400 0.193 269.5)   # #2432AD · 관측(미발행) · interaction-primary-presshover-strong3 · 프라이머리 호버·눌림
  primary-weak: oklch(0.975 0.012 281.1)   # #F5F6FF · 관측(미발행) · fill-primary-weak(= colors-blue-50) · 신규오픈 배지·검색 칩 바탕
  primary-weak1: oklch(0.919 0.040 280.9)   # #DFE2FF · 관측(미발행) · line-primary-weak1·interaction-primary-presshover-weak1 · 약한 선·눌림
  primary-weak2: oklch(0.808 0.098 278.8)   # #B2BAFF · 관측(미발행) · line-primary-weak2 · 배지 테두리
  primary-weak3: oklch(0.728 0.142 277.4)   # #929DFF · 관측(미발행) · fill-primary-weak3 · 화면 쓰임 미확인
  primary-weak4: oklch(0.652 0.187 275.2)   # #7280FF · 관측(미발행) · fill-primary-weak4·line-primary-weak4 · 화면 쓰임 미확인
  ## 서비스 UI 관측(미발행) — 강조·위험·경고
  accent-main: oklch(0.579 0.237 28.1)   # #E5000F · 관측(미발행) · fill-accent-main·text-text-accent-main·text-text-accent-medium·fill-danger-main·text-danger-main·border-line-danger-main · 할인율·쿠폰 · accent 와 danger 가 같은 값
  accent-weak: oklch(0.977 0.010 17.3)   # #FEF5F5 · 관측(미발행) · fill-accent-weak · 쿠폰 칩 바탕
  danger-weak2: oklch(0.788 0.104 15.2)   # #F59EA4 · 관측(미발행) · border-line-danger-weak2 · 위험 약선
  danger-presshover-strong3: oklch(0.436 0.178 27.6)   # #9C000A · 관측(미발행) · hover-never:bg-interaction-danger-presshover-strong3 · 번들에만 있고 화면에서 못 봄
  warning-main: oklch(0.570 0.185 38.4)   # #CC4100 · 관측(미발행) · text-warning-main · 경고 글자
  warning-weak: oklch(0.982 0.010 67.7)   # #FEF8F2 · 관측(미발행) · fill-warning-weak · 경고 약면
  ## 서비스 UI 관측(미발행) — 멤버십·별점
  membership-dia-main: oklch(0.526 0.264 269.0)   # #3549FF · 관측(미발행) · text-membership-dia-main · 발행 nol-blue 와 같은 값
  membership-gold-main: oklch(0.549 0.116 73.9)   # #996500 · 관측(미발행) · text-membership-* 계열(정확한 유틸리티 이름 미확인) · 멤버십 골드
  membership-platinum-main: oklch(0.536 0.109 167.9)   # #008161 · 관측(미발행) · text-membership-* 계열(정확한 유틸리티 이름 미확인) · 멤버십 플래티넘 · 상세 '무료취소' 글자도 이 값
  star: oklch(0.831 0.156 79.1)   # #FDBA39 · 관측(미발행) · 이름은 이 항목이 붙임 · 별점 SVG 채움(임의 클래스·목록 SSR 별 SVG fill)
  ## 서비스 UI 관측(미발행) — 뉴트럴
  neutral-main: oklch(0.227 0.006 271.1)   # #1B1C1F · 관측(미발행) · fill/text/border-neutral-main · html 기본 글자색 · 본문 글자·모바일 탭 선택 필·하단 내비 활성
  neutral-strong1: oklch(0.542 0.006 274.9)   # #6E6F73 · 관측(미발행) · 키 이름은 보드 사다리 명명 · 유틸리티는 text-neutral-sub · 보조 글자(장소·카테고리·메타)·비선택 탭·하단 내비 비활성
  neutral-medium: oklch(0.643 0.008 268.5)   # #8B8D92 · 관측(미발행) · text-neutral-medium · 일정·PC 플레이스홀더·마감 객실 글자 · 푸터 로고 SVG 채움과 같은 값
  neutral-weak4: oklch(0.780 0.006 274.9)   # #B6B7BB · 관측(미발행) · 키 이름은 보드 사다리 명명 · 유틸리티 미기록 · 비활성 글자
  neutral-weak3: oklch(0.892 0.006 275.0)   # #DADBDF · 관측(미발행) · line-neutral-weak3·interaction-neutral-disable-main · 입력·필터 테두리·비활성 면
  neutral-weak2: oklch(0.938 0.007 277.2)   # #E9EAEF · 관측(미발행) · line-neutral-weak2 · 검색창 outline·구분선
  neutral-weak1: oklch(0.965 0.005 275.0)   # #F2F3F7 · 관측(미발행) · line-neutral-weak1·interaction-neutral-presshover-weak1·colors-gray-100 · 이미지 자리·카드 구분선·헤더 액션 호버
  neutral-weak: oklch(0.979 0.004 271.4)   # #F7F8FB · 관측(미발행) · fill-neutral-weak · 푸터·공지 줄·비선택 섹션 칩
  neutral-veryweak: oklch(0.988 0.003 264.5)   # #FAFBFD · 관측(미발행) · fill-neutral-veryweak(상세 번들만) · 쿠폰 마감 면
  static-white: oklch(1.000 0.000 0.0)   # #FFFFFF · 관측(미발행) · static-white · 흰 글자·카드·페이지 바탕(body background !important)
  static-black: oklch(0.000 0.000 0.0)   # #000000 · 관측(미발행) · static-black · PC 섹션 칩 선택 바탕
  ## 서비스 UI 관측(미발행) — 투명도
  scrim: oklch(0.000 0.000 0.0 / 0.5)   # #000000 · 알파 0.5 · 관측(미발행) · bg-scrim · 바텀시트 백드롭
  opacity-black-60: oklch(0.000 0.000 0.0 / 0.6)   # #000000 · 알파 0.6 · 관측(미발행) · 이미지 위 카운터 알약
  opacity-black-10: oklch(0.000 0.000 0.0 / 0.1)   # #000000 · 알파 0.1 · 관측(미발행) · outline-opacity-black-10 · 캐러셀 화살표 외곽선
  opacity-black-5: oklch(0.000 0.000 0.0 / 0.05)   # #000000 · 알파 0.05 · 관측(미발행) · 하단 내비 상단선·이미지 인셋 외곽
typography:
  ## headline — 관측(미발행) · 번들 typography-* 이름에서 typography- 를 뗐다 · 자간 ≈ 렌더 판독
  headline-40-bold:
    fontSize: 40px
    fontWeight: 700
    lineHeight: 48px
    letterSpacing: 0em
  headline-32-bold:
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: 0em
  headline-32-regular:
    fontSize: 32px
    fontWeight: 400
    lineHeight: 38px
    letterSpacing: 0em
  headline-24-bold:
    fontSize: 24px
    fontWeight: 700
    lineHeight: 29px
    letterSpacing: 0em
  headline-24-regular:
    fontSize: 24px
    fontWeight: 400
    lineHeight: 29px
    letterSpacing: 0em
  ## subtitle — 관측(미발행) · 자간 ≈ 렌더 판독
  subtitle-20-bold:
    fontSize: 20px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0em
  subtitle-20-semibold:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0em
  subtitle-20-regular:
    fontSize: 20px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0em
  subtitle-20-bold-multiline:
    fontSize: 20px
    fontWeight: 700
    lineHeight: 28px
    letterSpacing: 0em
  subtitle-18-bold:
    fontSize: 18px
    fontWeight: 700
    lineHeight: 22px
    letterSpacing: 0em
  subtitle-18-semibold: # 홈 번들 ds-pc: 접두·목록 번들에서 확인
    fontSize: 18px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0em
  subtitle-18-regular:
    fontSize: 18px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0em
  subtitle-18-bold-multiline: # ≈ 보드 번들 판독 · 위치 재확인 못 함 · 공개 출처 없음
    fontSize: 18px
    fontWeight: 700
    lineHeight: 27px
    letterSpacing: 0em
  subtitle-18-regular-multiline: # 홈 번들에 pc:typography- 접두로만 있다
    fontSize: 18px
    fontWeight: 400
    lineHeight: 27px
    letterSpacing: 0em
  subtitle-16-bold:
    fontSize: 16px
    fontWeight: 700
    lineHeight: 19px
    letterSpacing: 0em
  subtitle-16-semibold:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 19px
    letterSpacing: 0em
  subtitle-16-regular:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 19px
    letterSpacing: 0em
  subtitle-16-bold-multiline:
    fontSize: 16px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: 0em
  subtitle-16-semibold-multiline: # 목록 번들에서 확인
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: 0em
  subtitle-16-regular-multiline:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0em
  ## body — 관측(미발행) · 자간 ≈ 렌더 판독
  body-14-bold:
    fontSize: 14px
    fontWeight: 700
    lineHeight: 17px
    letterSpacing: 0em
  body-14-semibold:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 17px
    letterSpacing: 0em
  body-14-regular:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 17px
    letterSpacing: 0em
  body-14-bold-multiline: # 상세 번들에서 확인
    fontSize: 14px
    fontWeight: 700
    lineHeight: 21px
    letterSpacing: 0em
  body-14-regular-multiline:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0em
  body-13-bold:
    fontSize: 13px
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: 0em
  body-13-semibold:
    fontSize: 13px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0em
  body-13-regular:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0em
  body-13-bold-multiline:
    fontSize: 13px
    fontWeight: 700
    lineHeight: 20px
    letterSpacing: 0em
  body-13-semibold-multiline: # 목록 번들에서 확인
    fontSize: 13px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0em
  body-13-regular-multiline:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0em
  body-12-bold:
    fontSize: 12px
    fontWeight: 700
    lineHeight: 14px
    letterSpacing: 0em
  body-12-semibold:
    fontSize: 12px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0em
  body-12-regular:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 14px
    letterSpacing: 0em
  body-12-bold-multiline: # 상세 번들에서 확인
    fontSize: 12px
    fontWeight: 700
    lineHeight: 18px
    letterSpacing: 0em
  body-12-regular-multiline:
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0em
  ## caption · label — 관측(미발행) · 자간 ≈ 렌더 판독
  caption-11-bold:
    fontSize: 11px
    fontWeight: 700
    lineHeight: 13px
    letterSpacing: 0em
  caption-11-regular:
    fontSize: 11px
    fontWeight: 400
    lineHeight: 13px
    letterSpacing: 0em
  caption-11-regular-multiline:
    fontSize: 11px
    fontWeight: 400
    lineHeight: 17px
    letterSpacing: 0em
  label-10-bold:
    fontSize: 10px
    fontWeight: 700
    lineHeight: 12px
    letterSpacing: 0em
  label-10-regular:
    fontSize: 10px
    fontWeight: 400
    lineHeight: 12px
    letterSpacing: 0em
  label-8-bold:
    fontSize: 8px
    fontWeight: 700
    lineHeight: 10px
    letterSpacing: 0em
spacing:
  ## 관측(미발행) — 닫힌 스케일이 아니라 반복 관측된 값만
  pc-gutter: 40px   # 관측(미발행) · px-40 · PC 1320 프레임 좌우(콘텐츠 1240) · 홈·목록 공통
  mobile-gutter-home: 20px   # 관측(미발행) · 홈 px-20
  mobile-gutter: 16px   # 관측(미발행) · 목록·상세 모바일 좌우
  section-gap: 16px   # 관측(미발행) · 홈 gap-16 · 모바일 섹션 사이 · 섹션 pb-16
  section-gap-pc: 40px   # 관측(미발행) · 홈 ds-pc:gap-40 · PC 섹션 사이
  section-title-gap: 24px   # 관측(미발행) · 홈 mb-24 · 섹션 제목–탭
  card-gap-x: 12px   # 관측(미발행) · 호텔 카드 gap-x-12(모바일)
  card-gap-y: 16px   # 관측(미발행) · 호텔 카드 gap-y-16
  card-gap-x-pc: 20px   # 관측(미발행) · 호텔 카드 ds-pc:gap-x-20 · 레저 gap-20
  card-padding: 16px   # 관측(미발행) · 목록 카드 p-16(PC 는 px-0 py-20)
rounded:
  ## 관측(미발행) — 키는 유틸리티 이름 그대로 (1rem = 10px)
  4: 4px   # 관측(미발행) · rounded-4 · '인증' 배지
  6: 6px   # 관측(미발행) · rounded-6 · 텍스트 배지
  8: 8px   # 관측(미발행) · ≈ 가입 배너 CTA(캡처 판독)
  10: 10px   # 관측(미발행) · rounded-10 · 화면 쓰임 미확인 · rounded-2xl 도 10px
  12: 12px   # 관측(미발행) · rounded-12 · 높이 40·44 컨트롤·모바일 공지 줄·목록 카드 이미지
  16: 16px   # 관측(미발행) · rounded-16 · 높이 48·52 컨트롤·헤더 액션·카드·필터 패널
  20: 20px   # 관측(미발행) · rounded-20 · 모바일 히어로·상세 모바일 갤러리
  24: 24px   # 관측(미발행) · rounded-24 · 카테고리 타일
  28: 28px   # 관측(미발행) · rounded-28 · PC 히어로·배너 이미지·바텀시트 상단
  capsule: 9999px   # 관측(미발행) · rounded-full·rounded-capsule · 검색창·칩·공지·신규오픈 배지
elevation:
  shadow-1: 0 0 8px oklch(0 0 0 / 0.05)   # 관측(미발행) · 상세 섹션 상단 구분
  shadow-2: 0 0 8px oklch(0 0 0 / 0.1)   # 관측(미발행) · 캐러셀 화살표·하단 내비·모바일 하단 고정바·지도 버튼
  shadow-3: 0 0 6px oklch(0 0 0 / 0.2)   # 관측(미발행) · '전체 사진' 버튼·모바일 '지도' 필 버튼
  shadow-4: 0 0 6px 0 oklch(0 0 0 / 0.4)   # 관측(미발행) · 상세 번들 선언 · 쓰는 요소 미확인
  shadow-5: 0 0 10px 0 oklch(0 0 0 / 0.4)   # 관측(미발행) · 이름은 이 항목이 붙임 · 번들 선언만, 렌더 미관측
gradients:
  ## 관측(미발행) — 이름은 이 항목이 붙였다 · 명세 Color 는 단색만이라 colors: 밖에 둔다
  brand-border: oklch(0.729 0.142 243.3) 0%, oklch(0.630 0.162 268.7) 33%, oklch(0.526 0.264 269.0) 66%, oklch(0.548 0.208 297.4) 100%   # #4AB0F9 #6181EA #3549FF #8249D8 · 90deg(258deg 변형도 번들 3종에 있음) · 1px 그라디언트 테두리
  detail-bg: oklch(0.697 0.149 250.2) 0%, oklch(0.614 0.205 262.6) 25%, oklch(0.547 0.213 268.2) 50%, oklch(0.526 0.228 270.8) 75%, oklch(0.511 0.228 285.9) 100%   # #4BA2F6 #3C7BFD #3E5FEA #4052EB #643EDF · 78.57deg · 상세 번들 --bg · 쓰는 요소 미확인
---

## Brand & Style

NOL은 흰 바탕 위에 채도 높은 파랑을 예약·선택·포커스에만 아껴 쓰고, 숙소와 공연 사진을 둥근 모서리로 크게 잘라 화면의 주인공으로 세우는 여행·여가 플랫폼이다 [src:5][src:8].

**범위.** NOL은 ㈜놀유니버스가 운영한다. 소비자 웹 푸터와 놀유니버스 홈 푸터가 같은 사업자등록번호를 적는다 [src:4][src:5]. 놀유니버스는 야놀자플랫폼과 인터파크트리플을 통합한 법인으로 2024년 말 출범했고 [src:2][src:17], 소비자 앱 '야놀자'는 2025-03 발표에서 NOL로 이름을 바꾸기로 했다 [src:18][src:19]. 첫 캠페인 보도는 이름만이 아니라 로고·디자인·구성까지 브랜드 전반을 새로 정립했다고 쓴다 [src:20]. 2026년에는 서비스 일원화가 발표되고 NOL 인터파크투어·NOL 티켓이 NOL로 합쳐졌다 [src:21][src:22]. 앱스토어 판매자는 YANOLJA CO.,LTD, 저작권 표기는 ㈜놀유니버스로 명의가 섞여 있고 [src:13][src:14], Google Play 개발자는 ㈜놀유니버스다 [src:15]. 야놀자 그룹 보도자료는 놀유니버스를 그룹의 소비자 플랫폼 부문으로 둔다 [src:16]. 야놀자 그룹 CI(Yanolja Orange)는 ㈜야놀자가 따로 발행하는 별개 브랜드이고 NOL 웹 CSS 번들 세 종에는 그 색이 한 번도 나오지 않는다 — 이 항목은 그룹 CI를 다루지 않는다 [src:24][src:8][src:9][src:10]. 과도기 흔적도 남아 있다. 웹 제목과 og:site_name 은 'NOL(야놀자)' 병기이고 www.yanolja.com 은 nol.yanolja.com 으로 301 이동한다 [src:5][src:25].

**두 층.** 놀유니버스가 직접 발행한 디자인 값은 에셋 센터의 색 다섯과 로고 사용 규칙뿐이다 [src:1]. 타입 스케일·간격·반경·그림자·컴포넌트는 발행되지 않았고, 이 문서의 그 값들은 nol.yanolja.com 이 출하한 CSS 번들과 SSR HTML 에서 읽은 관측값(미발행)이다 [src:5][src:8][src:9][src:10]. 그래서 frontmatter 는 발행 그룹과 관측 그룹을 나누고, 관측 토큰의 줄 주석에는 모두 '관측(미발행)' 을 적었다.

**화면의 결.** 차가운 쪽의 밝은 화면이다. 파랑 `{colors.primary-main}` 은 CTA·선택 탭·포커스에만 나오고, 나머지는 거의 검정인 글자 `{colors.neutral-main}` 과 아주 연한 회색 면 `{colors.neutral-weak}`·`{colors.neutral-weak1}` 로 짠다 [src:5][src:8]. 두 번째 강조색 `{colors.accent-main}` 은 할인율·쿠폰처럼 가격의 긴박감을 말할 때만 나온다 [src:5][src:8]. 깊이는 그림자보다 1px 연한 테두리와 면 색 차이로 만들고, 그림자는 캐러셀 화살표·하단 내비 같은 떠 있는 컨트롤에만 옅게 쓴다 [src:6][src:8]. 모양은 둥글고 부드럽다 — 검색창·칩·공지·신규오픈 배지는 알약형, 카드 안 텍스트 배지는 `{rounded.6}`, 버튼·카드는 12·16 둥근 사각, PC 히어로는 28 이다 [src:5][src:8]. 유일한 장식은 파랑에서 보라로 흐르는 그라디언트이고, 넓은 면이 아니라 1px 테두리로 쓰인다 [src:7][src:8].

**CI 서술.** 놀유니버스 회사소개는 CI를 "다채로운 즐거움이 유연하게 확장되는 모습을 곡선으로 담아냈습니다. 여정 속 언제나 함께하는 하늘에서 모티프를 얻어, 두 가지 블루 계열로 고유한 컬러 팔레트를 구성했습니다." 로 서술한다 [src:2]. 법인 CI 서술이지만 두 블루와 곡선이라는 축은 서비스 화면의 파랑·알약형과 결이 같다.

**말투.** 짧고 경쾌한 해요체와 명사형 혜택 문구를 쓰고, 할인율·쿠폰·적립 같은 숫자를 앞세운다. 브랜드명 NOL을 동사처럼 굴리는 '놀' 말장난이 반복된다 [src:3][src:5]. 이 말투는 NOL의 것이므로 차용 대상이 아니다 — 아래 `## Do's and Don'ts` 를 볼 것.

## Colors

**발행 팔레트는 다섯 색이고, 두 절에 따로 실린다.** 에셋 센터는 놀유니버스 > 기업 컬러(법인 CI)에 `{colors.nol-universe-blue}`·`{colors.nol-universe-light-blue}` 두 색을, NOL > 브랜드 컬러(플랫폼 BI)에 `{colors.nol-blue}`·`{colors.nol-black}`·`{colors.nol-white}` 세 색을 싣고, 한 표로 합치지 않는다 [src:1]. 회사소개 페이지에도 기업 컬러 두 색이 같은 값으로 있다 [src:2]. 같은 파랑 `oklch(0.526 0.264 269.0)` 이 두 절에 다른 역할로 실리므로 키를 둘로 두었다. 에셋 센터는 "놀 블루는 놀의 모든 패밀리 브랜드를 대변하는 대표 브랜드 컬러입니다." 라고 쓰고, 이 문장이 명세 대표색 별칭 `{colors.primary}` 가 `{colors.nol-blue}` 를 가리키는 근거다 [src:1]. 규칙 문구는 "브랜드 컬러는 절대 변형할 수 없습니다." 이다 [src:1]. `{colors.nol-universe-light-blue}` 는 NOL 브랜드 컬러에 속하지 않고 NOL 웹 번들에도 나오지 않는다 [src:1][src:8]. NOL BLACK 의 CMYK 'C205' 는 0–100 범위를 벗어난 값으로 원본 HTML 에 그대로 있다 — 오타로 보이지만 정본 값은 알 수 없다 [src:1].

**발행 놀 블루와 서비스 프라이머리는 다른 값이다.** `{colors.nol-blue}` `oklch(0.526 0.264 269.0)` 은 발행 대표색이고, 화면의 CTA·선택·포커스 파랑 `{colors.primary-main}` `oklch(0.548 0.250 270.3)` 은 서비스가 출하한 관측값이다 [src:1][src:8]. 명세 역할 `primary` 는 발행값 쪽을 가리킨다. 서비스 UI를 재현할 때는 `{colors.primary-main}` 을, 브랜드 자산·대표색 표현에는 `{colors.nol-blue}` 를 쓴다. 발행값은 서비스 화면에서 멤버십 다이아 글자 `{colors.membership-dia-main}` 과 장식 그라디언트 `brand-border` 의 한 스톱으로만 나온다 [src:8].

**서비스 UI에는 디자인 토큰 변수가 없다.** 번들의 커스텀 프로퍼티는 swiper·safe-area·Tailwind 내부값 같은 것뿐이고, 색은 `.text-text-primary-main` 같은 Tailwind 유틸리티 규칙 안에 값으로 박혀 있다 [src:8][src:9][src:10]. 한 값에 `fill-`·`text-`·`line-` 별칭이 여러 개 붙으므로, 관측 키는 대부분 유틸리티 이름에서 그 앞말을 뗀 이름 하나로 두고 다른 별칭은 그 토큰 줄 주석에 적었다. 예외는 둘이다 — `{colors.neutral-strong1}` 은 유틸리티가 `text-neutral-sub` 이고, `{colors.neutral-weak4}` 는 기록된 유틸리티가 없다. 두 키 이름은 뉴트럴 사다리에 맞춰 디자인 보드가 붙였다. accent 와 danger 는 같은 값을 공유해 `{colors.accent-main}` 하나로 묶었다 [src:8][src:9][src:10].

| 역할 | 토큰 | 근거 |
| --- | --- | --- |
| CTA 채움·선택·포커스 | `{colors.primary-main}` → 호버·눌림 `{colors.primary-presshover-strong3}` | [src:8][src:10] |
| 프라이머리 약면(검색 칩·신규오픈 배지) | `{colors.primary-weak}` 면 + `{colors.primary-weak2}` 테두리 | [src:5][src:8] |
| 가격 긴박(할인율·쿠폰) | `{colors.accent-main}` 글자 · `{colors.accent-weak}` 칩 바탕 | [src:5][src:8] |
| 본문 글자 | `{colors.neutral-main}` | [src:8] |
| 보조·메타 글자 | `{colors.neutral-strong1}` · `{colors.neutral-medium}` | [src:8] |
| 선·구분 | `{colors.neutral-weak3}` · `{colors.neutral-weak2}` · `{colors.neutral-weak1}` | [src:8] |
| 연한 면 | `{colors.neutral-weak}` · `{colors.neutral-veryweak}` | [src:5][src:10] |
| 별점 | `{colors.star}` | [src:6][src:8] |

**페이지 바탕은 흰색이다.** 번들에서 `body` 배경을 흰색으로 고정하는 `!important` 규칙이 같은 번들의 회색 `bg-background` 규칙을 이긴다 [src:8]. 경고 `{colors.warning-main}`·`{colors.warning-weak}` 와 위험 호버 `{colors.danger-presshover-strong3}` 는 번들 선언으로만 확인했다 [src:8].

**멤버십 색은 등급 표시용이다.** 다이아 `{colors.membership-dia-main}` 은 발행 놀 블루와 같은 값이고, 골드 `{colors.membership-gold-main}`·플래티넘 `{colors.membership-platinum-main}` 은 정확한 유틸리티 이름을 확인하지 못했다 [src:8]. 상세 화면의 '무료취소' 글자도 플래티넘과 같은 값이다 [src:10]. 번들에는 gold-weak2·platinum-weak3·dia-weak2·silver-main 같은 멤버십 보조값도 있지만 화면 역할을 확인하지 못해 토큰으로 싣지 않았다 [src:8].

**투명도는 검정 하나에 알파를 건다.** 바텀시트 백드롭 `{colors.scrim}`, 이미지 위 카운터 알약 `{colors.opacity-black-60}`, 캐러셀 화살표 외곽선 `{colors.opacity-black-10}`, 하단 내비 상단선과 이미지 인셋 외곽 `{colors.opacity-black-5}` 이다 [src:8]. 이미지 위 밝은 배지에 쓰는 흰색 80% `bg-opacity-white-80` 도 홈에 있지만 한 곳의 관측이라 토큰으로 두지 않았다 [src:5]. 그 밖에 임의 클래스로만 있는 색 다섯 개는 화면 역할을 확인하지 못해 싣지 않았다 [src:8].

**그라디언트는 둘이고 `gradients:` 맵에 있다.** `brand-border` 는 하늘색→파랑→보라로 흐르는 네 스톱이고 90deg 와 258deg 변형이 번들 세 종에 모두 있다 [src:8][src:9][src:10]. 보라 끝 스톱은 그라디언트 문자열 안에서만 나오고 단색으로는 쓰이지 않는다 [src:8]. `detail-bg` 는 상세 번들의 `--bg` 에 선언된 다섯 스톱이고, 같은 규칙 묶음에 호버·눌림 `{colors.primary-presshover-strong3}` 와 비활성 `{colors.neutral-weak3}` 가 붙어 있지만 쓰는 요소는 확인하지 못했다 [src:10].

**값이 같은 토큰이 층마다 따로 있는 것은 의도다.** `{colors.nol-blue}`·`{colors.nol-universe-blue}`·`{colors.membership-dia-main}`, `{colors.nol-black}`·`{colors.static-black}`, `{colors.nol-white}`·`{colors.static-white}` 는 값이 같지만 근거(발행/관측)와 역할이 달라 한 이름으로 합치지 않았다. 푸터의 NOL 로고 SVG 채움은 `{colors.neutral-medium}` 과 같은 UI 회색이고 브랜드 색이 아니다 [src:12]. 홈 가입 배너의 연한 하늘색 바탕은 캡처 픽셀값(≈ 캡처 판독 · 공개 출처 없음)일 뿐 번들 토큰이 아니라 싣지 않았다.

## Typography

**서체는 Pretendard 하나이고 서비스가 직접 호스팅한다.** 폰트 청크 CSS 에 `@font-face` 88개가 있고 가변 굵기 45–920, `font-display: swap` 이다 [src:11]. 에셋 센터·회사소개·브랜드 스토리 어디에도 서체 명시가 없어 브랜드 전용 디스플레이 서체는 발행되지 않았다 [src:1][src:2][src:3]. 에셋 센터 페이지 자체의 Noto Sans KR 은 그 사이트의 폰트일 뿐 발행 서체가 아니다 [src:1]. 그래서 `fonts:` 맵과 `font-display-src` 를 두지 않았다 — Pretendard 는 프리뷰 런타임이 이미 싣는다.

**1rem = 10px 이다.** `html{font-size:62.5%}` 이고 유틸리티는 rem 으로 쓰인다(`1.2rem/1.4rem` = 12/14px) [src:8]. frontmatter 값은 px 로 환산해 적었다.

**스케일은 번들에서 확인한 `typography-*` 이름 41개와 보드에서만 읽은 1개(≈ `{typography.subtitle-18-bold-multiline}`)다.** 이름이 `분류-크기-굵기[-multiline]` 꼴이고 굵기는 bold·semibold·regular 세 단계, 곧 700·600·400 뿐이다 [src:8][src:9][src:10]. 단일행 스타일은 행간이 크기의 약 1.2배(`{typography.body-12-regular}` 12/14 … `{typography.headline-40-bold}` 40/48), `-multiline` 은 약 1.5배다(`{typography.body-14-regular-multiline}` 14/21) [src:8]. 줄 수를 자르는 `-line-clamp-1/-2` 변형과 같은 값을 px 로 고정해 접근성 글자 확대를 받지 않는 `-fixed` 변형은 별칭이라 키로 세지 않았다 [src:8]. 확인한 위치는 이렇다 — `{typography.subtitle-18-regular-multiline}` 은 홈 번들에 `pc:typography-` 접두로만 있고 [src:8], `{typography.subtitle-18-bold-multiline}` ≈ 은 디자인 보드의 번들 판독에서 왔으며 위치는 다시 확인하지 못했다(공개 출처 없음). `{typography.subtitle-18-semibold}` 는 홈 번들의 `ds-pc:` 접두와 목록 번들에 있다 [src:8][src:9]. `{typography.subtitle-16-semibold-multiline}`·`{typography.body-13-semibold-multiline}` 은 목록 번들 [src:9], `{typography.body-14-bold-multiline}`·`{typography.body-12-bold-multiline}` 은 상세 번들에서 확인했다 [src:10].

**자간은 ≈ `0em` 이다.** 렌더 수집에서 자간은 모든 요소가 normal 이었고, 그래서 42개 스타일의 `letterSpacing` 을 단위 붙은 0으로 적었다(리서치의 렌더 수집값 — 공개 출처로는 다시 열지 못했다).

**모바일에서 PC로 한 단계 이상 커진다.** 같은 요소가 `typography-body-14-regular ds-pc:typography-subtitle-18-regular` 처럼 짝을 이루고, 이 짝이 홈 SSR 에 58번 나온다 [src:5]. 섹션 제목은 `{typography.subtitle-18-bold}` → `{typography.headline-24-bold}`, 기획전 카드 제목은 `{typography.subtitle-20-bold}` → `{typography.headline-32-bold}` 로 커진다 [src:5].

**클래스로 확인한 쓰임.** 공지 배지는 모바일 `{typography.label-10-bold}` → PC `{typography.body-12-bold}`, 신규오픈 배지는 `{typography.body-12-bold}` 다 [src:5]. 홈 카드 할인율은 `text-text-accent-medium` 클래스로 빨강을 입는다 [src:5].

**값으로 대응한 쓰임(클래스 미확인).** 아래는 크기·굵기 값이 맞는 스타일에 대응시킨 것이고, 요소에 붙은 `typography-*` 클래스는 확인하지 못했다. PC 검색 입력은 `{typography.subtitle-16-bold}`, 헤더 액션 라벨은 `{typography.body-12-semibold}` 값이다 [src:5][src:8]. 하단 내비 라벨은 활성 `{typography.label-10-bold}`·비활성 `{typography.label-10-regular}` 값이다 [src:8].

## Spacing

**닫힌 간격 스케일이 없다.** 홈 번들의 gap 유틸리티 값만 0부터 140까지 19종이고 높이 유틸리티는 50여 값이다 [src:8]. 그래서 frontmatter `spacing:` 은 스케일이 아니라 여러 화면에서 반복 확인된 값만 담는다. 스케일을 지어내 4px 격자로 정규화하지 말 것.

- **프레임.** PC 는 `max-w-ds-pc`(1320) 안에 좌우 `{spacing.pc-gutter}` 를 두어 콘텐츠 폭이 1240 이다. 목록 PC 도 같은 1320 + 40 이다 [src:5][src:6][src:8].
- **모바일 거터.** 홈 `{spacing.mobile-gutter-home}`, 목록·상세 `{spacing.mobile-gutter}` [src:5][src:6].
- **섹션.** 섹션 사이 모바일 `{spacing.section-gap}` / PC `{spacing.section-gap-pc}`, 섹션 하단 16, 제목–탭 `{spacing.section-title-gap}` [src:5].
- **카드 그리드.** 호텔 카드 가로 `{spacing.card-gap-x}`·세로 `{spacing.card-gap-y}`, PC 가로 `{spacing.card-gap-x-pc}`. 레저 카드는 `gap-20`, 기획전은 모바일 1px / PC 8px, 푸터 링크는 가로 24·세로 12 다 [src:5].
- **카드 안.** 목록 카드 `{spacing.card-padding}`(PC 는 좌우 0·상하 20), 티켓 카드 텍스트는 좌우 2·위 12(PC 16) [src:5][src:6].
- **컨트롤 높이.** 40·44·48·52 가 사다리처럼 반복되고 `h-50`·`h-56` 도 있다. 헤더 상단행은 72px + safe-area, 섹션 헤더는 모바일 최소 50 / PC 최소 80 이다 [src:5][src:8].
- **목록 PC.** 왼쪽 필터 `aside` 320 + 본문 `flex-1` [src:6].

## Rounded

**키는 유틸리티 이름 그대로다.** `rounded-12` 는 `{rounded.12}`, `rounded-capsule`·`rounded-full` 은 `{rounded.capsule}` 이다 [src:8]. 1rem = 10px 설정 때문에 Tailwind 기본 `rounded-lg`·`rounded-xl`·`rounded-2xl` 은 5·7.5·10px 이 된다 — 16px 이 아니다 [src:8].

- `{rounded.4}` '인증' 배지, `{rounded.6}` 텍스트 배지(좌석우위·선착순쿠폰·MD추천) [src:5][src:8].
- `{rounded.8}` ≈ 가입 배너 CTA — 캡처 판독값이다 [src:5].
- `{rounded.10}` 은 번들에 있으나 화면 쓰임을 확인하지 못했다 [src:8].
- `{rounded.12}` 작은 버튼·모바일 공지 줄·목록 카드 이미지·모바일 캐러셀 화살표, `{rounded.16}` 큰 버튼·헤더 액션·카드·필터 패널·PC 캐러셀 화살표 [src:5][src:6][src:8].
- `{rounded.20}` 모바일 히어로·상세 모바일 갤러리, `{rounded.24}` 카테고리 타일, `{rounded.28}` PC 히어로·배너 이미지·바텀시트 상단(`!rounded-t-28`) [src:5][src:7][src:8].
- `{rounded.capsule}` 검색창·칩·공지·신규오픈 배지 [src:5][src:8].

**높이와 반경이 짝을 이룬다(관측).** 높이 40·44 컨트롤은 `{rounded.12}`, 48·52 컨트롤은 `{rounded.16}` 이다 [src:8]. `%` 반경은 쓰지 않는다.

## Elevation & Depth

**깊이는 테두리와 면이 먼저다.** 카드와 패널은 그림자 대신 `{colors.neutral-weak3}`·`{colors.neutral-weak2}` 1px 테두리나 `{colors.neutral-weak1}` 구분선, `{colors.neutral-weak}` 면 차이로 층을 나눈다 [src:6][src:8]. 사진 위에는 `{colors.opacity-black-5}` 1px 인셋 외곽을 둘러 흰 배경과의 경계를 잡는다 [src:8].

**그림자는 떠 있는 컨트롤 전용이다.** 다섯 단계 모두 오프셋 없는 사방 번짐이다 [src:8][src:10].

- `{elevation.shadow-1}` 상세 섹션 상단 구분.
- `{elevation.shadow-2}` 캐러셀 화살표·하단 내비·모바일 하단 고정바·지도 버튼, 네 곳에 쓰인다.
- `{elevation.shadow-3}` '전체 사진' 버튼·모바일 '지도' 필 버튼.
- `{elevation.shadow-4}` 상세 번들 선언, 쓰는 요소 미확인.
- `{elevation.shadow-5}` 번들 선언만 있고 렌더에서 관측하지 못했다.

번들에는 `drop-shadow-2`(shadow-2 와 같은 번짐의 drop-shadow 필터), 아래로 2px 내린 6px 4% 그림자, 흰 1px 링에 8px 10% 그림자를 겹친 값도 있다 [src:8]. 바텀시트 그림자는 어느 번들에서도 찾지 못했다 [src:8][src:9][src:10]. 백드롭은 `{colors.scrim}` 이다 [src:8].

**포커스는 링으로 보인다.** focus-visible 은 `outline: 2px solid` `{colors.primary-main}` 이고, 컴포넌트에 따라 offset 이 2px(바깥) 또는 -2px(안쪽)이다 [src:8][src:9][src:10]. 호버는 `hover-never:` 접두, 곧 `(hover:hover) and (pointer:fine)` 미디어 안에서만 걸린다 — 터치 기기에서는 호버 상태가 남지 않는다 [src:8].

**모션.** 커스텀 이징 하나와 Tailwind 기본 이징이 주력이고, 전환은 짧다 [src:8][src:9].

```text
easing
  ease-nol        cubic-bezier(.33, 1, .68, 1)   홈 번들 15회 · 헤더 하단행 접힘
  ease-tailwind   cubic-bezier(.4, 0, .2, 1)     홈 번들 11회 · transition* 기본
  기타            (.25,1,.5,1) · (0,0,.2,1) · (.4,0,1,1) · (1,0,1,.7)
duration
  utilities       100 / 150 / 200 / 300 / 500ms · transition* 기본 150ms
transitions
  header-collapse   grid-template-rows .25s ease-nol
  header-action     background-color .15s ease
  bottom-nav-icon   래퍼 .16s · 눌림 .08s · 뗌 .1s
keyframes
  fadeIn/Out · slideUp/Down · dialogScaleUp/Down · dimFadeIn/Out
  modalSlideUpFromBottom/DownToBottom/InLeft/OutLeft · toastFadeIn/Out
  floatingBannerFadeInUp/OutScale · membershipNoticeFadeInUp/Down
  skeletonPulse · delayedReveal · rolling-chips · spin · core-ui-loop-spinner-spin
reduced-motion (번들에서 두 규칙 확인)
  motion-reduce:animate-none
  motion-reduce:text-text-neutral-medium
```

이징 이름(`ease-nol`·`ease-tailwind`)은 이 항목이 붙인 설명용 라벨이고 번들의 이름이 아니다.

## Shapes

**둥근 쪽이다.** 알약형(`{rounded.capsule}`)이 검색창·칩·공지·신규오픈 배지를 맡고(카드 안 텍스트 배지는 `{rounded.6}`), 버튼·카드는 `{rounded.12}`·`{rounded.16}` 둥근 사각, 히어로는 PC `{rounded.28}` / 모바일 `{rounded.20}` 의 큰 곡률이다 [src:5][src:8]. 캐러셀 화살표는 원이 아니라 정사각 둥근 사각이고, 맨 위로 버튼만 원형이다 [src:5].

**사진 비율이 레이아웃을 정한다.** 호텔·티켓 카드는 3:4 세로, 라이브 카드는 240:360, 목록 카드 이미지는 3:2, PC 히어로는 1240:403, 모바일 히어로는 3:2 다 [src:5][src:6]. 텍스트 블록은 이미지 아래에 짧게 붙는다.

**말풍선 배지.** 카테고리 타일 위의 신규오픈·지금예매 배지는 아래로 꼬리가 달린 말풍선 모양으로 얹힌다 [src:5].

**곡선은 CI 의 언어이기도 하다.** 법인 CI 는 즐거움의 확장을 곡선으로 담았다고 서술한다 [src:2]. 로고는 워드마크이고, 에셋 센터의 로고 다운로드 일곱 종은 모두 PNG 이며 SVG 배포는 확인되지 않았다 [src:1]. 금지 항목은 시인성 저해·지정 색 외 사용·요소 간격 조정·아웃라인·그림자·복잡한 도형과 결합·회전/반전·비율/기울기 왜곡·복잡한 배경 위 배치 아홉 가지다 [src:1]. 이 카탈로그의 로고 이미지는 에셋 센터의 앱 아이콘 PNG 다 [src:23].

## Components

아래는 전부 관측(미발행)이고 이름은 이 항목이 붙였다. 클래스·색·호버는 번들과 SSR 로 확인했고, 상세 페이지 치수는 다시 열어 확인하지 못해 싣지 않거나 '미확인' 을 붙였다 [src:7][src:8][src:10]. 단위는 px 다.

### search-bar-pc

PC 헤더 상단행의 알약 검색창 `._form_bfadc_1` 이다 [src:5][src:8].

```text
search-bar-pc                                               [src:5][src:8]
  size       height 48 · max-width 400
  radius     {rounded.capsule}
  padding    left 20 · right 8
  outline    1px {colors.neutral-weak2} → :focus-within {colors.primary-main}
  input      {typography.subtitle-16-bold} · {colors.neutral-main}
  placeholder {colors.neutral-medium}
```

### search-bar-chip

목록·상세의 PC 검색창은 안에 검색 조건 칩(`._chip_bfadc_9`)을 단다. 칩은 `{colors.primary-weak}` 면에 1px `{colors.primary-main}` 테두리, `{colors.primary-main}` 글자 `{typography.body-12-bold}` 와 닫기 × 다 [src:7][src:8].

### search-bar-mobile

모바일 검색창 `._root_1prb5_1` 은 번들 세 종에서 같다 [src:8][src:9][src:10]. 상세 모바일 헤더는 테두리 없는 회색 채움 변형으로 보인다 [src:7].

```text
search-bar-mobile                                           [src:8][src:9][src:10]
  size       min-height 44 · gap 8
  radius     {rounded.capsule}
  border     1.5px {colors.primary-main} · surface {colors.static-white}
  padding    4 12 4 16
  placeholder {colors.neutral-strong1} · {typography.body-14-regular}
```

```tsx
// 모바일 검색창 — border 1.5px {colors.primary-main}, radius {rounded.capsule}
<SearchBar variant="mobile" placeholder="검색어를 입력하세요" />
```

### header-action

PC 헤더 오른쪽의 아이콘+라벨 버튼 넷(마이·찜·장바구니·최근 본 상품)이다. 호버는 배경만 `{colors.neutral-weak1}` 로 바뀐다 [src:5][src:8].

```text
header-action                                               [src:5][src:8]
  size       min 64×52 · padding 4 10 · gap 4
  radius     {rounded.16}
  label      {typography.body-12-semibold} · {colors.neutral-main}
  hover      background {colors.neutral-weak1} · background-color .15s ease
```

### service-tab-pc

PC 헤더 하단행(높이 64)의 텍스트 탭이다. 선택 탭 '홈' 은 파란 글자에 밑줄, 비선택은 회색 400 이다 — 선택 글자색·밑줄 값은 렌더 판독이라 미확인이다 [src:5]. 일부 탭은 굵은 검정 글자에 파란 점을 단다 [src:5]. 비선택의 호버 배경은 PC 에서 `ds-pc:hover:bg-transparent` 에 덮인다 [src:5][src:8]. 탭 목록은 클라이언트에서 렌더되므로 라벨 집합을 서버 HTML 로는 고정할 수 없다.

### service-tab-mobile

같은 탭이 모바일에서는 알약 필이 되어, 선택이 `{colors.neutral-main}` 필 + `{colors.static-white}` 글자다(`bg-fill-neutral-main text-static-white`) [src:5]. 컨테이너는 `min-h-32 min-w-44 rounded-full px-12 py-2` 다 [src:5]. 선택 탭이 파랑이 아니라 검정이라는 점이 핵심이다.

### section-chip-selected

장르·지역 필터 칩의 선택 상태다. `{rounded.capsule}`, 높이 36(PC 42), 좌우 16(PC 20), 굵은 `{colors.static-white}` 글자, 바탕은 순수 검정 `{colors.static-black}` 이다 [src:5]. 모바일 탭 필의 `{colors.neutral-main}` 과 다른 값이다.

### section-chip

같은 칩의 비선택 상태는 `{colors.neutral-weak}` 면이다 [src:5].

### filter-chip

목록 필터 칩은 높이 36, 좌우 12 다. PC 는 `{colors.static-white}` 면 + 1px `{colors.neutral-weak3}`, 모바일은 `{colors.neutral-weak}` 면이다 [src:6].

### badge-notice

공지 줄 앞의 배지다. `{colors.primary-main}` 면 + `{colors.static-white}` 글자, `{rounded.capsule}`, 최소 높이 20(PC 26), 좌우 6(PC 8), 글자 `{typography.label-10-bold}` → PC `{typography.body-12-bold}` 다 [src:5].

### badge-new

신규오픈·지금예매 배지다. `{colors.primary-weak}` 면, 1px `{colors.primary-weak2}` 테두리, `{colors.primary-main}` 글자 `{typography.body-12-bold}`, 최소 높이 22, 좌우 8, `{rounded.capsule}` 이다 [src:5]. 카테고리 타일 위에 말풍선으로 얹힌다.

### badge-label

카드 안의 작은 텍스트 배지다. 반경 `{rounded.6}`(인증만 `{rounded.4}`), 글자 `{typography.caption-11-bold}` 로 판독됐다 — 치수와 글자 크기는 렌더 판독이라 미확인이다 [src:5][src:6].

- 좌석우위: `{colors.neutral-weak1}` 면 · `{colors.neutral-strong1}` 글자
- 선착순쿠폰: `{colors.accent-weak}` 면 · `{colors.accent-main}` 글자
- 1박: `{colors.primary-weak}` 면 · `{colors.primary-main}` 글자
- 인증: `{colors.neutral-weak}` 면
- 방송예정·MD추천: 이미지 위 흰 면 · 흰색 80% 면

### button-primary

상세의 '예약하기'·'객실 전체보기' 같은 1차 행동 버튼이다. `{colors.primary-main}` 면에 `{colors.static-white}` 글자다 [src:7][src:10]. 치수는 다시 확인하지 못했다. 반경은 위 높이–반경 짝 규칙(40·44 → `{rounded.12}`, 48·52 → `{rounded.16}`)을 따른다고 보는 것이 관측과 맞는다 [src:8].

```tsx
// 1차 버튼 — fill {colors.primary-main}, label {colors.static-white}
// hover·active → {colors.primary-presshover-strong3}
<Button variant="primary" size="lg">다음</Button>
```

### button-primary-pressed

호버·눌림은 면만 `{colors.primary-presshover-strong3}` 로 짙어진다. 규칙은 `._buttonPrimary_1oeld_85:hover/:active`, `active:bg-interaction-primary-presshover-strong3`, PC 의 `pc:hover:[--bg:…]` 세 갈래로 선언된다 [src:10]. 호버는 `hover-never:` 미디어 안에서만 걸린다 [src:8].

### button-secondary

보조 버튼은 두 모양이 보인다 — '알림받기' 는 `{colors.static-white}` 면 + 1px `{colors.primary-main}` + 파란 굵은 글자의 알약, 작은 '로그인' 은 `{colors.primary-weak}` 면 + `{colors.primary-main}` 글자다. 둘 다 상세 화면 렌더 판독이라 미확인이다 [src:7].

### button-banner-cta

홈 가입 배너의 작은 파란 CTA 는 높이 ≈ 28, 반경 ≈ `{rounded.8}` 이다 — 캡처 판독값이다 [src:5].

### carousel-arrow

홈 캐러셀의 좌우 화살표(홈에 11개)다. 원형이 아니라 둥근 정사각이다 [src:5].

```text
carousel-arrow                                              [src:5]
  shape      aspect-square · {rounded.12} → PC {rounded.16}
  size       min-height 44 → PC 48
  surface    {colors.static-white} · {elevation.shadow-2}
  outline    1px {colors.opacity-black-10}
```

### notice-bar

공지 줄은 1240 폭의 `{colors.neutral-weak}` 면에 `{component.badge-notice}` 와 한 줄 텍스트를 놓는다. 반경은 PC `{rounded.16}` / 모바일 `{rounded.12}` 로 판독됐다 [src:5].

### card-hotel-pick

홈 호텔 카드는 3:4 이미지 아래 숙소명 1줄, `{colors.accent-main}` 할인율, 굵은 가격과 '원~' 이 붙는다. 날짜가 정해지지 않으면 회색 굵은 '다른 날짜 확인' 이 가격 자리를 대신한다 [src:5].

### card-ticket-rank

티켓 랭킹 카드는 3:4 포스터 좌하단에 큰 흰 순위 숫자를 얹고, 아래에 제목 2줄·장소·일정과 `{component.badge-label}` 을 둔다 [src:5].

### card-live

라이브 카드는 `aspect-[240/360]` `{rounded.16}` 이미지에 좌상단 방송예정 배지를 단다 [src:5].

### card-listing

목록 PC 카드는 가로형이다. 왼쪽 3:2 `{rounded.12}` 이미지, 오른쪽에 카테고리 → 숙소명 → 위치 → 별점(`{colors.star}`)과 리뷰 수 → 쿠폰 배지 순으로 쌓고, 오른쪽 아래에 가격 블록(시간·할인율·취소선 원가·회원가)을 둔다. 회원가 글자는 `{colors.primary-main}` 이다. 카드 사이는 `{colors.neutral-weak1}` 구분선이고, 마감 카드는 회색 '예약마감' 이 된다 [src:6].

### filter-panel

목록 PC 왼쪽의 필터 패널은 `w-[320px]` `{rounded.16}`, 1px `{colors.neutral-weak3}` 테두리, 안쪽 좌우 20·아래 20·위 24 다. 토글, 파란 트랙의 가격 이중 슬라이더, 칩 그룹이 들어간다 [src:6].

### filter-bottom-sheet

모바일 필터는 `react-modal-sheet` 바텀시트로 연다. 상단 반경 `{rounded.28}`, 백드롭 `{colors.scrim}`, 등장 키프레임 `modalSlideUpFromBottom` 이다. 시트 그림자와 치수는 확인하지 못했다 [src:8][src:9].

### bottom-nav

모바일 하단 내비 `nav.core-ui__BottomNavigation__root` 다. PC 에서는 숨는다(`ds-pc:!hidden`) [src:5][src:8].

```text
bottom-nav                                                  [src:5][src:8]
  position   fixed · surface {colors.static-white}
  divider    top 1px {colors.opacity-black-5} · {elevation.shadow-2}
  items      5개 · 내부 40×40 {rounded.12} · 아이콘 22×22
  active     {typography.label-10-bold} · {colors.neutral-main}   (파랑이 아니다)
  inactive   {typography.label-10-regular} · {colors.neutral-strong1}
  height     약 57 · 푸터에 calc(56px + safe-area-bottom) 여백
```

```tsx
// 활성 탭은 굵기와 {colors.neutral-main} 으로만 구분한다 — {colors.primary-main} 금지
<BottomNav items={items} activeKey="home" />
```

### login-gradient-banner

상세 PC 오른쪽 사이드의 로그인 유도 배너는 그라디언트 1px 테두리에 반경 `{rounded.16}` 이고, 안내 문구와 작은 로그인 버튼(`{component.button-secondary}`)을 담는다 [src:7]. 번들 세 종에 있는 `brand-border` 그라디언트가 이 모양의 재료로 보이지만, 화면의 계산 그라디언트는 확인하지 못했다 [src:7][src:8].

### coupon-closed-row

상세의 '쿠폰 마감' 행은 `{colors.neutral-veryweak}` 면 + 1px `{colors.neutral-weak2}` 이다. 면 색은 상세 번들에서 확인했고, 반경 `{rounded.16}` 은 렌더 판독이라 미확인이다 [src:7][src:10].

### footer

푸터는 `{colors.neutral-weak}` 면에 좌우 20(PC 40)·상하 16 이고, 링크는 12px 400 `{colors.neutral-strong1}` 밑줄 글자다. 호버하면 굵어지되 `hover-never:` 안에서만이다 [src:5].

### scroll-top-button

오른쪽 아래의 맨 위로 버튼은 흰 원형에 1px 외곽선과 위 화살표다. 크기는 재지 않았다 [src:5].

### focus-ring

모든 상호작용 요소의 키보드 포커스 상태다. `outline: 2px solid` `{colors.primary-main}`, offset 2px 또는 -2px(컴포넌트별) [src:8][src:9][src:10].

## Do's and Don'ts

**Do**

- CTA·선택·포커스는 `{colors.primary-main}` 하나로 칠하고, 호버·눌림만 `{colors.primary-presshover-strong3}` 로 짙게 한다 [src:8][src:10].
- 브랜드 대표색이 필요한 자리(로고 주변·브랜드 자산)에는 발행값 `{colors.nol-blue}` 를 변형 없이 쓴다 — 에셋 센터가 변형을 금지한다 [src:1].
- 빨강 `{colors.accent-main}` 은 할인율·쿠폰처럼 가격 긴박감에만 쓴다 [src:5][src:8].
- 층은 1px 테두리(`{colors.neutral-weak3}`·`{colors.neutral-weak2}`)와 면 차이로 나누고, 그림자 `{elevation.shadow-2}` 는 떠 있는 컨트롤에만 준다 [src:8].
- 높이 40·44 컨트롤에는 `{rounded.12}`, 48·52 에는 `{rounded.16}` 을 짝짓는다 [src:8].
- 호버는 `(hover:hover) and (pointer:fine)` 안에서만 걸고, 키보드 포커스는 `{component.focus-ring}` 으로 보인다 [src:8].
- 모바일→PC 에서 같은 요소의 타입을 한 단계 이상 올린다(`{typography.subtitle-18-bold}` → `{typography.headline-24-bold}`) [src:5].

**Don't**

- `{colors.nol-blue}` 와 `{colors.primary-main}` 을 같은 색으로 취급하지 말 것 — 발행 대표색과 서비스 CTA 파랑은 다른 값이다 [src:1][src:8].
- 야놀자 그룹 CI 의 오렌지를 NOL 화면에 쓰지 말 것 — 별개 브랜드이고 NOL 번들에 없다 [src:24][src:8].
- 법인 CI 색 `{colors.nol-universe-light-blue}` 를 서비스 UI 강조색으로 쓰지 말 것 — NOL 브랜드 컬러가 아니고 화면에도 없다 [src:1][src:8].
- 하단 내비·모바일 탭의 선택 상태를 파랑으로 칠하지 말 것 — 선택은 `{colors.neutral-main}`(탭 필) 또는 굵기(내비)로 표시한다 [src:5][src:8].
- `brand-border` 그라디언트를 넓은 면 채움이나 단색 강조로 쓰지 말 것 — 관측된 쓰임은 1px 테두리다 [src:7][src:8].
- 1rem = 10px 를 잊고 Tailwind 기본 `rounded-xl` 등을 16px 로 읽지 말 것 [src:8].
- 다크 테마 값을 지어내지 말 것 — 발행도 지원도 없다 [src:1][src:8].
- 로고에 아웃라인·그림자·회전·비율 왜곡을 주거나 복잡한 배경 위에 두지 말 것 [src:1].
- NOL의 여행·숙박 도메인 어휘와 흐름을 그대로 가져오지 말 것 — '대실/DayUse' 와 '숙박' 이분, '회원가', 'N성급' 등급, 지하철역 출구 기준 도보 표기, 다이아·골드·플래티넘 멤버십 등급, '놀' 말장난 카피는 NOL의 제품 개념이다. 차용할 것은 흰 바탕·절제된 파랑·둥근 사진 카드라는 시각 처리뿐이다.

## Responsive Behavior

**같은 접두 `pc:` 가 앱마다 다른 값이다.** 홈(display-site)은 1024 에서, 목록(discovery-site)·상세(stay-site)는 801 에서 `pc:` 가 켜진다 [src:8][src:9][src:10].

| 접두 | 조건 | 앱 | Key Changes |
| --- | --- | --- | --- |
| (기본) | < 600 | 홈 | 2열 카드, 2행 가로 스크롤 카테고리, 하단 내비, 거터 `{spacing.mobile-gutter-home}` |
| `ds-tablet:` | ≥ 600 | 홈 | 호텔 카드 2열 → 4열 [src:5] |
| `legacy-pc:` | ≥ 768 | 홈 | 레거시 접두 — 쓰임 미확인 [src:8] |
| `ds-pc:` · `pc:` | ≥ 1024 | 홈 | 헤더 2행 + 헤더 액션 등장, 하단 내비 숨김, 타입 한 단계 상향, 거터 `{spacing.pc-gutter}`, 섹션 사이 `{spacing.section-gap-pc}` [src:5][src:8] |
| `ds-pc-wide:` | ≥ 1320 | 홈 | 프레임 상한 1320 도달 [src:8] |
| `pc:` | ≥ 801 | 목록·상세 | 목록 PC 레이아웃·상세 PC 레이아웃 [src:9][src:10] |
| `new-pc:` | ≥ 1024 | 목록 | 1320 프레임·좌우 40, 카드 안쪽 여백 전환 [src:6][src:9] |
| `hover-never:` | `(hover:hover) and (pointer:fine)` | 홈 | 호버 스타일 적용 [src:8] |

`max-w-ds-tablet`(1023)와 `@media (max-width:1023px)` 블록도 있고, 상세 모바일 프레임은 최대 500 이다 [src:8][src:10]. 600–1023 태블릿 구간은 관측하지 않았다.

**컴포넌트별 접힘.**

- **헤더.** PC 는 상단행 72(로고·`{component.search-bar-pc}`·`{component.header-action}` 넷) + 하단행 64(전체 카테고리·서비스 탭) = 136 이고, 스크롤하면 하단행이 접힌다. 모바일은 로고 + `{component.search-bar-mobile}` 한 줄이고 헤더 액션의 역할은 `{component.bottom-nav}` 로 옮긴다 [src:5][src:8].
- **서비스 탭.** PC 텍스트 탭(`{component.service-tab-pc}`) → 모바일 알약 필(`{component.service-tab-mobile}`) [src:5].
- **히어로.** PC `aspect-[1240/403]` `{rounded.28}` + 좌우 화살표 + 장수 카운터 → 모바일 `aspect-[3/2] w-[calc(100vw-48px)] max-w-[551px]` 슬라이드, 양옆 카드가 엿보이고 `{rounded.20}` [src:5].
- **카테고리 타일.** PC 한 줄 + 좌우 화살표 → 모바일 2행 가로 스크롤 그리드(`w-[18vw] min-w-68 max-w-108`) [src:5].
- **카드 그리드.** 호텔 카드 모바일 2열 / ≥600 4열, 티켓 랭킹은 PC 에서 5장 노출 [src:5].
- **목록.** PC 는 왼쪽 320 `{component.filter-panel}` + 오른쪽 가로형 `{component.card-listing}`. 모바일은 패널이 사라지고 상단 앱바 + 날짜·필터·정렬 필 버튼 + 칩 줄 + 우하단 부유 '지도' 버튼(`{elevation.shadow-3}`)이 되며, 필터는 `{component.filter-bottom-sheet}` 로 연다 [src:6][src:8]. 모바일 카드는 왼쪽 썸네일·오른쪽 텍스트의 가로형이 관측됐고, 번들에는 풀폭 `aspect-[2/1]` 이미지 변형도 있다 [src:6].
- **상세.** PC 는 날짜·인원 바 + 대형 1 · 소형 4 갤러리 + 오른쪽 360 사이드(`{component.login-gradient-banner}`·`{component.coupon-closed-row}`·혜택). 모바일은 검색 칩 헤더 + 단일 4:3 갤러리 `{rounded.20}` + 하단 고정바(가격 + 파란 1차 버튼, `{elevation.shadow-2}`)다. 고정바 버튼 치수는 미확인이다 [src:7].
- **하단 내비.** 모바일 전용 5항목이고 푸터가 그 높이만큼 여백을 비운다 [src:5][src:8].

**터치 타깃.** 모바일 검색창 최소 높이 44, 캐러셀 화살표 44(PC 48)는 44 기준을 채운다. 하단 내비 항목 내부는 40×40, 모바일 탭은 최소 높이 32·최소 폭 44 로 44 기준보다 작다 — 재현할 때는 탭 영역을 44 이상으로 넓히는 편이 안전하다 [src:5][src:8].

## Known Gaps

- **다크 테마가 없다.** 발행 팔레트에 다크 색이 없고, 서비스 번들 세 종에도 `prefers-color-scheme`·`[data-theme`·`.dark`·`color-scheme` 이 0건이다 [src:1][src:5][src:8][src:9][src:10]. 그래서 `dark-` 토큰을 두지 않았다 — 다크가 필요하면 소비자가 직접 설계해야 한다.
- **상세 페이지 치수가 비어 있다.** 상세 페이지는 일반 HTTP 요청에 403 을 돌려줘 다시 열지 못했고, 1차 버튼·고정바·보조 버튼의 치수와 반경, 로그인 배너의 계산 그라디언트는 미확인이다 [src:7].
- **상태와 피드백 컴포넌트를 보지 못했다.** 입력 오류·성공 상태, 토스트·다이얼로그의 시각 값, 위험 호버 `{colors.danger-presshover-strong3}` 의 쓰임은 번들 선언(키프레임 이름 포함)으로만 있다 [src:8]. 600–1023 태블릿 구간도 캡처하지 않았다.
- **발행된 디자인 시스템이 아니다.** 타입·간격·반경·그림자는 해시 경로 CSS 번들의 관측값이라 배포마다 바뀔 수 있다 [src:8][src:9][src:10]. NOL 티켓 판매 파트너용 별도 디자인 가이드(`guide.interpark.com`)가 있다고 에셋 센터가 안내하지만, 이 항목에서는 열어 보지 않았다 [src:1].

## References

1. https://nol-universe.com/ko/brand/assets — ㈜놀유니버스 브랜드 에셋 센터. 기업 컬러 2색·NOL 브랜드 컬러 3색·대표색 문장·로고 사용 금지 항목·다운로드 목록
2. https://nol-universe.com/ko/about — 놀유니버스 회사소개. CI 서술·기업 컬러·연혁
3. https://nol-universe.com/ko/brand — 놀유니버스 브랜드 스토리. 슬로건·메시지 축. 색·서체 서술은 없다
4. https://nol-universe.com/ko — 놀유니버스 홈. 푸터의 법인 정보
5. https://nol.yanolja.com/ — NOL 소비자 웹 홈. SSR HTML·메타·푸터·유틸리티 클래스
6. https://nol.yanolja.com/discovery/list/around/PRODUCT_CATEGORY_KOREA_ACCOMMODATION/hotel — NOL 숙소 목록. SSR 카드·필터
7. https://nol.yanolja.com/stay/domestic/3001564?checkInDate=2026-10-14&checkOutDate=2026-10-15&adultPax=2 — NOL 숙소 상세. 날짜 쿼리는 수집 시점의 값이다. 일반 HTTP 클라이언트에는 403 을 돌려주고 브라우저로 열어야 보인다
8. https://assets.yanolja.com/display-site/c4fbddbfa06e15eb9a7f53bf1dbea28028b11637/_next/static/css/cd6f429d789b43ea.css — NOL 홈 CSS 번들(같은 디렉터리의 CSS 파일들 포함). 해시 경로라 배포마다 바뀔 수 있다
9. https://assets.yanolja.com/discovery-site/8192eff4dca5b49a3fc27b92810f122a93f652ca/prod/20261007/_next/static/css/4f5d2bf758340f9e.css — NOL 목록 CSS 번들(같은 디렉터리의 CSS 파일들 포함). 해시 경로
10. https://assets.yanolja.com/stay-site/prod/_next/static/css/fdd4d1a3cbb88275.css — NOL 상세 CSS 번들(같은 디렉터리의 CSS 파일들 포함). 해시 경로
11. https://yaimg.yanolja.com/joy/sunny/static/fonts/pretendard/pretendard-font-chunks.css — NOL 이 자체 호스팅하는 Pretendard 폰트 청크 CSS
12. https://yaimg.yanolja.com/web/images/display-site/home/img_brand_logo.svg — NOL 웹 푸터 로고 SVG(회색 모노). 공식 배포 경로가 아니다
13. https://apps.apple.com/kr/app/id436731843 — App Store NOL 앱 페이지. 앱 이름·부제·판매자·저작권
14. https://itunes.apple.com/lookup?id=436731843&country=kr — App Store 메타데이터 JSON. 판매자
15. https://play.google.com/store/apps/details?id=com.cultsotry.yanolja.nativeapp&hl=ko — Google Play NOL 앱 페이지. 개발자 명의
16. https://www.yanoljagroup.com/en/press_release/view?id=1558 — 야놀자 그룹 영문 보도자료(2026-06-12). 그룹 안 놀유니버스의 위치
17. https://byline.network/2024/12/27-400/ — 바이라인(2024-12-27). 놀유니버스 출범
18. https://byline.network/2025/03/07_2918273 — 바이라인(2025-03-07). NOL 명칭 개편
19. https://news.tf.co.kr/read/economy/2185237.htm — 더팩트(2025-03-07). 브랜드 개편
20. https://www.youthdaily.co.kr/mobile/article.html?no=183486 — 청년일보(2025-04-23). 첫 캠페인과 브랜드 전반 재정립
21. https://www.hankyung.com/article/202606122103g — 한국경제(2026-06-12). 서비스 NOL 일원화
22. https://byline.network/2026/09/08_298172/ — 바이라인(2026-09-08). NOL 인터파크투어·NOL 티켓 통합
23. https://nol-universe.com/design/app/icon — 에셋 센터 다운로드 핸들러(앱 아이콘 PNG). HEAD 요청에는 404, GET 에는 200 을 돌려준다
24. https://www.yanoljagroup.com/ko/brand_center — 야놀자 그룹 브랜드센터. 이 항목이 다루지 않는 그룹 CI
25. https://www.yanolja.com — nol.yanolja.com 으로 301 리다이렉트되는 옛 도메인
