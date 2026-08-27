// ---------------------------------------------------------------------------
// The stopping-section gate — a live plan must carry `## Where this Circle stops`,
// filled.
//
// WHY THIS EXISTS. `agents/planner.md:131` has carried the section in the plan
// output format since `b200902`, and `:160` made it mandatory at `06ab15b`:
// "is mandatory and is never left as the angle-bracket placeholder". The first
// plan written after both (`b6869aa`) does not carry it, and Phase 4 step 2b —
// the step the mandate exists to feed, which reads the section back to the user
// clause by clause before a Circle closes — took its no-such-section branch on
// the very Circle that built it. The defect is
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0917_*_the-first-plan-written-after-the-stopping-section-was-made-mandatory-does-not-carry-it.md`,
// and this file is its fix direction 1, chosen by the user over directions 2
// (ask at the plan-approval gate) and 3 (stop calling it mandatory).
//
// "Does this file carry this heading, with something under it" is a property
// the file HAS, answered by reading it (`rules/critical-stance.md` §4); that is
// the whole licence for building this, and the exact bound on it.
// PRESENCE, NEVER SUBSTANCE — the stated weakness of fix direction 1, accepted
// here rather than worked around. Nothing below judges whether a clause is
// good, complete, answerable, or true. A plan satisfies this gate with one
// clause of any quality. Whether the clauses hold is what the human is asked at
// Phase 4, and that question is not moved here.
//
// WHAT COUNTS AS FILLED, and why the placeholder is judged too. The mandate has
// two halves — the section is present, and it is never left as the angle-bracket
// placeholder — and the second half is still a question of presence, of a body
// rather than of a heading. A heading over the shipped `<...>` is exactly the
// invisible-at-approval failure the defect describes: it reads as a filled format
// to a skimming eye and gives Phase 4 nothing to read back. So `absent`, `empty`
// and `placeholder` are three named failures, each with its own remedy in the
// message. A placeholder PLUS a real clause passes — that is substance.
//
// THE CORPUS IS LIVE PLANS: `_o_` (open) and `_p_` (in progress) from the
// issues/planning marker vocabulary in `rules/fusion-workbench-conventions.md`
// `## State Markers — issues and planning`; `_c_` and `_d_` are out, and so are
// shaper specs, whose format has no such section. The mandate serves a step
// that runs BEFORE a Circle closes, so the window in which the section must
// exist is exactly the window in which the plan is live, and a plan written
// without it reddens the suite on the day it is written.
// WHAT THIS DOES NOT COVER, stated rather than discovered. At HEAD the live
// corpus is EMPTY: 0 files, and the corpus assertion passes vacuously. It is a
// trap set for the next plan, not a measurement of the current tree. The
// mechanism is therefore pinned on its own, over synthetic documents, so that
// what the gate would do is asserted today even though there is nothing for it
// to do today.
//
// This is a guard, not a fixer (`rules/critical-stance.md` §2): it reads and
// asserts, it never writes a section into a plan.
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fencedContentLines, workbenchRoot, WORKBENCH_PRESENT } from "./helpers/citation-scan.ts";

/** The heading, verbatim from `agents/planner.md:131`. */
const SECTION = "## Where this Circle stops";

/**
 * The issues/planning markers that mean "this plan is still live work". `_c_`
 * and `_d_` are the terminal pair and are out of the corpus; see the header.
 */
const LIVE_MARKERS = new Set(["o", "p"]);

/** `YYMMDD-HHMM_S_<topic>.md` — the marker letter, or null if the name is not of that shape. */
function markerOf(base: string): string | null {
  const m = /^\d{6}-\d{4}_([a-z])_.+\.md$/.exec(base);
  return m ? m[1] : null;
}

/**
 * A shaper spec rather than a planner plan. Decided by the shaper's own two
 * template signatures (`agents/shaper.md:183` — the H1 `# Spec:` and the
 * filename `..._o_spec-<topic>.md`), either of which is sufficient. Both labels
 * are template text and stay English in a `de` project, which the four specs on
 * disk confirm: German bodies under an English `# Spec:` H1.
 *
 * The inverse test — matching plans by their own H1 — was measured and rejected:
 * the 20 plans on disk carry three H1 forms (`# Implementation Plan:`,
 * `# Master Implementation Plan:`, and the `de` `# Umsetzungsplan:` /
 * `# Ausstiegsplan:`), so a plan-side prefix silently drops plans, while the
 * spec side is uniform.
 */
