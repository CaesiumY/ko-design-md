# toss.md 대 TDS Mobile 대조표: 내비게이션, 콘텐츠, 피드백 컴포넌트

대조일 2026-11-23. 읽기 전용 대조이며 사실만 적는다(고칠지, 지울지는 판단하지 않는다).

## 읽는 법

- **md**: `services/toss.md` (워크트리 `preview-structure-base`). 줄 번호는 그 파일 기준이다.
- **근거 표기**
  - `@숫자` 는 `@toss/tds-mobile` 2.5.1 의 `dist/esm/index.js` 안 위치다. 파일을 UTF-8 로 읽은 JS 문자열의 인덱스(`String.prototype.indexOf` 값)이고 바이트 오프셋이 아니다.
  - `d.ts@숫자` 는 같은 폴더 `index.d.ts` 의 같은 방식 인덱스다.
  - `문서 <경로>` 는 `https://tossmini-docs.toss.im/tds-mobile/components/<경로>/` 이다. 인용은 15단어 이내다.
- **색 이름 풀이**: 번들의 `H.x` 는 고정 팔레트 hex, `b.x` 는 `var(--adaptiveX)`(라이트와 다크 값은 `@toss/tds-colors` 의 `colors.light.css`, `colors.dark.css`), `Ve.x` 는 `[라이트, 다크]` 쌍 테마 토큰(@42400~42930)이다.
- **글자 크기 풀이**: 타이포 단계 표(@51172)로 t1=30, t2=26, t3=22, t4=20, t5=17, st10=16, t6=15, st11=14, t7=13, st12=12, st13=11px. 굵기 regular 400, medium 500, semibold 600, bold 700(@297929).
- **색 일치 기준**: hex 가 같거나 OKLCH 로 L ±0.005, C ±0.005, h ±2 안이면 일치. 반투명 색은 그 컴포넌트가 놓이는 바탕(따로 적지 않으면 흰색)에 합성해 견준다.
- **값이 여럿일 때**: md 가 값 하나를 적었는데 TDS 에 size 나 variant 가 여럿이면 전체 집합과 기본값을 적고 기본값으로 판정한다. 기본값이 없으면(필수 속성) 집합 안에 md 값이 있는지로 판정한다.
- **선언 없음과 침묵의 구분**: 컴포넌트는 있는데 그 CSS 속성을 선언하지 않아 렌더 값이 기본값(그림자 없음, 테두리 없음)인 경우는 "다름"으로 적고 "선언 없음"이라 밝힌다. md 가 말한 부품이나 규칙 자체가 TDS 컴포넌트에 없으면 "TDS 침묵"이다.
- **"선언 없음"이라 "다름"으로 적은 행은 다섯이다**: toast 그림자(기본 위치 bottom), dialog 그림자, bottom-sheet 그림자, table-row 헤어라인, bottom-info 알약 모양. 이 다섯을 "TDS 침묵"으로 세는 기준을 쓰면 다름이 다섯 줄고 침묵이 다섯 는다.
- **문서 쪽의 침묵은 읽은 범위 안에서의 침묵이다**: 문서는 `get_page_text` 로 읽었고 긴 쪽(bottom-sheet, tooltip, bubble, Chart/bar-chart, ListRow/list-row-overview)은 앞부분만 읽었다. 코드 쪽 침묵은 행마다 적은 검색어가 번들 전체에서 0건이라는 뜻이다.
- **근거 오프셋 색인**: 코드 조각 없이 `@숫자` 만 적은 근거는 문서 끝 「오프셋 색인」에 그 위치의 글자 200자를 스크립트로 찍어 두었다.
- **판정 넷**: 일치, 다름, TDS 침묵, 확인 못 함.
- **frontmatter `components:` 맵**: md 1~202줄 frontmatter 에 `components:` 맵이 없다. 대조할 줄이 없다.
- **범위 밖**: 같은 절 묶음에 있어도 내 몫이 아닌 것(keypad, checkbox, switch, segmented-control, search-field, slider, rating, numeric-spinner, stepper, error-message-library, text-button, icon-button)은 싣지 않았다.

## 대응 근거 (md 절과 TDS 컴포넌트를 무엇끼리 맞댔는가)

| md 절 | 맞댄 TDS 컴포넌트 | 까닭 |
|---|---|---|
| badge | `Badge` (`K.Badge` 로 위임, @602249 → @269617) | 같은 이름 |
| list-row | `ListRow` (@781461) | 같은 이름 |
| list-header | `ListHeader` (@737496) | 같은 이름 |
| tab-bar | 없음 | `tab-bar`, `TabBar`, `tabbar` 가 index.js 에 0건, 문서 사이드바에도 없음 |
| top-app-bar | `TopNavigation` (@1000703) | 뒤로 가기, 제목, 오른쪽 버튼을 가진 상단 바. `Top`(@993949)은 문서가 "페이지 상단 컴포넌트"라 부르는 제목 영역이고 고정 높이가 없어 맞대지 않았다 |
| toast | `Toast` (@497693) | 같은 이름 |
| dialog | `ConfirmDialog`, `AlertDialog` (@680323 일대) | `Dialog` 라는 export 는 없고 문서가 둘로 나눈다. 버튼 둘인 md 서술은 `ConfirmDialog` 에 맞댔다 |
| bottom-sheet | `BottomSheet` (@650249 일대) | 같은 이름 |
| loading | `Button` 의 loading 상태 (@614632) | md 가 "버튼을 가로지른다"고 적어 버튼 로딩을 가리킨다. 별도 `Loader`(@694671)는 참고로만 적었다 |
| menu | `Menu` (@851374) | 같은 이름 |
| icon | `Asset.Icon` (@276324 일대) | `Icon` export 는 없다 |
| asset | `Asset` 네임스페이스 (@271254) | 같은 이름 |
| progress-bar, progress-stepper | `ProgressBar` (@864587), `ProgressStepper` (@865569) | 같은 이름 |
| tooltip, bubble | `Tooltip` (@943403 일대), `Bubble` (@658239) | 같은 이름 |
| post, board-row, table-row, grid-list | `Post` (@607456), `BoardRow` (@609139), `TableRow` (@969642), `GridList` (@698436) | 같은 이름. 쓰임이 다른 것은 행으로 적었다 |
| bar-chart | `BarChart` (@660762 일대) | 같은 이름 |
| bottom-info, list-footer | `BottomInfo` (@632867), `ListFooter` (@732447) | 같은 이름 |
| result | `Result` (@892249) | 같은 이름 |
| tab | `Tab` (@964467~968691) | 같은 이름 |
| navigation(앱인토스) | `TopNavigation`, `RootTopNavigation` | `AppsInToss` 가 index.js, index.d.ts 에 0건이라 가장 가까운 상단 내비게이션에 맞댔다 |

## 항목별 대조

