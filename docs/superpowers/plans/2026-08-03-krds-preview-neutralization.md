# 묶음 E — KRDS 프리뷰 중립화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KRDS 프리뷰가 실재 공공 서비스에 대해 무출처로 단정하고 신원 정보를 입력받는 상태를 끝내되, KRDS 를 KRDS 로 보이게 하는 시연은 그대로 남긴다.

**Architecture:** 정부 식별 신호(seal·공식 배너·워드마크)는 **유지하고 캡션으로 라벨링**한다. 허구 표시 데이터는 `.catalog-dummy` 캡션으로 덮고, 검증 가능한 사실 주장만 목업 자신의 화면을 가리키는 문구로 바꾼다. 09번 목업 폼은 비인터랙티브로 만든다. 색인은 `robots.txt` 에서 차단하고, 재발은 검증기 warn 룰로 막는다.

**Tech Stack:** 정적 HTML(빌드 없음) · TypeScript(`src/lib/`) · Vitest · pnpm

## Global Constraints

- **패키지 매니저는 pnpm.** npm 금지.
- **커밋은 DCO 서명**: `git commit -s`.
- **프리뷰 HTML 에 prettier 를 절대 돌리지 않는다.** 마크업이 ~175 KB 로 펼쳐져 `BLOCK_BYTES`(131,072)를 넘는다. `format:check` 범위는 `**/*.{ts,tsx,js,jsx}` 뿐이라 CI 는 안 건드리지만 로컬 `pnpm format` 은 위험하다. `src/lib/**` 의 `.ts` 파일에는 **반드시** `pnpm exec prettier --write` 를 돌린다.
- **모든 프리뷰 편집은 `light.html` 과 `dark.html` 양쪽에 적용한다.** `dark` = `light` + 10행. **단 하나의 예외**: `모든 정부 누리집에 적용` 은 light 전용(dark hero lede 는 다른 문장)이다.
- **프리뷰 파일은 UTF-8 / LF 로 읽고 쓴다.** Python 편집 시 `io.open(p, encoding="utf-8", newline="")`.
- **Windows 로컬에서 `pnpm format:check` 가 짚는 14개 `.claude/skills/docs-crawler/` 파일은 CRLF 오탐이다.** 재포맷하지 말 것. 이번 변경 파일이 그 목록에 있으면 그건 진짜 문제다.
- **`.table-scroll` 안의 표에는 `<caption>` 을 쓰지 않는다.** caption 박스 폭은 스크롤러가 아니라 표를 따라서, 375px 에서 문장이 잘린다. 스크롤 래퍼 **앞**에 `<p class="catalog-dummy">` 를 둔다.
- **캡션은 관찰문이다.** `…는 레이아웃 시연용 더미 데이터입니다` 꼴. 브랜드가 무엇을 *한다*고 단언하는 규범문을 쓰지 않는다.
- **PowerShell here-string(`@'…'@`)을 Bash 에서 쓰지 않는다.** 여러 줄 문자열은 `<<'EOF'` heredoc.

---

## File Structure

| 파일 | 책임 | 태스크 |
|---|---|---|
| `public/preview/krds/light.html` · `dark.html` | 캡션 4곳 추가, 사실 주장 문구 교체, 폼 비인터랙티브화, 푸터 3슬롯 치환 | 1–5 |
| `src/lib/seo-feed.ts` | `robots.txt` 에 `Disallow: /preview/` | 6 |
| `src/lib/seo-feed.test.ts` | 위 계약 고정 | 6 |
| `src/lib/preview-validator.ts` | `government-identifier-unlabelled` warn 룰 | 7 |
| `src/lib/preview-validator.test.ts` | 위 룰 단위 테스트 | 7 |

태스크 1–5 는 전부 같은 두 파일을 만지므로 **순서대로** 실행한다(줄 번호가 앞 태스크의 삽입으로 밀린다). 각 태스크는 줄 번호가 아니라 **문자열 앵커**로 편집해 이 문제를 피한다.

---

## Task 1: 정부 식별 신호에 캡션 달기

D 스펙이 E 로 넘긴 판단이다. 신호는 유지하고, D-1 이 `gov-strip` 아래 붙인 것과 같은 기제를 masthead 에도 붙인다.

**Files:**
- Modify: `public/preview/krds/light.html` (`header-brand-block` 닫는 `</div>` 뒤, 현재 `:779`)
- Modify: `public/preview/krds/dark.html` (같은 앵커, 현재 `:789`)

**Interfaces:**
- Consumes: `.catalog-dummy` 클래스 (이미 `public/preview/_runtime/tokens.css` 에 존재)
- Produces: masthead 캡션 리터럴 `정부상징과 워드마크는` — Task 7 의 룰 테스트가 이 페이지를 "캡션 있음"으로 판정하는 근거

- [ ] **Step 1: 앵커가 두 파일에 각 1개인지 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
for t in light dark; do
  printf "%s: %s\n" "$t" "$(grep -c '<span class="slogan">국민이 주인인 나라' public/preview/krds/$t.html)"
done
```

Expected: `light: 1` / `dark: 1`

- [ ] **Step 2: 캡션 삽입**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io
CAP = ('      <p class="catalog-dummy">정부상징과 워드마크는 KRDS 식별 컴포넌트의 '
       '표시 예시이며, 이 화면은 공식 정부 누리집이 아닙니다.</p>\n')
ANCHOR = '        <span class="slogan">국민이 주인인 나라<br>믿을 수 있는 정부</span>\n      </div>\n'
for t in ("light", "dark"):
    p = f"public/preview/krds/{t}.html"
    s = io.open(p, encoding="utf-8", newline="").read()
    assert s.count(ANCHOR) == 1, f"{p}: anchor x{s.count(ANCHOR)}"
    assert "정부상징과 워드마크는" not in s, f"{p}: already inserted"
    io.open(p, "w", encoding="utf-8", newline="").write(s.replace(ANCHOR, ANCHOR + CAP, 1))
    print(f"  {t}: inserted")
PY
```

Expected: `light: inserted` / `dark: inserted`

- [ ] **Step 3: 삽입 위치가 `.header-brand-block` 밖·`<nav>` 앞인지 눈으로 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 grep -n -A2 'class="slogan"' public/preview/krds/light.html | head -6
```

Expected: `</div>` 다음 줄에 `<p class="catalog-dummy">정부상징과 워드마크는 …`, 그 다음이 `<nav class="primary-nav"`

- [ ] **Step 4: 검증기 통과 확인**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm validate:previews --slug krds
```

