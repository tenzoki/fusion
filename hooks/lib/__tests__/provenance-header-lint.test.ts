import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative, sep } from "node:path";

// ---------------------------------------------------------------------------
// Provenance-header lint gate (Circle 260801-1244-rule-provenance-header, step 3).
//
// Every file in the plugin's `rules/` directory opens with a line naming what
// caused it to exist — a decision record, a Circle directory, or the honest
// admission plus the introducing commit. A reader who opens a rule then learns,
// within the first ten lines, which record put it there, and so has a way to ask
// whether the reason still holds. The convention is defined in
// `rules/fusion-workbench-conventions.md`, section
// '## Provenance headers on rule files'.
//
// This gate fails `npm test` when a rule file carries no `Provenance:` line in
// its first HEADER_WINDOW lines. It names the offending file and states the fix.
//
// The file set is every `*.md` under `rules/` at ANY depth: `readdirSync`
// recurses, so a newly added rule file is in the set automatically wherever it
// lands. Depth is not a hypothetical — `circles/260801-1244-curator` plans to
// partition `rules/fusion-workbench-conventions.md` into shards and names this
// gate as the check they must pass, and whether they land as `rules/<name>.md`
// or `rules/<subdir>/<name>.md` is not settled anywhere. A non-recursing gate
// would report success on the second shape without having read a single shard.
// Only regular files count (`isFile()`), so a directory whose name happens to
// end in `.md` is skipped rather than handed to `readFileSync` for an EISDIR
// throw. The real corpus is flat, so it cannot itself demonstrate recursion; a
// dedicated describe block below asserts the traversal against a throwaway
// nested tree in the OS temp directory.
//
// There is NO exemption list, deliberately.
// Every file in `rules/` is in scope, and the correct response to a new file
// failing this gate is to write that file a header — not to add it here. The two
// sibling gates that do carry exemptions (`path-literal-lint`,
// `marker-format-lint`) exempt skills that must name a retired form in order to
// migrate away from it; nothing analogous exists for a rule file.
//
// The check is presence-only. It reads no value, resolves no cited path, and
// takes no dependency on the workbench directory — a header citing a record that
// was later moved, archived, or never existed at all still passes. What stops a
// hollow header is review, not this gate.
//
// Position is what makes the check mean anything, and the ten-line window is
// what enforces position: `rules/fusion-workbench-conventions.md` documents this
// very convention and therefore carries the string `Provenance:` deep in its
// body. A keyword-anywhere gate would pass that file on its own documentation
// instead of on its header. The last describe block asserts that distinction
// directly.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a rule file.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// The position rule as a single named constant: a header counts only if it sits
// within this many lines of the file's start. Ten was sized against the
// pre-header corpus, where the longest opening blockquote ran to line 8 in
// `context-manifest.md`, so a header placed after that lede would have landed on
// line 10 and still counted. Every rule file now carries its header at line 3
// instead, above the lede, which pushed that same blockquote down to lines 5-10.
// So the current bound is: the window ends exactly where the corpus's longest
// lede now ends, and the after-the-lede placement no longer fits inside it (in
// that file a header below the lede would sit at line 12). Widening the window
// would let a header drift out of a reader's first glance; the fix for a file
// that cannot fit is to put the header above the lede, as all ten now do.
const HEADER_WINDOW = 10;

// The spec's regex, verbatim — not re-derived here. Anchored (so the keyword
// must open the line), case-sensitive (so prose mentioning "provenance" never
// counts), tolerant of up to three leading spaces (four is Markdown's
// indented-code threshold), of a blockquote marker, and of the bold emphasis.
// The trailing lookahead requires a separator after the keyword, so
// `**Provenance:**x` is not a header line.
const HEADER = /^ {0,3}(?:> ?)?(?:\*\*)?Provenance:(?:\*\*)?(?=\s|$)/;

/**
 * The 1-based line number of the first provenance header within the window, or
 * `null` if the file has none there.
 *
 * A line number rather than a boolean: it is what lets a test assert the window
 * boundary exactly (a header at line 10 is accepted AND is reported as line 10),
 * and it is what lets the real-file tests below strip the header they found.
 */
