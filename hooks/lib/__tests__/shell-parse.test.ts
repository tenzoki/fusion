import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  parseCommand,
  resolveWord,
  tokenize,
  extractCommandSegments,
  stripDataRegions,
  SUBSTITUTION_FILLER,
} from "../shell-parse.js";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Every command string the git-branch-guard suite runs through the classifier
 * or the parser, harvested from that suite's own source. Harvesting rather
 * than copying keeps the equivalence assertion honest as that suite grows —
 * a case added there is a case pinned here, with no second list to maintain.
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

/** Words of every segment, flattened — what a classifier actually looks at. */
function words(command: string, quoted: "blank" | "capture") {
  const parsed = parseCommand(command, { quoted });
  return {
    parsed,
    perSegment: parsed.segments.map((s) => tokenize(s.text)),
  };
}

describe("harvesting the git-guard corpus", () => {
  it("finds the whole suite, not a vacuous handful", () => {
    // The suite had 85 command strings when this was written. A regex that
    // silently stops matching would make every equivalence case below pass
    // for the wrong reason, so pin a floor.
    expect(GIT_GUARD_CORPUS.length).toBeGreaterThan(70);
  });

  it("harvests the multi-line heredoc commands too", () => {
    expect(GIT_GUARD_CORPUS.some((c) => c.includes("\n") && c.includes("EOF"))).toBe(
      true,
    );
  });
});

describe("blank mode reproduces the historical segmentation", () => {
  it("agrees with extractCommandSegments(stripDataRegions(cmd)) as a set", () => {
    for (const cmd of GIT_GUARD_CORPUS) {
      const legacy = extractCommandSegments(stripDataRegions(cmd));
      const parsed = parseCommand(cmd, { quoted: "blank" }).segments.map(
        (s) => s.text,
      );
      expect(new Set(parsed), `command: ${JSON.stringify(cmd)}`).toEqual(
        new Set(legacy),
      );
      expect(parsed.length, `command: ${JSON.stringify(cmd)}`).toBe(
        legacy.length,
      );
    }
  });

  it("returns no literals in blank mode", () => {
    expect(parseCommand("echo 'abc'", { quoted: "blank" }).literals.size).toBe(0);
  });

  it("still blanks a single-quoted body", () => {
    const segs = parseCommand("echo 'abc'", { quoted: "blank" }).segments;
    expect(segs).toEqual([{ text: "echo '   '", depth: 0, joiner: "start" }]);
  });

  it("is empty for an empty command", () => {
    expect(parseCommand("   ", { quoted: "blank" }).segments).toEqual([]);
  });
});

describe("segments come back in source order with a depth", () => {
  it("orders an outer segment before the subshell it contains", () => {
    const segs = parseCommand("echo $(rm a) && ls", { quoted: "blank" }).segments;
    expect(segs).toEqual([
      { text: "echo", depth: 0, joiner: "start" },
      { text: "rm a", depth: 1, joiner: "start" },
      { text: "ls", depth: 0, joiner: "&&" },
    ]);
  });

  it("orders a leading subshell before the segment that follows it", () => {
    const segs = parseCommand("$(rm a) ; ls", { quoted: "blank" }).segments;
    // `ls` reads as `start` here because BLANK mode replaces the lifted `$(…)`
    // with a space, so the segment it stood in trims to nothing and never gets
    // emitted — there is no earlier segment at this level for it to be joined
    // to. Capture mode, the only mode that consumes a joiner, keeps the filler
    // and reports the `;` (pinned below).
    expect(segs).toEqual([
      { text: "rm a", depth: 1, joiner: "start" },
      { text: "ls", depth: 0, joiner: "start" },
    ]);
    expect(
      parseCommand("$(rm a) ; ls", { quoted: "capture" }).segments.map((s) => [
        s.text,
        s.joiner,
      ]),
    ).toEqual([
      ["$(…)", "start"],
      ["rm a", "start"],
      ["ls", ";"],
    ]);
  });

  it("keeps depth-0 segments in the order they were written", () => {
    const segs = parseCommand("a && b ; c || d | e", { quoted: "blank" }).segments;
    expect(segs.map((s) => s.text)).toEqual(["a", "b", "c", "d", "e"]);
    expect(segs.every((s) => s.depth === 0)).toBe(true);
  });

  it("nests depth for a subshell inside a subshell", () => {
    const segs = parseCommand("echo `echo $(rm a)`", { quoted: "blank" }).segments;
    expect(segs).toEqual([
      { text: "echo", depth: 0, joiner: "start" },
      { text: "echo", depth: 1, joiner: "start" },
      { text: "rm a", depth: 2, joiner: "start" },
    ]);
  });
});

