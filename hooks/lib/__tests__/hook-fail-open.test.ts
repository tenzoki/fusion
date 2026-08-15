/**
 * A hook whose error report fails must still have written its verdict — and a
 * verdict it already reached must survive its own bookkeeping.
 *
 * ## Two halves, one sentence
 *
 * The first half is the fail-open tail: an UNEXPECTED error leaves the hook with
 * no verdict to write, so it writes the permissive one and says why. That is the
 * defect described below, and the first two cases pin it.
 *
 * The second half is every site INSIDE `main` where the guard had ALREADY
 * decided and the record of that decision stood in front of it. There the
 * fail-open verdict is not a fallback but a loss: a deny the guard reached from
 * the config and the path, replaced by an allow because a counter could not be
 * written. Four such sites were measured
 * (`shared/issues/260809-1825_*`, `…2046_*`, `…2045_*`); three of them remain,
 * the fourth having collapsed into its neighbour when the protected-path deny it
 * was reached through was removed. `describe("a verdict the hook already reached
 * survives its own bookkeeping")` below drives each survivor through the real
 * hook subprocess.
 *
 * Both halves are one rule, and `lib/fail-open.ts` states it: the verdict is
 * written first, everything that records it runs after, guarded.
 *
 * ## The defect
 *
 * `guard.ts` and `tracker.ts` each end with a handler whose comment promises
 * fail-open, and each used to call `emitEvent(...)` before `allow()` /
 * `respond()`. `emitEvent` appends to
 * `fusion-workbench/.guard-state/events.jsonl`. Nearly every write these two
 * files make goes under that directory, so an I/O failure there is the likeliest
 * reason the handler runs at all — and while the emit stood ahead of the verdict
 * it threw a second time, the verdict line never ran, and the process exited 1
 * with empty stdout. Measured at `exit=1, STDOUT: []` on both hooks
 * (`shared/issues/260809-1109_*_both-hooks-fail-silent-instead-of-open-….md`).
 *
 * ## Why the directory is made unwritable rather than the fault injected
 *
 * The acceptance criteria name the real failure — an unwritable `.guard-state/`
 * — and it is reachable without touching either hook: `chmod 0555` on the
 * directory, then one ordinary tool call at an unprotected path. `saveEscalation`
 * (guard) and the drift measurement's throttle write (tracker) both write there
 * on the plain allow path, so the throw arrives through production code rather
 * than through a seam opened for the test.
 *
 * ## Why these cases spawn the hooks themselves
 *
 * `runGuard` and `runTracker` in the harness THROW when they see `[guard] Error:`
 * or `[tracker] Error:` on stderr, because a crashed hook would otherwise satisfy
 * every allow-side assertion in the suite. These cases are the ones that want the
 * fail-open path, so they reuse the harness's entry resolution (`guardEntry`,
 * `trackerEntry`) and its environment strip (`childEnv`) and read the raw result.
 *
 * ## What keeps them from passing vacuously
 *
 * Running as root, or on a filesystem that ignores the mode bits, nothing fails
 * and both hooks emit exactly what the criteria ask for — a green run proving
 * nothing. So every case also asserts the marker line on stderr: the fail-open
 * path must have been TAKEN, and a run where it was not fails loudly here.
 */

import { describe, expect, it, vi } from "vitest";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { answer, bestEffort, failOpen } from "../fail-open.js";
import {
  CASE_TIMEOUT,
  DRIFT_SENTENCE_MARKERS,
  childEnv,
  freezeCommitCount,
  guardEntry,
  projectConfig,
  trackerEntry,
  withProject,
} from "./helpers/guard-harness.js";
import type { GuardEntry, ProjectOptions } from "./helpers/guard-harness.js";

/** The unprotected file every tool call here names. */
const PAYLOAD = "notes.txt";

