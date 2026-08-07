/**
 * Shell parsing primitives for the guard's git branch policy.
 *
 * These functions used to live in `git-branch-guard.ts`. They are generic —
 * nothing about blanking a heredoc body or splitting on `&&` is git-specific —
 * and a second classifier consumed them for a while, so a module named for git
 * should not own the lexer. That second consumer is gone; the lexer stays here,
 * because the split is what keeps the git policy free of lexing detail and its
 * suite able to test the two apart.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 *
 * ## One quote mode: data is blanked
 *
 * A single-quoted region is replaced by spaces, because `echo 'git switch main'`
 * is inert prose and its content must not be read as a command. So is a
 * quoted-delimiter heredoc body — data a command reads, never a command.
 * Regions where bash DOES expand (a double-quoted span carrying `$`, a
 * backtick or an escape; an unquoted-delimiter heredoc body) are preserved
 * verbatim, so a real hidden command still gets classified. That is the
 * fail-closed direction and it must not flip.
 *
 * There used to be a second, opposite mode. A retired mutation classifier
 * needed a single-quoted region kept as an ordinary path (`mv 'rules/x.md'
 * /tmp/`) rather than erased, so the parser took the mode as a parameter and
 * minted placeholder tokens for the captured literals. Nothing needs that
 * reading any more, and the parameter, the placeholders and the ordered,
 * depth-tagged parse built on top of them are gone with it. What survives is
 * the flat blank-mode path the git policy has always used, byte for byte.
 *
 * `resolveWord` still takes a literal table, and it is still the seam that mode
 * was threaded through. The git policy passes an empty map (`NO_LITERALS` in
 * `git-branch-guard.ts`), which is the whole of it today.
 *
 * A `$(…)` / backtick body is lifted out into its own segment, because it runs
 * as its own command, and a single space is left where it stood. The git policy
 * asks only which commands run, and a substitution's VALUE is never one of them.
 */

/**
 * Segment separator used by the flat legacy segmenter. NUL cannot appear in a
 * shell command string an agent actually typed, so it is safe as a sentinel.
 */
const SEGMENT_SENTINEL = "\u0000";

/**
 * Matches a placeholder token anywhere inside a word — the shape the retired
 * capture mode minted for a quoted literal. Nothing in this module mints one any
 * more; `resolveWord` still recognises it, because its `literals` parameter is
 * the seam a caller supplies its own table through.
 */
const PLACEHOLDER_RE = /\u0001q\d+\u0001/g;

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
 *   - double-quoted strings that carry `$`, a backtick or an escape:
 *                                        "… `git switch` …"   (bash substitutes)
 *   - unquoted-delimiter heredoc bodies: <<EOF … EOF          (bash expands body)
 *
 * Removed content is replaced with spaces; newlines are kept so surrounding
 * token boundaries survive. Parsing is fail-closed on ambiguity: an
 * unterminated quote, or a heredoc whose terminator never appears, leaves the
 * remainder AS-IS (treated as code) rather than silently dropping it — matching
 * this module's over-segment-not-under bias.
 *
 * This is also where a `\`-at-end-of-line CONTINUATION is removed, because bash
 * removes it in the same pre-tokenization pass that gives quoting its meaning:
 * it is spliced out in code position and inside double quotes, and left alone
 * inside single quotes (which suppress the escape) and inside a heredoc body
 * (data, consumed whole a few branches down, never reinterpreted here).
 *
 * Known conservative limitation: a single-quoted string nested inside a
 * double-quoted `$(…)` (e.g. `"$(echo 'x')"`) is not blanked, because the
 * double-quoted span is copied verbatim without re-entering quote tracking.
 * That errs toward DENY (data treated as code), never toward a missed switch.
 */
function stripData(command: string): string {
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
      out += "'" + blankData(body) + "'";
      i = close + 1;
      continue;
    }

    // Double-quoted string. Scanned as one verbatim unit so an inner `'` or
    // `<<` is not misread as a single-quote / heredoc opener, honouring
    // backslash escapes. It stays CODE: bash expands there, so a hidden
    // `$(git switch main)` has to reach the classifier.
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
      // Re-emitted with its quotes, byte-identical to the source when it holds
      // no line continuation. A retired mode captured an expansion-free span as
      // data here, so a `>` in a commit message was not read as a redirection;
      // that reading belonged to the mutation classifier, which is gone, and
      // this path is what it always was for the git policy.
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
 * bodies) so only executable code reaches the segmenter. The entry point the
 * git classifier and its suite consume, kept under its original name and
 * behaviour.
 */
export function stripDataRegions(command: string): string {
  return stripData(command);
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
 * An ordered, depth-tagged parser used to sit beside it for a consumer that
 * needed a virtual-cwd walk; it is gone, and this is the only segmenter now.
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

/**
 * Remove the parentheses of a `(…)` SUBSHELL from one word.
 *
 * The segmenter models `$(…)` and backticks but NOT the plain `(…)` subshell:
 * its parentheses are ordinary characters in the segment text, so they arrive
 * glued to the words they touch — `(rm rules/x.md)` is `["(rm", "rules/x.md)"]`.
 * Glued that way neither the command word nor the operand is recognisable, and
 * every classifier reading these tokens was blind to the command inside:
 * `(rm rules/x.md)` and `(git switch main)` both ran.
 *
 * The strip is unconditional, because a parenthesis in CODE position is
 * grammar. A filename that genuinely contains one has to be quoted — and a
 * quoted region is blanked before it ever reaches here — or backslash-escaped,
 * where the paren is lost; that can only ever SHORTEN a word, and a shorter
 * word cannot match a protected pattern a longer one did not, so it costs no
 * allow and buys no false deny.
 */
function stripSubshellParens(token: string): string {
  return token.replace(/^\(+/, "").replace(/\)+$/, "");
}

/**
 * Tokenize a single segment into whitespace-separated words, with the
 * parentheses of a `(…)` subshell removed (`stripSubshellParens`). A word that
 * was NOTHING but parentheses disappears, which is what the spaced form
 * `( rm x )` should leave behind.
 *
 * The strip lives here rather than in the classifier because it is a lexing
 * question, not a policy one. It leaves the SEGMENTER untouched, which is what
 * keeps the change contained: the segmentation is still byte-for-byte what it
 * always was.
 */
export function tokenize(segment: string): string[] {
  return segment
    .trim()
    .split(/\s+/)
    .map(stripSubshellParens)
    .filter((t) => t.length > 0);
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
 * `"plain.txt"` resolves to `plain.txt`, and a backslash escape in code
 * position is removed the way bash removes it, so `\rm` resolves to `rm`. That
 * second one is load-bearing for the CALLER'S command word: an unprocessed
 * escape does not merely shorten a path there, it renames the program out of
 * whatever table the caller is about to consult.
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
    // Bash removes a backslash in code position and takes the next character
    // literally, so `\rm` denotes `rm` and `x\)` denotes `x)`. A lone trailing
    // backslash escapes nothing and survives.
    //
    // ORDER IS PINNED: the unescape runs AFTER the expansion test above, never
    // before. `\$FOO` is a literal `$FOO` to bash, and the test has already
    // reported the word unresolved by the time the escape is removed — an
    // over-block, which is the safe direction. Unescaping first would hand the
    // test a word with no `$` left in it and turn a fail-closed deny into an
    // allow, which is the direction that costs an allow rather than a deny.
    value += part.text.replace(/\\(.)/g, "$1").replace(/"/g, "");
  }

  return { value };
}