Expected: 마지막 줄 `PASSED: no blocking preview issues`

- [ ] **Step 5: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add public/preview/krds
git commit -s -m "feat(preview): krds masthead 의 정부 식별 신호에 캡션을 단다

D 스펙이 E 로 넘긴 판단이다(2026-08-03-preview-disclosure-banner-design.md:37).
정부상징 seal·대한민국정부 워드마크·슬로건은 KRDS 를 KRDS 로 보이게 하는 핵심
시연이라 유지하고, D-1 이 gov-strip 아래 붙인 것과 같은 기제로 라벨링한다.

services/krds.md:236 이 seal 을, :331 이 footer 를 컴포넌트로 문서화하므로
지우면 md 가 규정한 시연이 사라진다."
```

---

## Task 2: 허구 표시 데이터에 캡션 3곳

`인기검색어` · 민원 처리 현황 표(신청번호·탭 카운트) · 서비스 타일 그리드. 확정 결정("데이터는 제거하지 않고 명시로 처리")에 따라 문구를 바꾸지 않고 캡션만 단다.

**Files:**
- Modify: `public/preview/krds/light.html` · `dark.html` (3곳 × 2파일)

**Interfaces:**
- Consumes: Task 1 이 삽입한 캡션과 같은 `.catalog-dummy` 클래스
- Produces: 없음

- [ ] **Step 1: 세 앵커가 각 파일에 1개씩인지 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
for t in light dark; do
  for a in '인기검색어 · 주민등록증 재발급' '<div class="table-scroll">' '<div class="tiles">'; do
    printf "  %-5s %-34s %s\n" "$t" "$a" "$(grep -cF "$a" public/preview/krds/$t.html)"
  done
done
```

Expected: 6줄 전부 `1`

- [ ] **Step 2: 캡션 3곳 삽입**

표는 `.table-scroll`(가로 스크롤) 안에 있으므로 `<caption>` 이 아니라 래퍼 **앞**의 `<p>` 다 — Global Constraints 참조.

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, re

SITES = [
    # (앵커, 위치, 들여쓰기, 문구)
    ('          <p class="type-body-xs" style="margin-top:12px;">인기검색어',
     "before", 10,
     "검색어 목록은 레이아웃 시연용 더미 데이터이며, 실제 검색 순위가 아닙니다."),
    ('        <div class="table-scroll">',
     "before", 8,
     "표의 신청번호·민원명·처리 상태와 탭의 건수는 모두 레이아웃 시연용 더미 "
     "데이터이며, 실제 민원 접수 내역이 아닙니다."),
    ('      <div class="tiles">',
     "before", 6,
     "타일의 서비스명과 설명은 레이아웃 시연용 더미 데이터이며, 실제 제공 범위에 "
     "대한 안내가 아닙니다."),
]

for t in ("light", "dark"):
    p = f"public/preview/krds/{t}.html"
    s = io.open(p, encoding="utf-8", newline="").read()
    for anchor, _pos, indent, text in SITES:
        hits = s.count(anchor)
        assert hits == 1, f"{p}: anchor {anchor[:40]!r} x{hits}"
        node = f'{" " * indent}<p class="catalog-dummy">{text}</p>\n'
        assert node not in s, f"{p}: already inserted {text[:20]!r}"
        s = s.replace(anchor, node + anchor, 1)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(f"  {t}: 3 captions")
PY
```

Expected: `light: 3 captions` / `dark: 3 captions`

- [ ] **Step 3: 캡션 개수가 두 파일에서 같은지 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
for t in light dark; do
  printf "  %s: catalog-dummy %s개\n" "$t" "$(grep -c 'catalog-dummy' public/preview/krds/$t.html)"
done
```

Expected: 양쪽 `5개` (기존 gov-strip 1 + Task 1 의 1 + 이번 3)

- [ ] **Step 4: 검증기 통과**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm validate:previews --slug krds
```

Expected: `PASSED: no blocking preview issues`

- [ ] **Step 5: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add public/preview/krds
git commit -s -m "feat(preview): krds 허구 표시 데이터 3곳에 캡션을 단다

인기검색어(순위 주장) · 민원 처리 현황 표(신청번호 2026-004821 외 2건 +
탭 건수 128/12/116) · 서비스 타일 4종.

D-1 배너는 이 페이지를 덮지 못한다 — 배너의 더미 절이 열거하는
상품·가격·평점·거래·채용 은 이 페이지에 각 1건뿐이고 그 1건이 배너 자신이다.
배너는 보간 없는 단일 리터럴로 고정돼 있으므로 캡션을 늘리는 것이 확정 결정
(데이터는 제거하지 않고 명시로 처리)에 부합하는 방향이다.

표는 .table-scroll 안이라 <caption> 이 아니라 래퍼 앞의 <p> 다 — caption 박스
폭은 스크롤러가 아니라 표를 따라서 375px 에서 문장이 잘린다(PR #210 실측)."
```

---

## Task 3: 검증 가능한 사실 주장 교체

md 가 뒷받침하지 않는 정책·기간·일정 주장을 이 목업 자신의 화면을 가리키는 문구로 바꾼다. `수수료는 발급 방법에 따라 다릅니다` 류를 쓰지 않는다 — 그 자체가 (a) 수수료가 존재한다 (b) 방법에 따라 다르다 를 단언하는 클레임이다.

**Files:**
- Modify: `public/preview/krds/light.html` · `dark.html`

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: 교체 전 잔여 확인 기준값 기록**

```bash
cd "$(git rev-parse --show-toplevel)"
for k in KWCAG '민원 24' '5월 31일' '90일간' '온라인 발급은 무료' '모든 정부 누리집'; do
  printf "  %-18s light=%s dark=%s\n" "$k" \
    "$(grep -cF "$k" public/preview/krds/light.html)" \
    "$(grep -cF "$k" public/preview/krds/dark.html)"
done
```

Expected: `모든 정부 누리집` 만 `light=1 dark=0`, 나머지 5개는 `light=1 dark=1`

- [ ] **Step 2: 양쪽 파일 공통 교체 8건**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, sys

