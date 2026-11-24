---
name: KB국민은행
slug: kbstar
category: finance
last_updated: "2026-11-25"
created_at: "2026-11-25"
lang: ko
logo: https://getdesign.kr/logos/kbstar.png
colors:
  ## 발행 CI 색 (그룹 CI 와 은행 CI 의 Main Color, Sub Color)
  kb-yellow-positive: oklch(0.835 0.172 83)   # 발행, KB Yellow Positive, R255 G188 B0 발행, #FFBC00 은 인쇄 RGB 255 188 0 을 옮긴 값(hex 미발행), Pantone 130 C, 은행 화면에서는 거의 관측되지 않음
  kb-yellow-negative: oklch(0.865 0.177 90)   # 발행, KB Yellow Negative, R255 G204 B0 발행, #FFCC00 은 인쇄 RGB 255 204 0 을 옮긴 값(hex 미발행), Pantone 1235 C
  kb-gray: oklch(0.464 0.021 78)   # 발행, KB Gray, R96 G88 B76 발행, #60584C 는 인쇄 RGB 96 88 76 을 옮긴 값(hex 미발행), Pantone 404 C
  kb-dark-gray: oklch(0.432 0.018 90)   # 발행, KB Dark Gray(Sub Color), R84 G80 B69 발행, #545045 는 인쇄 RGB 84 80 69 를 옮긴 값(hex 미발행), Pantone 411 C
  ## 데스크톱 웹 관측(미발행)
  web-intro-menu1: oklch(0.869 0.176 91)   # #FFCE0B, 관측(미발행), www 인트로 빠른메뉴 띠 ul.menu1 바탕
  web-wrap-menu: oklch(0.874 0.163 91)   # #FED03A, 관측(미발행), 개인뱅킹 메인과 상품의 1단 메뉴 띠 .wrap-menu 바탕(CSS 3회)
  web-wrap-menu-on: oklch(0.825 0.163 83)   # #F9BA21, 관측(미발행), .wrap-menu 현재 칸과 hover 칸(CSS 2회)
  web-headline: oklch(0.871 0.176 92)   # #FFCF10, 관측(미발행), 개인뱅킹 div.headline 헤드라인 박스와 목록 활성 칸
  web-quick-bar: oklch(0.865 0.177 90)   # #FFCC00, 관측(미발행), 빠른조회 머리 띠 바탕과 인트로 공지 링크 글자 1개, 발행 KB Yellow Negative 와 같은 값이지만 별도 관측 값
  web-btn-com-c1: oklch(0.889 0.183 96)   # #FFD800, 관측(미발행), .btn-com.c1 바탕, CSS 규칙만, 렌더 표본 없음
  web-btn-action-c1: oklch(0.871 0.176 92)   # #FFCF0F, 관측(미발행), .btn-action.c1 바탕, CSS 규칙만, 렌더 표본 없음
  web-pagination-on: oklch(0.857 0.175 91)   # #FBCA00, 관측(미발행), 페이지네이션 현재 쪽, CSS 규칙만, 렌더 표본 없음
  web-submenu-line: oklch(0.891 0.183 96)   # #FFD900, 관측(미발행), 2단 메뉴 hover 와 현재 칸 아래 선, CSS 규칙만, 렌더 표본 없음
  web-navbar-btn-hover: oklch(0.835 0.172 83)   # #FFBC00, 관측(미발행), .navbar-nav .btn hover 바탕, 데스크톱 CSS 46개 파일에서 이 한 곳, 렌더 표본 없음
  web-white: oklch(1.000 0.000 0)   # #FFFFFF, 관측(미발행), 안쪽 래퍼의 흰 면(CSS 646회), 버튼 베이스와 입력창 바탕, .btn-com.c2 와 상품 꼬리표 채움형의 흰 글자, 상품 검색 입력 테두리
  web-intro-hero: oklch(0.976 0.026 100)   # #FBF8E4, 관측(미발행), 인트로 히어로 div.wrap-visual 바탕
  web-main-product: oklch(0.961 0.000 0)   # #F2F2F2, 관측(미발행), 개인뱅킹 div.section-main.main-product 바탕
  web-area2: oklch(0.973 0.000 0)   # #F6F6F6, 관측(미발행), 옵션 영역, 읽기 전용 입력, 지점 필터 div.area2, 표 .tType01 tfoot
  web-submenu: oklch(0.985 0.000 0)   # #FAFAFA, 관측(미발행), 2단 메뉴 div.submenu 바탕
  web-area-form: oklch(0.909 0.010 94)   # #E3E1DA, 관측(미발행), 상품 검색 띠 div.area-form 바탕
  web-wrap-menu-text: oklch(0.303 0.028 55)   # #3A2B21, 관측(미발행), .wrap-menu 글자와 .nav-snb 링크
  web-btn-com-c2: oklch(0.631 0.016 51)   # #928781, 관측(미발행), .btn-com.c2 바탕과 테두리(상품 결과보기, 지점 조회)
  web-nav-aside-head: oklch(0.568 0.019 70)   # #7E756B, 관측(미발행), 오른쪽 퀵메뉴 .nav-aside 첫 칸
  web-ui-btn: oklch(0.563 0.022 65)   # #7F7368, 관측(미발행), 퀵메뉴 닫기 button.ui-btn 원형
  web-nav-aside-cell: oklch(0.948 0.008 74)   # #F1EDE8, 관측(미발행), 퀵메뉴 .nav-aside 칸
  web-nav-aside-link: oklch(0.463 0.021 81)   # #5F584C, 관측(미발행), .nav-aside 링크 글자와 .layerType 테두리, 발행 KB Gray 와 R 만 1 다름
  web-snb: oklch(0.518 0.034 67)   # #766554, 관측(미발행), 지점안내 ul.snb_2015 바탕(글자 흰색)
  web-snb-on: oklch(0.442 0.030 65)   # #5F5042, 관측(미발행), 지점안내 a.activated 바탕
  web-top-notice: oklch(0.345 0.013 67)   # #3E3832, 관측(미발행), 인트로 공지 띠 div.topNoticelayer 바탕
  web-gray-5a: oklch(0.468 0.000 0)   # #5A5A5A, 관측(미발행), 인트로, 개인뱅킹 메인, 상품, 지점의 body 글자
  web-brown-4e: oklch(0.402 0.016 71)   # #4E473F, 관측(미발행), 빠른조회 body 와 base.css body 글자(CSS 125회), .btn-com 글자
  web-gray-222: oklch(0.252 0.000 0)   # #222222, 관측(미발행), 개인뱅킹과 지점안내 큰 제목, 2단 메뉴 글자(CSS 글자 227회)
  web-gray-333: oklch(0.321 0.000 0)   # #333333, 관측(미발행), 인트로 제목과 링크(42개 요소)
  web-card-line: oklch(0.898 0.000 0)   # #DDDDDD, 관측(미발행), 카드와 목록 1px 선, 지점 필터 바깥 테두리
  web-input-line: oklch(0.867 0.000 0)   # #D3D3D3, 관측(미발행), 상품 dd 와 input.input 테두리
  web-ttype01-line: oklch(0.923 0.001 17)   # #E6E5E5, 관측(미발행), 표 .tType01 칸 테두리(CSS 131회)
  web-icon-mark-pro1: oklch(0.685 0.174 51)   # #EB7311, 관측(미발행), 상품 꼬리표 .pro1 .icon-mark1 채움
  web-icon-mark-pro3: oklch(0.638 0.152 259)   # #508AE6, 관측(미발행), 상품 꼬리표 .pro3 .icon-mark1 채움과 윤곽형 c1
  web-icon-mark-c2: oklch(0.682 0.159 57)   # #E07B16, 관측(미발행), 윤곽형 .icon-mark1.c2 글자와 테두리
  web-branch-hours: oklch(0.679 0.194 45)   # #F46600, 관측(미발행), 지점 영업시간 숫자
  web-ui-overlay: oklch(0.738 0.000 0)   # #AAAAAA, 관측(미발행), 로딩 덮개 div.ui-widget-overlay, 불투명도 0.30 으로 칠함
  ## 모바일 웹 관측(미발행)
  mweb-btn01: oklch(0.901 0.186 98)   # #FFDE00, 관측(미발행), .btn01, .btnLogin 바탕, .tab_type01 선택 칸, 포커스 입력(CSS 26회), 글자색으로는 안 씀
  mweb-tab-type01-off: oklch(0.907 0.008 91)   # #E2E0DA, 관측(미발행), .tab_type01 비선택 칸
  mweb-home-tab-off: oklch(0.547 0.018 67)   # #786F66, 관측(미발행), 홈 가운데 탭 줄 비선택 칸(글자 흰색)
  mweb-white: oklch(1.000 0.000 0)   # #FFFFFF, 관측(미발행), 홈 탭 줄 선택 칸과 비선택 칸 글자, .btn02 바탕
  mweb-body: oklch(0.321 0.000 0)   # #333333, 관측(미발행), body 글자와 링크
  mweb-black: oklch(0.000 0.000 0)   # #000000, 관측(미발행), 버튼 글자(omweb_2017.css 101회로 1위)
  mweb-section-band: oklch(0.961 0.000 0)   # #F2F2F2, 관측(미발행), 홈 섹션 사이 7px 띠, 금융상품 목록 위 선
  mweb-btn03: oklch(0.947 0.011 257)   # #E9EEF5, 관측(미발행), .btn03, .btn04 바탕
  mweb-input-line: oklch(0.907 0.000 0)   # #E0E0E0, 관측(미발행), 입력과 셀렉트 테두리 0.1rem
  mweb-btn02-line: oklch(0.764 0.000 0)   # #B2B2B2, 관측(미발행), .btn02 테두리 1px
  mweb-distance: oklch(0.738 0.183 55)   # #FF8400, 관측(미발행), 지점 거리 숫자 p.distance
  mweb-branch-list-line: oklch(0.499 0.044 257)   # #53647C, 관측(미발행), ul.branch_list 위 2px 선
  mweb-copy-area: oklch(0.982 0.000 0)   # #F9F9F9, 관측(미발행), 푸터 .copyArea 바탕
  mweb-geo-bnr: oklch(0.979 0.000 0)   # #F8F8F8, 관측(미발행), 추천 배너 .geo_bnr 바탕
  mweb-geo-bnr-label: oklch(0.572 0.149 324)   # #A155A9, 관측(미발행), 추천 배너 라벨 바탕(글자 흰색)
  ## 앱 스크린샷 판독 (KB스타뱅킹, 모두 추정값)
  app-list-bg: oklch(0.963 0.003 248)   # ≈ #F1F3F5, 스토어 스크린샷 판독(추정값), 화면과 목록 바탕, 아이폰과 아이패드 그림에서 같은 값
  app-card: oklch(1.000 0.000 0)   # ≈ #FFFFFF, 스토어 스크린샷 판독(추정값), 카드와 헤더 면
  app-transfer-button: oklch(0.880 0.166 92)   # ≈ #FFD338, 스토어 스크린샷 판독(추정값), 계좌 카드 이체 버튼 채움, 발행 노랑과 같은 토큰인지 알 수 없음
  app-pale-button: oklch(0.966 0.051 94)   # ≈ #FFF4CE, 스토어 스크린샷 판독(추정값), 연한 노랑 안내 버튼 바탕
  app-chip-selected: oklch(0.981 0.018 81)   # ≈ #FFF8EC, 스토어 스크린샷 판독(추정값), 선택된 분류 칩 바탕
