# 토스 문서 대 TDS Mobile 대조표: 버튼, 입력, 선택 컴포넌트

대조일 2026-11-23. 읽기 전용 대조이고 저장소 파일은 건드리지 않았다. 사실만 적고 고칠지 말지는 적지 않는다.

## 읽는 법

- **md**: `services/toss.md` (워크트리 `preview-structure-base`). 줄 번호는 그 파일 기준.
- **index.js**: `.claude/cache/design-md/toss/upstream-631/mobile/package/dist/esm/index.js` (`@toss/tds-mobile` 2.5.1). 근거 칸의 `@숫자`는 이 파일을 UTF-8 로 읽은 **JS 문자열 인덱스**다. 파일은 1,156,908 바이트이지만 문자열 길이는 1,156,674 라서 바이트 단위 도구로 찍으면 어긋난다. 확인은 `node -e "const t=require('fs').readFileSync(F,'utf8');console.log(t.slice(오프셋,오프셋+길이))"`. 조각 끝의 `…`는 표에서만 줄였다는 뜻이고 오프셋은 조각의 첫 글자다. `@숫자` 바로 뒤에 코드 조각이 붙은 근거(156개 키)는 `resolve.js` 가 `t.slice(off, off+len) === 조각` 으로 확인한 뒤 써 넣었다(조각 원본은 같은 폴더 `ev.txt`). 손으로 적은 오프셋은 따로 한 번 대조했다: `d.ts@` 다섯 개, @148561, @511706, @613762, backdropFilter 여섯 곳과 `backdrop-filter` 세 곳. "@a~b" 꼴의 범위는 읽은 구간을 가리키는 대략의 경계이고 대조 대상이 아니다.
- **d.ts**: 같은 폴더의 `index.d.ts`. `d.ts@숫자`도 JS 문자열 인덱스.
- **색 풀이**: 코드의 `H.*` 는 고정 라이트 값(`@43939 `var H={...Pa},b={...m3}``, 예 `@31715 `E3="#3182f6"``), `b.*` 는 `var(--adaptive…)` 변수이고 그 값은 `@toss/tds-colors` 0.1.0 의 `colors.light.css`, `colors.dark.css` 에 있다.
- **글자 크기 풀이**: 타이포 이름과 px 은 같은 순서의 두 배열이다. @51044 `Ro=["t1","st1","st2","st3","t2","st4","st5","st6","t3","st7","t4","st8","st9","t5","st10","t6","st11","t7","st12","st13"]` 와 @51172 `$r=[30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11]`. 그래서 t5 = 17px, st10 = 16px, t6 = 15px, t7 = 13px, t4 = 20px, t3 = 22px, st5 = 24px.
- **스프링**: TDS 의 전환은 대부분 ms 가 아니라 스프링 프리셋이다. @149827 `quick:{stiffness:800,damping:55,mass:1},medium:{stiffness:270,damping:25,mass:1}`, @149986 `rapid:{stiffness:1e3,damping:55,mass:1}`. "계산값"이라고 적은 지속 시간은 배포물이 발행한 수치가 아니라, 스프링 클래스(@148561 `Jb=class{constructor`)의 식(가속도 = -stiffness×x - damping×v, 1/60 초 간격 RK4, 위치와 속도가 0.01 아래로 들 때까지)을 같은 폴더 `spring.js` 에 손으로 옮겨 구한 값이다: quick 350ms, rapid 200ms, medium 567ms.
- **문서**: `DOC` = `https://tossmini-docs.toss.im/tds-mobile/components`. 2026-11-23 에 앱 내장 브라우저로 읽었다. 문서는 대부분 속성 표와 예제이고 px, 색 값은 거의 없어서 수치 근거는 배포물이다. 문서 근거는 인용 대신 페이지와 절 이름으로 적었다.
- **판정**: 일치, 다름, TDS 침묵, 확인 못 함 넷 중 하나. "계산"이라고 적은 값은 코드의 리터럴을 더한 것이고 리터럴 자체는 근거 칸에 있다.
- **frontmatter**: md 1~202행에 `components:` 맵은 없다. 이 컴포넌트들을 말하는 frontmatter 주석 줄과 다른 절의 줄은 맨 아래 "범위 밖 참고"에 따로 모았고 개수에 넣지 않았다.

## 판정 개수 (본표 114행)

| 판정 | 개수 |
|---|---|
| 일치 | 50 |
| 다름 | 50 |
| TDS 침묵 | 13 |
| 확인 못 함 | 1 |

"다름" 50행 가운데 SC2, SF5, R2 셋은 토큰 종류(불투명도 토큰 대 단색)가 다른 것이고 흰 바탕 위에서 보이는 색은 같거나 거의 같다. B18(1.25 대 1.252)도 차이가 작다. 나머지는 수치나 구조가 다르다.

## 본표

### button (md 347~363)