function headerLine(text: string): number | null {
  const lines = text.split("\n").slice(0, HEADER_WINDOW);
  for (let i = 0; i < lines.length; i++) {
    if (HEADER.test(lines[i])) return i + 1;
  }
  return null;
}

/**
 * Every Markdown file under `dir` at any depth, each paired with its path
 * relative to `relTo` (the form the failure message prints). Directories are
 * dropped by `isFile()`, including one whose own name ends in `.md`. Sorted by
 * that relative path, code-unit order, so a caller can assert the whole set.
 *
 * Parameterised by directory purely so the recursion can be tested: the real
 * corpus is flat and would look identical either way.
 */
function gatedFilesUnder(dir: string, relTo: string): { rel: string; abs: string }[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => {
      const abs = join(e.parentPath, e.name);
      return { rel: relative(relTo, abs).split(sep).join("/"), abs };
    })
    .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

/** The gate's file set: every Markdown file under the plugin's `rules/`. */
function gatedFiles(): { rel: string; abs: string }[] {
  return gatedFilesUnder(join(pluginRoot, "rules"), pluginRoot);
}

/** An actionable, HYG-NO-SILENT-FAIL message: the file, the defect, and the fix. */
function report(missing: string[]): string {
  return missing
    .map(
      (rel) =>
        `  ${rel}  no 'Provenance:' line in the first ${HEADER_WINDOW} lines\n` +
        `    -> add one directly under the H1, e.g. '**Provenance:** shared/decisions/<record>.md'\n` +
        `       or '**Provenance:** circles/<circle-directory>'. If no motivating record is\n` +
        `       recoverable, write exactly:\n` +
        "       '**Provenance:** No motivating record recoverable; introduced in `git:<short-hash>`.'\n" +
        `       The convention is defined in rules/fusion-workbench-conventions.md,\n` +
        `       section '## Provenance headers on rule files'.`,
    )
    .join("\n");
}

// --- fixtures: in-memory strings, never files under rules/ -----------------
// (the one exception is the traversal block below, which needs a real directory
//  tree to have anything to recurse into — it builds one in the OS temp
//  directory and removes it again, and never touches the plugin's own `rules/`.)

const CANONICAL_HEADER =
  "**Provenance:** shared/decisions/260801-1020_a_provenance-header-on-rule-files.md";

/**
 * A rule-file-shaped fixture whose only header sits at 1-based line `n`. Built
 * as an array of lines so a test that needs a header at line 11 says so
 * structurally, rather than by counting characters in a template literal.
 */
function fileWithHeaderAt(n: number): string {
  const lines: string[] = [];
  for (let i = 1; i < n; i++) {
    lines.push(i === 1 ? "# A Rule File" : i === 2 ? "" : `filler prose line ${i}`);
  }
  lines.push(CANONICAL_HEADER);
  lines.push("", "Body prose that continues well past the window.");
  return lines.join("\n");
}

describe("provenance-header lint: every rule file carries a header", () => {
  it("passes on the whole corpus — every rules/**/*.md has a header in the window", () => {
    const missing = gatedFiles()
      .filter(({ abs }) => headerLine(readFileSync(abs, "utf-8")) === null)
      .map(({ rel }) => rel);
    expect(
      missing,
      `every file in rules/ must name what caused it to exist:\n${report(missing)}`,
    ).toEqual([]);
  });

  it("the corpus is non-empty, so the gate cannot pass vacuously", () => {
    // Without this, an empty or misresolved `rules/` directory would satisfy the
    // corpus test with zero files scanned.
    expect(
      gatedFiles().length,
      `no rules/**/*.md files found under ${pluginRoot} — the corpus test above would pass vacuously`,
    ).toBeGreaterThan(0);
  });
});

