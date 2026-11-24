# toss.md 기초 토큰 대 TDS Mobile 대조표

대조한 md: `services/toss.md` (워크트리 `preview-structure-base`, frontmatter 72~201행과 본문 278~341행). `colors:` 는 몫 밖이라 건드리지 않았다.

## 근거를 다시 찍는 법

- 배포물: `@toss/tds-mobile` 2.5.1 의 `dist/esm/index.js` 와 `index.d.ts`.
- **오프셋은 바이트가 아니라 JS 문자열 인덱스다.** `fs.readFileSync(파일, 'utf8')` 로 읽은 문자열의 `indexOf` 값이고, 그 문자열 길이는 1,156,674 다(파일 크기 1,156,908 바이트와 다르다).
- 확인 명령: `node <scratchpad>/tds-audit/at.js <오프셋> <길이>` (d.ts 는 환경 변수 `TDSFILE` 로 경로를 바꾼다). 표의 `@숫자` 가 그 오프셋이다. `d.ts@숫자` 는 `index.d.ts` 의 오프셋이다.
- 검색은 축약 코드의 표기에 맞췄다(`.22,.61,.36,1`, `.3`, `1e3` 처럼 앞자리 0 이 없다). "0건" 은 `ci.js` 로 대소문자를 무시하고 `index.js` 와 `index.d.ts` 양쪽에서 센 결과다. d.ts 에만 나오는 `letter-spacing`, `tabular-nums`, `elevation`, `border-left` 는 모두 함께 묶인 CSS 타입 정의(csstype)의 속성 이름이고 TDS 토큰이 아니다.
- **컴포넌트 소속을 가린 법**: export 목록(@1151958)의 지역 이름 156개가 정의된 자리를 찾고, 오프셋이 어느 두 정의 사이에 놓이는지로 가렸다(이 번들은 스타일 객체가 그것을 쓰는 컴포넌트 정의 바로 앞에 모여 있다). 표에서 "구간" 이라고 적은 것이 이 방법으로 가린 것이고, 조각 안에 이름이 직접 보이는 경우(`--toast-border-radius`, `::-webkit-slider-thumb` 등)보다 약한 근거다.
- **다시 찍은 범위**: 표에 적은 `@오프셋 조각` 짝 전부와 "N건" 개수 전부를 같은 폴더의 `verify.js`, `verify2.js`, `verify3.js`, `verify4.js` 로 다시 찍어 맞췄다(`verify4.js` 가 짝마다 그 오프셋 둘레에 조각이 있는지 대조한다). 조각 대조는 오프셋 앞 40자부터 뒤 600자 사이에 조각이 있는지를 보므로 "그 둘레에 있다" 까지만 보증한다. 문서 근거 가운데 `foundation/typography/` 의 표와 파운데이션 메뉴(링크가 `foundation/colors/`, `foundation/typography/` 둘뿐이고 `foundation/spacing/`, `radius/`, `shadow/`, `motion/` 은 404)는 2026-11-24 에 다시 읽어 맞췄다. `components/paragraph/`, `border/`, `skeleton/`, `loader/`, `start/` 는 처음 읽은 내용 그대로이고 다시 읽지 않았다.
- 문서: `https://tossmini-docs.toss.im/tds-mobile/` 를 내장 브라우저의 `get_page_text` 로 읽었다. 왼쪽 메뉴의 파운데이션 항목은 Colors 와 Typography 둘뿐이다(Spacing, Radius, Shadow, Motion 페이지 없음). 읽은 페이지: `foundation/typography/`, `foundation/colors/`(낱말 찾기만), `start/`, `components/paragraph/`, `components/border/`, `components/skeleton/`, `components/loader/`.

## 판정 열쇠 (세는 단위는 표의 행 하나)

1. **타이포는 속성별로 쪼갰다.** TDS 는 단계가 글자 크기 하나로 정해지고(`t1`~`t7`, `st1`~`st13`, 30px 부터 11px 까지 1px 간격 20단계), 줄 높이는 크기의 함수이며(`b5` 표 @44620), 굵기는 단계와 따로 고르는 축이다(@297887). md 는 역할 이름 하나에 네 속성을 묶는다.
2. **글자 크기**: TDS 가 그 크기를 같은 쓰임으로 적은 곳이 있을 때만 일치다(문서 표의 Usage 칸이 제목이나 본문이라고 적었거나, 그 쓰임의 컴포넌트가 그 단계를 쓴다). 크기가 사다리의 한 단계와 같기만 하면 침묵으로 두고 같은 단계 이름을 적었다. 11~30px 의 모든 정수가 단계라서 "사다리에 있다" 만으로는 같은 쓰임이라는 근거가 못 된다. 문서 표에서 Usage 칸이 빈 행이 위 행과 병합된 칸인지는 `get_page_text` 로는 알 수 없었다.
3. **줄 높이**: 같은 글자 크기의 TDS 줄 높이(px)를 비율로 바꿔 맞댔다. 크기가 TDS 자신의 열쇠라서 다른 쓰임을 빌려 온 것이 아니다. 버튼 라벨(`label-*`)만은 Button 컴포넌트가 따로 정한 줄 높이와 맞댔다.
4. **굵기**: TDS 는 단계와 굵기를 묶지 않으므로 역할별 굵기는 침묵이다. 본문 역할은 Paragraph 의 기본 굵기(regular), 버튼 라벨은 Button 의 굵기와 맞댔다.
5. **TDS 에 선언이 없는 경우**: md 가 양의 값을 적었으면 침묵(비고에 "선언 없음 확인"), md 가 "없음" 이나 0 을 적었으면 일치(부재 확인)로 적었다.
6. 스프링 이징의 지속 시간은 실행 중에 강성과 감쇠로 계산되는 값이라 숫자로 적지 않았다(배포물 코드를 실행하지 않았다).
7. 본문 343행부터의 `## Components` 는 몫 밖이다. 313행의 버튼 라운드 문장과 286행의 버튼 글자 문장만 봤고, `label-*` 역할이 버튼 라벨이라는 것을 정하는 데에만 353~356행의 표를 읽었다.
8. 수치나 규칙이 아닌 내력 서술(280행의 서체 제작 경위, 292행의 글자 수, 282행의 라이선스)은 맞대지 않았다.