PAIRS = [
  # 1) md:469 가 명시 철회한 KWCAG 주장
  ("접근성 진단 가이드 개정판 공개 — KWCAG 2.2 반영",
   "접근성 점검 체크리스트 개정판 공개"),
  # 2) 정부24 의 전신 브랜드명 — 띄어쓰기라 정부24 grep 을 빠져나간다
  ("민원 24 모바일 인증 흐름이 간소화됩니다",
   "민원 신청 모바일 인증 흐름이 간소화됩니다"),
  # 3) 요일 오류 수정 + :1202 공지와 날짜 일치. 긴급성(구체 시간대)은 보존한다.
  ("5월 31일(토) 02:00–06:00 민원 신청 서비스가 일시 중단됩니다.",
   "5월 16일(토) 02:00–06:00 민원 신청 서비스가 일시 중단됩니다."),
  # 4) 등본/초본 정의 → 질문과 답을 목업 자신의 흐름으로. 답만 바꾸면 동어반복이 된다.
  ("<summary>등본과 초본은 어떻게 다른가요?",
   "<summary>신청한 서류는 어디에서 확인하나요?"),
  ("등본은 세대 구성원 전체를, 초본은 개인의 주소 변동 이력을 표시합니다. 제출처 요구에 맞춰 선택합니다.",
   "신청이 완료되면 마이페이지 신청 내역에 표시됩니다. 목록에서 신청번호를 선택하면 처리 상태와 발급 문서를 확인할 수 있습니다."),
  # 5) 수수료 정책 → 존재 자체를 단언하지 않고 발급 옵션 단계를 가리킨다
  ("정부24 온라인 발급은 무료입니다. 무인발급기·창구 발급은 건당 수수료가 부과될 수 있습니다.",
   "수수료가 있는 서류는 발급 옵션 단계에서 금액이 표시됩니다. 표시된 금액을 확인한 뒤 신청을 진행하세요."),
  # 6) 보관 기간 주장 → 제목까지 함께. 제목만 두면 "안내"한다고 써 놓고 안내를 안 한다.
  ("<p class=\"i-title\">전자문서 지갑 안내</p>",
   "<p class=\"i-title\">발급 문서 보관 안내</p>"),
  ("발급된 문서는 전자문서 지갑에 90일간 보관되며, 기관 제출 시 진본 확인이 가능합니다.",
   "발급한 문서는 마이페이지 신청 내역에 보관되며, 목록에서 다시 내려받을 수 있습니다. 보관 기간은 신청 완료 화면에 표시됩니다."),
]

for t in ("light", "dark"):
    p = f"public/preview/krds/{t}.html"
    s = io.open(p, encoding="utf-8", newline="").read()
    for old, new in PAIRS:
        n = s.count(old)
        if n != 1:
            sys.exit(f"{p}: {old[:44]!r} matched {n} times, expected 1")
        s = s.replace(old, new, 1)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(f"  {t}: {len(PAIRS)} replacements")
PY
```

Expected: `light: 8 replacements` / `dark: 8 replacements`

- [ ] **Step 3: light 전용 교체 1건**

`모든 정부 누리집에 적용` 은 md:30 이 `[src:2]` 로 규정한 2단 구조(표준 스타일=중앙행정기관 강제 / 적응 스타일=공공기관 허용)를 뭉갠다. dark 의 hero lede 는 아예 다른 문장이라 대상이 없다.

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, sys
p = "public/preview/krds/light.html"
OLD = "신뢰·안정·접근성을 핵심 정서로 모든 정부 누리집에 적용됩니다."
NEW = "신뢰·안정·접근성을 핵심 정서로 삼습니다."
s = io.open(p, encoding="utf-8", newline="").read()
n = s.count(OLD)
if n != 1:
    sys.exit(f"{p}: matched {n}, expected 1")
io.open(p, "w", encoding="utf-8", newline="").write(s.replace(OLD, NEW, 1))
print("  light hero lede: 1 replacement")
PY
```

Expected: `light hero lede: 1 replacement`

- [ ] **Step 4: 잔여 0건 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
fail=0
for k in KWCAG '민원 24' '5월 31일' '90일간' '온라인 발급은 무료' '전자문서 지갑' '모든 정부 누리집'; do
  n=$(( $(grep -cF "$k" public/preview/krds/light.html) + $(grep -cF "$k" public/preview/krds/dark.html) ))
  printf "  %-18s %s\n" "$k" "$n"
  [ "$n" != "0" ] && fail=1
done
echo "잔여 total: $fail (0 이어야 함)"
```

Expected: 모든 줄 `0`, 마지막 줄 `잔여 total: 0`

- [ ] **Step 5: 검증기 + 반응형 통과**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm validate:previews --slug krds --verbose 2>&1 | tail -5
```

Expected: `PASSED: no blocking preview issues`

- [ ] **Step 6: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add public/preview/krds
git commit -s -m "fix(preview): krds 의 무출처 사실 주장을 목업 자신의 화면을 가리키게 바꾼다

services/krds.md 에 근거가 0건인 정책·기간·일정 주장 9건.

가장 나쁜 건 KWCAG 다 — md:469 가 '종전 판본은 이를 KWCAG 로 적었으나 공식
문서는 KWCAG 를 언급하지 않는다' 로 명시 철회했는데, 프리뷰가 되살렸을 뿐
아니라 버전(2.2)까지 붙여 정부가 그 기준으로 개정판을 공개했다고 공표하고
있었다. md 에서 정정된 주장이 프리뷰 산문에 생존하는 알려진 패턴이다.

'민원 24' 는 정부24 의 전신 브랜드명인데 띄어쓰기 때문에 grep 을 빠져나갔다.

정기 점검 날짜는 지우지 않고 고친다 — 2026-05-31 은 일요일이고(5월 토요일은
2·9·16·23·30) 같은 점검을 다른 공지가 '셋째 주 토요일'로 적어 서로 어긋났다.
CRITICAL ALERT 는 긴급성 시연이 존재 이유라 구체 시간대를 빼면 컴포넌트가
목적의 반대를 시연하게 된다.

수수료·보관기간은 '…에 따라 다릅니다' 로 바꾸지 않았다 — 그것도 (a) 존재한다
(b) 다르다 를 단언하는 클레임이다. 이 목업의 발급 옵션 단계와 마이페이지를
가리키게 해 정책이 바뀌어도 참거짓이 흔들리지 않게 한다.

'모든 정부 누리집에 적용' 은 md:30 이 [src:2] 로 규정한 2단 구조(표준=중앙
행정기관 강제 / 적응=공공기관 허용)를 뭉갠다. dark hero lede 는 다른 문장이라
light 전용 수정이다."
```

---

## Task 4: 09번 목업 폼 비인터랙티브화

PII 축을 실제로 닫는 유일한 조치다. 입력 상태 시연은 02번 섹션(`light:870-923`)이 전담하고 09번 캡션은 스스로 레이아웃 시연이라 밝히므로 **데모 비용이 0** 이다.

**Files:**
- Modify: `public/preview/krds/light.html` · `dark.html` (`<form class="mock-form">` 블록)

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: 현재 폼 상태 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 grep -n 'mock-form\|id="m-name"\|id="m-rrn"\|id="m-purpose"\|type="submit"' public/preview/krds/light.html
```