| # | md 줄 | md 의 주장(컴포넌트, 속성, 값) | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| B1 | 349 | Button 사이즈는 XL, L, M, S 4단 | size 는 small, medium, large, xlarge 4개. 기본 xlarge. 단 수는 같고 이름 표기는 다르다(B26) | @614663 `color:r="primary",variant:o="fill",display:n="inline",size:i="xlarge"`; d.ts@1109590 `type TDSButtonSize = 'small' ...`; DOC/button/ 인터페이스 표 | 일치 |
| B2 | 353 | XL height 56 | `--button-min-height` 56px (고정 height 가 아니라 min-height) | @618326 `xlarge:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"16px",[xe.minWidth]:"96px",[xe.minHeight]:"56px",[xe.padding]:"2px 28px"` | 일치 |
| B3 | 353 | XL radius 16 | 16px | 위 B2 조각 | 일치 |
| B4 | 353 | XL label 17px | t5 = 17px | 위 B2 조각, 글자 크기 풀이 | 일치 |
| B5 | 353 | XL label Bold | fontWeight "600". size 와 상관없이 버튼 공통 | @619573 `position:"relative",fontWeight:"600",WebkitFontSmoothing:"antialiased",whiteSpace:"nowrap"` | 다름 |
| B6 | 354 | L height 48 | min-height 48px | @618499 `large:{[xe.fontSize]:ce.t5.fontSize,[xe.borderRadius]:"14px",[xe.minWidth]:"80px",[xe.minHeight]:"48px",[xe.padding]:"2px 16px"` | 일치 |
| B7 | 354 | L radius 14 | 14px | 위 B6 조각 | 일치 |
| B8 | 354 | L label 17px | t5 = 17px | 위 B6 조각 | 일치 |
| B9 | 354 | L label Bold | fontWeight "600" | B5 조각 | 다름 |
| B10 | 355 | M height 40 | min-height 38px | @618671 `medium:{[xe.fontSize]:ce.t6.fontSize,[xe.borderRadius]:"10px",[xe.minWidth]:"64px",[xe.minHeight]:"38px",[xe.padding]:"2px 16px"` | 다름 |
| B11 | 355 | M radius 12 | 10px | 위 B10 조각 | 다름 |
| B12 | 355 | M label 15px | t6 = 15px | 위 B10 조각 | 일치 |
| B13 | 355 | M label Semibold | fontWeight "600" | B5 조각 | 일치 |
| B14 | 356 | S height 32 | min-height 32px | @618844 `small:{[xe.fontSize]:ce.t7.fontSize,[xe.borderRadius]:"8px",[xe.minWidth]:"52px",[xe.minHeight]:"32px",[xe.padding]:"2px 10px"` | 일치 |
| B15 | 356 | S radius 10 | 8px | 위 B14 조각 | 다름 |
| B16 | 356 | S label 13px | t7 = 13px | 위 B14 조각 | 일치 |
| B17 | 356 | S label Semibold | fontWeight "600" | B5 조각 | 일치 |
| B18 | 353~356 (값은 143, 149, 155) | label 이 가리키는 토큰(label-l, label-m, label-s)의 lineHeight 1.25 | 1.252 | @620253 `lineHeight:Me("line-height-xs"),borderRadius:R(xe.borderRadius)`; @602732 `rHe={"line-height-xs":"1.252","line-height-s":"1.35","line-height-m":"1.5"}` | 다름 |
| B19 | 353~356 (값은 144, 150, 156) | 같은 토큰의 letterSpacing -0.005em (label-s 는 0em) | 버튼 스타일에 letterSpacing 선언이 없다 | 찾은 법: 버튼 기본 스타일 객체(@619405~620400, `_$e=Bu({…})`)를 처음부터 끝까지 읽음 | TDS 침묵 |
| B20 | 358 | 눌림(variant fill): fill 위에 검정 26% 를 얹는다 | 딤 레이어 색 `rgb(0,0,0)`, opacity .26. 배경 명도 L 0.8 이상인 색만 `rgba(0,0,0,0.5)` 에 .26 | @618156 `pressed:{transition:ee.quick,opacity:.26,backgroundColor:R(xe.dimmerPressedBackgroundColor)}`; @138817 `i=o.l>=.8?"rgba(0,0,0,0.5)":"rgb(0,0,0)"` | 일치 |
| B21 | 358 | 눌림(variant weak): md 는 variant 를 가르지 않고 같은 규칙을 적는다 | 딤 색이 검정이 아니라 그 color 의 fill 배경색(primary 면 blue500, dark 면 grey700), opacity .26 | @139140 `dimBackgroundColor:t.fill.backgroundColor,gradientColor:t.fill.backgroundColor`; opacity 는 B20 조각 | 다름 |
| B22 | 358 | 비활성(variant fill): 전체 노드에 opacity 0.30 | 노드 opacity .3, 글자 opacity 1 | @619405 `R$e=e=>e.variant==="fill"?.3:1`; @615940 `disabled:{opacity:R$e({variant:o}),transition:ee.quick}` | 일치 |
| B23 | 358 | 비활성(variant weak): md 는 variant 를 가르지 않는다 | 노드 opacity 1, 글자만 opacity .3 | B22 조각; @619343 `w$e=e=>e.variant==="fill"?1:.3` | 다름 |
| B24 | 358 | 비활성: 부분 회색 처리하지 않는다 | 배경은 `--button-disabled-background-color` 가 따로 주어지지 않으면 원래 배경색 그대로. 이 변수와 `--button-disabled-text-color` 는 이름만 정의돼 있고(@613762 `button-disabled-text-color`) 배포물 안에 값을 넣는 곳이 없다. 회색으로 바꾸는 규칙 없음. weak 은 글자만 흐려지므로(B23) 노드의 일부만 바뀌기는 하지만 회색으로 바꾸는 것은 아니다 | @616091 `backgroundColor:u?R(xe.disabledBackgroundColor,R(xe.backgroundColor,H.blue500)):R(xe.background`…; 찾은 법: index.js 에서 `button-disabled-` 검색 3건, 모두 변수 이름 정의 | 일치 |
| B25 | 361~362 | 코드 예 `variant="primary"`, `variant="ghost"` | variant 는 fill, weak 둘뿐. primary 는 color 의 값이고 ghost 는 없다 | d.ts@1109670 `type TDSButtonVariant = 'fill' ...`; d.ts@1109438 `type TDSButtonColor = 'primary' ...`; B1 조각 | 다름 |
| B26 | 361~362 | 코드 예 `size="xl"`, `size="m"` | xlarge, medium (값 넷: small, medium, large, xlarge) | d.ts@1109590; B2, B10 조각 | 다름 |

### button-primary (md 365~367)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| P1 | 367 | blue-500 배경 | color primary, variant fill 의 배경 `H.blue500` = #3182f6 (다크에서도 같은 고정값). 기본 테마 토큰도 blue500 | @137980 `case"primary":return{fill:{backgroundColor:H.blue500,textColor:H.whiteOpaci`…; @31715 `E3="#3182f6"`; @90051 `W5={color:{primary:H.blue500}}` | 일치 |
| P2 | 367 | white 텍스트 | `H.whiteOpacity900` = rgba(255,255,255,1) | P1 조각; @32865 `z3="rgba(255,255,255,1)"` | 일치 |
| P3 | 367 | fill 버튼은 주요 액션을 강조하는 데 쓴다 | 문서도 fill 을 주요 액션 강조용으로 적는다 | DOC/button/ "스타일" 아래 fill 절 | 일치 |

### button-secondary (md 369~371)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| S1 | 369 | `secondary` 라는 버튼 변형이 있다 | 없다. variant 는 fill, weak. color 는 primary, danger, light, dark | d.ts@1109670, d.ts@1109438; 찾은 법: index.js 에서 `"secondary"`, `'secondary'` 검색 0건 | TDS 침묵 |
| S2 | 371 | grey-100 배경 + grey-900 텍스트 | 문서가 보조 버튼용이라고 적는 것은 variant weak 이고, weak 의 네 색은 다음과 같다(라이트). primary: blue300 알파 .15 배경 + blue600 글자. dark: greyOpacity100(rgba(2,32,71,0.05)) 배경 + grey700 글자. danger: red300 알파 .15 배경 + red600 글자. light: whiteOpacity200 배경 + whiteOpacity900 글자. grey-100 + grey-900 조합은 없다. 회색 계열인 dark weak 도 배경은 불투명도 토큰, 글자는 grey700 | @138370 `case"dark":return{fill:{backgroundColor:H.grey700,textColor:H.whiteOpacity900},weak:{backgroundColor:b.greyOpacity100,textColor:b.grey700}}`; @137980 `case"primary":return{fill:{backgroundColor:H.blue500,textColor:H.whiteOpacity900},weak:{backgroundColor:new tt(r?H.blue300:H.blue600).setAlpha(r?.15:.22).getRgba(),textColor:r?H.blue600:H.blue400}}`; @138178 `case"danger":return{fill:{backgroundColor:H.red500,textColor`…; @138510 `case"light":return{fill:{backgroundColor:H.whiteOpacity900,t`…; @31422 `x3="rgba(2,32,71,0.05)"`; DOC/button/ weak 절 | 다름 |
| S3 | 371 | 같은 화면의 보조 액션에 쓴다 | 문서는 weak 를 덜 중요한 액션, 보조 버튼용으로 적는다(secondary 라는 이름으로가 아니라 weak 에 대해) | DOC/button/ weak 절 | 일치 |