fonts:
  web-obank-sans: "'KBText','맑은 고딕','Malgun Gothic','돋움',Dotum,AppleGothic,Helvetica,Sans-serif"   # 관측(미발행), 은행 웹 CSS 원문 순서(obank_main_2017.css, 원문 작은따옴표 그대로), KBText 서체 파일 사용 허락 근거 없음, 프리뷰는 Pretendard 로 그림
typography:
  ## 데스크톱 웹 관측(미발행)
  web-h2-obank: # 관측(미발행), 개인뱅킹 메인 섹션 h2(새소식, 이벤트), 글자 #222222
    fontFamily: "'KBText','맑은 고딕','Malgun Gothic','돋움',Dotum,AppleGothic,Helvetica,Sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 30px
  web-link-obank: # 관측(미발행), 개인뱅킹 메인 링크 a 요소, strong 은 700
    fontFamily: "'KBText','맑은 고딕','Malgun Gothic','돋움',Dotum,AppleGothic,Helvetica,Sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 21.45px
  web-h2-products: # 관측(미발행), 상품 화면 h2(예금 계산기 제목)
    fontSize: 24px
    fontWeight: 700
    lineHeight: 36px
  web-display-products: # 관측(미발행), 상품 화면의 가장 큰 글자 b 요소
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38.4px
  web-wrap-menu: # 관측(미발행), 1단 메뉴 띠 .wrap-menu 글자
    fontSize: 17px
    fontWeight: 700
    lineHeight: 50px
  web-submenu: # 관측(미발행), 2단 메뉴 div.submenu 글자
    fontSize: 15px
    fontWeight: 700
    lineHeight: 43px
  web-util-nav: # 관측(미발행), 상단 유틸리티 내비, 현재 칸은 700
    fontSize: 13px
    fontWeight: 400
    lineHeight: 26px
  web-h2-intro: # 관측(미발행), www 인트로 섹션 h2(새소식, 금융상품), 글자 #333333
    fontSize: 20px
    fontWeight: 700
    lineHeight: 26px
    letterSpacing: -1px
  web-list-intro: # 관측(미발행), www 인트로 새소식 목록 링크
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
  web-h2-branch: # 관측(미발행), 지점안내 h2.tit_dep2
    fontSize: 18px
    fontWeight: 700
    lineHeight: 27px
  web-h1-quick: # 관측(미발행), 빠른조회 h1.tit_dep1
    fontSize: 18px
    fontWeight: 700
    lineHeight: 30px
  web-quick-body: # 관측(미발행), 빠른조회 화면 나머지 글자 대부분
    fontSize: 12px
    fontWeight: 400
    lineHeight: 19.8px
  ## 모바일 웹 관측(미발행)
  mweb-link: # 관측(미발행), 모바일 웹 홈 링크(행간 140%)
    fontSize: 14px
    fontWeight: 400
    lineHeight: 19.6px
  mweb-h3: # 관측(미발행), 모바일 웹 홈 섹션 제목 h3(7개)
    fontSize: 16px
    fontWeight: 700
    lineHeight: 19.6px
    letterSpacing: -1px
  mweb-header-h1: # 관측(미발행), 고정 헤더 제목 h1 1.9rem, 굵기와 행간 미측정
    fontSize: 19px
  mweb-branch-name: # 관측(미발행), 지점찾기 목록 p.branch_name
    fontSize: 15px
    fontWeight: 700
    lineHeight: 22.4px
elevation:
  web-box-shadow: 4px 4px 12px oklch(0.000 0.000 0 / 15%)   # 관측(미발행), .boxShadow 와 .verticalTab .on a(CSS 6회)
  web-main-con1: 0 15px 30px 0 oklch(0.000 0.000 0 / 10%)   # 관측(미발행), 인트로 빠른메뉴 띠 div.main-con1
  web-ui-btn-shadow: 10px 15px 48px 0 oklch(0.000 0.000 0 / 25%)   # 관측(미발행), 퀵메뉴 닫기 button.ui-btn
components:
  web-wrap-menu:
    backgroundColor: "{colors.web-wrap-menu}"
    textColor: "{colors.web-wrap-menu-text}"
    typography: "{typography.web-wrap-menu}"
    height: 50px
    width: 980px
  web-wrap-menu-on:
    backgroundColor: "{colors.web-wrap-menu-on}"
  web-submenu:
    backgroundColor: "{colors.web-submenu}"
    textColor: "{colors.web-gray-222}"
    typography: "{typography.web-submenu}"
  web-main-con1:
    height: 70px
    width: 980px
  web-top-notice:
    backgroundColor: "{colors.web-top-notice}"
    textColor: "{colors.web-quick-bar}"
  web-form-search:
    backgroundColor: "{colors.web-white}"
    textColor: "{colors.web-gray-222}"
    rounded: 20px
    height: 38px
    width: 350px
  web-area-form:
    backgroundColor: "{colors.web-area-form}"
  web-btn-com:
    backgroundColor: "{colors.web-white}"
    textColor: "{colors.web-brown-4e}"
    height: 35px
  web-btn-com-c1:
    backgroundColor: "{colors.web-btn-com-c1}"
  web-btn-com-c2:
    backgroundColor: "{colors.web-btn-com-c2}"
    textColor: "{colors.web-white}"
    rounded: 0px
    height: 35px
  web-btn-action:
    height: 40px
  web-btn-action-c1:
    backgroundColor: "{colors.web-btn-action-c1}"
  web-btn-sub1:
    backgroundColor: "{colors.web-white}"
    textColor: "{colors.web-brown-4e}"
    rounded: 0px
    height: 27px
  web-input:
    backgroundColor: "{colors.web-white}"
    textColor: "{colors.web-gray-222}"
    rounded: 0px
    height: 35px
  web-nav-aside:
    backgroundColor: "{colors.web-nav-aside-cell}"
    textColor: "{colors.web-nav-aside-link}"
  web-ui-btn:
    backgroundColor: "{colors.web-ui-btn}"
    size: 25px
  web-icon-mark-pro1:
    backgroundColor: "{colors.web-icon-mark-pro1}"
    textColor: "{colors.web-white}"
  web-icon-mark-pro3:
    backgroundColor: "{colors.web-icon-mark-pro3}"
    textColor: "{colors.web-white}"
  web-quick-bar:
    backgroundColor: "{colors.web-quick-bar}"
    textColor: "{colors.web-gray-222}"
    typography: "{typography.web-h1-quick}"
  mweb-btn01:
    backgroundColor: "{colors.mweb-btn01}"
    textColor: "{colors.mweb-black}"
  mweb-btn-login:
    backgroundColor: "{colors.mweb-btn01}"
    textColor: "{colors.mweb-black}"
    height: 45px
  mweb-btn02:
    backgroundColor: "{colors.mweb-white}"
    textColor: "{colors.mweb-black}"
  mweb-tab-type01-on:
    backgroundColor: "{colors.mweb-btn01}"
    textColor: "{colors.mweb-black}"
  mweb-tab-type01-off:
    backgroundColor: "{colors.mweb-tab-type01-off}"
  mweb-home-tab-on:
    backgroundColor: "{colors.mweb-white}"
  mweb-home-tab-off:
    backgroundColor: "{colors.mweb-home-tab-off}"
    textColor: "{colors.mweb-white}"
  mweb-select:
    rounded: 0px
    height: 36px
  mweb-geo-bnr:
    backgroundColor: "{colors.mweb-geo-bnr}"
    rounded: 12px
    padding: 20px
  mweb-header:
    typography: "{typography.mweb-header-h1}"
    height: 55px
  app-transfer-button:
    backgroundColor: "{colors.app-transfer-button}"
  app-pale-button:
    backgroundColor: "{colors.app-pale-button}"
  app-account-card:
    backgroundColor: "{colors.app-card}"
  app-chip-selected:
    backgroundColor: "{colors.app-chip-selected}"
