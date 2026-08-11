// ---------------------------------------------------------------------------
// The workbench-domain cascade, parsed out of the prompt and EXECUTED.
//
// `agents/orchestrator.md` Setup Step 5 decides a workbench's domain
// (code | data | strategic | knowledge) from a fixed if/elif cascade over five
// integers and one string. The cascade is prompt text, so nothing ran it, and
// the only gate on it measured the *layout* of its branch lines — whether a
// line mentioned a token, not whether that line could ever fire. Four edits
// that reinstated the defect it guards therefore passed it: a decoy branch
// (`elif code_files < 0`) above a restored pre-fix order, an inverted condition
// (`code_files == 0` in the `> 0` slot), a dead threshold (`> 100000`), and the
// token appearing only in a trailing comment.
// Issue: fusion-workbench/shared/issues/260810-0503_*_the-domain-cascade-lint-
// is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md.
//
// This module makes the cascade runnable. It does NOT restate it.
//
// ---------------------------------------------------------------------------
// Why this file is not a second copy
//
// The obvious fix — write the six branches out again as TypeScript and assert
// its verdicts — creates two definitions of one decision and no mechanism
// keeping them equal. The prompt is what the orchestrator actually reads, so a
// TypeScript copy that drifted would keep passing while the live behaviour
// changed: the same class of defect, moved one file over.
//
// So the cascade here IS the cascade in the prompt. `parseCascade()` extracts
// the fenced block, parses each branch's condition into an expression tree, and
// `evaluateCascade()` runs it against a set of counts.
//
// ---------------------------------------------------------------------------
// What that does NOT buy, and what does
//
// This header used to end "drift is not guarded against, it is unrepresentable
// — there is one definition". That sentence was false when it was written. A
// second definition is representable and one existed: `skills/cleanup/SKILL.md`
// carried the cascade as a single prose sentence, in the pre-fix order and with
// no absent-count case, so a project reached `code` at Setup and `strategic` at
// cleanup inside one session (issue 260810-1918). It predated the claim
// denying it, and both gates read `agents/orchestrator.md` alone, so neither
// could see it. Running the prompt's own block keeps THIS file from being a
// second copy; it says nothing about any other consumer.
//
// The claim is therefore a measurement now, not an argument.
// `findCascadeStatements()` and `cascadeBlocks()` below detect a statement of
// the cascade in a consumer's text, and `domain-cascade.test.ts` runs both over
// the file set `REACH.fileSet` names, allowing exactly one file to state it.
// How far that reaches is not promised here and not written in prose anywhere:
// it is `REACH` at the foot of this file, every line of it carrying probes the
// suite runs.
//
// What that costs is strictness, and it is deliberate: anything the grammar
// below cannot read raises `CascadeError` rather than being skipped. A renamed
// variable, a condition form nobody anticipated, a missing final `else`, a
// branch assigning a fifth domain — each fails loudly at the gate instead of
// quietly narrowing what the gate covers. Widen the grammar when the prompt
// legitimately needs a construct; never widen it to make a failure go away.
//
// Trailing comments are stripped before parsing (`# counts unavailable`), which
// is why a token hidden in one cannot satisfy anything here.
//
// ---------------------------------------------------------------------------
// The absent count is a string, on purpose
//
// `bin/fusion-count-sources` prints `code_files=unavailable` when no count was
// taken, and its header forbids reporting that as a zero. Modelling it as the
// string it actually is means a branch that reads it arithmetically THROWS
// rather than silently comparing. That is the executable form of the
// `counted_by == "none"` line's load-bearing position (issue 260807-1951,
// decision 260809-1731): move a count branch above it and the absent-count case
// stops returning `code` and starts raising.
// ---------------------------------------------------------------------------

export class CascadeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CascadeError";
  }
}

export const DOMAINS = ["code", "data", "strategic", "knowledge"] as const;
export type Domain = (typeof DOMAINS)[number];

/** The names the cascade may read. An identifier outside this set is an error. */
export const COUNT_NAMES = [
  "commits",
  "analyses_count",
  "issues_count",
  "decisions_count",
  "code_files",
  "data_files",
  "counted_by",
] as const;
export type CountName = (typeof COUNT_NAMES)[number];

/**
 * The inputs Step 5 gathers. Numbers are counts; strings are the two values
 * that are not numbers — `counted_by`, and either file count when the helper
 * reports `unavailable`.
 */
export type Counts = Record<CountName, number | string>;

