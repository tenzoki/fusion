import { describe, it, expect, beforeEach } from "vitest";
import {
  coerceChurnState,
  recordChange,
  analyzeChurn,
  resetSession,
} from "../churn.js";
import type { ChurnState } from "../churn.js";

function freshState(): ChurnState {
  return {
    files: {},
    sessionStart: new Date().toISOString(),
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