## 1. frontmatter `typography:` (73~168행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 73~168 | 역할 이름 16개: `display-1`, `display-2`, `h1`~`h4`, `title-1`, `title-2`, `body-1`~`body-3`, `label-l`, `label-m`, `label-s`, `caption`, `caption-s` | 단계 이름은 `t1`~`t7`, `st1`~`st13` 20개뿐이고 역할 이름이 없다 | @51044 `Ro=["t1","st1","st2","st3","t2","st4",...]`, @51172 `$r=[30,29,28,...,12,11]`. 문서 `foundation/typography/` 표의 Token 열은 Typography 1~7, sub Typography 1~13 | TDS 침묵 |
| 74, 80, 86, 92, 98, 104, 110, 116, 122, 128, 134, 140, 146, 152, 158, 164 | `fontFamily`(16개 역할 모두 같은 값): `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", "Apple SD Gothic Neo", "Noto Sans KR", Roboto, "Helvetica Neue", Arial, sans-serif` | `'Toss Product Sans', 'Tossface', 'SF Pro KR', 'SF Pro Display', 'SF Pro Icons', -apple-system, BlinkMacSystemFont, 'Basier Square', 'Apple SD Gothic Neo', Roboto, 'Noto Sans KR', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'` | @142270 전역 스타일 `body { font-family: 'Toss Product Sans', 'Tossface', ...`. `pretendard` 는 js, d.ts 모두 0건 | 다름 |
| 75 | `display-1.fontSize` 56px | 기본 사다리 최대 30px(`t1`), 더 큰 텍스트 배율에서도 최대 42px. 56px 글자 크기 없음 | @51172 `$r=[30,29,...]`, @51559 `QTe=[42,42,41,...]`(배율별 상한). `56px` 는 js 1건(@618425)이고 Button 의 `minHeight` 다 | TDS 침묵 |
| 76 | `display-1.fontWeight` 700 | 단계와 굵기를 묶지 않는다. 굵기 축에 `bold` 700 이 있다 | @297887 `CIe={regular:{[fr]:400},medium:{[fr]:500},semibold:{[fr]:600},bold:{[fr]:700}}` | TDS 침묵 |
| 77 | `display-1.lineHeight` 1.30 | 56px 항목 없음(줄 높이 표는 11~42px) | @44620 `b5={11:{lineHeight:16.5,fontSize:11},...`, 끝 @45593 `42:{lineHeight:52,fontSize:42}}` | TDS 침묵 |
| 78 | `display-1.letterSpacing` -0.005em | 자간 선언 없음 | `letterSpacing` js 3건: @710732 `letterSpacing:"inherit"`(버튼 초기화) 하나와 SVG 속성 이름 목록 둘(@12252, @1145984). `letter-spacing` 0건. 문서 `foundation/typography/` 에 자간 언급 없음 | TDS 침묵 |
| 81 | `display-2.fontSize` 40px | 기본(100%) 사다리에 40px 없음. 40 은 더 큰 텍스트 160% 배율에서 `t1` 이 갖는 값이다 | @52316 `A11y_Medium:[40,39,38,...]`. 문서 `foundation/typography/` iOS 표의 Typography 1 행 160% 칸 40 | TDS 침묵 |
| 82 | `display-2.fontWeight` 700 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 83 | `display-2.lineHeight` 1.20 (40px 기준 48px) | 40px 글자의 줄 높이 50px, 비율 1.25. 40px 는 더 큰 텍스트 배율에서만 쓰인다 | @45531 `40:{lineHeight:50,fontSize:40}` | 다름 |
| 84 | `display-2.letterSpacing` -0.020em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 87 | `h1.fontSize` 28px | 28px 는 `st2` 단계. 문서 표의 그 행은 Usage 칸이 비어 있다 | @51044, @51172(3번째 값 28). 문서 표 sub Typography 2: 28, 37 | TDS 침묵 |
| 88 | `h1.fontWeight` 700 | 단계와 굵기를 묶지 않는다. 참고: Post 컴포넌트의 `h1`~`h4` 는 `bold` 지만 크기 단계가 다르다(h1 `t2` 26px, h2 `t3` 22px, h3 `st8` 19px, h4 `t5` 17px) | @297887, @603778 `cHe={h1:"t2",h2:"t3",h3:"st8",h4:"t5"}` | TDS 침묵 |
| 89 | `h1.lineHeight` 1.30 (36.4px) | 28px 글자의 줄 높이 37px, 비율 1.321 | @45159 `28:{lineHeight:37,fontSize:28}` | 다름 |
| 90 | `h1.letterSpacing` -0.020em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 93 | `h2.fontSize` 24px | `st5` 24px. 문서 표가 Usage 를 조금 큰 제목으로 적는다 | 문서 `foundation/typography/` 표 sub Typography 5: 24, 33, 조금 큰 제목. @51172(7번째 값 24) | 일치 |
| 94 | `h2.fontWeight` 700 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 95 | `h2.lineHeight` 1.30 (31.2px) | 24px 글자의 줄 높이 33px, 비율 1.375 | @45035 `24:{lineHeight:33,fontSize:24}` | 다름 |
| 96 | `h2.letterSpacing` -0.020em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 99 | `h3.fontSize` 22px | `t3` 22px. 문서 표가 Usage 를 일반 제목으로 적는다 | 문서 표 Typography 3: 22, 31, 일반 제목. @51172(9번째 값 22) | 일치 |
| 100 | `h3.fontWeight` 700 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 101 | `h3.lineHeight` 1.30 (28.6px) | 22px 글자의 줄 높이 31px, 비율 1.409 | @44973 `22:{lineHeight:31,fontSize:22}` | 다름 |
| 102 | `h3.letterSpacing` -0.015em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 105 | `h4.fontSize` 20px | `t4` 20px. 문서 표가 Usage 를 작은 제목으로 적는다 | 문서 표 Typography 4: 20, 29, 작은 제목. @51172(11번째 값 20) | 일치 |
| 106 | `h4.fontWeight` 700 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 107 | `h4.lineHeight` 1.35 (27px) | 20px 글자의 줄 높이 29px, 비율 1.45. 참고: 1.35 는 TDS 에 `line-height-s` 로 따로 있고 Post 제목과 ListRow 글자가 쓴다 | @44911 `20:{lineHeight:29,fontSize:20}`. 참고 @602732 `rHe={"line-height-xs":"1.252","line-height-s":"1.35","line-height-m":"1.5"}` | 다름 |
| 108 | `h4.letterSpacing` -0.015em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 111 | `title-1.fontSize` 18px | 18px 는 `st9` 단계. 문서 표의 그 행은 Usage 칸이 비어 있다 | 문서 표 sub Typography 9: 18, 27. @51172(13번째 값 18) | TDS 침묵 |
| 112 | `title-1.fontWeight` 600 | 단계와 굵기를 묶지 않는다. 굵기 축에 `semibold` 600 이 있다 | @297887 | TDS 침묵 |
| 113 | `title-1.lineHeight` 1.45 (26.1px) | 18px 글자의 줄 높이 27px, 비율 1.5 | @44849 `18:{lineHeight:27,fontSize:18}` | 다름 |
| 114 | `title-1.letterSpacing` -0.010em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 117 | `title-2.fontSize` 17px | 17px 는 `t5` 단계인데 문서 표의 Usage 는 일반 본문이다(타이틀 쓰임이 아니다) | 문서 표 Typography 5: 17, 25.5, 일반 본문 | TDS 침묵 |
| 118 | `title-2.fontWeight` 600 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 119 | `title-2.lineHeight` 1.45 (24.65px) | 17px 글자의 줄 높이 25.5px, 비율 1.5 | @44816 `17:{lineHeight:25.5,fontSize:17}` | 다름 |
| 120 | `title-2.letterSpacing` -0.010em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 123 | `body-1.fontSize` 17px | `t5` 17px, 문서 표 Usage 일반 본문 | 문서 표 Typography 5: 17, 25.5, 일반 본문. @51172(14번째 값 17) | 일치 |
| 124 | `body-1.fontWeight` 400 | 글자 기본 굵기 regular 400 | @298332 `fontWeight:l="regular"`(Paragraph.Text 의 인자 기본값), @297887 `CIe={regular:{[fr]:400}`, 전역 @142638 `font-weight: 400;`. 문서 `components/paragraph/` 의 속성 표도 fontWeight 기본값을 'regular' 로 적는다 | 일치 |
| 125 | `body-1.lineHeight` 1.50 | 17px 글자의 줄 높이 25.5px, 비율 1.5 | @44816 | 일치 |
| 126 | `body-1.letterSpacing` -0.005em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 129 | `body-2.fontSize` 15px | `t6` 15px, 문서 표 Usage 작은 본문 | 문서 표 Typography 6: 15, 22.5, 작은 본문. @51172(16번째 값 15) | 일치 |
| 130 | `body-2.fontWeight` 400 | 글자 기본 굵기 regular 400 | 124행과 같은 근거 | 일치 |
| 131 | `body-2.lineHeight` 1.50 | 15px 글자의 줄 높이 22.5px, 비율 1.5 | @44752 `15:{lineHeight:22.5,fontSize:15}` | 일치 |
| 132 | `body-2.letterSpacing` -0.005em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 135 | `body-3.fontSize` 13px | 13px 는 `t7` 단계인데 문서 표의 Usage 는 본문이 아니라 안 읽어도 됨 이다 | 문서 표 Typography 7: 13, 19.5, 안 읽어도 됨 | TDS 침묵 |
| 136 | `body-3.fontWeight` 400 | 글자 기본 굵기 regular 400 | 124행과 같은 근거 | 일치 |
| 137 | `body-3.lineHeight` 1.50 | 13px 글자의 줄 높이 19.5px, 비율 1.5 | @44688 `13:{lineHeight:19.5,fontSize:13}` | 일치 |
| 138 | `body-3.letterSpacing` 0em | 자간 선언 없음(브라우저 기본 normal). Paragraph.Text 스타일에 `letterSpacing` 키가 없다 | 78행과 같은 검색. Paragraph.Text 스타일 @297966 `wIe=bIe({verticalAlign:"middle",maxWidth:"100%",margin:0,padding:0,color:R(fo,b.grey900),fontSize:R(he.text.fontSize),lineHeight:R(he.text.lineHeight),fontWeight:R(fr),position:"relative",overflowWrap:"anywhere",wordBreak:"keep-all",hyphens:"auto"})`(키 전부) | 일치 |
| 141 | `label-l.fontSize` 17px (286행과 353~354행이 XL, L 버튼 라벨로 쓴다) | Button `xlarge`, `large` 의 글자 크기 `t5` 17px | @618321 `x$e={xlarge:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"16px"`, @618499 `large:{[xe.fontSize]:ce.t5.fontSize` | 일치 |
| 142 | `label-l.fontWeight` 700 | Button 은 크기와 상관없이 `fontWeight:"600"` | @619573 `position:"relative",fontWeight:"600",WebkitFontSmoothing` | 다름 |
| 143 | `label-l.lineHeight` 1.25 | Button 의 줄 높이 1.252 (`line-height-xs`). 차이 0.002 | @620253 `lineHeight:Me("line-height-xs")`, @602732 `"line-height-xs":"1.252"` | 다름 |
| 144 | `label-l.letterSpacing` -0.005em | 자간 선언 없음. Button 스타일에 `letterSpacing` 키가 없다 | 78행과 같은 검색. Button 스타일 @619500~620400 | TDS 침묵 |
| 147 | `label-m.fontSize` 15px (355행이 M 버튼 라벨로 쓴다) | Button `medium` 의 글자 크기 `t6` 15px | @618671 `medium:{[xe.fontSize]:ce.t6.fontSize,[xe.borderRadius]:"10px"` | 일치 |
| 148 | `label-m.fontWeight` 600 | Button `fontWeight:"600"` | @619573 | 일치 |
| 149 | `label-m.lineHeight` 1.25 | Button 의 줄 높이 1.252. 차이 0.002 | @620253, @602732 | 다름 |
| 150 | `label-m.letterSpacing` -0.005em | 자간 선언 없음 | 78행과 같은 검색 | TDS 침묵 |
| 153 | `label-s.fontSize` 13px (356행이 S 버튼 라벨로 쓴다) | Button `small` 의 글자 크기 `t7` 13px | @618844 `small:{[xe.fontSize]:ce.t7.fontSize,[xe.borderRadius]:"8px"` | 일치 |
| 154 | `label-s.fontWeight` 600 | Button `fontWeight:"600"` | @619573 | 일치 |
| 155 | `label-s.lineHeight` 1.25 | Button 의 줄 높이 1.252. 차이 0.002 | @620253, @602732 | 다름 |
| 156 | `label-s.letterSpacing` 0em | 자간 선언 없음(브라우저 기본 normal) | 78행과 같은 검색 | 일치 |
| 159 | `caption.fontSize` 12px | 12px 는 `st12` 단계. 문서 표의 그 행은 Usage 칸이 비어 있다 | 문서 표 sub Typography 12: 12, 18. @51172(19번째 값 12) | TDS 침묵 |
| 160 | `caption.fontWeight` 500 | 단계와 굵기를 묶지 않는다. 굵기 축에 `medium` 500 이 있다 | @297887 | TDS 침묵 |
| 161 | `caption.lineHeight` 1.40 (16.8px) | 12px 글자의 줄 높이 18px, 비율 1.5 | @44657 `12:{lineHeight:18,fontSize:12}` | 다름 |
| 162 | `caption.letterSpacing` 0em | 자간 선언 없음(브라우저 기본 normal) | 78행과 같은 검색 | 일치 |
| 165 | `caption-s.fontSize` 11px | 11px 는 `st13` 단계. 문서 표의 Usage 는 아예 안읽어도 됨 이고 캡션이라고 적지 않는다 | 문서 표 sub Typography 13: 11, 16.5, 아예 안읽어도 됨 | TDS 침묵 |
| 166 | `caption-s.fontWeight` 500 | 단계와 굵기를 묶지 않는다 | @297887 | TDS 침묵 |
| 167 | `caption-s.lineHeight` 1.40 (15.4px) | 11px 글자의 줄 높이 16.5px, 비율 1.5 | @44624 `11:{lineHeight:16.5,fontSize:11}` | 다름 |
| 168 | `caption-s.letterSpacing` 0em | 자간 선언 없음(브라우저 기본 normal) | 78행과 같은 검색 | 일치 |

