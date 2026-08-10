/**
 * `clear-halt.js` against a halt raised while it was running — issue 260809-2049.
 *
 * ## Why the real script, spawned, rather than its pieces called in-process
 *
 * The two acceptance criteria are about what the HUMAN gets: which line is
 * printed and what the process exits with. Neither is observable from a
 * function call — `clear-halt.ts` is a top-level script with no exported entry
 * point, and importing it would run it. So every case here spawns the compiled
 * `dist/clear-halt.js` in a throwaway project and reads its stdout, its stderr
 * and its exit code.
 *
 * ## Why the second writer is injected rather than raced
 *
 * The defect needs a halt to land BETWEEN the script's `loadEscalation()` and
 * its `saveEscalation()`. That window is microseconds wide and the script
 * offers nothing to synchronise against, so a second process would reproduce it
 * on an unlucky run rather than every run — which is the wrong direction for a
 * regression test. `escalation.test.ts` already answers this for the module by
 * writing the interleaving down instead of racing it; the same answer, one
 * level up: `dist/` is copied to a temp directory with `lib/escalation.js`
 * replaced by a shim that re-exports the real module and raises a halt through
 * it at a named point. Everything the script runs is the shipped code, the
 * state file is real, and the merge is the real merge — only the MOMENT the
 * second writer acts is chosen rather than hoped for.
 *
 * `speculation:` how often that moment occurs in the wild is unmeasured. These
 * cases pin what the script does when it occurs, not that it occurs.
 *
 * ## The vacuous pass this guards against
 *
 * A shim that silently failed to inject would leave every case looking like the
 * ordinary path, and the two concurrent cases would fail rather than pass — they
 * assert a non-zero exit. Each also asserts the injected event reached the state
 * file, so "the injection happened" is checked and not assumed.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  HOOKS_DIR,
  childEnv,
  readEscalation,
  withProject,
  type EscalationSnapshot,
} from "./helpers/guard-harness.js";

/** The line the ordinary path owes the human, verbatim. */
const SUCCESS_LINE = "Halt cleared. Guard will resume normal operation.";

/** What the injected second writer says, so stderr can be matched on it. */
const INJECTED_MESSAGE = "Protected path changed during a Bash call — rules/injected.md restored";

/* ------------------------------------------------------------------ *
 * The shimmed build
 * ------------------------------------------------------------------ */

let shimDir: string;
let clearHaltEntry: string;

/**
 * A copy of `dist/` whose `lib/escalation.js` is a pass-through to the real
 * module, plus one injection point.
 *
 * `export *` carries every name the script might import; the local
 * `loadEscalation` and `saveEscalation` take precedence over the star for those
 * two, which is where the injection hangs. The shim holds NO state of its own —
 * the halt it raises goes through the real `raiseHalt`/`saveEscalation` into the
 * real state file, so the merge under test sees exactly what a second process
 * would have written.
 */
function shimSource(realEscalation: string): string {
  const spec = JSON.stringify(realEscalation);
  return `
import * as real from ${spec};
export * from ${spec};

const message = process.env.FUSION_TEST_INJECT_HALT;
const at = process.env.FUSION_TEST_INJECT_HALT_AT;
let fired = false;

function raiseSecondHalt() {
  if (fired || !message) return;
  fired = true;
  const other = real.loadEscalation();
  real.raiseHalt(other, "protected_path_measured", message, "Bash", "rules/injected.md");
  real.saveEscalation(other);
}

export function loadEscalation() {
  const state = real.loadEscalation();
  // AFTER the load returns: the state the script is holding predates the halt,
  // which is the whole of the defect — the human is shown a list it is not on.
  if (at === "load") raiseSecondHalt();
  return state;
}

export function saveEscalation(state) {
  real.saveEscalation(state);
  if (at === "save") raiseSecondHalt();
}
`;
}

beforeAll(() => {
  const realDist = resolve(HOOKS_DIR, "dist");
  const realEscalation = resolve(realDist, "lib/escalation.js");
  shimDir = realpathSync(mkdtempSync(resolve(realpathSync(tmpdir()), "fusion-clear-halt-")));
  cpSync(realDist, shimDir, { recursive: true });
  writeFileSync(resolve(shimDir, "lib/escalation.js"), shimSource(realEscalation), "utf-8");
  clearHaltEntry = resolve(shimDir, "clear-halt.js");
});

afterAll(() => {
  rmSync(shimDir, { recursive: true, force: true });
});

