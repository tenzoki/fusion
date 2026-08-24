import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Executor verification-report lint (issue 260805-0629).
//
// The defect: `agents/coder.md` told the executor to test, and separately to
// report, and nothing bound the two. The test step had no completion condition
// and the report had no field for its outcome, so an agent that started a long
// check and reported while it was still running violated nothing written down.
// `agents/ontocoder.md` carried the same gap; `agents/orchestrator.md` Step 3a
// step 5 checked scope only and read "done" at face value. Measured cost in a
// consuming session: about forty minutes of wall clock across two dispatches.
//
// The fix is a report SHAPE with nowhere to put a missing verification: the
// `Verification:` field admits exactly three forms — an exit code, a run that
// did not finish, or `none` — and the `Result` field is DERIVED from it, so the
// word "done" is a claim about an exit code rather than about editing being
// finished. The receiving end reads that field before it reads anything else.
//
// What this gate is, honestly (rules/critical-stance.md §2, §4): it checks the
// CONTRACT IS PRESENT IN THE PROMPTS, not that any run obeyed it. A prompt
// instruction is overridable under task pressure — this project has a worked
// case of a "MUST" in the orchestrator prompt losing to the urgency of a user
// request. Nothing here executes at dispatch time and nothing can. What the
// gate does buy is that the contract cannot quietly leave the three prompts, or
// drift into two divergent shapes across the two executors, without `npm test`
// saying so. The enforcement is the orchestrator reading the field; this is the
// gate that keeps the field defined for it to read.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------

const agent = (name: string) => readFileSync(join(pluginRoot, "agents", `${name}.md`), "utf-8");

/** The two executors that report to the orchestrator's Step 3a step 5. */
const EXECUTORS = ["coder", "ontocoder"];

/**
 * The `### Report shape` section: from its heading to the next heading of the
 * same or a higher level. Exactly one per executor prompt — two would be two
 * contracts.
 */
