/**
 * Shell parsing primitives shared by the guard's classifiers.
 *
 * These functions used to live in `git-branch-guard.ts`. They are generic —
 * nothing about blanking a heredoc body or splitting on `&&` is git-specific —
 * and a second classifier (`bash-mutation-guard.ts`) consumes them, so a module
 * named for git should not own the lexer its sibling depends on.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 *
 * ## Two quote modes
 *
 * The git classifier and the mutation classifier need OPPOSITE treatment of a
 * single-quoted region, so `parseCommand` takes the mode as a parameter:
 *
 *   - `"blank"` — a single-quoted body is replaced by spaces. Correct for the
 *     git classifier, where `echo 'git switch main'` is inert prose and the
 *     content must not be read as a command. This is the historical behaviour
 *     of `stripDataRegions`, preserved byte-for-byte.
 *
 *   - `"capture"` — a single-quoted region (quotes included) is replaced by an
 *     opaque placeholder token and the literal text is recorded in a side
 *     table. Correct for the mutation classifier, where `mv 'rules/x.md' /tmp/`
 *     carries an ordinary path that blanking would destroy.
 *
 * Capture mode keeps quoted content INERT by construction rather than by
 * blanking: the placeholder contains no whitespace and no shell operator, so
 * `echo 'mv rules/x.md /tmp'` tokenizes to exactly two words and `mv` is never
 * in command position. A placeholder can only ever REDUCE segmentation, never
 * introduce a segment or a command word that blanking would have hidden.
 *
 * Quoted-delimiter heredoc bodies stay blanked in BOTH modes. They are data
 * that a command reads, never an operand that a command writes.
 *
 * ## What a lifted command substitution leaves behind
 *
 * A `$(…)` / backtick body is lifted out into its own segment, because it runs
 * as its own command. What lands in the OUTER segment at run time is the
 * substitution's VALUE, and the two modes want that value described
 * differently:
 *
 *   - `"blank"` — a single space, so the outer segmentation is exactly what it
 *     has always been. The git classifier asks only which commands run, and the
 *     substitution's value is never one of them.
 *
 *   - `"capture"` — `SUBSTITUTION_FILLER`, a token carrying a `$` so that
 *     `resolveWord` reports it `{ unresolved: true }`. A consumer enforcing a
 *     fail-closed rule needs the operand to still BE there and be unknowable;
 *     with a space it vanished instead, and `rm $(echo rules/x.md)` reached the
 *     mutation classifier as a bare `rm` with no operands while `rm $VAR`
 *     denied. The filler glues to its neighbours exactly as the value would, so
 *     `"$(pwd)/build"` stays one word.
 */

/**
 * Segment separator used by the flat legacy segmenter. NUL cannot appear in a
 * shell command string an agent actually typed, so it is safe as a sentinel.
 */
const SEGMENT_SENTINEL = "\u0000";

/**
 * Wrapper character for capture-mode placeholders. Chosen because it is not
 * whitespace, not a shell operator, not `=` (so a placeholder can never look
 * like a leading `VAR=value` env assignment), and not the segment sentinel.
 */
const PLACEHOLDER_CHAR = "\u0001";

/** Matches a capture-mode placeholder token anywhere inside a word. */
const PLACEHOLDER_RE = /\u0001q\d+\u0001/g;

/**
 * What a lifted `$(…)` / backtick substitution leaves in the outer segment in
 * CAPTURE mode. It must contain a `$` (so `resolveWord` reports it unresolved),
 * no whitespace (so it glues to its neighbours the way the substitution's value
 * would), no segment operator, and no `=` (so it can never read as a leading
 * `VAR=value` assignment) — and it has to stay readable when a deny reason
 * quotes the segment back at a human. Blank mode keeps the historical space.
 */
const SUBSTITUTION_FILLER = "$(…)";

/** How `parseCommand` treats single-quoted regions. */
export type QuotedMode = "blank" | "capture";

export interface ParseOptions {
  quoted: QuotedMode;
}

