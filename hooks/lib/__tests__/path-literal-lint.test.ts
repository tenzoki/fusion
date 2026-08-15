import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Path-literal lint gate (plan step 8 / P-8).
//
// After the Circle-container conversion, the workbench store paths are defined
// in exactly one executable place — `bin/fusion-paths` — and described in one
// prose place — `rules/fusion-workbench-conventions.md`. Every agent prompt and
// skill body must resolve its write/read targets through `fusion-paths`
// ($OUT_* / $SCAN_* values) and must NOT name an artifact-type folder as a path
// literal. This gate keeps that true: it fails `npm test` if a type-folder path
// literal survives in `agents/*.md` or `skills/*/SKILL.md` outside the two
// skills that legitimately name the pre-v4 layout.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a prompt.
//
// The gate reads only `agents/` and `skills/`. It does NOT read the files that
// DEFINE the stores, because those are not in its file set. That used to be
// stated as a two-item aside; it is now the `DEFINITION_SITES` constant below,
// and the change is deliberate. When `rules/fusion-workbench-conventions.md` was
// partitioned, each shard that inherited a definition also inherited the right
// to name store directories — and it inherited it by passing a gate that never
// looked, not by anyone deciding. An enumeration somebody has to edit is the
// difference between the two. If the file set is ever widened to include these
// paths, they must become explicit exemptions.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// The artifact-store folders. These are the kinds whose location must come from
// `fusion-paths` ($OUT_* / $SCAN_*). `codereview` / `ontoreview` /
// `conceptreview` are the retired pre-v4 review folders (merged into `reviews`);
// they must never reappear in a converted prompt.
//
// Deliberately EXCLUDED: the structural container roots `circles/`, `shared/`,
// `archive/`, `stashes/`. They are not artifact stores — they are the layout's
// roots, legitimately named in prose (help explaining the layout), in Circle
// globs (next/direct citing `circles/<dir>/[m]-circle.md`), and as the
// resolver's own values ($OUT_CIRCLE=circles, $SCAN_CIRCLES=circles). Flagging
// them would fire on legitimate mentions and force wrong exemptions. An
// artifact-type segment nested inside a circle path (e.g. `circles/x/reviews/y`)
// is still caught, because `reviews/` matches on its own.
const TYPE_FOLDERS = [
  "planning",
  "issues",
  "decisions",
  "history",
  "analyses",
  "reviews",
  "consult",
  "investigations",
  "memos",
  "backlog",
  "codereview",
  "ontoreview",
  "conceptreview",
];

// The whole trust surface — the sites allowed to name type folders as paths.
// Enumerated explicitly, never pattern-matched: `setup` names the pre-v4 layout
// in its detection check (it must recognise the old folders to stop before
// mkdir), and `migrate`'s entire purpose is to move those folders. Every other
// skill and every agent must go through `fusion-paths`.
const EXEMPT_SKILLS = new Set(["setup", "migrate"]);

// The files allowed to name a store directory because they DEFINE where a kind
// goes. They are outside the gate's file set by construction — it reads
// `agents/` and `skills/` only — so this list grants nothing. Its job is to make
// the set countable: a fifth definition site is added here in the same commit
// that creates it, or the tree carries one nobody chose. Ordered as the
// conventions file's own header table orders them.
const DEFINITION_SITES = [
  "rules/fusion-workbench-conventions.md", // layout, Origin Rule, operative path resolution
  "bin/fusion-paths", // the executable definition
  "rules/workbench-path-resolution.md", // name namespace, key table, key-set derivation
  "rules/circle-records.md", // Circle markers, record and portfolio templates
];

const alt = TYPE_FOLDERS.join("|");