---

# KB국민은행 — design.md

KB국민은행은 웹과 KB스타뱅킹 앱으로 뱅킹을 제공하는 은행이고 [src:21][src:37], 웹은 노랑 메뉴 띠와 직각 상자로, 앱은 연회색 바탕 위 둥근 흰 카드로 짜인다 [src:17][src:19][src:37].

## Brand & Style

KB국민은행의 시각 언어는 브랜드가 공개한 네 갈래 문서와, 그것과 따로 움직이는 세 갈래 화면으로 나뉜다. 공개 문서는 그룹 CI [src:3], 그룹 전용서체 KB금융체 [src:5], 은행 CI 세 쪽(심볼마크, 로고타입과 시그니처와 색, 내려받기) [src:6][src:13][src:16], 글쓰기 규칙인 KB고객언어 가이드 [src:38]다. 그룹 CI 는 심볼 Star-b 를 "별의 의미를 내포하는" 마크로 설명하고 [src:3], 은행 CI 의 심볼마크 쪽도 같은 Star-b 를 같은 설명으로 실어 그룹과 은행이 함께 쓰는 마크다 [src:13].

이 문서는 값을 세 등급으로 가른다. **발행**은 브랜드가 공개 문서에 적은 값, **관측(미발행)**은 배포된 CSS 나 렌더한 화면에서 잰 값, **스크린샷 판독**은 앱 스토어 그림에서 읽은 근삿값(`≈`)이다. 등급은 섞지 않는다. 데스크톱 다섯 화면에서 모은 CSS 46개 파일은 합쳐서 고유 hex 823개에 CSS 변수가 0개이고 [src:17][src:18][src:20][src:21][src:22], 모바일 웹 CSS 3개 파일에도 커스텀 프로퍼티 선언이 없다 [src:24][src:26][src:28]. 이 문서에서 CSS 의 횟수나 분포로 적은 수는 데스크톱은 이 46개 파일을, 모바일 웹은 이 3개 파일을 따로 합쳐 센 값이고, 파일 이름을 댄 수만 그 파일 하나의 수다. 그래서 웹 화면 값은 선택자와 화면 이름을 단 관측 묶음으로, 앱 값은 스크린샷 판독 묶음으로 싣고, 역할 이름을 붙이지 않는다.

세 화면의 인상은 서로 다르다. 데스크톱 웹은 980px 고정폭 본문에 노랑 메뉴 띠와 회갈색 오른쪽 퀵메뉴를 두고 [src:19], 모서리는 거의 직각이며 글자는 14px, 12px 중심으로 작다 [src:17][src:18][src:20][src:21][src:22]. 모바일 웹은 흰 면 위에 각진 요소를 쌓고 섹션 사이를 7px 연회색 띠로 가른다 [src:28]. KB스타뱅킹 앱은 연회색 바탕 위에 둥근 흰 카드를 쌓아 그림자보다 바탕 대비로 면을 나눈다 [src:37]. 두 웹 화면에 공통으로 남는 것은 따뜻한 쪽으로 기운 회갈색 중립색과 자리마다 값이 다른 노랑이다 [src:19][src:26].

글의 톤은 KB고객언어 가이드가 정한다. 가이드는 쉬운 언어가 아니라 신뢰할 수 있는 언어를 입장으로 삼고, 목소리를 믿음직스럽게, 이해하기 쉽게, 명료하게로 적는다 [src:38][src:39]. 공지와 거절은 하십시오체, 권유와 질문은 해요체, 버튼과 배너는 명사형 마무리로 상황마다 말투를 가른다 [src:38]. 관측한 웹 메뉴와 버튼도 명사나 -기 명사형이다 [src:17].

## Colors

KB 는 색을 hex 로 발행하지 않았다. 그룹 CI 의 색상 체계 그림은 메인 컬러 3종과 서브 컬러 3종을 싣고 Pantone, CMYK, RGB 로 인쇄하되 KB Gold 와 KB Silver 는 Pantone 만 인쇄하고 [src:1][src:2][src:3], 은행 CI 그림은 같은 여섯 색을 Main Color 와 Sub Color 구역에 같은 숫자로 싣는다 [src:4]. frontmatter 의 `kb-yellow-positive`, `kb-yellow-negative`, `kb-gray`, `kb-dark-gray` 넷은 인쇄된 RGB 를 옮긴 값이고, 키는 발행 이름에 kb- 를 붙인 카탈로그 이름이다 [src:1][src:2]. 은행 CI 색 절의 제목은 'Primary Color Palette' 지만 어느 한 색을 대표색으로 부르는 문구는 그룹과 은행 어디에도 없어 [src:3][src:6], 이 문서는 `primary` 토큰을 두지 않는다.

서브 컬러의 KB Gold(Pantone 872 C)와 KB Silver(Pantone 877 C)는 Pantone 번호만 인쇄되고 CMYK 와 RGB 가 없다 [src:2]. 화면용 값이 발행되지 않은 그대로이므로 토큰으로 싣지 않는다. 색 재현은 별색이 원칙이고 어려우면 4원색이나 RGB 를 쓰며, 간판은 시트 번호(Yellow Positive 3M VT 10891 등)를 참고한다 [src:4][src:6]. 은행 CI 그림의 이름표 'KB Yellow'(심볼)와 'KB Gray'(로고타입)는 로고의 어느 부분에 어느 색을 칠하는지 적은 것이고 Positive 와 Negative 를 가르지 않는다 [src:4]. 화면 역할을 정의한 계층이 아니므로 역할 표와 역할 참조 행은 두지 않는다.

### 발행 노랑은 화면에 거의 없다

발행 KB Yellow Positive `{colors.kb-yellow-positive}` 는 은행 화면에서 거의 관측되지 않는다. 데스크톱 CSS 46개 파일 전체에서 `.navbar-nav .btn` hover 바탕 한 곳(`{colors.web-navbar-btn-hover}`)에만 나오고, 렌더한 5개 화면의 색 표에는 없다 [src:17][src:18][src:20][src:21][src:22][src:36]. 화면은 자리마다 다른 노랑을 쓴다. 아래 화면 노랑은 어느 것도 브랜드 색으로 올리지 않으며, 이 문서는 어느 노랑도 대표 노랑으로 고르지 않는다.

| 갈래 | 토큰 또는 값 | 쓰인 자리 | 등급 |
| --- | --- | --- | --- |
| 발행 CI 색 | {colors.kb-yellow-positive} | KB Yellow Positive, R255 G188 B0 [src:1] | 발행 |
| 발행 CI 색 | {colors.kb-yellow-negative} | KB Yellow Negative, R255 G204 B0 [src:1] | 발행 |
| 로고 파일 | `oklch(0.808 0.166 76)` | 그룹 심볼 PNG 의 심볼 화소 [src:8] | 관측(미발행) |
| 로고 파일 | `oklch(0.814 0.168 82)` | 은행 웹 머리 로고 kb_logo.png 의 심볼 화소 [src:10] | 관측(미발행) |
| 데스크톱 웹 | {colors.web-intro-menu1} | 인트로 빠른메뉴 띠 ul.menu1 [src:17] | 관측(미발행) |
| 데스크톱 웹 | {colors.web-wrap-menu} | 1단 메뉴 띠 .wrap-menu [src:18] | 관측(미발행) |
| 데스크톱 웹 | {colors.web-wrap-menu-on} | .wrap-menu 현재 칸과 hover 칸 [src:19] | 관측(미발행) |
| 데스크톱 웹 | {colors.web-headline} | div.headline 헤드라인 박스 [src:21] | 관측(미발행) |
| 데스크톱 웹 | {colors.web-quick-bar} | 빠른조회 머리 띠, 인트로 공지 링크 1개 [src:17][src:20] | 관측(미발행) |
| 데스크톱 CSS 규칙만 | {colors.web-btn-com-c1}, {colors.web-btn-action-c1}, {colors.web-pagination-on}, {colors.web-submenu-line} | .btn-com.c1, .btn-action.c1, 페이지네이션 현재 쪽, 2단 메뉴 아래 선(렌더 표본 없음) [src:18][src:19][src:34][src:36] | 관측(미발행) |
| 데스크톱 CSS 규칙만 | `oklch(0.844 0.172 88)` | .notiArea, .serError 보더 [src:35] | 관측(미발행) |
| 모바일 웹 | {colors.mweb-btn01} | .btn01, .btnLogin, .tab_type01 선택 칸, 포커스 입력 [src:26] | 관측(미발행) |
| 앱 | {colors.app-transfer-button} | 계좌 카드 이체 버튼 채움 [src:37] | 스크린샷 판독(≈) |
| 앱 | {colors.app-pale-button} | 연한 노랑 안내 버튼 [src:37] | 스크린샷 판독(≈) |