/**
 * The JOINER — added so the mutation classifier can tell an assumption the
 * shell guarantees from one it does not
 * (`decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`).
 *
 * Everything below is a property of the LEXER: whether the operator is reported
 * correctly. What the mutation classifier does with it is pinned in
 * `bash-mutation-guard.test.ts`; what the GIT classifier does with it is
 * nothing, which is pinned in `git-branch-guard.test.ts`.
 */
describe("each segment records the operator that joined it", () => {
  /** `[text, joiner]` for every segment, in source order. */
  function joiners(command: string): [string, string][] {
    return parseCommand(command, { quoted: "capture" }).segments.map((s) => [
      s.text,
      s.joiner,
    ]);
  }

  it("names every operator in the set", () => {
    expect(joiners("a && b || c ; d | e & f")).toEqual([
      ["a", "start"],
      ["b", "&&"],
      ["c", "||"],
      ["d", ";"],
      ["e", "|"],
      ["f", "&"],
    ]);
  });

  it("reports a newline as its own joiner, not as a semicolon", () => {
    // A newline separates exactly as `;` does in the shell, but a deny reason
    // that told an agent to look for a `;` it never wrote would be a wrong
    // instruction, so the two stay distinguishable.
    expect(joiners("cd build\nrm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "newline"],
    ]);
    expect(joiners("cd build\r\n\r\nrm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "newline"],
    ]);
  });

  it("takes && and || as ONE operator without changing the segmentation", () => {
    // They used to be two flushes of which the second found an empty segment.
    // Same segments, and now nameable.
    expect(joiners("a&&b")).toEqual([
      ["a", "start"],
      ["b", "&&"],
    ]);
    expect(joiners("a||b")).toEqual([
      ["a", "start"],
      ["b", "||"],
    ]);
    // `|&` is `|` then `&`, and `;;` is two `;` — the lookahead is on the
    // REPEATED character only.
    expect(joiners("a |& b")).toEqual([
      ["a", "start"],
      ["b", "|"],
    ]);
    expect(joiners("a ;; b")).toEqual([
      ["a", "start"],
      ["b", ";"],
    ]);
  });

  it("gives up the && when a second operator also stands between", () => {
    // `a && ; b` is a shell syntax error, but the lexer over-segments rather
    // than parses, and the direction it errs in matters: `&&` is the only
    // joiner that GUARANTEES the previous segment succeeded, so two operators
    // between two segments must not report as a guarantee.
    expect(joiners("a && ; b")).toEqual([
      ["a", "start"],
      ["b", ";"],
    ]);
    expect(joiners("a ; && b")).toEqual([
      ["a", "start"],
      ["b", ";"],
    ]);
  });

  it("keeps the && when the newlines are INSIDE the operator", () => {
    // Bash's grammar is `and_or : and_or AND_AND newline_list pipeline`, so
    // the newlines after `&&` are part of the operator and the operator is
    // still `&&`. Downgrading them to `newline` made an ordinary multi-line
    // chain deny with the reason "join the `cd` to what follows it with `&&`",
    // which the caller had already done (`issues/260804-0838…`).
    //
    // Measured in bash 3.2.57 and zsh 5.9, one throwaway project per row:
    // `cd build &&\nrm out.js` deletes `build/out.js` when the `cd` succeeds
    // and deletes NOTHING when it fails — exactly the single-line form.
    expect(joiners("cd build &&\nrm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "&&"],
    ]);
    expect(joiners("cd build &&\n\n  rm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "&&"],
    ]);
    expect(joiners("cd build &&\r\n  rm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "&&"],
    ]);
    // The shape an agent actually writes, and the one the deny was met on.
    expect(joiners("cd hooks &&\n  npm run build &&\n  rm -rf dist")).toEqual([
      ["cd hooks", "start"],
      ["npm run build", "&&"],
      ["rm -rf dist", "&&"],
    ]);
    // `||` was never downgraded on this path; that asymmetry was the tell.
    // It stays `||` with and without the newline, so the two operators are now
    // treated the same way with respect to a newline that follows them.
    expect(joiners("cd build ||\n  rm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "||"],
    ]);
    expect(joiners("cd build || rm out.js")).toEqual([
      ["cd build", "start"],
      ["rm out.js", "||"],
    ]);
  });

  it("still gives the && up when a REAL second operator follows the newlines", () => {
    // The exemption above is only for a newline reached with `&&` pending. An
    // operator after the newlines takes the give-up branch as before, so the
    // newline exemption cannot be used to smuggle a guarantee past a `;`.
    // (`a &&\n; b` is a bash syntax error; the lexer over-segments rather than
    // parses, and this is the direction to err in.)
    expect(joiners("a &&\n; b")).toEqual([
      ["a", "start"],
      ["b", ";"],
    ]);
    expect(joiners("a &&\n| b")).toEqual([
      ["a", "start"],
      ["b", "|"],
    ]);
    // A newline BEFORE the `&&` is untouched: nothing is pending as `&&` when
    // the newline flushes, so `b` carries the weaker `newline`.
    expect(joiners("a\n&& b")).toEqual([
      ["a", "start"],
      ["b", "newline"],
    ]);
  });

  it("starts each nesting level at `start`", () => {
    // A subshell body's first segment had nothing before it INSIDE the body,
    // and the doubt about the enclosing segment is carried by that segment's
    // own joiner instead.
    expect(joiners("cd docs ; $(rm a) && ls")).toEqual([
      ["cd docs", "start"],
      ["$(…)", ";"],
      ["rm a", "start"],
      ["ls", "&&"],
    ]);
  });

  it("is `start` for the only segment of a simple command", () => {
    expect(joiners("rm rules/x.md")).toEqual([["rm rules/x.md", "start"]]);
  });
});