function reportShape(text: string, who: string): string {
  const sections = text.split(/^### Report shape\s*$/m);
  expect(
    sections.length,
    `${who}: expected exactly one "### Report shape" section, found ${sections.length - 1}`,
  ).toBe(2);
  return sections[1].split(/^##+ /m)[0];
}

/**
 * The orchestrator's acceptance step: from `5. **Verify output.**` up to
 * `6. **Mark complete.**`.
 */
function verifyOutputStep(text: string): string {
  const from = text.indexOf("5. **Verify output.**");
  const to = text.indexOf("6. **Mark complete.**", from);
  expect(from, "orchestrator: no `5. **Verify output.**` step found").toBeGreaterThanOrEqual(0);
  expect(to, "orchestrator: no `6. **Mark complete.**` step after step 5").toBeGreaterThan(from);
  return text.slice(from, to);
}

/**
 * The three permitted forms of the `Verification:` field, and the derivation of
 * `Result` from it. Asserted on the report-shape section of an executor prompt.
 *
 * The split is MECE over one question — did a verification run produce an exit
 * code: it did (form 1), it ran and did not (form 2), it never ran (form 3).
 * Losing any one of the three reopens the hole, because the omitted case then
 * has no field to land in and lands in silence instead.
 */
function assertReportShape(section: string, who: string): void {
  expect(section, `${who}: the report shape names no \`Verification:\` field`).toMatch(
    /`Verification: <exact command> — exit <n>`/,
  );
  expect(
    section,
    `${who}: no form for a check that ran without returning a code. An executor whose ` +
      `run never finished then has nowhere to say so — issue 260805-0629 exactly.`,
  ).toMatch(/did not finish/);
  expect(
    section,
    `${who}: no form for "I ran nothing". Without it the field can be omitted rather ` +
      `than answered, which is the omission the shape exists to make impossible.`,
  ).toMatch(/`Verification: none — <why not>`/);

  // The word "done" must be defined by the field, not asserted alongside it.
  expect(
    section,
    `${who}: the report shape does not derive its result from the verification field. ` +
      `An independently-stated "done" is the pre-fix contract with a fourth bullet added.`,
  ).toMatch(/`done` requires the first form \*\*with `exit 0`\*\*/);
  expect(section, `${who}: the shape never names \`blocked\` as the other outcome`).toMatch(
    /`blocked`/,
  );
}

describe("executor report shape", () => {
  for (const who of EXECUTORS) {
    it(`${who} defines the three-form verification field and derives its result from it`, () => {
      assertReportShape(reportShape(agent(who), who), who);
    });

    it(`${who} requires its check to run to completion before the report`, () => {
      const text = agent(who);
      expect(
        text,
        `${who}: nothing binds the check's completion to the report. The test step needs ` +
          `an explicit completion condition (issue 260805-0629).`,
      ).toMatch(/\*\*to completion\*\*|to completion, with the exit code in hand/);
      expect(
        text,
        `${who}: the prompt does not forbid reporting while the run is in flight`,
      ).toMatch(/while (the|a) run is still in flight/);
    });

    it(`${who} points at the bugfixer's shape rather than inventing a second one`, () => {
      expect(
        reportShape(agent(who), who),
        `${who}: the report shape does not cite agents/bugfixer.md as the shape it extends. ` +
          `Reuse before you build (rules/critical-stance.md §2) — a second reporting ` +
          `mechanism is what this issue said not to add.`,
      ).toMatch(/agents\/bugfixer\.md/);
    });
  }

  it("bugfixer still carries the verification field the two executors extend", () => {
    expect(
      agent("bugfixer"),
      "bugfixer: the prior-art report no longer names a verification result. The two " +
        "executors cite it as the shape they extend; that citation is now false.",
    ).toMatch(/Verification result/);
  });
});

describe("orchestrator acceptance of an executor report", () => {
  it("reads the verification line at Step 3a step 5", () => {
    expect(
      verifyOutputStep(agent("orchestrator")),
      "orchestrator: Step 3a step 5 does not read the report's `Verification:` line. " +
        "A field no one reads is the failure mode issue 260805-0629 named explicitly.",
    ).toMatch(/`Verification:` line/);
  });

  it("treats an absent verification line as an incomplete report, not as done", () => {
    const step = verifyOutputStep(agent("orchestrator"));
    expect(
      step,
      "orchestrator: step 5 has no branch for a report with no verification line at all — " +
        "the case every pre-fix report fell into.",
    ).toMatch(/the line is absent/);
    expect(
      step,
      'orchestrator: step 5 does not say that "done" is not a verification result',
    ).toMatch(/"done" is not a verification result/);
  });

  it("refuses to reach the commit step on a report whose verification it cannot name", () => {
    expect(
      verifyOutputStep(agent("orchestrator")),
      "orchestrator: step 5 does not block the path to Step 3b's commit. Without that, the " +
        "two executor-side fields are obligations with no reader.",
    ).toMatch(/Never advance to Step 3b's commit on a report whose verification you cannot name/);
  });

  it("keeps the blocked task out of the mark-complete step", () => {
    expect(
      agent("orchestrator"),
      "orchestrator: Step 3a step 6 marks a task complete without regard to the " +
        "verification line, so a blocked task is still recorded as done.",
    ).toMatch(/6\. \*\*Mark complete\.\*\* A task the verification line left blocked/);
  });
});

// The coder's pre-fix Implementation Process, abridged: the `### Report shape`
// heading is supplied so `reportShape()` reaches `assertReportShape`, the
// assertion under test, instead of throwing at the parser (issue 260810-0510).
const preFixCoderProcess = [
  "### Report shape",
  "",
  "1. **Read** the plan or prompt carefully",
  "3. **Implement** following the plan strictly — no improvisation",
  "4. **Test** your changes compile and pass existing tests",
  "5. **Log** to `$OUT_HISTORY` what you implemented",
  "6. **Report** to user: list of changed files + history file path",
  "",
  "## Resuming Interrupted Sessions",
].join("\n");

describe("the gate catches the defect it exists for", () => {
  it("rejects the pre-fix two-field report", () => {
    expect(() => assertReportShape(reportShape(preFixCoderProcess, "pre-fix"), "pre-fix")).toThrow(
      /names no `Verification:` field/,
    );
  });

  it("rejects a report shape that states an exit code but keeps 'done' independent of it", () => {
    const halfFixed = [
      "### Report shape",
      "",
      "1. **Files changed** — every file you modified.",
      "2. **Verification** — `Verification: <exact command> — exit <n>`, or ",
      "   `Verification: <exact command> — did not finish: <what stopped it>`, or",
      "   `Verification: none — <why not>`.",
      "3. **Result** — `done` when the work is finished, `blocked` otherwise.",
      "",
      "## Next section",
    ].join("\n");
    expect(() => assertReportShape(reportShape(halfFixed, "half-fixed"), "half-fixed")).toThrow(
      /does not derive its result from the verification field/,
    );
  });
});
