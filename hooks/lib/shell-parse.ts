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
 * is inert prose and its content must not be read as a command. So is a heredoc
 * body — data a command reads, never a command — under EITHER delimiter form,
 * with one exemption: an unquoted delimiter leaves bash performing command
 * substitution in the body, so every `$(…)` and backtick region there survives
 * the blanking in place and reaches the segmenter, which lifts it out as a
 * command of its own. Nothing else in such a body runs — a line reading `git
 * switch main` is written to the file, exactly as under a quoted delimiter — so
 * blanking around the substitutions costs no deny. A double-quoted span
 * carrying `$`, a backtick or an escape is preserved verbatim, whole. That is
 * the fail-closed direction and it must not flip.
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
 *
 * ## The second axis: spans bash does not tokenize
 *
 * Quoting is not the only thing that suspends bash's tokenizer. It reads a
 * family of spans as ONE unit and recognizes no operator inside them, and a
 * lexer that models only quotes will read an operator where bash reads none.
 * That cost a live deny→allow (`issues/260809-2044`): a `<<WORD` in a `#`
 * comment or in `$((a<<b))` was taken for a heredoc redirect, and the body
 * blanking that followed erased the real commands standing between the false
 * opener and the first line equal to the delimiter.
 *
 * The members, each confirmed against bash 3.2 by running the shape with the
 * blanked line replaced by `touch RAN` and checking the marker appeared:
 *
 *   - `# …` to end of line          — a comment
 *   - `$((…))` and `((…))`          — arithmetic expansion and command
 *   - `$[…]`                        — the deprecated arithmetic form
 *   - `${…}`                        — parameter expansion (carries `${a[i<<1]}`)
 *   - `name[…]=`                    — the subscript of an array assignment
 *
 * And the near-misses, checked so the next pass does not re-derive them: `x=1<<2`,
 * `let x=1<<2` and `echo a[1<<2]` really ARE heredoc redirects to bash, so the
 * lexer was right about all three and none of them is a member.
 *
 * These spans are emitted VERBATIM. Nothing new is blanked — a comment is left
 * where it stood rather than erased — so a span boundary this lexer guesses
 * wrong can only hand MORE text to the classifier, never less. That keeps the
 * bias where the rest of the module puts it: a mis-parse here costs a false
 * deny, which is an annoyance, and can never cost an allow on a line the shell
 * runs, which is the defect this section exists to prevent.
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
 * Index of the `close` that balances the `open` at index `from`, honouring
 * nesting. -1 when it is never balanced.
 *
 * The one bracket scan in this module. `findSubstitutionClose` is it with
 * `(`/`)` and the offset that skips a `$`, and `scanNonTokenizedSpan` is it with
 * the other three bracket pairs — so the extent a substitution has when
 * `blankHeredocBody` decides what survives, when `extractCommandSegments` lifts
 * it out, and when `stripData` steps over an arithmetic span is one extent by
 * construction rather than three that happen to agree.
 */