Expected: `mock-form` 1건, `m-name`/`m-rrn`/`m-purpose` 각 2건(label 의 `for=` + input), `type="submit"` 1건

- [ ] **Step 2: 필드 교체 + 비인터랙티브화**

`m-rrn` 은 라벨만 바꾸지 않고 필드를 교체한다. 라벨을 `생년월일` 로 바꾸면 `placeholder="900101"` 이 "형식 예시"에서 **"그럴듯한 실제 생년월일"** 로 읽혀 새 문제가 생기고, 위 필드가 `신청자 성명` 이라 성명+생년월일 조합이 남는다.

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, sys

PAIRS = [
  ('<form class="mock-form" onsubmit="return false;">',
   '<form class="mock-form" onsubmit="return false;" autocomplete="off">'),
  ('<input id="m-name" type="text" placeholder="홍길동">',
   '<input id="m-name" type="text" placeholder="홍길동" readonly>'),
  ('<label for="m-rrn">주민등록번호 앞 6자리<span class="req" aria-hidden="true">*</span></label>',
   '<label for="m-copies">발급 부수<span class="req" aria-hidden="true">*</span></label>'),
  ('<input id="m-rrn" type="text" inputmode="numeric" placeholder="900101">',
   '<input id="m-copies" type="text" inputmode="numeric" placeholder="1" readonly>'),
  ('<button class="btn btn-m btn-primary" type="submit">신청</button>',
   '<button class="btn btn-m btn-primary" type="button">신청</button>'),
  # 오류 알림의 지시 대상이 사라지므로 본인 인증 서사에 붙인다.
  # 어미도 이웃(:1066 '완료하세요')에 맞춘다.
  ('입력한 주민등록번호가 일치하지 않습니다. 다시 확인해주세요.',
   '본인 인증 정보가 일치하지 않습니다. 다시 확인하세요.'),
]

for t in ("light", "dark"):
    p = f"public/preview/krds/{t}.html"
    s = io.open(p, encoding="utf-8", newline="").read()
    for old, new in PAIRS:
        n = s.count(old)
        if n != 1:
            sys.exit(f"{p}: {old[:50]!r} matched {n}, expected 1")
        s = s.replace(old, new, 1)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(f"  {t}: {len(PAIRS)} edits")
PY
```

Expected: `light: 6 edits` / `dark: 6 edits`

**`<select id="m-purpose">` 는 손대지 않는다.** PII 를 받지 않고(발급 용도 4선택) 선택해도 결과가 없어 이 태스크의 목적과 무관하다. `tabindex="-1"` 로 탭 순서에서 빼면 **접근성을 핵심 정서로 내세우는 디자인 시스템**(`services/krds.md:26`)의 프리뷰에서 키보드 사용자가 선택 컴포넌트에 닿지 못하게 되고, `disabled` 는 회색 스타일이 붙어 시각 시연이 달라진다.

- [ ] **Step 3: PII 잔여 0건 + 폼 속성 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
for t in light dark; do
  printf "  %-5s m-rrn=%s 주민등록번호=%s readonly=%s autocomplete=%s type-submit=%s\n" "$t" \
    "$(grep -c 'm-rrn' public/preview/krds/$t.html)" \
    "$(grep -c '주민등록번호' public/preview/krds/$t.html)" \
    "$(grep -c 'readonly' public/preview/krds/$t.html)" \
    "$(grep -c 'autocomplete="off"' public/preview/krds/$t.html)" \
    "$(grep -c 'type="submit"' public/preview/krds/$t.html)"
done
```

Expected 각 줄: `m-rrn=0 주민등록번호=1 readonly=2 autocomplete=1 type-submit=1`

`주민등록번호=1` 은 남겨두기로 한 `fc-rrn`(disabled 상태 시연) 라벨이다. `type-submit=1` 은 히어로의 검색 폼(`:815`)으로 09번 목업과 무관하다.

- [ ] **Step 4: 검증기 통과**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm validate:previews --slug krds
```

Expected: `PASSED: no blocking preview issues`

- [ ] **Step 5: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add public/preview/krds
git commit -s -m "fix(preview): krds 09번 목업 폼을 비인터랙티브로 만든다

PII 축을 실제로 닫는 유일한 조치다. 폼은 이미 아무것도 처리하지 않지만
(onsubmit=return false, action 없음, fetch 0건) 남는 문제는 형태다 —
타이핑 가능한 신원 필드 + 제출 버튼이 색인되는 정부 화면 목업 위에 있다.

m-rrn 은 라벨을 바꾸지 않고 필드를 교체했다. '생년월일 6자리'로 바꾸면
placeholder=900101 이 형식 예시에서 '그럴듯한 실제 생년월일'로 읽혀 새 문제가
생기고, 위 필드가 신청자 성명이라 성명+생년월일 조합이 남는다. 발급 부수는
inputmode=numeric 데모를 유지하면서 개인정보가 0 이고 등본 발급 흐름의
실제 필드다.

데모 비용은 0 이다 — 입력 상태 시연(default/focus/error/disabled)은 02번
섹션이 전담하고, 09번 캡션은 스스로 '컨테이너 1248px · 컴포넌트 패딩 24px ·
섹션 리듬 64px'라고 레이아웃 시연임을 밝힌다.

fc-rrn(disabled)은 손대지 않았다 — 입력이 불가능해 어떤 요건도 충족되지 않고,
라벨은 헬퍼 '본인 인증 후 활성화됩니다'와 함께 상태 시연 문맥을 이룬다."
```

---

## Task 5: 푸터 3슬롯 치환

삭제 0개다. md:331 이 `1588 고객센터 번호·주소·저작권 표기` 를 footer 컴포넌트로 문서화하고, md:486 이 *"출처 표기가 필요하면 footer attribution 에만 둔다"* 고 지정한다.

**Files:**
- Modify: `public/preview/krds/light.html` · `dark.html` (footer 블록)

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: 네 문자열이 각 파일에 1개씩인지 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
for t in light dark; do
  for a in '운영 한국지능정보사회진흥원' '세종대로 209' '1588-2188' 'All rights reserved'; do
    printf "  %-5s %-26s %s\n" "$t" "$a" "$(grep -cF "$a" public/preview/krds/$t.html)"
  done