## 2. frontmatter `spacing:` (169~181행)

TDS 에는 간격 토큰 사다리가 없다. `Spacing` 이라는 컴포넌트는 있지만 `size` 로 아무 숫자나 문자열을 받는 빈 상자다. 컴포넌트 안의 간격은 리터럴로 적혀 있고 4 의 배수가 아닌 값도 흔하다(Chip 좌우 여백 11px, 13px @672517. TextField 라벨 아래 6px @980970. Button `medium` 최소 높이 38px @618671).

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 170 | `space-1` 4px | 간격 토큰 없음 | `space-[0-9]+`, `spacing[0-9]+`, `spacing\.` 가 js, d.ts 모두 0건. @1151757 `A0t=E0t(function({direction:t="vertical",size:r`, d.ts@490493 `size: string` 뒤에 세로 막대와 `number` 가 이어지는 Spacing 의 속성 타입. 문서 파운데이션 메뉴는 Colors, Typography 둘 | TDS 침묵 |
| 171 | `space-2` 8px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 172 | `space-3` 12px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 173 | `space-4` 16px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 174 | `space-5` 20px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 175 | `space-6` 24px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 176 | `space-7` 28px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 177 | `space-8` 32px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 178 | `space-10` 40px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 179 | `space-12` 48px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 180 | `space-16` 64px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |
| 181 | `space-20` 80px | 간격 토큰 없음 | 170행과 같은 검색 | TDS 침묵 |

## 3. frontmatter `rounded:` (182~191행)

