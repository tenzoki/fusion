/**
 * A queue rebuild has a named owner for its commit — issue `260811-0114`.
 *
 * ## The gap
 *
 * `fusion-workbench/tasklist.md` is `taskplanner`'s alone to write, and
 * `taskplanner` does not commit. The orchestrator commits, and dispatches
 * `taskplanner` at Phase 1 — outside the Turn loop, where Step 3b's staging
 * list does not exist. Neither party owned the handoff, so the 17:23 rebuild of
 * session `260810-1646` (2128 lines, 1409 insertions against the committed
 * copy) and its history entry were named by nobody and committed by nobody for
 * eighteen commits.
 *
 * ## Why the answer is a report field and not a broader `git add`
 *
 * The staging rule at `agents/orchestrator.md` Step 3b step 4 is a **shape**:
 * every path passed to `git add` is one you wrote out yourself. It was installed
 * after the opposite defect — a `git add -u` over a directory staged three
 * deletions whose renamed successors were untracked, and three `_o_` records
 * left HEAD until the repair commit `f38f37d`. The acceptance for `260811-0114`
 * makes preserving that shape a constraint rather than a preference.
 *
 * So the fix is to give the orchestrator paths to write out: `taskplanner` ends
 * every run with a mandated `**Files written:**` field, and Phase 1 stages
 * exactly those paths under the same shape. This gate binds the two sides:
 *
 *   1. the producer's mandate is in `agents/taskplanner.md` — the field, both
 *      spellings (paths and the recorded `none`), and the absolute-path
 *      requirement;
 *   2. the consumer's ownership step is in `agents/orchestrator.md` Phase 1,
 *      citing that field and using the Step 3b commit shape;
 *   3. **the shape is not weakened anywhere in the consumer's prompt** — no
 *      `git add` in `agents/orchestrator.md` grows `-A`, `-u`, `--all`, a `.`,
 *      or a directory argument.
 *
 * The third assertion is the one that matters most, and it is the reason this
 * is a gate rather than a paragraph: the cheapest way to make an unstaged-record
 * report go away is to widen the staging command, and that trade is forbidden.
 *
 * What it cannot do (`rules/critical-stance.md` §3): prove that a taskplanner
 * run emitted the field or that an orchestrator ran the commit. Nothing here
 * executes at session time. A run that skips the field produces a report the
 * consumer calls incomplete, and a commit that misses the files produces a
 * `staging_drift` report from `hooks/tracker.ts` — loud instead of quiet, which
 * is the improvement, not a guarantee.
 *
 * The negative controls call the SAME helpers as the assertions above them,
 * with a fixture in place of the real file.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const taskplanner = () => read("agents", "taskplanner.md");
const orchestrator = () => read("agents", "orchestrator.md");

const FIELD = "**Files written:**";

/* --- the assertions, each taking its input, so a control can drive them ---- */

/** Every `**Files written:**` line a text shows, trimmed. */
function mandatedLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith(FIELD));
}

/** Whether a text mandates the field on every run, `none` included. */
function mandatesEveryRun(text: string): boolean {
  const lines = mandatedLines(text);
  const hasPaths = lines.some((l) => l.includes("/") && !l.endsWith("none"));
  const hasNone = lines.some((l) => /\bnone\b/.test(l));
  return hasPaths && hasNone;
}

/**
 * Every fenced code block in a markdown text.
 *
 * The shape governs COMMANDS, not prose about commands — and the prose here
 * quotes the forbidden forms on purpose. Step 3b step 4 and the Staging check
 * section both write out the `git add -u` that took three records out of HEAD,
 * because naming the defect is how the rule earns its keep. Scanning the running
 * text would flag exactly the sentences that exist to prevent the thing, which
 * is a lint teaching its reader to delete the explanation.
 */
function fencedBlocks(md: string): string[] {
  const out: string[] = [];
  const lines = md.split("\n");
  let open = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("```")) {
      if (open < 0) open = i;
      else {
        out.push(lines.slice(open + 1, i).join("\n"));
        open = -1;
      }
    }
  }
  return out;
}

/**
 * Every `git add` argument list inside a fenced block, as raw strings.
 *
 * Anchored on `git add ` and cut at the first `&&`, `|`, `'`, backtick or
 * newline — which is where a staging command ends in every shape this
 * repository's prompts use.
 */
