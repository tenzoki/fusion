/**
 * A halt raised by the protected-path mechanism still loads, still blocks, and
 * still clears — after the mechanism that raised it is gone.
 *
 * ## What this pins and why it is written first
 *
 * The plan this belongs to removes the protected-path half of the guard: the
 * before/after fingerprint pair, the write-tool deny that reads
 * `guard.protectedPaths`, and the two triggers they wrote into
 * `escalation.json`. What it deliberately does NOT remove is `clear-halt.js`,
 * because a consuming project can upgrade while HALTED, and the state file it
 * carries across that upgrade was written by code that will no longer exist.
 *
 * A halt is not auto-cleared on upgrade. That is a decision, not an omission:
 * a halt is a state a human chose to be in, and silently lifting one would be a
 * second surprise stacked on the first. So the only way out is the same as it
 * always was, and this file is the assertion that the way out still works.
 *
 * The two triggers below are the migration's whole subject:
 *
 *   - `protected_path_measured` — what `tracker.ts` wrote when a fingerprint
 *     moved during a tool call. It raised the halt OUTRIGHT, without passing
 *     through the block counter.
 *   - `protected_path` — what `guard.ts` CHECK 2 wrote on a denied write. Three
 *     of them in a row raised the halt through the counter.
 *
 * After the removal neither string can be produced by any code path. A state
 * file carrying one is therefore a shape the new code never writes and only
 * ever reads, which is exactly the case a test has to hold down, because
 * nothing else in the suite will exercise it once the producers are deleted.
 *
 * ## Why it is written BEFORE the surgery rather than after
 *
 * A test written afterwards describes whatever survived. This one is written
 * against the tree as it stands, where it passes, so that any later step which
 * breaks the legacy path fails HERE and names the property it broke — rather
 * than the property being quietly redefined to match the new behaviour. It is
 * the migration guarantee, not a note in a README.
 *
 * ## Why the block message is asserted in full, `cd` included
 *
 * `clearHaltCommand()` in `lib/escalation.ts` builds
 * `cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js`, and the
 * `cd` is load-bearing. The halt is PROJECT-scoped, and the script finds it by
 * walking up from its own working directory: run from anywhere else it reports
 * "no fusion workbench found", exits non-zero, and clears nothing. A message
 * that named only the script would send a halted user to run it from the wrong
 * directory and read a reassuring line about a project it never opened. So the
 * assertion is on the whole command and not on the substring `clear-halt.js`.
 *
 * `CLAUDE_PLUGIN_ROOT` is passed explicitly to the child rather than read from
 * whatever the developer's shell exports, so the expected string is exact on
 * every machine. Without the override the command carries the `<plugin-root>`
 * placeholder on one machine and a real path on another, and the assertion
 * would have to weaken to a substring to survive both.
 *
 * ## Why `dist/clear-halt.js` and not the source
 *
 * That is the artifact the message tells the human to run, and the message is
 * half of what this file pins. `npm test` runs `npm run build` first, so `dist`
 * is current; the harness's `FUSION_GUARD_ENTRY` switch does not reach this
 * script because it is not a hook and has no entry there.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  HOOKS_DIR,
  childEnv,
  readEscalation,
  readEvents,
  runWrite,
  withProject,
  type EscalationSnapshot,
} from "./helpers/guard-harness.js";

/** The line `clear-halt.ts` owes the human on the ordinary path, verbatim. */
const SUCCESS_LINE = "Halt cleared. Guard will resume normal operation.";

/**
 * A plugin root that is not this machine's, so the expected command is the same
 * everywhere. Any absolute path does; this one is obviously synthetic so a
 * failure message cannot be misread as naming a real installation.
 */
const PLUGIN_ROOT = "/opt/fusion-plugin-under-test";

/** The compiled script the halt message tells the user to run. */
const CLEAR_HALT = resolve(HOOKS_DIR, "dist/clear-halt.js");

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

interface Run {
  status: number | null;
  stdout: string;
  stderr: string;
}

function runClearHalt(root: string): Run {
  const run = spawnSync(process.execPath, [CLEAR_HALT], {
    cwd: root,
    encoding: "utf-8",
    env: childEnv({ CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT }),
  });
  if (run.error) throw new Error(`could not spawn clear-halt.js: ${run.error}`);
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

for (const legacy of LEGACY_HALTS) {
  describe(`a halt recorded as ${legacy.trigger}`, () => {
    it(
      "still blocks a write tool, and names the full clearing command",
      () => {
        withProject(
          (project) => {
            // `notes.txt` is not protected by any list, so a block on it can
            // only have come from CHECK 1. The case cannot pass for the
            // protected-path reason by accident — which matters here more than
            // anywhere, since the protected-path reason is the thing going
            // away.
            const res = runWrite(
              project.root,
              resolve(project.root, "notes.txt"),
              "Edit",
              { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
            );

            expect(res.decision).toBe("block");
            expect(res.reason).toContain("[HALTED]");

            // The whole command, `cd` included. See the file header for why a
            // substring match on the script name would be the wrong assertion.
            expect(res.reason).toContain(
              `cd ${project.root} && node ${PLUGIN_ROOT}/hooks/dist/clear-halt.js`,
            );

            // CHECK 1 blocks without touching the counter, so the seeded state
            // is unchanged — and the legacy record is still on it, unread by
            // anything that would drop an unrecognised trigger.
            expect(readEvents(project.root).map((e) => e.event)).toEqual([
              "guard_halt",
            ]);
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

    it(
      "is cleared by clear-halt.js, which reports success and shows the legacy record",
      () => {
        withProject(
          (project) => {
            const run = runClearHalt(project.root);

            expect(run.status).toBe(0);
            expect(run.stdout).toContain(SUCCESS_LINE);

            // The legacy entry reached the human's screen rather than being
            // silently dropped on load. `coerceState` does not validate the
            // elements of `recentEvents`, and this is the assertion that keeps
            // it that way: a later tightening that rejected unknown triggers
            // would blank the one explanation a migrating user has for why
            // their project was halted.
            expect(run.stdout).toContain(legacy.trigger);
            expect(run.stdout).toContain(legacy.message);

            expect(readEscalation(project.root)?.haltActive).toBe(false);
            expect(
              readEscalation(project.root)?.recentEvents.map((e) => e.trigger),
            ).toContain("halt_cleared");
          },
          { escalation: haltedOn(legacy) },
        );
      },
      CASE_TIMEOUT,
    );

    it(
      "lets the write through once the halt is cleared",
      () => {
        withProject(
          (project) => {
            const target = resolve(project.root, "notes.txt");
            expect(runWrite(project.root, target).decision).toBe("block");

            expect(runClearHalt(project.root).status).toBe(0);

            // The end of the migration path: the project is usable again, by
            // the same route it always was.
            expect(runWrite(project.root, target).decision).toBeUndefined();
          },
          { escalation: haltedOn(legacy) },
        );
      },
      CASE_TIMEOUT,
    );
  });
}