TDS 에는 반지름 토큰 사다리가 없다(`radius-(xs/s/m/l/xl/2xl/full)` 가 js, d.ts 모두 0건). 반지름은 컴포넌트마다 리터럴로 적혀 있고, `borderRadius` 에 바로 적힌 숫자와 문자열이 55가지 200건이다(`verify.js` 의 `borderRadius\]?:(?:"[^"]*"|[0-9.]+)`. 1px 부터 500 까지이고 5, 7, 9, 11, 13, 15, 19px 같은 값이 섞여 있다). md 의 이름은 TDS 에 없으므로, 주석에 적힌 쓰임의 컴포넌트와 맞댔다.

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 183 | `radius-xs` 4px, 쓰임 small badges | Badge 의 반지름은 크기별 9px(`xsmall`), 11px(`small`), 12px(`medium`), 13px(`large`). 4px 가 아니다 | @602426 `eHe={xsmall:"t5",small:"t3",medium:"t2",large:"t1"}` 가 고른 단계(17, 22, 26, 30px)의 배지 표 @46111 `XTe={11:{fontSize:9,padding:[3,6],borderRadius:8}`, @46389 `17:{fontSize:10,padding:[3,7],borderRadius:9}`, @46999 `30:{fontSize:14,padding:[4,8],borderRadius:13}`. 표 전체의 최소 반지름이 8 이다 | 다름 |
| 184 | `radius-s` 8px, 쓰임 inline tags | Tag 컴포넌트 없음 | export 목록 @1151958 에 Tag 없음(이름에 Tag 가 든 export 0개). `Tag` 키는 약관 컴포넌트의 하위 항목 하나뿐이다 @322845 `Tag:SW` | TDS 침묵 |
| 185 | `radius-m` 12px, 쓰임 text inputs | TextField `box` 변형의 반지름 14px. `line`, `big`, `hero` 변형은 반지름 없이 밑줄이다 | @974226 `Zlt=Ffe({display:"flex",alignItems:"center",borderRadius:"14px",border:`1px solid ${H.greyOpacity100}`` | 다름 |
| 186 | `radius-l` 14px, 쓰임 L button (48px) | Button `large`: 반지름 14px, 최소 높이 48px | @618499 `large:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"14px",[xe.minWidth]:"80px",[xe.minHeight]:"48px"` | 일치 |
| 187 | `radius-xl` 16px, 쓰임 XL button (56px) | Button `xlarge`: 반지름 16px, 최소 높이 56px | @618321 `x$e={xlarge:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"16px",[xe.minWidth]:"96px",[xe.minHeight]:"56px"` | 일치 |
| 187 | `radius-xl` 16px, 쓰임 cards | Card 컴포넌트 없음 | export 목록 @1151958. 이름에 Card 가 든 export 는 `ChipItemLeftCard` 하나다(@1152413, 칩의 하위 항목) | TDS 침묵 |
| 188 | `radius-2xl` 20px, 쓰임 sheets | BottomSheet 본체 반지름 28px | @650249 `Nze=Ax({position:"relative",userSelect:"none",backgroundColor:b.layeredBackground,borderRadius:"28px",width:"calc(100% - 20px)"` | 다름 |
| 188 | `radius-2xl` 20px, 쓰임 dialogs | Modal 본문(AlertDialog, ConfirmDialog 가 쓴다) 반지름 24px | @680372 `backgroundColor:b.floatBackground,borderRadius:"24px"` | 다름 |
| 189 | `radius-3xl` 24px, 쓰임 big cards / sections | Card, Section 컴포넌트 없음 | export 목록 @1151958 | TDS 침묵 |
| 190 | `radius-4xl` 32px, 쓰임 hero blocks | hero 블록 컴포넌트 없음. 32px 반지름 리터럴 0건 | export 목록 @1151958 에 이름에 Hero, Section 이 든 것 없음. 이 절 머리말의 `borderRadius` 리터럴 55가지에 32 없음(30 대는 38 하나, 그 위는 40, 50, 100, 500) | TDS 침묵 |
| 191 | `radius-full` 999px, 쓰임 chips, pills, capsules | Chip `pill` 모양(기본값)의 반지름 999px | @672517 `IYe={pill:{small:{[U.borderRadius]:"999px"`, 기본값 @665892 `shape:o="pill"` | 일치 |

## 4. frontmatter `elevation:`, `opacity:`, `fonts:` (192~201행)

