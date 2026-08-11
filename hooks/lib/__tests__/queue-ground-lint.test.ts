import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Work-queue ground lint (issue 260807-1515).
//
// The defect: `fusion-workbench/tasklist.md` outlives the ground it was built
// on. Measured on 260807 — the active Circle was SUPERSEDED mid-session
// (`_t_`→`_s_`) while a queue naming it stayed at the root, and for seven hours
// eleven of its entries described work a commit had already made pointless.
// Several agents read the file as stale that session and none could act on it,
// because `tasklist.md` is taskplanner's alone to write.
//
// Its predecessor (260801-2038) was closed by REGENERATING the file, and the
// file was stale again seven hours later. So the third regeneration is not the
// fix, and this gate does not check for one. What it checks is that the queue's
// standing is settled against `.active-circle` — the CONDITION, not an
// enumeration of state markers, because a rule keyed to the closure markers has
// no event for a supersession and that is exactly how the case got through.
//
// Two halves, and the gate pins both to the acts they ride:
//   - the RETIREMENT rides `rm -f fusion-workbench/.active-circle` at Phase 4
//     step 4 — clearing the pointer is what makes a closure a closure, so it is
//     the one act in that step that cannot be skipped and still leave a closed
//     Circle;
//   - the READ-TIME verdict is stated at the two consumer surfaces named in the
//     record, `/fusion:setup` and `/fusion:next`, so the prevention sits where
//     the queue is read and not only where it was written.
//
// What this gate is, honestly (rules/critical-stance.md §2, §4): it checks that
// the mechanism is PRESENT IN THE PROMPTS and stays attached to those acts. It
// does not run the check and cannot — nothing here executes at session time.
// One assertion pins the prompt's own admission of that, because a section that
// quietly starts reading as a guarantee is how a convention gets mistaken for
// an enforcement. A second pins the same admission about the producer half:
// `agents/taskplanner.md` Step 4 now mandates the ground field (issue
// 260810-0431), and `queue-ground-producer.test.ts` gates that mandate — but a
// gate over the specification's text still cannot make a given session write the
// line, and the section has to keep saying so.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const orchestrator = () => read("agents", "orchestrator.md");
const setupSkill = () => read("skills", "setup", "SKILL.md");
const nextSkill = () => read("skills", "next", "SKILL.md");

/**
 * The `### The queue's ground` section: from its heading to the next heading of
 * any level. Exactly one — two would be two definitions of one invariant.
 */
