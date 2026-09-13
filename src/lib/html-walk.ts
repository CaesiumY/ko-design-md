// A structure-aware HTML walk, shared by the preview validator's rules.
//
// Extracted from `swatchFillCount` (#222/#234), which rewrote a line-based
// regex scan into a stack-keeping walk after the old scan was shown to give
// different answers for the same content laid out differently. That rewrite
// deliberately kept the walk inline, with a note saying to extract it "as a pure
// move when a second consumer actually appears". The government-identifier rule
// (#214) is that consumer.
//
// It is not a DOM. It answers structural questions — what is inside what, what
// text an element contains, which ancestors an element has — accurately enough
// that `preview-validator-corpus.test.ts` holds it to count equality with a
// jsdom walk over every shipped preview. jsdom stays a devDependency: the
// validator this serves has no runtime dependencies beyond `node:zlib`, and
// correctness is bought with a test-time comparison rather than a package.
//
// The one capability added during extraction is `parent`. The old walk computed
// the parent to inherit from and then dropped it on pop, which is enough when
// every decision can be made as an element closes. It is not enough for #214:
// in the real markup a caption *follows* the identifier it labels, so the answer
// is only knowable after the walk finishes. Retaining parents lets a consumer
// collect nodes during the walk and resolve afterwards.

/** Everything inside `<body>`, or the whole input when there is no body tag. */
export function bodyOf(html: string): string {
  return html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
}

// 닫는 태그가 없는 요소들 — 워커가 스택에 **쌓지 않아야** 하는 목록이다.
// 쌓으면 `<hr>` 이 조상으로 남아 그 뒤 텍스트가 전부 거기 붙고, 그러면 `<hr>`
// 이 "텍스트를 가진 요소"가 되어 fill 계수에서 조용히 빠진다.
// `base`·`link`·`meta`·`param` 은 `<body>` 안에서는 파스 에러지만 파서가 void
// 로 회복하므로, 빠뜨리면 그 지점부터 스택이 DOM 과 어긋난다.
const VOID_ELEMENTS = new Set([
  "img",
  "hr",
  "br",
  "input",
  "source",
  "area",
  "col",
  "embed",
  "track",
  "wbr",
  "base",
  "link",
  "meta",
  "param",
])

// 내용이 요소로 파싱되지 않는 요소들 — 닫는 태그까지 통째로 건너뛴다.
// 앞 넷은 raw text 라 안쪽 `<div>` 가 문자열이지 요소가 아니고, `template` 은
// 내용이 별도 fragment 로 가서 `querySelectorAll` 에 안 잡힌다(= 렌더되지
// 않는다). 이유는 다르지만 "안쪽을 요소로 세지 않는다"가 둘 다 DOM 과 맞다.
const OPAQUE_ELEMENTS = new Set([
  "script",
  "style",
  "textarea",
  "title",
  "template",
])

// 디코딩하면 JS `trim()` 이 지우는 문자가 되는 명명 엔티티들. 실제 문자를
// 소스에 두지 않고 이름만 나열한 이유는 nbsp 류가 코드에 들어가면 눈으로
// 구분되지 않아 편집 중에 조용히 옮겨 다니기 때문이다 — 판정에 쓰는 건
// "공백인가"뿐이라 평범한 스페이스로 치환해도 결과가 같다.
const WHITESPACE_ENTITIES = new Set([
  "nbsp",
  "NonBreakingSpace",
  "ensp",
  "emsp",
  "emsp13",
  "emsp14",
  "numsp",
  "puncsp",
  "thinsp",
  "ThinSpace",
  "hairsp",
  "VeryThinSpace",
  "MediumSpace",
])