// --- expressions -----------------------------------------------------------

export type Expr =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "var"; name: CountName }
  | { kind: "arith"; op: "*" | "/" | "+" | "-"; left: Expr; right: Expr }
  | { kind: "compare"; op: "==" | "!=" | ">" | ">=" | "<" | "<="; left: Expr; right: Expr }
  | { kind: "logical"; op: "and" | "or"; left: Expr; right: Expr };

export interface Branch {
  /** `if` for the first branch, `elif` for the middle, `else` for the last. */
  kind: "if" | "elif" | "else";
  /** The domain this branch assigns. */
  domain: Domain;
  /** The branch line as written, trailing comment stripped. */
  source: string;
  /** The parsed condition; `null` for `else`. */
  condition: Expr | null;
}

// --- tokenizer -------------------------------------------------------------

type Token = { t: "ident" | "int" | "str" | "op" | "kw"; v: string };

const TWO_CHAR_OPS = ["==", "!=", ">=", "<="];
const ONE_CHAR_OPS = "<>*/+-()";

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      i = j;
      out.push({ t: word === "and" || word === "or" ? "kw" : "ident", v: word });
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      out.push({ t: "int", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      const close = src.indexOf(c, i + 1);
      if (close < 0) throw new CascadeError(`unterminated string literal in condition: ${src}`);
      out.push({ t: "str", v: src.slice(i + 1, close) });
      i = close + 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO_CHAR_OPS.includes(two)) {
      out.push({ t: "op", v: two });
      i += 2;
      continue;
    }
    if (ONE_CHAR_OPS.includes(c)) {
      out.push({ t: "op", v: c });
      i += 1;
      continue;
    }
    throw new CascadeError(`unreadable character ${JSON.stringify(c)} in condition: ${src}`);
  }
  return out;
}

// --- parser ----------------------------------------------------------------
//
// condition := orExpr
// orExpr    := andExpr ( 'or' andExpr )*
// andExpr   := compare ( 'and' compare )*
// compare   := additive ( ('=='|'!='|'>='|'<='|'>'|'<') additive )?
// additive  := multiplicative ( ('+'|'-') multiplicative )*
// multiplicative := primary ( ('*'|'/') primary )*
// primary   := INT | STRING | IDENT | '(' condition ')'

class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly src: string,
  ) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private eat(t: Token["t"], v?: string): Token | undefined {
    const tok = this.peek();
    if (!tok || tok.t !== t) return undefined;
    if (v !== undefined && tok.v !== v) return undefined;
    this.pos++;
    return tok;
  }

  parseCondition(): Expr {
    const e = this.parseOr();
    if (this.pos !== this.tokens.length) {
      throw new CascadeError(
        `trailing tokens after the condition in: ${this.src} (at ${JSON.stringify(this.peek()?.v)})`,
      );
    }
    assertBoolean(e, this.src);
    return e;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.eat("kw", "or")) {
      left = { kind: "logical", op: "or", left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseCompare();
    while (this.eat("kw", "and")) {
      left = { kind: "logical", op: "and", left, right: this.parseCompare() };
    }
    return left;
  }

  private parseCompare(): Expr {
    const left = this.parseAdditive();
    const tok = this.peek();
    if (tok?.t === "op" && ["==", "!=", ">", ">=", "<", "<="].includes(tok.v)) {
      this.pos++;
      const right = this.parseAdditive();
      const after = this.peek();
      if (after?.t === "op" && ["==", "!=", ">", ">=", "<", "<="].includes(after.v)) {
        // Python allows `0 < x < 5`; this reader does not, because getting it
        // subtly wrong would misreport a verdict rather than fail.
        throw new CascadeError(`chained comparison is not readable here: ${this.src}`);
      }
      return { kind: "compare", op: tok.v as never, left, right };
    }
    return left;
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    for (;;) {
      const tok = this.peek();
      if (tok?.t === "op" && (tok.v === "+" || tok.v === "-")) {
        this.pos++;
        left = { kind: "arith", op: tok.v, left, right: this.parseMultiplicative() };
        continue;
      }
      return left;
    }
  }

  private parseMultiplicative(): Expr {
    let left = this.parsePrimary();
    for (;;) {
      const tok = this.peek();
      if (tok?.t === "op" && (tok.v === "*" || tok.v === "/")) {
        this.pos++;
        left = { kind: "arith", op: tok.v, left, right: this.parsePrimary() };
        continue;
      }
      return left;
    }
  }

  private parsePrimary(): Expr {
    const tok = this.peek();
    if (!tok) throw new CascadeError(`condition ends early: ${this.src}`);
    if (tok.t === "int") {
      this.pos++;
      return { kind: "num", value: Number(tok.v) };
    }
    if (tok.t === "str") {
      this.pos++;
      return { kind: "str", value: tok.v };
    }
    if (tok.t === "ident") {
      this.pos++;
      if (!(COUNT_NAMES as readonly string[]).includes(tok.v)) {
        throw new CascadeError(
          `the cascade reads \`${tok.v}\`, which is not one of the inputs Step 5 gathers ` +
            `(${COUNT_NAMES.join(", ")}). Either the prompt renamed a count — in which case ` +
            `COUNT_NAMES in hooks/lib/domain-cascade.ts moves with it — or the branch reads ` +
            `something nothing supplies. Line: ${this.src}`,
        );
      }
      return { kind: "var", name: tok.v as CountName };
    }
    if (tok.t === "op" && tok.v === "(") {
      this.pos++;
      const inner = this.parseOr();
      if (!this.eat("op", ")")) throw new CascadeError(`unclosed parenthesis in: ${this.src}`);
      return inner;
    }
    throw new CascadeError(`unexpected ${JSON.stringify(tok.v)} in condition: ${this.src}`);
  }
}