// The gate matches the path SHAPE, not the bare noun. Two anchored forms, both
// of which read a type folder as a filesystem segment rather than an English
// word that happens to sit next to a slash:
//
//   Suffix form — a type folder followed by a path continuation: a glob (`*`),
//   placeholder (`<`), variable (`$`), a filename (`foo.md`), a datestamp, a
//   quote/backtick, whitespace, or end-of-line. Anything EXCEPT a plain
//   lowercase prose word. This is what separates the real literal
//   `planning/*.md` from the prose "a planning/analysis document": in the
//   latter, `analysis` is a lowercase word terminating on a non-path char, so
//   the negative lookahead excludes it.
const suffixForm = new RegExp(String.raw`\b(${alt})/(?![a-z]+(?![A-Za-z0-9._/-]))`, "g");

//   Prefix form — a type folder used as a segment directly under a workbench
//   path root (`fusion-workbench/`, `$WORKBENCH/`, `$CIRCLE/`). Catches the
//   no-trailing-slash literal `fusion-workbench/planning` that the suffix form
//   would miss. `shared/` is intentionally not a root here: `shared/memos`
//   appears legitimately in memo/SKILL.md (documenting the resolver's fixed
//   output), and it is shape-identical to a hypothetical violation, so a shape
//   gate cannot flag one without the other — it flags neither.
const prefixForm = new RegExp(String.raw`(?:fusion-workbench|\$WORKBENCH|\$CIRCLE)/(${alt})\b`, "g");

interface Violation {
  file: string;
  line: number;
  literal: string;
}

/** The full path-ish token starting at `index`, for a legible message. */
function literalAt(line: string, index: number): string {
  const m = line.slice(index).match(/^[A-Za-z0-9._*<>${}/-]+/);
  return m ? m[0] : line.slice(index);
}

/**
 * All type-folder path literals in `text`. Overlapping matches from the two
 * forms (e.g. `fusion-workbench/planning/` matches both) are collapsed to a
 * single report per region — the leftmost, most-rooted one.
 */