function groundSection(text: string): string {
  const parts = text.split(/^### The queue's ground\s*$/m);
  expect(
    parts.length,
    `expected exactly one "### The queue's ground" section, found ${parts.length - 1}`,
  ).toBe(2);
  return parts[1].split(/^### /m)[0];
}

/** The one line matching `re`, asserted unique so an anchor cannot silently double. */
function uniqueLine(text: string, re: RegExp, what: string): string {
  const hits = text.split("\n").filter((l) => re.test(l));
  expect(hits.length, `expected exactly one line for ${what}, found ${hits.length}`).toBe(1);
  return hits[0];
}

/**
 * The verdicts the section must keep. Two of them are the rows of the table —
 * one equality between two recorded strings, settled either way — since
 * `agents/taskplanner.md` Step 4 began mandating the ground on every run
 * (260810-0431), which is what let the four-case table collapse into two and the
 * `find -newer` ordering test go. `unaffiliated backlog` is the `none`-on-both-
 * sides reading of row 1: the 260810 queue is exactly that file, entirely valid,
 * and a blanket deletion would have destroyed it. `no ground recorded` is not a
 * row at all — it is the queue written before the mandate, whose ground is not
 * recoverable and which is now named rather than guessed at.
 */
const VERDICTS: { what: string; re: RegExp }[] = [
  { what: "current — the head names the ground the pointer holds", re: /\bcurrent\b/ },
  { what: "stale — the head names ground that is not the ground any more", re: /\bSTALE\b|\*\*stale\*\*/ },
  { what: "unaffiliated backlog — `none` on both sides", re: /unaffiliated backlog/ },
  { what: "no ground recorded — a queue written before the producer's mandate", re: /NO GROUND RECORDED|\*\*no ground recorded\*\*/ },
];

/**
 * The acts the mechanism rides. The anchor is the ACT — the pointer clear, the
 * pointer write, the consumer's own read step — never the check itself: a check
 * that has drifted away from its carrier must fail here, and it cannot do that
 * if the anchor is the check.
 */
const CALL_POINTS: { what: string; file: () => string; anchor: RegExp; needs: RegExp }[] = [
  {
    what: "Phase 4 step 4 pointer clear (orchestrator)",
    file: orchestrator,
    anchor: /^   \*\*Retire the queue in the same command as that clear\*\*/,
    needs: /same command/,
  },
  {
    what: "step 6.3 pointer write (/fusion:next)",
    file: nextSkill,
    anchor: /^\*\*The pointer write moves the ground/,
    needs: /same command/,
  },
  {
    what: "Step 3 workbench snapshot (/fusion:setup)",
    file: setupSkill,
    anchor: /^- \*\*The work queue's ground\.\*\*/,
    needs: /queue/i,
  },
  {
    what: "Step 5 briefing render (/fusion:next)",
    file: nextSkill,
    anchor: /^4\. \*\*The work queue's ground\*\*/,
    needs: /queue/i,
  },
];

function assertKeysOnThePointer(section: string): void {
  expect(
    section,
    "the section does not key on `.active-circle`. A rule keyed to the closure markers has " +
      "no event for the supersession that produced issue 260807-1515.",
  ).toMatch(/\.active-circle/);
  expect(
    section,
    "the section no longer says the pointer is the condition rather than an event list. That " +
      "sentence is the whole reason option 2 of the record was chosen over option 1.",
  ).toMatch(/condition, not an event list/);
}

function assertRidesTheAct(): void {
  for (const { what, file, anchor, needs } of CALL_POINTS) {
    const line = uniqueLine(file(), anchor, what);
    expect(
      line,
      `${what}: this site no longer carries the queue's ground. A settlement that is not ` +
        `attached to an act the session already performs is one more thing to remember, ` +
        `which is the class of obligation that got skipped in issue 260807-1515.`,
    ).toMatch(needs);
  }
}

describe("the work queue's ground", () => {
  it("is defined once, in the orchestrator, keyed on the pointer", () => {
    assertKeysOnThePointer(groundSection(orchestrator()));
  });

  it("gives every combination of the two inputs a verdict", () => {
    const section = groundSection(orchestrator());
    const table = section.split(/^\| The queue's head \| `\.active-circle` \| Verdict \|$/m)[1];
    expect(
      table,
      "no `| The queue's head | .active-circle | Verdict |` table. Without it a reader has " +
        "the branches of a shell snippet and no statement of what each one means.",
    ).toBeDefined();
    const rows = table.split(/^#### /m)[0].split("\n").filter((l) => /^\|/.test(l));
    expect(
      rows.length,
      "the verdict table does not have two data rows plus its separator. Both inputs are " +
        "recorded strings now, so the table is one equality settled either way; a third row " +
        "means a case is being decided by something other than that comparison, and a first " +
        "missing row means a queue exists that the table does not classify.",
    ).toBe(3);
    for (const { what, re } of VERDICTS) {
      expect(section, `the section no longer covers the verdict: ${what}`).toMatch(re);
    }
  });

  it("never deletes a queue that was not built on the departing ground", () => {
    const text = orchestrator();
    expect(
      text,
      "the retirement no longer restricts itself to a queue whose head names the closing " +
        "Circle. Deleting every queue at a Circle boundary destroys a valid shared backlog — " +
        "the 260810 queue over 34 shared defect records is exactly that file, and the " +
        "record's option 2, applied literally, would have taken it.",
    ).toMatch(/retired only when its own head names the closing Circle/);
    expect(
      text,
      "the retirement no longer uses `mv`. `tasklist.md` is authored text with reasoning and " +
        "acceptance wording, which is why a tracked workbench tracks it (commit 65f7c3b); " +
        "`rm` would discard the one part of it that is not re-derivable from the records.",
    ).toMatch(/Plain `mv`, never `rm`/);
  });

  it("is stated at both consumer surfaces and both pointer writes", () => {
    assertRidesTheAct();
  });

  it("has one canonical implementation that the two skills cite rather than restate", () => {
    for (const [name, body] of [["setup", setupSkill()], ["next", nextSkill()]] as const) {
      expect(
        body,
        `/fusion:${name} does not cite the orchestrator's canonical section. A second copy of ` +
          `the branches is a second thing to keep in agreement.`,
      ).toMatch(/agents\/orchestrator\.md` `### The queue's ground`/);
      expect(
        body,
        `/fusion:${name} restates the branches instead of citing them`,
      ).toMatch(/do not restate the branches here/);
    }
  });

  it("still says plainly that it is a convention, not an enforcement", () => {
    const section = groundSection(orchestrator());
    expect(
      section,
      "the section no longer states what it is. Nothing executes it; a reader who takes it " +
        "for a guarantee will build on a promise the prompt cannot keep " +
        "(rules/critical-stance.md §3).",
    ).toMatch(/A convention, not an enforcement/);
    expect(
      section,
      "the section no longer says what the producer-side mandate is worth. " +
        "`agents/taskplanner.md` Step 4 mandates the ground field and " +
        "`queue-ground-producer.test.ts` gates that mandate, but neither executes at " +
        "session time — a run that skips the line still produces a queue with no ground, " +
        "and the section must not read as if the case were closed (260810-0431).",
    ).toMatch(/A mandate in a prompt is still prompt text/);
  });
});

// The four sites exactly as they stood at HEAD before this change, plus the two
// plausible half-fixes. A gate that has only ever seen the fixed text proves
// nothing about what it would catch.

describe("the gate catches the defect it exists for", () => {
  it("rejects a settlement bolted on beside the pointer clear instead of into it", () => {
    const standalone = [
      "   **Retire the queue in the same command as that clear** (see below).",
      "**The pointer write moves the ground, and the queue does not.** Handle it at the end of the skill.",
      "- **The work queue's ground.** The queue is checked.",
      "4. **The work queue's ground** — the queue is checked.",
    ].join("\n");
    // The 6.3 line has lost "same command": a separate step at the end of the
    // skill is exactly the shape that gets skipped.
    const line = uniqueLine(standalone, /^\*\*The pointer write moves the ground/, "6.3");
    expect(line).not.toMatch(/same command/);
  });

  it("rejects a verdict table that has lost a case", () => {
    // The `current` row alone: the shape a table takes when the case that
    // actually bites — a queue built on ground that has since moved — is the one
    // dropped. One data row plus the separator, where the table needs three.
    const oneRow = [
      "### The queue's ground",
      "",
      "`.active-circle` is the condition, not an event list.",
      "",
      "| The queue's head | `.active-circle` | Verdict |",
      "|---|---|---|",
      "| names a Circle, or `none` | holds the same ground | **current** |",
      "",
      "#### Next",
      "",
      "### After",
    ].join("\n");
    const section = groundSection(oneRow);
    const table = section.split(/^\| The queue's head \| `\.active-circle` \| Verdict \|$/m)[1];
    const rows = table.split(/^#### /m)[0].split("\n").filter((l) => /^\|/.test(l));
    expect(rows.length).not.toBe(3);
  });

  it("rejects a rule keyed to the state markers instead of to the pointer", () => {
    const markerKeyed = [
      "### The queue's ground",
      "",
      "Delete `tasklist.md` when a Circle reaches `_c_` or `_b_`.",
      "",
      "### After",
    ].join("\n");
    expect(() => assertKeysOnThePointer(groundSection(markerKeyed))).toThrow(
      /does not key on `\.active-circle`/,
    );
  });
});
