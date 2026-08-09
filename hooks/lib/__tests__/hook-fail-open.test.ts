/**
 * A hook whose error report fails must still have written its verdict.
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
 * (guard) and the churn save (tracker) both write there on the plain allow path,
 * so the throw arrives through production code rather than through a seam opened
 * for the test.
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
import { chmodSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { failOpen } from "../fail-open.js";
import {
  CASE_TIMEOUT,
  childEnv,
  guardEntry,
  trackerEntry,
  withProject,
} from "./helpers/guard-harness.js";
import type { GuardEntry } from "./helpers/guard-harness.js";

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
function withUnwritableStateDir<T>(fn: (root: string) => T): T {
  return withProject(({ root }) => {
    const dir = resolve(root, "fusion-workbench", ".guard-state");
    mkdirSync(dir, { recursive: true });
    chmodSync(dir, 0o555);
    try {
      return fn(root);
    } finally {
      chmodSync(dir, 0o755);
    }
  });
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
      withUnwritableStateDir((root) => {
        const run = runRaw(trackerEntry(), root, "PostToolUse", "Edit", {
          file_path: resolve(root, PAYLOAD),
        });

        expect(run.stderr).toContain("[tracker] Error:");

        // `respond()` with nothing to report is a bare `{}` — a well-formed
        // PostToolUse reply carrying no additional context.
        expect(verdictOf(run, "tracker")).toEqual({});
        expect(run.status).toBe(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "fails open on a protected path too, which is what fail-open means here",
    () => {
      // Pinned because it is the uncomfortable half of the criteria and reads
      // like a bug otherwise. `guard.ts` persists the block counter BEFORE it
      // writes the deny (`saveEscalation` then `block`), so an unwritable state
      // directory throws while the verdict is still unwritten and the handler
      // supplies the fail-open one — an ALLOW, on a protected path.
      //
      // This task did not introduce that and does not decide it. Before the
      // reordering the same call exited 1 with empty stdout, which is the
      // ambiguity the record was filed about; what changed is that the outcome
      // is now stated rather than guessed at. Making the deny survive its own
      // bookkeeping is a different fix in a different place, filed as
      // `shared/issues/260809-1825_*_an-unwritable-guard-state-directory-turns-….md`.
      // If that lands, this case is the one that should fail.
      withUnwritableStateDir((root) => {
        const run = runRaw(guardEntry(), root, "PreToolUse", "Edit", {
          file_path: resolve(root, "rules/x.md"),
        });

        expect(run.stderr).toContain("[guard] Error:");
        expect(verdictOf(run, "guard")).toEqual({});
        expect(run.status).toBe(0);
      });
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