function scan(file: string, text: string): Violation[] {
  const out: Violation[] = [];
  text.split("\n").forEach((line, i) => {
    const spans: { start: number; end: number; literal: string }[] = [];
    for (const re of [prefixForm, suffixForm]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const literal = literalAt(line, m.index);
        spans.push({ start: m.index, end: m.index + literal.length, literal });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
    spans.sort((a, b) => a.start - b.start);
    let coveredTo = -1;
    for (const s of spans) {
      if (s.start <= coveredTo) continue; // overlaps an already-reported literal
      out.push({ file, line: i + 1, literal: s.literal });
      coveredTo = s.end - 1;
    }
  });
  return out;
}

/** An actionable, HYG-NO-SILENT-FAIL message: file, line, literal, and the fix. */
function report(violations: Violation[]): string {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  type-folder path literal '${v.literal}'\n` +
        `    -> resolve it through bin/fusion-paths (a $OUT_* / $SCAN_* value) instead of naming the directory;\n` +
        `       only rules/fusion-workbench-conventions.md and bin/fusion-paths may name type folders.`,
    )
    .join("\n");
}

/** Every agent prompt plus each non-exempt skill body — the gate's file set. */
function gatedFiles(): { rel: string; abs: string }[] {
  const files: { rel: string; abs: string }[] = [];
  for (const f of readdirSync(join(pluginRoot, "agents"))) {
    if (f.endsWith(".md")) files.push({ rel: `agents/${f}`, abs: join(pluginRoot, "agents", f) });
  }
  for (const d of readdirSync(join(pluginRoot, "skills"))) {
    if (EXEMPT_SKILLS.has(d)) continue;
    const abs = join(pluginRoot, "skills", d, "SKILL.md");
    if (existsSync(abs)) files.push({ rel: `skills/${d}/SKILL.md`, abs });
  }
  return files;
}

describe("path-literal lint: no type-folder literals in prompts or skills", () => {
  it("passes on the whole tree — every agent and non-exempt skill is clean", () => {
    const all: Violation[] = [];
    for (const { rel, abs } of gatedFiles()) {
      all.push(...scan(rel, readFileSync(abs, "utf-8")));
    }
    expect(
      all,
      `type-folder path literals must be resolved through bin/fusion-paths:\n${report(all)}`,
    ).toEqual([]);
  });

  it("reads the whole file, frontmatter included", () => {
    // Decision (issue item 1): the gate scans the entire file, frontmatter and
    // all — it does NOT skip the description block. Skipping was tempting
    // (frontmatter edits once broke agent loading, v2.8.1) but the gate is
    // shape-aware, so prose descriptions never false-positive; meanwhile a
    // path literal in a description is a real regression. This is the exact
    // class the pre-fix agent descriptions carried (playmaker's "history/<own>.md"
    // before commit 1508680): a $OUT_*/$SCAN_* value belongs there, not a path.
    const frontmatter = 'description: writes only circles/<file>.md and history/<own>.md\n';
    const v = scan("agents/fixture.md", frontmatter);
    expect(v.map((x) => x.literal)).toContain("history/<own>.md");
  });

  it("does not flag prose descriptions that merely name a kind", () => {
    // A description talking about "planning and analysis documents" is prose,
    // not a path — the shape rule leaves it alone even though the gate reads
    // frontmatter.
    expect(scan("agents/fixture.md", "description: studies planning and analysis documents\n")).toEqual([]);
  });
});

describe("path-literal lint: the shape rule matches paths, not prose", () => {
  // The load-bearing correctness requirement (issue item 3). Fixtures built from
  // the real false-positive lines in the tree today.
  const PROSE_THAT_MUST_NOT_FIRE: [string, string][] = [
    ["conceptrev.md:36", "names the target — a path to a planning/analysis document, or a set of them."],
    ["taskplanner.md:171", "- How many plans/issues/reviews scanned"],
    ["taskplanner.md:71", "Skip files with terminal markers — issues/planning `[c]`/`[d]` — entirely."],
    ["log-activity legend", "defects go in issues, decisions record open questions, analyses study."],
    ["log-activity legend, backlog row", "| b | backlog entries |"],
    ["help layout sentence", "one directory per unit of work under circles/, plus a shared/ store."],
  ];

  for (const [label, text] of PROSE_THAT_MUST_NOT_FIRE) {
    it(`prose is not a path literal: ${label}`, () => {
      expect(scan("fixture.md", text)).toEqual([]);
    });
  }

  const PATHS_THAT_MUST_FIRE: [string, string][] = [
    ["workbench-rooted with trailing slash", "write your plan to fusion-workbench/planning/ now"],
    ["workbench-rooted, no trailing slash", "look under $WORKBENCH/decisions for records"],
    ["type folder + filename", "file the defect at issues/260716-foo.md"],
    ["type folder + glob", "skim planning/*.md for open steps"],
    ["type folder + placeholder", "playmaker writes history/<own>.md"],
    ["retired review folder", "put the review in codereview/latest.md"],
    ["artifact segment nested in a circle path", "read circles/260716-x/reviews/y.md"],
    ["the backlog store", "file the idea at shared/backlog/260812-1720_o_an-idea.md"],
  ];

  for (const [label, text] of PATHS_THAT_MUST_FIRE) {
    it(`path literal is caught: ${label}`, () => {
      expect(scan("fixture.md", text).length).toBeGreaterThan(0);
    });
  }
});

describe("path-literal lint: a re-introduced literal fails, with an actionable message", () => {
  it("catches a literal injected into a copy of a real prompt, naming file/line/literal", () => {
    // Prove the gate fails in the other direction: splice the mandated literal
    // into a copy of a real prompt and confirm it is caught at the right line
    // with the right text — and that the message points to the fix.
    const original = readFileSync(join(pluginRoot, "agents", "coder.md"), "utf-8").split("\n");
    const injectAt = 4; // 0-based; a body line, not frontmatter
    const copy = [...original];
    copy[injectAt] = "See fusion-workbench/planning/ for the current step.";

    const violations = scan("agents/coder.md", copy.join("\n"));
    expect(violations.length).toBeGreaterThan(0);

    const hit = violations.find((v) => v.line === injectAt + 1);
    expect(hit, "the injected literal must be caught on its own line").toBeDefined();
    expect(hit!.file).toBe("agents/coder.md");
    expect(hit!.literal).toBe("fusion-workbench/planning/");

    const msg = report(violations);
    expect(msg).toContain("agents/coder.md:5");
    expect(msg).toContain("fusion-workbench/planning/");
    expect(msg).toContain("bin/fusion-paths");
  });
});

describe("path-literal lint: the definition sites are enumerated, not assumed", () => {
  // What this block does and does not claim. It does NOT detect a new definition
  // site: a file that merely CITES an example path (`decision-record-examples.md`
  // walking a record through its markers, `user-facing-output.md` showing a
  // reference block) is shape-identical to one that DEFINES where a kind goes, so
  // no regex separates them and an exact-set assertion over `rules/` would be
  // noise. What it does is keep the declared list honest: every entry exists,
  // every entry really names a store, and no entry has quietly wandered into the
  // gate's own file set. The decision that a file may define a store is a human
  // one, recorded by editing DEFINITION_SITES and the header table of
  // `rules/fusion-workbench-conventions.md` together.
  it("every declared definition site exists and names at least one store", () => {
    const broken: string[] = [];
    for (const rel of DEFINITION_SITES) {
      const abs = join(pluginRoot, rel);
      if (!existsSync(abs)) {
        broken.push(`${rel} — declared a definition site but does not exist`);
        continue;
      }
      const text = readFileSync(abs, "utf-8");
      suffixForm.lastIndex = 0;
      prefixForm.lastIndex = 0;
      if (!suffixForm.test(text) && !prefixForm.test(text)) {
        broken.push(`${rel} — names no store directory; the entry is stale, remove it`);
      }
    }
    expect(
      broken,
      `DEFINITION_SITES has drifted from the tree:\n  ${broken.join("\n  ")}`,
    ).toEqual([]);
  });

  it("no definition site is inside the gate's own file set", () => {
    const gated = new Set(gatedFiles().map((f) => f.rel));
    const overlap = DEFINITION_SITES.filter((rel) => gated.has(rel));
    expect(
      overlap,
      `${overlap.join(", ")} is both scanned by this gate and declared allowed to name ` +
        `stores. The two cannot both hold: widening the file set means turning these into ` +
        `real exemptions in scan(), not leaving them on a list the gate never consults.`,
    ).toEqual([]);
  });
});

describe("path-literal lint: setup's key needs stay a subset of the orchestrator's", () => {
  // Issue item 4. `skills/setup/SKILL.md` deliberately calls `fusion-paths
  // orchestrator` (documented at skills/setup/SKILL.md Step 2): setup IS the
  // orchestrator's Setup, and the values resolved there are held by the
  // orchestrator for the whole session. So every $OUT_*/$SCAN_* key setup names
  // must be one the orchestrator's prompt names, or `fusion-paths orchestrator`
  // will not emit it and setup's snapshot silently under-reports.
  //
  // This is not the retired key-set-agreement gate (which became a tautology
  // once fusion-paths derived each set by grepping the one prompt that names
  // it). It relates two DIFFERENT prompts and can genuinely drift: drop a
  // `$SCAN_CIRCLES` usage from orchestrator.md, or add a new `$`-key to setup,
  // and the subset breaks.
  function keysNamedIn(rel: string): Set<string> {
    const body = readFileSync(join(pluginRoot, rel), "utf-8");
    const found = body.match(/\$(?:(?:OUT|SCAN)_[A-Z][A-Z_]*|PORTFOLIO|TASKLIST)/g) ?? [];
    return new Set(found.map((m) => m.slice(1)));
  }

  it("every key setup names is a key the orchestrator names", () => {
    const setupKeys = keysNamedIn("skills/setup/SKILL.md");
    const orchestratorKeys = keysNamedIn("agents/orchestrator.md");
    const missing = [...setupKeys].filter((k) => !orchestratorKeys.has(k)).sort();
    expect(
      missing,
      `setup calls 'fusion-paths orchestrator' but names keys the orchestrator prompt does not, ` +
        `so the resolver will not emit them: ${missing.join(", ")}. ` +
        `Add the usage to agents/orchestrator.md or stop relying on it in skills/setup/SKILL.md.`,
    ).toEqual([]);
  });
});