빠른조회 머리 띠의 노랑 `{colors.web-quick-bar}` 는 발행 KB Yellow Negative 와 같은 값이다. 데스크톱 CSS 8개 파일에 hex 로 19회 나오지만 렌더에서는 빠른조회 머리 띠와 인트로 공지 링크 1개뿐이어서 [src:17][src:18][src:20][src:21][src:22], 발행 토큰을 가리키지 않고 관측 토큰으로 따로 둔다. 앱의 이체 버튼 노랑 ≈ `{colors.app-transfer-button}` 은 발행 Negative 보다 조금 옅고, 같은 토큰인지 알 수 없다 [src:37].

### 로고 파일과 발행 숫자의 차이

로고 파일이 칠한 색은 인쇄 숫자와 다르다. 그룹 심볼 PNG 의 노랑 `oklch(0.808 0.166 76)` 은 발행 Positive 와 R-3 G-13 B+23 만큼 다르고, CI 페이지 JPG 는 `oklch(0.809 0.166 76)` 이다 [src:3][src:8]. 국문 로고타입 PNG 의 글자 `oklch(0.538 0.022 67)` 은 발행 KB Gray 보다 밝다 [src:3][src:9]. 은행 CI 그림 자체도 Yellow Positive 칸을 `oklch(0.788 0.165 74)` 로 칠한다 [src:4]. 로고 AI 원본의 견본은 Pantone 130 C, 404 C, 158 C, Warm Gray 4 C 인데, 뒤의 둘은 CI 페이지에 없어 브랜드 색으로 읽지 않는다 [src:12]. 앱 아이콘은 바탕 ≈ `oklch(0.865 0.177 90)` 에 심볼 ≈ `oklch(0.248 0.000 0)` 이고, 바탕 값이 발행 Negative 와 같다 [src:11]. 로고 파일과 CI 그림의 값은 관측(미발행), 앱 아이콘 값은 스토어 그림 판독(≈)이며, 모두 토큰으로 싣지 않는다.

### 회갈색과 중립색

발행 KB Gray 와 같은 값은 데스크톱 CSS 2개 파일에 7회 나오지만 [src:34][src:36] 렌더 표본에는 없다 [src:17][src:18][src:20][src:21][src:22]. 화면에서 실제로 보이는 회갈색은 `{colors.web-nav-aside-link}`(퀵메뉴 링크, 발행 KB Gray 와 R 만 1 다름) [src:21], `{colors.web-wrap-menu-text}`(메뉴 글자) [src:19], `{colors.web-btn-com-c2}`(지점 조회 버튼) [src:22], `{colors.web-top-notice}`(인트로 공지 띠) [src:23] 같은 따뜻한 쪽 중립색이다. 지점안내는 1단 메뉴 띠 대신 `{colors.web-snb}` 하위 내비 띠를 두고 현재 항목을 `{colors.web-snb-on}` 으로 칠하며, 영업시간 숫자는 `{colors.web-branch-hours}` 다 [src:22]. 발행 KB Dark Gray 와 같은 값은 받은 CSS 에 1회 나온다 [src:17][src:18][src:20][src:21][src:22][src:36].

데스크톱 바탕은 대부분 `{colors.web-white}` 이고, 인트로 히어로는 `{colors.web-intro-hero}` 크림색이다 [src:17]. 개인뱅킹 메인의 상품 영역은 `{colors.web-main-product}`, 카드와 목록의 1px 선은 `{colors.web-card-line}` 이다 [src:21]. 본문 글자색은 화면마다 `{colors.web-gray-5a}` [src:17] 와 `{colors.web-brown-4e}` [src:20] 둘로 갈리고, 인트로 제목과 링크는 `{colors.web-gray-333}` 이다 [src:17].

모바일 웹은 `{colors.mweb-btn01}` 노랑과 `{colors.mweb-tab-type01-off}`, `{colors.mweb-home-tab-off}` 회갈색을 쓴다 [src:26][src:27]. `{colors.mweb-black}` 은 버튼 글자에 쓰이고, 모바일 웹 CSS(2017)에서 가장 많이 나오는 색이다 [src:26]. 섹션 사이 띠는 `{colors.mweb-section-band}` [src:28], 푸터는 `{colors.mweb-copy-area}` 다 [src:27]. 앱은 ≈ `{colors.app-list-bg}` 바탕에 ≈ `{colors.app-card}` 카드를 얹고, 선택된 분류 칩은 ≈ `{colors.app-chip-selected}` 로 옅게 물든다 [src:37]. 앱의 글자색(아이폰 그림에서 가장 짙은 글자 ≈ `oklch(0.243 0.008 264)`, 라벨 ≈ `oklch(0.530 0.014 260)`)은 푸른 쪽으로 기운 회색이고, 바로가기 타일 청록 ≈ `oklch(0.939 0.019 201)` 과 함께 스크린샷 판독이라 토큰으로 싣지 않는다 [src:37].

## Typography

브랜드가 발행한 서체는 그룹 전용서체 KB금융체다. KB금융 제목체(Bold, Medium, Medium Italic, Light)와 KB금융 본문체(Bold, Medium, Light)로 나뉘고, 영문 이름은 KB Financial Display Font, KB Financial Text Font 다 [src:5]. 제목체는 "신뢰감을 주는 직선 형태와 친근함을 전달하는 곡선 형태를 현대적으로 디자인"했고, 본문체는 제목체를 기준으로 조형적 안정성과 가독성을 강화했다고 설명한다 [src:5]. 서체 페이지에는 내려받기 링크도 사용 조건 문구도 없다 [src:5]. 은행 CI 는 로고타입을 'KB국민은행만의 고유서체' 라고만 적고 서체 이름을 밝히지 않는다 [src:6].

은행 웹은 KB금융체라는 이름 대신 `KBText` 라는 CSS family 를 쓴다. 개인뱅킹 메인의 스택은 `{fonts.web-obank-sans}` 이고, 은행 웹 CSS 에 적힌 순서와 따옴표를 그대로 옮겼다 [src:30]. `KBText` 는 `font.css` 의 `@font-face` 로 선언된 면 하나(KBFGTextL, weight 미지정)이고, 굵은 면은 '트래픽 용량에 따른 폰트 미적용' 주석과 함께 꺼져 있으며, KBDisplay 는 선언만 있고 쓰는 선택자가 없다 [src:31][src:32]. 두 `font.css` 는 이 관측의 근거로만 인용하며 불러올 웹폰트 출처가 아니다. KBText 와 KB금융 본문체가 같은 서체라는 문서는 없다.

갈래마다 스택이 다르다. 데스크톱 인트로는 맑은 고딕을 앞세운 시스템 스택으로 웹폰트를 불러오지 않고 [src:17], 빠른조회는 Malgun Gothic 으로 시작하는 스택에 KBText 가 없다 [src:20]. 모바일 웹은 Roboto 로 시작하는 스택에 `@font-face` 가 없어 한글은 기기 기본 글꼴로 그려진다 [src:26]. 한 화면 안에서도 섞여, 지점안내는 KBText 45 대 맑은 고딕 51 요소이고 [src:22], 상품은 KBText 128 대 맑은 고딕 9 요소다 [src:18]. 프리뷰는 Pretendard 로 그린다. 이 문서의 `{fonts.web-obank-sans}` 를 그대로 쓰면 KBText 가 없는 기기에서는 맑은 고딕부터 차례로 그려진다.

크기는 일정한 배율 없이 흩어진다. 데스크톱 CSS 의 크기 분포는 14px 453, 12px 293, 16px 250, 13px 186, 18px 136 이고 [src:17][src:18][src:20][src:21][src:22], 굵기는 bold 와 normal 두 단계에 몰린다 [src:17][src:18][src:20][src:21][src:22]. 자간은 -1px 가 152건으로 가장 많다 [src:17][src:18][src:20][src:21][src:22]. frontmatter `typography:` 의 줄은 모두 관측 값이다.

- 개인뱅킹 메인: 섹션 제목 `{typography.web-h2-obank}`(24px / 30px / 700), 링크 `{typography.web-link-obank}`(13px / 21.45px / 400) [src:21]
- 상품: 제목 `{typography.web-h2-products}`(24px / 36px / 700), 가장 큰 글자 `{typography.web-display-products}`(32px / 38.4px), 상단 유틸리티 내비 `{typography.web-util-nav}`(13px / 26px), 2단 메뉴 `{typography.web-submenu}`(15px / 43px / 700) [src:18]
- 메뉴 띠: `{typography.web-wrap-menu}`(17px / 50px / 700) [src:19]
- 인트로: 섹션 제목 `{typography.web-h2-intro}`(20px / 26px / 700, 자간 -1px), 목록 `{typography.web-list-intro}`(14px / 21px / 400) [src:17]
- 지점안내: 제목 `{typography.web-h2-branch}`(18px / 27px / 700) [src:22]
- 빠른조회: 제목 `{typography.web-h1-quick}`(18px / 30px / 700), 조밀한 본문 `{typography.web-quick-body}`(12px / 19.8px / 400) [src:20]