done
```

Expected: 8줄 전부 `1`

- [ ] **Step 2: 치환**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, sys

PAIRS = [
  # 진흥원은 md 근거 0건. 행정안전부는 md:22 가 [src:2] 로 뒷받침하므로 남긴다.
  ("발행 행정안전부 · 운영 한국지능정보사회진흥원", "발행 행정안전부"),
  # '발행 행정안전부'를 남긴 채 다른 실주소를 넣으면 실존 부처에 허위 소재지를
  # 붙이는 것이 되므로, 서식상 즉시 예시로 읽히는 패턴을 쓴다.
  ("서울특별시 종로구 세종대로 209 정부서울청사", "○○시 ○○구 ○○대로 000"),
  # md:331 의 '1588' 접두를 보존하고 자릿수도 9자로 같아 .hotline 32px/800 스펙이
  # 그대로 유지된다.
  ("1588-2188", "1588-0000"),
  # 삭제가 아니라 재작성. 결함은 저작권 표기의 존재가 아니라 'All rights reserved'
  # 라는 적극적 권리유보를 부처 목소리로 넣은 것이다.
  ("© Ministry of the Interior and Safety, Republic of Korea. All rights reserved.",
   "KRDS 는 행정안전부가 발행합니다. 이 화면은 ko/design.md 카탈로그가 공개 자료를 "
   "근거로 만든 비공식 재현입니다."),
]

for t in ("light", "dark"):
    p = f"public/preview/krds/{t}.html"
    s = io.open(p, encoding="utf-8", newline="").read()
    for old, new in PAIRS:
        n = s.count(old)
        if n != 1:
            sys.exit(f"{p}: {old[:44]!r} matched {n}, expected 1")
        s = s.replace(old, new, 1)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(f"  {t}: {len(PAIRS)} replacements")
PY
```

Expected: `light: 4 replacements` / `dark: 4 replacements`

- [ ] **Step 3: 잔여 0건 + 유지 대상 생존 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
echo "제거 대상 (0 이어야):"
for k in '한국지능정보사회진흥원' '세종대로 209' '1588-2188' 'All rights reserved' '©'; do
  printf "  %-26s %s\n" "$k" "$(( $(grep -cF "$k" public/preview/krds/light.html) + $(grep -cF "$k" public/preview/krds/dark.html) ))"
done
echo "유지 대상 (2 여야):"
for k in '발행 행정안전부' '1588-' '평일 09:00'; do
  printf "  %-26s %s\n" "$k" "$(( $(grep -cF "$k" public/preview/krds/light.html) + $(grep -cF "$k" public/preview/krds/dark.html) ))"
done
```

Expected: 제거 대상 5줄 전부 `0`, 유지 대상 3줄 전부 `2`

- [ ] **Step 4: 푸터를 976px 에서 눈으로 확인**

`.hotline` 이 32px/800 스펙이므로 번호 자릿수가 바뀌면 레이아웃이 움직인다. 자릿수는 같지만 실제로 확인한다.

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm validate:previews --slug krds --verbose 2>&1 | tail -6
```

Expected: `PASSED: no blocking preview issues`, 반응형 warn 개수가 이 태스크 전과 동일

- [ ] **Step 5: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add public/preview/krds
git commit -s -m "fix(preview): krds 푸터의 실연락처와 부처 명의 저작권 주장을 치환한다

삭제 0개다. services/krds.md:331 이 footer 를 '1588 고객센터 번호·주소·저작권
표기'로 문서화하고 :486 이 '출처 표기가 필요하면 footer attribution 에만 둔다'
고 지정하므로, 세 슬롯 모두 지우면 md 가 규정한 컴포넌트를 시연하지 못한다.

© 줄의 결함은 저작권 표기의 존재가 아니라 'All rights reserved' 라는 적극적
권리유보를 부처 목소리로 넣은 것이다 — 같은 파일이 CC BY 로 배포되고
(LICENSE-CONTENT), 상단 배너가 '공식 배포본이 아닌 비공식 재현'이라 말하는데
하단이 부처 명의로 권리를 주장해 서로 모순이었다. 또 NOTICE 가 적은 KOGL
제1유형의 유일한 조건이 출처표시인데, 파일 안 유일한 귀속 줄을 지우면 그 조건을
만족시킬 표면이 산출물에 남지 않는다(NOTICE 는 스크린샷·iframe·단일 파일
다운로드 어디에도 따라가지 않는다).

주소를 다른 실주소로 바꾸지 않은 이유: '발행 행정안전부'를 남긴 채 허위
소재지를 붙이면 아무것도 없느니만 못하다.

bezier(© Channel Corp. + Apache-2.0 + 저장소 링크)는 올바른 귀속의 모범이므로,
묶음 H 가 그것까지 지우지 않도록 여기서 '재작성'을 패턴으로 세운다."
```

---

## Task 6: `/preview/` 색인 차단

원래 묶음 F 소관이나, 정부상징 + 공식 배너를 가진 이 파일에서는 한 줄이 문자열 편집 전부보다 노출을 크게 줄인다.

**Files:**
- Modify: `src/lib/seo-feed.ts` (`robots.txt` 생성부, 현재 `:178` 근처)
- Modify: `src/lib/seo-feed.test.ts`

**Interfaces:**
- Consumes: `buildRobotsTxt(siteUrl: string): string` — `src/lib/seo-feed.ts:173` 의 기존 export (확인 완료)
- Produces: `robots.txt` 본문에 `Disallow: /preview/` 줄

- [ ] **Step 1: 현재 생성부와 기존 테스트 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 sed -n '173,186p' src/lib/seo-feed.ts
grep -n 'buildRobotsTxt' src/lib/seo-feed.test.ts | head -5
```

Expected: `export function buildRobotsTxt(siteUrl: string): string {` 로 시작하고 본문에 `"Disallow:",` 가 보인다. 테스트 파일에 `buildRobotsTxt` 가 이미 import 돼 있으면 Step 2 에서 import 를 새로 추가하지 않는다.

- [ ] **Step 2: 실패하는 테스트 작성**

`src/lib/seo-feed.test.ts` 끝에 추가한다. Step 1 에서 `buildRobotsTxt` import 가 없었다면 파일 상단 import 에 함께 넣는다.