### button-danger (md 373~375)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| D1 | 375 | red-500 배경 | color danger, variant fill 의 배경 `H.red500` = #f04452 | @138178 `case"danger":return{fill:{backgroundColor:H.red500,textColor:H.whiteOpacity`…; @31851 `Ove="#f04452"` | 일치 |
| D2 | 375 | white 텍스트 | `H.whiteOpacity900` = rgba(255,255,255,1) | D1 조각 | 일치 |
| D3 | 375 | 파괴적 액션 전용 | danger 의 쓰임을 정한 문장이 없다. 색 예시와, 접근성 절의 삭제 버튼 예제 코드 한 줄만 있다 | 찾은 법: DOC/button/ 전체를 읽음. 배포물은 쓰임을 말하지 않음 | TDS 침묵 |

### button-ghost (md 377~379)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| G1 | 379 | 투명 배경 + blue-500 라벨 + 보더 없음인 Button 변형(ghost) | Button 에 투명 배경 변형이 없다. variant 는 fill, weak 뿐이고 weak primary 도 배경이 blue300 알파 .15 다 | d.ts@1109670; 찾은 법: index.js 와 d.ts 에서 `ghost` 검색, 색 이름 ghostwhite 1건씩뿐 | TDS 침묵 |

### bottom-cta (md 381~387)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| C1 | 383 | 화면 최하단 고정 | 문서는 BottomCTA 를 보통 하단에 고정해 쓰는 버튼으로 적는다. 코드에서 BottomCTA 의 fixed 기본값은 false 이고, FixedBottomCTA 가 fixed 를 true 로 넘긴다. fixed 면 position fixed, bottom 0 | @629359 `hasPaddingBottom:a=!0,fixed:s=!1,background:l="default"`; @632606 `return Vte(jo,{fixed:!0,ref:r,...t})`; @631912 `TWe={zIndex:50,position:"fixed",width:"100%",left:"50%",righ`…; DOC/BottomCTA/check-first/ | 일치 |
| C2 | 383 | 56pt 버튼 | 안의 CTAButton 이 Button size xlarge 로 고정 → min-height 56px | @621609 `size:"xlarge",className:IM,css:L$e,disabled:n`; B2 조각 | 일치 |
| C3 | 383 | 좌우 16px padding | 좌우 20px (`0 20px 20px 20px`). 16px 는 CTAButton 래퍼의 border-radius 값으로만 나온다 | @631630 `[SM]:e?0:` 뒤의 템플릿 문자열 `0 20px ${BM} 20px`; @631760 `BM="20px"`; @632084 `_We=_x({pointerEvents:"auto",padding:R(SM),padding`…; @621193 `D$e="16px"`, @621503 `borderRadius:i.display==="full"?"0px":D$e` | 다름 |
| C4 | 383 | 위쪽 보호 그라디언트 24~32px | 36px | @632020 `RWe=_x({height:"36px",background:R(pa)})` | 다름 |
| C5 | 383 | 그라디언트는 white → transparent | `linear-gradient(to top, background 25%, 같은 색의 알파 0)`. background 는 adaptive 값(라이트 #ffffff, 다크 #17171c) | @631677 `linear-gradient(to top, ${b.background} 25%, ${nt(me({color:b.background}),0)})`; colors.light.css `--adaptiveBackground:#ffffff` | 일치 |
| C6 | 383 | `env(safe-area-inset-*)` 로 safe area 인식 | padding-bottom: `max(var(--toss-safe-area-bottom, 0px), env(safe-area-inset-bottom), 20px)`. bottom 만 쓴다 | @631866 `env(safe-area-inset-bottom), ${BM})`; DOC/BottomCTA/Single/ "SafeArea" 절 | 일치 |
| C7 | 386 | 코드 예 `<BottomCTA onClick={handleNext}>다음</BottomCTA>` | BottomCTA 가 있고(그대로 쓰면 Single), 남는 props 는 안의 CTAButton 으로 넘어간다 | @632465 `jo.Single=LM;jo.Double=Ote`; @630931 `cs(Sx,{ref:v,...x,color:r,display:_?"full":"block",children:t})` | 일치 |

### text-field (md 389~391)

TDS TextField 의 variant 는 box, line, big, hero 넷이다(@977561 `fct={box:Ig,line:Og,big:Pg,hero:Mg}`). md 가 적는 "배경 + 보더가 있는 상자"는 box 에 해당하므로 box 와 맞댔고, line 값은 참고로 함께 적었다.

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| T1 | 391 | 48px height | height 선언이 없다. box 는 padding 14px 16px, 글자 t5(17px, 줄 높이 25.5px), border 1px 이라 계산하면 14 + 25.5 + 14 + 1 + 1 = 55.5px | @974329 `padding:"14px 16px",background:R(ty,b.greyOpacity50)`; @980412 `box:{[bf]:ce.t5.fontSize,[dy]:ce.t5.lineHeight,[my]:"6p`…; @44816 `17:{lineHeight:25.5,fontSize:17}` | 다름 |
| T2 | 391 | radius 12 | box 14px | @974226 `Zlt=Ffe({display:"flex",alignItems:"center",borderRadius:"14px",border:` | 다름 |
| T3 | 391 | grey-100 resting 배경 | `b.greyOpacity50` = rgba(0,23,51,0.02) (다크 rgba(209,209,253,0.05)) | T1 의 첫 조각; @31398 `h3="rgba(0,23,51,0.02)"` | 다름 |
| T4 | 391 | 1px grey-200 보더 | 1px solid `H.greyOpacity100` = rgba(2,32,71,0.05). 두께는 같고 색이 다르다 | @974298 `1px solid ${H.greyOpacity100}`; @31422 `x3="rgba(2,32,71,0.05)"` | 다름 |
| T5 | 391 | focus: 흰 배경 | 배경은 greyOpacity50 그대로. 그 위에 `::before` 로 blue900 을 opacity 0.05 로 덮는다(전환 0.2s ease) | @973929 `focused:{[Jv]:b.grey800,[ey]:b.grey500,[ty]:b.greyOpacity50,[ry]:H.blue900,[oy]:"0.05",[ny]:"none"}`; @974762 `transition:"background-color 0.2s ease, opacity 0.2s ease"` | 다름 |
| T6 | 391 | focus: 1.5px blue-500 보더 | box 는 focus 에서 보더를 바꾸지 않는다(1px greyOpacity100 고정). 바뀌는 것은 라벨 색 blue600 과 T5 의 덮개. line 변형은 아래 2px 선이 blue400 | T5 조각; @980766 `bct={normal:{[hy]:b.grey800,[xy]:b.grey600},focused:{[hy]:H.blue600,[xy]:b.grey600},error:{[hy]`…; @976713 `focused:{[ly]:b.grey800,[cy]:b.grey500,[uy]:H.blue400,[fy]:"none"}`; @976988 `2px solid ${R(uy,b.grey100)}` | 다름 |
| T7 | 391 | error: 1.5px red-500 보더 | box 는 보더를 바꾸지 않고 `::before` 로 red900 을 opacity 0.05 로 덮는다. line 변형은 아래 2px 선이 red600 | @974029 `error:{[Jv]:b.grey800,[ey]:b.grey500,[ty]:b.greyOpacity50,[ry]:H.red900,[oy]:"0.05",[ny]:"none"}`; @976780 `error:{[ly]:b.grey800,[cy]:b.grey500,[uy]:H.red600,[fy]:"none"}` | 다름 |
| T8 | 391 | error: 헬퍼 텍스트 red-500 | help 글자색 `H.red600` = #e42939 (라벨도 red600). 헬퍼가 필드 아래에 오는 것은 같다 | T6 의 라벨 조각(error 항); @981200 `Rct=vy({padding:"6px 24px 0",color:R(xy)},ce.t7)`; @31865 `Dve="#e42939"` | 다름 |

### chip (md 393~395)

문서 사이트에 Chip 페이지가 없다(DOC/chip/ 는 404, 사이드바 목록에도 없음). 배포물은 Chip, ChipItem 을 내보내므로 코드로만 맞댔다.

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| H1 | 395 | 34px 높이 | min-height small 32px, medium 38px (기본 medium). 바깥 터치 영역은 min-height 44px | @672314 `PYe={small:{[U.fontSize]:ce.t7.fontSize,[U.fontWeight]:"600",[U.minWidth]:"52px",[U.minHeight]:"32px"},medium:{[U.fontSize]:ce.t6.fontSize,[U.fontWeight]:"600",[U.minWidth]:"64px",[U.minHeight]:"38px"}}`; @663715 `Pe("Chip",{kind:"select",shape:"pill",size:"medium",variant:"fill",withColorBackground:!1})`; @673191 `paddingLeft:"0px",paddingRight:"0px",minHeight:` 뒤 템플릿 `${44}px` | 다름 |
| H2 | 395 | full pill (999px) | shape 기본 pill = 999px. square 변형은 8px, 10px | @672522 `pill:{small:{[U.borderRadius]:"999px",[U.paddingLeft]:"11px",[U.paddingRigh`…; @672690 `square:{small:{[U.borderRadius]:"8px",[U`… | 일치 |
| H3 | 395 | resting 1px grey-200 보더 | 0.66px, 색 greyOpacity50 | @673646 `border:"0.66px solid transparent",bord`…; @667737 `function CYe(e){return{[U.backgroundColor]:me({color:b.greyOpacity100,colorScheme:e}),[U.borderColor]:me({color:b.greyOpacity50,colorScheme:`… | 다름 |
| H4 | 395 | resting 흰 배경 | greyOpacity100 (rgba(2,32,71,0.05)). 글자는 greyOpacity700 | H3 의 둘째 조각 | 다름 |
| H5 | 395 | active: grey-900 배경 | 선택 + variant fill: greyOpacity800 (라이트 rgba(0,12,30,0.8)), 보더 greyOpacity500 | @668538 `fill:{[U.backgroundColor]:me({color:b.greyOpacity800,colorScheme:e}),[U.borderColor]:`… | 다름 |
| H6 | 395 | active: 흰 텍스트 | `b.background` (라이트 #ffffff, 다크 #17171c) | @668538 `fill:{[U.backgroundColor]:me({color:b.greyOpacity800,colorScheme:e}),[U.borderColor]:me({color:b.greyOpacity500,colorScheme:e}),[U.color]:me({color:b.background,colorScheme:e})}` | 일치 |
| H7 | 395 | brand 변형: blue-50 배경 + blue-500 텍스트 | brand 라는 변형이 없다. variant 는 fill, weak. 참고로 선택 + weak 는 라이트에서 blue500 알파 0.1 배경, blue500 알파 0.32 보더, blue800 글자인데, 이것은 선택 상태의 값이라 md 의 "변형"과 같은 쓰임인지 정할 근거가 없어 맞대지 않았다 | d.ts@126564 `interface ChipProps` 와 그 아래 `ChipVariant = 'fill' ...`; @668716 `weak:{[U.backgroundColor]:t?nt(o,.24):nt(r,.1),[U.borderColor]:t?nt(r,.52):nt(r,.32),[U.color]:n}`; @668417 `r=me({color:b.blue500,colorScheme:e}),o=`…; 찾은 법: index.js 에서 `"brand"`, `'brand'` 검색 0건 | TDS 침묵 |

### checkbox, switch (md 482~484)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| K1 | 484 | checkbox 22px | size 기본 24 (숫자 prop) | @263433 `inputType:e="checkbox",size:t=24,checked:r`; DOC/checkbox/ 인터페이스 표 | 다름 |
| K2 | 484 | checkbox 는 정사각 | 네모 형태가 없다. Checkbox.Circle(원 안의 체크), Checkbox.Line(체크 글리프만), LineTransparent 셋. 아래 K1, K3~K7 은 배경과 고리가 있는 Circle 과 맞댔다 | @267714 `Ur={Circle:cP,Line:Zh,LineTransparent:uP}`; DOC/checkbox/ "형태" 절 | 다름 |
| K2b | 484 | checkbox 6px radius | 네모 형태가 없어서 모서리 radius 값이 없다 | K2 조각; 찾은 법: Checkbox 정의(@260500~267800)를 읽음, borderRadius 선언 없음 | TDS 침묵 |
| K3 | 484 | resting 1.5px 보더 | Circle 의 고리는 SVG 경로다. viewBox 24 에서 안쪽 원이 3~21(반지름 9), 바깥 원이 1~23(반지름 11)이라 두께 2 단위(24px 일 때 2px, 계산) | @260628 `d:"M12 3C17 3 21 7 21 12C21 17 17 21 12 21C7 21 3 17 3 12C3 7 7 3 12 3ZM12 1C5.9 1 1 5.9 1 12C1 18.1 5.9 23 12 23C18.1 23 23 18.1 23 12C23 5.9 18.1 1 12 1Z"` | 다름 |
| K4 | 484 | resting 보더 색 grey-300 | grey300 | @261806 `inactive:{fillOpacity:1,opacity:1,fill:b.grey300,transition:Ct.quick}` | 일치 |
| K5 | 484 | resting 흰 배경 | 고리 안쪽 fill `b.background` (라이트 #ffffff). 꺼진 상태에도 체크 글리프가 grey300 으로 보인다 | @261675 `children:[aP("g",{fill:b.background,children:[`; K7 조각의 inactive 항 | 일치 |
| K6 | 484 | checked: blue-500 배경 | 원 전체 fill blue500 | @262055 `active:{fillOpacity:1,opacity:1,fill:b.blue500,transition:Ct.quick}` | 일치 |
| K7 | 484 | checked: 흰 체크 글리프 | `H.background` = #ffffff | @262399 `active:{fill:H.background,transition:Ct.quick},inactive:{fill:b.grey300,transition:Ct.quick}`; @35191 `o5="#ffffff"` | 일치 |
| K8 | 484 | switch 트랙 44×26px | 50×30, radius 15 | @960205 `Gst=wB({display:"flex",position:"relative",width:50,height:30,borderRadius:15,backgroundColor:R(bB)` | 다름 |
| K9 | 484 | knob 20px | 꺼짐 16×16, 켜짐 24×24 (켜질 때 커진다) | @959990 `Wst=e=>e?{[xB]:"24px",[vB]:"24px",[yB]:"translate3d(16px, 0px, 0px)",[bB]:H.blue500,[CB]:b.blue`… | 다름 |
| K10 | 484 | knob 흰색 | `H.white` = #ffffff | @960464 `left:7,alignSelf:"center",width:R(xB),height:R(vB),transform:R(yB),borderRadius:"100%",backgroundColor:H.white` | 일치 |
| K11 | 484 | off 트랙 grey-300 | grey200 | @959990 `Wst=e=>e?{[xB]:"24px",[vB]:"24px",[yB]:"translate3d(16px, 0px, 0px)",[bB]:H.blue500,[CB]:b.blue700}:{[xB]:"16px",[vB]:"16px",[yB]:"translate3d(0px, 0px, 0px)",[bB]:b.grey200,[CB]:b.grey400}` | 다름 |
| K12 | 484 | on 트랙 blue-500 | `H.blue500` | K11 조각 | 일치 |
| K13 | 484 | knob 이 18px translate | 16px | K11 조각; @960916 `Ust={checked:{width:{to:24},height:{to:24},translateX:{to:16,easing:N.`… | 다름 |
| K14 | 484 (값은 324, 327) | knob 전환 dur-base(200ms) + ease(cubic-bezier(0.22, 0.61, 0.36, 1)) | ms 와 베지어가 아니라 스프링 medium(stiffness 270, damping 25). 계산값 약 567ms. 트랙 색과 눌림 scale 은 스프링 quick, rapid | K13 의 둘째 조각; 스프링 풀이 | 다름 |

### segmented-control (md 486~488)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| SC1 | 488 | 여러 옵션 중 하나만 고르는 컨트롤(상호 배타 단일 선택) | 문서도 여러 선택지 중 하나를 고르는 요소, Radio 와 같은 역할로 적는다. 구현은 radio 그룹 | DOC/segmented-control/ 첫 문단과 접근성 표 | 일치 |
| SC2 | 488 | 트랙 grey-100 배경 | `b.greyOpacity100` = rgba(2,32,71,0.05). 단색 grey100 이 아니라 불투명도 토큰이다. 흰 바탕 위에 합성하면 #f2f4f6 으로 grey100 과 같은 색이 된다(계산) | @915943 `` backgroundColor:`${b.greyOpacity100}` `` | 다름 |
| SC3 | 488 | 트랙 라운드 radius-m~radius-l (12~14) | small 10px, large 14px. 12 는 트랙이 아니라 Item 과 가장자리 흐림의 radius | @916279 `Int=oc(Kce,{borderRadius:10}),Mnt=oc(Kce,{borderRadius:14})`; @909490 `ont=un({position:"relative",zIndex:1,overflow:"hidden",borderRadius:12})` | 다름 |
| SC4 | 488 | 선택된 분절 흰 배경 | `tRadioIndicatorBackgroundColor`: 라이트 #ffffff, 다크 #4d4d59 | @42266 `tRadioIndicatorBackgroundColor:[u5,tb]`; @35447 `tb=q3,ECe=X3,ACe=K3,PCe=Z3,c5=Q3,ICe=J3,u5=e5`; @33147 `e5="#ffffff"` | 일치 |
| SC5 | 488 (값은 193) | 선택된 분절 그림자 shadow-1 (0 1px 2px navy 알파 0.04, 0 1px 1px navy 알파 0.04) | `0 1px 2px 0 rgba(0, 0, 0, 0.09)` 한 겹 | @915070 `boxShadow:"0 1px 2px 0 rgba(0, 0, 0, 0.09)",backgroundColor:` | 다름 |
| SC6 | 488 | 미선택 라벨 grey-700 | grey600, 굵기 medium (선택은 grey800 semibold, 비활성은 grey400) | @911697 `fontWeight:y?"semibold":"medium",color:_.disabled?b.grey400:y?b.grey800:b.grey600` | 다름 |
| SC7 | 488 | chip 은 다중(필터) | Chip 의 kind 기본값 select 는 "선택된 칩이 한 개 이상"이라고 주석에 적혀 있어 여럿 선택이 된다. 필터 용도라는 문장은 없다 | d.ts@126564 `interface ChipProps` 의 kind 주석 | 일치 |

### search-field (md 490~492)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| SF1 | 492 | text-field 의 변형이다 | 따로 만든 컴포넌트 SearchField 다. TextField 를 감싸지 않고, TextField 의 variant(box, line, big, hero)에도 없다 | @893635 `F6=cot(lot((e,t)=>{` 부터 @895900 까지의 정의; @977561 `fct={box:Ig,line:Og,big:Pg,hero:Mg}` | 다름 |
| SF2 | 492 | 좌측에 search 아이콘 | 왼쪽에 24px `searchfield` 아이콘, 색 grey600 | @894318 `ba(Re,{name:"searchfield",size:24,color:b.grey600})` | 일치 |
| SF3 | 492 | 48px 높이 | min-height 44px, padding 8px 10px (바깥 래퍼 padding 14px 16px) | @895102 `mot=Jl({position:"relative",display:"flex",alignItems:"center",gap:"8px",minHeight:"44px",padding:"8px 10px",background:b.opacity100,borderRadius:12,overflow:"hidden"})` | 다름 |
| SF4 | 492 | radius 12 | 12 | SF3 조각 | 일치 |
| SF5 | 492 | grey-100 resting 배경 | `b.opacity100` = rgba(2,32,71,0.05). 불투명도 토큰이다. 흰 바탕 위 합성값은 #f2f4f6 으로 grey100 과 같다(계산). `b.grey100` 은 오른쪽 끝 흐림에만 쓰인다 | SF3 조각; colors.light.css `--adaptiveOpacity100:rgba(2,32,71,0.05)` | 다름 |
| SF6 | 492 | focus: 흰 배경 + 1.5px blue-500 보더(text-field 와 같은 규칙) | focus 에 걸린 규칙은 input 의 `outline:none` 뿐이다. 배경과 보더를 바꾸는 선언이 없다 | @895530 `"&[readonly]":{cursor:"initial"},"&:focus":{outline:"none"},"&`…; 찾은 법: SearchField 의 스타일 객체 여덟(@895040~895900, pot, mot, got, hot, xot, vot, yot, bot)을 모두 읽음 | TDS 침묵 |

### slider (md 494~496)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| SL1 | 496 | 트랙 grey-200 | grey200. 높이 5px, radius 2.5px | @927116 `backgroundColor:b.grey200,borderRadius:"2.5px",overflow`…; @926506 `Cg=12,Eue=40,Aue=5` | 일치 |
| SL2 | 496 | active fill blue-500 | 기본 `H.blue400` = #4593fc. color prop 으로 바꿀 수 있다. 문서도 기본값을 blue400 으로 적는다 | @927459 `Mit=hf({position:"absolute",backgroundColor:H.blue400,height:"100%"`; @31702 `k3="#4593fc"`; DOC/slider/ "색상 변경하기" 절 | 다름 |
| SL3 | 496 | thumb 는 흰 원 | 24×24, `#fff`, radius 100% | @926832 `borderRadius:"100%",backgroundColor:"#fff",boxShadow:`; @926506 `Cg=12,Eue=40,Aue=5` (Cg×2) | 일치 |
| SL4 | 496 | thumb 에 미세한 그림자 | `0 0 0 1px greyOpacity200, 0 8px 8px 0 greyOpacity200, 0 2px 3px 0 greyOpacity300` | @926886 `0 0 0 1px ${b.greyOpacity200}, 0 8px 8px 0 ${b.greyOpacity200}, 0 2px 3px 0 ${b.greyOpacity300}` | 일치 |
| SL5 | 496 | 값 변화는 dur-base(200ms) 안, 바운스 없음 | transition 이나 스프링 선언이 없다. 값이 바뀌면 fill 의 transform 을 바로 다시 쓴다 | @926019 `css:Iit,style:{transform:`; 찾은 법: Slider 정의와 스타일(@925639~927560)을 모두 읽음, `transition` 없음 | TDS 침묵 |

### rating (md 498~500)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| R1 | 500 | 채워진 별 yellow-500 | `b.yellow400` (라이트 #ffd158, 다크 #ffa126). 입력용은 activeColor prop 으로 바꿀 수 있다 | @885724 `pg=b.greyOpacity200,mg=b.yellow400`; colors.light.css `--adaptiveYellow400:#ffd158` | 다름 |
| R2 | 500 | 빈 별 grey-200 | `b.greyOpacity200` = rgba(0,27,55,0.1). 불투명도 토큰이다. 흰 바탕 위 합성값은 약 #e6e8eb 로 grey200(#e5e8eb)과 거의 같다(계산) | R1 조각; colors.light.css `--adaptiveGreyOpacity200:rgba(0,27,55,0.1)` | 다름 |
| R3 | 500 | 반 칸(half) 상태 지원 | 읽기 전용(readOnly)에서만: 별 순번과 값의 차가 0.25 초과 0.75 이하면 왼쪽 50% 만 칠한다. 입력용은 step 1 정수다 | @891712 `Yle=(e,t)=>{let r=e-t;return r<=.25?mg:r<=.75?`; @891759 `linear-gradient(to right, ${mg} 50%, ${pg} 50%)`; @887979 `type:"range",min:0,step:1,max:r,value:e` | 일치 |
| R4 | 500 | 숫자 평점은 label-m(15px) Bold | size 마다 다르다. tiny t7(13px) medium, small t5(17px) semibold, medium t4(20px) semibold, large t3(22px) bold, big st5(24px) bold. 15px 는 없다 | @886308 `Ple={tiny:"t7",small:"t5",medium:"t4",large:"t3",big:"st5"},Ile={tiny:"medium",small:"semibold",medium:"semibold",large:"bold",big:"bold"}` | 다름 |
| R5 | 500 | 숫자가 별 옆에 붙는다 | 읽기 전용 variant full, compact 에서 별 오른쪽, margin-left 2px(tiny) 또는 4px | @886162 `Ele={tiny:{[dg]:"2px"},small:{[dg]:"4px"}`; DOC/rating/ "형태 변경하기" 절 | 일치 |

### numeric-spinner, stepper (md 506~508)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| N1 | 508 | `− 값 +` 가로 배치 | 빼기 버튼, 숫자, 더하기 버튼 순서의 가로 flex | @861805 `Kl(i6,{size:t,type:"minus"`; @863321 `Ntt=sf({position:"relative",width:"fit-content",display:"flex",alignItems:"cente`… | 일치 |
| N2 | 508 | 캡슐 radius-full | 컨테이너 radius 는 size 별 8, 10, 14, 16px (tiny, small, medium, large). 가운데 숫자를 끄는 동안에만 50 으로 바뀐다 | @855787 `Vm={tiny:{background:8,number:6},small:{background:10,number:8},medium:{background:14,number:10},large:{background:16,number:14}}`; @861365 `focused:{scale:.96,borderRadius:50,backgroundColor:b.grey200,transition:ee.quick}` | 다름 |
| N3 | 508 | 보더가 있다 | 보더 선언이 없고 배경색으로 채운 덩어리다 | @863321 `Ntt=sf({position:"relative",width:"fit-content",display:"flex",alignItems:"center",padding:R(Ev),backgroundColor:b.grey100,opacity:R(rle),zIndex:0})` | 다름 |
| N4 | 508 | 흰 배경 | 컨테이너 grey100. 흰색(라이트 #ffffff)은 가운데 숫자 칩이고 거기에 `0px 1px 3px 0px rgba(0,0,0,0.09)` 그림자가 있다 | N3 조각; @857382 `backgroundColor:Ve.tRadioIndicatorBackgroundColor,boxShadow:"0px 1px 3px 0px rgba(0, 0, 0, 0.09)"` | 다름 |
| N5 | 508 | 값은 tabular figure | 선언이 없다 | 찾은 법: index.js 전체에서 `tabular`, `fontVariantNumeric`, `tnum`, `font-variant-numeric`, `fontFeatureSettings` 검색 0건 | TDS 침묵 |
| N6 | 508 | ± 버튼은 blue-500 | grey700 (누르는 동안 grey900). blue500 은 숫자가 바뀔 때 숫자 글자색이 grey800 에서 잠깐 거쳐 가는 색이다 | @852255 `color:o?b.grey300:n==="focused"?b.grey900:b.grey700,lineHeight:0`; @856158 `u=me({color:b.grey800,colorScheme:l}),f=me({color:b.blue500,colorScheme:l})` | 다름 |
| N7 | 508 (값은 52) | 비활성 버튼은 fg-quaternary(navy 알파 0.28) | 한계값에 닿은 쪽 버튼은 grey300. disable prop 은 컴포넌트 전체 opacity .3 | N6 의 첫 조각; @863090 `Vtt=({disable:e})=>({[rle]:e?.3:1})` | 다름 |
| N8 | 508 | stepper 는 같은 역할의 세로 변형(▲ 값 ▼), radius-m 보더, 값 행을 1px 헤어라인으로 분리 | TDS 의 Stepper 는 이름만 같은 다른 컴포넌트다. 번호나 아이콘이 달린 단계(StepperRow)를 세로로 잇는 진행 목록이고, 숫자를 올리고 내리는 세로 컨트롤은 없다 | @958768 `gB=Object.assign({},Fst,{StepperRow:Ai,Texts:Wv,NumberIcon:T`…; DOC/stepper/ 첫 문단 | TDS 침묵 |

### keypad (md 451~453)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| KP1 | 453 | 전용 Figma 페이지가 있다 | Figma 는 이 대조가 근거로 삼는 세 자료(npm 배포물, 색 패키지, 문서 사이트) 밖이다 | 볼 수 있는 길이 없음 | 확인 못 함 |
| KP2 | 453 | PIN 입력에 쓰는 숫자 키패드 | NumberKeypad: 3열, 숫자 1~9, 0, 지우기 키. 문서는 숫자 비밀번호 입력용으로 적는다. 키 높이 64px, 글자 30px, 폭 최대 340px | @717369 `xXe=[1,2,3,4,5,6,7,8,9,0]`; @717683 `numberOfColumns:3,characters:u`; @712715 `Rne="64px"`; @715132 `iXe="30px",aXe="340px"`; DOC/Keypad/number-keypad/ 첫 문단 | 일치 |
| KP3 | 453 | 금액 입력에도 쓴다 | 금액 입력을 말하는 문장이 없다 | 찾은 법: DOC/Keypad/number-keypad/ 를 읽음(alphabet-keypad, full-secure-keypad 페이지는 읽지 않음). 배포물은 쓰임을 말하지 않음 | TDS 침묵 |
| KP4 | 453 | backdrop-filter blur 는 iOS 네이티브 시트가 카메라나 키패드 위에 떴을 때만 적용 | 키패드 코드(@712000~730000)에 backdropFilter 가 없다. index.js 에서 `backdropFilter` 는 여섯 곳(@486350 BackgroundBlur 컴포넌트, @790883, @792434, @792451, @938433, @1000467), `backdrop-filter` 는 세 곳(@486333, @790866, @792857)에만 나오고 모두 키패드 범위 밖이다. 네이티브 시트의 동작은 웹 배포물과 문서가 다루지 않는다 | 찾은 법: index.js 에서 `backdropFilter`, `backdrop-filter` 검색; @486425 `N0.displayName="BackgroundBlur"` | TDS 침묵 |

### text-button, icon-button (md 526~528, result 로 시작하는 묶음 절 안)

| # | md 줄 | md 의 주장 | TDS 의 값 | 근거 | 판정 |
|---|---|---|---|---|---|
| TB1 | 528 | text-button 은 보더가 없다 | `border:0` | @690524 `EUe=oo({outline:"none",position:"relative",textAlign:"left",userSelect:"none",borderRadius:"8px",backgroundColor:"transparent",boxShadow:"0 0 0 0 transparent",border:0` | 일치 |
| TB2 | 528 | text-button 은 텍스트만 있는 액션 | 배경 transparent, 글자만. 크기는 size 여섯(xsmall~xxlarge = t7, t6, t5, t4, t3, st2), variant 는 clear, arrow, underline | TB1 조각; @690347 `_Ue={xsmall:"t7",small:"t6",medium:"t5",large:"t4",xlarge:"t3",xxlarge:"st2`…; DOC/text-button/ | 일치 |
| TB3 | 528 | text-button 은 button-ghost 에 가깝다 | 견줄 ghost 가 TDS Button 에 없다(G1). 참고로 TextButton 의 기본 글자색은 grey600 이고 color prop 으로 바꾼다 | @687056 `color:r=b.grey600,variant:o="clear",arrowPlacement:n="block"`; G1 | TDS 침묵 |
| IB1 | 528 | icon-button 은 40px 정사각 hit-area | padding 이 iconSize 의 절반(18~20 일 때는 9)이다. 기본 iconSize 24 면 24 + 12 + 12 = 48px 정사각(계산). radius 12 | @710458 `function GO(e){return 18<=e&&e<=20?9:e/2;}function Nqe(e){return e<=16?6:e<=20?8:12;}`; @710249 `style:{padding:GO(i),borderRadius:Nqe(i),back`… | 다름 |
| IB2 | 528 | 24px 아이콘 | iconSize 기본 24 | @709939 `bgColor:o=b.greyOpacity100,variant:n="clear",iconSize:i=24`; DOC/icon-button/ 인터페이스 표 | 일치 |
| IB3 | 528 | 아이콘만 둔 컨트롤 | 기본 variant clear 는 배경 없이 아이콘만 보인다(fill, border 변형도 있다) | IB2 조각; DOC/icon-button/ clear 절 | 일치 |

## md 가 말하지 않은 TDS 의 상태값 (판정 없음, 참고)

본표의 md 절들은 hover 와 초점을 말하지 않는다(md 에서 `hover` 는 327행 Motion 절에만 나온다). 아래는 배포물에 있는 상태별 값이다.

| 컴포넌트 | 상태 | TDS 의 값 | 근거 |
|---|---|---|---|
| Button | hover | 모양을 바꾸는 선언 없음. `&:hover, &:focus` 는 textDecoration none 뿐 | @620048 `"&:hover, &:focus":{textDecoration:"none"},"&:focus":{outline:"none"},"&:di`… |
| Button | 초점 | outline none | 위 조각 |
| Button | 눌림 | 딤(B20, B21)에 더해 scale 0.96 (display full 이면 1) | @614625 `g$e=.96`; @615595 `k=n==="full"?1:g$e`; @615834 `pressed:{scale:k,transition:ee.rapid}` |
| Button | 전환 | CSS transition 은 color, background-color, border-color, box-shadow, opacity 각 0.1s ease-in-out. 눌림 scale 은 스프링 rapid, 딤은 스프링 quick | @619917 `opacity 0.1s ease-in-out`; B20 조각 |
| TextField box | 비활성 | 배경 grey200, 글자와 placeholder grey400. opacity 는 쓰지 않는다 | @974126 `disabled:{[Jv]:b.grey400,[ey]:b.grey400,[ty]:b.grey200,[ry]:"transparent",[oy]:"0",[ny]:b.grey400}` |
| Chip | 눌림 | scale 0.96 + 딤. 딤 색은 라이트 rgba(0,0,0,0.05), 다크 rgba(0,0,0,0.35)이고 다른 갈래에 0.07, 0.2 값도 있다(어느 조건인지는 따라가 보지 않았다) | @671130 `[It.PRESSED]:{scale:.96,transition:ee.rapid}`; @668936 `function SYe(e){return{[U.dimmerPressedBackgroundColor]:e==="light"?"rgba(0, 0, 0, 0.05)":"rgba`… |
| Chip | 비활성 | opacity .5 | @670906 `style:{opacity:o?.5:1},disabled:o` |
| Checkbox.Circle | hover | 꺼짐은 고리 grey400, 켜짐은 blue700 (다크 blue300) | @261876 `hover:{fillOpacity:e?0:1,fill:b.grey400,transition:Ct.rapid},touchDown`…; @262193 `hover:{fillOpacity:e?1:0,fill:i?b.blue300:b.blue700,transition:Ct.rapid}` |
| Checkbox.Circle | 눌림 | scale 0.8 | @261579 `touchDown:{scale:.8,transition:Ct.rapid}` |
| Checkbox | 비활성 | opacity .4, 누르면 좌우로 흔들림 | @263184 `style:{opacity:.4,scale:1,marginRight:r!=null?"8px":0}` |
| Switch | 눌림 | scale 0.96, 트랙 색 꺼짐 grey400, 켜짐 blue700 | @960708 `pressed:{scale:{to:.96},backgroundColor:{to:R(CB)},easing:N.rapid}`; K11 조각 |
| Switch | 비활성 | opacity .3 | @960371 `"&:has(input:disabled)":{opacity:.3,cursor:"initial"}` |
| SegmentedControl | 눌림 | 미선택 라벨 scale 0.9 | @908946 `r?.to({scale:{to:.9},easing:N.rapid})` |
| SegmentedControl | 기본 size | 문서와 d.ts 주석은 기본 'small', 실행 코드의 기본은 large | d.ts@481045 `interface SegmentedControlProps` 의 `@default 'small'`; @920205 `size:u="large",alignment:f="fixed"` |
| SearchField | 초점 | outline none 뿐 | SF6 조각 |
| Slider | 초점 | outline none 뿐 | @927011 `"&:focus":{outline:"none"}}),Eit=hf(` |
| Rating(입력용) | 눌림 | 별 scale 0.9 | @889350 `[bo.PressDown]:{scale:.9,transition:$.spring.rapid}` |
| Rating(입력용) | 비활성 | 채워진 별 opacity .3 | @889100 `backgroundColor:g?p:pg,opacity:g?.3:1` |
| NumericSpinner | 누르는 동안 | 누른 쪽 버튼 scale 0.9, 숫자를 끌면 컨테이너 scale 0.96 + 배경 grey200 | @853396 `scale:.9,transition:ee.rapid}`; N2 의 둘째 조각 |
| 키패드 | 눌림 | 키 scale 0.85 (secure 는 0.96), 글자 grey800, 배경 greyOpacity100 radius 20px | @713736 `pressed:{scale:{to:e?.96:.85},color:{to:b.grey800}`; @713477 `css:eXe,style:{backgroundColor:a==="dark`… |
| TextButton | hover | `(hover: hover) and (pointer: fine)` 에서만 딤 배경 greyOpacity100 | @686947 `"@media (hover: hover) and (pointer: fine)":{"&:not(:disabled):hover":e}`; @691140 `]:{backgroundColor:b.greyOpacity100}})}),A`… |
| TextButton | 눌림 | scale 0.94 + 딤 배경 greyOpacity100. 글자색 변수도 `aa()` 가 팔레트에서 한 단계(level 기본 1) 옮긴 색으로 바뀐다(어느 쪽으로 옮기는지는 따라가 보지 않았다) | @686274 `motion:{scale:{to:.94},easing:N.rapid}`; @511706 `function aa({color:e,level:t=1,colorScheme:r="light"})` |
| TextButton | 비활성 | opacity .38 | @691017 `"&:disabled":{opacity:.38},"`… |
| TextButton | 초점 | outline none | TB1 조각 |
| IconButton | 눌림 | scale 0.9. 배경색 전환도 함께 재생된다(variant fill 과 그 밖이 따로이고 값은 따라가 보지 않았다) | @709290 `motion:{easing:N.rapid,scale:{to:.9}}` |
| IconButton | hover, 초점 | textDecoration none, outline none 뿐 | @710853 `"&:hover, &:focus":{textDecoration:"none"},"&:focus":{outline:"none"},"&:di`… |

## 범위 밖 참고: 같은 컴포넌트를 말하는 다른 줄 (개수에 넣지 않음)

맡은 절 밖이지만 같은 값을 다시 적는 줄이다. 판정은 본표의 해당 행을 그대로 옮긴 것이다.

| md 줄 | md 의 주장 | TDS 의 값 | 본표 행 | 판정 |
|---|---|---|---|---|
| 185 | `radius-m: 12px # text inputs` | TextField box 14px. SearchField 는 12 | T2, SF4 | 다름 |
| 186 | `radius-l: 14px # L button (48px)` | large: 14px, min-height 48px | B6, B7 | 일치 |
| 187 | `radius-xl: 16px # XL button (56px)` | xlarge: 16px, min-height 56px | B2, B3 | 일치 |
| 191 | `radius-full: 999px # chips, pills` | Chip pill 999px | H2 | 일치 |
| 198 | `disabled-opacity: 0.30 # 컴포넌트 전체 노드에 적용` | 컴포넌트마다 다르다. Button fill .3(노드), Button weak 은 글자만 .3, Switch .3, NumericSpinner .3, TextButton .38, Checkbox .4, Chip .5, Rating 은 채워진 별만 .3, TextField 는 opacity 가 아니라 색을 바꾼다 | B22, B23, 상태값 표 | 다름 |
| 313 | 버튼 라운드 XL 16 / L 14 / M 12 / S 10 | 16, 14, 10, 8 | B3, B7, B11, B15 | 다름 |
| 319 | pressed 는 press-overlay(검정 26%)를 fill 위에 얹는다 | Button variant fill 에서만 그 값이다. Button weak, Chip, TextButton, IconButton, Switch 는 각기 다른 값 | B20, B21, 상태값 표 | 다름 |
| 326 | `dur-fast: 120 # button press` | Button 의 CSS transition 은 0.1s ease-in-out, 눌림 scale 은 스프링 rapid(계산값 약 200ms), 딤은 스프링 quick(계산값 약 350ms). 120 이라는 값은 버튼 코드에 없다 | 상태값 표 Button 전환 | 다름 |
| 327 | `dur-base: 200 # toggle, hover` | Switch 는 스프링 quick, medium (K14). hover 전환 시간을 따로 둔 선언은 본표의 컴포넌트에 없다 | K14 | 다름 |
| 337 | focused input 은 1.5px blue-500 보더 | TextField box 는 보더를 바꾸지 않는다 | T6 | 다름 |

## 구조적 사실

1. **Button 의 축이 다르다.** md 는 variant 하나에 primary, secondary, danger, ghost 를 두고 size 를 xl, l, m, s 로 쓴다. TDS 는 color(primary, danger, light, dark) × variant(fill, weak) × size(small, medium, large, xlarge) × display(inline, block, full) 네 축이다. secondary, ghost 라는 값은 없다.
2. **size 수치는 XL, L 은 맞고 M, S 가 어긋난다.** TDS: xlarge 56/16, large 48/14, medium 38/10, small 32/8 (min-height/radius). 굵기는 전 size 600.
3. **눌림과 비활성은 variant 에 따라 갈린다.** 검정 26% 와 노드 opacity .3 은 fill 에만 맞다.
4. **중립 표면은 단색 grey 가 아니라 불투명도 토큰이다.** TextField(greyOpacity50, greyOpacity100), Chip(greyOpacity100, 50, 700, 800), SegmentedControl 트랙(greyOpacity100), SearchField(opacity100), Rating 빈 별(greyOpacity200), Button dark weak(greyOpacity100). 이 가운데 SC2, SF5, R2 는 흰 바탕 위 합성값이 md 의 단색과 같거나 거의 같다.
5. **전환은 스프링 프리셋이다.** 고정 ms + cubic-bezier 는 Button 의 CSS transition(0.1s ease-in-out)과 TextField box 의 덮개(0.2s ease) 정도다.
6. **읽은 범위에서는 초점 표시를 그리는 선언을 찾지 못했다.** Button, SearchField, Slider, SegmentedControl(@909392), TextButton, IconButton 은 초점에 `outline:none` 만 건다. TextField 는 라벨 색과 옅은 덮개가 바뀐다. index.js 전체에서 `focus-visible` 은 5건이고 스타일로 쓰인 것은 outline none(@299482 의 도우미, @909392)과 달력 날짜 칸(@1127380)이다. `focusVisible` 은 0건. Chip, Checkbox, Switch, Rating, NumericSpinner, 키패드의 초점 스타일은 따로 훑지 않았다.
7. **TDS 에 없는 것**: Button 의 secondary 와 ghost, Chip 의 brand 변형, 네모난 checkbox, 세로 숫자 stepper(TDS Stepper 는 단계 목록).
8. **문서에 없는 것**: Chip 은 배포물에만 있고 문서 페이지가 없다.
9. **SearchField 는 TextField 의 변형이 아니라 별도 컴포넌트다.**
10. **SegmentedControl 의 기본 size 가 문서(small)와 실행 코드(large)에서 다르다.**
