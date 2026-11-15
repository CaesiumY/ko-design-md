import { taglineAsShown, taglineSourceLine } from "./content-parser"
import { OG_LEDE_MAX_CHARS, SENTENCE_END } from "./og-lede"
import type { ValidationIssue } from "./draft-validator"

// The draft gate's half of the tagline line rule (한 줄 소개). The rule itself
// is stitch-format.md 「Standard section order」's opening list; this checks
// the parts a machine can see on the line the site takes, read the way the
// site reads it (`taglineSourceLine`, `taglineAsShown` in content-parser).
// Whether the service definition is the source's own words, and whether each
// citation backs its claim, stay with the reviewer (rubric Item 5).

/** Every rule this module can emit. Rubric Item 5 names each one. */
export const TAGLINE_RULE = {
  htmlComment: "tagline-html-comment",
  noCitation: "tagline-no-citation",
  colourValue: "tagline-colour-value",
  bold: "tagline-bold",
  emDash: "tagline-em-dash",
  multipleSentences: "tagline-multiple-sentences",
  tooLong: "tagline-too-long",
  exclusiveWord: "tagline-exclusive-word",
  definitionUncited: "tagline-definition-uncited",
} as const

// A second sentence: a terminator the share card would cut after, followed by
// more text. The share card skips a first "sentence" under 8 characters; this
// does not, so a short fragment before a full stop still counts as two.
const SECOND_SENTENCE = new RegExp(`${SENTENCE_END}\\s+\\S`, "u")