```typescript
describe("robots.txt", () => {
  it("keeps preview HTML out of the index", () => {
    const txt = buildRobotsTxt("https://getdesign.kr")
    // 프리뷰는 상세페이지 iframe 으로만 소비된다. 단독 색인되면 카탈로그
    // 프리뷰가 원본 서비스의 검색 결과에 섞이고, krds 처럼 정부 식별 신호를
    // 담은 페이지에서는 그 노출이 문자열 수정 전부보다 크다.
    expect(txt).toContain("Disallow: /preview/")
  })

  it("still allows the rest of the site", () => {
    const txt = buildRobotsTxt("https://getdesign.kr")
    expect(txt).toContain("Sitemap: https://getdesign.kr/sitemap.xml")
    expect(txt).not.toContain("Disallow: /\n")
  })
})
```

- [ ] **Step 3: 테스트가 실패하는지 확인**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm vitest run src/lib/seo-feed.test.ts 2>&1 | grep -E '× |Tests '
```

Expected: `keeps preview HTML out of the index` 가 실패, `1 failed`

- [ ] **Step 4: 구현**

```bash
cd "$(git rev-parse --show-toplevel)"
PYTHONIOENCODING=utf-8 python - <<'PY'
import io, sys
p = "src/lib/seo-feed.ts"
s = io.open(p, encoding="utf-8", newline="").read()
OLD = '    "Disallow:",'
NEW = ('    "Disallow:",\n'
       '    // Previews are consumed only through the detail page iframe. Indexed\n'
       '    // standalone they compete with the real services in search results —\n'
       '    // and krds carries the government seal and official-site banner.\n'
       '    "Disallow: /preview/",')
n = s.count(OLD)
if n != 1:
    sys.exit(f"{p}: matched {n}, expected 1")
io.open(p, "w", encoding="utf-8", newline="").write(s.replace(OLD, NEW, 1))
print("  seo-feed.ts updated")
PY
pnpm exec prettier --write src/lib/seo-feed.ts src/lib/seo-feed.test.ts
```

Expected: `seo-feed.ts updated` 후 prettier 가 두 파일을 출력

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm vitest run src/lib/seo-feed.test.ts 2>&1 | grep -E '× |Tests '
```

Expected: `Tests  N passed`, 실패 0

- [ ] **Step 6: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add src/lib/seo-feed.ts src/lib/seo-feed.test.ts
git commit -s -m "feat(seo): /preview/ 를 색인에서 제외한다

robots.txt 가 Disallow 를 빈 값(전체 허용)으로 내보내고 저장소 전체에 noindex 가
0건이라, 프리뷰 HTML 이 단독 색인 대상이었다.

원래 묶음 F 소관이지만 krds 에서는 이 한 줄이 문자열 편집 전부를 합친 것보다
노출을 크게 줄인다 — 정부상징 seal 과 '공식 전자정부 누리집' 배너를 가진
페이지가 검색 결과에 단독으로 뜨는 것이 이 파일의 최대 잔여 리스크였다.

프리뷰는 상세페이지 iframe 으로만 소비되므로 사이트 SEO 손실이 없다."
```

---

## Task 7: 재발 방지 검증기 룰

E 를 이 파일의 일회성 편집으로 끝내면 다음 공공 부문 온보딩(서울시·경기도·건보공단 등)에서 같은 화면이 그대로 재발한다.

**Files:**
- Modify: `src/lib/preview-validator.ts` (`checkFile()` 안, 고지 스트립 룰 직후)
- Modify: `src/lib/preview-validator.test.ts`

**Interfaces:**
- Consumes: 기존 `warn(rule, section, fix)` 헬퍼와 `DISCLAIMER_*` 상수 옆에 새 상수를 둔다
- Produces: 룰 이름 `government-identifier-unlabelled`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/preview-validator.test.ts` 의 disclosure banner describe 블록 **뒤**에 추가한다. `makeHtml`/`makeInput`/`rulesOf` 는 이미 그 파일에 있다.

```typescript
// ── government identifiers ───────────────────────────────────────────────────

describe("validatePreviewPair — government identifiers", () => {
  const GOV_BODY =
    '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
    '<main class="hero"><h1>데모</h1></main>'

  it("warns when a government identifier carries no dummy-data caption", () => {
    const input = makeInput({
      lightRaw: makeHtml({ body: GOV_BODY }),
      darkRaw: makeHtml({ theme: "dark", body: GOV_BODY }),
    })
    expect(rulesOf(input, "warn")).toContain("government-identifier-unlabelled")
  })

  it("accepts a government identifier that is captioned", () => {
    const captioned =
      '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
      '<p class="catalog-dummy">위 문장은 표시 예시입니다.</p>' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: captioned }),
      darkRaw: makeHtml({ theme: "dark", body: captioned }),
    })
    expect(rulesOf(input, "warn")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  it("leaves previews with no government identifier alone", () => {
    expect(rulesOf(makeInput(), "warn")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // warn on purpose: preview-html-author.md does not teach this axis yet, so a
  // block would leave the pipeline unable to satisfy its own Stage 9a2 gate.
  // Promotion goes with the skill wiring, in a separate pre-agreement issue.
  it("is a warn, not a block", () => {
    const input = makeInput({
      lightRaw: makeHtml({ body: GOV_BODY }),
      darkRaw: makeHtml({ theme: "dark", body: GOV_BODY }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm vitest run src/lib/preview-validator.test.ts 2>&1 | grep -E '× |Tests '
```

Expected: `warns when a government identifier carries no dummy-data caption` 실패, `1 failed`

- [ ] **Step 3: 상수 추가**

`src/lib/preview-validator.ts` 의 `DISCLAIMER_DUMMY_DATA` 선언 **바로 뒤**에 붙인다.

```typescript
// A preview may legitimately render a government identifier — KRDS documents the
// seal and the official-site strip as components (services/krds.md:236, :331), and
// removing them would stop the preview demonstrating what it exists to show. What
// it must not do is render one with nothing saying it is a display sample: the
// same file is a standalone, indexable page that a non-government site hosts.
// Kept to a few high-signal literals so this does not fire on ordinary prose.
const GOVERNMENT_IDENTIFIERS = [
  "공식 전자정부 누리집",
  "대한민국정부",
  "정부상징",
]
const DUMMY_CAPTION_CLASS = "catalog-dummy"
```

- [ ] **Step 4: 룰 구현**

`checkFile()` 안, 고지 스트립 블록이 끝나는 `}` 직후·`const scan = scanCss(...)` 앞에 넣는다.