/**
 * A condition has to BE a test. A bare value as the whole condition (`if
 * code_files:`) would import Python's truthiness rules, under which
 * `"unavailable"` is true and 0 is false — the exact confusion the absent-count
 * branch exists to prevent.
 */
function assertBoolean(e: Expr, src: string): void {
  if (e.kind === "compare") return;
  if (e.kind === "logical") {
    assertBoolean(e.left, src);
    assertBoolean(e.right, src);
    return;
  }
  throw new CascadeError(
    `this condition is a value, not a comparison, so whether it fires depends on ` +
      `truthiness rules the cascade must not rely on: ${src}`,
  );
}

export function parseCondition(src: string): Expr {
  return new Parser(tokenize(src), src).parseCondition();
}

// --- block extraction ------------------------------------------------------

/** Index of the first `ch` in `line` that is not inside a quoted string, or -1. */
function unquotedIndexOf(line: string, ch: string): number {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === ch) return i;
  }
  return -1;
}

function stripComment(line: string): string {
  const at = unquotedIndexOf(line, "#");
  return (at < 0 ? line : line.slice(0, at)).trim();
}

/**
 * Every fenced block in `markdown` that assigns both the `code` and the
 * `strategic` domain — i.e. every executable copy of the cascade the text
 * carries. Zero for an ordinary file, one for the definition site.
 *
 * Exported because "how many files hold one" is the reach gate's question as
 * much as "which block do I run" is this module's.
 */
export function cascadeBlocks(markdown: string): string[] {
  return markdown
    .split(/^\s*```.*$/m)
    .filter((b) => /domain\s*=\s*"code"/.test(b) && /domain\s*=\s*"strategic"/.test(b));
}

/**
 * The one fenced block assigning both the `code` and the `strategic` domain.
 * Exactly one such block must exist — two would mean the prompt describes the
 * decision twice, and this reader would have to guess which one runs.
 */
export function extractCascadeBlock(markdown: string): string {
  const found = cascadeBlocks(markdown);
  if (found.length !== 1) {
    throw new CascadeError(
      `expected exactly one fenced block assigning both the \`code\` and \`strategic\` ` +
        `domains, found ${found.length}`,
    );
  }
  return found[0];
}

/**
 * The cascade's branches, in order, with conditions parsed.
 *
 * The block's variable definitions above the cascade name every count and its
 * comments discuss them; neither starts with `if`/`elif`/`else`, so neither is
 * read as a branch.
 */