function isSpec(base: string, text: string): boolean {
  const topic = base.replace(/^\d{6}-\d{4}_[a-z]_/, "");
  return topic.startsWith("spec-") || /^#\s+Spec:/m.test(text.split("\n")[0] ?? "");
}

type Verdict = "ok" | "absent" | "empty" | "placeholder";

/**
 * Whether `text` carries a filled stopping section.
 *
 * Fenced content is excluded via `fencedContentLines`, so a plan QUOTING the
 * planner's output format does not satisfy the gate by quotation — the same
 * reasoning `fenced-code-exemption.test.ts` records for the citation scanner.
 *
 * The body runs to the next level-1 or level-2 ATX heading outside a fence, or
 * to end of file. `placeholder` is a body that is one angle-bracket span and
 * nothing else, which catches the shipped placeholder whether it sits on one
 * line or is reflowed across several. A body of two separate bracket spans, or
 * one that merely CONTAINS `<...>`, reads as filled — deliberately, because
 * telling a stub from a clause is substance.
 */
function checkStoppingSection(text: string): Verdict {
  const lines = text.split("\n").map((t, i) => ({ line: i + 1, text: t }));
  const fenced = fencedContentLines(lines);

  const start = lines.findIndex((l, i) => !fenced[i] && l.text.trim() === SECTION);
  if (start < 0) return "absent";

  let end = lines.length;
  for (let j = start + 1; j < lines.length; j++) {
    if (!fenced[j] && /^#{1,2} \S/.test(lines[j].text)) {
      end = j;
      break;
    }
  }

  const body = lines
    .slice(start + 1, end)
    .map((l) => l.text)
    .filter((t) => t.trim() !== "")
    .join("\n")
    .trim();

  if (body === "") return "empty";
  if (/^<[^>]*>$/.test(body)) return "placeholder";
  return "ok";
}

/** Name the file, say what is missing, say what to write. */
const REMEDY: Record<Exclude<Verdict, "ok">, string> = {
  absent:
    `no '${SECTION}' section\n` +
    `    -> add it, in the position the plan output format gives it (agents/planner.md:131 — after\n` +
    `       '## Implementation Steps', before '## Data Structures'), and write one clause per stopping\n` +
    `       condition, each answerable yes or no.`,
  empty:
    `'${SECTION}' is present but its body is empty\n` +
    `    -> write one clause per stopping condition, each answerable yes or no, plus any precondition a\n` +
    `       later act — a release, a tag, a closure — must satisfy first (agents/planner.md:131).`,
  placeholder:
    `'${SECTION}' still holds only its angle-bracket placeholder\n` +
    `    -> replace the '<...>' with the plan's own clauses. agents/planner.md:160 states the section is\n` +
    `       mandatory and is never left as the placeholder; the orchestrator reads these clauses back to\n` +
    `       the user before the Circle closes (agents/orchestrator.md:866), and a placeholder gives it\n` +
    `       nothing to read.`,
};

interface Violation {
  rel: string;
  verdict: Exclude<Verdict, "ok">;
}

function report(violations: Violation[]): string {
  return violations.map((v) => `  ${v.rel}  ${REMEDY[v.verdict]}`).join("\n");
}

/** Every planning store: each Circle's, plus the shared one. */
function planningStores(): string[] {
  const stores: string[] = [];
  const circles = join(workbenchRoot, "circles");
  if (existsSync(circles)) {
    for (const d of readdirSync(circles, { withFileTypes: true })) {
      if (d.isDirectory() && existsSync(join(circles, d.name, "planning"))) {
        stores.push(`circles/${d.name}/planning`);
      }
    }
  }
  if (existsSync(join(workbenchRoot, "shared", "planning"))) stores.push("shared/planning");
  return stores.sort();
}

/** The corpus: live (`_o_`/`_p_`) plans, specs excluded. */
function livePlans(): { rel: string; text: string }[] {
  const out: { rel: string; text: string }[] = [];
  for (const store of planningStores()) {
    for (const base of readdirSync(join(workbenchRoot, store)).sort()) {
      if (!base.endsWith(".md")) continue;
      const marker = markerOf(base);
      if (marker === null || !LIVE_MARKERS.has(marker)) continue;
      const text = readFileSync(join(workbenchRoot, store, base), "utf-8");
      if (isSpec(base, text)) continue;
      out.push({ rel: `${store}/${base}`, text });
    }
  }
  return out;
}

