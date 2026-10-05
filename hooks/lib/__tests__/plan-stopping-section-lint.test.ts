// ---------------------------------------------------------------------------
// The stopping-section gate — a live plan must carry `## Where this work stops`,
// filled.
//
// WHY THIS EXISTS. `agents/implementation-planner.md` has carried the section in the plan
// output format since `b200902` and made it mandatory at `06ab15b`; the first
// plan written after both does not carry it, and Phase 4 step 2b took its
// no-such-section branch on the very Circle that built it. The measured account
// is the defect record,
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0917_*_the-first-plan-written-after-the-stopping-section-was-made-mandatory-does-not-carry-it.md`,
// and this file is its fix direction 1, chosen by the user over directions 2 and 3.
//
// "Does this file carry this heading, with something under it" is a property
// the file HAS, answered by reading it (`rules/critical-stance.md` §4); that is
// the whole licence for building this, and the exact bound on it.
// PRESENCE, NEVER SUBSTANCE — the stated weakness of fix direction 1, accepted
// here rather than worked around. Nothing below judges whether a clause is
// good, complete, answerable, or true. A plan satisfies this gate with one
// clause of any quality. Whether the clauses hold is what the human is asked at
// `## Closing a work package` step 3, and that question is not moved here.
//
// WHAT COUNTS AS FILLED, and why the placeholder is judged too. The mandate has
// two halves — the section is present, and it is never left as the angle-bracket
// placeholder — and the second half is still a question of presence, of a body
// rather than of a heading. A heading over the shipped `<...>` is exactly the
// invisible-at-approval failure the defect describes: it reads as a filled format
// to a skimming eye and gives that closing step nothing to read back. So `absent`, `empty`
// and `placeholder` are three named failures, each with its own remedy in the
// message. A placeholder PLUS a real clause passes — that is substance.
//
// THE CORPUS IS LIVE PLANS: plan records whose status lies outside the plan
// kind's terminal set (`open`, `in_progress`), read from this workbench's
// record index, never from a marker in a name; requirements-designer specs are
// out, whose format has no such section. The corpus is `lib/plan-size.ts`'s,
// taken by calling it, so the lint and the shipped helper read one definition
// of a live plan (FJ03d step 8 retired this file's marker copy). The mandate
// serves a step that runs BEFORE the work closes, so the window in which the
// section must exist is exactly the window in which the plan is live. A
// workbench that does not read as `json-control` fails the corpus case by its
// format, `legacy` by name. The mechanism is pinned on its own, over synthetic
// documents, so what the gate would do is asserted whatever the tree holds.
//
// This is a guard, not a fixer (`rules/critical-stance.md` §2): it reads and
// asserts, it never writes a section into a plan.
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fencedContentLines, workbenchRoot, WORKBENCH_PRESENT } from "./helpers/citation-scan.ts";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { indexOf } from "./helpers/json-workbench.js";
import { isSpec, measurePlanSizes } from "../plan-size.js";

/** The heading, verbatim from `agents/implementation-planner.md:131`. */
const SECTION = "## Where this work stops";

type Verdict = "ok" | "absent" | "empty" | "placeholder";

