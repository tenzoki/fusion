import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  resolveWord,
  tokenize,
  extractCommandSegments,
  stripDataRegions,
} from "../shell-parse.js";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// The lexer, as the git branch policy consumes it.
//
// ## What left this file, and where the equivalence proof went
//
// `shell-parse.ts` used to carry TWO readings of a command. The flat, unordered
// segmenter below is the one the git policy has always used. Beside it sat an
// ordered, depth-tagged parser (`parseCommand`) with a second quote mode
// ("capture"), which minted placeholder tokens so a retired mutation classifier
// could read `mv 'rules/x.md' /tmp/` as a path rather than as blanked data. That
// classifier is gone, and the parser, the mode, the placeholders, the joiners
// and the depth tags went with it.
//
// Forty-three cases here asserted properties of that parser. They are not
// weakened, they have no subject: nothing in the module returns a joiner or a
// depth any more, and nothing mints a placeholder.
//
// The equivalence they were written to prove — that the flat segmenter and the
// ordered one agreed, so the cut could not disturb the git policy — cannot be
// stated with one segmenter left. Its evidence lives in
// `git-branch-guard.test.ts` instead, and that file is deliberately untouched by
// this Circle: a gold fixture over 98 commands, plus a source assertion that the
// git policy never reached for `parseCommand` in the first place. What this file
// keeps of the corpus is the floor below — a harvest that would go quiet if the
// regex stopped matching — and the shape assertions on the one segmenter that
// remains.
//
// `resolveWord` still takes a literals table, because that parameter is the seam
// a caller supplies its own through; the git policy passes an empty map. The
// placeholder cases below feed the table directly rather than through a mode
// that no longer exists.
// ---------------------------------------------------------------------------

/**
 * Every command string the git-branch-guard suite runs through the classifier
 * or the parser, harvested from that suite's own source. Harvesting rather
 * than copying keeps the corpus honest as that suite grows — a case added there
 * is a case pinned here, with no second list to maintain.
 *
 * Recognised shapes: a string literal (or a `+`-joined chain of them) passed as
 * the first argument to `deny` / `classifyWith` / `classifyGitCommand` /
 * `extractCommandSegments` / `stripDataRegions`, and the `const cmd = …` chains
 * the multi-line heredoc cases are built from.
 */
function harvestGitGuardCommands(): string[] {
  const src = readFileSync(join(HERE, "git-branch-guard.test.ts"), "utf8");
  const LITERAL = `(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`;
  const CHAIN = `${LITERAL}(?:\\s*\\+\\s*${LITERAL})*`;
  const re = new RegExp(
    `(?:const cmd\\s*=\\s*|(?:deny|classifyWith|classifyGitCommand|` +
      `extractCommandSegments|stripDataRegions)\\(\\s*)(${CHAIN})`,
    "g",
  );
  const out: string[] = [];
  for (const m of src.matchAll(re)) out.push(evalLiteralChain(m[1]));
  return out;
}

/** Evaluate a `+`-joined chain of single/double-quoted TS string literals. */
function evalLiteralChain(chain: string): string {
  const LITERAL = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
  let value = "";
  for (const m of chain.matchAll(LITERAL)) value += unquote(m[0]);
  return value;
}

function unquote(literal: string): string {
  const body = literal.slice(1, -1);
  return body.replace(/\\(.)/g, (_all, ch: string) => {
    if (ch === "n") return "\n";
    if (ch === "t") return "\t";
    if (ch === "r") return "\r";
    return ch;
  });
}

const GIT_GUARD_CORPUS = harvestGitGuardCommands();

/** The pipeline the git classifier runs: blank the data, then segment. */
function segments(command: string): string[] {
  return extractCommandSegments(stripDataRegions(command));
}

describe("harvesting the git-guard corpus", () => {
  it("finds the whole suite, not a vacuous handful", () => {
    // The suite had 85 command strings when this was written. A regex that
    // silently stops matching would make every corpus case below pass for the
    // wrong reason, so pin a floor.
    expect(GIT_GUARD_CORPUS.length).toBeGreaterThan(70);
  });

  it("harvests the multi-line heredoc commands too", () => {
    expect(GIT_GUARD_CORPUS.some((c) => c.includes("\n") && c.includes("EOF"))).toBe(
      true,
    );
  });
});