// A colour value: a hex (the prose-hex shape in draft-validator, which does not
// catch a URL fragment or `&#…;`) or a CSS colour function, the same functions
// draft-validator's `LITERAL_COLOUR` reads.
const COLOUR_VALUE =
  /(?<![\w&#/])#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab|color-mix)\s*\(/i

// A numbered citation, as `source-citations.ts` counts one. A screenshot or
// board marker carries no number and does not count.
const CITATION = /\[src:\d+\]/
const LEADING_CITATION = new RegExp(`^\\s*${CITATION.source}`)

// Exclusive forms ("nothing else"), searched as particles: a bare `만` would
// catch words such as 새카만. Bare `만` (빨강만) is left to the reviewer, who
// also judges whether the body and sources back the "nothing else".
export const TAGLINE_EXCLUSIVE_FORMS = [
  "에만",
  "때만",
  "만을",
  "뿐",
  "모두",
] as const

// Where the service definition ends: the first clause ending the template
// writes (`…이고 [src:N], …`) or one of its siblings, followed by a space, a
// comma or a citation.
const DEFINITION_END = /(?:이고|하고|내고)(?=[\s,[]|$)/u

const FIX_SECOND_PARAGRAPH =
  "Keep one sentence that says what the service is, then how its screens look; move history, scale or any further detail to the body (`## Brand & Style`)."

/** The tagline as the reader sees it, its length and the limit. */
export interface TaglineReading {
  text: string
  chars: number
  max: number
}

export function readTagline(body: string): TaglineReading {
  const text = taglineAsShown(taglineSourceLine(body))
  // Code points, as the share card's `.{8,90}` (with the `u` flag) counts them.
  return { text, chars: [...text].length, max: OG_LEDE_MAX_CHARS }
}

// The line `validate:draft` prints for one draft, which the Stage 7 checkpoint
// shows the user.
export const TAGLINE_REPORT_LABEL = "tagline:"

export function taglineReport(reading: TaglineReading): string {
  return `${TAGLINE_REPORT_LABEL} ${reading.chars}/${reading.max} chars "${reading.text}"`
}

export function taglineIssues(body: string): Array<ValidationIssue> {
  const line = taglineSourceLine(body)
  const { text: shown, chars } = readTagline(body)
  const issues: Array<ValidationIssue> = []
  const report = (
    severity: ValidationIssue["severity"],
    rule: string,
    fix: string
  ) => issues.push({ severity, rule, section: "tagline", fix })

  // The site does not skip a comment, so its first line becomes the tagline.
  // Nothing else on that line is worth judging.
  if (line.startsWith("<!--")) {
    report(
      "block",
      TAGLINE_RULE.htmlComment,
      `The first prose line under the H1 is an HTML comment ("${line.slice(0, 60)}"), and the site shows it as the entry's tagline. Delete the comment so the tagline sentence is the first line.`
    )
    return issues
  }
  const cited = CITATION.test(line)
  if (!cited) {
    report(
      "block",
      TAGLINE_RULE.noCitation,
      `The tagline line carries no [src:N]: "${line}". Cite each claim with the References entry that backs it: the service definition right after it, the screen description at the sentence's end.`
    )
  }
  if (COLOUR_VALUE.test(line)) {
    report(
      "block",
      TAGLINE_RULE.colourValue,
      `The tagline line writes a colour value: "${line}". Name the colour in words (파랑, 오렌지); the value belongs in the frontmatter \`colors:\` map and \`## Colors\`.`
    )
  }
  if (line.includes("**")) {
    report(
      "block",
      TAGLINE_RULE.bold,
      `The tagline line uses bold: "${line}". The site strips the markers, so the emphasis never reaches the reader. Remove the \`**\`.`
    )
  }
  if (line.includes("—")) {
    report(
      "block",
      TAGLINE_RULE.emDash,
      `The tagline line uses an em dash (—): "${line}". Join the two halves with a connective (이고, 하고) or a comma instead.`
    )
  }
  if (SECOND_SENTENCE.test(shown)) {
    report(
      "block",
      TAGLINE_RULE.multipleSentences,
      `The tagline line under the H1 holds more than one sentence: "${shown}". The share card shows only its first sentence. ${FIX_SECOND_PARAGRAPH}`
    )
  }
  if (chars > OG_LEDE_MAX_CHARS) {
    report(
      "block",
      TAGLINE_RULE.tooLong,
      `The tagline line runs ${chars} characters as the reader sees it (citation markers, bold and backticks not counted); the limit is ${OG_LEDE_MAX_CHARS}, the length the share card shows whole. ${FIX_SECOND_PARAGRAPH}`
    )
  }
  const exclusive = TAGLINE_EXCLUSIVE_FORMS.filter((form) =>
    shown.includes(form)
  )
  if (exclusive.length > 0) {
    report(
      "warn",
      TAGLINE_RULE.exclusiveWord,
      `The tagline line says "nothing else" (${exclusive.map((f) => `\`${f}\``).join(", ")}): "${shown}". Keep it only if the body and the cited source back that nothing else holds; otherwise drop the word. The same claim elsewhere in the entry (\`## Brand & Style\`, Do's and Don'ts, token comments) changes with it.`
    )
  }
  // A line with no citation at all is already blocked for that one cause.
  if (cited && !definitionCited(line)) {
    report(
      "warn",
      TAGLINE_RULE.definitionUncited,
      `The service definition at the start of the tagline line carries no [src:N] of its own: "${line}". Put the source whose own words it uses right after it (\`…이고 [src:N], …\`), so a reader can tell which citation backs the definition and which the screens.`
    )
  }
  return issues
}

// The service definition is the clause up to the first `이고`/`하고`/`내고`,
// cited inside it or right after it. With none of those, the first comma ends
// it; a line with neither is one clause, which `tagline-no-citation` judges.
function definitionCited(line: string): boolean {
  const end = line.match(DEFINITION_END)
  if (end?.index !== undefined) {
    const cut = end.index + end[0].length
    return (
      CITATION.test(line.slice(0, cut)) ||
      LEADING_CITATION.test(line.slice(cut))
    )
  }
  const comma = line.indexOf(",")
  return comma === -1 || CITATION.test(line.slice(0, comma))
}
