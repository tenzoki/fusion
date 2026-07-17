import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Marker-format lint gate (plan step 6 / Phase 5).
//
// State markers in filenames use the underscore form (`_o_`, `_t_circle.md`,
// `260716-1847_o_topic.md`), NOT the older bracket form (`[o]`, `[t]-circle.md`).
// The delimiter changed because `[` and `]` are shell-glob metacharacters: a
// marker written into a glob is silently a character class, which hit five sites
// in one session. Only the delimiter changed — the nine marker letters
// (o a t c i b s d p), their meanings, the transitions, and the sort order are
// all unchanged.
//
// This gate keeps the bracket form from creeping back: it fails `npm test` if a
// single-marker-letter bracket token `\[[oatcibspd]\]` appears in `agents/*.md`
// or a non-exempt `skills/*/SKILL.md`. The two exempt skills legitimately name
// the bracket form — `setup` DETECTS it (to route the user to migrate) and
// `migrate` READS it (to reformat a pre-v4 workbench to the underscore form) —
// so the exemption is load-bearing, not cosmetic.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a prompt.
//
// Scope caution: the pattern matches ONLY a single marker letter in single-char
// brackets. It does NOT flag markdown checkboxes `[ ]` / `[x]` (space/`x` are
// not marker letters), POSIX classes `[:lower:]`, char classes `[a-z]` / `[!.]`
// / `[[:space:]]`, ANSI tags like `[1m]`, or link/footnote brackets — none is a
// bare single marker letter, so the narrow pattern excludes them by
// construction.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// The nine state-marker letters. A bracket token wrapping exactly one of these
// is the forbidden form.
const MARKER_LETTERS = "oatcibspd";

// The whole trust surface — the sites allowed to name the bracket form.
// Enumerated explicitly, never pattern-matched: `setup` names the bracket form
// in its detection check (it must recognise the old marker to route to migrate),
// and `migrate`'s entire purpose is to read the old form and rewrite it to the
// underscore form. Every other skill and every agent must use the underscore
// form only.
const EXEMPT_SKILLS = new Set(["setup", "migrate"]);

// A single marker letter in single-char brackets. Global so `scan` can find
// every occurrence on a line; the capture group yields the offending letter for
// an actionable message.
const markerToken = new RegExp(String.raw`\[([${MARKER_LETTERS}])\]`, "g");

interface Violation {
  file: string;
  line: number;
  token: string; // e.g. "[o]"
  letter: string; // e.g. "o"
}

/** All bracket-form state-marker tokens in `text`. */
function scan(file: string, text: string): Violation[] {
  const out: Violation[] = [];
  text.split("\n").forEach((line, i) => {
    markerToken.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = markerToken.exec(line)) !== null) {
      out.push({ file, line: i + 1, token: m[0], letter: m[1] });
    }
  });
  return out;
}

/** An actionable, HYG-NO-SILENT-FAIL message: file, line, token, and the fix. */
function report(violations: Violation[]): string {
  return violations
    .map(
      (v) =>
        `  ${v.file}:${v.line}  bracket-form state marker '${v.token}'\n` +
        `    -> use the underscore form '_${v.letter}_' instead (the delimiter is inert in glob and regex;\n` +
        `       '[' and ']' are shell-glob metacharacters). Only skills/setup and skills/migrate may name the bracket form.`,
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

describe("marker-format lint: no bracket-form state markers in prompts or skills", () => {
  it("passes on the whole tree — every agent and non-exempt skill uses the underscore form", () => {
    const all: Violation[] = [];
    for (const { rel, abs } of gatedFiles()) {
      all.push(...scan(rel, readFileSync(abs, "utf-8")));
    }
    expect(
      all,
      `bracket-form state markers must be rewritten to the underscore form:\n${report(all)}`,
    ).toEqual([]);
  });

  it("the exemption is load-bearing: setup and migrate DO still carry the bracket form", () => {
    // Not cosmetic. setup detects the bracket form to route the user to migrate;
    // migrate reads it to reformat a pre-v4 workbench. If either stopped naming
    // it, the exemption would be dead and should be removed — this asserts the
    // exemption still earns its place.
    for (const skill of ["setup", "migrate"]) {
      const abs = join(pluginRoot, "skills", skill, "SKILL.md");
      const hits = scan(`skills/${skill}/SKILL.md`, readFileSync(abs, "utf-8"));
      expect(
        hits.length,
        `skills/${skill}/SKILL.md is exempt because it legitimately names the bracket form; ` +
          `it no longer does, so the exemption is dead weight — drop it from EXEMPT_SKILLS.`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("marker-format lint: the pattern matches markers, not lookalikes", () => {
  const LOOKALIKES_THAT_MUST_NOT_FIRE: [string, string][] = [
    ["markdown checkbox open", "- [ ] an open task"],
    ["markdown checkbox done", "- [x] a completed task"],
    ["char class lowercase range", "match with `[a-z]` for any letter"],
    ["char class negation", "the glob `[!.]*` skips dotfiles"],
    ["POSIX class", "use `[:lower:]` inside a bracket expression"],
    ["POSIX class bracketed", "grep with `[[:space:]]` for whitespace"],
    ["ANSI escape tag", "the sequence \\033[1m turns on bold"],
    ["multi-letter bracket", "a footnote like [ab] is not a marker"],
    ["digit bracket", "reference [1] in the list"],
  ];

  for (const [label, text] of LOOKALIKES_THAT_MUST_NOT_FIRE) {
    it(`lookalike is not a marker: ${label}`, () => {
      expect(scan("fixture.md", text)).toEqual([]);
    });
  }

  const MARKERS_THAT_MUST_FIRE: [string, string][] = [
    ["open issue marker", "file the defect at issues/260716-1847[o]-topic.md"],
    ["active circle marker", "the record `[a]-circle.md` carries the state"],
    ["turn/active marker", "on `[a]` → `[t]` the orchestrator writes .active-circle"],
    ["closed marker", "skip files with terminal markers like `[c]` entirely"],
    ["implemented decision marker", "rename `[a]` → `[i]` once the code lands"],
  ];

  for (const [label, text] of MARKERS_THAT_MUST_FIRE) {
    it(`bracket-form marker is caught: ${label}`, () => {
      expect(scan("fixture.md", text).length).toBeGreaterThan(0);
    });
  }
});

describe("marker-format lint: a re-introduced bracket marker fails, with an actionable message", () => {
  it("catches a marker injected into a copy of a real prompt, naming file/line/token/fix", () => {
    // Prove the gate fails in the other direction: splice a bracket marker into a
    // copy of a real prompt and confirm it is caught at the right line with the
    // right token — and that the message points at the underscore replacement.
    const original = readFileSync(join(pluginRoot, "agents", "coder.md"), "utf-8").split("\n");
    const injectAt = 4; // 0-based; a body line, not frontmatter
    const copy = [...original];
    copy[injectAt] = "Skip files with the terminal marker [c] before continuing.";

    const violations = scan("agents/coder.md", copy.join("\n"));
    expect(violations.length).toBeGreaterThan(0);

    const hit = violations.find((v) => v.line === injectAt + 1);
    expect(hit, "the injected marker must be caught on its own line").toBeDefined();
    expect(hit!.file).toBe("agents/coder.md");
    expect(hit!.token).toBe("[c]");

    const msg = report(violations);
    expect(msg).toContain("agents/coder.md:5");
    expect(msg).toContain("[c]");
    expect(msg).toContain("_c_");
  });
});