export function parseCascade(markdown: string): Branch[] {
  const lines = extractCascadeBlock(markdown)
    .split("\n")
    .map(stripComment)
    .filter((l) => /^(if|elif|else)\b/.test(l));

  const branches: Branch[] = lines.map((line) => {
    const colon = unquotedIndexOf(line, ":");
    if (colon < 0) throw new CascadeError(`branch has no \`:\` separating test from result: ${line}`);
    const head = line.slice(0, colon).trim();
    const tail = line.slice(colon + 1).trim();

    const assign = /^domain\s*=\s*"([a-z]+)"$/.exec(tail);
    if (!assign) {
      throw new CascadeError(`branch does not assign a domain: ${line}`);
    }
    if (!(DOMAINS as readonly string[]).includes(assign[1])) {
      throw new CascadeError(
        `branch assigns domain "${assign[1]}", which is not one of ${DOMAINS.join(" | ")}: ${line}`,
      );
    }
    const domain = assign[1] as Domain;

    if (head === "else") {
      return { kind: "else", domain, source: line, condition: null };
    }
    const m = /^(if|elif)\b\s*(.+)$/.exec(head);
    if (!m) throw new CascadeError(`branch head is not readable: ${line}`);
    return {
      kind: m[1] as "if" | "elif",
      domain,
      source: line,
      condition: parseCondition(m[2]),
    };
  });

  assertWellFormed(branches);
  return branches;
}

/**
 * Shape the evaluator depends on: one leading `if`, `elif` in the middle, and a
 * final `else`. The `else` is what makes the cascade total — without it some
 * input reaches the end with no verdict, and Step 5 has no answer to give.
 */
function assertWellFormed(branches: Branch[]): void {
  if (branches.length < 2) {
    throw new CascadeError(`the cascade has ${branches.length} branch(es); expected the full chain`);
  }
  if (branches[0].kind !== "if") {
    throw new CascadeError(`the cascade starts with \`${branches[0].kind}\`, not \`if\``);
  }
  const last = branches[branches.length - 1];
  if (last.kind !== "else") {
    throw new CascadeError(
      `the cascade has no final \`else\`, so it is not total: some input reaches the end ` +
        `with no domain. Last branch: ${last.source}`,
    );
  }
  for (const b of branches.slice(1, -1)) {
    if (b.kind !== "elif") {
      throw new CascadeError(`\`${b.kind}\` in the middle of the chain: ${b.source}`);
    }
  }
}

// --- evaluation ------------------------------------------------------------

type Value = number | string | boolean;

function lookup(counts: Counts, name: CountName, src: string): number | string {
  const v = counts[name];
  if (v === undefined) throw new CascadeError(`no value supplied for \`${name}\`, needed by: ${src}`);
  return v;
}

function describe(v: Value): string {
  return typeof v === "string" ? JSON.stringify(v) : String(v);
}

function numeric(v: Value, expr: Expr, src: string): number {
  if (typeof v === "number") return v;
  const who = expr.kind === "var" ? `\`${expr.name}\`` : "a value";
  throw new CascadeError(
    `${who} is ${describe(v)}, not a number, and this branch does arithmetic on it: ${src}. ` +
      `An absent count reached a branch that reads it — the \`counted_by == "none"\` branch ` +
      `must stand above every branch reading a count (issue 260807-1951, decision 260809-1731).`,
  );
}

function evaluate(e: Expr, counts: Counts, src: string): Value {
  switch (e.kind) {
    case "num":
      return e.value;
    case "str":
      return e.value;
    case "var":
      return lookup(counts, e.name, src);
    case "arith": {
      const l = numeric(evaluate(e.left, counts, src), e.left, src);
      const r = numeric(evaluate(e.right, counts, src), e.right, src);
      switch (e.op) {
        case "*":
          return l * r;
        case "/":
          return r === 0 ? Number.NaN : l / r;
        case "+":
          return l + r;
        case "-":
          return l - r;
      }
      break;
    }
    case "compare": {
      const l = evaluate(e.left, counts, src);
      const r = evaluate(e.right, counts, src);
      if (e.op === "==" || e.op === "!=") {
        if (typeof l !== typeof r) {
          throw new CascadeError(
            `this branch compares ${describe(l)} with ${describe(r)}, which are not the same ` +
              `kind of value: ${src}`,
          );
        }
        return e.op === "==" ? l === r : l !== r;
      }
      const ln = numeric(l, e.left, src);
      const rn = numeric(r, e.right, src);
      switch (e.op) {
        case ">":
          return ln > rn;
        case ">=":
          return ln >= rn;
        case "<":
          return ln < rn;
        case "<=":
          return ln <= rn;
      }
      break;
    }
    case "logical": {
      const l = evaluate(e.left, counts, src);
      if (typeof l !== "boolean") throw new CascadeError(`non-boolean operand to \`${e.op}\`: ${src}`);
      // Short-circuit, as Python does: `code_files > 0 and data_files > code_files * 2`
      // must not evaluate its right half when the left one is false.
      if (e.op === "and" && !l) return false;
      if (e.op === "or" && l) return true;
      const r = evaluate(e.right, counts, src);
      if (typeof r !== "boolean") throw new CascadeError(`non-boolean operand to \`${e.op}\`: ${src}`);
      return r;
    }
  }
  throw new CascadeError(`unreachable expression kind in: ${src}`);
}