describe("provenance-header lint: the file set reaches nested rule files", () => {
  // The real corpus is flat — ten files, no subdirectory — so it is exactly the
  // wrong evidence for this property: `gatedFiles()` returns the same ten files
  // whether or not the traversal recurses, so neither the corpus test nor a
  // count assertion over it can tell the two apart. Only a tree that HAS a
  // subdirectory distinguishes them, and building one under `rules/` would mean
  // committing a fake rule file to make a test pass. So the traversal is
  // asserted against a throwaway tree in the OS temp directory, through the same
  // function the gate itself calls (`gatedFiles` is a one-line wrapper over it).
  // Drop `recursive: true` and the first test here fails on the two nested
  // files; drop `withFileTypes`/`isFile()` and the second fails on the directory
  // named like a file. The corpus test would notice neither.
  let root = "";

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), "provenance-tree-"));
    mkdirSync(join(root, "nested", "deeper"), { recursive: true });
    mkdirSync(join(root, "looks-like-a-file.md"), { recursive: true });
    writeFileSync(join(root, "top.md"), "# Top\n");
    writeFileSync(join(root, "notes.txt"), "not markdown\n");
    writeFileSync(join(root, "nested", "deep.md"), "# Deep\n");
    writeFileSync(join(root, "nested", "notes.txt"), "not markdown either\n");
    writeFileSync(join(root, "nested", "deeper", "deepest.md"), "# Deepest\n");
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("collects .md files at every depth, and only .md files", () => {
    expect(gatedFilesUnder(root, root).map((f) => f.rel)).toEqual([
      "nested/deep.md",
      "nested/deeper/deepest.md",
      "top.md",
    ]);
  });

  it("skips a directory whose name ends in .md rather than crashing on it", () => {
    // `readdirSync` without `withFileTypes` returns directory names too, and the
    // corpus test would hand this one to `readFileSync` — an EISDIR throw
    // instead of the gate's own actionable message (HYG-NO-SILENT-FAIL cuts both
    // ways: a wrong-shaped failure is as unhelpful as a silent pass).
    expect(gatedFilesUnder(root, root).map((f) => f.rel)).not.toContain("looks-like-a-file.md");
  });

  it("reports a nested file by its full relative path, subdirectory included", () => {
    // Recursing is only half the fix: the message has to name the file a reader
    // can open. `rel` used to be built as `rules/${basename}`, which for a shard
    // at `rules/conventions/layout.md` would have printed `rules/layout.md`.
    const nested = gatedFilesUnder(root, root).find((f) => f.rel.includes("/"))!;
    expect(nested.rel).toBe("nested/deep.md");
    expect(report([nested.rel])).toContain("nested/deep.md");
  });

  it("finds a headerless nested file that a non-recursing gate would pass over", () => {
    // The property end-to-end, in the gate's own terms: the corpus check is
    // `gatedFiles().filter(no header)`, run here over the temp tree. The nested
    // files carry no `Provenance:` line, so a recursing gate reports all three
    // and a non-recursing one reports only `top.md`.
    const missing = gatedFilesUnder(root, root)
      .filter(({ abs }) => headerLine(readFileSync(abs, "utf-8")) === null)
      .map(({ rel }) => rel);
    expect(missing).toContain("nested/deep.md");
    expect(missing).toContain("nested/deeper/deepest.md");
  });
});

describe("provenance-header lint: the window is exactly the first ten lines", () => {
  it("accepts a header on line 1", () => {
    expect(headerLine(fileWithHeaderAt(1))).toBe(1);
  });

  it("accepts a header on line 3, the canonical placement under the H1", () => {
    expect(headerLine(fileWithHeaderAt(3))).toBe(3);
  });

  it(`accepts a header on line ${HEADER_WINDOW}, the last line in the window`, () => {
    expect(headerLine(fileWithHeaderAt(HEADER_WINDOW))).toBe(HEADER_WINDOW);
  });

  it(`rejects a header on line ${HEADER_WINDOW + 1}, one past the window`, () => {
    // Negative fixture 2 of the three the spec requires: the keyword is present
    // and correctly written, and the file still fails, because position is part
    // of the rule rather than a convenience.
    const text = fileWithHeaderAt(HEADER_WINDOW + 1);
    expect(text.split("\n")[HEADER_WINDOW]).toBe(CANONICAL_HEADER); // it really is at line 11
    expect(headerLine(text)).toBeNull();
    expect(report(["rules/fixture.md"])).toContain(`first ${HEADER_WINDOW} lines`);
  });
});