모바일 웹은 html 10px 에 rem 단위로 쓰고 body 1.4rem, 행간 140% 다 [src:26]. 홈 링크는 `{typography.mweb-link}`, 섹션 제목은 `{typography.mweb-h3}` 이고 [src:27], 고정 헤더 제목은 `{typography.mweb-header-h1}`(1.9rem) [src:26], 지점 이름은 `{typography.mweb-branch-name}` 이다 [src:29].

앱은 글꼴 이름을 판독할 수 없고 굵기가 두 단계로 읽히며, 금액 숫자가 가장 크다 [src:37]. 앱 글자 크기는 스토어 그림 px 로만 잴 수 있어(아이폰 그림에서 KB 대문자 ≈ 20px, 화면 폭 대비 3.2%) 토큰으로 싣지 않는다 [src:37].

## Spacing

브랜드가 발행한 간격 체계는 없고, frontmatter 에 `spacing:` 맵을 두지 않는다. 아래 웹 값은 관측(미발행), 앱 값은 스토어 스크린샷 판독(≈)이며 쓰인 자리와 함께 적는다. 데스크톱 CSS 의 px 빈도는 10px 1004, 20px 841, 5px 788, 15px 640, 30px 429 이고 8px 370, 3px 313, 7px 288 이 함께 나오는데, 10px, 5px, 15px, 30px, 3px, 7px 처럼 4 의 배수가 아닌 값이 많아 4px 격자가 아니다 [src:17][src:18][src:20][src:21][src:22]. 데스크톱 버튼 안쪽 여백은 `.btn-com` 0 14px, `.btn-action` 0 28px [src:34], `.btn-sub1` 1px 9px 0 이다 [src:22].

모바일 웹 `.btn01` 과 `.btn02` 는 안쪽 여백 1.1rem 2rem 0.9rem(11px 20px 9px)에 최소 폭 10.6rem 이다 [src:26]. 홈 목록 줄은 46px, 금융상품 줄은 52px, 왼쪽 여백은 30~50px 다 [src:27]. 앱은 아이폰 홈 그림(01, 02) 기준 좌우 여백 ≈ 34px(5.4%), 카드 사이 ≈ 20px(화면 폭 대비 3.2%), 카드 안쪽 ≈ 33px(5.3%)로 읽히고, 좌우 여백은 화면마다 ≈ 34px, 41px, 51px 로 다르다 [src:37]. 발행된 치수 규정은 로고에 관한 것뿐으로, 심볼과 글자 사이는 높이 X 기준 0.32X 다 [src:14].

## Rounded

브랜드가 발행한 반경 체계는 없고, frontmatter 에 `rounded:` 맵을 두지 않는다. 아래 웹 값은 관측(미발행)이고, 앱 값은 스토어 스크린샷 판독(≈)이다. 데스크톱 웹은 대부분 직각이어서 인트로는 잰 요소 279개가 모두 반경 0 이고 [src:17], 개인뱅킹의 입력창과 버튼도 대부분 0 이다 [src:21]. 떠 있는 작은 상자(툴팁 `dl.pop-modal1`, `#uiNavAside`, jQuery UI 다이얼로그)는 4px 다 [src:19][src:24][src:34]. 검색 상자는 알약으로, `div.form-search` 20px [src:21], 상품 검색 홀더 23px 다 [src:18]. 원형은 50%(점, 아이콘 배경, `button.ui-btn`) [src:21], 3px 는 슬라이더 막대와 퀵메뉴 첫 칸 위쪽 모서리에 쓰인다 [src:19][src:33]. 분포는 4px 49, 50% 31, 3px 16, 0 14, 10px 9 로 4px 가 가장 많지만 한 단위에 모이지 않는다 [src:17][src:18][src:20][src:21][src:22].

모바일 웹 홈에 그려진 버튼, 링크, 탭은 0 이고 추천 배너 `.geo_bnr` 만 12px, 그 라벨은 2px 다 [src:27]. 앱은 둥글다. 아이폰 그림에서 카드와 타일은 ≈ 18~20px(화면 폭 대비 3.0~3.2%), 아이패드 그림에서 타일은 ≈ 12px(2.0%)로 읽히지만, 이체 버튼은 ≈ 2~3px 에서 ≈ 0 까지 묶음마다 달라 반경 체계로 정하지 않는다 [src:37].

## Elevation & Depth

브랜드가 발행한 그림자 체계는 없다. 데스크톱 CSS 에 box-shadow 값이 29종(none, inherit, 크기 0 값 둘 포함) 흩어져 있고 단계가 없다 [src:17][src:18][src:20][src:21][src:22]. frontmatter `elevation:` 의 셋은 쓰인 자리가 분명한 관측 값이다. `{elevation.web-box-shadow}` 는 `.boxShadow` 와 세로 탭 선택 칸 [src:35], `{elevation.web-main-con1}` 은 히어로에 걸친 인트로 빠른메뉴 띠 [src:23], `{elevation.web-ui-btn-shadow}` 는 퀵메뉴 닫기 원형 단추다 [src:21]. 로딩 덮개는 `{colors.web-ui-overlay}` 를 불투명도 0.30 으로 깐다 [src:24].

모바일 웹은 렌더된 그림자가 0 이고 [src:27][src:29], CSS 에 4종만 있다 [src:26][src:28]. 앱은 카드끼리 그림자보다 바탕 대비로 나뉜다 [src:37]. 그래서 깊이는 그림자가 아니라 면의 명도 차(흰 카드 대 연회색 바탕, 흰 면 대 7px 띠)로 표현된다. 전환은 아래가 기본으로 관측된다 [src:17].

```text
transition-default: all 0.3s ease   # 관측(미발행), 0.2s, 0.6s, 0.1s 도 있음
```

## Shapes

웹은 직각의 기하 언어다. 버튼, 입력창, 탭, 표가 반경 0 의 사각 상자로 짜이고 [src:17][src:27], 곡선은 검색 상자 알약, 원형 단추, 떠 있는 작은 상자(4px), 모바일 웹 추천 배너(12px) 같은 자리에 쓰인다 [src:18][src:19][src:21][src:27]. 테두리는 1px 실선이 기본이고, 버튼 베이스는 아래 테두리만 한 단계 짙게 칠한다 [src:34]. 앱은 반대로 둥근 카드와 알약 탭을 쓴다 [src:37].

브랜드 형태 언어의 중심은 Star-b 심볼이다. 심볼은 14x10 격자 위에 그려지고 [src:15], 심볼 높이가 2.5mm 미만이면 사용을 금한다 [src:13]. 그룹 CI 와 은행 CI 모두 심볼과 로고타입의 조합인 시그니처를 임의로 변형하지 못하게 한다 [src:3][src:6]. 내려받기 형식은 그룹이 AI, JPG, PNG, 은행이 JPEG, AI 이고 은행 쪽에는 SVG 가 없다 [src:16]. 국문 가로 시그니처 PNG 는 심볼과 'KB국민은행' 글자를 가로로 붙인 2839x469 그림이다 [src:7].

## Components

컴포넌트 이름은 CSS 클래스나 화면 자리를 따른 것이고 브랜드가 붙인 이름이 아니다. 값이 관측되지 않은 hover, focus, pressed 는 적지 않는다. 데스크톱과 모바일 웹 값은 관측(미발행), 앱 값은 스크린샷 판독(≈)이다.

```tsx
// 데스크톱 1단 메뉴 띠: 바탕 {colors.web-wrap-menu}, 현재 칸 {colors.web-wrap-menu-on}
<nav className="wrap-menu" aria-label="주 메뉴">
  <a aria-current="page">조회</a>
  <a>이체</a>
</nav>
```

### web-wrap-menu

개인뱅킹 메인과 상품 화면 상단의 1단 메뉴 띠다. 바탕 `{colors.web-wrap-menu}`, 글자 `{colors.web-wrap-menu-text}` `{typography.web-wrap-menu}` 에 높이 50px, 폭 980px, 칸은 6등분(16.66%)이다 [src:19].

```text
background: {colors.web-wrap-menu}
text: {colors.web-wrap-menu-text}, {typography.web-wrap-menu}
height: 50px, width: 980px, cell: 16.66%, padding: 0 30px
```

### web-wrap-menu-on

같은 띠의 현재 칸과 hover 칸은 `{colors.web-wrap-menu-on}` 으로 한 단계 짙게 칠한다 [src:19].

```text
background: {colors.web-wrap-menu-on}
```

### web-submenu

1단 띠 아래의 흰빛 2단 메뉴다. 바탕 `{colors.web-submenu}`, 글자 `{colors.web-gray-222}` `{typography.web-submenu}` 이고, 아래 선 3px 는 평소 흰색, hover 와 현재 칸은 `{colors.web-submenu-line}` 이다(CSS 규칙, 렌더 표본 없음) [src:18][src:19].

```text
background: {colors.web-submenu}
text: {colors.web-gray-222}, {typography.web-submenu}
padding: 2px 26px 0
border-bottom: 3px, hover/current {colors.web-submenu-line}
```

### web-main-con1