export interface Verdict {
  domain: Domain;
  /** Index of the branch that fired. */
  index: number;
  branch: Branch;
}

/** Run the cascade. First branch whose condition holds wins, as an if/elif chain does. */
export function evaluateCascade(branches: Branch[], counts: Counts): Verdict {
  for (let i = 0; i < branches.length; i++) {
    const b = branches[i];
    if (b.condition === null) return { domain: b.domain, index: i, branch: b };
    const hit = evaluate(b.condition, counts, b.source);
    if (typeof hit !== "boolean") throw new CascadeError(`condition did not yield a test: ${b.source}`);
    if (hit) return { domain: b.domain, index: i, branch: b };
  }
  throw new CascadeError("no branch fired and the cascade has no `else`");
}

/** Convenience: parse the prompt text and run it in one call. */
export function domainFor(markdown: string, counts: Counts): Domain {
  return evaluateCascade(parseCascade(markdown), counts).domain;
}

// --- input contract --------------------------------------------------------

/** Every count name the expression reads. */
export function variablesRead(e: Expr | null): Set<CountName> {
  const out = new Set<CountName>();
  const walk = (n: Expr | null): void => {
    if (!n) return;
    if (n.kind === "var") out.add(n.name);
    else if (n.kind === "arith" || n.kind === "compare" || n.kind === "logical") {
      walk(n.left);
      walk(n.right);
    }
  };
  walk(e);
  return out;
}

/**
 * The three `KEY=value` lines `bin/fusion-count-sources` prints, in the shape
 * the cascade consumes: integers stay integers, and `unavailable` stays the
 * string it is. Turning it into 0 here would be exactly the mislabelling the
 * helper's own header forbids.
 */
export function countsFromHelperOutput(stdout: string): Pick<
  Counts,
  "code_files" | "data_files" | "counted_by"
> {
  const read = (key: string): string => {
    const m = new RegExp(`^${key}=(.*)$`, "m").exec(stdout);
    if (!m) throw new CascadeError(`bin/fusion-count-sources printed no \`${key}\` line`);
    return m[1].trim();
  };
  const num = (key: string): number | string => {
    const raw = read(key);
    return /^[0-9]+$/.test(raw) ? Number(raw) : raw;
  };
  return {
    code_files: num("code_files"),
    data_files: num("data_files"),
    counted_by: read("counted_by"),
  };
}

// --- reach: finding a second statement of the cascade ----------------------
//
// A fenced second cascade is caught by `cascadeBlocks()` above. The copy that
// actually shipped was not fenced — it was one sentence of prose, and this is
// what finds that shape.
//
// What a statement of the cascade IS, measurably: a unit of text naming at
// least two of the four DOMAINS as literals AND at least two of the cascade's
// own INPUTS. Two outcomes plus two of the counts they are decided from is a
// decision procedure; anything less is a consumer talking about a domain it was
// handed. That split was measured, not assumed: it leaves the per-domain
// priority tables in `reconciler`, `taskplanner` and `playmaker` alone, which
// name four domains each and no input.
//
// ---------------------------------------------------------------------------
// HOW FAR THIS REACHES IS NOT WRITTEN IN THIS COMMENT
//
// It is `REACH` below, and `REACH` is data rather than prose for a specific
// reason: the claim about this gate has now been broader than the gate twice in
// a row. The first version said a second definition was unrepresentable while
// one sat in `skills/cleanup/SKILL.md` (issue 260810-1918). The second replaced
// that with a scoped measurement naming three holes, and a review measured a
// fourth against the shipped build — a domain name outside backticks or double
// quotes was invisible, which is the plainest second copy anyone would write
// (issues 260810-2110, three of them).
//
// So every line of the claim now carries probes, and `domain-cascade.test.ts`
// runs them: each `covered` probe must fire, each `holes` probe must NOT fire,
// and each `excluded` path must measure what it says it measures. Closing a
// hole without correcting this list turns the suite red. The paragraph in
// `README-hooks.md` is rendered from the same object by `describeReach()` and
// compared byte-for-byte, so the sentence a reader meets and the behaviour a
// project gets cannot disagree.
//
// What that is still not: a proof. It is a floor whose exact height is written
// down and checked. `rules/critical-stance.md` §4 applies in full — "does this
// prose restate the decision?" is not decidable from a line of text, and no
// widening below pretends otherwise. What the probes buy is that the answer
// stops being an argument.
// ---------------------------------------------------------------------------