/**
 * Whether `text` carries a filled stopping section.
 *
 * Fenced content is excluded via `fencedContentLines`, so a plan QUOTING the
 * implementation-planner's output format does not satisfy the gate by quotation — the same
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
    `    -> add it, in the position the plan output format gives it (agents/implementation-planner.md:131 — after\n` +
    `       '## Implementation Steps', before '## Data Structures'), and write one clause per stopping\n` +
    `       condition, each answerable yes or no.`,
  empty:
    `'${SECTION}' is present but its body is empty\n` +
    `    -> write one clause per stopping condition, each answerable yes or no, plus any precondition a\n` +
    `       later act — a release, a tag, a closure — must satisfy first (agents/implementation-planner.md:131).`,
  placeholder:
    `'${SECTION}' still holds only its angle-bracket placeholder\n` +
    `    -> replace the '<...>' with the plan's own clauses. agents/implementation-planner.md:160 states the section is\n` +
    `       mandatory and is never left as the placeholder; the orchestrator reads these clauses back to\n` +
    `       the user before the work closes (agents/orchestrator.md:866), and a placeholder gives it\n` +
    `       nothing to read.`,
};

interface Violation {
  rel: string;
  verdict: Exclude<Verdict, "ok">;
}

function report(violations: Violation[]): string {
  return violations.map((v) => `  ${v.rel}  ${REMEDY[v.verdict]}`).join("\n");
}

/** The corpus: live plans of this workbench's record index, specs excluded, as `lib/plan-size.ts` measures them. */
function livePlans(): { rel: string; text: string }[] {
  const read = indexOf(workbenchRoot);
  if (read.format === "legacy") throw new Error("fusion-workbench is legacy (no workbench.json: its control data is Markdown); run /fusion:migrate. The stopping-section gate takes its corpus from the record index and has none to judge.");
  if (read.format !== "json-control") throw new Error(`fusion-workbench was not read (${read.unread.cause}); the stopping-section gate has no corpus to judge.`);
  const { rows } = measurePlanSizes(dirname(workbenchRoot), read.index, Number.MAX_SAFE_INTEGER);
  return rows.map(({ rel }) => ({ rel, text: readFileSync(join(workbenchRoot, rel), "utf-8") })).sort((x, y) => x.rel.localeCompare(y.rel));
}

describe("stopping-section lint: every live plan carries a filled '## Where this work stops'", () => {
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
  }, 4 * CASE_TIMEOUT);
});

describe("stopping-section lint: the mechanism", () => {
  const withSection = (body: string) =>
    ["# Implementation Plan: x", "", "## Implementation Steps", "", "1. do it", "", SECTION, "", body, "", "## Data Structures", "", "none"].join("\n");

  it("a filled section passes", () => {
    expect(checkStoppingSection(withSection("This work stops when the gate is green."))).toBe("ok");
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
      "<The conditions under which this work is finished, and any precondition a later act — a release, a tag, a closure — must satisfy first. One clause per condition, each answerable yes or no.>";
    expect(checkStoppingSection(withSection(shipped))).toBe("placeholder");
    expect(checkStoppingSection(withSection("<The conditions under which this\nwork is finished.>"))).toBe("placeholder");
  });

  it("a placeholder alongside a real clause passes — substance is not judged", () => {
    expect(checkStoppingSection(withSection("<the conditions>\n\nThe suite is green."))).toBe("ok");
  });

  it("the heading inside a fenced block does not satisfy the gate", () => {
    const quoting = ["# Implementation Plan: x", "", "The implementation-planner's format reads:", "", "```markdown", SECTION, "", "<the conditions>", "```", "", "## Data Structures"].join("\n");
    expect(checkStoppingSection(quoting)).toBe("absent");
  });

  it("a level-3 heading is body, not a section boundary", () => {
    expect(checkStoppingSection(withSection("### Preconditions\n\nThe review pass has run."))).toBe("ok");
  });
});

describe("stopping-section lint: the spec filter", () => {
  it("excludes requirements-designer specs by either template signature, and admits every plan H1 on disk", () => {
    // `isSpec` is `lib/plan-size.ts`'s: an imported name keeps its marker, a
    // record created since carries the marker-free stamp, and both are read.
    expect(isSpec("260814-0738_o_spec-curator.md", "# Implementation Plan: mislabelled")).toBe(true);
    expect(isSpec("260814-0738-spec-curator.md", "# Implementation Plan: mislabelled")).toBe(true);
    expect(isSpec("260814-0738_o_curator.md", "# Spec: the policy-curator")).toBe(true);
    // The four H1 forms the plans on disk carry, English and `de` alike.
    for (const h1 of ["# Implementation Plan: x", "# Master Implementation Plan: x", "# Umsetzungsplan: x", "# Ausstiegsplan: x"]) {
      expect(isSpec("260819-2016-topic.md", h1)).toBe(false);
    }
  });
});