/**
 * A `\` at end of line is removed by bash BEFORE tokenization, so the two lines
 * are one logical line with no separator at all. Until this was fixed the pair
 * was emitted verbatim and the newline terminated the segment, which hid every
 * operand after the continuation from both classifiers
 * (`issues/260801-1513_c_backslash-line-continuation-splits-a-command-and-hides-its-operands.md`).
 */
describe("a backslash line continuation splices two lines into one command", () => {
  for (const quoted of ["blank", "capture"] as const) {
    it(`joins the continued lines into a single segment (${quoted} mode)`, () => {
      const { parsed, perSegment } = words("git worktree \\\n  add ../wt x", quoted);
      expect(parsed.segments.length).toBe(1);
      expect(perSegment[0]).toEqual(["git", "worktree", "add", "../wt", "x"]);
    });
  }

  it("removes the pair rather than substituting a space", () => {
    // Bash splices with NO separator: `rm\<nl>x` is `rmx`, not `rm x`. The
    // space in `rm \<nl>x` is the one that was already written before the `\`.
    expect(stripDataRegions("rm \\\nrules/x.md")).toBe("rm rules/x.md");
    expect(stripDataRegions("r\\\nm x")).toBe("rm x");
  });

  it("does not treat an escaped backslash before a newline as a continuation", () => {
    // `\\` is consumed as one escaped backslash, so the newline after it is a
    // real command terminator: two segments, exactly as without the escape.
    const segs = parseCommand("git worktree \\\\\n add ../wt x", {
      quoted: "blank",
    }).segments;
    expect(segs.map((s) => s.text)).toEqual(["git worktree \\\\", "add ../wt x"]);
  });

  it("leaves a lone trailing backslash alone", () => {
    expect(stripDataRegions("rm x \\")).toBe("rm x \\");
  });

  it("does NOT splice inside single quotes — the quotes suppress the escape", () => {
    const { parsed, perSegment } = words("echo 'rm \\\n rules/x.md'", "capture");
    // One command word (`echo`), and the literal still carries the pair.
    expect(perSegment.map((w) => w[0])).toEqual(["echo"]);
    expect([...parsed.literals.values()]).toEqual(["rm \\\n rules/x.md"]);
  });

  it("DOES splice inside double quotes — bash removes it there", () => {
    const { parsed, perSegment } = words('rm "rules/\\\nx.md"', "capture");
    expect(parsed.segments.length).toBe(1);
    expect(perSegment[0].length).toBe(2);
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "rules/x.md",
    });
  });

  it("keeps every other double-quoted escape pair byte-for-byte", () => {
    expect(stripDataRegions('echo "a \\" b \\$X"')).toBe('echo "a \\" b \\$X"');
  });

  it("does not reinterpret a continuation inside a heredoc body", () => {
    // A heredoc body is data the command READS. A quoted delimiter blanks it;
    // an unquoted one is retained as code (fail-closed, so a hidden `$(…)`
    // still classifies) but its content is passed through untouched either way.
    const quotedDelim = "cat > /tmp/n <<'EOF'\nrm \\\nrules/x.md\nEOF";
    expect(words(quotedDelim, "capture").perSegment.flat()).toEqual([
      "cat",
      ">",
      "/tmp/n",
      "<<",
      "EOF",
    ]);
    const bareDelim = "cat > /tmp/n <<EOF\nrm \\\nrules/x.md\nEOF";
    expect(
      parseCommand(bareDelim, { quoted: "capture" }).segments.map((s) => s.text),
    ).toEqual(["cat > /tmp/n <<", "rm \\", "rules/x.md", "EOF"]);
  });

  it("splices inside a $(…) body and still leaves the filler outside", () => {
    const segs = parseCommand("rm \\\n$(echo \\\n x)", { quoted: "capture" })
      .segments;
    expect(segs).toEqual([
      { text: "rm $(…)", depth: 0, joiner: "start" },
      { text: "echo  x", depth: 1, joiner: "start" },
    ]);
  });

  it("agrees with the legacy segmenter on a continued command (blank mode)", () => {
    // The harvested corpus contains no continuation, so pin the equivalence
    // for this shape directly.
    for (const cmd of [
      "git worktree \\\n add ../wt x",
      "git switch \\\n main",
      "git worktree \\\\\n add ../wt x",
      "echo 'a \\\n b' && git switch \\\n main",
    ]) {
      expect(
        parseCommand(cmd, { quoted: "blank" }).segments.map((s) => s.text),
        `command: ${JSON.stringify(cmd)}`,
      ).toEqual(extractCommandSegments(stripDataRegions(cmd)));
    }
  });
});

