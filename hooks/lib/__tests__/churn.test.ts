import { describe, it, expect, beforeEach } from "vitest";
import {
  coerceChurnState,
  recordChange,
  analyzeChurn,
  getTopChurnFiles,
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

  it("returns no warnings below thresholds", () => {
    recordChange(state, "pkg/main.go");
    const warnings = analyzeChurn(state, {
      changesPerSessionWarning: 5,
      changesPerSessionCritical: 10,
      totalChangesWarning: 8,
      totalChangesCritical: 15,
    });
    expect(warnings).toHaveLength(0);
  });

  it("returns warning at session warning threshold", () => {
    for (let i = 0; i < 5; i++) {
      recordChange(state, "pkg/main.go");
    }
    const warnings = analyzeChurn(state, {
      changesPerSessionWarning: 5,
      changesPerSessionCritical: 10,
      totalChangesWarning: 20,
      totalChangesCritical: 30,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe("warning");
    expect(warnings[0].files).toContain("pkg/main.go");
  });

  it("returns critical at session critical threshold", () => {
    for (let i = 0; i < 10; i++) {
      recordChange(state, "pkg/main.go");
    }
    const warnings = analyzeChurn(state, {
      changesPerSessionWarning: 5,
      changesPerSessionCritical: 10,
      totalChangesWarning: 20,
      totalChangesCritical: 30,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe("critical");
  });

  it("returns critical at total critical threshold", () => {
    // Simulate accumulated changes across sessions
    state.files["pkg/old.go"] = {
      totalChanges: 15,
      changesThisSession: 1,
      lastChange: new Date().toISOString(),
      thrashingScore: 5,
    };
    const warnings = analyzeChurn(state, {
      changesPerSessionWarning: 5,
      changesPerSessionCritical: 10,
      totalChangesWarning: 8,
      totalChangesCritical: 15,
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].level).toBe("critical");
    expect(warnings[0].files).toContain("pkg/old.go");
  });

  it("does not double-count critical files as warning", () => {
    // File is both session-critical and total-critical — should only appear in critical
    state.files["pkg/hot.go"] = {
      totalChanges: 20,
      changesThisSession: 12,
      lastChange: new Date().toISOString(),
      thrashingScore: 10,
    };
    const warnings = analyzeChurn(state, {
      changesPerSessionWarning: 5,
      changesPerSessionCritical: 10,
      totalChangesWarning: 8,
      totalChangesCritical: 15,
    });
    // Should have exactly 1 critical, no warning for same file
    const criticalWarnings = warnings.filter((w) => w.level === "critical");
    const warningWarnings = warnings.filter((w) => w.level === "warning");
    expect(criticalWarnings).toHaveLength(1);
    expect(warningWarnings).toHaveLength(0);
  });
});

describe("getTopChurnFiles", () => {
  it("returns files sorted by thrashing score", () => {
    const state = freshState();
    // Create files with different scores
    for (let i = 0; i < 5; i++) recordChange(state, "pkg/hot.go");
    for (let i = 0; i < 2; i++) recordChange(state, "pkg/warm.go");
    recordChange(state, "pkg/cold.go");

    const top = getTopChurnFiles(state, 2);
    expect(top).toHaveLength(2);
    expect(top[0]).toBe("pkg/hot.go"); // highest score
  });

  it("handles request for more files than exist", () => {
    const state = freshState();
    recordChange(state, "pkg/only.go");
    const top = getTopChurnFiles(state, 10);
    expect(top).toHaveLength(1);
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