```typescript
  const govIdentifier = GOVERNMENT_IDENTIFIERS.find((term) =>
    html.includes(term)
  )
  if (govIdentifier && !html.includes(DUMMY_CAPTION_CLASS)) {
    issues.push(
      warn(
        "government-identifier-unlabelled",
        name,
        `${name} renders the government identifier "${govIdentifier}" but carries no .${DUMMY_CAPTION_CLASS} caption — a standalone, indexable copy of this file would read as an official government page.`
      )
    )
  }
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
pnpm exec prettier --write src/lib/preview-validator.ts src/lib/preview-validator.test.ts
pnpm vitest run src/lib/preview-validator.test.ts 2>&1 | grep -E '× |Tests '
```

Expected: `Tests  N passed`, 실패 0

- [ ] **Step 6: 룰이 실제로 잡는지 변이 검증**

룰을 제거한 상태로 돌려 테스트가 실패하는 것을 확인한다. 통과하는 테스트가 무엇을 지키는지는 이것으로만 알 수 있다.

```bash
cd "$(git rev-parse --show-toplevel)"
git stash push -q -- src/lib/preview-validator.ts
pnpm vitest run src/lib/preview-validator.test.ts 2>&1 | grep -E '× |Tests '
git stash pop -q
```

Expected: `warns when a government identifier…` 만 실패(`1 failed`), stash pop 후 파일 복원

- [ ] **Step 7: 실제 카탈로그에서 발생 0건 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
pnpm validate:previews --verbose 2>&1 | grep -c 'government-identifier-unlabelled'
pnpm validate:previews 2>&1 | tail -2
```

Expected: 첫 명령 `0`, 둘째 명령 `PASSED: no blocking preview issues`

- [ ] **Step 8: 커밋**

```bash
cd "$(git rev-parse --show-toplevel)"
git add src/lib/preview-validator.ts src/lib/preview-validator.test.ts
git commit -s -m "feat(validate): government-identifier-unlabelled 규칙 (warn)

E 를 krds 두 파일의 일회성 편집으로 끝내면 다음 공공 부문 온보딩(서울시·
경기도·건보공단 등)에서 같은 화면이 그대로 재발한다. D-2 가 남긴 교훈 —
'나중에 계약 테스트로 고정한다가 인벤토리 순회를 뜻하면 미래에 생길 것에는
아무 효력이 없다' — 를 여기서 반복하지 않는다.

정부 식별 신호 자체는 정당하다. services/krds.md:236·331 이 seal 과 공식 배너를
컴포넌트로 문서화하고, 지우면 프리뷰가 시연할 것을 잃는다. 금지하는 건 그것을
'표시 예시'라고 말하는 캡션 없이 렌더하는 것이다 — 같은 파일이 비정부 사이트가
호스팅하는 색인 가능한 단독 페이지이기 때문이다.

severity 는 warn 이다. preview-html-author.md 가 이 축을 아직 모르므로 block 을
먼저 넣으면 파이프라인이 자기 Stage 9a2 게이트를 만족하지 못한다(D-1 선례).
승격은 스킬 배선과 함께 별도 사전 합의 이슈로 간다.