describe("provenance-header lint: the pattern matches the keyword, not prose", () => {
  const ACCEPTED: [string, string][] = [
    ["bold, canonical form", "**Provenance:** shared/decisions/260801-1020_a_record.md"],
    ["unbolded", "Provenance: circles/260718-1924-v5x-overhaul"],
    ["blockquote form", "> **Provenance:** circles/260718-1924-v5x-overhaul"],
    ["blockquote, no space after the marker", ">**Provenance:** circles/260718-1924-v5x-overhaul"],
    ["three-space indent", "   **Provenance:** circles/260718-1924-v5x-overhaul"],
    [
      "the admission form, verbatim from the spec",
      "**Provenance:** No motivating record recoverable; introduced in `git:dac82b8`.",
    ],
  ];

  for (const [label, line] of ACCEPTED) {
    it(`accepted: ${label}`, () => {
      expect(headerLine(line)).toBe(1);
    });
  }

  const REJECTED: [string, string][] = [
    ["four-space indent is Markdown indented code", "    **Provenance:** shared/decisions/x.md"],
    ["lowercase keyword", "provenance: shared/decisions/x.md"],
    ["no colon", "**Provenance** shared/decisions/x.md"],
    ["no separator after the keyword", "**Provenance:**shared/decisions/x.md"],
    ["the keyword mid-sentence, not opening the line", "See **Provenance:** above for the record."],
    // Long, realistic prose of the kind the corpus actually carries, mentioning
    // provenance mid-sentence. It is rejected at the anchor and nowhere else:
    // after the optional `> ` the pattern requires the keyword and finds `The`.
    // Same rejection as the entry above, in a longer string — case and the
    // missing colon have their own one-line fixtures further up, and neither is
    // reached here.
    [
      "long blockquoted prose mentioning provenance mid-sentence",
      "> The next orchestrator session will pick up the Turn loop against this Circle's " +
        "Directive — close the 7 Stefan-blocked open issues by source-querying " +
        "normative/extracts/, landing changes with pending-stefan provenance markers, " +
        "escaping to decisions/_o_ on ambiguity, and consolidating per-issue close-notes " +
        "+ dossier under consult/.",
    ],
  ];

  for (const [label, line] of REJECTED) {
    it(`rejected: ${label}`, () => {
      expect(headerLine(line)).toBeNull();
    });
  }

  // A test reading `rules/user-facing-output.md` stood here. It asserted that
  // the prose the long fixture above was copied from sits below line 10 of that
  // real file. That is a fact about where a style rule keeps an illustrative
  // example, not a fact about `headerLine`: move the example above line 10 and
  // the test failed while the gate stayed exactly correct, because the anchor
  // rejects that line at every position. Its comment also claimed the fixture
  // proved rejection on case and on the colon, which it never did — the match
  // dies at the anchor before either is reached. Removed rather than corrected,
  // because what it was reaching for is already proved elsewhere and better:
  // position by the window block above (a genuine header, moved one line past
  // the boundary) and by the conventions-file block below (a real decoy that
  // genuinely matches HEADER and is excluded by position alone, with its own
  // non-vacuity guard); every real file's header by the corpus test at the top.
});