www 인트로의 빠른메뉴 띠다. 980x70px 에 왼쪽 노랑 블록 `{colors.web-intro-menu1}` 을 두고, `{elevation.web-main-con1}` 그림자와 margin-top -35px 로 히어로 아래쪽에 걸친다 [src:23].

```text
background(left block): {colors.web-intro-menu1}
size: 980px x 70px, margin-top: -35px
shadow: {elevation.web-main-con1}
```

### web-top-notice

인트로 맨 위 공지 띠다. 바탕 `{colors.web-top-notice}` 에 밑줄 친 14px 링크를 `{colors.web-quick-bar}` 로 칠하고, "1일동안 열지않기" 체크와 "닫기" 를 둔다 [src:23]. 링크 색은 빠른조회 머리 띠와 같은 `oklch(0.865 0.177 90)` 이라 그 관측 토큰을 가리킨다 [src:20][src:23].

```text
background: {colors.web-top-notice}
link: {colors.web-quick-bar}, 14px, underline
```

### web-form-search

개인뱅킹의 알약 검색 상자다. 홀더 반경 20px, 테두리 1px `oklch(0.895 0.003 85)`, 입력 바탕 `{colors.web-white}`, 글자 16px / 22px / 400 `{colors.web-gray-222}`, 크기 350x38px 이고 입력 자체에는 테두리가 없다 [src:21].

```text
background: {colors.web-white}
text: {colors.web-gray-222}, 16px / 22px / 400
radius: 20px, border: 1px oklch(0.895 0.003 85)
size: 350px x 38px
```

### web-area-form

상품 화면의 검색 띠다. 띠 바탕 `{colors.web-area-form}` 위에 반경 23px 홀더를 두고 입력 글자는 16px / 26.4px 다 [src:18].

```text
background: {colors.web-area-form}
holder radius: 23px, input border: 1px {colors.web-white}
input: 16px / 26.4px
```

### web-btn-com

데스크톱 기본 버튼이다. 베이스는 바탕 `{colors.web-white}`, 테두리 1px `oklch(0.754 0.000 0)` 에 아래 테두리만 `oklch(0.608 0.012 63)` 이다. `.btn-com` 은 높이와 행간 35px, 최소 폭 80px, 글자 `{colors.web-brown-4e}` 이고 disabled 는 불투명도 0.65 다. hover 와 focus 에 배경색을 바꾸는 규칙은 활성 CSS 에 없고, disabled 의 hover 와 focus 에서 배경을 지우는 규칙 하나만 있다 [src:17][src:18][src:20][src:21][src:22][src:34].

```text
background: {colors.web-white}
text: {colors.web-brown-4e}, 12px
border: 1px oklch(0.754 0.000 0), bottom 1px oklch(0.608 0.012 63)
height: 35px, min-width: 80px, padding: 0 14px
disabled: opacity 0.65
```

### web-btn-com-c1

노랑 채움 변형이다. 바탕 `{colors.web-btn-com-c1}` 에 아래 테두리 `oklch(0.825 0.171 80)` 이며, CSS 규칙만 있고 렌더 표본은 없다 [src:34].

```text
background: {colors.web-btn-com-c1}
border-bottom: oklch(0.825 0.171 80)
```

### web-btn-com-c2

회갈색 채움 변형으로 지점 조회와 상품 결과보기에 쓰인다. 바탕과 테두리 1px `{colors.web-btn-com-c2}`, 글자 `{colors.web-white}` 14px / 35px / 700, 높이 35px, 반경 0 이다 [src:22]. 상품 결과보기 단추는 140x90px 로 커진다 [src:18].

```text
background: {colors.web-btn-com-c2}, border: 1px {colors.web-btn-com-c2}
text: {colors.web-white}, 14px / 35px / 700
height: 35px, padding: 0 14px, radius: 0px
```

### web-btn-action

큰 동작 버튼이다. 높이 40px, 최소 폭 120px, 여백 0 28px, 14px bold, 테두리 `oklch(0.811 0.000 0)`(아래 `oklch(0.660 0.000 0)`)다(CSS 규칙, 렌더 표본 없음) [src:34].

```text
height: 40px, min-width: 120px, padding: 0 28px
text: 14px bold
border: oklch(0.811 0.000 0), bottom oklch(0.660 0.000 0)
```

### web-btn-action-c1

`.btn-action` 의 노랑 채움 변형으로 바탕 `{colors.web-btn-action-c1}` 이다. `c2` 는 바탕 `oklch(0.508 0.013 63)` 이다(CSS 규칙, 렌더 표본 없음) [src:34].

```text
background: {colors.web-btn-action-c1}
```

### web-btn-sub1

작은 보조 버튼이다(예 "관리지점"). 높이 27px, 바탕 `{colors.web-white}`, 테두리 1px `oklch(0.754 0.000 0)`(아래 `oklch(0.608 0.012 63)`), 글자 `{colors.web-brown-4e}` 12px / 26px / 400, 반경 0 이다 [src:22].

```text
background: {colors.web-white}
text: {colors.web-brown-4e}, 12px / 26px / 400
height: 27px, padding: 1px 9px 0, radius: 0px
```

### web-input

데스크톱 입력창이다. 바탕 `{colors.web-white}`, 테두리 1px `{colors.web-input-line}`, 글자 `{colors.web-gray-222}` 12px / 19.8px, 반경 0 이고 읽기 전용은 `{colors.web-area2}` 바탕이다. focus 값은 관측 기록에 따로 없다 [src:18]. 높이는 CSS 가 래퍼 안에서 35px 로 정하고 [src:34], 금융상품 화면의 입력 3개는 40px 로 그려진다 [src:18]. 빠른조회의 입력은 높이 27px 로 더 작다 [src:20].

```text
background: {colors.web-white}, readonly {colors.web-area2}
text: {colors.web-gray-222}, 12px / 19.8px
border: 1px {colors.web-input-line}, radius: 0px
height: 35px, padding: 8px 9px 7px
```

### web-nav-aside

오른쪽에 떠 있는 세로 퀵메뉴다. 칸 바탕 `{colors.web-nav-aside-cell}`, 첫 칸 `{colors.web-nav-aside-head}`(위 모서리 3px), 링크 `{colors.web-nav-aside-link}` 이고 항목은 장바구니, 최근본상품, MY MENU, 고객센터, 지점찾기, 글자 크기, TOP 이다 [src:19].

```text
cell: {colors.web-nav-aside-cell}
head: {colors.web-nav-aside-head}, radius 3px 3px 0 0
link: {colors.web-nav-aside-link}
```

### web-ui-btn

퀵메뉴 닫기 원형 단추다. 지름 25px, 반경 50%, 바탕 `{colors.web-ui-btn}`, 그림자 `{elevation.web-ui-btn-shadow}` 다 [src:21].

```text
background: {colors.web-ui-btn}
size: 25px, radius: 50%
shadow: {elevation.web-ui-btn-shadow}
```

### web-icon-mark-pro1

상품 꼬리표의 주황 채움형이다. `{colors.web-icon-mark-pro1}` 에 흰 글자 14px 다 [src:21]. 윤곽형 `c2` 는 흰 바탕에 `{colors.web-icon-mark-c2}` 글자와 테두리다 [src:21]. 어느 상품에 어느 꼴을 쓰는지 정한 글은 없다 [src:21].

```text
background: {colors.web-icon-mark-pro1}
text: {colors.web-white}, 14px
```

### web-icon-mark-pro3

상품 꼬리표의 파랑 채움형이다. `{colors.web-icon-mark-pro3}` 에 흰 글자 14px 이고, 윤곽형 `c1` 은 흰 바탕에 같은 파랑 글자와 테두리다 [src:21].

```text
background: {colors.web-icon-mark-pro3}
text: {colors.web-white}, 14px
```

### web-quick-bar

빠른조회 화면의 창 폭 머리 띠다. 바탕 `{colors.web-quick-bar}` 에 제목 `{typography.web-h1-quick}` `{colors.web-gray-222}` 를 두고 오른쪽에 96x16 로고를 둔다 [src:20]. 이 화면은 상자형 탭 여섯과 줄 간격이 좁은 입력 표, 그림으로 그린 조회 단추로 이루어진다 [src:20].

```text
background: {colors.web-quick-bar}
title: {colors.web-gray-222}, {typography.web-h1-quick}
logo: 96px x 16px
```

### web-ttype01

데스크톱 표다. th 바탕 `oklch(0.973 0.001 106)`, 테두리 `{colors.web-ttype01-line}`, th 굵기 normal, tfoot `{colors.web-area2}` 다 [src:25]. 빠른조회 표는 th 폭 266px, 칸 여백 5px 5px 4px 15px, 행 30px 부터다 [src:20].

```text
th: oklch(0.973 0.001 106), font-weight normal
border: {colors.web-ttype01-line}
tfoot: {colors.web-area2}
```

### mweb-btn01

모바일 웹의 노랑 버튼이다. 바탕과 테두리 `{colors.mweb-btn01}`, 글자 `{colors.mweb-black}`, 여백 1.1rem 2rem 0.9rem, 최소 폭 10.6rem 이다(CSS 규칙) [src:26].