describe("the flat segmenter is total over the git-guard corpus", () => {
  // What the git classifier assumes about every segment it is handed: it reads
  // `tokenize(segment)[0]` as a command word, so an empty or untrimmed segment
  // would send it looking for a program in whitespace. Stated over the corpus
  // rather than over three examples, because the corpus grows with the suite it
  // is harvested from.
  it("returns only non-empty, trimmed segments", () => {
    for (const cmd of GIT_GUARD_CORPUS) {
      for (const s of segments(cmd)) {
        expect(s.length, `command: ${JSON.stringify(cmd)}`).toBeGreaterThan(0);
        expect(s, `command: ${JSON.stringify(cmd)}`).toBe(s.trim());
      }
    }
  });

  it("finds at least one segment in every non-blank command", () => {
    for (const cmd of GIT_GUARD_CORPUS) {
      if (cmd.trim().length === 0) continue;
      expect(
        segments(cmd).length,
        `command: ${JSON.stringify(cmd)}`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("blanking data regions", () => {
  it("blanks a single-quoted body and keeps its quotes", () => {
    expect(stripDataRegions("echo 'abc'")).toBe("echo '   '");
  });

  it("is empty for an empty command", () => {
    expect(segments("   ")).toEqual([]);
  });

  it("leaves a double-quoted span that expands nothing byte-for-byte", () => {
    // `git commit -m "docs: rules/a.md -> rules/b.md"` has to survive as one
    // segment: bash performs no segmentation and no redirection inside the span.
    const cmd = 'git commit -m "docs: rules/a.md -> rules/b.md"';
    expect(stripDataRegions(cmd)).toBe(cmd);
    expect(segments(cmd)).toEqual([cmd]);
  });

  it("keeps an EXPANDING double-quoted span as code — the fail-closed direction", () => {
    // A `$` or a backtick means bash would act on the span, so the body has to
    // reach the classifier as its own segment.
    expect(segments('echo "$(rm rules/x.md)"')).toContain("rm rules/x.md");
    expect(segments('echo "`git switch main`"')).toContain("git switch main");
  });

  it("keeps a quoted-delimiter heredoc body out of the segments", () => {
    const cmd = "cat > /tmp/note <<'EOF'\nrm rules/x.md\nEOF";
    expect(segments(cmd).some((s) => s.includes("rules/x.md"))).toBe(false);
  });

  it("keeps a plain line of an UNQUOTED-delimiter heredoc body out too", () => {
    // Bash EXPANDS in this body, it does not EXECUTE it: the line is written to
    // the redirect target exactly as under a quoted delimiter. Keeping the body
    // as code made every line its own candidate command (`issues/260809-1111`).
    const cmd = "cat > /tmp/note <<EOF\nrm rules/x.md\nEOF";
    expect(segments(cmd)).toEqual(["cat > /tmp/note <<", "EOF"]);
    // ... which is now, line for line, what the quoted form produces.
    expect(segments(cmd)).toEqual(
      segments("cat > /tmp/note <<'EOF'\nrm rules/x.md\nEOF"),
    );
  });

  it("lifts the substitutions out of an UNQUOTED-delimiter heredoc body", () => {
    // The half of the fail-closed argument that IS true: a substitution in such
    // a body runs, so it has to reach the classifier as a segment of its own.
    expect(segments("cat <<EOF\nsee $(rm rules/x.md) here\nEOF")).toContain(
      "rm rules/x.md",
    );
    expect(segments("cat <<EOF\nsee `rm rules/x.md` here\nEOF")).toContain(
      "rm rules/x.md",
    );
    // And the prose the substitution stood in is gone with the rest of the body.
    expect(segments("cat <<EOF\nsee $(rm rules/x.md) here\nEOF")).toEqual([
      "rm rules/x.md",
      "cat <<",
      "EOF",
    ]);
  });

  it("keeps a QUOTED-delimiter body's substitutions out — the quotes suppress them", () => {
    // The exemption is unquoted-only: `<<'EOF'` writes `$(…)` to the file
    // literally, so nothing in the body runs and nothing is lifted.
    expect(segments("cat <<'EOF'\nsee $(rm rules/x.md) here\nEOF")).toEqual([
      "cat <<",
      "EOF",
    ]);
    expect(segments("cat <<'EOF'\nsee `rm rules/x.md` here\nEOF")).toEqual([
      "cat <<",
      "EOF",
    ]);
  });

  it("fails closed on a substitution whose extent the body does not settle", () => {
    // An unbalanced `$(` or an unpaired backtick has no known end, so the rest
    // of the body stays code rather than being blanked on a guess. Stated as
    // "the text survives" rather than as an exact segment: the unpaired backtick
    // stays glued to the word after it, which is what the segmenter has always
    // done with one outside a heredoc too.
    for (const cmd of [
      "cat <<EOF\nsee $(rm rules/x.md\nEOF",
      "cat <<EOF\nsee `rm rules/x.md\nEOF",
    ]) {
      expect(
        segments(cmd).some((s) => s.includes("rules/x.md")),
        `command: ${JSON.stringify(cmd)}`,
      ).toBe(true);
    }
  });

  it("blanks an unquoted body whose terminator IS the end of the command", () => {
    // No trailing newline after the terminator — the branch that ends the scan
    // at `n`. The body still has to be blanked, not left behind as code.
    expect(segments("cat <<EOF\nrm rules/x.md\nEOF")).toEqual(["cat <<", "EOF"]);
  });

  it("never lets single-quoted text become a command word", () => {
    // The security property blanking exists for. `echo 'git switch main'` is
    // prose; a segment whose command word is `git` would deny an inert echo.
    for (const inert of [
      "echo 'rm -rf rules/'",
      "echo '; rm -rf rules/'",
      "echo '&& rm -rf rules/'",
      "echo '| rm -rf rules/'",
      "echo '$(rm -rf rules/)'",
      "echo '`rm -rf rules/`'",
      "echo '> rules/x.md'",
      "echo 'a\nrm -rf rules/'",
      "echo 'git switch main'",
    ]) {
      const label = `command: ${JSON.stringify(inert)}`;
      for (const s of segments(inert)) {
        const first = tokenize(s)[0];
        expect(["echo", "'"], label).toContain(first);
      }
      // And no operand survives either, so nothing downstream can read a path
      // out of the blanked body.
      expect(
        segments(inert).some((s) => s.includes("rules")),
        label,
      ).toBe(false);
    }
  });
});

describe("spans bash does not tokenize (issue 260809-2044)", () => {
  // Quoting is not the only thing that suspends bash's tokenizer. In a comment
  // and in the bracketed arithmetic/expansion spans it recognizes no operator,
  // so a `<<WORD` there is not a heredoc redirect — and reading one cost a
  // deny→allow, because the body blanking then erased every line between the
  // false opener and the first line equal to the delimiter.
  //
  // Each member below was confirmed against bash 3.2 by running the shape with
  // a `touch RAN` where the blanked command stood; the marker appears in all of
  // them. `rm rules/x.md` stands in for that command here.

  const FALSE_OPENERS: [string, string][] = [
    ["a comment naming a heredoc", "# write cfg with <<EOF\nrm rules/x.md\ncat > cfg <<EOF\nv=1\nEOF"],
    ["arithmetic expansion", "echo $((1<<2))\nrm rules/x.md\n2"],
    ["arithmetic command", "(( 1<<2 ))\nrm rules/x.md\n2"],
    ["the deprecated $[…] form", "echo $[1<<2]\nrm rules/x.md\n2"],
    ["parameter expansion", "echo ${x:-<<EOF}\nrm rules/x.md\nEOF"],
    ["an array-assignment subscript", "a[1<<2]=v\nrm rules/x.md\n2"],
  ];

  for (const [what, cmd] of FALSE_OPENERS) {
    it(`does not open a heredoc on a << inside ${what}`, () => {
      const label = `command: ${JSON.stringify(cmd)}`;
      // The command bash executes survives as a segment of its own — the whole
      // point. Nothing weaker will do: before the fix it was spaces.
      expect(segments(cmd), label).toContain("rm rules/x.md");
    });
  }

  it("emits every such span VERBATIM — nothing new is blanked", () => {
    // The bias that makes a wrong guess about a span's extent cost a deny and
    // never an allow. A comment is left where it stood rather than erased, so
    // its own text keeps classifying exactly as it did before this branch
    // existed; the only thing that changed is that no operator is read in it.
    for (const cmd of [
      "echo $((1<<2))",
      "echo ${x:-y}",
      "echo $[1+2]",
      "echo hi # rm rules/x.md",
      "a[1]=v",
    ]) {
      expect(stripDataRegions(cmd), `command: ${JSON.stringify(cmd)}`).toBe(cmd);
    }
  });

  it("keeps reading a $(…) substitution as the COMMAND context it is", () => {
    // `$((` is arithmetic, but `$(` is a command, and a `<<` inside one is a
    // real redirect. Tested together so a future widening of the `$((` rule
    // cannot take the substitution with it.
    expect(segments("echo $(rm rules/x.md)")).toContain("rm rules/x.md");
    // The spaced form is a subshell inside a substitution. Its parentheses stay
    // glued to the segment — `tokenize` peels those, not the segmenter — so the
    // claim is that the command reaches the segmenter, not its exact spelling.
    expect(
      segments("echo $( (rm rules/x.md) )").some((s) => s.includes("rm rules/x.md")),
    ).toBe(true);
    // A process substitution is a command context too, so the heredoc opened
    // inside one is real and its body is blanked.
    expect(segments("cat <(cat <<EOF\nrm rules/x.md\nEOF\n)")).not.toContain(
      "rm rules/x.md",
    );
  });

  it("leaves the near-misses alone — bash really opens those heredocs", () => {
    // `x=1<<2`, `let x=1<<2` and `echo a[1<<2]` are real redirects to bash (the
    // last one is a glob, not a subscript — which is why the subscript rule
    // requires the trailing `=`). The body must stay blanked in all three.
    for (const cmd of [
      "x=1<<2\nrm rules/x.md\n2",
      "let x=1<<2\nrm rules/x.md\n2",
      "echo a[1<<2]\nrm rules/x.md\n2",
    ]) {
      expect(
        segments(cmd).some((s) => s.includes("rules/x.md")),
        `command: ${JSON.stringify(cmd)}`,
      ).toBe(false);
    }
  });

  it("only reads a `#` that starts a WORD as a comment", () => {
    // Bash's own rule, and the reason `{` is absent from the word-break set:
    // the `#` of `${#x}` and of `a#b` is a literal, so a heredoc opened after
    // one is a real heredoc and its body must still be blanked.
    for (const cmd of [
      "echo a#b <<EOF\nrm rules/x.md\nEOF",
      "echo ${#x} <<EOF\nrm rules/x.md\nEOF",
    ]) {
      expect(
        segments(cmd).some((s) => s.includes("rules/x.md")),
        `command: ${JSON.stringify(cmd)}`,
      ).toBe(false);
    }
  });

  it("does not recognize a span whose bracket never balances", () => {
    // An unbalanced opener has no known extent, so no span is recognized and
    // the scan continues exactly as it did before this branch existed. For
    // `${` that leaves the text; for `$((` it leaves the pre-existing heredoc
    // reading of the `<<`, and the body stays blanked.
    //
    // Neither is a hole: bash rejects BOTH commands outright — "unexpected EOF
    // while looking for matching `)'" and the same for `}' — so nothing in
    // either one runs, whichever way this lexer reads them. Pinned so a future
    // change to the -1 branch has to argue with a measurement.
    expect(segments("echo ${x:-y\nrm rules/x.md\n2")).toContain("rm rules/x.md");
    expect(segments("echo $((1<<2\nrm rules/x.md\n2")).toEqual([
      "(1<<",
      "2",
      "echo",
    ]);
  });
});

describe("segmentation on the operators", () => {
  it("splits on every operator in the set", () => {
    expect(segments("a && b ; c || d | e")).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("splits on a newline, which terminates a command in the shell too", () => {
    expect(segments("cd build\nrm out.js")).toEqual(["cd build", "rm out.js"]);
    expect(segments("cd hooks &&\n  npm run build &&\n  rm -rf dist")).toEqual([
      "cd hooks",
      "npm run build",
      "rm -rf dist",
    ]);
  });

  it("lifts a subshell body out AHEAD of the segment it stood in", () => {
    // The flat form: order and nesting depth are lost on purpose. The git
    // classifier asks only whether ANY segment denies, so neither is visible to
    // it — which is what made leaving this segmenter untouched provably
    // behaviour-neutral when the parser beside it was removed.
    expect(segments("echo $(rm a) && ls")).toEqual(["rm a", "echo", "ls"]);
    expect(segments("$(rm a) ; ls")).toEqual(["rm a", "ls"]);
  });

  it("recurses into a subshell inside a subshell", () => {
    expect(segments("echo `echo $(rm a)`")).toEqual(["rm a", "echo", "echo"]);
  });

  it("leaves a (…) subshell's parentheses in the segment text", () => {
    // The strip is in the tokenizer only (see below), so the segmenter's output
    // still carries every parenthesis.
    expect(segments("(cd rules && ls) && rm x.md")).toEqual([
      "(cd rules",
      "ls)",
      "rm x.md",
    ]);
  });
});

/**
 * A `\` at end of line is removed by bash BEFORE tokenization, so the two lines
 * are one logical line with no separator at all. Until this was fixed the pair
 * was emitted verbatim and the newline terminated the segment, which hid every
 * operand after the continuation from the classifier
 * (`issues/260801-1513_c_backslash-line-continuation-splits-a-command-and-hides-its-operands.md`).
 */
describe("a backslash line continuation splices two lines into one command", () => {
  it("joins the continued lines into a single segment", () => {
    const segs = segments("git worktree \\\n  add ../wt x");
    expect(segs.length).toBe(1);
    expect(tokenize(segs[0])).toEqual(["git", "worktree", "add", "../wt", "x"]);
  });

  it("removes the pair rather than substituting a space", () => {
    // Bash splices with NO separator: `rm\<nl>x` is `rmx`, not `rm x`. The
    // space in `rm \<nl>x` is the one that was already written before the `\`.
    expect(stripDataRegions("rm \\\nrules/x.md")).toBe("rm rules/x.md");
    expect(stripDataRegions("r\\\nm x")).toBe("rm x");
  });

  it("does not treat an escaped backslash before a newline as a continuation", () => {
    // `\\` is consumed as one escaped backslash, so the newline after it is a
    // real command terminator: two segments, exactly as without the escape.
    expect(segments("git worktree \\\\\n add ../wt x")).toEqual([
      "git worktree \\\\",
      "add ../wt x",
    ]);
  });

  it("leaves a lone trailing backslash alone", () => {
    expect(stripDataRegions("rm x \\")).toBe("rm x \\");
  });

  it("does NOT splice inside single quotes — the quotes suppress the escape", () => {
    // The pair survives inside the blanked body, so the newline still
    // terminates: two segments, and neither carries the path.
    const segs = segments("echo 'rm \\\n rules/x.md'");
    expect(segs).toEqual(["echo '", "'"]);
  });

  it("DOES splice inside double quotes — bash removes it there", () => {
    const segs = segments('rm "rules/\\\nx.md"');
    expect(segs.length).toBe(1);
    expect(tokenize(segs[0])).toEqual(["rm", '"rules/x.md"']);
    expect(resolveWord(tokenize(segs[0])[1], new Map())).toEqual({
      value: "rules/x.md",
    });
  });

  it("keeps every other double-quoted escape pair byte-for-byte", () => {
    expect(stripDataRegions('echo "a \\" b \\$X"')).toBe('echo "a \\" b \\$X"');
  });

  it("does not reinterpret a continuation inside a heredoc body", () => {
    // A heredoc body is data the command READS, under either delimiter form, so
    // the continuation is never spliced: the body is blanked, and the `\` goes
    // with the rest of it.
    expect(segments("cat > /tmp/n <<'EOF'\nrm \\\nrules/x.md\nEOF")).toEqual([
      "cat > /tmp/n <<",
      "EOF",
    ]);
    expect(segments("cat > /tmp/n <<EOF\nrm \\\nrules/x.md\nEOF")).toEqual([
      "cat > /tmp/n <<",
      "EOF",
    ]);
  });

  it("splices inside a $(…) body as well as outside it", () => {
    expect(segments("rm \\\n$(echo \\\n x)")).toEqual(["echo  x", "rm"]);
  });
});

/**
 * A `(…)` subshell is not modelled by the segmenter, so its parentheses arrive
 * glued to the words they touch and hid both the command word and the last
 * operand from the classifier. `tokenize` peels them
 * (`issues/260801-1610_c_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`).
 */
describe("tokenize peels a (…) subshell's parentheses", () => {
  it("frees the command word and the last operand", () => {
    expect(tokenize("(rm rules/x.md)")).toEqual(["rm", "rules/x.md"]);
    expect(tokenize("(git switch main)")).toEqual(["git", "switch", "main"]);
  });

  it("drops a word that was nothing but parentheses", () => {
    expect(tokenize("( rm x )")).toEqual(["rm", "x"]);
    expect(tokenize("((cd a && b))")).toEqual(["cd", "a", "&&", "b"]);
  });

  it("leaves a parenthesis in the MIDDLE of a word alone", () => {
    expect(tokenize("a(b")).toEqual(["a(b"]);
    expect(tokenize("f() {")).toEqual(["f(", "{"]);
  });
});

describe("resolveWord", () => {
  const NO_LITERALS = new Map<string, string>();

  it("reports unresolved for a parameter expansion", () => {
    expect(resolveWord("$DST", NO_LITERALS)).toEqual({ unresolved: true });
  });

  it("reports unresolved for a double-quoted parameter expansion", () => {
    expect(resolveWord('"$DST"', NO_LITERALS)).toEqual({ unresolved: true });
  });

  it("reports unresolved for a command substitution", () => {
    expect(resolveWord("`pwd`", NO_LITERALS)).toEqual({ unresolved: true });
  });

  it("reports unresolved for a leading tilde", () => {
    expect(resolveWord("~user/x", NO_LITERALS)).toEqual({ unresolved: true });
    expect(resolveWord("~/x", NO_LITERALS)).toEqual({ unresolved: true });
  });

  it("resolves a double-quoted plain word", () => {
    expect(resolveWord('"plain.txt"', NO_LITERALS)).toEqual({
      value: "plain.txt",
    });
  });

  it("resolves a bare word unchanged", () => {
    expect(resolveWord("rules/x.md", NO_LITERALS)).toEqual({
      value: "rules/x.md",
    });
  });

  it("resolves an empty word", () => {
    expect(resolveWord("", NO_LITERALS)).toEqual({ value: "" });
  });

  it("does not treat a tilde in the middle of a word as expansion", () => {
    expect(resolveWord("a~b", NO_LITERALS)).toEqual({ value: "a~b" });
  });

  it("removes a backslash escape the way bash does", () => {
    // Load-bearing for a CALLER'S command word: an unprocessed escape does not
    // merely shorten a path, it renames the program out of whatever table the
    // caller is about to consult. `\git` is `git`.
    expect(resolveWord("\\git", NO_LITERALS)).toEqual({ value: "git" });
  });

  it("keeps the $ of a supplied literal, which no expansion would touch", () => {
    // The `literals` seam. A caller that hands over a table says "this text was
    // quoted", and a `$` inside it denotes a file literally named `$HOME`.
    // Nothing in the module mints these tokens any more — the mode that did was
    // retired with the mutation classifier — so the table is fed directly here.
    expect(resolveWord(placeholder(0), oneLiteral(0, "$HOME"))).toEqual({
      value: "$HOME",
    });
  });

  it("reports unresolved when an expansion is glued to a supplied literal", () => {
    // The mixed word: the literal half is data, the `$X` half is code, and code
    // decides. This is the fail-closed direction and it must not flip.
    expect(resolveWord(`${placeholder(0)}$X`, oneLiteral(0, "rules/"))).toEqual({
      unresolved: true,
    });
  });

  it("splices a supplied literal into the code around it", () => {
    expect(resolveWord(`of=${placeholder(0)}`, oneLiteral(0, "rules/x.md"))).toEqual(
      { value: "of=rules/x.md" },
    );
  });
});

/**
 * The token shape `resolveWord`'s `literals` table is keyed by. Built from a
 * character code rather than written out, because a raw U+0001 in a source file
 * is invisible to a reader and to most diffs.
 */
function placeholder(n: number): string {
  const soh = String.fromCharCode(1);
  return `${soh}q${n}${soh}`;
}

function oneLiteral(n: number, value: string): Map<string, string> {
  return new Map([[placeholder(n), value]]);
}
