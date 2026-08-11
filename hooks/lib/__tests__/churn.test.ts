import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  coerceChurnState,
  recordChange,
  analyzeChurn,
  churnKey,
  migrateChurnKeys,
  rankThrashing,
  resetSession,
  KEY_ANCHOR,
} from "../churn.js";
import type { ChurnState, FileChurnStats } from "../churn.js";

function freshState(): ChurnState {
  return {
    files: {},
    sessionStart: new Date().toISOString(),
  };
}

/**
 * A stated file tree, as an `exists` predicate.
 *
 * The migration and the ranking both take one as a parameter, so every case
 * below says which files are on disk instead of building a temporary tree and
 * hoping. The paths are root-relative; the predicate is handed absolutes.
 */
function tree(root: string, present: string[]): (path: string) => boolean {
  const absolute = new Set(present.map((p) => resolve(root, p)));
  return (path: string) => absolute.has(path);
}

/** Counters with everything else defaulted, for a state written by hand. */
function stats(partial: Partial<FileChurnStats> = {}): FileChurnStats {
  return {
    totalChanges: 0,
    changesThisSession: 0,
    lastChange: "",
    thrashingScore: 0,
    ...partial,
  };
}

describe("churn tracker", () => {
  let state: ChurnState;

  beforeEach(() => {
    state = freshState();
  });

  it("records first change for a file", () => {
    recordChange(state, "pkg/main.go");
    expect(state.files["pkg/main.go"]).toBeDefined();
    expect(state.files["pkg/main.go"].totalChanges).toBe(1);
    expect(state.files["pkg/main.go"].changesThisSession).toBe(1);
    expect(state.files["pkg/main.go"].thrashingScore).toBe(0); // 1 change = no penalty
  });

  it("increments counters on repeated changes", () => {
    recordChange(state, "pkg/main.go");
    recordChange(state, "pkg/main.go");
    recordChange(state, "pkg/main.go");
    expect(state.files["pkg/main.go"].totalChanges).toBe(3);
    expect(state.files["pkg/main.go"].changesThisSession).toBe(3);
  });

  it("calculates thrashing score with rapid-change penalty", () => {
    // 5 changes: rapidChangePenalty = (5-2)*2 = 6, totalPenalty = floor(5/3) = 1
    for (let i = 0; i < 5; i++) {
      recordChange(state, "pkg/main.go");
    }
    expect(state.files["pkg/main.go"].thrashingScore).toBe(7); // 6 + 1
  });

  it("tracks multiple files independently", () => {
    recordChange(state, "pkg/a.go");
    recordChange(state, "pkg/b.go");
    recordChange(state, "pkg/a.go");
    expect(state.files["pkg/a.go"].totalChanges).toBe(2);
    expect(state.files["pkg/b.go"].totalChanges).toBe(1);
  });
});