/**
 * A domain name in one of the four inline markups a markdown author reaches
 * for: `code`, "code", 'code', **code**.
 *
 * The delimiters must bracket the name itself, not merely contain it. That is
 * deliberate and it is not the general "span whose content is a domain" it
 * replaced: a corpus this full of `code_files` and `_o_` markers turns a
 * generic `_..._` or `'...'` span into something that swallows the rest of the
 * line, and measured that way the detector LOST the definition site's own
 * `counted_by` line. Bracketing the name has no such failure mode.
 *
 * Bare words are deliberately not matched — see `REACH.holes` for the measured
 * cost of matching them.
 */
const DOMAIN_LITERAL_RE = new RegExp(
  `(\`|"|')(${DOMAINS.join("|")})\\1|\\*\\*(${DOMAINS.join("|")})\\*\\*`,
  "g",
);

function domainLiteralsIn(line: string): Set<Domain> {
  const out = new Set<Domain>();
  DOMAIN_LITERAL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = DOMAIN_LITERAL_RE.exec(line)) !== null) out.add((m[2] ?? m[3]) as Domain);
  return out;
}

/**
 * The prose spelling of each input, mapped to the count it names. A line that
 * says "decisions" and one that says `decisions_count` name the same input, so
 * they collapse to one — two spellings of one count are not two inputs.
 */
const INPUT_PROSE: [RegExp, CountName][] = [
  [/\bcommits?\b/i, "commits"],
  [/\banalys[ei]s\b/i, "analyses_count"],
  [/\bissues?\b/i, "issues_count"],
  [/\bdecisions?\b/i, "decisions_count"],
  [/\b(?:code|source)[ -]files?\b/i, "code_files"],
  [/\bdata[ -]files?\b/i, "data_files"],
];

/** The cascade inputs a line names, by variable name or by prose spelling. */
export function inputsNamedIn(line: string): Set<CountName> {
  const out = new Set<CountName>();
  for (const name of COUNT_NAMES) {
    if (new RegExp(`(?<![A-Za-z0-9_])${name}(?![A-Za-z0-9_])`).test(line)) out.add(name);
  }
  for (const [re, name] of INPUT_PROSE) if (re.test(line)) out.add(name);
  return out;
}

export interface CascadeStatement {
  /** 1-based line number of the unit's FIRST line. */
  line: number;
  /** How many source lines the unit covers: 1, or 2 for a wrapped sentence. */
  span: number;
  /** The unit as written, trimmed; a 2-line unit is joined with one space. */
  text: string;
  domains: Domain[];
  inputs: CountName[];
}

/**
 * A line that OPENS a markdown block: a heading, a list item, a table row, a
 * blockquote, a fence, an HTML tag or comment, a link definition.
 *
 * A hard wrap never produces one, which is what makes this the cut between the
 * two cases. Joining a line to its continuation finds a sentence a 78-column
 * wrap split in half; joining a line to the next BLOCK would re-admit exactly
 * the per-domain lists and tables the two-input rule was chosen to leave alone
 * — measured on this tree, an unconditional two-line window selects
 * `agents/playmaker.md:111` and `agents/reconciler.md:135`, both of them
 * adjacent bullets of a legitimate per-domain list, and the continuation rule
 * selects neither.
 */
const BLOCK_START = /^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|\||>|```|~~~|<!--|<[A-Za-z/]|\[[^\]]+\]:)/;
const FENCE_LINE = /^\s*(?:```|~~~)/;

export interface StatementUnit {
  line: number;
  span: number;
  text: string;
}

/**
 * The units a statement is looked for in: every line on its own, then every
 * line joined to its continuation. Fenced regions are joined by nobody — a
 * fenced copy is `cascadeBlocks()`'s job and joining two branch lines there
 * would report the same block twice.
 */