```text
background: {colors.mweb-btn01}, border: {colors.mweb-btn01}
text: {colors.mweb-black}
padding: 1.1rem 2rem 0.9rem, min-width: 10.6rem
```

### mweb-btn-login

로그인 버튼이다. 바탕 `{colors.mweb-btn01}`, 글자 `{colors.mweb-black}`, 높이 4.5rem(45px)이다 [src:26].

```text
background: {colors.mweb-btn01}
text: {colors.mweb-black}
height: 45px
```

### mweb-btn02

흰 보조 버튼이다. 바탕 `{colors.mweb-white}`, 테두리 1px `{colors.mweb-btn02-line}`, 글자 `{colors.mweb-black}` 에 `{component.mweb-btn01}` 과 같은 여백과 최소 폭이다 [src:26]. `.btn03`, `.btn04` 는 바탕 `{colors.mweb-btn03}` 이다 [src:26].

```text
background: {colors.mweb-white}
border: 1px {colors.mweb-btn02-line}
text: {colors.mweb-black}
```

### mweb-tab-type01-on

지점찾기 같은 화면의 상자 탭 선택 칸이다. `{colors.mweb-btn01}` 에 검정 글자, 여백 1.5rem 0 1.1rem 이다 [src:26].

```text
background: {colors.mweb-btn01}
text: {colors.mweb-black}
```

### mweb-tab-type01-off

같은 탭의 비선택 칸은 `{colors.mweb-tab-type01-off}` 이고 칸 사이에 흰 1px 가 들어간다 [src:26].

```text
background: {colors.mweb-tab-type01-off}
gap: 1px white
```

### mweb-home-tab-on

모바일 홈 가운데 세 칸 탭 줄(금융상품, 오늘의 환율, 새 소식)의 선택 칸은 `{colors.mweb-white}` 이다. 이 탭 줄은 노랑을 쓰지 않는다 [src:27].

```text
background: {colors.mweb-white}
```

### mweb-home-tab-off

같은 탭 줄의 비선택 칸은 `{colors.mweb-home-tab-off}` 에 흰 글자다 [src:27].

```text
background: {colors.mweb-home-tab-off}
text: {colors.mweb-white}
```

### mweb-select

셀렉트와 텍스트 입력이다. 셀렉트 높이 3.6rem(36px), 테두리 0.1rem `{colors.mweb-input-line}`, 반경 0, 입력 여백 0.5rem 1rem 0.7rem 이다. focus 는 바탕과 테두리가 `{colors.mweb-btn01}` 로 바뀐다(CSS 규칙, 포커스는 렌더로 재지 않음) [src:26].

```text
height: 36px, radius: 0px
border: 0.1rem {colors.mweb-input-line}
focus: background {colors.mweb-btn01}, border {colors.mweb-btn01}
```

### mweb-geo-bnr

모바일 홈의 추천 배너다. 바탕 `{colors.mweb-geo-bnr}`, 반경 12px, 여백 20px 이고 라벨은 `{colors.mweb-geo-bnr-label}` 에 흰 글자 12px, 반경 2px 다 [src:27].

```text
background: {colors.mweb-geo-bnr}
radius: 12px, padding: 20px
label: {colors.mweb-geo-bnr-label}, white 12px, radius 2px
```

### mweb-header

고정 헤더다. 높이 5.5rem(55px), 가운데 제목 `{typography.mweb-header-h1}`, 좌우 여백 0 6.5rem, 로고 12.7rem x 2.1rem 이다 [src:26].

```text
height: 55px, position: fixed
title: {typography.mweb-header-h1}
padding: 0 6.5rem
```

### mweb-branch-list

지점찾기 목록이다. 위 선 2px `{colors.mweb-branch-list-line}`, 이름 `{typography.mweb-branch-name}`, 칸 14px / 22.4px, 거리 숫자 `{colors.mweb-distance}` 다 [src:29].

```text
top-border: 2px {colors.mweb-branch-list-line}
name: {typography.mweb-branch-name}
distance: {colors.mweb-distance}
```

### app-account-card

앱 홈의 계좌 카드다. ≈ `{colors.app-card}` 흰 면에 로고 마크, 상품명, 계좌번호, 잔액과 숨김 토글, 이체 버튼, 최근 수취인 줄이 들어간다. 아이폰 그림에서 폭은 화면 폭의 ≈ 89.3%, 반경 ≈ 18~20px 로 읽힌다(스크린샷 판독, 추정값) [src:37].

```text
background: ≈ {colors.app-card}
width: ≈ 89.3% of screen (iPhone), radius ≈ 18~20px (store image px)
```

### app-transfer-button

계좌 카드 안의 이체 버튼이다. 채움 ≈ `{colors.app-transfer-button}`. 아이폰 그림에서 화면 폭의 ≈ 65.6%, 아이패드 그림에서 화면 폭의 ≈ 79.7% 를 차지하고 반경은 ≈ 2~3px 에서 ≈ 0 까지 묶음마다 다르다. pressed 값은 없다(스크린샷 판독, 추정값) [src:37].

```text
background: ≈ {colors.app-transfer-button}
width: ≈ 65.6% (iPhone) / ≈ 79.7% (iPad) of screen
```

### app-pale-button

연한 노랑 안내 버튼이다(문구 '맞춤제안 위해 투자성향 확인하기'). 바탕 ≈ `{colors.app-pale-button}`, 글자는 짙은 적갈색 계열이다. 이체 버튼과의 위계는 판정하지 못했다(스크린샷 판독, 추정값) [src:37].

```text
background: ≈ {colors.app-pale-button}
text: dark reddish brown (≈)
```

### app-chip-selected

분류 칩의 선택 상태다. 선택 ≈ `{colors.app-chip-selected}`, 비선택은 ≈ `oklch(0.976 0.001 286)` 이다(예 안전자산, 주식, 스크린샷 판독) [src:37].

```text
background: ≈ {colors.app-chip-selected}
unselected: ≈ oklch(0.976 0.001 286)
```

## Do's and Don'ts

**Do** 발행 색과 화면 색을 갈라 쓴다. 브랜드를 가리키는 자리(로고 주변, 인쇄물 재현)는 `{colors.kb-yellow-positive}`, `{colors.kb-yellow-negative}`, `{colors.kb-gray}` 를 쓰고, 은행 화면을 재현할 때는 그 화면의 관측 토큰(`{colors.web-wrap-menu}`, `{colors.mweb-btn01}` 등)을 쓴다 [src:1][src:19][src:26].

**Do** 웹 재현은 직각 상자와 1px 테두리, 회갈색 중립색으로 짠다 [src:17][src:19][src:21]. 반경은 0 을 기본으로 두고, 곡선은 검색 상자 알약(20px, 상품 검색 홀더는 23px) [src:18][src:21], 원형 단추(50%) [src:21], 떠 있는 작은 상자(4px) [src:19], 모바일 웹 추천 배너(12px) [src:27] 같은 자리에 둔다.

**Do** 갈래를 섞지 않는다. 데스크톱 웹(`web-`), 모바일 웹(`mweb-`), 앱(`app-`) 토큰은 서로 다른 화면에서 잰 값이므로 한 화면 안에서 섞어 쓰지 않는다 [src:26][src:37].

**Do** 버튼과 배너 문구는 명사형 마무리, 공지와 거절은 하십시오체로 쓴다 [src:38].

**Don't** 화면 노랑 하나를 브랜드 대표색이나 `primary` 로 올리지 않는다. 브랜드는 대표색을 지정해 발행하지 않았고, 화면 노랑은 자리마다 값이 다르다 [src:6][src:19].

**Don't** KB Gold, KB Silver 에 화면용 값을 지어 넣지 않는다. 발행된 것은 Pantone 번호와 사인용 시트 번호뿐이고 RGB, CMYK 가 없다 [src:2][src:4].

**Don't** 은행이 서빙하는 `KBText` 서체 파일을 불러와 쓰지 않는다. 서체 사용 조건이 공개되지 않았다 [src:5][src:31].

**Don't** Star-b 심볼과 시그니처를 다른 UI 에 장식으로 옮기거나 비례, 색을 바꾸지 않는다. 두 CI 모두 시그니처의 임의 변형을 금지한다 [src:3][src:6].

**Don't** 계좌 카드와 이체 버튼, 빠른조회 표, 지점찾기 같은 은행 업무 흐름과 KB고객언어 가이드의 문구, 'KB스타뱅킹' 같은 상품 이름을 그대로 가져오지 않는다. 빌릴 것은 직각 상자, 회갈색 중립색, 면 대비 같은 시각 처리뿐이다.

## Responsive Behavior

브랜드가 발행한 브레이크포인트는 없다. 아래에서 데스크톱과 모바일 웹 줄은 관측(미발행)이고, 앱 줄은 스토어 스크린샷 판독이다 [src:19][src:37].