describe("analyzeChurn", () => {
  let state: ChurnState;

  beforeEach(() => {
    state = freshState();
  });

  const THRESHOLDS = {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
  };

  it("returns no warnings below thresholds", () => {
    recordChange(state, "pkg/main.go");
    expect(analyzeChurn(state, THRESHOLDS)).toHaveLength(0);
  });

  it("returns warning at session warning threshold", () => {
    for (let i = 0; i < 5; i++) {
      recordChange(state, "pkg/main.go");
    }
    const warnings = analyzeChurn(state, THRESHOLDS);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe("warning");
    expect(warnings[0].files).toContain("pkg/main.go");
  });

  it("returns critical at session critical threshold", () => {
    for (let i = 0; i < 10; i++) {
      recordChange(state, "pkg/main.go");
    }
    const warnings = analyzeChurn(state, THRESHOLDS);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe("critical");
    expect(warnings[0].files).toContain("pkg/main.go");
  });

  it("still fires the session critical with the SHIPPED thresholds and nothing passed", () => {
    // The acceptance criterion the removal must not quietly take with it. The
    // case above passes an explicit threshold object; this one exercises
    // DEFAULT_THRESHOLDS, which is what `analyzeChurn` falls back to when a
    // project declares no `churn` block at all.
    for (let i = 0; i < 10; i++) recordChange(state, "pkg/main.go");
    const warnings = analyzeChurn(state);
    expect(warnings.map((w) => w.level)).toEqual(["critical"]);
    expect(warnings[0].files).toEqual(["pkg/main.go"]);
  });

  it("a huge lifetime total with a quiet session produces NO warning", () => {
    // Issue 260809-1101, the regression this file exists to hold. `totalChanges`
    // is monotonic for the life of a project, so comparing it against a limit
    // made the first file to cross it report a critical on every subsequent
    // write to any file, for ever — 100% duty cycle over 21 days in this
    // repository's own log. The counter stays (the orchestrator's Setup reads
    // it); the comparison is gone.
    state.files["hooks/lib/bash-mutation-guard.ts"] = {
      totalChanges: 147,
      changesThisSession: 0,
      lastChange: new Date().toISOString(),
      thrashingScore: 49,
    };
    expect(analyzeChurn(state, THRESHOLDS)).toEqual([]);
    // And with no thresholds passed either, since the defaults are where the
    // old lifetime pair lived.
    expect(analyzeChurn(state)).toEqual([]);
  });

  it("a lifetime-heavy file is reported only while the current session is hot", () => {
    // The other half of the same claim: the file above is not exempt, it is
    // simply judged on what is happening now. One session-critical run of
    // edits and it is reported; the reported set names it and nothing else.
    state.files["hooks/lib/bash-mutation-guard.ts"] = {
      totalChanges: 147,
      changesThisSession: 10,
      lastChange: new Date().toISOString(),
      thrashingScore: 65,
    };
    state.files["docs/quiet.md"] = {
      totalChanges: 900,
      changesThisSession: 1,
      lastChange: new Date().toISOString(),
      thrashingScore: 300,
    };
    const warnings = analyzeChurn(state, THRESHOLDS);
    expect(warnings.map((w) => w.level)).toEqual(["critical"]);
    expect(warnings[0].files).toEqual(["hooks/lib/bash-mutation-guard.ts"]);
  });

  it("does not double-count a critical file as a warning", () => {
    state.files["pkg/hot.go"] = {
      totalChanges: 20,
      changesThisSession: 12,
      lastChange: new Date().toISOString(),
      thrashingScore: 10,
    };
    const warnings = analyzeChurn(state, THRESHOLDS);
    expect(warnings.filter((w) => w.level === "critical")).toHaveLength(1);
    expect(warnings.filter((w) => w.level === "warning")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// The coercion the load runs on whatever `churn.json` holds.
//
// The cast it replaced caught a MISSING file and UNPARSEABLE text and nothing
// else, so a file that parsed to a valid JSON value of the wrong shape threw on
// the next field access — inside `tracker.ts`, whose top-level handler then
// discarded the protected-path halt message the same tool call had produced
// (issue 260809-1101). Every row below is well-formed JSON, which is exactly why
// the old `try/catch` could not see any of them.
//
// The end-to-end consequence is asserted in `guard-state-shape.test.ts`; these
// cases pin the shape the loader hands on.
// ---------------------------------------------------------------------------
describe("coerceChurnState", () => {
  it("reads {} as an empty state that recordChange can use", () => {
    const state = coerceChurnState(JSON.parse("{}"));
    expect(state.files).toEqual({});
    // The throw the defect was reported as. Not just "no exception": the
    // resulting state has to be usable, or the load has only moved the failure.
    expect(() => recordChange(state, "pkg/main.go")).not.toThrow();
    expect(state.files["pkg/main.go"].totalChanges).toBe(1);
  });

  for (const [name, value] of [
    ["null", null],
    ["an array", []],
    ["a bare number", 7],
    ["a string", "churn"],
    ["undefined — an absent, unreadable or unparseable file", undefined],
  ] as [string, unknown][]) {
    it(`reads ${name} as an empty state`, () => {
      const state = coerceChurnState(value);
      expect(state.files).toEqual({});
      expect(Number.isFinite(Date.parse(state.sessionStart))).toBe(true);
    });
  }

  it("replaces a files value that is not an object", () => {
    expect(coerceChurnState({ files: [] }).files).toEqual({});
    expect(coerceChurnState({ files: "none" }).files).toEqual({});
  });

  it("drops a file entry that is not an object rather than zero-filling it", () => {
    // A zero-filled entry would claim the guard had observed a file it knows
    // nothing about. The next real change re-creates it correctly.
    const state = coerceChurnState({
      files: { "pkg/a.go": null, "pkg/b.go": "hot", "pkg/c.go": {} },
    });
    expect(Object.keys(state.files)).toEqual(["pkg/c.go"]);
  });

  it("defaults the per-file counters instead of carrying garbage into a threshold", () => {
    const stats = coerceChurnState({
      files: {
        "pkg/a.go": {
          totalChanges: "many",
          changesThisSession: -4,
          lastChange: 17,
          thrashingScore: 2.7,
        },
      },
    }).files["pkg/a.go"];
    expect(stats.totalChanges).toBe(0);
    expect(stats.changesThisSession).toBe(0);
    expect(stats.thrashingScore).toBe(2);
    expect(stats.lastChange).toBe("");
  });

  it("replaces a sessionStart Date cannot read, so the session reset still fires", () => {
    // `recordChange` compares Date.now() against this value. An unparseable
    // string yields NaN, which compares false against every threshold — the
    // two-hour reset would silently never fire again.
    const state = coerceChurnState({ files: {}, sessionStart: "not a date" });
    expect(Number.isFinite(Date.parse(state.sessionStart))).toBe(true);
  });

  it("round-trips a well-formed state unchanged", () => {
    // The anti-vacuity half: a coercion that emptied everything would pass every
    // case above and silently reset a project's accumulated churn on load.
    const written: ChurnState = {
      files: {
        "pkg/a.go": {
          totalChanges: 12,
          changesThisSession: 3,
          lastChange: "2026-08-09T10:00:00.000Z",
          thrashingScore: 6,
        },
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    expect(coerceChurnState(JSON.parse(JSON.stringify(written)))).toEqual(written);
  });
});

// ---------------------------------------------------------------------------
// The key.
//
// It used to be derived from `process.cwd()` — cwd-relative when the written
// path fell inside it, raw absolute otherwise — so one file collected one
// counter per directory a session was ever started in, each under-reporting.
// Measured in this repository: 590 entries in four incompatible spellings and
// zero in the spelling every consumer assumes (issue 260809-2023). These cases
// ask the production helper for the key and compare the answers.
// ---------------------------------------------------------------------------
describe("churnKey", () => {
  const root = "/proj";

  it("gives one file one key from any working directory", () => {
    // The defect, stated as an equality. Four spellings of one edit, from three
    // working directories, all of which really occur in a fusion session.
    const keys = [
      churnKey("/proj/hooks/lib/churn.ts", "/proj", root),
      churnKey("hooks/lib/churn.ts", "/proj", root),
      churnKey("/proj/hooks/lib/churn.ts", "/proj/fusion-workbench", root),
      churnKey("../hooks/lib/churn.ts", "/proj/fusion-workbench", root),
    ];
    expect(new Set(keys).size).toBe(1);
    expect(keys[0]).toBe("hooks/lib/churn.ts");
  });

  it("keys a workbench file under the workbench, not under the session's cwd", () => {
    // The 229 keys spelled `tasklist.md` came from sessions started IN
    // fusion-workbench/. Spelled this way they also missed TRACKER_NOISE_FILES,
    // which is how the dashboard files came to be counted as churn at all.
    expect(churnKey("tasklist.md", "/proj/fusion-workbench", root)).toBe(
      "fusion-workbench/tasklist.md",
    );
  });

  it("does not key a path outside the workbench root", () => {
    // A scratchpad, another clone, another machine. There is no spelling for it
    // under this anchor, and inventing one is what produced the second family
    // of unresolvable keys.
    expect(churnKey("/tmp/fusion-commit-msg.txt", "/proj", root)).toBeNull();
    expect(churnKey("../other-clone/bin/x", "/proj", root)).toBeNull();
  });

  it("does not key anything when there is no workbench", () => {
    expect(churnKey("hooks/lib/churn.ts", "/proj", null)).toBeNull();
  });

  it("does not key the root directory itself", () => {
    expect(churnKey("/proj", "/proj", root)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The migration (decision 260810-0920 part b).
//
// Every case states its own file tree through the `exists` parameter, because
// the rule for a relative key is a probe: the working directory it was written
// against is not recorded anywhere, and the two directories that can have been
// it are the project root and the workbench.
// ---------------------------------------------------------------------------
describe("migrateChurnKeys", () => {
  const root = "/proj";

  it("rewrites an absolute key inside the root and drops one outside it", () => {
    const state: ChurnState = {
      files: {
        "/proj/hooks/lib/churn.ts": stats({ totalChanges: 9 }),
        "/Users/other/clone/bin/fusion-plane": stats({ totalChanges: 32 }),
        "/tmp/fusion-commit-msg.txt": stats({ totalChanges: 4 }),
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const migrated = migrateChurnKeys(state, root, tree(root, []));
    expect(Object.keys(migrated.files)).toEqual(["hooks/lib/churn.ts"]);
    expect(migrated.files["hooks/lib/churn.ts"].totalChanges).toBe(9);
  });

  it("re-anchors a relative key that resolves only under the workbench", () => {
    const state: ChurnState = {
      files: {
        "tasklist.md": stats({ totalChanges: 40 }),
        "shared/history/260719-1632-orchestrator-session.md": stats({ totalChanges: 3 }),
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const migrated = migrateChurnKeys(
      state,
      root,
      tree(root, [
        "fusion-workbench/tasklist.md",
        "fusion-workbench/shared/history/260719-1632-orchestrator-session.md",
      ]),
    );
    expect(Object.keys(migrated.files).sort()).toEqual([
      "fusion-workbench/shared/history/260719-1632-orchestrator-session.md",
      "fusion-workbench/tasklist.md",
    ]);
    expect(migrated.files["fusion-workbench/tasklist.md"].totalChanges).toBe(40);
  });

  it("leaves a relative key that already resolves at the root alone", () => {
    // A consuming project whose sessions start at the project root wrote keys
    // that are ALREADY on the new anchor. The probe must not push them down
    // into the workbench because a same-named file happens to live there too.
    const state: ChurnState = {
      files: { "README.md": stats({ totalChanges: 6 }) },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const migrated = migrateChurnKeys(
      state,
      root,
      tree(root, ["README.md", "fusion-workbench/README.md"]),
    );
    expect(Object.keys(migrated.files)).toEqual(["README.md"]);
  });

  it("keeps a relative key that resolves nowhere, rather than guessing or dropping it", () => {
    // Its file is gone from both anchors, so nothing in the key says which one
    // it was written against. The history survives (decision part c); the
    // ranking excludes it because the file is absent, not because the key was
    // deleted.
    const state: ChurnState = {
      files: { "shared/history/deleted-session.md": stats({ totalChanges: 12 }) },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const migrated = migrateChurnKeys(state, root, tree(root, []));
    expect(migrated.files["shared/history/deleted-session.md"].totalChanges).toBe(12);
  });

  it("merges two spellings of one file by SUMMING the counters", () => {
    // The merge rule. Each spelling is an independent counter that under-reports
    // the same file, so the sum is the count that would have been recorded had
    // the anchor been right all along.
    const state: ChurnState = {
      files: {
        "/proj/fusion-workbench/tasklist.md": stats({
          totalChanges: 30,
          changesThisSession: 2,
          lastChange: "2026-08-09T10:00:00.000Z",
          thrashingScore: 10,
        }),
        "tasklist.md": stats({
          totalChanges: 12,
          changesThisSession: 3,
          lastChange: "2026-08-09T18:00:00.000Z",
          thrashingScore: 4,
        }),
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const merged = migrateChurnKeys(
      state,
      root,
      tree(root, ["fusion-workbench/tasklist.md"]),
    ).files["fusion-workbench/tasklist.md"];

    expect(merged.totalChanges).toBe(42);
    expect(merged.changesThisSession).toBe(5);
    // The later of the two: the file was last touched when it was last touched,
    // under either name.
    expect(merged.lastChange).toBe("2026-08-09T18:00:00.000Z");
    // RECOMPUTED from the merged counters — (5-2)*2 + floor(42/3) = 6 + 14 — and
    // deliberately not 10+4 or max(10,4), neither of which the formula could
    // produce.
    expect(merged.thrashingScore).toBe(20);
  });

  it("reads an unknown lastChange as unknown when merging", () => {
    const state: ChurnState = {
      files: {
        "/proj/a.ts": stats({ totalChanges: 1, lastChange: "" }),
        "a.ts": stats({ totalChanges: 1, lastChange: "" }),
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    expect(
      migrateChurnKeys(state, root, tree(root, ["a.ts"])).files["a.ts"].lastChange,
    ).toBe("");
  });

  it("is idempotent — a second pass returns the same map", () => {
    const state: ChurnState = {
      files: {
        "/proj/hooks/lib/churn.ts": stats({ totalChanges: 9 }),
        "/Users/other/clone/bin/x": stats({ totalChanges: 3 }),
        "tasklist.md": stats({ totalChanges: 40 }),
        "shared/history/gone.md": stats({ totalChanges: 2 }),
        "hooks/lib/churn.ts": stats({ totalChanges: 1 }),
      },
      sessionStart: "2026-08-09T09:00:00.000Z",
    };
    const exists = tree(root, ["hooks/lib/churn.ts", "fusion-workbench/tasklist.md"]);

    const once = migrateChurnKeys(state, root, exists);
    const twice = migrateChurnKeys(once, root, exists);
    expect(twice).toEqual(once);
    // And the counters are not re-summed on the second pass, which is the way
    // a merge usually stops being idempotent.
    expect(twice.files["hooks/lib/churn.ts"].totalChanges).toBe(10);
  });

  it("stamps the anchor, and the stamp survives the coercion that reads the file back", () => {
    const migrated = migrateChurnKeys(freshState(), root, tree(root, []));
    expect(migrated.keyAnchor).toBe(KEY_ANCHOR);
    // The round trip that decides whether the migration runs again on the next
    // load. A stamp that did not survive JSON + coercion would make the
    // migration a per-tool-call cost.
    expect(
      coerceChurnState(JSON.parse(JSON.stringify(migrated))).keyAnchor,
    ).toBe(KEY_ANCHOR);
  });

  it("treats an unrecognised anchor stamp as unmigrated", () => {
    const state = coerceChurnState({ files: {}, keyAnchor: "session-cwd" });
    expect(state.keyAnchor).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// The read path (decision 260810-0920 part c).
//
// The map never forgets, on purpose. What changes is what the reader is shown.
// ---------------------------------------------------------------------------
describe("rankThrashing", () => {
  const root = "/proj";

  const state: ChurnState = {
    files: {
      "hooks/lib/bash-mutation-guard.ts": stats({ totalChanges: 147, thrashingScore: 53 }),
      "hooks/lib/churn.ts": stats({ totalChanges: 30, thrashingScore: 10 }),
      "hooks/tracker.ts": stats({ totalChanges: 60, thrashingScore: 10 }),
      "docs/philosophy.md": stats({ totalChanges: 3, thrashingScore: 1 }),
    },
    sessionStart: "2026-08-09T09:00:00.000Z",
    keyAnchor: KEY_ANCHOR,
  };
  const exists = tree(root, ["hooks/lib/churn.ts", "hooks/tracker.ts", "docs/philosophy.md"]);

  it("leaves a deleted file out of the ranking while its history stays in the map", () => {
    // Acceptance for the reported symptom: the top-scoring entry names a file
    // deleted in v6.0.0, and it led the ranking the orchestrator read at Setup.
    const ranking = rankThrashing(state, root, 0, exists);
    expect(ranking.ranked.map((r) => r.path)).not.toContain(
      "hooks/lib/bash-mutation-guard.ts",
    );
    expect(ranking.absent).toBe(1);
    expect(ranking.entries).toBe(4);
    // Nothing was removed from the state itself.
    expect(state.files["hooks/lib/bash-mutation-guard.ts"].totalChanges).toBe(147);
  });

  it("ranks by score, breaks a tie by lifetime total, then by path", () => {
    const ranking = rankThrashing(state, root, 0, exists);
    expect(ranking.ranked.map((r) => r.path)).toEqual([
      "hooks/tracker.ts", // score 10, total 60
      "hooks/lib/churn.ts", // score 10, total 30
      "docs/philosophy.md", // score 1
    ]);
  });

  it("applies a limit after ranking, and reads 0 as the whole ranking", () => {
    expect(rankThrashing(state, root, 1, exists).ranked.map((r) => r.path)).toEqual([
      "hooks/tracker.ts",
    ]);
    expect(rankThrashing(state, root, 0, exists).ranked).toHaveLength(3);
  });

  it("answers an empty ranking rather than nothing when every file is gone", () => {
    const ranking = rankThrashing(state, root, 0, () => false);
    expect(ranking.ranked).toEqual([]);
    expect(ranking.absent).toBe(4);
    expect(ranking.entries).toBe(4);
    expect(ranking.noise).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// The read path's second exclusion (issue 260810-1632).
//
// The write path refuses to count the workbench surfaces the session rewrites
// continuously. The key migration lifted the scores those surfaces had already
// accumulated under a bare spelling into the spelling that list matches — so
// the write-path exclusion started applying and the ranking still showed them.
// ---------------------------------------------------------------------------
describe("rankThrashing — the files the tracker refuses to measure", () => {
  const root = "/proj";

  /** The two spellings this repository's own migrated map actually holds. */
  const migrated: ChurnState = {
    files: {
      "fusion-workbench/orchestrator-live.md": stats({
        totalChanges: 47,
        thrashingScore: 15,
      }),
      "fusion-workbench/agentstate.yaml": stats({
        totalChanges: 6,
        thrashingScore: 2,
      }),
      "fusion-workbench/.guard-state/churn.json": stats({
        totalChanges: 900,
        thrashingScore: 99,
      }),
      "hooks/tracker.ts": stats({ totalChanges: 60, thrashingScore: 10 }),
    },
    sessionStart: "2026-08-10T09:00:00.000Z",
    keyAnchor: KEY_ANCHOR,
  };
  const everythingPresent = () => true;

  it("keeps a noise file out of the ranking however high it scores", () => {
    // The reported symptom: `orchestrator-live.md` occupied the 10th slot of
    // the default `--limit 10` the orchestrator reads at Setup. The
    // `.guard-state/**` entry outscores every real file, because `guard.ts`
    // writes a snapshot there on every guarded call.
    const ranking = rankThrashing(migrated, root, 0, everythingPresent);
    expect(ranking.ranked.map((r) => r.path)).toEqual(["hooks/tracker.ts"]);
    expect(ranking.noise).toBe(3);
    expect(ranking.absent).toBe(0);
    expect(ranking.entries).toBe(4);
  });

  it("leaves the entries in the map, exactly as the absent ones are left", () => {
    rankThrashing(migrated, root, 0, everythingPresent);
    expect(
      migrated.files["fusion-workbench/orchestrator-live.md"].totalChanges,
    ).toBe(47);
  });

  it("counts noise apart from absent, so 'not evidence' never reads as 'deleted'", () => {
    // Disjoint by construction: noise is asked first, so a key that is both a
    // noise surface and missing counts once, as noise.
    const ranking = rankThrashing(migrated, root, 0, () => false);
    expect(ranking.noise).toBe(3);
    expect(ranking.absent).toBe(1);
    expect(ranking.noise + ranking.absent + ranking.ranked.length).toBe(
      ranking.entries,
    );
  });

  it("does not exclude a workbench file that is not on the list", () => {
    // The exclusion is the tracker's list and nothing wider. `tasklist.md` is a
    // workbench file the session edits as ordinary work, and it is evidence.
    const state: ChurnState = {
      files: {
        "fusion-workbench/tasklist.md": stats({
          totalChanges: 12,
          thrashingScore: 4,
        }),
      },
      sessionStart: "2026-08-10T09:00:00.000Z",
      keyAnchor: KEY_ANCHOR,
    };
    const ranking = rankThrashing(state, root, 0, everythingPresent);
    expect(ranking.ranked.map((r) => r.path)).toEqual([
      "fusion-workbench/tasklist.md",
    ]);
    expect(ranking.noise).toBe(0);
  });

  it("has one definition of the list, so the two paths cannot disagree", () => {
    // The write path (`hooks/tracker.ts`) and the read path (here) apply the
    // same list. A second copy would be two places for one rule to drift, and
    // the drift would be silent: the ranking would start showing a surface the
    // tracker stopped counting, which is the defect this exclusion closes.
    const hooks = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
    );
    const declarations = ["lib/churn.ts", "tracker.ts", "guard.ts", "churn-rank.ts"]
      .filter((rel) =>
        /(?:const|let|var)\s+TRACKER_NOISE_FILES\b/.test(
          readFileSync(resolve(hooks, rel), "utf-8"),
        ),
      );
    expect(declarations).toEqual(["lib/churn.ts"]);
  });
});

describe("resetSession", () => {
  it("resets session counters but preserves totals", () => {
    const state = freshState();
    recordChange(state, "pkg/main.go");
    recordChange(state, "pkg/main.go");
    recordChange(state, "pkg/main.go");

    expect(state.files["pkg/main.go"].totalChanges).toBe(3);
    expect(state.files["pkg/main.go"].changesThisSession).toBe(3);

    resetSession(state);

    expect(state.files["pkg/main.go"].totalChanges).toBe(3);
    expect(state.files["pkg/main.go"].changesThisSession).toBe(0);
  });
});