function gitAddArgs(md: string): string[] {
  const out: string[] = [];
  for (const block of fencedBlocks(md)) {
    for (const m of block.matchAll(/git add ([^\n&|'`]*)/g)) out.push(m[1].trim());
  }
  return out;
}

/** The `git add` argument lists that violate the Step 3b shape, with the reason. */
function weakenedStaging(text: string): string[] {
  const bad: string[] = [];
  for (const args of gitAddArgs(text)) {
    for (const token of args.split(/\s+/).filter((t) => t !== "")) {
      if (token === "-A" || token === "--all" || token === "-u" || token === "--update") {
        bad.push(`${token} in \`git add ${args}\``);
      } else if (token === ".") {
        bad.push(`a bare \`.\` in \`git add ${args}\``);
      } else if (token.endsWith("/")) {
        bad.push(`a directory argument \`${token}\` in \`git add ${args}\``);
      }
    }
  }
  return bad;
}

/* ------------------------------------------------------------------ *
 * 1. The producer's mandate
 * ------------------------------------------------------------------ */

describe("queue rebuild: taskplanner names the files it wrote", () => {
  it("mandates the field on every run, with both spellings shown", () => {
    const text = taskplanner();
    expect(
      mandatedLines(text).length,
      `agents/taskplanner.md shows no ${FIELD} line — Step 6 was reworded; update this parser or restore the mandate`,
    ).toBeGreaterThan(0);
    expect(
      mandatesEveryRun(text),
      "both spellings must be shown: a run that wrote files, and a run that wrote none",
    ).toBe(true);
  });

  it("requires absolute paths, and says why a directory will not do", () => {
    const text = taskplanner();
    expect(text).toMatch(/\*\*Absolute paths/);
    // The consumer's staging rule forbids passing a directory to `git add`, so
    // a directory handed over here is a path it cannot use. The producer has to
    // know that, or it will hand one over.
    expect(text).toMatch(/must not hand over a directory|not .* a directory/);
  });

  it("states that it does not commit, and that the dispatcher does", () => {
    // The boundary is deliberate: one party writes the queue, one party moves
    // the index. The field is what crosses it.
    const text = taskplanner();
    expect(text).toMatch(/You do not commit/);
    expect(text).toMatch(/dispatcher does/);
  });

  it("negative control: a fixture with only one spelling fails the same check", () => {
    expect(mandatesEveryRun(`${FIELD} /abs/tasklist.md`)).toBe(false);
    expect(mandatesEveryRun(`${FIELD} none`)).toBe(false);
    expect(mandatesEveryRun(`${FIELD} /abs/tasklist.md\n${FIELD} none`)).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 2. The consumer's ownership
 * ------------------------------------------------------------------ */

describe("queue rebuild: the orchestrator owns its commit", () => {
  it("Phase 1 stages the field's paths and commits before Phase 2 starts", () => {
    const text = orchestrator();
    const phase1 = text.split("## Phase 1: Work Queue Construction")[1]?.split("\n## ")[0] ?? "";
    expect(phase1, "Phase 1 section not found — heading reworded; update this parser").not.toBe("");

    expect(phase1).toContain(FIELD);
    expect(phase1).toContain("fusion-commit-lock");
    expect(phase1).toMatch(/git commit -F \/tmp\//);
    // The ownership has to be stated, not implied by the presence of a command.
    expect(phase1).toMatch(/you are its owner|yours alone to \*?commit/i);
  });

  it("covers the other taskplanner dispatches, not only Phase 1", () => {
    // The Rebalance gate's Revise Artifact option and the Phase-3 post-verdict
    // dispatch both rebuild the queue and produce the same two files.
    const text = orchestrator();
    expect(text).toMatch(/every `taskplanner` dispatch, not only this one/);
  });

  it("cites the record, so the next reader can find out why", () => {
    expect(orchestrator()).toContain("260811-0114");
  });
});

/* ------------------------------------------------------------------ *
 * 3. The constraint: the shape is not weakened to achieve any of it
 * ------------------------------------------------------------------ */

describe("queue rebuild: the staging shape survives", () => {
  it("no `git add` in the orchestrator's prompt takes a flag, a dot or a directory", () => {
    // Non-vacuity first: a scan that found no staging command at all would pass
    // this and prove nothing.
    expect(
      gitAddArgs(orchestrator()).length,
      "no `git add` found in any fenced block of agents/orchestrator.md — the commit shape was reworded; update this parser",
    ).toBeGreaterThan(0);
    expect(
      weakenedStaging(orchestrator()),
      "the acceptance for 260811-0114 forbids solving it by widening `git add` — see f38f37d for the defect on the other side",
    ).toEqual([]);
  });

  it("Step 3b step 4 still states the shape as a shape", () => {
    const text = orchestrator();
    expect(text).toMatch(/every path passed to `git add` is one you wrote out yourself/);
    expect(text).toMatch(/No `-A`, no `-u`, no directory argument/);
  });

  it("the new Phase 1 step tells the reader not to reach for the flags", () => {
    // A step that adds a commit obligation without this line is a step whose
    // first failure gets answered with `-A`.
    const phase1 =
      orchestrator().split("## Phase 1: Work Queue Construction")[1]?.split("\n## ")[0] ?? "";
    expect(phase1).toMatch(/[Dd]o not reach for a directory argument, `-A` or `-u`/);
  });

  it("negative controls: the same helper flags each forbidden form", () => {
    const fenced = (cmd: string) => "```bash\n" + cmd + "\n```";
    expect(weakenedStaging(fenced("git add -A"))).toHaveLength(1);
    expect(weakenedStaging(fenced("git add -u fusion-workbench"))).toHaveLength(1);
    expect(weakenedStaging(fenced("git add ."))).toHaveLength(1);
    expect(weakenedStaging(fenced("git add fusion-workbench/"))).toHaveLength(1);
    // The permitted shape: written-out paths and nothing else.
    expect(weakenedStaging(fenced("git add <absolute-path> <absolute-path> && git commit"))).toEqual(
      [],
    );
    // And the prose that NAMES the defect is not an offence — it is the reason
    // the rule is followed. This is the case that made the scan fenced-only.
    expect(weakenedStaging("Measured here: a `git add -u` over a directory took three records out of HEAD.")).toEqual(
      [],
    );
  });
});