### badge (md L399)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 399 | badge 높이 22px | height 선언 없음. 글자 크기 × 줄높이 1.5em + 세로 여백으로 계산하면 xsmall 21px, small 24px, medium 25.5px, large 29px. size 는 필수이고 기본값이 없다. 22px 는 집합에 없다 | @46389 `{fontSize:10,padding:[3,7],borderRadius:9}`, @46623(12), @46811(13), @46999 `fontSize:14,padding:[4,8]`, @270157 `fontWeight:"bold",lineHeight:"1.5em"`, d.ts@100567 | 다름 |
| 399 | badge radius 6px | xsmall 9px, small 11px, medium 12px, large 13px | @46389 `borderRadius:9`, @46623 `11`, @46811 `12`, @46999 `13` | 다름 |
| 399 | chip 보다 작고 정보 밀도 높은 표면에 쓴다 | 문서 badge 쪽에 chip 과 견준 서술이 없다. 문서는 쓰임을 "상태를 빠르게 인식"하게 강조하는 것이라고만 적는다. `Chip` 은 export(d.ts@123654)는 있으나 문서 쪽이 없다 | 문서 badge "항목의 상태를 빠르게 인식할 수 있도록 강조하는 데 사용돼요" | TDS 침묵 |
| 399 | red badge 글자색 `red-500` (#F04452, oklch(0.641 0.208 21)) | weak variant 글자색 `Ve.tRedBadgeColor` 라이트 #d22030, oklch(0.556 0.209 24) | @270791 `"red-weak":{color:Ve.tRedBadgeColor,backgroundColor:Ve.tRedBadgeBackground}`, @42905 | 다름 |
| 399 | red badge 배경 옅은 분홍, 추정값 oklch(0.940 0.040 18) | `Ve.tRedBadgeBackground` 라이트 rgba(244,67,54,0.16). 흰 바탕 합성 #fde1df, oklch(0.932 0.031 23). L 0.008, C 0.009, h 5 차이 | @42905 `tRedBadgeColor:[M3,I3],tRedBadgeBackground:[w8,T8]` | 다름 |
| 399 | red badge washed 배경은 "정식 토큰 없음"(md 문장의 주어는 핸드오프 번들) | TDS 에는 배지 배경 전용 테마 토큰이 있다: `tRedBadgeBackground`, `tGreenBadgeBackground` 등 | @42905, @42850 | 다름 |
| 399 | green badge 글자색 `green-500` (oklch(0.493 0.143 154)) | weak variant 글자색 `Ve.tGreenBadgeColor` 라이트 #029359, oklch(0.584 0.138 157) | @270657 `"green-weak"`, @42850 `tGreenBadgeColor:[L3,B3]` | 다름 |
| 399 | green badge 배경 옅은 민트(md 에 값 없음, 서술만) | `tGreenBadgeBackground` 라이트 rgba(2,162,98,0.16), 초록 16% 를 얹은 옅은 색 | @42850 | 일치 |
| 399 | 시맨틱 색에 매핑된 washed 배경과 짝짓는다 | variant 는 `fill`, `weak` 둘이고 color 는 blue, teal, green, red, yellow, elephant. weak 가 옅은 배경 짝이다 | 문서 badge "weak 스타일은 채도가 낮아서 시각적으로 덜 눈에 띄어요", @270380 | 일치 |

### list-row (md L403, 코드 L405~411)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 403 | 토스 홈, 계좌 목록, 거래 내역의 표준 단위 | 문서는 "리스트 형태의 UI"에 쓴다고만 적고 홈, 계좌, 거래 내역 같은 화면을 들지 않는다 | 문서 ListRow/list-row-overview "리스트 형태의 UI를 구성할 때 사용해요" | TDS 침묵 |
| 403 | 세로 padding 14px | `verticalPadding` 기본 medium 12px. 집합 small 8, medium 12, large 16, xlarge 24px. 14px 는 집합에 없다 | @778509 `verticalPadding:i="medium",horizontalPadding:a="medium"`, @781687 `WQe={small:"8px",medium:"12px",large:"16px",xlarge:"24px"}` | 다름 |
| 403 | 가로 padding 24px | `horizontalPadding` 기본 medium 24px. 집합 small 20, medium 24px | @781746 `zQe={small:"20px",medium:"24px"}` | 일치 |
| 403 | gap 14px | left 와 contents 사이 12px, contents 와 right 사이 16px(화살표와 right 가 함께면 4px) | @779712 `[de.leftGap]:s?"12px":"0px",[de.gap]:A&&u?"4px":"16px"` | 다름 |
| 403 | 아바타 44px | `ListRow.AssetIcon` 기본 shape squircle, size small. 스쿼클 틀은 24, 30, 36, 40, 52, 60px 이고 44px 틀이 없다. `width:44,height:44` 는 index.js 에 0건이고 "44px" 는 행의 `minHeight` 뿐이다 | @751666 `shape:t="squircle",size:r="small"`, @284462 `SquircleSmall:{width:30,height:30`, @284603 `SquircleLarge:{width:40,height:40`, @781983 `minHeight:"44px"` | 다름 |
| 403 | 아바타 radius 14 | 스쿼클 틀에는 radius 값이 없다(마스크로 자른다). radius 가 있는 Square 틀은 40px 에 10, 52px 에 12 다. 14 는 없다. 찾은 방법: 틀 표 @284391~284800, `Asset.SquircleMasking` @287846 | @284744 `SquareSmall:{width:40,height:40,radius:10` | TDS 침묵 |
| 403 | 타이틀과 서브 텍스트 스택 | `ListRow.Texts` 의 `2RowTypeA` 등 두 줄 타입(top, bottom) | 문서 ListRow/list-row-overview `<ListRow.Texts type="2RowTypeA" top=… bottom=… />` | 일치 |
| 403 | 우측 정렬 슬롯에 arrow | `right` 슬롯과 화살표 속성이 있다 | d.ts@254133, 문서 ListRow/list-row-overview "right: 컴포넌트의 가장 오른쪽에 위치해" | 일치 |
| 403 | 우측 슬롯의 amount, timestamp | amount, timestamp 전용 슬롯이나 하위 컴포넌트가 없다. 찾은 방법: index.js 에서 `[Aa]mount`, `positive`, `negative` 검색(ListRow 와 무관한 것뿐, Skeleton 패턴 이름 `amountTopList` @923916), ListRow 하위 타입 목록 | @770500 `Right1RowTypeE`, @769957 `Right1RowTypeA` | TDS 침묵 |
| 403 | amount 는 Bold 700, 15px | amount 부품이 없다. 오른쪽 글자 타입은 `Right1RowTypeE` 가 bold t5(17px) grey800, `Right1RowTypeA` 가 regular t5(17px) 이다(금액 전용이 아니다) | @770500, @769957 | TDS 침묵 |
| 403 | 양수는 `blue-500` | 양수, 음수에 따른 색 규칙이 없다(위 검색) | 위와 같음 | TDS 침묵 |
| 403 | 음수는 `grey-900` | 위와 같음 | 위와 같음 | TDS 침묵 |
| 406 | 코드 `<ListRow left=… right=… />` 의 속성 이름 left, right | `left`, `contents`, `right` | d.ts@254133, d.ts@255654 | 일치 |
| 407 | 코드 `left={<Asset name="bank-account" />}` | `Asset` 은 컴포넌트가 아니라 네임스페이스라 `<Asset name>` 꼴이 없다. 문서 예시는 `left={<ListRow.AssetIcon name="bank-toss" />}` | d.ts@81202 `export declare namespace Asset`, @271254 `He={};Lf(He,{`, 문서 ListRow/list-row-overview | 다름 |
| 408~409 | 코드 속성 `title`, `subtitle` | `title`, `subtitle` 속성이 없다. 글자는 `contents={<ListRow.Texts … top bottom />}` 로 넣는다 | d.ts@254133, 문서 ListRow/list-row-overview "left, contents, right 세 영역으로 나뉘어" | 다름 |
| 410 | 코드 `<Amount value={…} positive />` | `Amount` export 가 없다. 찾은 방법: export 목록 @1151958, index.js `[Aa]mount` 검색 | @1151958 | TDS 침묵 |

### list-header (md L416)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 416 | 섹션 타이틀과 우측 액션 슬롯("전체보기" 같은) | 속성 `title`, `right`, `description`, `size`. 하위 `ListHeader.RightText`, `RightArrow`, `RightIconButton`, `TitleParagraph` | @737496, d.ts@186802 | 일치 |

### tab-bar (md L420)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 420 | floating tab-bar, max-width 420px | 컴포넌트가 없다. 찾은 방법: index.js 에서 `tab-bar`, `TabBar`, `tabbar` 0건, index.d.ts 는 CSS 키워드 `-moz-win-browsertabbar-toolbox` 뿐, export 목록 @1151958, 문서 사이드바(list-header 쪽에서 모은 링크)에 Tab Bar 쪽 없음 | @1151958 | TDS 침묵 |
| 420 | radius 24 (`radius-3xl`) | 컴포넌트 없음(위와 같음) | 위와 같음 | TDS 침묵 |
| 420 | 흰 배경과 1px `grey-200` 보더 | 컴포넌트 없음 | 위와 같음 | TDS 침묵 |
| 420 | destination 2~5개 | 컴포넌트 없음 | 위와 같음 | TDS 침묵 |
| 420 | active 아이콘은 filled 변형과 `grey-900` | 컴포넌트 없음 | 위와 같음 | TDS 침묵 |
| 420 | inactive 는 outline 과 `fg-tertiary` | 컴포넌트 없음 | 위와 같음 | TDS 침묵 |

### top-app-bar (md L424)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 424 | 높이 56pt | `TopNavigation` 높이 iOS 44, Android 54(안전 영역 제외). 56 은 TopNavigation, RootTopNavigation, Top 어디에도 없다 | @506012 `w8e={ios:44,android:54}` | 다름 |
| 424 | 좌측 정렬 타이틀 | iOS 는 가운데(`1fr auto 1fr`), Android 는 왼쪽(`auto 1fr auto`). 제목은 t5 semibold. `RootTopNavigation` 은 t4 bold 왼쪽 정렬 | @1000885 `gridTemplateColumns:c?"1fr auto 1fr":"auto 1fr auto"`, @1001122, @1001774 | 다름 |
| 424 | 우측 옵션 아이콘 버튼 슬롯 | `trailing` 슬롯, `TopNavigationIconButton` | d.ts@1132702 "우측에 표시될 내용을 지정해요", @1002724 | 일치 |

### toast (md L428, 코드 L431)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 428 | 표면 `grey-900` (#191F28) | 기본 위치 bottom: 라이트 `H.grey500` (#8b95a1)에 뒤 블러, 다크 `b.grey200`. top 위치: white | @491518, @494481 | 다름 |
| 428 | 흰 라벨 | bottom: `H.floatBackground` (#ffffff), t6(15px) semibold. top: `H.greyOpacity800` | @491121, @494481 | 일치 |
| 428 | radius 14 (`radius-l`) | bottom: 한 줄이면 100px, 여러 줄이면 20px | @491447 | 다름 |
| 428 | `shadow-toast` (0 8px 24px, navy 0.16) | bottom: boxShadow 선언 없음. top: `0 2px 30px` `greyOpacity200` (rgba(0,27,55,0.1)) | @489031~492450 구간에 boxShadow 없음, @494754 | 다름 |
| 428 | 성공 아이콘 20px | `Toast.Icon` 틀 24×24, leftAddon 상자 24×24 에 오른쪽 여백 12px | @497392, @492132 | 다름 |
| 428 | 성공 아이콘은 `green-500` 원과 흰 체크 | 아이콘은 이름(`icn-success-color`)으로 불러오고 그림 데이터가 번들에 없어 색과 모양을 볼 수 없다 | 문서 toast `leftAddon={<Toast.Icon name="icn-success-color" />}` | 확인 못 함 |
| 431 | 코드 `<Toast>송금이 완료되었어요</Toast>` (children 으로 문구) | 문구는 `text` 속성, 여닫기는 `open`, 위치는 `position`(기본 bottom) | d.ts@1121674, d.ts@1124782 | 다름 |

### dialog (md L436, 코드 L438~444)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 436 | 흰 표면 | `b.floatBackground` 라이트 #ffffff | @680323 `backgroundColor:b.floatBackground,borderRadius:"24px"` | 일치 |
| 436 | radius 20 (`radius-2xl`) | 24px. 최대 폭 320px | @680323 | 다름 |
| 436 | inner padding 24px | 본문 `22px 22px 0`, 버튼 줄 margin `20px 16px 16px` | @682317, @682461 | 다름 |
| 436 | `shadow-3` | boxShadow 선언 없음. 뒤 딤은 검정 라이트 0.2, 다크 0.56 | @680064 `RO={light:.2,dark:.56}` | 다름 |
| 436 | 타이틀 18px | t4 = 20px | @683244 `color:r=b.grey800,typography:o="t4",fontWeight:n="bold"` | 다름 |
| 436 | 타이틀 굵기 700 | bold = 700 | @683244 | 일치 |
| 436 | 본문 15px | t6 = 15px | @682921 `color:r=b.grey600,typography:o="t6",fontWeight:n="medium"` | 일치 |
| 436 | 본문 굵기 400 | medium = 500 | @682921 | 다름 |
| 436 | 본문 색 `grey-700` (#4E5968) | `b.grey600` (라이트 #6b7684) | @682921 | 다름 |
| 436 | primary blue CTA | `ConfirmButton` 은 size large 의 기본(primary, fill) 버튼, 배경 `H.blue500` (#3182f6) | @683876, @137980 | 일치 |
| 436 | secondary `grey-100` CTA | `CancelButton` 은 color dark, variant weak. 배경 `b.greyOpacity100` 라이트 rgba(2,32,71,0.05). 흰 다이얼로그 위 합성 색이 #f2f4f6 으로 grey100 과 같다. 토큰은 불투명 grey100 이 아니라 반투명 greyOpacity100 이다 | @683692, @138370 | 일치 |
| 436 | CTA 높이 48px | Button large `minHeight:"48px"`, radius 14px | @618499 | 일치 |
| 436 | CTA 두 개가 stack 된다 | 버튼 줄이 `flexWrap:"wrap-reverse"`, gap 8px, 버튼 `minWidth:calc(50% - 8px)`. 기본은 가로로 나란하고 넘칠 때만 줄이 바뀐다 | @682461 | 다름 |
| 439 | 코드 컴포넌트 이름 `<Dialog>` | `Dialog` export 가 없다. `AlertDialog`(버튼 하나), `ConfirmDialog`(버튼 둘) | @1151958, 문서 Dialog/dialog | 다름 |
| 440 | 코드 속성 `title` | `title` | @683959 | 일치 |
| 441~443 | 코드 속성 `body`, `primary`, `secondary` | `description`, `confirmButton`, `cancelButton` | @683959 | 다름 |

### bottom-sheet (md L449)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 449 | 토스 모바일에서 dialog 의 1차 대체 | 문서 bottom-sheet 쪽 머리말과 Dialog/dialog 쪽에 dialog 를 대체한다는 서술이 없다. 문서는 하단 패널이라고만 적는다 | 문서 bottom-sheet "화면의 하단에서 슬라이드 되어 나타나는 패널이에요" | TDS 침묵 |
| 449 | shadow `0 -2px 12px` navy 0.06 | boxShadow 선언 없음. index.js 634000~657698 구간에 boxShadow 0건(전 파일 24건 목록으로 확인) | @650249 | 다름 |
| 449 | scrim `bg-overlay` (검정 0.56) | 검정, 투명도 라이트 normal 0.2(darker 0.4), 다크 normal 0.56(darker 0.8). 다크의 0.56 만 같다 | @651088 `rgba(0,0,0`, @637953 `_R={light:{normal:.2,darker:.4},dark:{normal:.56,darker:.8}}` | 다름 |
| 449 | top corner radius 20~24px | 네 모서리 모두 28px, 폭 `calc(100% - 20px)` (화면 가장자리에서 띄운 카드). 손잡이 48×4 grey200 | @650249 `backgroundColor:b.layeredBackground,borderRadius:"28px",width:"calc(100% - 20px)"`, @650802 | 다름 |
| 449 | yellow-faced 일러스트가 sheet 상단에 anchored 되는 패턴이 빈번 | 코드와 문서에 일러스트 패턴이 없다. 찾은 방법: BottomSheet 하위 목록(Header, HeaderDescription, CTA, DoubleCTA), 문서 bottom-sheet 쪽 앞부분 예제 | 문서 bottom-sheet | TDS 침묵 |

### loading (md L457)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 457 | 라벨이 0 으로 페이드 | Button loading 상태에서 라벨 `opacity:0` | @616318 | 일치 |
| 457 | 같은 색 dot 3개가 펄스 | 점 3개, opacity .2→1, scale .8→1, 0.3s, 지연 0, .1, .2s. 점 색은 fill 버튼에서 `"#fff"`(밝은 배경이면 greyOpacity600) | @617497, @138858 | 일치 |
| 457 | 미세한 radial highlight 가 있다 | `radial-gradient(closest-side, …)` 요소가 있다 | @620852 | 일치 |
| 457 | highlight 가 버튼을 가로지른다 | 가운데에 고정된 채 투명도만 0 과 .7(fill) 또는 .24(weak) 사이를 0.6s 로 오간다. 가로 이동이 없다 | @616677, @620852 | 다름 |
| 457 | skeleton shimmer 는 의도적으로 쓰지 않는다 | `Skeleton` export 가 있다(문서 쪽도 있음). `Skeleton.Item` 은 opacity .2→1, scale .96→1 을 0.6s 로 무한 왕복한다. `ListRow.Loader` 는 linearGradient 의 stop 을 움직이는 SVG 다. `shimmer` 라는 문자열은 0건이다 | @924246, @921431, @767273, @767744 | 다름 |

### menu (md L461, 코드 L464~467)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 461 | trigger 위치에 바로 펼쳐지는 셀렉터 | `Menu.Trigger` 가 감싼 요소 옆에 드롭다운을 연다. placement 기본 `bottom-start` | d.ts@263179, d.ts@262648, 문서 menu "드롭다운 메뉴를 사용해 항목을 선택" | 일치 |
| 461 | bottom sheet 와의 시각적 거리 문제 의식에서 나온 컴포넌트 | 코드와 문서 menu 쪽에 그 서술이 없다 | 문서 menu | TDS 침묵 |
| 461 | 10일 A/B 테스트, Android item-click rate 10% 개선 뒤 정식 채택 | 코드와 문서 menu 쪽에 그 서술이 없다 | 문서 menu | TDS 침묵 |
| 464 | 코드 `<Menu trigger={…}>` | `Menu` 는 컴포넌트가 아니라 객체다. `<Menu.Trigger dropdown={…}>` 꼴이고 `trigger` 속성이 없다 | @851374 `r6={Dropdown:wae,DropdownItem:jS,DropdownCheckItem:NS` (이어서 DropdownIcon, Header, Trigger), d.ts@261023 | 다름 |
| 465~466 | 코드 `<Menu.Item>` | `Menu.Item` 이 없다. `Menu.DropdownItem`, `Menu.DropdownCheckItem` | @851374 | 다름 |

### icon (md L472)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 472 | "TDS Icon system" (Icon 컴포넌트) | `Icon` export 가 없다. 아이콘은 `Asset.Icon` 이고 문서 사이드바에도 Icon 쪽이 없다 | @1151958, @271399 | 다름 |
| 472 | 이름 접미 `*-mono` 인 변형이 있다 | `icon-…-mono` 이름이 번들과 문서 예시에 있다 | 번들 안 아이콘 이름 26건 목록, 문서 예시 `icon-setting-mono` | 일치 |
| 472 | `*-mono` 가 outline 변형이다 | 그림 데이터가 번들에 없어 mono 가 외곽선 그림인지 볼 수 없다. 번들에는 `-outlined`, 문서 예시에는 `-line` 접미 이름이 따로 있다 | 아이콘 이름 정규식 `"ic[o]?n-[a-z0-9-]+"` 검색 | 확인 못 함 |
| 472 | filled 변형의 이름 접미 `*-fill` | `-fill` 로 끝나는 아이콘 이름이 번들과 읽은 문서 예시에 0건. 본 접미는 `-mono`, `-outlined`, `-red`, `-line`, `-color`, `-rounded-light`, `-rounded-dark` | 아이콘 이름 정규식 `"ic[o]?n-[a-z0-9-]+"` 검색 | TDS 침묵 |
| 472 | 사이즈는 16, 20, 24, 32 넷이다 | 틀 `CleanW16, 20, 24, 30, 32, 36, 40, 60, 100`. md 의 넷은 모두 있고, 집합에는 30, 36, 40, 60, 100 이 더 있다 | @286194 `CleanW16:{width:16},CleanW20:{width:20},CleanW24:{width:24},CleanW30:{` | 다름 |
| 472 | `currentColor` 상속 | svg 의 fill 을 currentColor 로 덮고, 감싼 요소의 기본 색을 `b.grey900` 으로 준다(`color` 속성으로 바꾼다) | @276368 `fill: currentColor`, @276324 `FH=pC({color:b.grey900})` | 일치 |
| 472 | filled 변형은 active tab-bar 아이콘에만 쓴다 | TabBar 컴포넌트가 없고 그런 규칙도 없다 | tab-bar 절의 검색 | TDS 침묵 |

### asset (Tossface illustration) (md L476)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 474~476 | asset 은 Tossface 평면 일러스트 자산이다 | `Asset` 은 Icon, Image, Lottie, Video, Text 를 틀에 담는 네임스페이스다. Tossface 는 전역 `body` 글꼴 스택에만 나오고(d.ts 0건) Asset 과 이어지지 않는다 | @271399 `Text:()=>jC,Video:()=>g$` (바로 앞에 Image, Lottie), @142270, 문서 Asset/check-first "다양한 미디어 에셋을 일관된 방식으로 표시" | 다름 |
| 476 | 몸통 `yellow-500` | 일러스트 색 규칙이 코드와 문서에 없다. 찾은 방법: index.js `Tossface` 검색(글꼴 스택 1건), 문서 Asset/check-first, Asset/asset | @142270 | TDS 침묵 |
| 476 | 표정 `brown-900`, `brown-700` | 위와 같음 | 위와 같음 | TDS 침묵 |
| 476 | 빈 상태, 성공 화면, bottom-sheet 헤더에 쓴다 | 사용처 규칙이 문서에 없다. Result 문서 예시가 `figure` 에 `Asset.Image` 를 넣는 것은 있다 | 문서 result `figure={<Asset.Image src=… />}` | TDS 침묵 |
| 476 | 텍스트 inline 에 emoji 대용으로 절대 쓰지 않는다 | 그런 규칙이 코드와 문서에 없다. 사실 하나: 전역 `body` 글꼴 스택에 `'Tossface'` 가 들어 있다 | @142270 `font-family: 'Toss Product Sans', 'Tossface',` | TDS 침묵 |

### progress-bar, progress-stepper (md L504)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 504 | progress-bar 트랙 `grey-200` | `b.grey200` | @865046 | 일치 |
| 504 | progress-bar fill `blue-500` (#3182F6) | 기본 `H.blue400` (#4593fc, oklch(0.666 0.174 257)). 높이 light 2, normal 5(기본), bold 8px | @865232, @864457, 문서 progress-bar "기본값은 blue400 색상이에요" | 다름 |
| 504 | 우측에 `label-s` tabular 퍼센트 라벨 | 속성은 progress, size, color, animate, className 뿐이고 라벨이 없다 | @864587, 문서 progress-bar 인터페이스 표 | TDS 침묵 |
| 504 | progress-stepper 는 26px 원형 node | 기본 variant compact 는 8px 점. icon variant 는 바깥 28px, 안쪽 22px, 글리프 16px. 26 은 없다 | @865569, @877607, @882888, 문서 progress-stepper "compact, icon" | 다름 |
| 504 | node 를 segment 로 잇는다 | 단계 사이를 트랙이 잇는다(compact 트랙 "#EDEFF2") | @877607 | 일치 |
| 504 | 완료 node 는 `blue-500` 채움과 흰 체크 | icon variant 에서 완료(현재가 아닌) node 는 안쪽 `b.background` 채움에 blue500 체크다(색이 반대다) | @882779, @882529 | 다름 |
| 504 | 현재 node 는 `blue-500` 채움 | 활성 node 안쪽 `b.blue500`, 글리프 "#fff" | @884096 | 일치 |
| 504 | 현재 node 에 `blue-50` 4px 글로우 링 | 바깥 고리는 blue500 에 `opacity:.3`, 폭 3px((28-22)/2). compact 는 16px 후광에 blue500 20% | @884096, @877607 | 다름 |
| 504 | 미도달 node 는 `grey-200` 과 `fg-tertiary` | 안쪽 `b.background`, 글리프 grey600(아이콘을 주면 grey500) | @882779, @882529 | 다름 |

### tooltip, bubble (md L512)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 512 | tooltip 은 짧은 보조 설명 | 문서가 같은 쓰임을 적는다 | 문서 tooltip "보조적인 내용을 전달해요" | 일치 |
| 512 | tooltip 표면 `grey-900` | `b.floatBackground` 라이트 #ffffff | @944023, @948919 | 다름 |
| 512 | tooltip 흰 라벨 | `b.grey800` | @949493 | 다름 |
| 512 | tooltip caret | 화살표 svg, `fill:b.floatBackground` | @948919 | 일치 |
| 512 | tooltip `shadow-2` (0 4px 12px navy 0.06, 0 1px 2px navy 0.04) | `{0 또는 ±20}px {16 또는 6}px 60px 0px` `greyOpacity300` (rgba(0,29,58,0.18)). radius small 12, medium 16(기본), large 18 | @944023, @943403 | 다름 |
| 512 | bubble 은 채팅 말풍선 | 문서가 같은 쓰임을 적는다 | 문서 bubble "대화형 UI에서 메시지를 표시하는 데 사용돼요" | 일치 |
| 512 | 상대 발화 배경 `grey-200` | `b.grey200`, 글자 grey800 | @658315 | 일치 |
| 512 | 상대 발화 좌하단 4px 꼬리, `radius 14/14/14/4` | `borderRadius:"16px"` 네 모서리 같음. 꼬리는 모서리 반지름이 아니라 13×17 SVG(`bubble__tail`)이고 left -5px. padding 12px 14px, 최대 폭 253px | @659059, @658719 | 다름 |
| 512 | 본인 발화 배경 `blue-500` 과 흰 텍스트 | `H.blue500`, `H.white` | @658315 | 일치 |
| 512 | 본인 발화 우하단 4px 꼬리, `radius 14/14/4/14` | `borderRadius:"16px"` 네 모서리 같음. 꼬리 SVG right -5px | @659059, @658719 | 다름 |
| 512 | 꼬리 방향: 상대는 왼쪽, 본인은 오른쪽 | 같다(`withTail` 을 줄 때) | 문서 bubble "grey(상대방)일 때 항상 왼쪽, blue(나)일 때 항상 오른쪽" | 일치 |

### post, board-row, table-row, grid-list (md L516)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 516 | post 는 피드 단위(아바타, 작성자와 시간 헤더, 본문, 반응 strip) | `Post` 는 H1~H4, Paragraph, Li, Ol, Ul, Hr 로 된 줄글 스타일 묶음이다 | @607456 `ss={H1:Gee,H2:Yee,H3:Uee,H4:qee,Paragraph:ite,Li:rte,Ol:ete,Ul:tte,Hr:Zee}`, 문서 post "포스트 형식의 줄글을 쓸 때 적용되는 스타일" | 다름 |
| 516 | post 28px 아바타, 작성자와 시간 헤더 | Post 에 아바타, 작성자 헤더 부품이 없다(위 하위 목록) | @607456 | TDS 침묵 |
| 516 | post 본문 `body-3` (13px, 400, 줄높이 1.5) | `Post.Paragraph` 기본 t5(17px), 색 grey700, 줄높이 1.5, padding 0 24px 24px. 쓰임이 다른 컴포넌트의 본문이다 | @607127 `typography:t="t5"`, `color:b.grey700` | 다름 |
| 516 | post 반응 strip(하트, 댓글), active 는 `blue-500` | 반응 부품이 없다 | @607456 | TDS 침묵 |
| 516 | board-row 는 리더보드 행 | `BoardRow` 는 제목을 누르면 펼쳐지는 아코디언이다(title, prefix, icon, isOpened) | @609139, 문서 board-row "아코디언 컴포넌트 같은 역할" | 다름 |
| 516 | board-row 순위 숫자 `blue-500`, 1위는 `grey-900` | 순위 개념이 없다. `BoardRow.Prefix` 기본 색이 blue500 인 것은 같은 색이지만 문서 예시의 "Q" 같은 머리 글자용이라 쓰임이 다르다 | @603250 | TDS 침묵 |
| 516 | board-row 36px 원형 아바타, 우측 tabular 점수 | 아바타, 점수 부품이 없다 | @609139 | TDS 침묵 |
| 516 | table-row 는 라벨, 값, 증감 3열 | `left`, `right` 2열 | @969642, 문서 table-row "좌우로 배치" | 다름 |
| 516 | table-row 1px `grey-200` 헤어라인 구분 | 헤어라인이나 border 선언 없음. 세로 여백 10px(align left 면 16px), 좌우 24px | @969642~970775 | 다름 |
| 516 | table-row 수치는 tabular | 고정폭 숫자 선언이 없다. 찾은 방법: index.js 에서 `tabular`, `tnum` 0건. 글꼴이 기본으로 고정폭 숫자를 내는지는 배포물로 볼 수 없다 | 정규식 검색 | TDS 침묵 |
| 516 | table-row 등락은 시맨틱 색 | 증감 열이 없다. left 글자 grey700, right 글자 grey900, st10(16px) | @970775 | TDS 침묵 |
| 516 | grid-list 2열 격자 | `column` 기본 3 (1, 2, 3 가능) | @698436 `column:o=3`, 문서 grid-list "기본적으로 3열" | 다름 |
| 516 | grid-list 흰 카드 | Item 배경 `b.opacity50` 라이트 rgba(0,23,51,0.02), 누르면 grey100 | @697633 | 다름 |
| 516 | grid-list 카드 `radius-m` (12px) | 9px | @697633 `borderRadius:"9px"` | 다름 |
| 516 | grid-list `blue-50` 아이콘 칩 | 이미지를 `maxHeight:"28px"` 로 놓을 뿐 칩 배경이 없다. 글자 st11 medium, 최소 높이 72px | @697966 | TDS 침묵 |

### bar-chart (md L520)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 520 | 기본 막대 `grey-200` | theme default 는 `b.grey100` | @661265 `default:b.grey100` | 다름 |
| 520 | 강조 막대 `blue-500` (단색) | theme blue 는 `radial-gradient(circle at left bottom, blue300 0%, blue500 66%)`. theme 은 blue, green, yellow, orange, red, grey, default | @660762, 문서 Chart/bar-chart "blue, green, yellow, orange, red, grey, default" | 다름 |
| 520 | 막대 상단만 6px 라운드 | `borderRadius` 를 네 모서리에 같게 주고 값은 막대 폭에서 계산해 3~8px 로 자른다 | @661668, @662250, @660041 `Nre=3,fO=8` | 다름 |
| 520 | axis line 과 divider 를 두지 않는다 | 렌더 트리에 축선, 구분선 요소가 없다(@662133 이후). X축 자리에는 label 글자만 있다 | @662133, 문서 Chart/bar-chart "label: X축에 나타나는 레이블" | 일치 |

### bottom-info, list-footer (md L524)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 524 | bottom-info 는 bottom-cta 위에 얹는 한 줄 보조 안내("수수료 없이 보내요") | 화면 맨 아래에 두는 고지 블록이다 | 문서 bottom-info "법적 고지나 디스클레이머" | 다름 |
| 524 | bottom-info 배경 `blue-50` | `b.greyBackground` 라이트 #f2f4f6 | @633097 `paddingTop:"24px",backgroundColor:b.greyBackground` | 다름 |
| 524 | bottom-info 는 `blue-500` full pill 칩 | borderRadius 선언 없음, 파랑 없음. paddingTop 24px 블록에 아래 160px 그라디언트 | @632867, @633097 | 다름 |
| 524 | list-footer 는 목록 하단의 "더보기" 액션 행 | 문서가 같은 쓰임을 적는다 | 문서 list-footer "더 보기" | 일치 |
| 524 | list-footer 높이 44px | `minHeight:"59px"`, padding 0 24px, 글자 t5 medium | @728898 | 다름 |
| 524 | list-footer 1px `grey-200` 보더 | 기본 `border:"full"`. 1px 높이 요소에 `Ve.tHairlineBackground` (라이트 rgba(0,0,33,0.07) 의 0.5px 선). 흰 바탕 합성 약 #ededf0 로 grey200 (#e5e8eb)과 다르다 | @732447 `border:r="full"`, @729039, @41568 | 다름 |
| 524 | list-footer 우측 chevron, 색 grey-400 | 기본 chevron 이 없다. `icon` 은 호출자가 이름이나 요소로 주고 글자 뒤에 놓이며 기본 색은 `b.blue500` 이다(글자색도 blue500) | @732447 `textColor:a=b.blue500,iconColor:s=b.blue500` | 다름 |

### result, tab, navigation (md L528 가운데)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 528 | result 는 성공, 실패 종료 화면 | 문서가 같은 쓰임을 적는다. 성공, 실패 variant 는 없다 | 문서 result "특정 작업의 결과를 시각적으로 보여주는 페이지 컴포넌트예요" | 일치 |
| 528 | result 중앙 정렬 | 가운데 정렬, padding 32px 40px 40px | @892905 | 일치 |
| 528 | result 시맨틱 원형 아이콘, 성공은 `green-500` | `figure` 슬롯에 호출자가 넣는다. 원형이나 성공 색 규칙이 없다 | @892249, 문서 result "figure 속성을 사용하면 제목 상단에 다양한 시각적 요소를 추가" | TDS 침묵 |
| 528 | result 타이틀과 보조 카피 | `title` (t5 semibold grey900), `description` (t6 grey700), `button` | @892566 | 일치 |
| 528 | result yellow-faced 일러스트 anchor | 규칙이 없다. 문서 예시 하나가 `figure` 에 2d 이모지 PNG 를 넣는다 | 문서 result `<Asset.Image src="…/2d-emojis/…" />` | TDS 침묵 |
| 528 | tab 은 하단 언더라인으로 활성 상태를 표시하는 인라인 탭 | 선택 표시줄이 있다. 선택 글자 grey800, 미선택 grey600 | @968525, @964467 | 일치 |
| 528 | tab 언더라인 두께 2.5px | `height:"2px"`, borderRadius 1px | @968525, @968691 | 다름 |
| 528 | tab 언더라인 색 `blue-500` | `b.grey800` | @968691 `borderRadius:"1px",backgroundColor:b.grey800` | 다름 |
| 528 | navigation 은 화면 상단에 고정되는 바 | `TopNavigation` 컨테이너의 `fixed` 기본값이 false 다(속성으로 켤 수 있다) | @1000031 `fixed:n=!1` | 다름 |
| 528 | navigation 은 앱인토스 전용 | `AppsInToss` 가 index.js, index.d.ts 에 0건. 문서 사이드바에 Navigation, TopNavigation 쪽이 없다. `TopNavigation`, `RootTopNavigation` export 는 있으나 앱인토스 전용이라는 표시가 없다 | @1151958, d.ts@1130433 | TDS 침묵 |
| 528 | 토스 셸 안에서 실행 중임을 알리는 inset 바, 호스트 표기에 토스 심볼 동반 | TopNavigation 에 심볼, 호스트 표기 부품이 없다(leading, content, trailing 슬롯뿐) | d.ts@1132702 | TDS 침묵 |

## Full component coverage 표의 이름 41개 (md L536~576)

이름 규칙: kebab 을 Pascal 로 바꾼 이름이 `@toss/tds-mobile` 의 export 목록(@1151958)에 있으면 "있음". 대소문자만 다른 것은 "있음"으로 치고 적었다. 문서 쪽 유무는 사이드바 링크 목록 기준이다.

| md 줄 번호 | md 의 이름 | TDS export | 문서 쪽 | 결과 |
|---|---|---|---|---|
| 536 | Asset | `Asset` (네임스페이스) | 있음(3쪽) | 있음 |
| 537 | Badge | `Badge` | 있음 | 있음 |
| 538 | Bar-Chart | `BarChart` | 있음(Chart 아래) | 있음 |
| 539 | Board-Row | `BoardRow` | 있음 | 있음 |
| 540 | Border | `Border` | 있음 | 있음 |
| 541 | Bottom-CTA | `BottomCTA` (대소문자만 다름) | 있음(4쪽) | 있음 |
| 542 | Bottom-Info | `BottomInfo` | 있음 | 있음 |
| 543 | Bottom-Sheet | `BottomSheet` | 있음 | 있음 |
| 544 | Bubble | `Bubble` | 있음 | 있음 |
| 545 | Button | `Button` | 있음 | 있음 |
| 546 | Checkbox | `Checkbox` | 있음 | 있음 |
| 547 | Chip | `Chip` | 없음 | 있음 |
| 548 | Dialog | `AlertDialog`, `ConfirmDialog` (`Dialog` 없음) | 있음(Dialog 묶음) | 이름이 다름 |
| 549 | Grid-List | `GridList` | 있음 | 있음 |
| 550 | Icon-Button | `IconButton` | 있음 | 있음 |
| 551 | Keypad | `NumberKeypad`, `AlphabetKeypad`, `FullSecureKeypad` (`Keypad` 없음) | 있음(Keypad 묶음) | 이름이 다름 |
| 552 | List-Footer | `ListFooter` | 있음 | 있음 |
| 553 | List-Header-V3 | `ListHeader` (V3 없음) | 있음(List Header) | 이름이 다름 |
| 554 | List-Row | `ListRow` | 있음(3쪽) | 있음 |
| 555 | Loader | `Loader` | 있음 | 있음 |
| 556 | Menu | `Menu` (객체) | 있음 | 있음 |
| 557 | Navigation---AppsinToss | `TopNavigation`, `RootTopNavigation` (`Navigation`, `AppsInToss` 없음) | 없음 | 이름이 다름 |
| 558 | Numeric-Spinner | `NumericSpinner` | 있음 | 있음 |
| 559 | Post | `Post` | 있음 | 있음 |
| 560 | Progress-Bar | `ProgressBar` | 있음 | 있음 |
| 561 | Progress-Stepper | `ProgressStepper` | 있음 | 있음 |
| 562 | Rating | `Rating` | 있음 | 있음 |
| 563 | Result | `Result` | 있음 | 있음 |
| 564 | Search-Field | `SearchField` | 있음 | 있음 |
| 565 | Segmented-Control | `SegmentedControl` | 있음 | 있음 |
| 566 | Slider | `Slider` | 있음 | 있음 |
| 567 | Stepper | `Stepper` | 있음 | 있음 |
| 568 | Switch | `Switch` | 있음 | 있음 |
| 569 | Tab | `Tab` | 있음 | 있음 |
| 570 | Tab-Bar | 없음 (`TabBar`, `tab-bar`, `tabbar` 0건) | 없음 | 없음 |
| 571 | Table-Row | `TableRow` | 있음 | 있음 |
| 572 | Text-Button | `TextButton` | 있음 | 있음 |
| 573 | Text-Field | `TextField` | 있음 | 있음 |
| 574 | Toast | `Toast` | 있음 | 있음 |
| 575 | Tooltip | `Tooltip` | 있음 | 있음 |
| 576 | Top | `Top` | 있음 | 있음 |

표의 `Components.jsx` 열에 있는 `TButton`, `TabBar`, `TopBar` 는 md 가 번들의 이름이라고 밝힌 것이라 TDS 이름과 맞대지 않았다. 셋 다 TDS export 에는 없다.

### 표 바로 뒤 문단 (md L578)

| md 줄 번호 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|
| 578 | 공개 TDS Mobile 문서가 다루는 컴포넌트는 TextField, Modal, Toast, Dialog, Bottom Sheet 다 | 문서 사이드바의 컴포넌트 쪽이 훨씬 많다: Badge, Board Row, Border, Bottom Info, Bottom Sheet, Bubble, Button, Checkbox, Grid List, Highlight, Icon Button, List Footer, List Header, Loader, Menu, Modal, Numeric Spinner, Paragraph, Post, Progress Bar, Progress Stepper, Rating, Result, Search Field, Segmented Control, Skeleton, Slider, Stepper, Switch, Tab, Table Row, Text Button, Toast, Tooltip, Top, Agreement, Asset, BottomCTA, Chart, Dialog, Keypad, ListRow, TextField | 문서 list-header 쪽 사이드바 링크 목록 | 다름 |
| 578 | 오버레이는 `useDialog`, `useToast`, `useBottomSheet` 훅으로도 열린다 | 문서 사이드바에 세 훅 쪽이 있다 | 문서 사이드바 hooks 묶음 | 일치 |

## 대조하다 알게 된 구조적 사실

- frontmatter 에 `components:` 맵이 없어 컴포넌트 수치는 본문 산문에만 있다.
- md 의 post, board-row, bottom-info 는 TDS 의 같은 이름 컴포넌트와 쓰임이 다르다(TDS: 줄글 스타일, 아코디언, 고지 블록). top-app-bar 에 이름이 가까운 `Top` 도 TDS 에서는 상단 바가 아니라 제목 영역이다.
- TDS 의 떠 있는 표면(Toast top, Dialog, Tooltip, Menu)은 흰색 계열(`floatBackground`)이고 반지름이 크다(BottomSheet 28, Dialog 24, Menu 20, Toast 100 또는 20px). md 는 toast, tooltip 을 `grey-900` 어두운 표면에 반지름 14 로 적는다.
- 딤은 테마에 따라 다르다. 라이트 0.2, 다크 0.56(Dialog, BottomSheet 공통). md 의 0.56 은 다크 값과만 같다.
- Dialog, BottomSheet, 하단 Toast 에는 boxShadow 선언이 없다. 그림자가 있는 것은 상단 Toast, Tooltip, Menu 드롭다운이다.
- Badge 는 size 가 타이포 단계에 묶인 표(글자 크기, 여백, 반지름)로 정해지고 height 선언이 없다. 색은 배지 전용 테마 토큰(`tRedBadgeColor`, `tRedBadgeBackground` 등)을 쓴다.
- `Asset`, `Menu` 는 컴포넌트가 아니라 하위 컴포넌트를 담은 네임스페이스(객체)다. `Dialog`, `Keypad` 는 문서 묶음 이름일 뿐 export 이름이 아니다.
- d.ts 주석과 코드가 어긋나는 곳이 있다. ListRow `horizontalPadding` small 을 주석은 16px 이라 적고 코드는 20px 이다(@781746). `border` 기본값을 주석은 indented 라 적고 코드는 none 이다(@778509 일대).
- 아이콘과 일러스트의 그림 데이터는 번들에 없고 이름이나 URL 로 불러온다. 그래서 아이콘의 모양과 색(토스트 성공 아이콘 등)은 배포물만으로 확인할 수 없다.

## 오프셋 색인

표가 근거로 든 위치마다 그 자리에서 시작하는 글자 200자다(줄바꿈은 `\n` 으로 적었다). 스크립트 `index-cf.js` 가 번들에서 바로 읽어 찍었다. `@숫자` 는 index.js, `d.ts@숫자` 는 index.d.ts 다. 구간으로 적은 근거(`@a~b`)는 시작 위치만 찍었다.

~~~text
@41568  tHairlineBackground:[`repeat-x url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect fill='rgba(0, 0, 33, 0.07)' x='0' y='0' width='1' height='0.5'/></svg>")`
@42400  ,tDangerWeakButtonBackground:[P3,Xo],tDarkWeakButtonBackground:[g3,Xo],tLightWeakButtonBackground:[ah,Xo],tButtonPressedAfterBackground:["transparent","rgba(0, 0, 0, 0.26)"],tPrimaryWeakButtonPressedB
@42850  tGreenBadgeColor:[L3,B3],tGreenBadgeBackground:[b8,C8],tRedBadgeColor:[M3,I3],tRedBadgeBackground:[w8,T8],tYellowBadgeColor:[D3,O3],tYellowBadgeBackground:[R8,S8],tElephantBadgeColor:[eb,c5],tElephant
@42905  tRedBadgeColor:[M3,I3],tRedBadgeBackground:[w8,T8],tYellowBadgeColor:[D3,O3],tYellowBadgeBackground:[R8,S8],tElephantBadgeColor:[eb,c5],tElephantBadgeBackground:[_8,k8],tSwiperBulletBackground:[sh,ih]
@46389  17:{fontSize:10,padding:[3,7],borderRadius:9},18:{fontSize:11,padding:[3,7],borderRadius:10},19:{fontSize:11,padding:[3,7],borderRadius:10},20:{fontSize:11,padding:[3,7],borderRadius:10},21:{fontSize:
@46623  22:{fontSize:12,padding:[3,7],borderRadius:11},23:{fontSize:12,padding:[3,7],borderRadius:11},24:{fontSize:12,padding:[3,7],borderRadius:11},25:{fontSize:12,padding:[3,7],borderRadius:11},26:{fontSize
@46811  26:{fontSize:13,padding:[3,7],borderRadius:12},27:{fontSize:13,padding:[3,7],borderRadius:12},28:{fontSize:13,padding:[3,7],borderRadius:12},29:{fontSize:13,padding:[3,7],borderRadius:12},30:{fontSize
@46999  30:{fontSize:14,padding:[4,8],borderRadius:13},31:{fontSize:14,padding:[4,8],borderRadius:13},32:{fontSize:14,padding:[4,8],borderRadius:13},33:{fontSize:14,padding:[4,8],borderRadius:13},34:{fontSize
@51172  $r=[30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11];function Zt(e,t,r){return`--tds-t-${e}-${t}-${r}`;}function Rc(e){var t;let r={},o=Ro.length,n=dh.length;for(let i=0;i<o;i++){let a=Ro[
@137980  case"primary":return{fill:{backgroundColor:H.blue500,textColor:H.whiteOpacity900},weak:{backgroundColor:new tt(r?H.blue300:H.blue600).setAlpha(r?.15:.22).getRgba(),textColor:r?H.blue600:H.blue400}};ca
@138370  case"dark":return{fill:{backgroundColor:H.grey700,textColor:H.whiteOpacity900},weak:{backgroundColor:b.greyOpacity100,textColor:b.grey700}};case"light":return{fill:{backgroundColor:H.whiteOpacity900,t
@138858  a=o.l>=.8?H.greyOpacity600:"#fff";return{backgroundColor:t.fill.backgroundColor,textColor:t.fill.textColor,dimBackgroundColor:i,gradientColor:n,loaderColor:a};}function H3e(e,t,r,o="primary"){if(o!=="
@142270  font-family: 'Toss Product Sans', 'Tossface', 'SF Pro KR', 'SF Pro Display', 'SF Pro Icons', -apple-system,\n      BlinkMacSystemFont, 'Basier Square', 'Apple SD Gothic Neo', Roboto, 'Noto Sans KR', 'N
@269617  vH=ne(function({as:t="span",style:r,color:o,variant:n,typography:i,...a},s){let l={[rl.fontSize]:R(he.badge.fontSize),[rl.padding]:R(he.badge.padding),[rl.borderRadius]:R(he.badge.borderRadius),...u4e
@270157  fontWeight:"bold",lineHeight:"1.5em",color:R(rl.color),backgroundColor:R(rl.backgroundColor),fontSize:R(rl.fontSize),padding:R(rl.padding),borderRadius:R(rl.borderRadius)}),u4e={"blue-fill":{color:H.w
@270380  blue500},"blue-weak":{color:Ve.tBlueBadgeColor,backgroundColor:Ve.tBlueBadgeBackground},"teal-fill":{color:H.white,backgroundColor:H.teal600},"teal-weak":{color:Ve.tTealBadgeColor,backgroundColor:Ve.t
@270657  "green-weak":{color:Ve.tGreenBadgeColor,backgroundColor:Ve.tGreenBadgeBackground},"red-fill":{color:H.white,backgroundColor:H.red500},"red-weak":{color:Ve.tRedBadgeColor,backgroundColor:Ve.tRedBadgeBa
@270791  "red-weak":{color:Ve.tRedBadgeColor,backgroundColor:Ve.tRedBadgeBackground},"yellow-fill":{color:H.grey800,backgroundColor:H.yellow500},"yellow-weak":{color:Ve.tYellowBadgeColor,backgroundColor:Ve.tYe
@271254  He={};Lf(He,{ContentIcon:()=>ol,ContentImage:()=>VC,ContentLottie:()=>FC,ContentVideo:()=>NC,Frame:()=>qr,Icon:()=>Re,Image:()=>dr,Lottie:()=>Ud,SquircleMasking:()=>Uc,Text:()=>jC,Video:()=>g$,accPosi
@271399  SquircleMasking:()=>Uc,Text:()=>jC,Video:()=>g$,accPosition:()=>t$,frameShape:()=>Vt});import{jsx as n$}from"@emotion/react/jsx-runtime";import{jsx as P4e}from"@emotion/react/jsx-runtime";import{jsx a
@276324  FH=pC({color:b.grey900}),R4e=pC([FH,pC`\n    svg {\n      & [fill] {\n        &:not([fill='none'], [fill^='url'], [fill='context-fill'], [fill='context-stroke'], [fill^='src']) {\n          fill: currentC
@276368  svg {\n      & [fill] {\n        &:not([fill='none'], [fill^='url'], [fill='context-fill'], [fill='context-stroke'], [fill^='src']) {\n          fill: currentColor;\n        }\n      }\n\n      & [stroke] {\n
@284391  SquircleXSmall:{width:24,height:24,acc:{width:10,height:10,x:-2,y:-2}},SquircleSmall:{width:30,height:30,acc:{width:11,height:11,x:-2,y:-2}},SquircleMedium:{width:36,height:36,acc:{width:12,height:12,
@284462  SquircleSmall:{width:30,height:30,acc:{width:11,height:11,x:-2,y:-2}},SquircleMedium:{width:36,height:36,acc:{width:12,height:12,x:-2,y:-2}},SquircleLarge:{width:40,height:40,acc:{width:14,height:14,x
@284603  SquircleLarge:{width:40,height:40,acc:{width:14,height:14,x:-2,y:-2}},SquircleXLarge:{width:52,height:52,acc:{width:18,height:18,x:-3,y:-3}},Squircle2XLarge:{width:60,height:60,acc:{width:20,height:20
@284744  Squircle2XLarge:{width:60,height:60,acc:{width:20,height:20,x:-3,y:-3}},SquareSmall:{width:40,height:40,radius:10,acc:{width:14,height:14,x:-3,y:-3},overlap:{x:5,y:5,blur:0,spread:-1}},SquareMedium:{w
@286194  CleanW16:{width:16},CleanW20:{width:20},CleanW24:{width:24},CleanW30:{width:30},CleanW32:{width:32},CleanW36:{width:36},CleanW40:{width:40},CleanW60:{width:60},CleanW100:{width:100},CleanW250:{width:2
@287846  SquircleMasking"),s=F4e[t],l=(i=a?.width)!==null&&i!==void 0?i:V4e[t];return BC("div",{ref:n,role:"img",...o,css:{display:"flex",width:l,height:l,clipPath:s},children:BC("svg",{viewBox:`0 0 ${l} ${l}`
@297929  semibold:{[fr]:600},bold:{[fr]:700}},wIe=bIe({verticalAlign:"middle",maxWidth:"100%",margin:0,padding:0,color:R(fo,b.grey900),fontSize:R(he.text.fontSize),lineHeight:R(he.text.lineHeight),fontWeight:R
@489031  ,qX=ALe(function({open:t,higherThanCTA:r,text:o,button:n,leftAddon:i,duration:a,onClose:s,"aria-live":l="polite",onExited:c,style:u,...f},d){let p=UX(null),{colorScheme:g}=ae(),[m,h]=iI("single"),[x,v
@491121  typography:"t6",fontWeight:"semibold",color:H.floatBackground,children:t}),r]})]});}var KX=({textLine:e,button:t})=>e==="single"&&!t?{[fT]:"max-content"}:{[fT]:"calc(100vw - 40px)"},ZX=({leftAddon:e,b
@491447  single:{[$0]:"100px"},multi:{[$0]:"20px"}})[e],JX=({colorScheme:e})=>({light:{[dT]:H.grey500,[W0]:H.greyOpacity400},dark:{[dT]:b.grey200,[W0]:H.whiteOpacity100}})[e],MLe={position:"fixed",bottom:0,lef
@491518  light:{[dT]:H.grey500,[W0]:H.greyOpacity400},dark:{[dT]:b.grey200,[W0]:H.whiteOpacity100}})[e],MLe={position:"fixed",bottom:0,left:"50%",zIndex:3e4,transform:"translateX(-50%)"},eK=vu({width:R(fT),max
@492132  VLe=vu({width:"24px",height:"24px",marginRight:"12px",div:{display:"flex"}}),FLe=vu({zIndex:-1,borderRadius:R($0),overflow:"hidden"});import{jsx as oa,jsxs as fI}from"@emotion/react/jsx-runtime";impor
@494481  light:{[cI]:"white",[uI]:H.greyOpacity800},dark:{[cI]:H.darkThemeGrey200,[uI]:"white"}})[e],$Le={position:"fixed",top:0,left:"50%",zIndex:3e4,transform:"translateX(-50%)"},tK=18,lK=G0({width:"max-cont
@494754  boxShadow:`0 2px 30px ${H.greyOpacity200}`,userSelect:"none",margin:`0 ${tK}px`,overflow:"hidden",borderRadius:R(hT),wordBreak:"break-all"}),WLe=G0({touchAction:"none"}),zLe=G0({overflow:"hidden",disp
@497392  function mK({frameShape:e,...t}){return t8e(Re,{frameShape:{width:24,height:24,...e},scale:1,scaleType:"fit",loop:!1,...t});}import{jsx as r8e}from"@emotion/react/jsx-runtime";function gK({frameShape:
@497693  function pi({position:e="bottom",...t}){return e==="bottom"?hK(qX,{...t}):hK(oK,{...t});}pi.Button=pK;pi.Icon=mK;pi.Lottie=gK;var bT;function Rp({exitOnUnmount:e=!0}={}){let t=Zn({exitOnUnmount:e}),r=
@506012  w8e={ios:44,android:54};function ut({children:e,limit:t,minLimit:r,className:o,asChild:n=!1,stylePropName:i="style"}){let a=X0({limit:t,minLimit:r}),s=q0({limit:t,minLimit:r}),l=T8e(()=>({...a,...s}),
@602249   Cx=ne(function({style:t,variant:r,color:o,size:n,...i},a){return JNe(K.Badge,{ref:a,variant:r,color:o,typography:eHe[n],style:{...t,fontWeight:tHe[n]},...Ze("Badge"),...i});}),eHe={xsmall:"t5",small:
@603250  zee=aHe(function({children:t,color:r=b.blue500,...o},n){let{isExpanded:i}=uR("BoardRow.Prefix");return iHe(K.Text,{ref:n,typography:"t5",fontWeight:i?"medium":"regular",color:r,css:{lineHeight:Me("lin
@607127  typography:t="t5",children:r,paddingBottom:o=0,style:n,...i},a){let s={[ate]:pt(o),[he.text.lineHeight]:Me("line-height-m"),...n};return yHe(K,{as:"p",typography:t,color:b.grey700,ref:a,css:THe,style:
@607456  ss={H1:Gee,H2:Yee,H3:Uee,H4:qee,Paragraph:ite,Li:rte,Ol:ete,Ul:tte,Hr:Zee};var ste=SHe(function(t,r){return RHe(ss.Paragraph,{ref:r,typography:"t6",paddingBottom:0,style:{[he.text.lineHeight]:Me("line
@609139  hte=TM(function({className:t,isOpened:r=!1,onOpen:o,onClose:n,title:i,prefix:a,icon:s,liAttributes:l,contentId:c,children:u,headerId:f},d){let[p,g]=gte(!1),m=st(),h=st(),{wrapperRef:x,backgroundRef:v,
@614632  ,lt=ne(function({as:t="button",color:r="primary",variant:o="fill",display:n="inline",size:i="xlarge",type:a,style:s,className:l,loading:c=!1,disabled:u=!1,inert:f,...d},p){let g=WE(),{colorScheme:m}=a
@616318  loading:{opacity:0,color:R(fo),transition:ee.quick},loadingWhileDisabled:{opacity:0,color:R(fo),transition:ee.quick},disabled:{opacity:w$e({variant:o}),color:R(xe.disabledTextColor),transition:ee.quic
@616677  loading:{opacity:[0,b$e({variant:o})],transition:{repeat:1/0,repeatType:"reverse",ease:j.out,duration:.6}},loadingWhileDisabled:{opacity:[0,C$e({variant:o})],transition:{repeat:1/0,repeatType:"reverse
@617497  transition:{delay:.1,repeat:1/0,repeatType:"reverse",duration:.3},style:{backgroundColor:u?R(xe.disabledLoaderColor,R(xe.loaderColor)):R(xe.loaderColor)}}),Bl(F.div,{css:AM,initial:{opacity:.2,scale:.
@618499  large:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"14px",[xe.minWidth]:"80px",[xe.minHeight]:"48px",[xe.padding]:"2px 16px",[xe.loaderSize]:"8px",[xe.loaderGap]:"5px"},medium:{[xe.fontSize]:ce.t6.
@620852  background:`radial-gradient(closest-side, ${R(xe.gradientColor)} 0%, transparent 100%)`}),I$e=Bu({position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",display:"flex",gap:R(xe.loa
@632867  jM=BWe(function({bottomGradient:t=jWe,children:r,style:o,...n},i){let a=t!=="none";return DWe("div",{ref:i,style:o,...n,children:[VM("div",{css:LWe,children:r}),a?VM("div",{css:VWe,style:{background:t
@633097  LWe=FM({paddingTop:"24px",backgroundColor:b.greyBackground}),VWe=FM({height:160}),FWe=FM({paddingBottom:"24px",backgroundColor:b.greyBackground}),jWe=`linear-gradient(${b.greyBackground}, rgba(255,255
@637953  _R={light:{normal:.2,darker:.4},dark:{normal:.56,darker:.8}};function Zte({children:e,open:t}){let{height:r}=us(),{colorScheme:o}=ae(),{ref:n,rally:i}=Ee({motion:{opacity:{to:_R[o].normal},easing:N.qu
@650249  Nze=Ax({position:"relative",userSelect:"none",backgroundColor:b.layeredBackground,borderRadius:"28px",width:"calc(100% - 20px)",overflow:"hidden",outline:"none"}),Hze=Ax({display:"flex",flexDirection:
@650802  width:"48px",height:"4px",borderRadius:"5px",backgroundColor:b.grey200}});import{jsx as Gze}from"@emotion/react/jsx-runtime";import{css as Yze}from"@emotion/react";function oO(){let{dimmerRallyRef:e}=
@651088  Uze=Yze({width:"100%",height:"100%",opacity:0,backgroundColor:"rgba(0,0,0)"});function Xze({disableDimmer:e=!1,hasTextField:t=!1,onDimmerClick:r,onExited:o,...n}){let{height:i}=us(),a=ire(),{style:s}=
@658239  function sO(e){let{background:t,withTail:r=!0,children:o,style:n,...i}=e,a={[No.backgroundColor]:t==="blue"?H.blue500:b.grey200,[No.textColor]:t==="blue"?H.white:b.grey800,[No.tailLeft]:t==="blue"?voi
@658315  [No.backgroundColor]:t==="blue"?H.blue500:b.grey200,[No.textColor]:t==="blue"?H.white:b.grey800,[No.tailLeft]:t==="blue"?void 0:Mre,[No.tailRight]:t==="blue"?Mre:void 0,[No.tailTransform]:t==="blue"?v
@658719  className:"bubble__tail",css:vGe,xmlns:"http://www.w3.org/2000/svg",width:"13",height:"17",viewBox:"0 0 13 17",children:aO("path",{d:"M11.992 17c1.102.007 1.404-1.512.383-1.926-2.652-1.078-4.503-3.718
@659059  xGe=Ore({display:"inline-block",borderRadius:"16px",padding:"12px 14px",maxWidth:"253px",whiteSpace:"pre-wrap",background:ar(No.backgroundColor),color:ar(No.textColor),margin:ar(No.containerMargin),po
@660041  Nre=3,fO=8,Vre=6,Fre="--bar-chart-padding-x",jre="--bar-chart-padding-y",dO=fs({[Fre]:`${RGe}px`,[jre]:`${cO}px`,padding:`${R(jre)} ${R(Fre)}`,overflow:"hidden"}),pO=fs({height:"100%",width:"100%",fle
@660762  Yre={blue:`radial-gradient(circle at left bottom, ${b.blue300} 0%, ${b.blue500} 66%)`,green:`radial-gradient(circle at left bottom, ${b.green200} 0%, ${b.green400} 66%)`,yellow:`radial-gradient(circle
@661265  default:b.grey100},Ure={blue:b.blue700,green:b.green800,yellow:b.yellow900,orange:b.orange900,red:b.red700,grey:b.grey700,default:b.grey500};var VR=({theme:e,radius:t,children:r,...o})=>LR(Lre,{theme:
@661668  style:{height:l,background:Yre[r??a],borderRadius:s,...o},...n});},hO=ne(({theme:e,...t},r)=>{let{theme:o}=lO("Bar");return LR(K.Text,{ref:r,typography:"st12",color:Ure[e??o],fontWeight:"semibold",css
@662133  ,vO=SGe(({data:e,height:t=205,style:r,fill:o,...n},i)=>{let[a,s]=kGe(fO),l=yl(u=>{let f=u.contentRect.width/e.length;s(EGe(Nre,Math.floor(f*(uO/Ix)/5+2),fO));}),c=_Ge(()=>{let u=e.reduce((f,d)=>Math.m
@662250  s(EGe(Nre,Math.floor(f*(uO/Ix)/5+2),fO));}),c=_Ge(()=>{let u=e.reduce((f,d)=>Math.max(f,d.value),0);return e.map((f,d)=>{var p,g,m,h;let x=e.length-d-1,v;switch(o.type){case"all-bar":v=(p=f.theme)!==n
@680064  RO={light:.2,dark:.56},poe=doe({position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1e4,backgroundColor:"rgba(0,0,0)"}),moe=doe({position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%
@680323  maxWidth:"320px",maxHeight:"calc(100vh - 160px)",backgroundColor:b.floatBackground,borderRadius:"24px",...c0({outline:"none"})});var sn=({open:e,children:t,onExited:r,portalContainer:o,...n})=>$u(Ht,{
@682317  ZR=Vl({display:"flex",flexDirection:"column",gap:"8px",overflow:"auto",padding:"22px 22px 0","&:focus":{outline:"none"}}),QR=Vl({width:"100%"}),yoe=Vl({display:"flex",flexWrap:"wrap-reverse",margin:"2
@682461  yoe=Vl({display:"flex",flexWrap:"wrap-reverse",margin:"20px 16px 16px",flex:"none",gap:"8px","& > *":{minWidth:"calc(50% - 8px)",flexGrow:1}}),boe=Vl({padding:"6px 12px",margin:0,textAlign:"right"}),C
@682921  typography:o="t6",fontWeight:n="medium",style:i,...a}){let s={...i,[he.text.lineHeight]:Me("line-height-m")};return woe(K,{as:t,css:voe,color:r,typography:o,fontWeight:n,style:s,...a,children:woe(K.Te
@683244  typography:o="t4",fontWeight:n="bold",style:i,...a}){let s={...i,[he.text.lineHeight]:Me("line-height-s")};return Toe(K,{as:t,css:xoe,color:r,typography:o,fontWeight:n,style:s,...a,children:Toe(K.Text
@683692  Soe=ne(function({color:t="dark",variant:r="weak",size:o="large",...n},i){return fUe(lt,{ref:i,color:t,variant:r,size:o,...n});});import{jsx as dUe}from"@emotion/react/jsx-runtime";var _oe=ne(function(
@683876  _oe=ne(function({size:t="large",...r},o){return dUe(lt,{ref:o,size:t,...r});});var mUe=pUe(function({open:t,title:r,description:o,cancelButton:n,confirmButton:i,closeOnDimmerClick:a=!0,closeOnBackEven
@683959  mUe=pUe(function({open:t,title:r,description:o,cancelButton:n,confirmButton:i,closeOnDimmerClick:a=!0,closeOnBackEvent:s=!0,onEntered:l,onExited:c=hUe,onClose:u,portalContainer:f,...d},p){let{backEven
@694671   Hx=ne(function(t,r){let{as:o="div",size:n="medium",type:i="primary",label:a,style:s,...l}=t;Yoe();let c={...NUe[i],...jUe[n],...s};return VUe(o,{ref:r,css:$Ue,style:c,...(!a&&{role:"image","aria-labe
@697633  itemWrapper:$x({position:"relative",height:"100%",backgroundColor:b.opacity50,transition:"background-color 0.2s ease","&:active":{backgroundColor:b.grey100},borderRadius:"9px",overflow:"hidden"}),item
@697966  itemImageWrapper:$x({maxHeight:"28px",objectFit:"contain","img, svg":{verticalAlign:"top",lineHeight:0}})},rqe=$x({position:"fixed",left:"50%",top:"50%",transform:"translate(-50%, -50%)",minWidth:"200
@698436  aqe=iqe((e,t)=>{let{style:r,column:o=3,children:n,...i}=e,s=Te({biggerThanOrEqualTo:160})&&o===3,l={[VO]:s?2:o,...r};return oqe("ul",{ref:t,css:sqe,style:l,...i,children:n});}),FO=Object.assign(aqe,{I
@728898  Kne=fm({minHeight:"59px",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",zIndex:0,backgroundColor:b.background}),Zne=fm({width:"100%",height:"1px",background:Ve.tHairlineBa
@729039  Zne=fm({width:"100%",height:"1px",background:Ve.tHairlineBackground}),Qne=fm({opacity:0,zIndex:-1,content:'""',position:"absolute",top:0,left:"50%",transform:"translate(-50%, -50%)",width:"120%",paddi
@732447  iie=oKe(function({children:t,border:r="full",icon:o,hairline:n,shadow:i,textColor:a=b.blue500,iconColor:s=b.blue500,...l},c){let{colorScheme:u}=ae(),[f,d]=nie(a),[p,g]=nie(s),m=tie({textColor:f,iconCo
@737496  xie=ne(function({as:t="div",size:r="medium",title:o,titleWidthRatio:n=.6,description:i,descriptionPosition:a="top",right:s,rightAlignment:l="center",verticalPadding:c="medium",horizontalPadding:u="med
@751666  Die=qe(({variant:e="none",shape:t="squircle",size:r="small",paddingX:o=!1,backgroundColor:n,acc:i,accMasking:a,accPosition:s,alt:l,as:c="span",style:u,className:f,name:d,src:p,url:g,color:m,...h},x)=>
@767273  vs("animate",{attributeName:"offset",values:`${-l}; ${-l}; 1`,keyTimes:C,dur:w,repeatCount:"indefinite"})}),vs("stop",{offset:"50%",stopColor:a,stopOpacity:s,children:r&&vs("animate",{attributeName:"o
@767744  Jie=_Qe(function({type:t="square",verticalPadding:r="medium",style:o,...n}){let i=st(),a=(()=>{switch(r){case"large":return 32;case"medium":return 24;case"small":return 16;case"extraSmall":return 8;}}
@769957  case"Right1RowTypeA":return rt(zl,{color:b.grey800,fontWeight:"regular",typography:"t5",top:t.top,...t.topProps,marginTop:t.marginTop});case"Right1RowTypeB":return rt(zl,{color:b.grey800,fontWeight:"m
@770500  case"Right1RowTypeE":return rt(zl,{color:b.grey800,fontWeight:"bold",typography:"t5",top:t.top,...t.topProps,marginTop:t.marginTop});case"2RowTypeA":return rt(wi,{top:t.top,bottom:t.bottom,topProps:{t
@778509  verticalPadding:i="medium",horizontalPadding:a="medium",left:s,leftAlignment:l="center",a11yLeftAlignment:c="top",a11yRightReflow:u=!0,right:f,rightAlignment:d="center",contents:p,withArrow:g=!1,arrow
@779712  [de.leftGap]:s?"12px":"0px",[de.gap]:A&&u?"4px":"16px",[de.hairLine]:UQe[r],[de.rightAlignSelf]:YQe[d],[de.leftAlignSelf]:GQe[A?c:l],[de.verticalPadding]:WQe[i],[de.horizontalPadding]:zQe[a],...v},G=x
@781461  ,wD=Object.assign($Qe,{},{AssetIcon:Die,AssetImage:Bie,AssetText:Vie,AssetLottie:Lie,IconButton:Nie,ImageContainer:DS,LeftContainer:Xie,Loader:Jie,Texts:yD,Text:Ci,Typography:NQe,Icon:jie,FillIcon:Fie
@781687  WQe={small:"8px",medium:"12px",large:"16px",xlarge:"24px"},zQe={small:"20px",medium:"24px"},GQe={top:"flex-start",center:void 0},YQe={top:"flex-start",center:void 0},UQe={indented:Ve.tHairlineBackgrou
@781746  zQe={small:"20px",medium:"24px"},GQe={top:"flex-start",center:void 0},YQe={top:"flex-start",center:void 0},UQe={indented:Ve.tHairlineBackground,none:"transparent"},qQe=Wo({display:"flex",alignItems:"c
@781983  "44px",backgroundColor:"transparent",listStyle:"none",overflow:"hidden",outline:"none","::before":{content:"''",position:"absolute",top:0,left:0,marginLeft:"24px",width:"calc(100% - 24px)",height:"1px
@851374  r6={Dropdown:wae,DropdownItem:jS,DropdownCheckItem:NS,DropdownIcon:Tae,Header:HS,Trigger:jse};import{jsx as b2}from"@emotion/react/jsx-runtime";import{forwardRef as m6,useState as ztt}from"react";impo
@864457  ale={light:{height:"2px",borderRadius:"2.5px"},normal:{height:"5px",borderRadius:"2.5px"},bold:{height:"8px",borderRadius:"4px"}};function h6(e){let{progress:t,size:r="normal",style:o,color:n,animate:
@864587  function h6(e){let{progress:t,size:r="normal",style:o,color:n,animate:i=!1,...a}=e,[s,l]=Ytt(!i);return Utt(()=>{let c=window.setTimeout(()=>{l(!0);});return()=>{window.clearTimeout(c);};},[]),nle("di
@865046  self:ile({position:"relative",backgroundColor:b.grey200,overflow:"hidden",transform:"translateZ(0)",height:"var(--height)",borderRadius:"var(--borderRadius)","& + &":{marginTop:"8px"}}),filler:ile({po
@865232  filler:ile({position:"absolute",left:"-100%",height:"100%",width:"100%",backgroundColor:H.blue400,transformOrigin:"left",willChange:"transform",transition:"transform 0.5s ease-in-out",borderRadius:"va
@865569  Pe("ProgressStepper",{variant:"compact",activeStepIndex:0,stepLength:0,a11yVerticalReflow:!0,isBiggerThanOrEqualTo275:!1});import{jsx as C6,jsxs as qtt}from"@emotion/react/jsx-runtime";import{css as w
@877607  d={[Zl]:f?"10px":"8px",[_2]:f?"20px":"16px",[cf]:f||u?"auto":l?"start":c?"end":"auto",[ng]:a==="dark"?V8("background"):H.whiteOpacity800,[y6]:a==="dark"?"30%":"20%"};return s?fg("div",{style:d,css:wrt
@882529  v=p?Ql(vle,{}):o||Ql(yle,{number:f+1}),y=h?"center":g?"start":m?"end":"center",C={[tg]:l===3?"100%":void 0,[lg]:x?"auto":h?"50px":"100%",[cg]:h?r?1:"initial":1,[k2]:y,[rg]:x?"row":"column",[og]:x?"12p
@882779  [ng]:d?b.blue500:b.background,[v6]:d?b.blue500:"transparent",[b6]:d?"#fff":p?b.blue500:o?b.grey500:b.grey600,[T2]:x?"38px":"28px",[R2]:x?"30px":"22px",[S2]:x?"22px":"16px",[ig]:x?void 0:"100%",[ag]:x?
@882888  [T2]:x?"38px":"28px",[R2]:x?"30px":"22px",[S2]:x?"22px":"16px",[ig]:x?void 0:"100%",[ag]:x?"34px":"initial",[sg]:x?void 0:y,...n};return Srt("div",{ref:t,style:C,css:Ert,...krt({title:r,stepIndex:f,st
@884096  backgroundColor:R(v6),borderRadius:"50%",opacity:.3}}),Prt=Iv({position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:R(R2),height:R(R2),borderRadius:"50%",backgroundColo
@892249  tot=eot(function({figure:t,title:r,description:o,button:n,className:i,style:a,...s},l){let c=r!=null,u=o!=null,f={[$2.figureMarginBottom]:c||u?"12px":"0px",[$2.descriptionMarginTop]:c?"4px":"0px",...a
@892566  typography:"t5",fontWeight:"semibold",color:b.grey900,as:"h5",children:r}),o&&H2(K.Text,{typography:"t6",color:b.grey700,css:not,as:"p",children:o}),n&&Kle(Qrt,{children:[H2("div",{css:iot}),Jrt(n,{si
@892905  rot=W2({display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",backgroundColor:"transparent",height:"100%",padding:"32px 40px 40px 40px"}),oot=W2({display
@921431  function nc({index:e=0,children:t,style:r}){return iit(ge.div,{animate:{opacity:{from:.2,to:1},scale:{from:.96,to:1},easing:j.ease,duration:.6},delay:e*.1,playCount:"infinite",loopMode:"alternate",sty
@923916  amountTopList:["spacer(48)","subtitle","title","spacer(40)","list"],amountTopListWithIcon:["spacer(48)","subtitle","title","spacer(40)","listWithIcon"],subtitleList:["subtitle","spacer(24)","list"],su
@924246  ,yit=hit(function({className:t,style:r,height:o="auto",pattern:n="topList",custom:i,repeatLastItemCount:a=3,play:s="show",background:l="grey",...c}){let{style:u}=Bv(),f=i??vit[n],d=a==="infinite"||n==
@943403  Aat={small:{borderRadius:12,padding:"8px 12px"},medium:{borderRadius:16,padding:"13px 16px"},large:{borderRadius:18,padding:"13px 20px"}},Pat={none:0,left:-20,right:20},Iat={"bottom-none":{},"bottom-l
@944023  boxShadow:`${u}px ${c}px 60px 0px ${r==="light"?H.greyOpacity300:H.greyOpacity900}`,backgroundColor:b.floatBackground},...i});});import{jsx as Mat}from"@emotion/react/jsx-runtime";import{forwardRef as
@948919  return Yat(wse,{ref:l,context:r??s.context,fill:b.floatBackground,staticOffset:d(o),...u,...i});}),Xat=(e,t)=>e==="left"&&t==="bottom"||e==="right"&&t==="top"?"left":e==="right"&&t==="bottom"||e==="le
@949493  return Kat(K.Text,{ref:n,color:b.grey800,...Zat[t??i.size],style:a,...o});});import{jsx as Qat}from"@emotion/react/jsx-runtime";import{cloneElement as Jat,forwardRef as est,isValidElement as tst}from"
@964467  "--color":r?b.grey800:b.grey600},children:[A_("div",{ref:S,children:A_("span",{ref:p,children:l})}),n?A_("div",{className:"tab__redBean",css:SB.redBean}):null]})});}var SB={self:RB({position:"relative
@968525  indicator:Gv({position:"relative",bottom:0,left:0,height:"2px",zIndex:0,padding:"0 10px","&::after":{content:'""',display:"block",position:"relative",bottom:0,left:0,borderRadius:"1px",backgroundColor
@968691  borderRadius:"1px",backgroundColor:b.grey800,height:"100%",width:"100%"}}),fluid:Gv({".tab__item":{flex:"none"},".tab__item-title":{overflow:"visible","&::after":{content:"none"}},".tab__redBean":{rig
@969642  AB=ne(({left:e,leftRatio:t,leftBackgroundColor:r,leftFontWeight:o="regular",right:n,rightBackgroundColor:i,rightFontWeight:a="regular",align:s,style:l,...c},u)=>{let f=Te({biggerThanOrEqualTo:160}),d=
@970775  jlt=EB({width:R(Pi.width),flex:"none",color:b.grey700,whiteSpace:"pre-wrap",paddingTop:R(Pi.paddingTop),paddingBottom:R(Pi.paddingBottom),paddingLeft:R(Pi.paddingLeft),paddingRight:R(Pi.paddingRight)}
@993949  mde=ne(function({as:t="div",style:r,upperGap:o=24,lowerGap:n=24,upper:i,subtitleTop:a,title:s,subtitleBottom:l,lower:c,right:u,rightVerticalAlign:f="center",...d},p){let g=Te(Wn.rightButton),m={[gc.up
@1000031  fixed:n=!1,withSafeAreaTop:i=!0,scrollBackground:a,scrollOffset:s=0,className:l,style:c,css:u,...f},d){let p=Ade({offset:s,enabled:a!=null}),g=Z0({withSafeAreaTop:i}),m=i?Y0:"0px",h=a!=null&&p?a:o,v={
@1000703   QB=ne(function({leading:t=Cy(Ede,{}),content:r,trailing:o,style:n,className:i,...a},s){let{os:l}=re(),c=l==="ios",u=t!=null,f=r!=null&&(typeof r=="function"||typeof r=="object"),d={gridTemplateColumn
@1000885  gridTemplateColumns:c?"1fr auto 1fr":"auto 1fr auto",...n};return qut(F_,{ref:s,style:d,className:i,css:Xut,...a,children:[Cy("div",{css:Kut,style:{paddingLeft:u?c?2:4:24},children:t}),Cy(ut,{limit:13
@1001122  typography:"t5",fontWeight:"semibold",style:{paddingLeft:c||f||!u?0:20},children:r})}),Cy("div",{css:Qut,children:o})]});}),Xut=j_({display:"grid",alignItems:"center"}),Kut=j_({display:"flex",justifyS
@1001774  tL=ne(function({content:t,trailing:r,style:o,className:n,...i},a){let s=r!=null,l=t!=null&&(typeof t=="function"||typeof t=="object"),c={paddingRight:s?0:24,...o};return Jut(F_,{ref:a,style:c,classNam
@1002724  wy=qe(function({redDot:t,count:r,className:o,children:n,style:i,...a},s){let l=r?nft(r.value):null;return oft(ds,{ref:s,bgColor:b.greyOpacity100,color:b.greyOpacity700,iconSize:24,style:{borderRadius:
@1151958  export{aL as AccessoryButton,Eu as AgreementModuleContent,Au as AgreementModuleStagger,Du as AgreementModuleTop,nn as AgreementModuleTopTitle,NP as AgreementV3,II as AgreementV4,nu as AlertDialog,dS a
d.ts@81202  export declare namespace Asset {\n    export {\n        Icon_2 as Icon,\n        Image_2 as Image,\n        Lottie,\n        Text_3 as Text,\n        Video,\n        ContentIcon,\n        ContentImage
d.ts@100567  size: 'large' | 'medium' | 'small' | 'xsmall';\n}\n\ndeclare const BAR_THEME: readonly ["blue", "green", "yellow", "orange", "red", "grey", "default"];\n\n/**\n * @public tds\n * @name BarChart\n * @p
d.ts@123654  Chip\n * @param {ChipProps} props\n * @tag div\n */\nexport declare const Chip: ComponentWithAs<"div", ChipProps>;\n\n/**\n * @public tds\n * @name ChipItem\n * @param {ChipItemProps} props\n * @tag b
d.ts@186802  type ExportedListHeader = typeof Root_3 & {\n    DescriptionParagraph: typeof DescriptionParagraph;\n    TitleParagraph: typeof TitleParagraph;\n    TitleSelector: typeof TitleSelector_2;\n    TitleTe
d.ts@254133  export declare interface ListRowProps {\n    /**\n     * `ListRow` 컴포넌트의 구분선 스타일을 설정해요.\n     *\n     * - `indented`: 왼쪽에 들여쓰기가 적용된 구분선이에요.\n     * - `none`: 구분선이 없는 스타일이에요.\n     * @default indented
d.ts@255654  contents?: ReactNode;\n    /**\n     * `ListRow` 컴포넌트의 오른쪽 영역에 들어갈 요소를 설정해요.\n     */\n    right?: ReactNode;\n    /**\n     * 오른쪽 영역 요소의 수직 정렬을 설정해요.\n     * @default center\n     */\n    rightAlignm
d.ts@261023  export declare const Menu: {\n    Dropdown: ForwardRefExoticComponent<Omit<MenuDropdownProps, "ref"> & RefAttributes<HTMLDivElement>>;\n    DropdownItem: ForwardRefExoticComponent<MenuDropdownItemProp
d.ts@262648  interface MenuTriggerProps extends ComponentPropsWithoutRef<'div'> {\n    /**\n     * 메뉴의 열림을 제어하는 상태예요.\n     * 이 속성을 사용하려면 `onOpen`과 `onClose`도 함께 전달해서 제어 컴포넌트로 설정해야 해요.\n     */\n    open?: boolean
d.ts@263179  @default 'bottom-start'\n     */\n    placement?: Placement;\n    /**\n     * 메뉴가 열릴 때 호출되는 함수예요.\n     * 전달하지 않을 경우, uncontrolled component로 동작해요.\n     */\n    onOpen?: () => void;\n    /**\n     * 
d.ts@1121674  declare interface ToastBottomProps extends HTMLAttributes<HTMLDivElement> {\n    /**\n     * `Toast` 컴포넌트의 열림 상태를 제어해요.\n     */\n    open: boolean;\n    /**\n     * `Toast` 컴포넌트 뒤의 배경 블러 효과를 적용할지 결정해
d.ts@1124782  type ToastProps = (ToastTopProps & {\n    position: 'top';\n}) | (ToastBottomProps & {\n    position: 'bottom';\n});\n\ndeclare interface ToastTopProps extends HTMLAttributes<HTMLDivElement> {\n    /*
d.ts@1130433  export declare const TopNavigation: ComponentWithAs<"nav", TopNavigationProps>;\n\n/**\n * @public tds\n * @name TopNavigationBackButton\n * @param {TopNavigationBackButtonProps} props\n * @implements
d.ts@1132702  interface TopNavigationProps extends Omit<TopNavigationContainerProps, 'children'> {\n    /**\n     * TopNavigation의 좌측에 표시될 내용을 지정해요. 주로 TopNavigationBackButton 컴포넌트가 들어가요.\n     *\n     * @default 네
~~~