interface RawRun {
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Spawn one hook against `root` and hand back what it wrote, unjudged.
 *
 * The harness runners cannot be reused directly: both treat the fail-open marker
 * as a harness failure, which is precisely the state under test.
 */
function runRaw(
  entry: GuardEntry,
  root: string,
  event: string,
  toolName: string,
  toolInput: Record<string, unknown>,
): RawRun {
  const run = spawnSync(entry.bin, entry.args, {
    cwd: root,
    encoding: "utf-8",
    env: childEnv(),
    input: JSON.stringify({
      session_id: "fail-open-harness",
      hook_event_name: event,
      tool_name: toolName,
      tool_input: toolInput,
    }),
  });

  if (run.error) {
    throw new Error(`harness could not spawn ${entry.label}: ${run.error}`);
  }
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

/**
 * A throwaway project whose `.guard-state/` exists and cannot be written.
 *
 * It has to EXIST: the state writers call `mkdirSync(dir, {recursive: true})`
 * first, which would happily create a writable one under the writable
 * `fusion-workbench/` and the case would test nothing. The mode is restored
 * before disposal so the cleanup does not depend on how the platform treats
 * removing a read-only directory.
 */
function withUnwritableStateDir<T>(
  fn: (root: string) => T,
  opts: Omit<ProjectOptions, "plugin"> & { prepare?: (root: string) => void } = {},
): T {
  const { prepare, ...projectOpts } = opts;
  return withProject(({ root }) => {
    // `prepare` runs BEFORE the mode change and outside `.guard-state/`: a case
    // that needs the tracker to have something to report has to arrange it
    // while the project is still writable.
    prepare?.(root);
    const dir = resolve(root, "fusion-workbench", ".guard-state");
    // After `makeProject` has seeded any `escalation` the case asked for — a
    // halted project cannot be built once the directory is read-only.
    mkdirSync(dir, { recursive: true });
    chmodSync(dir, 0o555);
    try {
      return fn(root);
    } finally {
      chmodSync(dir, 0o755);
    }
  }, projectOpts);
}

/** Parse a hook's stdout, failing with the raw text when it is not JSON. */
function verdictOf(run: RawRun, label: string): Record<string, unknown> {
  try {
    return JSON.parse(run.stdout) as Record<string, unknown>;
  } catch {
    throw new Error(
      `${label} emitted unparseable stdout: ${JSON.stringify(run.stdout)}\nstderr:\n${run.stderr}`,
    );
  }
}

describe("an unwritable .guard-state/ does not cost a hook its verdict", () => {
  it(
    "guard allows the call, exits 0, and still says why on stderr",
    () => {
      withUnwritableStateDir((root) => {
        const run = runRaw(guardEntry(), root, "PreToolUse", "Edit", {
          file_path: resolve(root, PAYLOAD),
        });

        // The fail-open path was genuinely taken. Without this the case passes
        // for anyone whose writes are not stopped by the mode bits.
        expect(run.stderr).toContain("[guard] Error:");

        // The contract with Claude Code: a bare `{}`, which is the allow.
        expect(verdictOf(run, "guard")).toEqual({});
        expect(run.status).toBe(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "tracker replies with a valid envelope, exits 0, and still says why on stderr",
    () => {
      // The project has to have DRIFTED for this case to have a subject. Until
      // 2026-08-15 it did not need to: the churn heatmap wrote to
      // `.guard-state/` on every write-tool call whatever the project's state,
      // so an unwritable directory always produced a throw. With the heatmap
      // gone the tracker writes there only when a measurement has something to
      // record, and a project with nothing to report now correctly writes
      // nothing at all. Drift is what makes the throttle write happen.
      withUnwritableStateDir(
        (root) => {
          const run = runRaw(trackerEntry(), root, "PostToolUse", "Edit", {
            file_path: resolve(root, PAYLOAD),
          });

          expect(run.stderr).toContain("[tracker] Error:");

          // The verdict survived the failed record: the drift sentence is a
          // well-formed PostToolUse reply, and it is what the throw used to
          // take out.
          const body = verdictOf(run, "tracker") as {
            hookSpecificOutput?: { additionalContext?: string };
          };
          const sentence = body.hookSpecificOutput?.additionalContext ?? "";
          for (const marker of DRIFT_SENTENCE_MARKERS) {
            expect(sentence).toContain(marker);
          }
          expect(run.status).toBe(0);
        },
        { git: true, prepare: freezeCommitCount },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "tracker with nothing to report writes nothing, so nothing can fail",
    () => {
      // The other half of the change above, pinned so it is a property rather
      // than an accident: an ordinary write in a project with no drift, no
      // review file and no moved HEAD makes the tracker touch `.guard-state/`
      // not at all. A read-only directory is therefore not an error condition
      // for it, and the reply is the bare `{}` this hook has always emitted.
      withUnwritableStateDir((root) => {
        const run = runRaw(trackerEntry(), root, "PostToolUse", "Edit", {
          file_path: resolve(root, PAYLOAD),
        });

        expect(run.stderr).not.toContain("[tracker] Error:");
        expect(verdictOf(run, "tracker")).toEqual({});
        expect(run.status).toBe(0);
      });
    },
    CASE_TIMEOUT,
  );

});

/**
 * The sites where the hook had already decided, and the record of the decision
 * stood in front of it.
 *
 * Each case makes the guard's own bookkeeping fail and then asserts the verdict
 * anyway. They are written as SUBPROCESS runs rather than unit calls for the
 * reason the harness header gives — the self-detect answer is cached per process
 * — and they read the raw result because the marker line they require is exactly
 * what `runGuard` treats as a harness failure.
 *
 * The marker assertion is what keeps each case from passing vacuously: running
 * as root, or on a filesystem that ignores the mode bits, nothing fails and the
 * deny arrives for the ordinary reason, proving nothing about the ordering.
 */
describe("a verdict the hook already reached survives its own bookkeeping", () => {
  it(
    "denies a write in a HALTED project with the state directory unwritable",
    () => {
      // CHECK 1, and the site that shows why enumerating this class by call name
      // missed one: it fails through `emitEvent` writing `events.jsonl`, not
      // through `saveEscalation`. The payload is the UNPROTECTED file, so the
      // deny under test can only be the halt.
      withUnwritableStateDir((root) => {
        const run = runRaw(guardEntry(), root, "PreToolUse", "Edit", {
          file_path: resolve(root, PAYLOAD),
        });

        expect(run.stderr).toContain("[guard] Error:");
        const verdict = verdictOf(run, "guard");
        expect(verdict.decision).toBe("block");
        expect(String(verdict.reason)).toContain("[HALTED]");
        expect(run.status).toBe(0);
      }, { escalation: { haltActive: true, consecutiveBlocks: 3 } });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a decision-governed path with the state directory unwritable (260809-1825)",
    () => {
      // CHECK 3, and the `saveEscalation`-after-a-deny site that record names.
      //
      // A second case stood beside this one and made the identical assertion
      // through CHECK 2 — the same failing writer, the same verdict, a deny from
      // the plugin's inherited protected list rather than from the project's own
      // declaration. When the protected-path half was removed the two collapsed
      // into one, so the duplicate went and this case inherited the citation.
      // The site is unchanged: a deny the guard has already reached, with the
      // record of it standing in front of the verdict.
      //
      // `notes.txt` is refused by nothing else in the guard, so what refuses
      // this call can only be the decision-governed escalation the project's
      // own config declares.
      withUnwritableStateDir(
        (root) => {
          const run = runRaw(guardEntry(), root, "PreToolUse", "Edit", {
            file_path: resolve(root, PAYLOAD),
          });

          expect(run.stderr).toContain("[guard] Error:");
          const verdict = verdictOf(run, "guard");
          expect(verdict.decision).toBe("block");
          expect(String(verdict.reason)).toContain("D-1");
          expect(run.status).toBe(0);
        },
        {
          files: {
            "fusion-guard.json": projectConfig({
              decisions: [
                { id: "D-1", category: "demo", statement: "notes are governed" },
              ],
              guard: {
                categoryPaths: { demo: [PAYLOAD] },
                categorySensitivity: { demo: "high" },
              },
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "delivers the tracker's report with its throttle record unwritable (260809-2045)",
    () => {
      // The PostToolUse side of the same shape: a state write that fails must
      // not take the sentence out with it.
      //
      // The probe is the state-drift report, which is also now the WRITE that is
      // sabotaged, and the two roles are separable. `measureStateDriftForModel`
      // measures the drift, then writes its throttle record through `bestEffort`,
      // then returns the sentence — so a throw in the write is swallowed, marked
      // on stderr, and the sentence still reaches `respond`.
      //
      // Two earlier spellings of this case are worth knowing about, because each
      // went with the mechanism it was written on. The probe was the
      // protected-path halt sentence until 2026-08-12. The sabotaged write was
      // `churn.json`, whose `saveChurn` ran AFTER the reply through `answer`,
      // until the heatmap was removed on 2026-08-15 — and with it the last thing
      // the tracker does after replying. What survives both is the property
      // issue `260809-2045` was filed about: a report may not withdraw a verdict.
      //
      // `state-drift.json` is replaced by a NON-EMPTY directory rather than the
      // whole state directory being made unwritable, so the sabotage reaches one
      // write rather than every write the tool call makes.
      withProject(
        ({ root }) => {
          freezeCommitCount(root);

          const payload = resolve(root, PAYLOAD);
          const stateDir = resolve(root, "fusion-workbench", ".guard-state");

          writeFileSync(payload, "edited\n", "utf-8");

          // `saveGuardState`'s rename cannot land on a non-empty directory.
          mkdirSync(resolve(stateDir, "state-drift.json", "occupied"), {
            recursive: true,
          });
          writeFileSync(resolve(stateDir, "state-drift.json", "occupied", "f"), "x\n");

          const run = runRaw(trackerEntry(), root, "PostToolUse", "Write", {
            file_path: payload,
          });

          expect(run.stderr).toContain("[tracker] Error:");
          expect(run.status).toBe(0);

          const body = verdictOf(run, "tracker") as {
            hookSpecificOutput?: { additionalContext?: string };
          };
          const sentence = body.hookSpecificOutput?.additionalContext ?? "";
          for (const marker of DRIFT_SENTENCE_MARKERS) {
            expect(sentence).toContain(marker);
          }
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("failOpen writes the verdict before anything that can fail", () => {
  it("runs the verdict first and the event emit after it", () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    const order: string[] = [];

    failOpen(
      "guard",
      new Error("boom"),
      () => order.push("verdict"),
      () => order.push("emit"),
    );

    stderr.mockRestore();
    expect(order).toEqual(["verdict", "emit"]);
  });

  it("keeps the verdict when the event emit throws", () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    let wrote = false;

    expect(() =>
      failOpen(
        "guard",
        new Error("boom"),
        () => {
          wrote = true;
        },
        () => {
          throw new Error("EACCES: .guard-state is read-only");
        },
      ),
    ).not.toThrow();

    // The emit failed and the stderr line still went out — the two reporting
    // steps are guarded separately so one cannot take the other with it.
    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("[guard] Error:"),
    );
    stderr.mockRestore();
    expect(wrote).toBe(true);
  });

  it("keeps the verdict when the stderr write throws", () => {
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => {
      throw new Error("EPIPE");
    });
    let wrote = false;

    expect(() =>
      failOpen("tracker", new Error("boom"), () => {
        wrote = true;
      }),
    ).not.toThrow();

    stderr.mockRestore();
    expect(wrote).toBe(true);
  });

  it("survives a thrown value that is not an Error", () => {
    // A template literal on a symbol throws, so the handler would have thrown on
    // the way out of handling. `String(err)` is what makes this case pass.
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    let wrote = false;

    expect(() =>
      failOpen("guard", Symbol("odd"), () => {
        wrote = true;
      }),
    ).not.toThrow();

    stderr.mockRestore();
    expect(wrote).toBe(true);
  });
});

describe("answer writes the verdict before the reports that record it", () => {
  it("runs the verdict first, then each report in order", () => {
    const order: string[] = [];

    answer(
      "guard",
      () => order.push("verdict"),
      () => order.push("counter"),
      () => order.push("event"),
    );

    expect(order).toEqual(["verdict", "counter", "event"]);
  });

  it("keeps the verdict when a report throws", () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    let wrote = false;

    expect(() =>
      answer(
        "guard",
        () => {
          wrote = true;
        },
        () => {
          throw new Error("EACCES: .guard-state is read-only");
        },
      ),
    ).not.toThrow();

    stderr.mockRestore();
    expect(wrote).toBe(true);
  });

  it("does not let one failed report take the next one with it", () => {
    // The escalation counter and the event log are two files. One `try` around
    // both would make an unwritable `escalation.json` cost the `events.jsonl`
    // row as well — the same swallowing, one level down.
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    let second = false;

    answer(
      "guard",
      () => {},
      () => {
        throw new Error("first report failed");
      },
      () => {
        second = true;
      },
    );

    stderr.mockRestore();
    expect(second).toBe(true);
  });

  it("says on stderr that a report was lost", () => {
    // A guarded step is not a silent step: the failure lands on the same marker
    // line a crash would have used, so nothing disappears without a trace.
    const lines: string[] = [];
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation((chunk) => {
        lines.push(String(chunk));
        return true;
      });

    answer(
      "guard",
      () => {},
      () => {
        throw new Error("EACCES");
      },
    );

    stderr.mockRestore();
    expect(lines.join("")).toContain("[guard] Error:");
    expect(lines.join("")).toContain("EACCES");
  });
});

describe("bestEffort hands back why a step failed", () => {
  it("returns null when the step succeeded", () => {
    expect(bestEffort("tracker", () => {})).toBeNull();
  });

  it("returns the failure, for a caller whose own wording depends on it", () => {
    // `tracker.ts` reads this: a halt it could not record must not be described
    // to the model as a halt that was.
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const why = bestEffort("tracker", () => {
      throw new Error("EISDIR");
    });

    stderr.mockRestore();
    expect(why).toContain("EISDIR");
  });

  it("survives a broken stderr", () => {
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => {
      throw new Error("EPIPE");
    });

    expect(() =>
      bestEffort("guard", () => {
        throw new Error("boom");
      }),
    ).not.toThrow();

    stderr.mockRestore();
  });
});
