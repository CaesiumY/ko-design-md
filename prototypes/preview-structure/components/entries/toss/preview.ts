// Item module of the "components" structure. Converted from the served
// preview by prototypes/preview-structure/components/convert.ts.
// Build: pnpm pv:build toss   Check: pnpm pv:check toss

import { cell, definePreview, screen, zone } from "../../kit/parts.ts"

export default definePreview({
  slug: "toss",
  title: "토스 preview",
  noindex: true,
  hero: `
<div class="strip">
  <div class="container">
    <div class="row">
      <span class="wordmark"><img class="logo-dot" src="/logos/toss.png" alt="">토스</span>
      <span class="meta">TDS Mobile · 2026 (Apps in Toss)</span>
      <div class="right">
        <span class="text-meta-caps" style="font-size: 11px;"><span data-theme-text="">PREVIEW · LIGHT</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">PREVIEW · DARK</span></template></span>
        <span class="badge b-blue">Token-driven</span>
      </div>
    </div>
  </div>
</div>
<div class="hero">
  <div class="container">
    <div class="brand-lockup">
      <img src="/logos/toss-logotype.png" alt="Toss">
      <span class="wm-text">토스</span>
    </div>
    <span class="eyebrow">은행에 다니는 유능한 친구</span>
    <h1>금융을 더 쉽게,<br>토스로 한번에.</h1>
    <p class="subtitle">송금·결제·은행·증권을 한 화면에서.</p>
    <div class="cta-row">
      <button class="btn btn-xl btn-brand" type="button">시작하기</button>
      <button class="btn btn-xl btn-neutral" type="button">컴포넌트 둘러보기</button>
      <button class="btn btn-xl btn-ghost" type="button">개발자 문서 →</button>
    </div>

  </div>
</div>
`,
  zones: [
    zone("screens", [
      screen({
        name: "screen-send-home",
        label: "01. 홈 · 송금하기",
        screen: `
<div class="phone">
  <div class="top-app-bar">
    <div class="title" style="font-size: 22px; font-weight: 800; color: var(--tds-grey-900); padding-left: 4px; letter-spacing: -0.020em;">toss</div>
    <div class="ic-btn">⌕</div>
    <div class="ic-btn" style="position: relative;">
      🔔
      <span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 999px; background: var(--tds-red-500); border: 1.5px solid #fff;"></span>
    </div><template data-theme-variant="dark" data-theme-op="swap"><div class="ic-btn" style="position: relative;">
      🔔
      <span style="position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 999px; background: var(--tds-red-500); border: 1.5px solid var(--tds-near-black);"></span>
    </div></template>
  </div>
  <div class="content">
    <div class="balance-card">
      <div class="balance-card-head">
        <span class="lbl">토스뱅크 통장</span>
        <span style="color: var(--tds-grey-400); font-size: 14px;">›</span>
      </div>
      <p class="balance num-tab">1,284,520<span class="unit">원</span></p>
      <div class="home-quick-btns">
        <button class="qb">채우기</button>
        <button class="qb primary">보내기</button>
      </div>
    </div>

    <p class="section-h">최근 송금</p>
    <div class="list-card">
      <div class="lrow">
        <div class="av">😊</div>
        <div class="body"><div class="ttl">엄마</div><div class="sub">토스뱅크 · 1234</div></div>
        <div class="right"><div class="arrow">›</div></div>
      </div>
      <div class="lrow">
        <div class="av av-blue">🧑‍💼</div>
        <div class="body"><div class="ttl">김민준</div><div class="sub">국민 · 5678</div></div>
        <div class="right"><div class="arrow">›</div></div>
      </div>
      <div class="lrow">
        <div class="av av-warm">🎂</div>
        <div class="body"><div class="ttl">이서연</div><div class="sub">신한 · 9012</div></div>
        <div class="right"><div class="arrow">›</div></div>
      </div>
    </div>
  </div>

  <!-- Floating Tab-Bar (홈 · 혜택 · 주식 · 전체) -->
  <nav class="tab-bar" aria-label="하단 탭">
    <span class="tab active">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 12 4l8 7"></path><path d="M6 10v9h12v-9"></path></svg>
      홈
    </span>
    <span class="tab">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8H4v-8"></path><path d="M2 8h20v4H2z"></path><path d="M12 8v12"></path><path d="M12 8S10 4 7.5 4 5 6 5 6s.5 2 3 2 4 0 4 0Z"></path></svg>
      혜택
    </span>
    <span class="tab">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 9 11l4 4 7-9"></path></svg>
      주식
    </span>
    <span class="tab">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>
      전체
    </span>
  </nav>

  <div class="bottom-cta-wrap">
    <div class="protection"></div>
    <button class="bottom-cta" type="button">송금하기</button>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-send-select",
        label: "02. 받는 사람 선택",
        screen: `
<div class="phone">
  <div class="top-app-bar">
    <div class="ic-btn">←</div>
    <div class="title">누구에게 보낼까요?</div>
    <div class="ic-btn right">×</div>
  </div>
  <div class="content" style="padding: 8px 16px 16px;">
    <div class="search-field">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-3.5-3.5"></path></svg>
      <input placeholder="이름, 전화번호 또는 계좌번호">
    </div>
    <p style="font-size: 13px; font-weight: 600; color: var(--tds-grey-600); margin: 18px 8px 6px;">자주 쓰는 친구</p>
    <div class="lrow" style="padding: 10px 8px;">
      <div class="av">😊</div>
      <div class="body"><div class="ttl">엄마</div><div class="sub">토스뱅크 · 1234</div></div>
      <div class="right"><div class="arrow">›</div></div>
    </div>
    <div class="lrow" style="padding: 10px 8px;">
      <div class="av av-blue">🧑‍💼</div>
      <div class="body"><div class="ttl">김민준</div><div class="sub">국민 · 5678</div></div>
      <div class="right"><div class="arrow">›</div></div>
    </div>
    <div class="lrow" style="padding: 10px 8px;">
      <div class="av av-warm">🎂</div>
      <div class="body"><div class="ttl">이서연</div><div class="sub">신한 · 9012</div></div>
      <div class="right"><div class="arrow">›</div></div>
    </div>
    <div class="lrow" style="padding: 10px 8px;">
      <div class="av av-grey">🐶</div>
      <div class="body"><div class="ttl">박지호</div><div class="sub">카카오뱅크 · 3456</div></div>
      <div class="right"><div class="arrow">›</div></div>
    </div>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-send-amount",
        label: "03. 금액 입력",
        screen: `
<div class="phone">
  <div class="top-app-bar">
    <div class="ic-btn">←</div>
    <div class="title" style="opacity: 0;">.</div>
    <div class="ic-btn right">×</div>
  </div>
  <div class="content" style="padding: 4px 20px 8px;">
    <p class="amt-screen-eyebrow">엄마 · 토스뱅크 1234</p>
    <p class="amt-screen-value num-tab">120,000<span class="unit">원</span></p>
    <p class="amt-screen-balance num-tab">출금 가능 1,284,520원</p>
    <div class="amt-quick-chips">
      <button class="qc">+1만</button>
      <button class="qc">+5만</button>
      <button class="qc">+10만</button>
      <button class="qc">전액</button>
    </div>
    <div class="keypad-grid">
      <button class="key">1</button>
      <button class="key">2</button>
      <button class="key">3</button>
      <button class="key">4</button>
      <button class="key">5</button>
      <button class="key">6</button>
      <button class="key">7</button>
      <button class="key">8</button>
      <button class="key">9</button>
      <button class="key">00</button>
      <button class="key">0</button>
      <button class="key" aria-label="지우기">⌫</button>
    </div>
  </div>
  <div class="bottom-cta-wrap">
    <div class="protection"></div>
    <button class="bottom-cta" type="button">120,000원 보내기</button>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-send-confirm",
        label: "04. 확인",
        screen: `
<div class="phone">
  <div class="top-app-bar">
    <div class="ic-btn">←</div>
    <div class="title" style="opacity: 0;">.</div>
    <div class="ic-btn right">×</div>
  </div>
  <div class="content" style="padding: 8px 24px 16px;">
    <p class="confirm-head">엄마님께<br>120,000원을 보낼까요?</p>
    <div class="confirm-card">
      <div class="kv"><span class="k">받는 분</span><span class="v">엄마</span></div>
      <div class="kv"><span class="k">받는 계좌</span><span class="v">토스뱅크 1000-1234-5678</span></div>
      <div class="kv"><span class="k">보내는 통장</span><span class="v">토스뱅크 통장</span></div>
      <div class="kv"><span class="k">수수료</span><span class="v brand">없음</span></div>
    </div>
    <p class="tds-body-3" style="margin-top: 20px;">송금 후에는 취소할 수 없어요. 한 번 더 확인해주세요.</p>
  </div>
  <div class="bottom-cta-wrap">
    <div class="protection"></div>
    <button class="bottom-cta" type="button">120,000원 보내기</button>
  </div>
</div>
`,
      }),
      screen({
        name: "screen-send-done",
        label: "05. 완료",
        screen: `
<div class="phone">
  <div class="top-app-bar">
    <div class="title" style="opacity: 0;">.</div>
  </div>
  <div class="content" style="padding: 0;">
    <div class="done-stage">
      <div class="done-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"></path></svg><template data-theme-variant="dark" data-theme-op="swap"><svg viewBox="0 0 24 24" fill="none" stroke="var(--tds-near-black)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"></path></svg></template>
      </div>
      <p class="done-title">송금 완료</p>
      <p class="done-sub num-tab">엄마님께 120,000원을<br>보냈어요</p>
      <div class="done-illo">😊</div>
    </div>
  </div>
  <div class="bottom-cta-wrap">
    <div class="protection"></div>
    <button class="bottom-cta" type="button">확인</button>
  </div>
</div>
`,
      }),
    ]),
    zone("buttons", [
      cell({
        name: "button-size",
        label: "SIZE · XL 56 / L 48 / M 40 / S 32",
        stack: true,
        stage: `
<div class="btn-group">
  <button class="btn btn-xl btn-brand" type="button">송금하기</button>
  <button class="btn btn-l btn-brand" type="button">다음</button>
  <button class="btn btn-m btn-brand" type="button">확인</button>
  <button class="btn btn-s btn-brand" type="button">선택</button>
</div>
`,
      }),
      cell({
        name: "button-variant",
        label: "VARIANT · primary / neutral / danger / ghost",
        stack: true,
        stage: `
<div class="btn-group">
  <button class="btn btn-l btn-brand" type="button">송금하기</button>
  <button class="btn btn-l btn-neutral" type="button">취소</button>
  <button class="btn btn-l btn-danger" type="button">삭제</button>
  <button class="btn btn-l btn-ghost" type="button">자세히</button>
</div>
`,
      }),
      cell({
        name: "button-state",
        label: `<span data-theme-text="">STATE · default / pressed (검정 26% overlay) / disabled (opacity 30%)</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">STATE · default / pressed (가정) / disabled (opacity 30%)</span></template>`,
        stack: true,
        stage: `
<div class="btn-group">
  <button class="btn btn-l btn-brand" type="button">송금하기</button>
  <button class="btn btn-l btn-brand pressed" type="button">송금하기</button>
  <button class="btn btn-l btn-brand btn-disabled" type="button" aria-disabled="true">송금하기</button>
</div>
`,
      }),
      cell({
        name: "text-button",
        label: "TEXT-BUTTON · 인라인 링크 위계 · default / neutral / disabled",
        stack: true,
        stage: `
<div class="btn-group">
  <button class="text-btn" type="button">전체보기 <span class="chev">›</span></button>
  <button class="text-btn neutral" type="button">접기 <span class="chev">›</span></button>
  <button class="text-btn danger" type="button">연결 해제</button>
  <button class="text-btn is-disabled" type="button" aria-disabled="true">더 불러올 수 없어요</button>
</div>
`,
      }),
      cell({
        name: "bottom-info",
        label: "BOTTOM-INFO",
        stack: true,
        stage: `
<div class="bottom-info">
  <span class="info-pill">수수료 없이 보내요</span>
  <button class="bi-cta" type="button">120,000원 보내기</button>
</div>
`,
      }),
      cell({
        name: "list-footer",
        label: "LIST-FOOTER",
        stack: true,
        stage: `
<button class="list-footer" type="button">더보기 <span class="chev">›</span></button>
`,
      }),
    ]),
    zone("inputs", [
      cell({
        name: "text-field",
        label: "TEXT FIELD — idle / focused / error",
        stack: true,
        stage: `
<div class="field-stack">
  <div class="field">
    <label for="t-1">받는 분</label>
    <input id="t-1" class="input" type="text" placeholder="이름 또는 계좌번호">
    <p class="helper">최근 송금한 사람부터 자동 추천돼요.</p>
  </div>
  <div class="field">
    <label for="t-2">금액</label>
    <input id="t-2" class="input focused num-tab" type="text" value="120,000원">
    <p class="helper">잔액 1,234,567원 중 사용</p>
  </div>
  <div class="field">
    <label for="t-3">받는 분 메모</label>
    <input id="t-3" class="input error" type="text" value="20자 초과 입력했어요">
    <p class="helper error">20자까지 입력할 수 있어요.</p>
  </div>
</div>
`,
      }),
      cell({
        name: "search-field",
        label: `Search Field, <span data-theme-text="">grey-100 resting → focus white + 1.5px blue</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">grey-100 resting → focus near-black + 1.5px blue</span></template>, 치수 (가정)`,
        stack: true,
        stage: `
<div style="display:flex; flex-direction:column; gap:12px;">
  <div class="search-field">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-3.5-3.5"></path></svg>
    <input placeholder="검색어를 입력해주세요">
  </div>
  <div class="search-field focus">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-3.5-3.5"></path></svg>
    <input value="토스뱅크">
    <div class="clear-x">×</div>
  </div>
</div>
`,
      }),
      cell({
        name: "slider",
        label: "Slider, 8px track · 28px thumb · tabular value, 치수 (가정)",
        stack: true,
        stage: `
<div class="demo-block">
  <div class="slider-row">
    <div class="slider-head">
      <div class="slider-lab">월 저축 금액</div>
      <div class="slider-val">300,000원</div>
    </div>
    <div class="slider-track">
      <div class="slider-fill" style="width: 35%;"></div>
      <div class="slider-thumb" style="left: 35%;"></div>
    </div>
    <div class="slider-ticks"><span>0</span><span>500K</span><span>1M</span></div>
  </div>
  <div class="slider-row">
    <div class="slider-head">
      <div class="slider-lab">기간</div>
      <div class="slider-val">12개월</div>
    </div>
    <div class="slider-track">
      <div class="slider-fill" style="width: 67%;"></div>
      <div class="slider-thumb" style="left: 67%;"></div>
    </div>
  </div>
</div>
`,
      }),
      cell({
        name: "numeric-spinner",
        label: "NUMERIC-SPINNER",
        stack: true,
        stage: `
<div class="num-spin">
  <button type="button" aria-label="감소">−</button>
  <span class="nv num-tab">2</span>
  <button type="button" aria-label="증가">+</button>
</div>
`,
      }),
      cell({
        name: "stepper",
        label: "STEPPER",
        stack: true,
        stage: `
<div class="v-step">
  <button type="button" aria-label="증가">▲</button>
  <span class="sv num-tab">3</span>
  <button type="button" aria-label="감소">▼</button>
</div>
`,
      }),
      cell({
        name: "menu",
        label: "MENU",
        stack: true,
        stage: `
<div class="menu-pop">
  <div class="mi active">최신순 <span class="ck">✓</span></div>
  <div class="mi">가나다순</div>
  <div class="mi">금액순</div>
</div>
`,
      }),
    ]),
    zone("selection", [
      cell({
        name: "switch-checkbox",
        label: "SWITCH · CHECKBOX (resting / on)",
        stack: true,
        stage: `
<div class="ctrl-stack">
  <label class="ctrl-line">
    <input class="ctrl-input" type="checkbox" role="switch" checked="">
    <span class="tds-switch" aria-hidden="true"></span>
    <span>잔액 자동 채우기</span>
  </label>
  <label class="ctrl-line">
    <input class="ctrl-input" type="checkbox" role="switch">
    <span class="tds-switch" aria-hidden="true"></span>
    <span>매월 정기 송금 알림</span>
  </label>
  <label class="ctrl-line">
    <input class="ctrl-input" type="checkbox" checked="">
    <span class="tds-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </span>
    <span>토스 서비스 이용약관에 동의해요</span>
  </label>
  <label class="ctrl-line">
    <input class="ctrl-input" type="checkbox">
    <span class="tds-check" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </span>
    <span>마케팅 정보 수신에 동의해요 (선택)</span>
  </label>
</div>
`,
      }),
      cell({
        name: "segmented-control",
        label:
          "Segmented Control, pill 3-segments · underline tab, 치수 (가정)",
        stack: true,
        stage: `
<div class="demo-block">
  <div class="seg" role="radiogroup" data-pv-toggle="aria-checked">
    <button class="it" type="button" role="radio" aria-checked="true" data-pv-option="">전체</button>
    <button class="it" type="button" role="radio" aria-checked="false" data-pv-option="">입금</button>
    <button class="it" type="button" role="radio" aria-checked="false" data-pv-option="">출금</button>
  </div>
  <div class="seg-line" role="radiogroup" data-pv-toggle="aria-checked">
    <button class="it" type="button" role="radio" aria-checked="true" data-pv-option="">예금</button>
    <button class="it" type="button" role="radio" aria-checked="false" data-pv-option="">적금</button>
    <button class="it" type="button" role="radio" aria-checked="false" data-pv-option="">투자</button>
    <button class="it" type="button" role="radio" aria-checked="false" data-pv-option="">대출</button>
  </div>
</div>
`,
      }),
      cell({
        name: "chip",
        label: "CHIP · resting / active / brand · removable",
        stack: true,
        stage: `
<div class="chip-row">
  <span class="chip">전체</span>
  <span class="chip active">입금</span>
  <span class="chip">출금</span>
  <span class="chip">자동이체</span>
  <span class="chip brand">+ 카테고리 추가</span>
  <span class="chip active">엄마 <span class="x">×</span></span>
</div>
`,
      }),
      cell({
        name: "filter-chips",
        label:
          "Filter Chips — scrollable row, multi-select · grey-900 active · S 28 / M 34 / L 42, 치수 (가정)",
        stack: true,
        stage: `
<div class="demo-block">
  <div class="chip-row" style="overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px;">
    <span class="chip active">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path d="m5 12 5 5L20 7"></path></svg>
      전체
    </span>
    <span class="chip">결제</span>
    <span class="chip">송금</span>
    <span class="chip">이자</span>
    <span class="chip">투자</span>
    <span class="chip">자동이체</span>
    <span class="chip">기타</span>
  </div>
  <p class="comp-caption" style="margin-top: 16px;">size · S 28 / M 34 / L 42</p>
  <div class="chip-row">
    <span class="chip" style="height: 28px; padding: 0 10px; font-size: 12px;">S</span>
    <span class="chip">M · 34</span>
    <span class="chip" style="height: 42px; padding: 0 16px; font-size: 15px;">L · 42</span>
  </div>
</div>
`,
      }),
    ]),
    zone("navigation", [
      cell({
        name: "navigation-apps-in-toss",
        label: "NAVIGATION · APPS IN TOSS",
        stack: true,
        stage: `
<div class="nav-ait">
  <span class="nav-back">‹</span>
  <span class="nav-title">미니앱 홈</span>
  <span class="host"><img src="/logos/toss.png" alt="">토스 안에서 실행 중</span>
</div>
`,
      }),
      cell({
        name: "tab",
        label: "TAB",
        stack: true,
        stage: `
<div class="tab-inline" role="tablist" data-pv-toggle="aria-selected">
  <button class="ti" type="button" role="tab" aria-selected="true" data-pv-option="">홈</button>
  <button class="ti" type="button" role="tab" aria-selected="false" data-pv-option="">송금</button>
  <button class="ti" type="button" role="tab" aria-selected="false" data-pv-option="">내역</button>
</div>
`,
      }),
    ]),
    zone("content", [
      cell({
        name: "list-row",
        label: "list-header, list-row",
        stack: true,
        stage: `
<div class="listcard">
  <div class="list-header">
    <h3>최근 거래 내역</h3>
    <a href="#">전체보기 ›</a>
  </div>
  <p class="catalog-dummy">아래 거래 내역의 이름·가맹점명·계좌·금액·시각은 모두 레이아웃 시연용 더미 데이터이며, 실제 거래가 아닙니다.</p>
  <div class="lrow">
    <div class="av">😊</div>
    <div class="body"><div class="ttl">엄마</div><div class="sub">토스뱅크 · 1234</div></div>
    <div class="right"><div class="amt plus">+50,000원</div><div class="stamp">방금 전</div></div>
  </div>
  <div class="lrow">
    <div class="av av-blue">🚕</div>
    <div class="body"><div class="ttl">카카오T 택시</div><div class="sub">교통</div></div>
    <div class="right"><div class="amt">−12,300원</div><div class="stamp">오후 2:14</div></div>
  </div>
  <div class="lrow">
    <div class="av av-grey">📦</div>
    <div class="body"><div class="ttl">쿠팡</div><div class="sub">쇼핑 · 즉시 결제</div></div>
    <div class="right"><div class="amt">−34,900원</div><div class="stamp">어제</div></div>
  </div>
  <div class="lrow">
    <div class="av av-warm">🏷️</div>
    <div class="body"><div class="ttl">정기적금 자동이체</div><div class="sub">매월 25일</div></div>
    <div class="right"><div class="arrow">›</div></div>
  </div>
</div>
`,
      }),
      cell({
        name: "badge",
        label: "BADGE · washed bg + 시맨틱 텍스트 컬러",
        stack: true,
        stage: `
<div class="badge-row">
  <span class="badge b-red">N</span>
  <span class="badge b-green">완료</span>
  <span class="badge b-blue">신규</span>
  <span class="badge b-grey">예약</span>
</div>
`,
      }),
      cell({
        name: "rating",
        label: "Rating, 5-star · half-fill · yellow-500 body, 치수 (가정)",
        stack: true,
        stage: `
<div class="demo-block">
  <div class="rating-row">
    <div class="rating-stars lg">
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><defs><linearGradient id="half-l-1"><stop offset="50%" style="stop-color: var(--tds-yellow-500)"></stop><stop offset="50%" stop-color="oklch(0.930 0.005 248)"></stop></linearGradient></defs><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="url(#half-l-1)"></path></svg><template data-theme-variant="dark" data-theme-op="swap"><svg viewBox="0 0 24 24"><defs><linearGradient id="half-d-1"><stop offset="50%" style="stop-color: var(--tds-yellow-500)"></stop><stop offset="50%" stop-color="oklch(0.361 0.019 285)"></stop></linearGradient></defs><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="url(#half-d-1)"></path></svg></template>
    </div>
    <div class="rating-score">4.5</div>
  </div>
  <div class="rating-row" style="margin-top: 16px;">
    <div class="rating-stars">
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" style="fill: var(--tds-yellow-500)"></path></svg>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="oklch(0.930 0.005 248)"></path></svg><template data-theme-variant="dark" data-theme-op="swap"><svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="oklch(0.361 0.019 285)"></path></svg></template>
      <svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="oklch(0.930 0.005 248)"></path></svg><template data-theme-variant="dark" data-theme-op="swap"><svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.8 1.7-7.1L2 9.1l7.2-.6L12 2l2.8 6.5 7.2.6-5.5 4.9 1.7 7.1z" fill="oklch(0.361 0.019 285)"></path></svg></template>
    </div>
    <div class="pb-val">3 / 5</div>
  </div>
</div>
`,
      }),
      cell({
        name: "board-row",
        label: "BOARD-ROW",
        stack: true,
        stage: `
<div class="board-row">
  <span class="rank lead">1</span>
  <span class="b-av">🦁</span>
  <span class="b-name">김토스</span>
  <span class="b-score num-tab">2,840P</span>
</div>
<div class="board-row">
  <span class="rank">2</span>
  <span class="b-av blue">🐱</span>
  <span class="b-name">이서연</span>
  <span class="b-score num-tab">2,610P</span>
</div>
`,
      }),
      cell({
        name: "bar-chart",
        label: "BAR-CHART",
        stack: true,
        stage: `
<div class="bar-chart">
  <div class="bc-col"><span class="bc-bar" style="height: 40%;"></span><span class="bc-lab">월</span></div>
  <div class="bc-col"><span class="bc-bar" style="height: 64%;"></span><span class="bc-lab">화</span></div>
  <div class="bc-col"><span class="bc-bar on" style="height: 100%;"></span><span class="bc-lab">수</span></div>
  <div class="bc-col"><span class="bc-bar" style="height: 52%;"></span><span class="bc-lab">목</span></div>
  <div class="bc-col"><span class="bc-bar" style="height: 76%;"></span><span class="bc-lab">금</span></div>
</div>
`,
      }),
      cell({
        name: "grid-list",
        label: "GRID-LIST",
        stack: true,
        stage: `
<div class="grid-list">
  <div class="gl-tile"><span class="gl-ic">💸</span><span class="gl-lab">송금</span></div>
  <div class="gl-tile"><span class="gl-ic">💳</span><span class="gl-lab">결제</span></div>
  <div class="gl-tile"><span class="gl-ic">📈</span><span class="gl-lab">투자</span></div>
  <div class="gl-tile"><span class="gl-ic">🧾</span><span class="gl-lab">내역</span></div>
</div>
`,
      }),
      cell({
        name: "post",
        label: "POST",
        stack: true,
        stage: `
<div class="post">
  <div class="p-head">
    <span class="p-av">🦊</span>
    <span class="p-name">토스증권</span>
    <span class="p-time">3시간 전</span>
  </div>
  <p class="p-body">오늘 코스피가 2,650선을 회복했어요. 관심 종목 알림을 켜두면 변동을 바로 받아볼 수 있어요.</p>
  <div class="p-react">
    <span class="rx on">♥ 128</span>
    <span class="rx">💬 24</span>
    <span class="rx">↗ 공유</span>
  </div>
</div>
`,
      }),
      cell({
        name: "bubble",
        label: "BUBBLE",
        stack: true,
        stage: `
<div class="bubble-demo">
  <div class="bubble them">언제 보내줄 수 있어?</div>
  <div class="bubble me">방금 보냈어요</div>
</div>
`,
      }),
      cell({
        name: "table-row",
        label: "TABLE-ROW",
        stack: true,
        stage: `
<table class="table-mini">
  <caption class="catalog-dummy">표에 든 종목명·현재가·등락률은 레이아웃 시연용 더미 데이터입니다 — 실제 시세가 아닙니다.</caption>
  <thead>
    <tr><th>종목</th><th class="amt-cell">현재가</th><th class="amt-cell">등락</th></tr>
  </thead>
  <tbody>
    <tr><td>삼성전자</td><td class="amt-cell">74,200</td><td class="amt-cell" style="color: var(--tds-blue-500);">+1.2%</td></tr>
    <tr><td>SK하이닉스</td><td class="amt-cell">182,500</td><td class="amt-cell" style="color: var(--tds-red-500);">−0.8%</td></tr>
  </tbody>
</table>
`,
      }),
      cell({
        name: "border",
        label: "BORDER",
        stack: true,
        stage: `
<div class="border-demo">
  <div class="bl-row"><span class="lbl">subtle</span><span class="hr subtle"></span></div>
  <div class="bl-row"><span class="lbl">default</span><span class="hr def"></span></div>
  <div class="bl-row"><span class="lbl">strong</span><span class="hr strong"></span></div>
</div>
`,
      }),
    ]),
    zone("feedback", [
      cell({
        name: "toast",
        label: `<span data-theme-text="">TOAST · grey-900 surface + 흰 라벨</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">TOAST · grey-200 surface + 밝은 라벨 (다크)</span></template>`,
        stage: `
<div class="toast">
  <div class="ic">✓</div>
  <div class="txt">송금이 완료되었어요</div>
</div>
`,
      }),
      cell({
        name: "dialog",
        label: "DIALOG · radius 20 · shadow-3",
        stack: true,
        stage: `
<div class="dialog">
  <div class="dlg-title">송금을 취소할까요?</div>
  <div class="dlg-body">취소하면 작성하던 내용이 사라져요.</div>
  <div class="dlg-actions">
    <button class="dlg-btn secondary">계속 작성</button>
    <button class="dlg-btn primary">취소</button>
  </div>
</div>
`,
      }),
      cell({
        name: "bottom-sheet",
        label: `Bottom Sheet — grab handle, <span data-theme-text="">scrim 56% · radius 24 top · grey-300 handle bar</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">scrim 64% · radius 24 top · grey-300 handle bar</span></template>, 치수 (가정)`,
        stack: true,
        stage: `
<div class="sheet-stage">
  <div class="sheet">
    <div class="grab"></div>
    <div class="sheet-ttl">송금 방법을 선택해주세요</div>
    <div class="sheet-desc">친구에게 더 빠르게 보낼 수 있어요.</div>
    <div style="margin-top: 12px;">
      <div class="opt">
        <div class="ic-circle">📱</div>
        <div class="name">연락처로 보내기</div>
        <div class="ar">›</div>
      </div>
      <div class="opt">
        <div class="ic-circle">🏦</div>
        <div class="name">계좌번호로 보내기</div>
        <div class="ar">›</div>
      </div>
      <div class="opt">
        <div class="ic-circle">📷</div>
        <div class="name">QR로 보내기</div>
        <div class="ar">›</div>
      </div>
    </div>
  </div>
</div>
`,
      }),
      cell({
        name: "tooltip",
        label: `Tooltip, <span data-theme-text="">grey-900 surface · caret · 10px gap</span><template data-theme-variant="dark" data-theme-op="swap"><span data-theme-text="">grey-200 surface · caret · 10px gap</span></template>, 치수 (가정)`,
        stack: true,
        stage: `
<div class="demo-block">
  <div class="tt-stage">
    <div class="tt-anchor-wrap">
      <div class="tt-anchor">최대 한도</div>
      <div class="tt top">월 1,000만원까지 한 번에</div>
    </div>
  </div>
  <div class="tt-stage" style="margin-top: 12px;">
    <div class="tt-anchor-wrap">
      <div class="tt-anchor">자동이체</div>
      <div class="tt top brand">매월 25일에 빠져나가요</div>
    </div>
  </div>
</div>
`,
      }),
      cell({
        name: "progress-bar",
        label:
          "Progress Bar, 8px track · brand / success / danger fill · 320ms ease, 치수 (가정)",
        stack: true,
        stage: `
<div class="demo-block">
  <div class="pb-row">
    <div class="pb-head"><div class="pb-lab">목표 달성률</div><div class="pb-val">68%</div></div>
    <div class="pb-track l"><div class="pb-fill brand-grad" style="width: 68%;"></div></div>
  </div>
  <div class="pb-row">
    <div class="pb-head"><div class="pb-lab">업로드 중</div><div class="pb-val">12 / 30 MB</div></div>
    <div class="pb-track"><div class="pb-fill" style="width: 40%;"></div></div>
  </div>
  <div class="pb-row">
    <div class="pb-head"><div class="pb-lab">한도 사용</div><div class="pb-val">92%</div></div>
    <div class="pb-track"><div class="pb-fill danger" style="width: 92%;"></div></div>
  </div>
  <div class="pb-row">
    <div class="pb-head"><div class="pb-lab">백업 완료</div><div class="pb-val">100%</div></div>
    <div class="pb-track s"><div class="pb-fill success" style="width: 100%;"></div></div>
  </div>
</div>
`,
      }),
      cell({
        name: "progress-bar-row",
        label: "PROGRESS-BAR",
        stack: true,
        stage: `
<div class="pb-row">
  <div class="pb-head"><div class="pb-lab">목표 달성률</div><div class="pb-val num-tab">60%</div></div>
  <div class="pb-track l"><div class="pb-fill" style="width: 60%;"></div></div>
</div>
`,
      }),
      cell({
        name: "progress-stepper",
        label: "PROGRESS-STEPPER",
        stack: true,
        stage: `
<div class="pstep">
  <span class="node done">✓</span>
  <span class="seg done"></span>
  <span class="node active">2</span>
  <span class="seg"></span>
  <span class="node">3</span>
  <span class="seg"></span>
  <span class="node">4</span>
</div>
`,
      }),
      cell({
        name: "loader",
        label: "LOADER",
        stack: true,
        stage: `
<div class="loader-3"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
`,
      }),
    ]),
  ],
})