export interface ParsedSegment {
  /** The segment's text, trimmed. Carries placeholders in capture mode. */
  text: string;
  /** 0 = outer command, >= 1 = body of a `$(…)` / backtick subshell. */
  depth: number;
}

export interface ParsedCommand {
  /** Segments in SOURCE ORDER (by their start offset in the command). */
  segments: ParsedSegment[];
  /** Placeholder token -> the single-quoted literal it stands for. Empty in blank mode. */
  literals: Map<string, string>;
}

/**
 * The outcome of resolving one word to a static literal.
 * `{ value }` when the word is knowable without running the shell,
 * `{ unresolved: true }` when it is not (expansion, substitution, `~`).
 */
export type ResolvedWord =
  | { value: string; unresolved?: undefined }
  | { value?: undefined; unresolved: true };

/**
 * Blank every non-newline character of a string (newlines survive so line and
 * token boundaries in the surrounding command are preserved).
 */
function blankData(s: string): string {
  return s.replace(/[^\n]/g, " ");
}

/**
 * Find the start index of a heredoc's terminator line at or after `from`.
 * The terminator is a line equal to `delim` (for a `<<-` heredoc, leading tabs
 * are stripped before the comparison, matching bash). Returns -1 when the
 * delimiter never reappears — the caller treats that as "not a data region"
 * and leaves the text as code (fail-closed).
 */
function findHeredocTerminator(
  command: string,
  from: number,
  hd: { delim: string; dash: boolean },
): number {
  const n = command.length;
  let pos = from;
  for (;;) {
    let lineEnd = command.indexOf("\n", pos);
    if (lineEnd === -1) lineEnd = n;
    const line = command.slice(pos, lineEnd);
    const forMatch = hd.dash ? line.replace(/^\t+/, "") : line;
    if (forMatch === hd.delim) return pos;
    if (lineEnd === n) return -1; // no more lines, terminator never seen
    pos = lineEnd + 1;
  }
}

/** Mint a placeholder for a single-quoted literal and record it. */
function capture(literal: string, literals: Map<string, string>): string {
  const token = `${PLACEHOLDER_CHAR}q${literals.size}${PLACEHOLDER_CHAR}`;
  literals.set(token, literal);
  return token;
}

/**
 * Handle shell *data regions* so that the substitution recursion and operator
 * segmentation which follow only ever classify executable *code*. Bash performs
 * NO expansion or command substitution in these regions, so a git-looking
 * string inside them is inert text, never a command:
 *
 *   - single-quoted strings:             '… `git switch` …'
 *   - quoted-delimiter heredoc bodies:   <<'EOF' … EOF   and   <<"EOF" … EOF
 *
 * Regions where bash DOES expand `$(…)` / backticks are preserved verbatim so
 * a real hidden command still gets classified (this is what keeps the guard
 * fail-closed):
 *
 *   - double-quoted strings:             "… `git switch` …"   (bash substitutes)
 *   - unquoted-delimiter heredoc bodies: <<EOF … EOF          (bash expands body)
 *
 * In `"blank"` mode removed content is replaced with spaces; newlines are kept
 * so surrounding token boundaries survive. In `"capture"` mode a single-quoted
 * region is replaced by a placeholder instead (heredoc bodies are still
 * blanked). Parsing is fail-closed on ambiguity: an unterminated quote, or a
 * heredoc whose terminator never appears, leaves the remainder AS-IS (treated
 * as code) rather than silently dropping it — matching this module's
 * over-segment-not-under bias.
 *
 * This is also where a `\`-at-end-of-line CONTINUATION is removed, because bash
 * removes it in the same pre-tokenization pass that gives quoting its meaning:
 * it is spliced out in code position and inside double quotes, and left alone
 * inside single quotes (which suppress the escape) and inside a heredoc body
 * (data, consumed whole a few branches down, never reinterpreted here).
 *
 * Known conservative limitation: a single-quoted string nested inside a
 * double-quoted `$(…)` (e.g. `"$(echo 'x')"`) is not blanked or captured,
 * because the double-quoted span is copied verbatim without re-entering quote
 * tracking. That errs toward DENY (data treated as code), never toward a
 * missed switch.
 */