describe("stopping-section lint: every live plan carries a filled '## Where this Circle stops'", () => {
  it.skipIf(!WORKBENCH_PRESENT)("passes over the live planning corpus", () => {
    const violations: Violation[] = [];
    for (const { rel, text } of livePlans()) {
      const verdict = checkStoppingSection(text);
      if (verdict !== "ok") violations.push({ rel, verdict });
    }
    expect(
      violations,
      `a live plan must carry its stopping section, filled:\n${report(violations)}`,
    ).toEqual([]);
  });
});

describe("stopping-section lint: the mechanism", () => {
  const withSection = (body: string) =>
    ["# Implementation Plan: x", "", "## Implementation Steps", "", "1. do it", "", SECTION, "", body, "", "## Data Structures", "", "none"].join("\n");

  it("a filled section passes", () => {
    expect(checkStoppingSection(withSection("This Circle stops when the gate is green."))).toBe("ok");
  });

  it("a missing section is 'absent'", () => {
    expect(checkStoppingSection("# Implementation Plan: x\n\n## Approach\n\nsomething")).toBe("absent");
  });

  it("an empty body is 'empty', whether the next heading or the file end bounds it", () => {
    expect(checkStoppingSection(`# Implementation Plan: x\n\n${SECTION}\n\n## Data Structures\n\nnone`)).toBe("empty");
    expect(checkStoppingSection(`# Implementation Plan: x\n\n${SECTION}\n\n`)).toBe("empty");
  });

  it("the shipped placeholder is 'placeholder', on one line or reflowed", () => {
    const shipped =
      "<The conditions under which this Circle is finished, and any precondition a later act — a release, a tag, a closure — must satisfy first. One clause per condition, each answerable yes or no.>";
    expect(checkStoppingSection(withSection(shipped))).toBe("placeholder");
    expect(checkStoppingSection(withSection("<The conditions under which this\nCircle is finished.>"))).toBe("placeholder");
  });

  it("a placeholder alongside a real clause passes — substance is not judged", () => {
    expect(checkStoppingSection(withSection("<the conditions>\n\nThe suite is green."))).toBe("ok");
  });

  it("the heading inside a fenced block does not satisfy the gate", () => {
    const quoting = ["# Implementation Plan: x", "", "The planner's format reads:", "", "```markdown", SECTION, "", "<the conditions>", "```", "", "## Data Structures"].join("\n");
    expect(checkStoppingSection(quoting)).toBe("absent");
  });

  it("a level-3 heading is body, not a section boundary", () => {
    expect(checkStoppingSection(withSection("### Preconditions\n\nThe review pass has run."))).toBe("ok");
  });
});

describe("stopping-section lint: the corpus filter", () => {
  it("admits the live markers and refuses the terminal ones", () => {
    expect(markerOf("260819-2016_o_four-constraints.md")).toBe("o");
    expect(markerOf("260819-2016_p_four-constraints.md")).toBe("p");
    expect(["o", "p", "c", "d"].filter((m) => LIVE_MARKERS.has(m))).toEqual(["o", "p"]);
    expect(markerOf("260819-2016-a-history-file.md")).toBeNull();
  });

  it("excludes shaper specs by either template signature, and admits every plan H1 on disk", () => {
    expect(isSpec("260814-0738_o_spec-curator.md", "# Implementation Plan: mislabelled")).toBe(true);
    expect(isSpec("260814-0738_o_curator.md", "# Spec: the curator\n")).toBe(true);
    // The four H1 forms the 20 plans carry, English and `de` alike.
    for (const h1 of ["# Implementation Plan: x", "# Master Implementation Plan: x", "# Umsetzungsplan: x", "# Ausstiegsplan: x"]) {
      expect(isSpec("260819-2016_o_topic.md", `${h1}\n`)).toBe(false);
    }
  });

  it.skipIf(!WORKBENCH_PRESENT)("reads every planning store — each Circle's and the shared one", () => {
    const stores = planningStores();
    expect(stores).toContain("shared/planning");
    expect(stores.filter((s) => s.startsWith("circles/")).length).toBeGreaterThan(0);
  });
});