룰을 제거한 상태로 돌려 테스트가 정확히 실패하는 것까지 확인했다."
```

---

## Task 8: 전체 게이트 + 반응형 실측 + PR

**Files:**
- 없음 (검증만)

**Interfaces:**
- Consumes: Task 1–7 의 결과 전부
- Produces: PR

- [ ] **Step 1: 전체 게이트**

```bash
cd "$(git rev-parse --show-toplevel)"
pnpm typecheck && echo "typecheck ok"
pnpm lint && echo "lint ok"
pnpm exec prettier --check src/lib/*.ts
pnpm test 2>&1 | grep -E 'Test Files|Tests '
pnpm validate:catalog 2>&1 | tail -1
pnpm validate:previews 2>&1 | tail -1
pnpm tokens:check 2>&1 | tail -1
pnpm audit:oklch 2>&1 | tail -1
pnpm build >/dev/null 2>&1 && echo "build ok"
```

Expected: `typecheck ok` · `lint ok` · `All matched files use Prettier code style!` · 테스트 전부 통과 · `PASSED` ×2 · `in sync` · `0 token(s) mismatched` · `build ok`

`pnpm format:check` 는 `.claude/skills/docs-crawler/` 14개를 짚지만 CRLF 오탐이므로 무시한다. 이번 변경 파일이 그 목록에 있으면 진짜 문제다.

- [ ] **Step 2: 반응형 실측 (375 / 768 / 976 / 1440)**

브라우저 페인 스크린샷은 이 저장소에서 막히므로 iframe 하네스로 계측한다.

```bash
cd "$(git rev-parse --show-toplevel)"
```

`preview_start` 로 `Static Public Preview`(3010) 를 띄우고, `javascript_tool` 로 다음을 실행한다:

```javascript
(async () => {
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;left:-99999px;top:0;border:0;height:1200px';
  document.body.appendChild(f);
  const out = [];
  for (const t of ['light','dark']) for (const w of [375,768,976,1440]) {
    f.style.width = w + 'px';
    await new Promise(r => { f.onload = () => r(); f.src = `/preview/krds/${t}.html?v=e`; });
    await new Promise(r => setTimeout(r, 180));
    const d = f.contentDocument;
    const ovf = d.documentElement.scrollWidth - w;
    const bad = [...d.querySelectorAll('.catalog-dummy, .catalog-disclaimer')].filter(el => {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) return true;
      let p = el.parentElement, clip = null;
      while (p) { const cs = getComputedStyle(p); if (cs.overflowX !== 'visible') { clip = p; break; } p = p.parentElement; }
      const lim = clip ? clip.getBoundingClientRect().right : w;
      return r.right > lim + 1;
    });
    out.push({k: `${t}@${w}`, ovf, caps: d.querySelectorAll('.catalog-dummy').length, bad: bad.length});
  }
  f.remove();
  return { failures: out.filter(o => o.ovf > 0 || o.bad), all: out };
})()
```

Expected: `failures: []`, `caps` 가 8조합 전부 `5`

- [ ] **Step 3: 인벤토리 잔여 전수 확인**

```bash
cd "$(git rev-parse --show-toplevel)"
fail=0
for k in 'All rights reserved' '한국지능정보사회진흥원' '1588-2188' '세종대로 209' \
         'KWCAG' '민원 24' '5월 31일' '90일간' '온라인 발급은 무료' \
         '모든 정부 누리집' 'm-rrn' '전자문서 지갑'; do
  n=$(( $(grep -cF "$k" public/preview/krds/light.html) + $(grep -cF "$k" public/preview/krds/dark.html) ))
  printf "  %-22s %s\n" "$k" "$n"
  [ "$n" != "0" ] && fail=1
done
echo "총 잔여 플래그: $fail (0 이어야)"
```

Expected: 12줄 전부 `0`, 마지막 줄 `총 잔여 플래그: 0`

- [ ] **Step 4: 브랜치 푸시**

```bash
cd "$(git rev-parse --show-toplevel)"
git fetch origin -q
printf "main 이동: %s커밋\n" "$(git rev-list --count HEAD..origin/main)"
git push -u origin feat/krds-neutralize
```

Expected: `main 이동: 0커밋`, 푸시 성공. 0 이 아니면 `git merge origin/main` 후 Step 1 부터 재실행.

- [ ] **Step 5: PR 생성**

```bash
cd "$(git rev-parse --show-toplevel)"
gh pr create --base main --head feat/krds-neutralize \
  --title "fix(preview): KRDS 프리뷰 중립화 (묶음 E)" --body-file - <<'EOF'
설계 문서: `docs/superpowers/specs/2026-08-03-krds-preview-neutralization-design.md`

## 왜

KRDS 프리뷰가 `services/krds.md` 에 근거가 0건인 공공 서비스 사실을 단정하고,
타이핑 가능한 신원 필드를 렌더하며, 실존 청사 주소와 고객센터 번호를 싣고,
저장소가 쓴 마크업에 부처 명의로 `All rights reserved` 를 주장하고 있었습니다.

**가장 나쁜 건 KWCAG 입니다** — md:469 가 *"공식 문서는 KWCAG 를 언급하지
않는다"* 로 명시 철회했는데, 프리뷰가 되살렸을 뿐 아니라 버전(2.2)까지 붙여
정부가 그 기준으로 개정판을 공개했다고 공표하고 있었습니다.

## 무엇을

정부 식별 신호(seal · 공식 배너 · 워드마크)는 **유지하고 캡션으로 라벨링**했습니다.
KRDS 를 KRDS 로 보이게 하는 핵심 시연이고 md:236·331 이 컴포넌트로 문서화합니다.

| 커밋 | 내용 |
|---|---|
| 1 | masthead 식별 신호 캡션 |
| 2 | 허구 표시 데이터 캡션 3곳 (인기검색어 · 민원 처리 표 · 서비스 타일) |
| 3 | 무출처 사실 주장 9건 교체 |
| 4 | 09번 목업 폼 비인터랙티브화 |
| 5 | 푸터 3슬롯 치환 (삭제 0개) |
| 6 | `/preview/` 색인 차단 |
| 7 | `government-identifier-unlabelled` 룰 (warn) |

## 리뷰가 봐야 할 것

1. **푸터 © 는 삭제가 아니라 재작성입니다.** md:331 이 슬롯을 문서화하고 md:486 이
   footer 를 귀속의 제자리로 지정하며, `NOTICE` 가 적은 KOGL 제1유형의 유일한
   조건이 출처표시입니다. `bezier` 의 정상 귀속을 묶음 H 가 지우지 않도록
   재작성을 패턴으로 세웠습니다.
2. **`m-rrn` 은 라벨이 아니라 필드를 교체했습니다.** `생년월일 6자리` 로 바꾸면
   `placeholder="900101"` 이 "형식 예시"에서 "그럴듯한 실제 생년월일"로 읽힙니다.
3. **`/preview/` noindex 는 묶음 F 에서 당겨왔습니다.**

## 검증

- 8조합(2테마 × 375·768·976·1440) 문서 가로 스크롤 0, 캡션 5개 전부 정상 렌더
- 잔여 플래그 12종 각 0건
- 새 룰 변이 검증(룰 제거 시 정확히 실패), 카탈로그 17개 전수 발생 0건
- 전체 게이트 + `build` 통과

## 범위 밖

묶음 C · F 잔여 · G · H. `bezier`·`line`·`wanted` 푸터 © 는 H 에서 이 패턴을
따릅니다. 새 룰의 block 승격 + 작성자 프롬프트 배선은 별도 사전 합의 이슈입니다.
**seed-design 은 묶음 C~H 전체의 범위 밖입니다.**
EOF
```

Expected: PR URL 출력

- [ ] **Step 6: CI 확인 후 정지**

```bash
cd "$(git rev-parse --show-toplevel)"
for i in $(seq 1 10); do
  p=$(gh pr checks 2>&1 | grep -cE '\bpending\b')
  [ "$p" = "0" ] && break
  sleep 45
done
gh pr checks 2>&1 | grep -E 'build|claude-review'
gh pr view --json mergeable,mergeStateStatus -q '"\(.mergeable) / \(.mergeStateStatus)"'
```

**머지하지 않는다.** 머지는 사용자 허락이 필요하다 — 상태를 보고하고 멈춘다.

---

## Self-Review

**1. 스펙 커버리지**

| 스펙 절 | 태스크 |
|---|---|
| E-a 정부 식별 신호 유지 + 라벨링 | 1 |
| E-b 09번 목업 비인터랙티브화 | 4 |
| E-c 무출처 주장 28종 | 2(캡션 7종) · 3(문구 9종) · 무변경 판정 12종 |
| E-d 푸터 3슬롯 치환 | 5 |
| E-e `/preview/` noindex | 6 |
| E-f 기계 가드 | 7 |
| 검증 절 | 8 |

E-c 의 28종 중 `#7 선명한 화면 모드 지침`·`#8 SearchBar`(md 근거 있음), `#21·#22 정부24 마이페이지`(E-a 결정으로 무변경), 타일 4종 개별 문구(그리드 캡션으로 일괄)는 의도적 무변경이며 스펙 표에 명시돼 있다.

**2. 플레이스홀더 스캔** — `TBD`/`TODO`/"적절히 처리" 없음. 모든 코드 단계에 실제 문자열이 들어 있다.

**3. 타입·이름 일관성** — Task 6 의 `buildRobotsTxt` 는 Step 1 에서 실제 export 이름을 확인해 맞추도록 지시했다. Task 7 의 룰 이름 `government-identifier-unlabelled` 는 상수·구현·테스트·커밋 메시지·PR 본문에서 동일하다. `DUMMY_CAPTION_CLASS`/`GOVERNMENT_IDENTIFIERS` 는 Task 7 안에서만 쓰인다.

**4. 순서 의존** — Task 1–5 가 같은 두 파일을 만지므로 줄 번호가 아니라 문자열 앵커로 편집하게 했고, 각 태스크 Step 1 이 앵커 개수를 먼저 확인한다. Task 2 Step 3 의 기대값 `5개` 는 Task 1 이 끝난 상태를 전제한다.
