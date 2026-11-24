// Item module of the "components" structure. Converted from the served
// preview by prototypes/preview-structure/components/convert.ts.
// Build: pnpm pv:build chzzk   Check: pnpm pv:check chzzk

import { cell, definePreview, screen, zone } from "../../kit/parts.ts"

export default definePreview({
  slug: "chzzk",
  title: "치지직 preview",
  hero: `
<div class="hero-wrap">
  <p class="catalog-dummy">히어로의 LIVE 배지는 레이아웃 시연용 더미 데이터입니다.</p>
  <div class="hero">
    <div>
      <h1>지금, 스트리밍이 시작됩니다</h1>
      <div class="hero-cta"><span class="btn btn-1">라이브 보러가기</span><span class="btn btn-2">팔로우</span></div>
    </div>
    <div class="hero-stage"><span class="badge b-live">LIVE</span><img src="/logos/chzzk.png" alt="치지직"></div>
  </div>
</div>
`,
  zones: [
    zone("screens", [
      screen({
        name: "screen-home-desktop",
        label: "홈, 데스크톱",
        dummy:
          "방송 제목, 채널명, 방송 상태, 시청자 수, LIVE 배지, 다시보기 배지, 드롭스 배지, 태그는 레이아웃 시연용 더미 데이터입니다.",
        wide: true,
        stack: true,
        screen: `
<div class="screen-home">
  <div class="hdr">
    <span class="icon-btn" role="img" aria-label="메뉴"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span>
    <div class="hdr-logo"><img src="/logos/chzzk.png" alt=""></div>
    <nav class="hdr-tabs" aria-label="주제 탭"><span class="hdr-tab">게임</span><span class="hdr-tab">e스포츠</span><span class="hdr-tab">스포츠</span><span class="hdr-tab">엔터+</span></nav>
    <div class="hdr-search"><span class="hdr-search-t">채널, 라이브, 동영상 검색</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></div>
    <div class="hdr-actions"><span class="icon-btn hdr-theme" role="img" aria-label="테마 전환"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg></span><span class="btn btn-out">로그인</span></div>
  </div>
  <div class="shell">
    <aside class="side" aria-label="사이드바">
      <div class="side-i is-cur"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-6 8 6v8H4z"/></svg></span><span class="side-n">홈</span></div>
      <div class="side-i"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 9.5l4 2.5-4 2.5z" fill="currentColor"/></svg></span><span class="side-n">전체 라이브</span></div>
      <div class="side-i"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></span><span class="side-n">카테고리</span></div>
      <div class="side-i"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg></span><span class="side-n">동영상</span></div>
      <p class="side-h">팔로잉 채널</p>
      <div class="side-i is-on"><span class="side-av">A</span><span class="side-n">채널 A</span><span class="side-l"></span></div>
      <div class="side-i"><span class="side-av">B</span><span class="side-n">채널 B</span><span class="side-l"></span></div>
      <div class="side-i"><span class="side-av">C</span><span class="side-n">채널 C</span></div>
      <div class="side-i"><span class="side-av">D</span><span class="side-n">채널 D</span></div>
    </aside>
    <div class="main">
      <div class="sec">
        <div class="sec-row"><h3 class="sec-h">추천 라이브</h3><span class="more-link">전체보기</span></div>
        <div class="tabs"><span class="tab is-on">전체</span><span class="tab">게임</span><span class="tab">스포츠</span><span class="tab">엔터</span><span class="tab">기타</span></div>
        <div class="grid">
          <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">1.2천명</span></div>썸네일 자리</div><h3>방송 제목 자리 — 오늘의 라이브</h3><p>채널 A</p><div class="tags"><span class="tag is-em">드롭스</span><span class="tag">게임 이름</span></div></div>
          <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">830명</span><span class="badge b-drops">드롭스</span></div>썸네일 자리</div><h3>두 줄까지 늘어나는 방송 제목 예시 텍스트</h3><p>채널 B</p><div class="tags"><span class="tag">토크</span></div></div>
          <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-replay">다시보기</span></div>썸네일 자리</div><h3>다시보기 영상 제목</h3><p>채널 C</p></div>
          <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">57명</span></div>썸네일 자리</div><h3>새벽 방송</h3><p>채널 D</p><div class="tags"><span class="tag">음악</span></div></div>
        </div>
        <div class="more-row"><span class="more-line"></span><span class="pill-more">추천 라이브 더보기</span><span class="more-line"></span></div>
      </div>
    </div>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-live-watch",
        label:
          "라이브 시청, 데스크톱 (채팅 폭, 제목 크기, 전송 버튼, 라이트 구독 버튼과 채팅 색 가정)",
        labelDark: "라이브 시청, 데스크톱 (채팅 폭, 제목 크기, 전송 버튼 가정)",
        dummy:
          "방송 제목, 채널명, 시청자 수, 팔로워 수, 다음 방송 일정, 태그, LIVE 배지, 드롭스 배지, 채팅 닉네임과 메시지는 레이아웃 시연용 더미 데이터입니다.",
        wide: true,
        stack: true,
        screen: `
<div class="screen-desk" role="img" aria-label="라이브 시청 화면 목업">
  <div class="dk-hdr">
    <img src="/logos/chzzk.png" alt="">
    <span class="hdr-search"><span class="hdr-search-t">채널, 라이브, 동영상 검색</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></span>
    <span class="btn btn-out">로그인</span>
  </div>
  <div class="dk-body">
    <div class="dk-main">
      <div class="player"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">3,402명</span><span class="badge b-drops">드롭스</span></div>[플레이어 자리]</div>
      <h3 class="dk-title">방송 제목 자리 — 오늘도 끝까지 달립니다</h3>
      <div class="dk-ch">
        <span class="dk-av">G</span>
        <div class="dk-who"><b>채널 G</b><span>팔로워 1.2만명</span><span class="dk-next">다음 방송 11.15 20:00</span></div>
        <div class="dk-act"><span class="btn btn-1">팔로우</span><span class="btn btn-3">구독</span></div>
      </div>
      <div class="tags"><span class="tag is-em">드롭스</span><span class="tag">게임 이름</span><span class="tag">한국어</span></div>
    </div>
    <div class="dk-chat">
      <div class="chat">
        <div class="chat-h">채팅</div>
        <div class="chat-b">
          <div class="msg"><b>시청자4</b>오늘도 왔어요</div>
          <div class="msg"><b>시청자5</b>드롭스 받으러 왔습니다</div>
          <div class="msg"><b>시청자6</b>화질 좋네요</div>
          <div class="msg"><b>시청자7</b>ㅋㅋㅋ</div>
          <div class="msg"><b>시청자8</b>다음 판도 화이팅</div>
        </div>
        <div class="chat-in"><span>채팅을 입력해주세요</span><div class="chat-send">전송</div></div>
      </div>
    </div>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-home-mobile",
        label: "홈, 모바일 390 다크 전용 (치수와 하단 탭 가정)",
        dummy:
          "방송 제목, 채널명, 시청자 수, LIVE 배지, 드롭스 배지, 태그는 레이아웃 시연용 더미 데이터입니다.",
        wide: true,
        stack: true,
        screen: `
<div class="phone" role="img" aria-label="모바일 홈 목업">
  <div class="screen m-dark">
    <div class="m-hdr"><img src="/logos/chzzk.png" alt=""><span class="m-ics"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span></div>
    <div class="m-chips"><span class="tab is-on">전체</span><span class="tab">게임</span><span class="tab">스포츠</span><span class="tab">엔터</span><span class="tab">기타</span></div>
    <div class="m-list">
      <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">5,310명</span><span class="badge b-drops">드롭스</span></div>썸네일 자리</div><h3>모바일 방송 제목 자리</h3><p>채널 H</p><div class="tags"><span class="tag is-em">드롭스</span><span class="tag">게임 이름</span></div></div>
      <div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">640명</span></div>썸네일 자리</div><h3>두 번째 방송 제목 자리</h3><p>채널 I</p></div>
    </div>
    <div class="m-bar">
      <span class="is-cur"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-6 8 6v8H4z"/></svg>홈</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>카테고리</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>팔로잉</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M4 20c1.5-4 4.5-5 8-5s6.5 1 8 5"/></svg>내 정보</span>
    </div>
  </div>
</div>
`,
        after: `
<div class="specs">
  <span class="spec">비활성 탭 글자 dark-text-weak</span>
</div>
`,
      }),
    ]),
    zone("buttons", [
      cell({
        name: "button-variants",
        label: "button, 변형과 상태",
        wide: true,
        stack: true,
        stage: `
<div class="vrows">
  <div class="vrow">
    <span class="vrow-k">primary</span>
    <div class="states">
      <div class="state"><span class="state-l">기본</span><span class="btn btn-1">팔로우</span></div>
      <div class="state"><span class="state-l">hover, darken 5%</span><span class="btn btn-1 is-hover">팔로우</span></div>
      <div class="state"><span class="state-l">selected, darken 12%</span><span class="btn btn-1 is-sel">팔로우</span></div>
      <div class="state"><span class="state-l">비활성 (면 가정)</span><span class="btn is-off" aria-disabled="true">팔로우</span></div>
    </div>
  </div>
  <div class="vrow">
    <span class="vrow-k">secondary</span>
    <div class="states">
      <div class="state"><span class="state-l">기본</span><span class="btn btn-2">알림</span></div>
      <div class="state"><span class="state-l">hover, lighten 5%</span><span class="btn btn-2 is-hover">알림</span></div>
      <div class="state"><span class="state-l">selected, lighten 12%</span><span class="btn btn-2 is-sel">알림</span></div>
    </div>
  </div>
  <div class="vrow">
    <span class="vrow-k">tertiary, 라이트 (가정)</span>
    <template data-theme-variant="dark"><span class="vrow-k">tertiary</span></template>
    <div class="states">
      <div class="state"><span class="state-l">기본</span><span class="btn btn-3">구독</span></div>
    </div>
  </div>
  <div class="vrow">
    <span class="vrow-k">outlined, 테두리와 글자 (가정)</span>
    <div class="states">
      <div class="state"><span class="state-l">기본</span><span class="btn btn-out">로그인</span></div>
      <div class="state"><span class="state-l">hover, 배경색 lighten 5%</span><span class="btn btn-out is-hover">로그인</span></div>
      <div class="state"><span class="state-l">selected, 배경색 lighten 12%</span><span class="btn btn-out is-sel">로그인</span></div>
    </div>
  </div>
  <div class="vrow">
    <span class="vrow-k">아이콘 전용, danger (크기와 글자 가정)</span>
    <div class="states">
      <div class="state"><span class="state-l">아이콘 전용, radius 6</span><span class="btn btn-ic" role="img" aria-label="알림 설정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20h4"/></svg></span></div>
      <div class="state"><span class="state-l">danger, 면 live-red</span><span class="btn btn-danger">차단</span></div>
    </div>
  </div>
</div>
<div class="specs">
  <span class="spec">높이 34, radius 17, 좌우 12</span>
  <span class="spec">글자 Nemony 14 / 18 / 400</span>
  <span class="spec">primary 면 brand-strongest, 글자 white</span>
  <template data-theme-variant="dark"><span class="spec">primary 면 brand-neon, 글자 dark-bg-weak</span></template>
  <span class="spec">tertiary 면 surface-strongest, 글자 white (가정)</span>
  <template data-theme-variant="dark"><span class="spec">tertiary 면 dark-surface-strongest, 글자 dark-bg-weak</span></template>
</div>
`,
      }),
    ]),
    zone("inputs", [
      cell({
        name: "search-field",
        label: "search-field",
        stack: true,
        stage: `
<div class="in-stack">
  <div class="state full"><span class="state-l">기본</span><div class="field"><span class="field-t">채널, 라이브, 동영상 검색</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></div></div>
  <div class="state full"><span class="state-l">포커스, 테두리와 캐럿</span><div class="field is-focus"><span class="field-t">검색어</span><span class="caret" aria-hidden="true"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></div></div>
  <div class="state full"><span class="state-l">직접 입력</span><label class="field fld-live"><input type="text" placeholder="채널, 라이브, 동영상 검색" aria-label="검색 시연"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></label></div>
</div>
<div class="specs">
  <span class="spec">높이 38, 폭 400, radius 19, 15 / 19 / 400 시스템 서체</span>
  <span class="spec">테두리 border-weak, 포커스 brand-strong, 캐럿 brand-stronger</span>
  <template data-theme-variant="dark"><span class="spec">테두리 dark-border-weak, 포커스 dark-brand-base, 캐럿 dark-brand-stronger</span></template>
  <span class="hint">검색창을 눌러 입력해 보세요</span>
</div>
`,
      }),
      cell({
        name: "chat-input",
        label: "chat-input, 라이트 색, 전송 버튼, 헤더 높이 (가정)",
        labelDark: "chat-input, 전송 버튼과 헤더 높이 (가정)",
        dummy: "채팅 닉네임과 메시지는 더미 데이터입니다.",
        stack: true,
        stage: `
<div class="chat">
  <div class="chat-h">채팅</div>
  <div class="chat-b">
    <div class="msg"><b>시청자1</b>안녕하세요</div>
    <div class="msg"><b>시청자2</b>오늘 방송 기대했어요</div>
    <div class="msg"><b>시청자3</b>ㅋㅋㅋㅋ</div>
  </div>
  <div class="chat-in"><span>채팅을 입력해주세요</span><div class="chat-send">전송</div></div>
</div>
<div class="in-stack">
  <div class="state full"><span class="state-l">포커스, 오버레이 (가정)</span><div class="chat-in solo is-focus"><span>채팅을 입력해주세요</span><div class="chat-send">전송</div></div></div>
  <div class="state full"><span class="state-l">활성, 2px 테두리 (색 가정)</span><div class="chat-in solo is-act"><span>반가워요</span><div class="chat-send">전송</div></div></div>
  <div class="state full"><span class="state-l">직접 입력</span><div class="chat-in solo chat-live"><input type="text" placeholder="채팅을 입력해주세요" aria-label="채팅 입력 시연"><div class="chat-send">전송</div></div></div>
</div>
<div class="specs">
  <span class="spec">입력 42, radius 8, 패딩 6</span>
  <span class="spec">메시지 14 / 20 / 400, 행 28</span>
  <span class="spec">헤더 Nemony 15 / 18</span>
  <span class="hint">입력창을 눌러 입력해 보세요</span>
</div>
`,
      }),
      cell({
        name: "popover-sort-menu",
        label: "팝오버, 정렬 메뉴 (치수, 바탕, 선택 항목 가정)",
        stack: true,
        stage: `
<div class="pop-wrap">
  <span class="btn btn-out">인기순</span>
  <div class="pop"><div class="pop-i is-on">인기순</div><div class="pop-i">최신순</div><div class="pop-i">시청자 많은 순</div></div>
</div>
<div class="specs">
  <span class="spec">그림자 없음, 테두리 1px border-weak</span>
  <template data-theme-variant="dark"><span class="spec">테두리 없음 (가정), 그림자 shadow-popover 3겹</span></template>
</div>
`,
      }),
    ]),
    zone("navigation", [
      cell({
        name: "nav-item",
        label: "nav-item, 사이드바 항목",
        stack: true,
        stage: `
<div class="states">
  <div class="state"><span class="state-l">기본</span><div class="side-i"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></span><span class="side-n">카테고리</span></div></div>
  <div class="state"><span class="state-l">hover, lighten 5%</span><div class="side-i is-on"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></span><span class="side-n">카테고리</span></div></div>
  <div class="state"><span class="state-l">selected, lighten 12%</span><div class="side-i is-sel"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></span><span class="side-n">카테고리</span></div></div>
  <div class="state"><span class="state-l">현재 메뉴</span><div class="side-i is-cur"><span class="side-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-6 8 6v8H4z"/></svg></span><span class="side-n">홈</span></div></div>
</div>
<div class="specs">
  <span class="spec">높이 38, radius 8, 15 / 19 / 600</span>
  <span class="spec">현재 메뉴 글자 brand-text-base</span>
  <template data-theme-variant="dark"><span class="spec">현재 메뉴 글자 dark-brand-stronger</span></template>
  <span class="spec">섹션 제목 13 / 17 / 600</span>
</div>
`,
      }),
      cell({
        name: "top-tabs",
        label: "상단 탭",
        stack: true,
        stage: `
<div class="states">
  <div class="state"><span class="state-l">현재, 글자 (가정)</span><div class="ttabs"><span class="ttab is-cur">게임</span></div></div>
  <div class="state"><span class="state-l">비활성, 라이트 글자 (가정)</span><template data-theme-variant="dark"><span class="state-l">비활성</span></template><div class="ttabs"><span class="ttab">e스포츠</span><span class="ttab">스포츠</span><span class="ttab">엔터+</span></div></div>
  <div class="state"><span class="state-l">직접 선택</span><div class="ttabs" role="tablist" aria-label="상단 탭 시연" data-pv-toggle="aria-selected"><button type="button" class="ttab" role="tab" data-pv-option aria-selected="true">게임</button><button type="button" class="ttab" role="tab" data-pv-option aria-selected="false">e스포츠</button><button type="button" class="ttab" role="tab" data-pv-option aria-selected="false">스포츠</button><button type="button" class="ttab" role="tab" data-pv-option aria-selected="false">엔터+</button></div></div>
</div>
<div class="specs">
  <span class="spec">17 / 21 / 800</span>
  <span class="spec">비활성 글자 text-weak (가정)</span>
  <template data-theme-variant="dark"><span class="spec">비활성 글자 dark-text-weak</span></template>
  <span class="hint">탭을 눌러 보세요</span>
</div>
`,
      }),
    ]),
    zone("content", [
      cell({
        name: "live-card",
        label: "live-card, 태그 칩 (칩 바탕, 치수, 글자 가정)",
        dummy:
          "방송 제목, 채널명, 시청자 수, LIVE 배지, 드롭스 배지, 태그는 레이아웃 시연용 더미 데이터입니다.",
        wide: true,
        stack: true,
        stage: `
<div class="lc-pair">
  <div class="state"><span class="state-l">기본</span><div class="card"><div class="thumb"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">2,048명</span><span class="badge b-drops">드롭스</span></div>썸네일 자리</div><h3>방송 제목 자리 — 주말 정주행</h3><p>채널 E</p><div class="tags"><span class="tag is-em">드롭스</span><span class="tag">게임 이름</span><span class="tag">한국어</span></div></div></div>
  <div class="state"><span class="state-l">hover, 덧씌움 검정 50%</span><div class="card"><div class="thumb is-hover"><div class="thumb-badges"><span class="badge b-live">LIVE</span><span class="badge b-view">2,048명</span><span class="badge b-drops">드롭스</span></div>썸네일 자리</div><h3>방송 제목 자리 — 주말 정주행</h3><p>채널 E</p><div class="tags"><span class="tag is-em">드롭스</span><span class="tag">게임 이름</span><span class="tag">한국어</span></div></div></div>
</div>
<div class="specs">
  <span class="spec">썸네일 372 × 209, radius 12</span>
  <span class="spec">제목 15 / 19 / 600</span>
  <span class="spec">덧씌움 0.2초</span>
  <span class="spec">태그 칩 radius 4, 강조 글자 brand-text (가정)</span>
  <template data-theme-variant="dark"><span class="spec">태그 칩 radius 4, 강조 글자 dark-brand-strong</span></template>
  <span class="hint">썸네일에 마우스를 올려 보세요</span>
</div>
`,
      }),
      cell({
        name: "badge",
        label: "badge",
        dummy: "시청자 수와 재생시간은 레이아웃 시연용 더미 데이터입니다.",
        stack: true,
        stage: `
<div class="states">
  <div class="state"><span class="state-l">LIVE</span><span class="badge b-live">LIVE</span></div>
  <div class="state"><span class="state-l">시청자 수</span><span class="badge b-view">1.2천명</span></div>
  <div class="state"><span class="state-l">재생시간</span><span class="badge b-view">1:42:07</span></div>
  <div class="state"><span class="state-l">다시보기</span><span class="badge b-replay">다시보기</span></div>
  <div class="state"><span class="state-l">드롭스, 면 (가정)</span><span class="badge b-drops">드롭스</span></div>
</div>
<div class="specs">
  <span class="spec">높이 20, radius 4, 12 / 20 / 700</span>
  <span class="spec">다시보기 Nemony 11</span>
  <span class="spec">시청자 수 면 검정 80%</span>
  <span class="spec">드롭스 글자 brand-text-weak</span>
  <template data-theme-variant="dark"><span class="spec">드롭스 글자 brand-neon</span></template>
</div>
`,
      }),
      cell({
        name: "side-card-category-card",
        label: "가로형 추천 카드, 카테고리 카드 (치수 가정)",
        dummy:
          "영상 제목, 채널명, 다시보기 배지, 재생시간, 카테고리 이름, 시청자 수는 레이아웃 시연용 더미 데이터입니다.",
        stack: true,
        stage: `
<div class="hcard"><div class="thumb"><div class="thumb-badges"><span class="badge b-replay">다시보기</span><span class="badge b-view">48:12</span></div>썸네일 자리</div><div><h3>가로형 카드 제목은 시스템 서체로 두 줄까지</h3><p>채널 F</p></div></div>
<div class="cats">
  <div class="cat"><div class="cat-poster">[포스터 자리]</div><b>카테고리 1</b><span>시청자 3.1만</span></div>
  <div class="cat"><div class="cat-poster">[포스터 자리]</div><b>카테고리 2</b><span>시청자 8,240</span></div>
  <div class="cat"><div class="cat-poster">[포스터 자리]</div><b>카테고리 3</b><span>시청자 912</span></div>
</div>
<div class="specs">
  <span class="spec">가로형 제목 15 / 21 / 500 시스템 서체</span>
</div>
`,
      }),
      cell({
        name: "channel-head",
        label: "채널 머리, 구독 티어 배지 (치수와 라이트 구독 버튼 가정)",
        labelDark: "채널 머리, 구독 티어 배지 (치수 가정)",
        dummy:
          "채널명, 팔로워 수, LIVE 배지, 구독 티어, 구독 선물 배지는 레이아웃 시연용 더미 데이터입니다.",
        stack: true,
        stage: `
<div class="ch">
  <span class="ch-av">J</span>
  <div class="ch-who">
    <p class="ch-name">채널 J <span class="badge b-live">LIVE</span></p>
    <p class="ch-meta">팔로워 4.8만명</p>
  </div>
  <div class="ch-act"><span class="btn btn-1">팔로우</span><span class="btn btn-3">구독</span></div>
</div>
<div class="states">
  <div class="state"><span class="state-l">구독 티어 1</span><span class="badge b-tier1">티어 1</span></div>
  <div class="state"><span class="state-l">구독 티어 2</span><span class="badge b-tier2">티어 2</span></div>
  <div class="state"><span class="state-l">구독 선물</span><span class="badge b-replay">구독 선물</span></div>
</div>
<div class="specs">
  <span class="spec">채널명 28 / 36 / 700 (가정)</span>
  <span class="spec">티어 면 subscribe-tier-1, subscribe-tier-2</span>
</div>
`,
      }),
    ]),
    zone("feedback", [
      cell({
        name: "modal",
        label: "modal, 라이트 바탕 (가정)",
        labelDark: "modal",
        stack: true,
        stage: `
<div class="modal"><h4>알림 설정</h4><p>모달 본문 문구 예시입니다.</p><span class="btn btn-1">확인</span></div>
<div class="specs">
  <span class="spec">폭 450, radius 12, shadow-level-6</span>
  <span class="spec">확인 버튼 44, radius 8</span>
  <span class="spec">제목 22 / 30 / 700 (가정)</span>
</div>
`,
      }),
    ]),
  ],
})