export function statementUnits(markdown: string): StatementUnit[] {
  const lines = markdown.split("\n");
  const out: StatementUnit[] = lines.map((text, i) => ({ line: i + 1, span: 1, text }));

  let inFence = false;
  const fenced = lines.map((l) => {
    if (FENCE_LINE.test(l)) {
      inFence = !inFence;
      return true;
    }
    return inFence;
  });

  for (let i = 0; i + 1 < lines.length; i++) {
    const a = lines[i];
    const b = lines[i + 1];
    if (fenced[i] || fenced[i + 1]) continue;
    if (!a.trim() || !b.trim()) continue;
    if (/^\s*\|/.test(a)) continue;
    if (BLOCK_START.test(b)) continue;
    out.push({ line: i + 1, span: 2, text: `${a} ${b}` });
  }
  return out;
}

/**
 * Every unit of `markdown` that states the cascade rather than consuming it.
 *
 * Single lines are considered before wrapped pairs, and a pair is dropped when
 * either of its two lines already reported on its own. So a statement that fits
 * on one line is reported once — never again as the head of the pair below it,
 * and never again as the tail of the pair above it.
 */
export function findCascadeStatements(markdown: string): CascadeStatement[] {
  const out: CascadeStatement[] = [];
  const reported = new Set<number>();
  for (const u of statementUnits(markdown)) {
    if (reported.has(u.line)) continue;
    if (u.span > 1 && reported.has(u.line + 1)) continue;
    const domains = domainLiteralsIn(u.text);
    if (domains.size < 2) continue;
    const inputs = inputsNamedIn(u.text);
    if (inputs.size < 2) continue;
    reported.add(u.line);
    out.push({
      line: u.line,
      span: u.span,
      text: u.text.trim(),
      domains: [...domains],
      inputs: [...inputs],
    });
  }
  return out.sort((x, y) => x.line - y.line);
}

// --- the reach claim, as data ----------------------------------------------

/** One line of the reach claim, with the probes that keep it true. */
export interface ReachCase {
  /** The claim as a reader meets it, in `README-hooks.md` and here. */
  claim: string;
  /** Texts the claim is asserted against. Covered probes fire; holes do not. */
  probes: readonly string[];
  /**
   * For a hole left open on cost: what closing it would select across the
   * scanned set, outside the definition site. Both numbers are re-measured by
   * the suite and rendered into the README by `describeReach()`, because a
   * count is the one part of a claim that can be checked mechanically and this
   * project's counts are where its claims have slipped.
   */
  cost?: { readonly widening: string; readonly singleLine: number; readonly withWindow: number };
}

/** A path the gate does not read, and what reading it would yield today. */
export interface ReachExclusion {
  /** Path or glob, relative to the plugin root. */
  glob: string;
  /** Measured, not assumed: does the gate select anything in these files? */
  measured: "clean" | "fires";
  /** Why it is out of the scanned set, in terms the measurement supports. */
  note: string;
}

/**
 * What the reach gate scans, catches, misses, and leaves out — the single
 * authoring home for all four. Every field is checked in
 * `domain-cascade.test.ts`: `fileSet` is what the gate actually enumerates,
 * each `covered` probe must fire, each `holes` probe must not, each `excluded`
 * glob must measure what it claims, and `README-hooks.md` must carry
 * `describeReach()` verbatim.
 */