TDS 에는 그림자 프리셋이 셋 있다: `tiny`(y 1, 번짐 3, `greyOpacity200`), `weak`(y 2, 번짐 30, `greyOpacity200`), `medium`(y 16, 번짐 60, `greyOpacity300`) @784705 `Gl={tiny:{offsetY:1,radius:3,lightColor:H.greyOpacity200,...`. 색 값은 `@toss/tds-colors` 의 `colors.css`: `--greyOpacity200:rgba(0,27,55,0.1)`, `--greyOpacity300:rgba(0,29,58,0.18)`. md 의 `shadow-1/2/3/toast` 이름은 js, d.ts 모두 0건이다.

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 193 | `shadow-1` (menu): `0 1px 2px navy/0.04, 0 1px 1px navy/0.04` | Menu.Dropdown 라이트: `0px 16px 60px rgba(0,27,55,0.1)` (프리셋 `medium` 의 y 와 번짐에 `greyOpacity200`) | @790043 `[ED]:`0px ${Gl.medium.offsetY}px ${Gl.medium.radius}px ${H.greyOpacity200}``, 변수 이름 `--menu-dropdown-box-shadow` @789924 | 다름 |
| 194 | `shadow-2` (tooltip): `0 4px 12px navy/0.06, 0 1px 2px navy/0.04` | Tooltip 라이트: `0px 16px 60px 0px rgba(0,29,58,0.18)` (말꼬리가 끝에 붙는 배치에서는 x 가 ±20px, y 가 6px) | Tooltip 구간 @943781 `Zue=Eat(function({size:t,colorScheme:r,shadowDirection:o,clipToEnd:n="none"`(바로 뒤에 `c=n==="none"?16:6,u=Pat[n]`, `Pat={none:0,left:-20,right:20}`), @944023 `boxShadow:`${u}px ${c}px 60px 0px ${r==="light"?H.greyOpacity300:H.greyOpacity900}``. 같은 꼴이 Slider 와 FullTooltip 정의 사이에도 있다 @933924 `boxShadow:`0px ${g?"-16px":"16px"} 60px 0px` | 다름 |
| 195 | `shadow-3` (dialog): `0 12px 32px navy/0.10, 0 2px 6px navy/0.06` | Modal 본문 스타일에 `boxShadow` 선언 없음(뒤에 어두운 막만 깐다). 선언 없음 확인 | Modal 본문 스타일 @680186 `moe=doe({position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:1e4,overflow:"hidden",width:"calc(100vw - 64px)",maxWidth:"320px",maxHeight:"calc(100vh - 160px)",backgroundColor:b.floatBackground,borderRadius:"24px"`(키 전부이고 `boxShadow` 키가 없다). js 의 `boxShadow:` 19건 가운데 Modal 정의(@680452)부터 AlertDialog 정의(@693012)까지에 든 것은 @690651 `boxShadow:"0 0 0 0 transparent"` 하나이고, 반지름 8px 인 투명한 누름 요소의 초기화 값이다(@690524 `EUe=oo({outline:"none"`) | TDS 침묵 |
| 196 | `shadow-toast`: `0 8px 24px navy/0.16` | Toast 라이트: `0 2px 30px rgba(0,27,55,0.1)` | @494754 `boxShadow:`0 2px 30px ${H.greyOpacity200}``(같은 객체에 `borderRadius:R(hT)`, `hT="--toast-border-radius"`) | 다름 |
| 198 | `disabled-opacity` 0.30 (값) | 비활성 불투명도 .3: Button `fill` 변형의 버튼 전체, Button `weak` 변형의 글자, Switch 전체 | @619405 `R$e=e=>e.variant==="fill"?.3:1`, @619343 `w$e=e=>e.variant==="fill"?1:.3`, @960371 `"&:has(input:disabled)":{opacity:.3` | 일치 |
| 198 | `disabled-opacity` 의 주석 "컴포넌트 전체 노드에 적용" | Button 안에서 변형에 따라 갈린다: `fill` 은 전체에 .3, `weak` 은 전체 1 에 글자만 .3. TextField 는 불투명도가 아니라 색을 바꾼다 | @619405(전체 쪽 값: `fill` 이면 .3, 아니면 1), @619343(글자 쪽 값: `fill` 이면 1, 아니면 .3), TextField @974126 `disabled:{[Jv]:b.grey400,[ey]:b.grey400,[ty]:b.grey200` | 다름 |
| 199 | `tds-disabled-opacity` 0.30 (값) | 198행과 같다 | 198행과 같은 근거 | 일치 |
| 199 | `tds-disabled-opacity` (이름) | 그 이름의 토큰 없음 | `disabled-opacity`, `disabledOpacity` 가 js, d.ts 모두 0건 | TDS 침묵 |
| 201 | `font-family-emoji`: "Tossface" (이름) | 전역 글꼴 스택의 둘째 자리에 'Tossface' 가 있다 | @142270 `font-family: 'Toss Product Sans', 'Tossface', 'SF Pro KR', ...` | 일치 |
| 201 | `font-family-emoji` (이모지 전용이라는 쓰임) | 배포물과 문서가 Tossface 의 쓰임을 적지 않는다. 스택 끝에는 'Apple Color Emoji' 등 이모지 글꼴이 따로 있다 | `tossface` js 1건(@142305), d.ts 0건. 문서 `foundation/typography/` 에 글꼴 이름 언급 없음 | TDS 침묵 |

## 5. 본문 `## Typography` (278~301행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 280 | 본문과 UI 서체는 Toss Product Sans | 전역 글꼴 스택의 첫째가 'Toss Product Sans' | @142270 | 일치 |
| 282 | Pretendard 가 대체 서체로 명시돼 있다 | Pretendard 언급 없음 | `pretendard` js, d.ts 모두 0건. 문서 `foundation/typography/`, `start/` 에 없음 | TDS 침묵 |
| 286 | display 는 Bold 700 에 -1.5%~-2% 트래킹 | display 역할 없음, 자간 선언 없음 | 73~168행 역할 이름 행, 78행과 같은 검색 | TDS 침묵 |
| 286 | 본문은 15px Regular + 1.5 line-height | `t6` 15px, 줄 높이 22.5px(1.5), 기본 굵기 regular. 참고: 문서는 15px 를 작은 본문, 17px 를 일반 본문으로 적는다 | @44752, 문서 표 Typography 6: 15, 22.5, 작은 본문. 124행과 같은 굵기 근거 | 일치 |
| 286 | 버튼 XL, L 의 글자 크기 17px | Button `xlarge`, `large` 는 `t5` 17px | @618321, @618499 | 일치 |
| 286 | 버튼 XL, L 의 굵기 Bold 700 | Button `fontWeight:"600"` (모든 크기) | @619573 | 다름 |
| 286 | 버튼 M, S 는 Semibold 15~13px | Button `medium` `t6` 15px, `small` `t7` 13px, 굵기 600 | @618671, @618844, @619573 | 일치 |
| 286 | 카드 타이틀 `title-1`(18/600), 카드 본문 `body-2`(15/400) | Card 컴포넌트 없음 | export 목록 @1151958 | TDS 침묵 |
| 296 | `{fonts.font-family-emoji}` 는 Unicode v14.0 전체를 덮는 자체 이모지 글꼴이고 TTF, OTF, WOFF, WOFF2 로 제공된다 | 배포물에는 글꼴 이름만 있다(글꼴 파일, `@font-face`, 덮는 범위 없음) | `ci.js` 로 셈: `tossface` js 1건(@142305), d.ts 0건. `font-?face` js 0건(d.ts 7건은 csstype 정의). `\.woff`, `\.ttf`, `\.otf` js, d.ts 모두 0건. 문서 `foundation/typography/` 에 글꼴 이름 언급 없음 | TDS 침묵 |
| 290~292, 298~301 | 금융 숫자는 `tabular-nums`, 강조는 `proportional-nums` (`font-feature-settings`) | 숫자 폭 선언 없음 | `tabular`, `proportional-nums`, `font-feature`, `fontFeature`, `fontVariantNumeric` 가 js 0건(d.ts 의 것은 csstype 정의). 문서 `foundation/typography/` 에 없음 | TDS 침묵 |

## 6. 본문 `## Spacing` (303~307행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 305 | 베이스 단위 4px, 토큰 사다리 4~80px 12단계 | 간격 토큰 사다리 없음 | 170행과 같은 검색 | TDS 침묵 |
| 307 | 화면 outer padding 24px | 화면 여백 규칙을 적은 곳 없음. 참고(규칙이 아니라 관찰): ListRow 좌우 여백 기본 24px, Border `padding24`, Post 문단 `0 24px 24px` | @782347 `paddingLeft:R(de.horizontalPadding,"24px")`, @604733, Post 구간 @607416 `0 24px 24px`. 문서 `components/border/` 는 padding24 변형을 24px 여백이라고 적는다 | TDS 침묵 |
| 307 | list-row 간 간격 16px | 행 사이 간격 값 없음. ListRow 는 행 안의 위아래 여백(기본 12px, 크기별 8, 12, 16, 24px)으로 높이를 만든다 | @782264 `paddingTop:R(de.verticalPadding,"12px")`, @781692 `WQe={small:"8px",medium:"12px",large:"16px",xlarge:"24px"}` | TDS 침묵 |
| 307 | 밀접 결합 요소(label + input) 사이 8px | TextField 라벨 아래 여백 6px | @980970 `wct=vy({padding:"0 24px 6px",color:R(hy)},ce.t7)` | 다름 |

## 7. 본문 `## Rounded` (309~313행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 311 | 라운드 토큰은 4~32px 8단계 + `full`(999px) | 반지름 토큰 사다리 없음(컴포넌트별 리터럴) | 3절 머리말의 검색 | TDS 침묵 |
| 313 | 버튼 라운드 XL 16 | Button `xlarge` 16px(최소 높이 56px) | @618321 | 일치 |
| 313 | 버튼 라운드 L 14 | Button `large` 14px(최소 높이 48px) | @618499 | 일치 |
| 313 | 버튼 라운드 M 12 | Button `medium` 10px(최소 높이 38px. md 의 M 높이 40 과도 다르다) | @618671 `medium:{[xe.fontSize]:ce.t6.fontSize,[xe.borderRadius]:"10px",[xe.minWidth]:"64px",[xe.minHeight]:"38px"` | 다름 |
| 313 | 버튼 라운드 S 10 | Button `small` 8px(최소 높이 32px) | @618844 `small:{[xe.fontSize]:ce.t7.fontSize,[xe.borderRadius]:"8px",[xe.minWidth]:"52px",[xe.minHeight]:"32px"` | 다름 |
| 313 | iOS류 squircle 라운드는 `Templates/Squircle` 전용 페이지 밖에서 쓰지 않는다 | Asset 프레임에 Squircle 모양 6종(24, 30, 36, 40, 52, 60)이 있고, `SquircleMasking` 이 Asset 의 항목으로 나가며, ListHeader 와 ListRow 정의 사이의 자산 도우미가 모양 기본값을 squircle 로 둔다. md 가 말하는 것은 Figma 페이지이고 TDS 쪽 근거는 배포된 컴포넌트다 | @284391 `SquircleXSmall:{width:24,height:24`, @271399 `SquircleMasking:()=>Uc`, @750397 `function $l(e,t="squircle",r)`. `squircle` js 28건, d.ts 28건 | 다름 |

## 8. 본문 `## Elevation & Depth` (315~319행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 317 | 그림자는 floating, modal 표면에서만 등장한다 | 떠 있지 않은 컨트롤에도 그림자가 있다: NumericSpinner 구간 2건, SegmentedControl 구간 2건, Slider 손잡이, ProgressStepper 의 진행 구간(파란 빛 번짐). 반대로 Modal 과 BottomSheet 본체에는 그림자 선언이 없다(195행, 319행) | @855362 `boxShadow:"0px 1px 3px 0px rgba(0, 0, 0, 0.09)"`와 @857432(Menu 정의 @851370 과 NumericSpinner 정의 @864213 사이), @915070 `boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.09)"`와 @918317(SegmentedControl 정의 @920930 앞), @926729 `"&::-webkit-slider-thumb"` 안의 @926875, @870097 `boxShadow:R(Qm)`(`Qm="--progress-stepper-range-active-box-shadow"` @866405, 값 @868976) | 다름 |
| 317 | 그림자 색은 모두 navy-900 베이스의 낮은 알파(0.04~0.16) | 라이트 테마에서 쓰이는 그림자 색: `greyOpacity200` rgba(0,27,55,0.1), `greyOpacity300` rgba(0,29,58,0.18), 검정 `rgba(0,0,0,0.09)`, ProgressStepper 의 파랑 `rgba(49,130,246,0.50)` 과 0.30, PointToast 의 불투명한 `lightThemeGrey200`(#e5e8eb), 키패드 안쪽 링 `rgba(0,0,33,0.16)`. 바탕색이 한 가지가 아니고 알파는 0.09 부터 0.50, 그리고 불투명까지다 | @784705, `@toss/tds-colors` `colors.css` 의 `--greyOpacity200`, `--greyOpacity300`, `--lightThemeGrey200`, @855362, @868976 `[Qm]:f==="dark"?"0px 0px 50px 0px rgba(52, 133, 250, 0.50)":"0px 0px 50px 0px rgba(49, 130, 246, 0.50)"`, @1068018 `[OL]:`0px 2px 30px ${H.lightThemeGrey200}``, @719076 | 다름 |
| 319 | bottom-sheet shadow `0 -2px 12px navy/0.06` | BottomSheet 본체 스타일에 `boxShadow` 선언 없음. 선언 없음 확인 | 본체 @650249 `Nze=Ax({...borderRadius:"28px",width:"calc(100% - 20px)",overflow:"hidden",outline:"none"})`, 래퍼 @653982 `Tre`, `Rre`. `boxShadow` 19건 가운데 @640000~657700 구간에 든 것 없음. `drop-shadow` 는 1건(@164237, 애니메이션 라이브러리 내부) | TDS 침묵 |
| 319 | inner-shadow 시스템 없음 | 안쪽 그림자 토큰이나 프리셋 없음. `inset` 그림자는 1건이고 키패드 버튼의 1px 테두리 링이다 | @719076 `boxShadow:"inset 0px 0px 0px 1px rgba(0, 0, 33, 0.16)"`. 프리셋 @784705 에 inset 없음 | 일치 |
| 319 | pressed 는 그림자가 아니라 26% 막을 얹는다 | Button: 눌리면 덮개 층의 불투명도 .26(스프링 `quick`), 함께 크기 .96 으로 줄어든다(스프링 `rapid`). 덮개 색은 변형별 토큰이라 색 대조의 몫이다. 다른 컴포넌트는 방식이 다르다(Switch 는 크기 .96 과 색 바꿈 @960708) | @618156 `pressed:{transition:ee.quick,opacity:.26,backgroundColor:R(xe.dimmerPressedBackgroundColor)}`, @615834 `pressed:{scale:k,transition:ee.rapid}` | 일치 |

## 9. 본문 `### Motion` (321~331행)

TDS 의 모션 값은 두 벌이다. 베지어 5종 `j={linear:[0,0,1,1],ease:[.6,0,0,.6],out:[.25,.1,.25,1],expo:[.16,1,.3,1],back:[.34,1.56,.64,1]}` @147790(각각 기본 지속 시간 .5초 @150225), 스프링 8종 `N={basic:{stiffness:200,damping:30,mass:1},small:{480,50},quick:{800,55},medium:{270,25},large:{100,15},slow:{70,20},rapid:{1e3,55},bounce:{300,15}}` @149744. 기본값은 `$={default:YE.out,...}` @150506, 곧 베지어 `out` 에 .5초다. 이 값들은 배포물 내부 값이고 d.ts 의 export 에는 없다. CSS 문자열에 시간을 적은 전환과 애니메이션은 13곳이고(`verify3.js` 의 시간 문자열 검색), 값은 `0.1s ease-in-out`(@302537, @303328, @619778), `0.2s ease-in-out`(@302259), `0.2s ease`(@697711, @909798, @974762), `0.3s ease`(@964785, @1000664), `0.5s ease-in-out`(@865376), 그리고 Loader 의 `1.8s` 둘(@694158, @694256)과 `0.3s ease-in-out 0.7s`(@695435)다. `cubic-bezier(` 문자열은 0건이다(베지어는 배열로 적힌다). 숫자로 적힌 `duration:` 은 214건이고 값은 서른 가지다(0 부터 4 까지 스물아홉 가지와 `500` 3건. .0875 가 23건, .125 가 16건, 3 이 15건 순). `.32` 는 없고 `.12` 는 4건인데 모두 흔들림 애니메이션 묶음의 회전 한 토막이다(@463289 `XBe={small:[{rotate`).

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 324 | `ease` cubic-bezier(0.22, 0.61, 0.36, 1), 기본 | 기본 이징은 베지어 `out` [.25,.1,.25,1], 지속 시간 .5초. (0.22, 0.61, 0.36, 1) 곡선은 없다 | @150506 `$={default:YE.out,...`, @147790, @150225 `[t]:{ease:r,duration:.5}`. `\.22,\.61,\.36,1` 과 `0\.22, ?0\.61` 0건 | 다름 |
| 325 | `ease-out` cubic-bezier(0.16, 1, 0.3, 1), sheet 진입 | BottomSheet 진입은 스프링 `quick`(강성 800, 감쇠 55)이다. 같은 수치의 곡선은 `expo` 라는 이름으로 있지만 시트 진입에는 쓰이지 않는다(Skeleton 숨김, StepperRow 등장 등에 쓰인다) | @647684 `translateY:{from:150,to:-e},easing:N.quick`, @147790 `expo:[.16,1,.3,1]`, 쓰임 예 @921233, @957257 | 다름 |
| 326 | `dur-fast` 120, button press | Button 눌림: 크기는 스프링 `rapid`(강성 1000, 감쇠 55), 덮개는 스프링 `quick`. CSS 전환은 `0.1s ease-in-out`. 버튼에 120ms 값 없음(.12초는 위 머리말의 흔들림 애니메이션 4건뿐) | @615834, @618156, @619778 `transition:`color 0.1s ease-in-out,`. `120ms`, `.12s` 0건, `duration:.12` 4건(@463397 부터, Button 정의 @614632 와 떨어진 자리) | 다름 |
| 327 | `dur-base` 200, toggle | Switch: 배경과 크기는 스프링 `quick`, 손잡이 이동은 스프링 `medium`(강성 270, 감쇠 25) | @960846 `checked:{scale:{to:1},backgroundColor:{to:b.blue500},easing:N.quick}`, @960916 `Ust={checked:{...translateX:{to:16,easing:N.medium}}` | 다름 |
| 327 | `dur-base` 200, hover | hover 에 쓰는 지속 시간을 정한 곳이 없다. `:hover` 는 js 에 8건이다. 배경이 바뀌는 곳은 넷이고, Paragraph 링크, TextButton, 또 하나의 도우미(@741933)에는 전환 선언이 없다. Button 과 IconButton 구간의 hover 는 밑줄만 지운다. 참고(hover 값으로 치지 않았다): 약관 구간의 체크 상자 하나는 같은 스타일 객체에 0.1초 ease-in-out 전환이 있는데, 색, 배경, 테두리, 그림자, 불투명도 전부에 걸린 전환이라 focus 와 active 에도 똑같이 걸린다 | @303328 `transition:"0.1s ease-in-out",transitionProperty`, 같은 객체의 @303490 `"@media (hover: hover) and (pointer: fine)":{"&:hover":{background:b.greyOpacity200`(Paragraph 정의 @298759 와 AgreementV3 정의 @322767 사이). @296954 `hIe=w$({background:"none"` 안의 @297213 `"&:hover, &:active":{backgroundColor:b.grey200}`, @686955 `"@media (hover: hover) and (pointer: fine)":{"&:not(:disabled):hover":e}`, @620050, @710855, 전역 @143237 `a:hover`. 0.2초 문자열 넷(@302259, @697711, @909798, @974762) 가운데 hover 에 걸린 것 없음 | TDS 침묵 |
| 328 | `dur-slow` 320, sheet | BottomSheet: 진입 스프링 `quick`, 퇴장 스프링 `rapid`, 뒤 막 퇴장 스프링 `quick`. 320ms 값 없음 | @647684, @651711 `exit:{opacity:{to:0},translateY:{to:i},easing:N.rapid}`, @651539. `320ms`, `.32s`, `duration:.32` 0건 | 다름 |
| 328 | `dur-slow` 320, dialog | Modal: 열림 스프링 `quick`, 닫힘 스프링 `rapid`(본문과 뒤 막 모두) | @681917 `lUe={initial:{opacity:0},open:{opacity:1,transition:ee.quick},close:{opacity:0,transition:ee.rapid}}`, @681191 | 다름 |
| 331 | 바운스 오버슈트 없음 | 스프링 `bounce`(강성 300, 감쇠 15)와 넘쳤다 돌아오는 베지어 `back` [.34,1.56,.64,1] 이 있고 쓰인다 | @150026 `bounce:{stiffness:300,damping:15,mass:1}`, @147790 `back:[.34,1.56,.64,1]`. 쓰임 수(`verify.js`): `j.back` 13건, `bounce` 를 고른 곳 9건(`$.spring.bounce`, `ee.bounce`, `N.bounce` 합계). 프리셋을 거치지 않고 같은 수치를 바로 적은 곳도 2건 있다 @933454 `easing:{stiffness:300,damping:15}`(Slider 와 FullTooltip 정의 사이), @944290 | 다름 |
| 331 | 320ms 초과 fade 없음 | 더 긴 불투명도 전환이 있다: Skeleton 나타남 1초, 사라짐 .4초. 베지어의 기본 지속 시간도 .5초다 | @921233 `animate:e==="show"?{opacity:{to:1},easing:j.out,duration:1}:{opacity:{to:0},easing:j.expo,duration:.4}`, @150225 `[t]:{ease:r,duration:.5}` | 다름 |
| 331 | parallax 없음 | `parallax` 라는 낱말은 없다. 다만 축약된 번들에는 변수 이름이 남지 않아서, 낱말이 없다는 것만으로 그런 효과가 없다고 못 박을 수 없다(스크롤에 따라 움직이는 코드를 하나씩 따라가 보지 않았다) | `parallax` js, d.ts 모두 0건 | 확인 못 함 |
| 331 | skeleton shimmer 없음 | `ListRow.Loader` 가 회색 띠 위로 그라디언트가 지나가는 자리 표시를 그린다(SVG `linearGradient` 의 정지점 위치를 2초 주기로 무한 반복). `Skeleton` 컴포넌트는 따로 있고 불투명도 .2↔1 과 크기 .96↔1 을 되풀이한다. `shimmer` 라는 낱말은 0건 | @767744 `Jie=_Qe(function({type:t="square",...`(`speed:2`, `backgroundColor:b.grey100`, `foregroundColor:b.grey300`), @766485, @767273 `vs("animate",{attributeName:"offset",...repeatCount:"indefinite"})`, @921494. 문서 `components/skeleton/` | 다름 |
| 331 | shimmer 대신 3-dot loader 를 쓴다 | 로딩 표시 컴포넌트 `Loader` 는 점이 아니라 도는 원호다(48px SVG 원, 1.8초 회전). 참고(로더 값으로 치지 않았다): 점 셋은 Button 안의 로딩 상태에만 있다(.3초, 지연 0, .1, .2) | @693567 `function Nx(e){return Hoe("svg",{width:"48",height:"48"`, @694158 `animation:`1.8s linear 0s infinite forwards`(Loader 정의 @694668 바로 앞). Button 쪽 @617728 `transition:{delay:.2,repeat:1/0,repeatType:"reverse",duration:.3}`(앞의 두 점은 @617298, @617529 의 같은 꼴). 문서 `components/loader/` | 다름 |
| 331 | 모든 모션은 위 5개 토큰 안에서 운용된다 | 베지어 5종과 스프링 8종, 기본 지속 시간 .5초. md 의 5개와 이름도 값도 체계가 다르다 | @147790, @149744, @150506 | 다름 |

## 10. 본문 `## Shapes` (333~341행)

| md 줄 번호 | md 의 주장(이름과 값) | TDS 의 값 | 근거 | 판정 |
| --- | --- | --- | --- | --- |
| 335 | 버튼에 16~32px 라운드 | Button 반지름은 크기별 16, 14, 10, 8px(`display="full"` 이면 0px). 범위 8~16px | @618321, @618499, @618671, @618844, @619169 `borderRadius]:"0px"`(바로 앞이 `full:{[xe.display]:"flex",[xe.width]:"100%",`) | 다름 |
| 335 | 카드에 16~32px 라운드 | Card 컴포넌트 없음 | export 목록 @1151958 | TDS 침묵 |
| 335 | chips 에 999px full pill | Chip `pill` 모양 999px(`square` 모양은 8px, 10px) | @672517 | 일치 |
| 335 | primary CTA 에 999px full pill | Button `xlarge` 16px. 하단 CTA 를 감싸는 CTAButton 도 16px(`full` 이면 0px) | @618321, @621193 `D$e="16px"` | 다름 |
| 337 | 기본 보더는 1px 헤어라인(굵기) | Border 컴포넌트 높이 1px. 색은 `tHairlineBackground` 이고 색 대조의 몫이다 | @604733 `pR={full:{background:Ve.tHairlineBackground,height:"1px"},padding24:{...height:"1px",marginLeft:"24px"`. 문서 `components/border/` | 일치 |
| 337 | focused input 은 1.5px `blue-500` 보더 | TextField `box`: 테두리는 `1px solid greyOpacity100` 그대로이고 포커스 때 `blue900` 5% 막이 덮인다(.2초 ease). `line`, `big` 변형은 2px 밑줄의 색이 바뀐다. 1.5px 값 없음 | @974226, @973929 `focused:{...[ry]:H.blue900,[oy]:"0.05"`, @974762, @972762 `borderBottom:`2px solid ${R(Zv,b.grey100)}``. `1\.5px` js, d.ts 모두 0건 | 다름 |
| 337 | 2px 장식용 보더는 쓰지 않는다 | 2px 테두리는 3건: TextField 구간의 밑줄 둘(바탕 grey100)과 투명한 2px 테두리 하나. 이것이 md 가 말하는 "장식용" 에 드는지는 코드로 가릴 수 없다 | `2px solid` 3건: @972762 `borderBottom:`2px solid ${R(Zv,b.grey100)}``, @976974 `borderBottom:`2px solid ${R(uy,b.grey100)}``, @1058610 `border:"2px solid transparent"` | 확인 못 함 |
| 337 | 컬러 left-rail accent 카드는 쓰지 않는다 | 왼쪽 테두리 스타일 선언 없음. Card 컴포넌트도 없다. 찾은 것은 `borderLeft` 계열 선언뿐이고, 가상 요소나 따로 놓은 띠로 만든 왼쪽 강조선은 찾아보지 못해서 없다고 못 박을 수 없다 | `borderLeft`(Radius 제외) js 3건 모두 스타일 선언이 아니다: 애니메이션 라이브러리의 속성 표 둘(@164642 `borderLeftWidth:we`, @190811 `borderLeftColor:Yt`)과 계산된 테두리 폭을 읽는 치수 계산 하나(@306911 `borderLeftWidth),h=f+c`). `border-left` js 0건 | 확인 못 함 |
| 337 | 그라디언트는 세 가지 예외에만 허용된다 | 그라디언트 문자열 52건(`linear-gradient(` 35, `radial-gradient(` 17). 세 가지 밖의 쓰임 예(소속은 구간으로 가렸다): ListRow 구간의 비스듬한 흰 띠, Chip 구간의 방사형 번짐, Rating 구간의 방사형 번짐, ProgressStepper 구간의 파란 채움, SegmentedControl 구간의 좌우 가장자리 흐림, Wheel 구간의 위아래 덮개, Bubble 구간의 색별 방사형 배경 | `verify.js` 의 `(?:linear/radial/conic)-gradient\(` 52건(52건의 오프셋과 조각은 `verify.out.txt` 에 있다). 예: @783230 `background:"linear-gradient(140deg, #ffffff00 30%, #ffffffcc 50%, #ffffff00 70%)"`, @674463, @886879, @868760, @917478, @1022511, @660762 `Yre={blue:`radial-gradient` | 다름 |
| 337 | bottom CTA 위쪽 보호 그라디언트 | BottomCTA 에 바탕색에서 투명으로 가는 위쪽 그라디언트가 있다 | @627661 `rWe=()=>({[pa]:`linear-gradient(to top, ${b.background} 25%, ${nt(me({color:b.background}),0)})`})`, 변수 `--bottom-cta-gradient` | 일치 |
| 337 | 로딩 버튼 내부 radial glow | Button 안에 `radial-gradient` 층이 있고 로딩 상태에서 불투명도가 오르내린다 | @620852 `background:`radial-gradient(closest-side, ${R(xe.gradientColor)} 0%, transparent 100%)`` | 일치 |
| 337 | yellow→orange 일러스트 그라디언트 | 일러스트 자산은 배포물에 없다. 노랑, 주황 방사형 그라디언트는 Bubble 구간의 색 선택지로 따로따로 있고(노랑에서 노랑, 주황에서 주황), 노랑에서 주황으로 가는 것은 없다 | @660932 `yellow:`radial-gradient(circle at left bottom, ${b.yellow300} 0%, ${b.yellow500} 66%)``, 이어서 `orange:` 가 같은 꼴 | TDS 침묵 |
| 339 | 아이콘 이름은 kebab-case 에 `*-mono` | 배포물 코드에 적힌 아이콘 이름 문자열은 17가지 26건이고 모두 kebab-case 다. `-mono` 로 끝나는 것이 13가지(`icon-arrow-right-mono`, `icon-x-circle-mono`, `icon-eye-on-mono` 등), 나머지는 `icon-system-arrow-back-ios-outlined`, `icon-system-arrow-back-android-outlined`, `icon-warning-circle-red`, `icon-double` 이다 | `verify.js` 의 `"ico?n-[a-z0-9-]+"`. @316939 `"icon-arrow-right-mono"`, @984768 `name:"icon-x-circle-mono"`. d.ts@3077 `icon-setting-mono` | 일치 |
| 339 | 필드 변형 이름은 `*-fill`, 예 `icon-user-circle-blue-fill`. 가장 많이 쓰인 아이콘 `icon-x-mono`, `icon-setting-mono` | `-fill` 로 끝나는 아이콘 이름은 배포물에 0건이고 `icon-x-mono`, `icon-user-circle-blue-fill` 도 0건이다(`icon-setting-mono` 는 d.ts 예제에 1건). 아이콘 목록은 `static.toss.im/icons/svg/` 에 있는 자산이라 배포물과 문서로는 있는지 없는지 가릴 수 없다 | `verify.js`: `ico?n-[a-z0-9-]*-fill` js 0, d.ts 0. `icon-x-mono` 0, 0. `icon-user-circle-blue-fill` 0, 0. `icon-setting-mono` d.ts 1(@3077). @274381 `y4e="https://static.toss.im/icons/svg/"` | 확인 못 함 |
| 339 | 아이콘 사이즈 16/20/24/32, 24px 가 주력 | 아이콘 크기 세트를 정한 곳 없음. 참고: IconButton 의 `iconSize` 기본값 24, Asset 의 Circle 과 Squircle 프레임 크기는 24, 30, 36, 40, 52, 60(16, 20, 32 프레임 없음) | @709984 `iconSize:i=24`(IconButton 정의 @709897 의 인자), @283766 `CircleXSmall:{width:24,height:24,radius:9999`, @284391 | TDS 침묵 |
| 339 | stroke 는 24px 그리드 기준 1.5~1.67px | 아이콘 SVG 는 배포물 밖 `static.toss.im` 에서 이름별로 받아 오므로 이번 근거(배포물, 문서)로는 볼 수 없다 | @274381 | 확인 못 함 |
| 339 | 필드 변형은 active tab-bar 아이콘에만 쓴다 | TabBar 컴포넌트 없음 | export 목록 @1151958. `tab-?bar` js 0건(d.ts 3건은 csstype 값) | TDS 침묵 |
| 339 | 모든 아이콘은 `currentColor` 를 상속하고 외부 컬러 직접 주입은 금지 | Asset.Icon 에 `color` 속성이 있다. 값을 주면 그 색을 넣고 SVG 의 fill, stroke 를 `currentColor` 로 덮어쓴다. 값을 안 주면 SVG 원래 색을 그대로 둔다 | @275139 `color:s,objectFit:l="contain"`, @276510 `fill: currentColor;`, 쓰는 쪽 예 @984768 `name:"icon-x-circle-mono",color:b.grey400` | 다름 |
| 339 | production 은 단일 SVG sprite 로 서빙 | 아이콘마다 `https://static.toss.im/icons/svg/{이름}.svg` 를 따로 받아 온다. `sprite` 는 0건 | @274381, @274856 `function DH(e){let t=e.startsWith("icn-")`, 그 끝의 @274941 `${y4e}${t}.svg`. `sprite` js, d.ts 모두 0건 | 다름 |
| 339 | Figma 인스턴스 수(96회, 48회), Lucide 대체 약속 | 배포물과 문서에 해당 내용 없음 | `lucide` js, d.ts 모두 0건 | TDS 침묵 |
| 341 | Tossface 글리프는 빈 상태, 성공 화면, bottom sheet 헤더에 시각 자산으로 쓰고 글 안의 문장부호로는 쓰지 않는다 | 배포물에 Tossface 는 전역 글꼴 스택의 한 자리로만 나온다. 스택에 들어 있으므로 글 안의 이모지 글자도 이 글꼴로 그려질 수 있는 구성이지만, 어디에 쓰고 어디에 쓰지 않는다는 규칙은 없다. 글리프의 생김새(노란 얼굴, 갈색 이목구비)는 글꼴 파일 안의 것이라 세 근거로는 볼 수 없다 | @142270, `tossface` js 1건, d.ts 0건 | TDS 침묵 |

## 대조하다 알게 된 구조적 사실

- **타이포 체계가 다르다.** TDS 는 크기 단계 20개(`t1`~`t7`, `st1`~`st13`)에 줄 높이가 자동으로 따라붙고 굵기는 쓰는 쪽이 고른다. md 는 역할 이름 16개에 크기, 굵기, 줄 높이, 자간을 묶었다. md 의 16개 역할 이름은 TDS 어디에도 없다.
- **TDS 의 줄 높이는 17px 이하에서 모두 1.5 배이고, 그 위로는 크기가 커질수록 비율이 줄어든다**(18px 1.5, 20px 1.45, 22px 1.409, 24px 1.375, 28px 1.321, 30px 1.333). md 의 제목, 타이틀, 캡션 줄 높이(1.30, 1.35, 1.40, 1.45)는 어느 크기에서도 이 표와 맞지 않는다.
- **TDS 에는 자간, 숫자 폭 선언이 아예 없다.** md 의 `letterSpacing` 16개 가운데 0 이 아닌 12개는 맞댈 값이 없다.
- **TDS 에는 간격, 반지름의 토큰 사다리가 없다.** 그림자는 내부 프리셋 셋(`tiny`, `weak`, `medium`)이 있지만 md 의 네 그림자와 이름도 값도 겹치지 않는다. md 의 그림자가 가장 진한 0.16 알파에 번짐 24~32px 인 데 비해 TDS 의 Menu, Tooltip, Toast 는 번짐 60px, 60px, 30px 에 알파 0.1, 0.18, 0.1 이다.
- **TDS 의 모션은 대부분 스프링이다.** 고정 밀리초 토큰 셋(120, 200, 320)에 대응하는 값이 없다. md 가 적은 두 베지어 가운데 하나(0.16, 1, 0.3, 1)만 `expo` 라는 이름으로 있고 쓰임이 다르다.
- **더 큰 텍스트(접근성 글자 배율)가 TDS 타이포의 큰 축인데 md 에는 없다.** 문서와 배포물 모두 100%~310% 아홉 배율의 크기 표를 싣는다(@52093 `nb={Large:$r,xLarge:[32,31,30`).
- **md 가 쓰임으로 적은 것 가운데 cards, tags, sections, hero blocks, tab-bar 는 TDS Mobile 에 그 이름의 컴포넌트가 없어 맞댈 자리가 없다**(export 156개에 Card, Tag, Section, Hero, TabBar 없음. `Tab` 은 있다).
