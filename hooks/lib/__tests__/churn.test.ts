import { describe, it, expect, beforeEach } from "vitest";
import {
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
