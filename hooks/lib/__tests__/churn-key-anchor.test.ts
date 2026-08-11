import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  CASE_TIMEOUT,
  REPO_ROOT,
  childEnv,
  churnRankEntry,
  readEvents,
  runTracker,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";
import type { ChurnState } from "../churn.js";

/**
 * The churn key, end to end — the tracker that writes it and the helper that
 * ranks it.
 *
 * ## Why these cases are subprocesses against a throwaway project
 *
 * The key is derived from two directories the process owns: `process.cwd()`,
 * which cannot be changed for one call inside a running test, and the workbench
 * root walked up to from it. And the churn half of the tracker STANDS DOWN when
 * cwd is fusion's own repository (`lib/self-detect.ts`), so a case written
 * naively in this checkout would assert over a heatmap that never ran. The unit
 * rules live in `churn.test.ts` and are asked of the production helpers
 * directly; what is left for this file is the property that only a real working
 * directory can demonstrate.
 *
 * Issue `260809-2023` (the measurement), decision `260810-0920` (the answer).
 */

const CHURN_PATH = ["fusion-workbench", ".guard-state", "churn.json"];

function readChurn(root: string): ChurnState | null {
  const p = resolve(root, ...CHURN_PATH);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8")) as ChurnState;
}

function writeChurn(root: string, state: unknown): void {
  const dir = resolve(root, "fusion-workbench", ".guard-state");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "churn.json"), JSON.stringify(state, null, 2), "utf-8");
}

/**
 * The ranking reader the orchestrator's Setup runs, spawned from `cwd`.
 *
 * Through `churnRankEntry()` rather than through `bin/fusion-churn-rank`, so
 * these cases do not depend on `dist/` existing at that instant — `npm run
 * build` deletes and rebuilds it, and a second session running the suite in the
 * same checkout has been observed wiping it mid-run, which turned every case
 * here into the wrapper's own "compiled hooks missing" exit 3. What the wrapper
 * adds on top of the program is covered below, on a stub, without a build.
 */
function runRank(cwd: string, args: string[] = []) {
  const entry = churnRankEntry();
  const run = spawnSync(entry.bin, [...entry.args, ...args], {
    cwd,
    encoding: "utf-8",
    env: childEnv(),
  });
  if (run.error) throw new Error(`could not spawn ${entry.label}: ${run.error}`);

  const stdout = run.stdout ?? "";
  const value = (key: string): string => {
    const line = stdout.split("\n").find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1) : "";
  };
  const rows = stdout
    .split("\n")
    .filter((l) => l.startsWith("score="))
    .map((l) => {
      const path = l.slice(l.indexOf("path=") + "path=".length);
      return { line: l, path };
    });
  return { status: run.status ?? -1, stdout, stderr: run.stderr ?? "", value, rows };
}