function findBalancedClose(
  s: string,
  from: number,
  open: string,
  close: string,
): number {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    const ch = s[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Index of the `)` that closes the `$(` starting at `open` (the index of the
 * `$`), honouring nesting. -1 when it is never closed.
 */
function findSubstitutionClose(s: string, open: number): number {
  return findBalancedClose(s, open + 1, "(", ")");
}

/**
 * Blank an UNQUOTED-delimiter heredoc body, keeping every region bash actually
 * EXECUTES there — `$(…)` command substitutions and backtick subshells — in
 * place and verbatim.
 *
 * The body is data: bash writes it to the redirect target rather than running
 * it, so a line reading `git switch main` is prose under an unquoted delimiter
 * exactly as under a quoted one. What differs is that an unquoted delimiter
 * leaves substitutions live, and a substitution DOES run. Keeping those regions
 * where they stood hands them to `extractCommandSegments` unchanged: that
 * function already lifts a `$(…)`/backtick body out as a segment of its own,
 * wherever in the command it appears. So this is that one mechanism reused, not
 * a heredoc special case, and the fail-closed property stays exactly where it
 * was earned (`issues/260809-1111`).
 *
 * Fail-closed on ambiguity, matching the module's bias: an unbalanced `$(` or an
 * unpaired backtick keeps the REST of the body as code rather than blanking a
 * region whose extent is unknown.
 *
 * Known conservative limitation: a backslash escape is not honoured, so bash's
 * literal `\$(git switch main)` (written to the file, never run) is still read
 * as a substitution and denies. That over-blocks, which is the safe direction.
 */
function blankHeredocBody(body: string): string {
  const n = body.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const ch = body[i];
    if (ch === "$" && body[i + 1] === "(") {
      const close = findSubstitutionClose(body, i);
      if (close === -1) return out + body.slice(i); // unbalanced → rest is code
      out += body.slice(i, close + 1);
      i = close + 1;
      continue;
    }
    if (ch === "`") {
      const close = body.indexOf("`", i + 1);
      if (close === -1) return out + body.slice(i); // unpaired → rest is code
      out += body.slice(i, close + 1);
      i = close + 1;
      continue;
    }
    out += ch === "\n" ? "\n" : " ";
    i++;
  }
  return out;
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

/** First character of a shell identifier (an array-assignment name). */
const IDENT_HEAD = /[A-Za-z_]/;
/** Subsequent character of a shell identifier. */
const IDENT_TAIL = /[A-Za-z0-9_]/;

/**
 * True for a character after which the NEXT character begins a new word: a
 * blank, or one of bash's metacharacters. Exactly bash's own set — `{` is
 * absent from it, which is what leaves the `#` of `${#x}` a literal rather
 * than a comment opener.
 */
const WORD_BREAK = /[ \t\n|&;()<>]/;

/**
 * End index (EXCLUSIVE) of the non-tokenized span starting at `i`, or -1 when
 * no span starts there. See the module header for the family and for why every
 * member is emitted verbatim.
 *
 * `wordStart` says whether `i` begins a word, which two members need: a `(` in
 * mid-word is not the arithmetic command, and a `name[` that is not a word's
 * first character is not an assignment.
 *
 * Fail-closed throughout: an unbalanced bracket returns -1, so the text is
 * scanned as ordinary code exactly as it was before this function existed.
 */
function scanNonTokenizedSpan(
  command: string,
  i: number,
  wordStart: boolean,
): number {
  const n = command.length;
  const ch = command[i];

  if (ch === "$") {
    // `$((…))` arithmetic expansion. Tested BEFORE the plain `$(` command
    // substitution, which must keep falling through — a substitution body is a
    // COMMAND context, where a `<<` really is a redirect and has to be seen.
    // The `$((cmd))` reading bash rejects as arithmetic is not a loss here:
    // the span is emitted verbatim, so `extractCommandSegments` still lifts the
    // body out and still classifies it.
    if (command[i + 1] === "(" && command[i + 2] === "(") {
      const close = findBalancedClose(command, i + 1, "(", ")");
      return close === -1 ? -1 : close + 1;
    }
    // `${…}` parameter expansion. Carries the array subscript of `${a[i<<1]}`
    // with it, so that shape needs no rule of its own.
    if (command[i + 1] === "{") {
      const close = findBalancedClose(command, i + 1, "{", "}");
      return close === -1 ? -1 : close + 1;
    }
    // `$[…]`, the deprecated arithmetic form bash still honours.
    if (command[i + 1] === "[") {
      const close = findBalancedClose(command, i + 1, "[", "]");
      return close === -1 ? -1 : close + 1;
    }
    return -1;
  }

  // `((…))` arithmetic command. Word-start only: anywhere else a `(` is the
  // subshell grammar, and a subshell IS a command context.
  if (wordStart && ch === "(" && command[i + 1] === "(") {
    const close = findBalancedClose(command, i, "(", ")");
    return close === -1 ? -1 : close + 1;
  }

  // `name[…]=` / `name[…]+=` — the subscript of an array assignment, which bash
  // evaluates arithmetically. The trailing `=` is required: without it the word
  // is a glob pattern, and bash reads the `<<` of `echo a[1<<2]` as a real
  // heredoc. The span ends at the `]`; the `=` and the value after it are
  // ordinary code.
  if (wordStart && IDENT_HEAD.test(ch ?? "")) {
    let j = i + 1;
    while (j < n && IDENT_TAIL.test(command[j])) j++;
    if (command[j] === "[") {
      const close = findBalancedClose(command, j, "[", "]");
      if (
        close !== -1 &&
        (command[close + 1] === "=" ||
          (command[close + 1] === "+" && command[close + 2] === "="))
      ) {
        return close + 1;
      }
    }
  }

  return -1;
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
 *   - the `$(…)` and backtick regions of an unquoted-delimiter heredoc body:
 *                                        <<EOF … $(git switch main) … EOF
 *
 * An unquoted-delimiter body is blanked around those regions
 * (`blankHeredocBody`) rather than kept whole. Expansion is not execution: bash
 * substitutes in such a body, so a substitution there runs and has to classify,
 * but the surrounding text is written to the file the same way a quoted
 * delimiter writes it. Keeping the whole body as code made every line of a
 * runbook its own candidate command, and denied an agent documenting the very
 * policy this guard enforces (`issues/260809-1111`).
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

  // Does `i` begin a word? Start of input does, and so does the position after
  // a blank or a metacharacter. Two of the non-tokenized spans are word-start
  // only, and so is a `#` comment.
  let wordStart = true;

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
      wordStart = false;
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
      wordStart = false;
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
      wordStart = false;
      continue;
    }

    // `#` at a word start opens a COMMENT: bash ignores it and the rest of the
    // line. Emitted verbatim, so the only thing this branch changes is that no
    // operator is recognized in it — a `<<EOF` a comment merely NAMES stops
    // opening a heredoc and blanking the commands below (`issues/260809-2044`).
    // Blanking the comment instead would be sound bash, but it would be a new
    // way for this function to REMOVE text, which is the shape of the defect it
    // is fixing; the comment's own text keeps classifying exactly as it did.
    if (ch === "#" && wordStart) {
      let end = command.indexOf("\n", i);
      if (end === -1) end = n;
      out += command.slice(i, end);
      i = end;
      wordStart = false;
      continue;
    }

    // A span bash's tokenizer consumes without recognizing an operator inside
    // it — arithmetic, parameter expansion, an array-assignment subscript. See
    // the module header. Verbatim, so a wrong guess about the span's extent can
    // only over-classify.
    const spanEnd = scanNonTokenizedSpan(command, i, wordStart);
    if (spanEnd !== -1) {
      out += command.slice(i, spanEnd);
      i = spanEnd;
      wordStart = false;
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
      wordStart = true;
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
        wordStart = false;
        continue;
      }
      // Not a real delimiter → emit a single `<` and advance.
      out += ch;
      i++;
      wordStart = true;
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
        // A heredoc body is data under either delimiter form: it is what a
        // command reads, never a path a command writes. A quoted delimiter
        // blanks it whole; an unquoted one blanks it around the `$(…)` and
        // backtick regions bash still executes there.
        out += hd.strip ? blankData(body) : blankHeredocBody(body);
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
      wordStart = true;
      continue;
    }

    out += ch;
    i++;
    wordStart = WORD_BREAK.test(ch);
  }

  return out;
}

/**
 * Blank shell data regions (single-quoted strings, heredoc bodies — an unquoted
 * delimiter keeping the `$(…)`/backtick regions bash executes) so only
 * executable code reaches the segmenter. The entry point the git classifier and
 * its suite consume, kept under its original name.
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
    // Same scan `blankHeredocBody` uses to decide a substitution's extent, so
    // the region this function lifts out and the region that survives blanking
    // are the same region by construction.
    const end = findSubstitutionClose(outer, start);
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
    // segments. It is also what makes a text region `stripDataRegions` had to
    // retain as code — a heredoc whose terminator never appears, an
    // unterminated quote — classify on its own line rather than being shadowed
    // by the command that opened it.
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