// jsdom 은 `textContent.trim()` 을 보므로 엔티티가 **디코딩된 뒤** 공백인지가
// 기준이다. nbsp 하나만 든 자식은 렌더상 빈 칸이고 JS `trim()` 이 그 문자를
// 지우므로 여전히 fill 로 세어야 한다. 반대로 `&amp;` 는 글자다.
// 알 수 없는 명명 엔티티는 글자로 본다 — 임의로 안전한 쪽을 고른 게 아니라,
// 공백이 되는 엔티티가 위 목록으로 닫히기 때문이다.
export function isBlankText(raw: string): boolean {
  // `&` 자체가 비공백이므로, 여기서 비면 엔티티도 없다.
  if (raw.trim() === "") return true
  const decoded = raw.replace(
    /&(#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);?/gi,
    (_m, ref: string) => {
      if (ref.startsWith("#")) {
        const cp = ref.startsWith("#x")
          ? parseInt(ref.slice(2), 16)
          : parseInt(ref.slice(1), 10)
        if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return "x"
        return String.fromCodePoint(cp)
      }
      return WHITESPACE_ENTITIES.has(ref) ? " " : "x"
    }
  )
  return decoded.trim() === ""
}

/**
 * 시작 태그의 끝 `>` 위치. 따옴표 안의 `>` 는 넘긴다(`title="a > b"`).
 *
 * 문자 루프인 것이 의도다 — 속성 구간까지 한 정규식에 넣으면 중첩 수량자가
 * 생겨, 닫는 `>` 가 없는 잘린 입력에서 지수 백트래킹이 난다(200 KB 실측
 * 94초 → 이 방식 1 ms). Stage 9a2 는 방금 생성된 파일을 받으므로 "입력은
 * 언제나 온전하다"를 가정할 수 없다.
 */
function findTagEnd(s: string, from: number): number {
  let quote: string | null = null
  for (let j = from; j < s.length; j++) {
    const c = s[j]
    if (quote !== null) {
      if (c === quote) quote = null
    } else if (c === '"' || c === "'") {
      quote = c
    } else if (c === ">") {
      return j
    }
  }
  return -1
}

/**
 * 시작 태그의 속성 구간을 이름→값으로 읽는다. 값이 없는 속성은 `""` 다.
 *
 * 정규식으로 `style=` 을 찾지 않는 이유는 이 PR 이 고치는 것과 같은 부류의
 * 버그가 나기 때문이다 — 정규식은 따옴표 구간을 토큰으로 보지 않으므로 다른
 * 속성 **값 안**의 문자열을 속성으로 읽는다. 실측된 이탈 경로 셋:
 *   - `<div title="a style=b" style="background:red">` → `style` 을 `b"` 로
 *     읽어 fill 을 통째로 놓친다(jsdom: `background:red`).
 *   - `title="data-theme-only=dark"` 가 뒤의 진짜 `data-theme-only="light"`
 *     보다 먼저 매칭돼 테마가 뒤집힌다.
 *   - 값 없는 `<div data-theme-only>` 를 못 찾아 `null` 을 낸다. jsdom 은
 *     `""` 이고 `closest()` 는 이 요소에서 멈추므로, 그 아래 fill 이 이
 *     래퍼가 아니라 **부모의 테마**로 귀속되던 경로다.
 *
 * 중복 속성은 파서와 같이 **먼저 나온 것**이 이긴다.
 *
 * 반환하는 `selfClosing` 은 마지막 `/` 가 값에 먹히지 않고 홀로 `>` 앞에
 * 붙었는지다. `<path d=M0/>` 의 `/` 는 따옴표 없는 값의 일부라 self-closing
 * 이 아니고, `<div / >` 도 아니다 — 둘 다 파서의 판정과 같다.
 */
function parseAttrs(attrs: string): {
  map: Map<string, string>
  selfClosing: boolean
} {
  const map = new Map<string, string>()
  const isSpace = (c: string): boolean => c === " " || /\s/.test(c)
  let selfClosing = false
  let j = 0
  while (j < attrs.length) {
    while (j < attrs.length && (isSpace(attrs[j]) || attrs[j] === "/")) {
      selfClosing = attrs[j] === "/"
      j++
    }
    if (j >= attrs.length) break
    selfClosing = false

    const nameStart = j
    while (
      j < attrs.length &&
      !isSpace(attrs[j]) &&
      attrs[j] !== "=" &&
      attrs[j] !== "/"
    ) {
      j++
    }
    const name = attrs.slice(nameStart, j).toLowerCase()
    while (j < attrs.length && isSpace(attrs[j])) j++

    let value = ""
    if (attrs[j] === "=") {
      j++
      while (j < attrs.length && isSpace(attrs[j])) j++
      const quote = attrs[j]
      if (quote === '"' || quote === "'") {
        j++
        const start = j
        while (j < attrs.length && attrs[j] !== quote) j++
        value = attrs.slice(start, j)
        j++
      } else {
        const start = j
        while (j < attrs.length && !isSpace(attrs[j])) j++
        value = attrs.slice(start, j)
      }
    }
    if (name !== "" && !map.has(name)) map.set(name, value)
  }
  return { map, selfClosing }
}

/**
 * One element, live for the whole walk.
 *
 * `data` is the consumer's payload, created by `init` when the element opens —
 * so a child can read `parent.data` and inherit from it, the way fill counting
 * inherits `data-theme-only`.
 */
export interface WalkNode<T> {
  readonly tag: string
  /** Parsed attributes: names lowercased, first duplicate wins, valueless → "". */
  readonly attrs: ReadonlyMap<string, string>
  /** null for an element whose parent is `<body>` itself. */
  readonly parent: WalkNode<T> | null
  /** Inside an svg/math subtree, where self-closing syntax is honoured. */
  readonly foreign: boolean
  data: T
}

export interface WalkHandlers<T> {
  /** Runs at open, before `onOpen`; `parent` is already wired. */
  init: (node: Omit<WalkNode<T>, "data">) => T
  onOpen?: (node: WalkNode<T>) => void
  /**
   * Runs for EVERY element exactly once — void, self-closing, opaque, closed
   * explicitly, closed implicitly by an ancestor's close tag, and the final
   * unwind of anything still open at EOF.
   */
  onClose?: (node: WalkNode<T>) => void
  /**
   * A run of text, RAW. The walk deliberately does not apply `isBlankText`:
   * fill counting needs whitespace-only runs filtered out, and the
   * government-identifier rule needs every character. Filtering here would
   * quietly serve one consumer and break the other. `top` is the innermost
   * open element, null at body level.
   */
  onText?: (top: WalkNode<T> | null, raw: string) => void
}

/**
 * Walk `<body>`, calling handlers in document order.
 *
 * Every branch below is load-bearing and was measured; see the comments on the
 * helpers above and the 22 structural fixtures in
 * `preview-validator-corpus.test.ts`, several of which exist because a real bug
 * was found in review at that exact spot.
 */
export function walkHtml<T>(html: string, h: WalkHandlers<T>): void {
  const body = bodyOf(html)
  const stack: Array<WalkNode<T>> = []
  const top = (): WalkNode<T> | null =>
    stack.length > 0 ? stack[stack.length - 1] : null

  const open = (
    tag: string,
    attrs: Map<string, string>,
    foreign: boolean
  ): WalkNode<T> => {
    const parent = top()
    const seed = { tag, attrs, parent, foreign }
    const node: WalkNode<T> = { ...seed, data: h.init(seed) }
    h.onOpen?.(node)
    return node
  }

  let i = 0
  while (i < body.length) {
    const lt = body.indexOf("<", i)
    if (lt === -1) {
      h.onText?.(top(), body.slice(i))
      break
    }
    if (lt > i) h.onText?.(top(), body.slice(i, lt))

    const next = body[lt + 1] ?? ""

    if (body.startsWith("<!--", lt)) {
      // 주석은 텍스트가 아니다 — 주석만 품은 fill 은 여전히 fill 이다.
      const end = body.indexOf("-->", lt + 4)
      i = end === -1 ? body.length : end + 3
      continue
    }
    if (next === "!" || next === "?") {
      const end = findTagEnd(body, lt + 1)
      i = end === -1 ? body.length : end + 1
      continue
    }

    if (next === "/") {
      if (!/[a-zA-Z]/.test(body[lt + 2] ?? "")) {
        const end = findTagEnd(body, lt + 2)
        i = end === -1 ? body.length : end + 1
        continue
      }
      const end = findTagEnd(body, lt + 2)
      if (end === -1) break
      const tag = body
        .slice(lt + 2, end)
        .trim()
        .toLowerCase()
      i = end + 1
      // 스택에 없는 닫는 태그는 무시한다. 흩어진 `</span>` 하나에 트리가
      // 풀리면 그 뒤 계수가 전부 어긋나는데, 파서도 이 경우를 버린다.
      let at = -1
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tag) {
          at = k
          break
        }
      }
      if (at === -1) continue
      while (stack.length > at) {
        const el = stack.pop()
        if (el !== undefined) h.onClose?.(el)
      }
      continue
    }

    if (!/[a-zA-Z]/.test(next)) {
      // `a < b` 같은 순수 텍스트. `<` 한 글자만 넘긴다.
      h.onText?.(top(), "<")
      i = lt + 1
      continue
    }

    // 태그 이름만 잘라 읽는다 — 속성까지 한 정규식에 넣지 않는 이유는
    // `findTagEnd` 주석 참조. 64자는 실존 태그 이름을 다 덮는 상한이다.
    const nameMatch = /^[a-zA-Z][^\s/>]*/.exec(body.slice(lt + 1, lt + 65))
    if (nameMatch === null) {
      h.onText?.(top(), "<")
      i = lt + 1
      continue
    }
    const tag = nameMatch[0].toLowerCase()
    const end = findTagEnd(body, lt + 1 + tag.length)
    if (end === -1) break
    const attrs = body.slice(lt + 1 + tag.length, end)
    i = end + 1

    const parsed = parseAttrs(attrs)
    const parent = top()
    const foreign =
      tag === "svg" || tag === "math" || (parent?.foreign ?? false)
    const el = open(tag, parsed.map, foreign)

    if (OPAQUE_ELEMENTS.has(tag)) {
      // `body.toLowerCase().indexOf(…)` 로 찾지 않는다. 대소문자 변환이
      // 길이를 바꾸는 문자가 있어(U+0130 은 소문자화하면 2글자다) 사본의
      // 인덱스를 원본에 그대로 쓰면 그 지점부터 파싱이 어긋난다. 매번 전체
      // 사본을 만드는 비용도 사라진다.
      const closeRe = new RegExp(`</${tag}(?=[\\s/>])`, "gi")
      closeRe.lastIndex = i
      const close = closeRe.exec(body)?.index ?? -1
      const inner = body.slice(i, close === -1 ? body.length : close)
      if (close === -1) {
        i = body.length
      } else {
        const closeEnd = findTagEnd(body, close + 2 + tag.length)
        i = closeEnd === -1 ? body.length : closeEnd + 1
      }
      // `template` 의 내용은 별도 fragment 라 조상의 textContent 에 안 들어간다.
      // 나머지 넷은 raw text 지만 textContent 에는 그대로 들어간다.
      // 텍스트를 먼저, 닫기를 나중에 — 순서가 뒤집히면 자기 내용을 못 본다.
      if (tag !== "template") {
        stack.push(el)
        h.onText?.(el, inner)
        stack.pop()
      }
      h.onClose?.(el)
      continue
    }

    // self-closing 표기는 svg/math 안에서만 유효하다. HTML 콘텐츠에서 `<div/>`
    // 는 여전히 열린 요소이므로, 항상 인정하면 그 뒤 텍스트를 놓쳐 과다 계수가
    // 나고 항상 무시하면 SVG 를 쓰는 프리뷰에서 스택이 통째로 어긋난다.
    const selfClosing = foreign && parsed.selfClosing
    if (VOID_ELEMENTS.has(tag) || selfClosing) {
      h.onClose?.(el)
      continue
    }
    stack.push(el)
  }

  while (stack.length > 0) {
    const el = stack.pop()
    if (el !== undefined) h.onClose?.(el)
  }
}