describe("provenance-header lint: the three negative fixtures fail, with an actionable message", () => {
  it("negative 1: a rule file with no header at all", () => {
    const text = [
      "# A Rule Without Provenance",
      "",
      "This rule is loaded for every agent and says nothing about where it came from.",
      "",
      "## A section",
      "",
      "More prose.",
    ].join("\n");
    expect(headerLine(text)).toBeNull();

    const msg = report(["rules/a-rule-without-provenance.md"]);
    expect(msg).toContain("rules/a-rule-without-provenance.md");
    expect(msg).toContain(`no 'Provenance:' line in the first ${HEADER_WINDOW} lines`);
    expect(msg).toContain("**Provenance:** shared/decisions/<record>.md");
    expect(msg).toContain("**Provenance:** circles/<circle-directory>");
    expect(msg).toContain("No motivating record recoverable; introduced in `git:<short-hash>`.");
    expect(msg).toContain("## Provenance headers on rule files");
  });

  it(`negative 2: the only header sits at line ${HEADER_WINDOW + 1}`, () => {
    const text = fileWithHeaderAt(HEADER_WINDOW + 1);
    expect(headerLine(text)).toBeNull();
    expect(text).toContain(CANONICAL_HEADER); // the keyword IS in the file, just too low

    const msg = report(["rules/late-header.md"]);
    expect(msg).toContain("rules/late-header.md");
    expect(msg).toContain(`first ${HEADER_WINDOW} lines`);
    expect(msg).toContain("directly under the H1");
  });

  it("negative 3: provenance-adjacent vocabulary does not satisfy the gate", () => {
    // The corpus already uses `Cross-references:` and the section-scoped
    // `Binding decision:` note. Neither states why the FILE exists, so neither
    // counts — a section note never satisfies a file-scoped header.
    const text = [
      "# A Rule With Adjacent Vocabulary",
      "",
      "**Cross-references:** issues/260430-1900_o_rag-sanitisation.md",
      "",
      "Binding decision: decisions/260716-1910_i_bus-protocol-removal.md",
      "",
      "Body prose.",
    ].join("\n");
    expect(headerLine(text)).toBeNull();

    const msg = report(["rules/adjacent-vocabulary.md"]);
    expect(msg).toContain("rules/adjacent-vocabulary.md");
    expect(msg).toContain(`no 'Provenance:' line in the first ${HEADER_WINDOW} lines`);
  });
});

describe("provenance-header lint: a real rule file stripped of its header fails", () => {
  it("catches the header removed from a copy of rules/critical-stance.md, with the fix in the message", () => {
    // Criterion 5's "demonstrated by a fixture rather than by adding a real
    // headerless file to rules/" — the same shape as the injection tests in the
    // two sibling gates, run in the opposite direction: they splice a violation
    // in, this one takes the compliance out.
    const rel = "rules/critical-stance.md";
    const lines = readFileSync(join(pluginRoot, rel), "utf-8").split("\n");

    const at = headerLine(lines.join("\n"));
    expect(at, `${rel} must carry a header for this test to have anything to strip`).not.toBeNull();

    const stripped = [...lines.slice(0, at! - 1), ...lines.slice(at!)].join("\n");
    expect(headerLine(stripped)).toBeNull();

    const msg = report([rel]);
    expect(msg).toContain(rel);
    expect(msg).toContain(`first ${HEADER_WINDOW} lines`);
    expect(msg).toContain("No motivating record recoverable; introduced in");
  });
});

describe("provenance-header lint: the conventions file passes on its header, not on its prose", () => {
  it("passes on its own line-3 header, and fails once that line is removed", () => {
    // The file that documents this convention necessarily contains the string
    // `Provenance:` in its body. This is where the position rule earns its keep:
    // a keyword-anywhere gate would pass this file on its documentation of the
    // rule rather than on its compliance with it.
    const rel = "rules/fusion-workbench-conventions.md";
    const text = readFileSync(join(pluginRoot, rel), "utf-8");
    const lines = text.split("\n");

    // 1. It passes, and it passes on a line inside the window.
    const at = headerLine(text);
    expect(at).not.toBeNull();
    expect(at!).toBeLessThanOrEqual(HEADER_WINDOW);

    // 2. The documentation of the rule really is still in the file, below the
    //    window — without this the third assertion would go vacuous the day the
    //    section is moved or removed.
    const stripped = [...lines.slice(0, at! - 1), ...lines.slice(at!)];
    expect(
      stripped.slice(HEADER_WINDOW).some((l) => l.includes("Provenance:")),
      `${rel} no longer documents the convention below line ${HEADER_WINDOW}, so the ` +
        `next assertion no longer proves that position is what the gate checks`,
    ).toBe(true);

    // 3. With only that one line gone, the file fails — the body prose does not
    //    rescue it.
    expect(headerLine(stripped.join("\n"))).toBeNull();
  });
});