describe("capture mode keeps a quoted operand readable", () => {
  it("resolves the second word of mv 'rules/x.md' /tmp/", () => {
    const { parsed, perSegment } = words("mv 'rules/x.md' /tmp/", "capture");
    expect(parsed.segments.length).toBe(1);
    expect(parsed.segments[0].depth).toBe(0);
    expect(perSegment[0].length).toBe(3);
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "rules/x.md",
    });
  });

  it("keeps a quoted path with spaces as ONE word", () => {
    const { parsed, perSegment } = words("mv 'my file.txt' /tmp/", "capture");
    expect(perSegment[0].length).toBe(3);
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "my file.txt",
    });
  });

  it("captures an empty quoted argument (sed -i '' on BSD)", () => {
    const { parsed, perSegment } = words(
      "sed -i '' 's/MUST/may/' rules/x.md",
      "capture",
    );
    expect(perSegment.length).toBe(1);
    expect(perSegment[0].length).toBe(5);
    expect(resolveWord(perSegment[0][2], parsed.literals)).toEqual({ value: "" });
    expect(resolveWord(perSegment[0][3], parsed.literals)).toEqual({
      value: "s/MUST/may/",
    });
    expect(resolveWord(perSegment[0][4], parsed.literals)).toEqual({
      value: "rules/x.md",
    });
  });

  it("resolves a placeholder glued to surrounding code", () => {
    const { parsed, perSegment } = words("dd of='rules/x.md'", "capture");
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "of=rules/x.md",
    });
  });

  it("resolves adjacent quoted runs as one word", () => {
    const { parsed, perSegment } = words("rm 'a b'/'c d'", "capture");
    expect(perSegment[0].length).toBe(2);
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "a b/c d",
    });
  });

  it("treats quoted text as data, never as a command word", () => {
    // The security property capture mode has to preserve: blanking used to
    // guarantee this, a placeholder has to guarantee it by construction.
    const { perSegment } = words("echo 'mv rules/x.md /tmp'", "capture");
    expect(perSegment.length).toBe(1);
    expect(perSegment[0].length).toBe(2);
    expect(perSegment[0][0]).toBe("echo");
  });

  it("does not let quoted text open a segment, a subshell or a redirect", () => {
    for (const inert of [
      "echo 'rm -rf rules/'",
      "echo '; rm -rf rules/'",
      "echo '&& rm -rf rules/'",
      "echo '| rm -rf rules/'",
      "echo '$(rm -rf rules/)'",
      "echo '`rm -rf rules/`'",
      "echo '> rules/x.md'",
      "echo 'a\nrm -rf rules/'",
    ]) {
      const { perSegment } = words(inert, "capture");
      const commandWords = perSegment.map((w) => w[0]);
      expect(commandWords, `command: ${JSON.stringify(inert)}`).toEqual(["echo"]);
    }
  });

  it("keeps a quoted-delimiter heredoc body blanked in capture mode", () => {
    const cmd = "cat > /tmp/note <<'EOF'\nrm rules/x.md\nEOF";
    const { parsed, perSegment } = words(cmd, "capture");
    const all = perSegment.flat();
    expect(all.some((w) => w.includes("rules/x.md"))).toBe(false);
    expect(
      [...parsed.literals.values()].some((v) => v.includes("rules/x.md")),
    ).toBe(false);
  });

  it("still classifies an UNQUOTED-delimiter heredoc body as code", () => {
    const cmd = "cat > /tmp/note <<EOF\nrm rules/x.md\nEOF";
    const { perSegment } = words(cmd, "capture");
    expect(perSegment.some((w) => w[0] === "rm")).toBe(true);
  });

  /**
   * A DOUBLE-quoted span is captured on the same terms as a single-quoted one
   * when there is nothing in it to expand, because bash performs no
   * redirection, no word splitting and no segmentation inside it either. Until
   * this landed, `git commit -m "docs: rules/a.md -> rules/b.md"` reached the
   * mutation classifier as code and the `>` in the message read as a
   * redirection into `rules/b.md`
   * (`issues/260801-1901_c_a-redirect-operator-inside-a-double-quoted-string-is-read-as-a-redirection.md`).
   */
  it("captures a double-quoted span that expands nothing", () => {
    const { parsed, perSegment } = words(
      'git commit -m "docs: rules/a.md -> rules/b.md"',
      "capture",
    );
    expect(parsed.segments.length).toBe(1);
    expect(perSegment[0].length).toBe(4);
    expect(resolveWord(perSegment[0][3], parsed.literals)).toEqual({
      value: "docs: rules/a.md -> rules/b.md",
    });
  });

  it("lets a captured double-quoted span open no segment and no redirect", () => {
    for (const inert of [
      'echo "> rules/x.md"',
      'echo "; rm -rf rules/"',
      'echo "&& rm -rf rules/"',
      'echo "| rm -rf rules/"',
      'echo "a\nrm -rf rules/"',
    ]) {
      const { perSegment } = words(inert, "capture");
      expect(perSegment.map((w) => w[0]), `command: ${JSON.stringify(inert)}`).toEqual([
        "echo",
      ]);
    }
  });

  it("keeps an EXPANDING double-quoted span as code — the fail-closed direction", () => {
    // The bound of the capture. A `$`, a backtick or an escape means bash would
    // act on the span, so it must still reach the classifiers as code: the
    // `$(…)` body is lifted into its own segment and the outer word resolves
    // unresolved.
    const sub = parseCommand('echo "$(rm rules/x.md)"', { quoted: "capture" });
    expect(sub.segments.map((s) => s.text)).toEqual(['echo "$(…)"', "rm rules/x.md"]);

    const tick = parseCommand('echo "`git switch main`"', { quoted: "capture" });
    expect(tick.segments.some((s) => s.text === "git switch main")).toBe(true);

    const { parsed, perSegment } = words('rm "rules/$X"', "capture");
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({ unresolved: true });
    expect(parsed.literals.size).toBe(0);
  });

  it("leaves an escape-carrying span to the code path, which removes the escape", () => {
    // Capturing would hand back `a\"b` where the word denotes `a"b`, because
    // only `resolveWord`'s code branch unescapes.
    const { parsed, perSegment } = words('rm "a\\"b"', "capture");
    expect(parsed.literals.size).toBe(0);
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({ value: 'ab' });
  });

  it("changes nothing in BLANK mode, which the git classifier consumes", () => {
    for (const cmd of [
      'git commit -m "docs: rules/a.md -> rules/b.md"',
      'echo "> rules/x.md"',
      'echo "$(git switch main)"',
      'git commit -m "a && git switch main"',
    ]) {
      // Sorted, because the flat segmenter reports subshell bodies ahead of the
      // outer segment they were lifted from and `parseCommand` reports source
      // order. The equivalence being pinned here is the SET of segments.
      expect(
        parseCommand(cmd, { quoted: "blank" }).segments.map((s) => s.text).sort(),
        `command: ${JSON.stringify(cmd)}`,
      ).toEqual(extractCommandSegments(stripDataRegions(cmd)).sort());
      expect(stripDataRegions(cmd)).toBe(cmd);
    }
  });

  it("cannot have a placeholder forged from the raw command", () => {
    const forged = "mv \u0001q0\u0001 /tmp/";
    const { parsed, perSegment } = words(forged, "capture");
    // The wrapper character is neutralised to whitespace on the way in, so a
    // forged token resolves to its own harmless text, never to a literal.
    expect(parsed.literals.size).toBe(0);
    expect(perSegment[0]).toEqual(["mv", "q0", "/tmp/"]);
    expect(resolveWord("q0", parsed.literals)).toEqual({ value: "q0" });
  });
});