export const REACH = {
  fileSet: ["agents/*.md", "skills/*/SKILL.md", "rules/*.md"],

  covered: [
    {
      claim:
        "A domain name in backticks, double quotes, single quotes or asterisk bold. Four " +
        "spellings, because the second copy that shipped backticked its four by its author's " +
        "habit and nothing in this project requires that; `agents/taskplanner.md:127` writes " +
        "them bare.",
      probes: [
        "Use `strategic` when open decisions outnumber open issues, otherwise `code`.",
        'Use "strategic" when open decisions outnumber open issues, otherwise "code".',
        "Use 'strategic' when open decisions outnumber open issues, otherwise 'code'.",
        "Use **strategic** when open decisions outnumber open issues, otherwise **code**.",
      ],
    },
    {
      claim:
        "A paraphrase naming the counts in prose — decisions, issues, analyses, commits, code " +
        "files, data files — rather than by variable name.",
      probes: [
        "Pick `strategic` when open decisions outnumber open issues, `knowledge` when analyses " +
          "exist without source, `data` when data files dominate, otherwise `code`.",
      ],
    },
    {
      claim: "A paraphrase written with the cascade's own variable names.",
      probes: [
        "`strategic` if decisions_count >= issues_count, else `knowledge` if analyses_count > 0 " +
          "and code_files == 0, else `code`.",
      ],
    },
    {
      claim:
        "A two-branch fragment. Two outcomes and two of the counts they are decided from is " +
        "already a decision procedure, whether or not all four domains appear.",
      probes: [
        "Use `strategic` if the workbench has more open decisions than issues; otherwise `code`.",
      ],
    },
    {
      claim:
        "One sentence hard-wrapped across two lines. A line and its continuation are scanned " +
        "joined, which is the shape this repository's own 78-column prose produces by default.",
      probes: [
        "Pick `strategic` when open decisions outnumber open issues,\n" +
          "and `code` otherwise (measured on decisions_count and issues_count).",
      ],
    },
  ] as const satisfies readonly ReachCase[],

  holes: [
    {
      claim:
        "A domain name written as a plain word, with no markup around it. This is the plainest " +
        "second copy anyone would write and it is NOT caught. Matching bare words was measured " +
        "over the scanned set and rejected on cost, because `code` and `data` are ordinary " +
        "English words in these files and `code files` is both a domain name and an input " +
        "phrase.",
      probes: [
        "Detect the workbench domain: strategic if decisions dominate, knowledge if analyses " +
          "exist with no code, data if data files dominate, else code.",
      ],
      cost: { widening: "matching bare words", singleLine: 13, withWindow: 13 },
    },
    {
      claim:
        "A paraphrase spread across the rows of a table, or across three or more wrapped lines. " +
        "A table row and a list item each open a block and are never joined to the line above " +
        "them, and the window is two lines wide.",
      probes: [
        "| domain | when |\n|---|---|\n| `strategic` | open decisions outnumber open issues |\n" +
          "| `code` | the tree holds source files |",
        "Pick `strategic` when open decisions\noutnumber open issues, and otherwise\nfall back to `code`.",
      ],
    },
    {
      claim:
        "A paraphrase naming no input. It names no evidence, so it restates less than the " +
        "cascade decides.",
      probes: ["`strategic` for planning work, else `code`."],
    },
    {
      claim:
        "A paraphrase naming its inputs in words the prose list does not carry. The list is six " +
        "spellings, not a synonym set.",
      probes: ["`strategic` when open questions outnumber defects, otherwise `code`."],
    },
  ] as const satisfies readonly ReachCase[],

  excluded: [
    {
      glob: "docs/*.md",
      measured: "fires",
      note:
        "`docs/philosophy.md:19` says what each domain PRIORITISES, in a line shape-identical " +
        "to a paraphrase. Scanning `docs/` means either that false positive or an exemption " +
        "list, so it is left out on a measured cost rather than on a definition of who a " +
        "consumer is.",
    },
    {
      glob: "CLAUDE.md",
      measured: "clean",
      note:
        "A consumer by the same contract that puts `rules/` in the file set, and it is not " +
        "scanned. That is an uncovered file, not a justified exclusion: it is clean today and " +
        "nothing keeps it clean.",
    },
    {
      glob: "README-hooks.md",
      measured: "clean",
      note:
        "Documentation about the gate, including this block. Not scanned, and it would be " +
        "wrong to scan the file whose job is to quote the claim.",
    },
  ] as const satisfies readonly ReachExclusion[],
} as const;

/**
 * The reach claim rendered as the markdown block `README-hooks.md` carries.
 * The test compares the file against this, so the two cannot drift.
 */
export function describeReach(): string {
  const bullets = (cases: readonly ReachCase[]): string =>
    cases
      .map((c) => {
        const cost = c.cost
          ? ` Measured cost of ${c.cost.widening}, across the scanned set and outside the ` +
            `definition site: ${c.cost.singleLine} lines of honest prose selected on single ` +
            `lines, ${c.cost.withWindow} with the continuation window. The suite re-measures ` +
            `both numbers.`
          : "";
        return `- ${c.claim}${cost}`;
      })
      .join("\n");
  return [
    `**Scanned:** ${REACH.fileSet.map((g) => `\`${g}\``).join(", ")} — every agent prompt, ` +
      `every skill body, every rule file. Exactly one of them may state the cascade.`,
    "",
    "**Caught.** Each line is asserted against probes in `domain-cascade.test.ts`:",
    "",
    bullets(REACH.covered),
    "",
    "**Not caught.** Each line is asserted to still be a miss, so closing one of these turns " +
      "the suite red until this list is corrected:",
    "",
    bullets(REACH.holes),
    "",
    "**Not scanned**, with what running the gate over it yields today:",
    "",
    REACH.excluded.map((e) => `- \`${e.glob}\` — ${e.measured}. ${e.note}`).join("\n"),
  ].join("\n");
}
