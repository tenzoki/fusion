/**
 * A project that upgraded while HALTED is not blocked, is not rewritten, and is
 * offered the one thing left to do about it.
 *
 * ## What this file is, and why it was re-pointed rather than deleted
 *
 * It was written on 2026-08-12, when the protected-path half of the guard was
 * removed, and its subject then was that a halt raised by the vanished mechanism
 * still loaded, still blocked at CHECK 1, and still cleared through
 * `clear-halt.js`. Every one of those three is now false: the halt check, the
 * consecutive-block counter, `lib/escalation.ts` and `clear-halt.ts` all went
 * with the guard's last verdict on 2026-08-16.
 *
 * The file stays because its subject is a MIGRATION and not a mechanism. A
 * consuming project can upgrade across this release carrying `haltActive: true`
 * in `fusion-workbench/.guard-state/escalation.json`, written by code that no
 * longer exists, and what it is owed is exactly three things:
 *
 *   1. nothing blocks — the flag is inert, not merely unreachable;
 *   2. nothing rewrites the file — the guard does not read it, so it must not
 *      touch it either, and a project that keeps the flag keeps it verbatim;
 *   3. there is a way to be rid of it — `/fusion:setup` offers to delete it.
 *
 * Deleting this file would remove the evidence that the removal was survivable,
 * which is a different thing from removing the mechanism. That distinction is
 * why step 9 of the plan re-points this one file and deletes four others.
 *
 * ## Why the two legacy triggers are still enumerated
 *
 * `protected_path_measured` (the tracker's outright halt) and `protected_path`
 * (CHECK 2's third consecutive block) are the two strings no code has been able
 * to produce since 2026-08-12, and a state file carrying one is the shape a
 * migrating project actually holds. The cases run over both rather than over a
 * synthetic one, so what is asserted is what a real upgrade meets.
 *
 * ## What is asserted about the skill, and what that is worth
 *
 * The third property is a TEXT check over `skills/setup/SKILL.md`. No test can
 * assert that `/fusion:setup` makes the offer at run time, because a skill body
 * is a prompt rather than a program — the same honest bound
 * `turn-budget-lint.test.ts` states about its own prompt assertions. What it
 * buys is that the offer cannot quietly leave the skill while the code that made
 * it necessary stays gone.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  REPO_ROOT,
  readEscalation,
  readEvents,
  runBash,
  runWrite,
  withProject,
  type EscalationSnapshot,
} from "./helpers/guard-harness.js";

/** The skill body that carries the migration offer (plan step 1). */
const SETUP_SKILL = resolve(REPO_ROOT, "skills", "setup", "SKILL.md");

/** The legacy state file, relative to a project root. */
const STATE_FILE = "fusion-workbench/.guard-state/escalation.json";

/**
 * The two triggers no surviving code path can produce, with the level each was
 * recorded at. `protected_path_measured` was written by the tracker's outright
 * halt; `protected_path` by the guard's CHECK 2 block, whose third occurrence
 * raised the halt through the counter.
 */
const LEGACY_HALTS: {
  trigger: string;
  level: "halt" | "block";
  message: string;
  filePath: string;
}[] = [
  {
    trigger: "protected_path_measured",
    level: "halt",
    message: "Protected path changed during a Bash call — rules/x.md restored",
    filePath: "rules/x.md",
  },
  {
    trigger: "protected_path",
    level: "block",
    message:
      "Protected path: agents/coder.md cannot be modified directly. " +
      "This path is under compliance guard protection.",
    filePath: "agents/coder.md",
  },
];

/** A halted project carrying exactly one legacy record. */
function haltedOn(
  legacy: (typeof LEGACY_HALTS)[number],
): Partial<EscalationSnapshot> {
  return {
    haltActive: true,
    consecutiveBlocks: 3,
    recentEvents: [
      {
        level: legacy.level,
        trigger: legacy.trigger,
        message: legacy.message,
        toolName: "Edit",
        filePath: legacy.filePath,
      },
    ],
  };
}

for (const legacy of LEGACY_HALTS) {
  describe(`a project carrying a halt recorded as ${legacy.trigger}`, () => {
    it(
      "is not blocked — the write tool goes through and is traced as an allow",
      () => {
        withProject(
          (project) => {
            // `notes.txt` was chosen when this file was written because it was
            // refused by no list, so a block on it could only be the halt. It
            // keeps that role inverted: an allow on it is not evidence, but a
            // BLOCK on it would be, and there is nothing else here that could
            // produce one.
            const res = runWrite(
              project.root,
              resolve(project.root, "notes.txt"),
              "Edit",
            );

            expect(res.decision).toBeUndefined();
            expect(res.reason).toBeUndefined();

            // And the call was traced like any other write. A guard that had
            // silently skipped the project on account of the flag would satisfy
            // the assertion above and fail this one.
            expect(readEvents(project.root).map((e) => e.event)).toEqual([
              "guard_allow",
            ]);
          },
          { escalation: haltedOn(legacy) },
        );
      },
      CASE_TIMEOUT,
    );

    it(
      "keeps the file exactly as the upgrade left it, across a write and a Bash call",
      () => {
        withProject(
          (project) => {
            const path = resolve(project.root, STATE_FILE);
            const before = readFileSync(path, "utf-8");

            runWrite(project.root, resolve(project.root, "notes.txt"));
            runBash(project.root, "ls -la");

            // BYTES, not the parsed shape. The claim is that nothing reads this
            // file, and a loader that read it, coerced it and wrote it back
            // would pass a structural comparison while having rewritten the one
            // explanation a migrating user has for why their project was
            // halted.
            expect(readFileSync(path, "utf-8")).toBe(before);

            const state = readEscalation(project.root);
            expect(state?.haltActive).toBe(true);
            expect(state?.consecutiveBlocks).toBe(3);
            expect(state?.recentEvents.map((e) => e.trigger)).toContain(
              legacy.trigger,
            );
          },
          { escalation: haltedOn(legacy) },
        );
      },
      CASE_TIMEOUT,
    );
  });
}

describe("the remedy the code no longer carries is carried by /fusion:setup", () => {
  const skill = (): string => readFileSync(SETUP_SKILL, "utf-8");

  it("probes for the flag and offers to delete the file", () => {
    const text = skill();

    // The path, so the offer is about the file a migrating project actually
    // has, and the flag, so the probe distinguishes a halted project from one
    // that merely has the file.
    expect(text).toContain(".guard-state/escalation.json");
    expect(text).toContain("haltActive");
    // The offer itself. `clear-halt.js` is gone, so deletion is the whole of
    // what is on the table.
    expect(text).toContain("rm -f ./fusion-workbench/.guard-state/escalation.json");
  });

  it("does not tell the user that deleting it unblocks anything", () => {
    // The one thing the offer must not claim, and the reason step 1 spells it
    // out at length: a user who reads "the halt is cleared" believes write
    // access has just been handed back, and it never left. Nothing is blocked at
    // this version, so nothing is being restored.
    const text = skill();

    expect(text).toContain("nothing is being blocked");
    expect(text).toMatch(/does not clear a halt, unblock writes or restore write access/);
  });

  it("names no script to run, because there is none", () => {
    // `clear-halt.js` was the remedy until 2026-08-16 and its entry point is
    // deleted. A skill still naming it would send a user to run a file that is
    // not in the install.
    expect(skill()).not.toContain("clear-halt");
  });
});