describe("the churn key is anchored to the workbench root", () => {
  it(
    "counts one file once, whichever directory the session started in",
    () => {
      withProject((project) => {
        const below = resolve(project.root, "fusion-workbench");

        // The same file, edited from the project root and then from the
        // workbench — the two working directories a fusion session really uses.
        // Before the anchor moved these produced two keys (`notes.txt` and
        // `/…/project/notes.txt`), each counting one of the two edits.
        runTracker(project.root, "Edit", { file_path: "notes.txt" });
        runTracker(below, "Edit", {
          file_path: resolve(project.root, "notes.txt"),
        });

        const churn = readChurn(project.root);
        expect(Object.keys(churn?.files ?? {})).toEqual(["notes.txt"]);
        expect(churn?.files["notes.txt"].totalChanges).toBe(2);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not count a file outside the workbench root, and says so",
    () => {
      withProject((project) => {
        // A scratchpad path. There is no spelling for it under this anchor;
        // storing it absolute is what produced 291 of the 590 unresolvable keys.
        const outside = resolve(project.root, "..", "scratch.txt");
        writeFileSync(outside, "scratch\n", "utf-8");

        runTracker(project.root, "Edit", { file_path: outside });

        expect(readChurn(project.root)?.files ?? {}).toEqual({});
        // Observed, not silently dropped — the event log still carries the call.
        const events = readEvents(project.root).filter(
          (e) => e.event === "tracker_record",
        );
        expect(events).toHaveLength(1);
        expect(events[0].detail).toContain("not tracked");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "writes nothing to the event log for a Bash call",
    () => {
      // Issue `260805-1859`. The tracker used to record
      // `{"event":"tracker_record","tool":"Bash","detail":"Bash command
      // observed"}` for every shell call: no file, no command, no result, and
      // 22 % of an 11 142-line log that has no rotation. Nothing read it.
      withProject((project) => {
        runTracker(project.root, "Bash", { command: "ls -la" });

        expect(readEvents(project.root)).toEqual([]);
        // And it was never churn either — the map stays untouched.
        expect(readChurn(project.root)).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still records the write-tool events, which carry a file",
    () => {
      // The half that must NOT go with it: the three surviving `tracker_record`
      // details each name a path, which is what made the Bash one the one
      // carrying nothing.
      withProject((project) => {
        writeFileSync(resolve(project.root, "notes.txt"), "n\n", "utf-8");
        runTracker(project.root, "Edit", { file_path: "notes.txt" });

        const events = readEvents(project.root).filter(
          (e) => e.event === "tracker_record",
        );
        expect(events).toHaveLength(1);
        expect(events[0].file).toBe("notes.txt");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keys a workbench file under the workbench even from a session started there",
    () => {
      withProject((project) => {
        const below = resolve(project.root, "fusion-workbench");
        writeFileSync(resolve(below, "tasklist.md"), "# queue\n", "utf-8");

        runTracker(below, "Edit", { file_path: "tasklist.md" });

        expect(Object.keys(readChurn(project.root)?.files ?? {})).toEqual([
          "fusion-workbench/tasklist.md",
        ]);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the migration of a state file written under the old anchor", () => {
  it(
    "runs on the next tracked write, and a second write does not run it again",
    () => {
      withProject((project) => {
        writeFileSync(resolve(project.root, "fusion-workbench", "tasklist.md"), "q\n", "utf-8");

        // Three of the four spellings the defect record measured, in one file.
        writeChurn(project.root, {
          sessionStart: "2026-08-09T09:00:00.000Z",
          files: {
            // workbench-relative: a session started in fusion-workbench/
            "tasklist.md": { totalChanges: 30, changesThisSession: 0, lastChange: "2026-08-09T10:00:00.000Z", thrashingScore: 10 },
            // absolute in this checkout, the same file again
            [resolve(project.root, "fusion-workbench", "tasklist.md")]: { totalChanges: 12, changesThisSession: 0, lastChange: "2026-08-09T11:00:00.000Z", thrashingScore: 4 },
            // absolute, another root entirely
            "/Users/someone-else/clone/bin/fusion-plane": { totalChanges: 32, changesThisSession: 0, lastChange: "2026-08-09T08:00:00.000Z", thrashingScore: 70 },
          },
        });

        runTracker(project.root, "Edit", { file_path: "notes.txt" });

        const migrated = readChurn(project.root);
        expect(migrated?.keyAnchor).toBe("workbench-root");
        expect(Object.keys(migrated?.files ?? {}).sort()).toEqual([
          "fusion-workbench/tasklist.md",
          "notes.txt",
        ]);
        // Summed, not maxed and not lost.
        expect(migrated?.files["fusion-workbench/tasklist.md"].totalChanges).toBe(42);

        // Idempotence where it actually costs something: a second tool call must
        // not re-run the merge over an already-merged map.
        runTracker(project.root, "Edit", { file_path: "notes.txt" });
        const again = readChurn(project.root);
        expect(again?.files["fusion-workbench/tasklist.md"].totalChanges).toBe(42);
        expect(again?.files["notes.txt"].totalChanges).toBe(2);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the churn ranking Setup reads", () => {
  it(
    "ranks the files that exist and leaves the deleted ones in the map",
    () => {
      withProject((project) => {
        writeChurn(project.root, {
          sessionStart: "2026-08-09T09:00:00.000Z",
          keyAnchor: "workbench-root",
          files: {
            // Deleted in v6.0.0, and the entry that led the ranking the
            // orchestrator read at Setup.
            "hooks/lib/bash-mutation-guard.ts": { totalChanges: 147, changesThisSession: 0, lastChange: "", thrashingScore: 53 },
            "notes.txt": { totalChanges: 30, changesThisSession: 0, lastChange: "", thrashingScore: 10 },
            "build/out.js": { totalChanges: 3, changesThisSession: 0, lastChange: "", thrashingScore: 1 },
          },
        });

        const rank = runRank(project.root);
        expect(rank.status).toBe(0);
        expect(rank.value("anchor")).toBe("workbench-root");
        expect(rank.value("entries")).toBe("3");
        expect(rank.value("absent")).toBe("1");
        expect(rank.rows.map((r) => r.path)).toEqual(["notes.txt", "build/out.js"]);

        // Read-only: the ranking reports on the state, it does not rewrite it.
        expect(
          readChurn(project.root)?.files["hooks/lib/bash-mutation-guard.ts"].totalChanges,
        ).toBe(147);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "ranks from a subdirectory the same way, since the anchor is the root",
    () => {
      withProject((project) => {
        writeChurn(project.root, {
          sessionStart: "2026-08-09T09:00:00.000Z",
          keyAnchor: "workbench-root",
          files: {
            "notes.txt": { totalChanges: 30, changesThisSession: 0, lastChange: "", thrashingScore: 10 },
          },
        });
        const rank = runRank(resolve(project.root, "fusion-workbench"));
        expect(rank.status).toBe(0);
        expect(rank.rows.map((r) => r.path)).toEqual(["notes.txt"]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "answers an empty ranking for a project that has never churned",
    () => {
      withProject((project) => {
        const rank = runRank(project.root);
        expect(rank.status).toBe(0);
        expect(rank.value("entries")).toBe("0");
        expect(rank.rows).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports exit 2 where there is no workbench, rather than an empty ranking",
    () => {
      withProject((project) => {
        // The parent of the project holds no `.fusion-setup` marker.
        const rank = runRank(resolve(project.root, ".."));
        expect(rank.status).toBe(2);
        expect(rank.stderr).toContain("no fusion workbench");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "rejects a limit that is not a count",
    () => {
      withProject((project) => {
        const rank = runRank(project.root, ["--limit", "-3"]);
        expect(rank.status).toBe(1);
        expect(rank.stderr).toContain("--limit");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps a migrated dashboard key out of the ranking, and counts it apart",
    () => {
      // Issue `260810-1632`, end to end and through the reader the orchestrator
      // actually runs. The two keys below are the spellings this repository's
      // own map holds after the migration lifted them out of their bare form;
      // in the bare form they matched no noise pattern, which is how they
      // accumulated a score the write path would refuse to record today.
      withProject((project) => {
        writeFileSync(resolve(project.root, "notes.txt"), "n\n", "utf-8");
        writeFileSync(
          resolve(project.root, "fusion-workbench", "orchestrator-live.md"),
          "# live\n",
          "utf-8",
        );
        writeChurn(project.root, {
          sessionStart: "2026-08-10T09:00:00.000Z",
          keyAnchor: "workbench-root",
          files: {
            "fusion-workbench/orchestrator-live.md": {
              totalChanges: 47,
              changesThisSession: 0,
              lastChange: "",
              thrashingScore: 15,
            },
            "notes.txt": {
              totalChanges: 30,
              changesThisSession: 0,
              lastChange: "",
              thrashingScore: 10,
            },
          },
        });

        const rank = runRank(project.root);
        expect(rank.status).toBe(0);
        expect(rank.rows.map((r) => r.path)).toEqual(["notes.txt"]);
        expect(rank.value("noise")).toBe("1");
        // Present on disk, so it is not the absent exclusion doing this work.
        expect(rank.value("absent")).toBe("0");
        expect(rank.value("entries")).toBe("2");
        // Kept in the map, exactly as decision `260810-0920` part (c) asks.
        expect(
          readChurn(project.root)?.files["fusion-workbench/orchestrator-live.md"]
            .totalChanges,
        ).toBe(47);
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The wrapper itself.
//
// `bin/fusion-churn-rank` is three lines over the program above, and both of
// them are about resolution: it finds `hooks/dist/churn-rank.js` RELATIVE TO
// ITSELF, so an install copy and a work tree each run their own build, and it
// refuses with its own exit code when that build is not there. Driven against a
// stub tree so neither case needs `dist/` to exist — which is the very
// condition the second one is about.
// ---------------------------------------------------------------------------
describe("bin/fusion-churn-rank, the wrapper", () => {
  /** A copy of the wrapper in a throwaway tree, with `entry` as its program. */
  function wrapperTree(entry: string | null): { base: string; script: string } {
    const base = mkdtempSync(resolve(tmpdir(), "fusion-churn-wrapper-"));
    mkdirSync(join(base, "bin"), { recursive: true });
    const script = join(base, "bin", "fusion-churn-rank");
    copyFileSync(join(REPO_ROOT, "bin", "fusion-churn-rank"), script);
    chmodSync(script, 0o755);

    if (entry !== null) {
      mkdirSync(join(base, "hooks", "dist"), { recursive: true });
      writeFileSync(join(base, "hooks", "dist", "churn-rank.js"), entry, "utf-8");
    }
    return { base, script };
  }

  it("runs the build next to it, passes the arguments through, and returns its exit code", () => {
    // The stub answers the two questions the wrapper is responsible for and
    // nothing else: was I reached, and with what.
    const { base, script } = wrapperTree(
      "process.stdout.write('argv=' + process.argv.slice(2).join(',') + '\\n');\nprocess.exitCode = 7;\n",
    );
    try {
      const run = spawnSync(script, ["--limit", "3"], {
        encoding: "utf-8",
        env: childEnv(),
      });
      expect(run.stdout).toBe("argv=--limit,3\n");
      expect(run.status).toBe(7);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("refuses with its own exit 3 when the compiled program is missing", () => {
    // Not 2. "There is no state to rank" is an answer about the project, and a
    // broken install must never be reported as one.
    const { base, script } = wrapperTree(null);
    try {
      const run = spawnSync(script, { encoding: "utf-8", env: childEnv() });
      expect(run.status).toBe(3);
      expect(run.stderr).toContain("compiled hooks are not installed");
      expect(run.stdout).toBe("");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});

/**
 * The stand-down that decides whether the heatmap runs at all, asked of the same
 * directory the key is anchored to.
 *
 * ## What was measured before the gate moved
 *
 * `isFusionPluginCwd()` reads `process.cwd()` with no upward walk, so in the
 * plugin's own repository it answered true only for a session started exactly at
 * the root. From `fusion-workbench/` — CLAUDE.md's ordinary case here — it
 * answered false, the heatmap ran, and it also migrated `churn.json` on disk:
 * measured against the live file at the time, 592 entries in, 415 out. So what
 * got counted depended on which directory the session started in, which is the
 * defect the key anchor above had just closed one line earlier
 * (issues `260805-1839`, `260810-1632`).
 *
 * ## The control is the first case in this file
 *
 * "counts one file once, whichever directory the session started in" runs the
 * tracker from `fusion-workbench/` of a NON-plugin project and asserts the churn
 * it recorded. Any stand-down that reached a consuming project would take that
 * case down with it, so the cases here assert only the plugin side and the
 * pairing carries the rest.
 */
describe("the churn stand-down is anchored to the workbench root", () => {
  it(
    "stands down in the plugin's own repository when the session started below its root",
    () => {
      withPluginProject((project) => {
        const below = resolve(project.root, "fusion-workbench");

        runTracker(below, "Edit", {
          file_path: resolve(project.root, "notes.txt"),
        });

        // No heatmap at all — not an empty one, which is what a run that
        // recorded nothing would leave behind.
        expect(readChurn(project.root)).toBeNull();
        expect(
          readEvents(project.root).filter((e) => e.event === "tracker_record"),
        ).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stands down from the plugin root as it always did",
    () => {
      // The half that already worked, pinned beside the half that did not: a
      // gate that moved and took this with it would be a trade, not a fix.
      withPluginProject((project) => {
        runTracker(project.root, "Edit", { file_path: "notes.txt" });

        expect(readChurn(project.root)).toBeNull();
        expect(
          readEvents(project.root).filter((e) => e.event === "tracker_record"),
        ).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );
});