| 폭 또는 갈래 | 관측 | Key Changes |
| --- | --- | --- |
| 데스크톱 웹 | 본문 980px 고정 [src:19] | 비반응형. 배경 띠는 100% 폭이고 가운데 틀 양옆이 비어 남는다 |
| 데스크톱 미디어 쿼리 | max-width 1100px, 1190px, 1280px [src:19][src:35] | 데스크톱 폭 안의 보정뿐, 모바일 구간 없음 |
| 375 폭으로 연 데스크톱 상품, 빠른조회 | viewport 메타 없음, 981px 가로 스크롤 [src:18][src:20] | 배치가 줄바꿈 없이 통째로 남는다 |
| 모바일 기기로 연 www, 개인뱅킹, 지점 | 별도 모바일 웹 주소로 이동 [src:17][src:21][src:22] | 반응형 전환이 아니라 별도 사이트 |
| 모바일 웹 | width=device-width, user-scalable=no [src:27], max-width 320, 359, 360, 375, 400px [src:26][src:28] | 작은 폭 안의 보정, 375 폭에서 scrollWidth 375 [src:27] |
| 앱 | 아이폰 그림 홈 타일 3열, 아이패드 그림 4열(스크린샷 판독) [src:37] | 아이패드 그림은 같은 화면들을 가로세로 3:4 비율로 보인다 |

인트로를 두 갈래로 견주면, 데스크톱의 가로 GNB 와 히어로에 걸친 빠른메뉴 띠(`{component.web-main-con1}`) [src:17][src:23] 가 모바일 웹에서는 가운데 로고 헤더, 세 칸 탭 줄(`{component.mweb-home-tab-on}`), 2열 금융상품 목록으로 바뀐다 [src:27][src:28]. 같은 지점 기능도 모바일(루트 10px, body `{colors.mweb-body}`)과 데스크톱(루트 16px, body `{colors.web-gray-5a}`)이 다른 화면이다 [src:22][src:29].

터치 대상은 모바일 웹 고정 헤더 55px, `{component.mweb-btn-login}` 45px, 셀렉트 36px, 홈 목록 줄 46px, 금융상품 줄 52px 다 [src:26][src:27]. 데스크톱의 누르는 요소는 `.btn-com` 35px, `.btn-action` 40px, `.btn-sub1` 27px 로 더 작다 [src:22][src:34].

## Known Gaps

- 웹은 받은 범위에서 다크 대응이 관측되지 않음(모바일 웹 CSS 에 .dark_mode 규칙 1개, 켜는 스크립트는 받지 않음), 앱은 판정 불가 [src:17][src:18][src:20][src:21][src:22][src:26][src:37]. 이 문서에는 다크 값이 없다.
- KB Gold(Pantone 872 C)와 KB Silver(Pantone 877 C)는 화면용 RGB, CMYK 가 발행되지 않아 값이 없다 [src:2].
- 대부분의 hover, focus, pressed 상태 값이 없다. 데스크톱 `.btn-com` 의 hover 규칙은 주석 처리돼 있고 입력 focus 값은 관측 기록에 없으며 [src:18][src:34], 앱의 pressed 상태와 하단 탭 선택 표시는 판정하지 못했다 [src:37].
- 앱 글꼴 이름은 판독할 수 없다 [src:37]. 은행 웹의 `KBText` 와 KB금융 본문체가 같은 서체인지 확인하는 문서도 없다.
- 로그인 뒤 화면은 보지 못했다. 웹 원본 캡처도 첫 화면 구간만이다.

## References

1. https://www.kbfg.com/kor/images/about/pc/img_colorsystem_main.jpg — KB금융그룹 CI 색상 체계 메인 컬러 그림(Pantone, CMYK, RGB 인쇄)
2. https://www.kbfg.com/kor/images/about/pc/img_colorsystem_sub.jpg — KB금융그룹 CI 색상 체계 서브 컬러 그림
3. https://www.kbfg.com/kor/about/corporate/ci.htm — KB금융그룹 CI 페이지(심볼, 색, 시그니처 규정)
4. https://oimg1.kbstar.com/img/about/2020/img_ci_about_03.gif — KB국민은행 CI 색 그림(Main Color, Sub Color)
5. https://www.kbfg.com/kor/about/corporate/font.htm — KB금융그룹 전용서체 KB금융체 페이지
6. https://omoney.kbstar.com/quics?page=C017667 — KB국민은행 CI 로고타입, 시그니처, 색 쪽
7. https://www.kbfg.com/common/jsp/fileDownUtil.jsp?filepath=/kor/about/__attachFile/KB_Signature_PNG.zip — KB금융그룹 시그니처 PNG 내려받기 묶음
8. https://www.kbfg.com/common/jsp/fileDownUtil.jsp?filepath=/kor/about/__attachFile/KB_SymbolMark_png.zip — KB금융그룹 심볼마크 PNG 내려받기 묶음
9. https://www.kbfg.com/common/jsp/fileDownUtil.jsp?filepath=/kor/about/__attachFile/KB_Logotype_PNG.zip — KB금융그룹 로고타입 PNG 내려받기 묶음
10. https://oimg1.kbstar.com/img/ocommon/2015/kb_logo.png — 은행 웹 머리 로고 그림(공식 CI 묶음 아님)
11. https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/14/63/cf/1463cfb0-bc2b-6306-e3e1-1a7c140504bc/AppIcon-0-0-1x_U007epad-0-9-0-85-220.png/1000x2200bb.png — KB스타뱅킹 앱 아이콘 그림(App Store)
12. https://www.kbfg.com/common/jsp/fileDownUtil.jsp?filepath=/kor/about/__attachFile/KB_SymbolMark_AI.zip — KB금융그룹 심볼마크 AI 원본 묶음
13. https://omoney.kbstar.com/quics?page=C017666 — KB국민은행 CI 심볼마크 쪽
14. https://oimg1.kbstar.com/img/about/2020/img_ci_about_01.gif — KB국민은행 CI 시그니처 간격 규정 그림
15. https://oimg1.kbstar.com/img/about/2020/img_ci_01.gif — KB국민은행 CI 심볼 격자 그림
16. https://omoney.kbstar.com/quics?page=C017668 — KB국민은행 CI 내려받기 쪽
17. https://www.kbstar.com/ — KB국민은행 데스크톱 웹 인트로
18. https://obank.kbstar.com/quics?page=C016528 — 개인뱅킹 금융상품 화면
19. https://oimg1.kbstar.com/css/ocommon/common_2018.css?20260416 — 데스크톱 공통 CSS(2018)
20. https://obank.kbstar.com/quics?page=C025255&cc=b028364:b028702 — 데스크톱 빠른조회 화면
21. https://obank.kbstar.com/quics?page=obank — 데스크톱 개인뱅킹 메인
22. https://omoney.kbstar.com/quics?page=C016505 — 데스크톱 지점안내 화면
23. https://www.kbstar.com/2018/css/intro_2018_content.css?20261112 — 데스크톱 인트로 CSS
24. https://oimg1.kbstar.com/css/ocommon/jquery-ui-1.8.16.css?201111202030 — jQuery UI CSS(데스크톱과 모바일 웹이 함께 불러온다)
25. https://oimg1.kbstar.com/css/ocommon/common.css?20260515 — 데스크톱 공통 CSS
26. https://oimg1.kbstar.com/css/osite/omweb_2017.css?20260702 — 모바일 웹 CSS(2017)
27. https://obank.kbstar.com/quics?page=omweb — 모바일 웹 홈(모바일 기기로 열 때의 화면, 데스크톱에서는 다른 주소로 넘어간다)
28. https://oimg1.kbstar.com/css/osite/omweb_2018.css?20250710 — 모바일 웹 CSS(2018)
29. https://obank.kbstar.com/quics?page=C021958 — 모바일 웹 지점찾기 화면(모바일 기기로 열 때의 화면, 데스크톱에서는 다른 주소로 넘어간다)
30. https://oimg1.kbstar.com/css/osite/obank_main_2017.css?20231113 — 개인뱅킹 메인 CSS(글꼴 스택 원문)
31. https://obank.kbstar.com/common/font/font.css?20181129 — 은행 웹 font.css(관측 근거로만 인용, 불러올 웹폰트 출처가 아님)
32. https://www.kbstar.com/font/font.css?20181120 — 은행 웹 font.css(관측 근거로만 인용, 불러올 웹폰트 출처가 아님)
33. https://oimg1.kbstar.com/css/osite/obank_2018_main.css — 개인뱅킹 메인 CSS(2018)
34. https://oimg1.kbstar.com/css/osite/obank_2018_common.css?20260531 — 개인뱅킹 공통 CSS(버튼 규칙)
35. https://oimg1.kbstar.com/css/ocommon/common_2015.css?20260611 — 데스크톱 공통 CSS(2015)
36. https://oimg1.kbstar.com/css/ocommon/common_2018_design.css?20240607 — 데스크톱 디자인 CSS(2018)
37. https://apps.apple.com/kr/app/id373742138 — KB스타뱅킹 App Store 페이지(스크린샷 판독의 원본)
38. https://kbthink.com/content/dam/tam-dcp-cms/kbcontent/%EB%B8%8C%EB%9E%9C%EB%93%9C-%EC%8A%A4%ED%86%A0%EB%A6%AC/kb%EA%B3%A0%EA%B0%9D%EC%96%B8%EC%96%B4/KB%EA%B3%A0%EA%B0%9D%EC%96%B8%EC%96%B4%20%EA%B0%80%EC%9D%B4%EB%93%9C_v1.5.pdf — KB고객언어 가이드 PDF
39. https://kbthink.com/content/tam-dcp-cms/main/customerservice/kbcommunication.html — KB고객언어 가이드 소개 페이지