function stripData(
  command: string,
  mode: QuotedMode,
  literals: Map<string, string>,
): string {
  const n = command.length;
  let out = "";
  let i = 0;

  // Heredocs whose body has not yet been consumed, in declaration order.
  let pending: { delim: string; dash: boolean; strip: boolean }[] = [];

  while (i < n) {
    const ch = command[i];

    // Backslash escape in code context.
    if (ch === "\\" && i + 1 < n) {
      // `\` + newline is a LINE CONTINUATION. Bash removes both characters
      // before tokenizing, so the two lines become ONE logical line with no
      // separator at all (`rm \<nl>x` is `rm x`; `rm\<nl>x` is `rmx`).
      // Emitting nothing reproduces that. Passing the pair through instead
      // left the newline for the segmenter, which terminates a command on it
      // — so everything after a continuation stopped being an operand of the
      // verb before it, and `git worktree \<nl>add ../wt x` reached the git
      // classifier as a bare `git worktree`.
      if (command[i + 1] === "\n") {
        i += 2;
        continue;
      }
      // Any other escape pair is emitted verbatim. Consuming the pair here is
      // also what keeps the `\\` boundary right: in `\\<nl>` the two
      // backslashes are taken together as an escaped backslash, so the
      // newline that follows is a real command terminator, not a
      // continuation.
      out += command[i] + command[i + 1];
      i += 2;
      continue;
    }

    // Single-quoted string → data. Look ahead for the close; unterminated =
    // fail-closed (emit the remainder as code).
    if (ch === "'") {
      const close = command.indexOf("'", i + 1);
      if (close === -1) {
        out += command.slice(i);
        break;
      }
      const body = command.slice(i + 1, close);
      out +=
        mode === "capture"
          ? capture(body, literals)
          : "'" + blankData(body) + "'";
      i = close + 1;
      continue;
    }

    // Double-quoted string → code (bash expands `$(…)` and backticks inside).
    // Skip past it as one verbatim unit so an inner `'` or `<<` is not misread
    // as a single-quote / heredoc opener. Honour backslash escapes.
    if (ch === '"') {
      let j = i + 1;
      let body = "";
      let closed = false;
      while (j < n) {
        if (command[j] === "\\" && j + 1 < n) {
          // A line continuation is spliced out inside double quotes too —
          // bash removes it there exactly as in code position. (Single quotes
          // are the one place it stays literal, and a single-quoted region
          // never reaches this loop: it is consumed whole by the branch
          // below.) Every other escape pair is copied verbatim, so the span
          // is byte-identical to the source when it holds no continuation.
          if (command[j + 1] !== "\n") body += command[j] + command[j + 1];
          j += 2;
          continue;
        }
        if (command[j] === '"') {
          closed = true;
          break;
        }
        body += command[j];
        j++;
      }
      if (!closed) {
        out += command.slice(i); // unterminated → treat rest as code
        break;
      }
      out += '"' + body + '"';
      i = j + 1;
      continue;
    }

    // Here-string `<<<` is NOT a heredoc — bash expands its word. Leave as code.
    if (
      ch === "<" &&
      command[i + 1] === "<" &&
      command[i + 2] === "<"
    ) {
      out += "<<<";
      i += 3;
      continue;
    }

    // Heredoc redirect `<<[-] DELIM`. Parse the delimiter; a quoted (or
    // backslash-escaped) delimiter suppresses expansion in the body → data.
    if (ch === "<" && command[i + 1] === "<") {
      let j = i + 2;
      let dash = false;
      if (command[j] === "-") {
        dash = true;
        j++;
      }
      while (j < n && (command[j] === " " || command[j] === "\t")) j++;
      let quoted = false;
      let delim = "";
      const q = command[j];
      if (q === "'" || q === '"') {
        quoted = true;
        j++;
        while (j < n && command[j] !== q) {
          delim += command[j];
          j++;
        }
        if (j < n) j++; // consume the closing quote
      } else if (q === "\\") {
        quoted = true; // `\EOF` also suppresses expansion in bash
        j++;
        while (j < n && /[A-Za-z0-9_]/.test(command[j])) {
          delim += command[j];
          j++;
        }
      } else {
        while (j < n && /[A-Za-z0-9_]/.test(command[j])) {
          delim += command[j];
          j++;
        }
      }
      if (delim.length > 0) {
        pending.push({ delim, dash, strip: quoted });
        out += "<<"; // inert marker; the delimiter word itself is dropped
        i = j;
        continue;
      }
      // Not a real delimiter → emit a single `<` and advance.
      out += ch;
      i++;
      continue;
    }

    // End of a redirect line: consume the bodies of any pending heredocs.
    if (ch === "\n" && pending.length > 0) {
      out += "\n";
      i++;
      let bailed = false;
      for (const hd of pending) {
        const term = findHeredocTerminator(command, i, hd);
        if (term === -1) {
          // Terminator never appears → fail-closed: rest is code.
          out += command.slice(i);
          i = n;
          bailed = true;
          break;
        }
        const body = command.slice(i, term);
        // A quoted-delimiter body is data in BOTH modes: it is what a command
        // reads, never a path a command writes.
        out += hd.strip ? blankData(body) : body;
        let termEnd = command.indexOf("\n", term);
        if (termEnd === -1) termEnd = n;
        out += command.slice(term, termEnd); // terminator line is inert code
        if (termEnd < n) {
          out += "\n";
          i = termEnd + 1;
        } else {
          i = n;
        }
      }
      pending = [];
      if (bailed) break;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/**
 * Blank shell data regions (single-quoted strings, quoted-delimiter heredoc
 * bodies) so only executable code reaches the segmenter. The historical
 * entry point, kept under its original name and behaviour for the git
 * classifier and its suite. New consumers want `parseCommand`.
 */
export function stripDataRegions(command: string): string {
  return stripData(command, "blank", new Map());
}

/**
 * Split a command string into the segments that each run as their own command.
 * Segments on `;`, `&&`, `||`, `|`, `&` and newlines. Also recursively inspects
 * the *contents* of `$(...)` and backtick subshells (their inner commands run
 * too).
 *
 * This is a deliberately conservative lexer: it does not try to be a full
 * shell parser. It over-segments rather than under-segments, which is the
 * fail-closed direction.
 *
 * NOTE: callers that start from a raw Bash command string should pass it
 * through `stripDataRegions()` first (as `classifyGitCommand` does) so that
 * inert data regions — single-quoted strings and quoted-delimiter heredoc
 * bodies — do not get mis-parsed as command substitution.
 *
 * This is the FLAT, unordered form: subshell bodies come back ahead of the
 * outer segments they were lifted out of, and nesting depth is lost. It is
 * retained verbatim as the git classifier's segmenter — that classifier only
 * asks whether ANY segment denies, so order and depth are invisible to it, and
 * leaving it untouched is what makes the extraction provably behaviour-neutral.
 * `parseCommand` re-derives the same segments in source order with depth; a
 * unit test pins the two against each other. A consumer that needs order or
 * depth (a virtual-cwd walk, for one) must use `parseCommand`.
 */
export function extractCommandSegments(command: string): string[] {
  const segments: string[] = [];

  // Recursively pull out subshell bodies ($(...) and `...`), classify their
  // inner commands too, and strip them from the outer string so the outer
  // segmentation is not confused by operators inside the subshell.
  let outer = command;

  // $(...) — handle nesting by scanning for balanced parens.
  let guard = 0;
  for (;;) {
    if (guard++ > 1000) break; // pathological input — stop (outer still segmented)
    const start = outer.indexOf("$(");
    if (start === -1) break;
    let depth = 0;
    let end = -1;
    for (let i = start + 1; i < outer.length; i++) {
      const ch = outer[i];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) {
      // Unbalanced — treat the rest as subshell body (fail-closed) and stop.
      const body = outer.slice(start + 2);
      segments.push(...extractCommandSegments(body));
      outer = outer.slice(0, start);
      break;
    }
    const body = outer.slice(start + 2, end);
    segments.push(...extractCommandSegments(body));
    outer = outer.slice(0, start) + " " + outer.slice(end + 1);
  }

  // Backtick subshells `...`
  const backtickParts = outer.split("`");
  if (backtickParts.length >= 3) {
    // Odd indices are subshell bodies.
    for (let i = 1; i < backtickParts.length; i += 2) {
      segments.push(...extractCommandSegments(backtickParts[i]));
    }
    // Outer is everything outside the backticks, joined with spaces.
    outer = backtickParts.filter((_, i) => i % 2 === 0).join(" ");
  }

  // Split the (subshell-stripped) outer string on the segment operators.
  // Replace each operator with a sentinel, then split.
  const SENTINEL = SEGMENT_SENTINEL;
  const flattened = outer
    .replace(/\|\|/g, SENTINEL)
    .replace(/&&/g, SENTINEL)
    .replace(/;/g, SENTINEL)
    .replace(/\|/g, SENTINEL)
    .replace(/&/g, SENTINEL)
    // A newline is a command terminator in shell too, so it separates
    // segments. This is what makes a fail-closed (retained-as-code) heredoc
    // body classify on its own line rather than being shadowed by the
    // `cat`/redirect command that opened the heredoc.
    .replace(/[\r\n]+/g, SENTINEL);

  for (const part of flattened.split(SENTINEL)) {
    const trimmed = part.trim();
    if (trimmed) segments.push(trimmed);
  }

  return segments;
}

/** Tokenize a single segment into whitespace-separated words. */
export function tokenize(segment: string): string[] {
  return segment.trim().split(/\s+/).filter((t) => t.length > 0);
}

/** A segment plus where it started, so the caller can restore source order. */
interface LocatedSegment extends ParsedSegment {
  /** Offset of the segment's first non-blank character in the prepared string. */
  start: number;
}

/** Index of the `)` closing the `(` at `openIdx`, or -1 when unbalanced. */
function findBalancedParen(text: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Walk `text` left to right, emitting one segment per `;` / `&&` / `||` / `|` /
 * `&` / newline-separated run and recursing into `$(…)` and backtick subshell
 * bodies at `depth + 1`. Every segment records its absolute start offset (via
 * `base`) so the caller can sort the whole tree back into source order.
 *
 * The operator set and the trim-and-drop-empties rule mirror
 * `extractCommandSegments` exactly; only the ORDER, the added depth and the
 * `filler` left in place of a lifted subshell differ. Passing `" "` as the
 * filler reproduces the flat segmenter exactly, which is what blank mode does.
 * One deliberate divergence: an unterminated backtick makes the remainder a
 * subshell body here (fail-closed, matching how an unbalanced `$(` is already
 * treated), where the flat segmenter leaves a lone backtick as literal text.
 */
function scanSegments(
  text: string,
  depth: number,
  base: number,
  out: LocatedSegment[],
  filler: string,
): void {
  const n = text.length;
  let cur = "";
  let curStart = -1;
  let i = 0;

  const push = (s: string, at: number): void => {
    if (curStart === -1 && s.trim().length > 0) curStart = base + at;
    cur += s;
  };
  const flush = (): void => {
    const trimmed = cur.trim();
    if (trimmed.length > 0) out.push({ text: trimmed, depth, start: curStart });
    cur = "";
    curStart = -1;
  };

  while (i < n) {
    const ch = text[i];

    // `$(…)` command substitution — the body runs as its own command.
    if (ch === "$" && text[i + 1] === "(") {
      const end = findBalancedParen(text, i + 1);
      const bodyStart = i + 2;
      const body = end === -1 ? text.slice(bodyStart) : text.slice(bodyStart, end);
      scanSegments(body, depth + 1, base + bodyStart, out, filler);
      push(filler, i); // the substitution's VALUE, not its text, lands here
      i = end === -1 ? n : end + 1;
      continue;
    }

    // Backtick command substitution — same, with the older syntax.
    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      const bodyStart = i + 1;
      const body = close === -1 ? text.slice(bodyStart) : text.slice(bodyStart, close);
      scanSegments(body, depth + 1, base + bodyStart, out, filler);
      push(filler, i);
      i = close === -1 ? n : close + 1;
      continue;
    }

    // Segment operators. `||` and `&&` need no special case: the second
    // character simply flushes an already-empty segment, which is dropped.
    if (ch === ";" || ch === "|" || ch === "&") {
      flush();
      i++;
      continue;
    }

    // A newline terminates a command in shell too. Consume the whole run.
    if (ch === "\n" || ch === "\r") {
      flush();
      while (i < n && (text[i] === "\n" || text[i] === "\r")) i++;
      continue;
    }

    push(ch, i);
    i++;
  }

  flush();
}

/**
 * Parse a Bash command string into ordered, depth-tagged segments.
 *
 * `quoted: "blank"` reproduces `extractCommandSegments(stripDataRegions(cmd))`
 * — the same segments, now in source order and carrying their subshell depth.
 * `quoted: "capture"` additionally hands back the single-quoted literals, so a
 * consumer can read a quoted path as a path, and leaves an unresolvable filler
 * where a lifted `$(…)` stood instead of a space (see the module docstring).
 */
export function parseCommand(
  command: string,
  options: ParseOptions,
): ParsedCommand {
  const literals = new Map<string, string>();
  if (!command || command.trim().length === 0) return { segments: [], literals };

  // Defensive: a placeholder is only ever minted by `capture`, so a
  // PLACEHOLDER_CHAR arriving in the input cannot be allowed to forge one.
  // Blank mode is left byte-identical to the historical path.
  const source =
    options.quoted === "capture"
      ? command.split(PLACEHOLDER_CHAR).join(" ")
      : command;

  const prepared = stripData(source, options.quoted, literals);

  const located: LocatedSegment[] = [];
  scanSegments(
    prepared,
    0,
    0,
    located,
    options.quoted === "capture" ? SUBSTITUTION_FILLER : " ",
  );
  located.sort((a, b) => a.start - b.start);

  return {
    segments: located.map(({ text, depth }) => ({ text, depth })),
    literals,
  };
}

/**
 * Resolve one word from a parsed segment to the static literal it denotes.
 *
 * Reports `{ unresolved: true }` when the word's value cannot be known without
 * running the shell — it still contains `$` (parameter or arithmetic
 * expansion), a backtick (command substitution), or a leading `~` (home
 * expansion). A caller enforcing a fail-closed rule treats that as "could be
 * anything, including a protected path".
 *
 * Placeholders minted by capture mode expand to their literal text FIRST-CLASS:
 * `'$HOME'` was single-quoted, so it denotes a file literally named `$HOME` and
 * the `$` in it is not an expansion. Only characters that survived in CODE
 * position make a word unresolved.
 *
 * Surrounding double quotes are dropped when nothing inside them expands, so
 * `"plain.txt"` resolves to `plain.txt`.
 */
export function resolveWord(
  token: string,
  literals: Map<string, string>,
): ResolvedWord {
  if (token.length === 0) return { value: "" };

  // Split into placeholder / code parts so the checks below only ever look at
  // code — text the shell would still interpret.
  const parts: { code: boolean; text: string }[] = [];
  let last = 0;
  PLACEHOLDER_RE.lastIndex = 0;
  for (;;) {
    const m = PLACEHOLDER_RE.exec(token);
    if (m === null) break;
    if (m.index > last) parts.push({ code: true, text: token.slice(last, m.index) });
    parts.push({ code: false, text: literals.get(m[0]) ?? "" });
    last = m.index + m[0].length;
  }
  if (last < token.length) parts.push({ code: true, text: token.slice(last) });

  const first = parts[0];
  // A leading `~` expands to a home directory the guard cannot know.
  if (first !== undefined && first.code && first.text.startsWith("~")) {
    return { unresolved: true };
  }

  let value = "";
  for (const part of parts) {
    if (!part.code) {
      value += part.text;
      continue;
    }
    if (part.text.includes("$") || part.text.includes("`")) {
      return { unresolved: true };
    }
    // Nothing expands in what is left, so double quotes are pure syntax.
    value += part.text.replace(/"/g, "");
  }

  return { value };
}
