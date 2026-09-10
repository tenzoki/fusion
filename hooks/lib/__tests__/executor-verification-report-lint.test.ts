import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Executor verification-report lint (issue 260805-0629).
//
// The defect and its measured cost are in issue 260805-0629. The report SHAPE
// that answers it — the three admitted `Verification:` forms and the `Result`
// field derived from them — is authored in `agents/coder.md` `### Report shape`
// and mirrored in `agents/ontocoder.md`.
//
// What this gate is, honestly (rules/critical-stance.md §2, §4): it checks the
// CONTRACT IS PRESENT IN THE PROMPTS, not that any run obeyed it. A prompt
// instruction is overridable under task pressure, nothing here executes at
// dispatch time, and nothing can. What the gate does buy is that the contract
// cannot quietly leave the three prompts, or drift into two divergent shapes
// across the two executors, without `npm test` saying so. The enforcement is
// the orchestrator reading the field; this is the gate that keeps the field
// defined for it to read.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------

const agent = (name: string) => readFileSync(join(pluginRoot, "agents", `${name}.md`), "utf-8");

/** The two executors that report to the orchestrator's `### Step 3 — read the return`. */
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
 * The orchestrator's acceptance step, `### Step 3 — read the return`.
 *
 * It was `5. **Verify output.**` up to `6. **Mark complete.**` — two numbered
 * items of the queue-driven procedure — until 2026-09-10, when that procedure
 * became the dispatch loop and the numbering went with the queue. The step
 * itself did not change: it is the same reading of the same four cases, under
 * a heading instead of a list index.
 */
function verifyOutputStep(text: string): string {
  const parts = text.split(/^### Step 3 — read the return\s*$/m);
  expect(
    parts.length,
    "orchestrator: no `### Step 3 — read the return` section found",
  ).toBe(2);
  return parts[1].split(/^#{2,3} /m)[0];
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

    // The shape used to be anchored on a third prompt: `agents/bugfixer.md`
    // carried the prior-art report and both executors cited it. That agent went
    // at v11 and there is no third prompt left to point at, so the anchor is now
    // MUTUAL — each executor names the other as the co-author of one shape. The
    // property the old assertion bought is unchanged and still measured: there
    // is one reporting mechanism, not two, and a prompt that quietly invented a
    // second would stop citing its counterpart.
    it(`${who} names the other executor as co-author of the one shape`, () => {
      const other = who === "coder" ? "ontocoder" : "coder";
      expect(
        reportShape(agent(who), who),
        `${who}: the report shape does not cite agents/${other}.md as the prompt it shares ` +
          `the contract with. Reuse before you build (rules/critical-stance.md §2) — a ` +
          `second reporting mechanism is what this issue said not to add.`,
      ).toMatch(new RegExp(`agents/${other}\\.md`));
    });

    // What the removed agent actually contributed, and where it went. The
    // diagnose-before-editing contract was the whole of `bugfixer`'s method, and
    // the v11 merge kept it by moving it into both executors rather than by
    // trusting them to re-derive it. An executor that lost it would take a
    // defect task straight to an edit, which is the failure the contract exists
    // to prevent, so the survival is asserted and not assumed.
    it(`${who} carries the diagnose-before-editing contract the bugfixer left behind`, () => {
      const text = agent(who);
      for (const [what, re] of [
        ["reproduce before editing", /\*\*Reproduce it\.\*\*/],
        ["the origin, not the surface", /where the error \*originates\*/],
        ["root cause named with evidence", /\*\*Name the root cause precisely\*\*/],
        ["exactly one root cause", /exactly one root cause/],
        ["revert on a regression", /you introduced a regression/],
      ] as const) {
        expect(
          text,
          `${who}: the diagnose-before-editing contract lost "${what}". It came from the ` +
            `removed bugfixer prompt and this is the only place it now lives.`,
        ).toMatch(re);
      }
    });
  }
});

describe("orchestrator acceptance of an executor report", () => {
  it("reads the verification line where it reads the return", () => {
    expect(
      verifyOutputStep(agent("orchestrator")),
      "orchestrator: Step 3 does not read the report's `Verification:` line. " +
        "A field no one reads is the failure mode issue 260805-0629 named explicitly.",
    ).toMatch(/`Verification:` line/);
  });

  it("treats an absent verification line as an incomplete report, not as done", () => {
    const step = verifyOutputStep(agent("orchestrator"));
    expect(
      step,
      "orchestrator: Step 3 has no branch for a report with no verification line at all — " +
        "the case every pre-fix report fell into.",
    ).toMatch(/the line is absent/);
    expect(
      step,
      'orchestrator: Step 3 does not say that "done" is not a verification result',
    ).toMatch(/"done" is not a verification result/);
  });

  it("refuses to reach the commit step on a report whose verification it cannot name", () => {
    expect(
      verifyOutputStep(agent("orchestrator")),
      "orchestrator: Step 3 does not block the path to the commit. Without that, the " +
        "two executor-side fields are obligations with no reader.",
    ).toMatch(/Never advance to the commit on a report whose verification you cannot name/);
  });

  it("keeps the blocked task out of the mark-complete step", () => {
    expect(
      agent("orchestrator"),
      "orchestrator: the mark-complete bullet marks a task complete without regard to " +
        "the verification line, so a blocked task is still recorded as done.",
    ).toMatch(
      /\*\*Mark the source complete\*\* — but only on a verification you read as passing\. A task the verification line left blocked/,
    );
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