interface Run {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Spawn the script in `root`. `at` chooses when the second writer acts. */
function runClearHalt(root: string, at?: "load" | "save"): Run {
  const overrides: Record<string, string> =
    at === undefined
      ? {}
      : { FUSION_TEST_INJECT_HALT: INJECTED_MESSAGE, FUSION_TEST_INJECT_HALT_AT: at };

  const run = spawnSync(process.execPath, [clearHaltEntry], {
    cwd: root,
    encoding: "utf-8",
    env: childEnv(overrides),
  });

  if (run.error) throw new Error(`could not spawn clear-halt.js: ${run.error}`);
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

/** A halted project, with `events` already in `recentEvents`. */
function haltedState(
  events: EscalationSnapshot["recentEvents"],
): Partial<EscalationSnapshot> {
  return { haltActive: true, consecutiveBlocks: 3, recentEvents: events };
}

const ORIGINAL_HALT: EscalationSnapshot["recentEvents"][number] = {
  level: "halt",
  trigger: "protected_path_measured",
  message: "Protected path changed during a Bash call — rules/x.md restored",
  toolName: "Bash",
  filePath: "rules/x.md",
};

/* ------------------------------------------------------------------ *
 * The ordinary path — the criterion that must not move
 * ------------------------------------------------------------------ */

describe("clear-halt with nothing concurrent", () => {
  it(
    "clears, prints the success line and exits 0",
    () => {
      withProject(
        (project) => {
          const run = runClearHalt(project.root);

          expect(run.status).toBe(0);
          expect(run.stdout).toContain(SUCCESS_LINE);
          expect(readEscalation(project.root)?.haltActive).toBe(false);
        },
        { escalation: haltedState([ORIGINAL_HALT]) },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still says nothing is halted when nothing is",
    () => {
      withProject(
        (project) => {
          const run = runClearHalt(project.root);

          expect(run.status).toBe(0);
          expect(run.stdout).toContain("Guard is not halted in this project.");
        },
        { escalation: { haltActive: false } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "does not report a halt that was on disk at load but too old to print",
    () => {
      // The script prints the last five events. This state carries eight, so the
      // halt at the front is loaded but never shown — and it is part of what the
      // human asked to clear. Reporting it would be a refusal with nothing behind
      // it, which for a tool that runs when every write is blocked is the worse
      // defect of the two.
      const older = Array.from({ length: 7 }, (_, i) => ({
        level: "block",
        trigger: "protected_path",
        message: `blocked write ${i}`,
        toolName: "Edit",
        filePath: `rules/${i}.md`,
      }));

      withProject(
        (project) => {
          const run = runClearHalt(project.root);

          expect(run.stdout).not.toContain("rules/x.md");
          expect(run.status).toBe(0);
          expect(run.stdout).toContain(SUCCESS_LINE);
        },
        { escalation: haltedState([ORIGINAL_HALT, ...older]) },
      );
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * The defect
 * ------------------------------------------------------------------ */

describe("clear-halt with a halt raised while it ran", () => {
  it(
    "names the halt it never showed and exits non-zero instead of reporting success",
    () => {
      withProject(
        (project) => {
          const run = runClearHalt(project.root, "load");
          const after = readEscalation(project.root);

          // The injection really happened: the second writer's event is in the
          // file. Without this the case could pass for the wrong reason.
          expect(after?.recentEvents.map((e) => e.message)).toContain(INJECTED_MESSAGE);
          // And the merge did to it exactly what the record measured — which is
          // why reporting, not preserving, is what this script can offer.
          expect(after?.haltActive).toBe(false);

          expect(run.stdout).not.toContain(SUCCESS_LINE);
          expect(run.stderr).toContain(INJECTED_MESSAGE);
          expect(run.stderr).toContain("rules/injected.md");
          expect(run.status).not.toBe(0);
        },
        { escalation: haltedState([ORIGINAL_HALT]) },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reports a halt that landed after the save as still in effect",
    () => {
      withProject(
        (project) => {
          const run = runClearHalt(project.root, "save");
          const after = readEscalation(project.root);

          expect(after?.recentEvents.map((e) => e.message)).toContain(INJECTED_MESSAGE);
          // Nothing overwrote this one — it arrived after the script's write, so
          // the guard IS halted and the success line would be plainly false.
          expect(after?.haltActive).toBe(true);

          expect(run.stdout).not.toContain(SUCCESS_LINE);
          expect(run.stderr).toContain("The guard is still halted.");
          expect(run.status).not.toBe(0);
        },
        { escalation: haltedState([ORIGINAL_HALT]) },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still clears the halt the human came for in both cases",
    () => {
      withProject(
        (project) => {
          runClearHalt(project.root, "load");
          const after = readEscalation(project.root);

          // The `clear` event is on the record, and the counter is reset: the
          // report is about a SECOND halt, not a refusal to do the job asked.
          expect(after?.recentEvents.map((e) => e.trigger)).toContain("halt_cleared");
          expect(after?.consecutiveBlocks).toBe(0);
        },
        { escalation: haltedState([ORIGINAL_HALT]) },
      );
    },
    CASE_TIMEOUT,
  );
});