/**
 * A `(…)` subshell is not modelled by the segmenter, so its parentheses arrive
 * glued to the words they touch and hid both the command word and the last
 * operand from every classifier. `tokenize` peels them
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

  it("keeps the $(…) filler whole, parentheses and all", () => {
    // Its pair is not shell grammar; peeling it would leave an unbalanced
    // `$(…` in the deny reason a human reads.
    expect(tokenize(`rm ${SUBSTITUTION_FILLER}`)).toEqual([
      "rm",
      SUBSTITUTION_FILLER,
    ]);
    // A real subshell closing around a substitution sheds ONE paren, not both.
    expect(tokenize(`(echo ${SUBSTITUTION_FILLER})`)).toEqual([
      "echo",
      SUBSTITUTION_FILLER,
    ]);
  });

  it("does not disturb the segmenter it feeds on", () => {
    // The strip is in the tokenizer only, so segment TEXT — which the mutation
    // guard's subshell-scope counter reads — still carries every parenthesis.
    expect(
      parseCommand("(cd rules && ls) && rm x.md", { quoted: "capture" }).segments,
    ).toEqual([
      { text: "(cd rules", depth: 0, joiner: "start" },
      { text: "ls)", depth: 0, joiner: "&&" },
      { text: "rm x.md", depth: 0, joiner: "&&" },
    ]);
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

  it("keeps a quoted $ literal, because single quotes suppress expansion", () => {
    const { parsed, perSegment } = words("rm '$HOME'", "capture");
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      value: "$HOME",
    });
  });

  it("reports unresolved when an expansion is glued to a literal", () => {
    const { parsed, perSegment } = words("rm 'rules/'$X", "capture");
    expect(resolveWord(perSegment[0][1], parsed.literals)).toEqual({
      unresolved: true,
    });
  });
});
