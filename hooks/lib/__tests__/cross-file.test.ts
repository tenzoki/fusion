import { describe, it, expect, beforeEach } from "vitest";
import {
  coerceCrossFileState,
  recordEdit,
  analyzeCrossFile,
} from "../cross-file.js";
import type { CrossFileState } from "../cross-file.js";

function freshState(): CrossFileState {
  return { files: {}, lastEditFile: null, lastEditTimestamp: null };
}

describe("cross-file ping-back tracker", () => {
  let state: CrossFileState;

  beforeEach(() => {
    state = freshState();
  });

  it("records first edit with no ping-back", () => {
    recordEdit(state, "A");
    expect(state.files["A"]).toBeDefined();
    expect(state.files["A"].totalEdits).toBe(1);
    expect(state.files["A"].pingBackCount).toBe(0);
    expect(state.lastEditFile).toBe("A");
  });

  it("does not increment ping-back on consecutive same-file edits", () => {
    recordEdit(state, "A");
    recordEdit(state, "A");
    recordEdit(state, "A");
    expect(state.files["A"].totalEdits).toBe(3);
    expect(state.files["A"].pingBackCount).toBe(0);
  });

  it("does not increment ping-back on first edits to different files", () => {
    recordEdit(state, "A");
    recordEdit(state, "B");
    recordEdit(state, "C");
    expect(state.files["A"].pingBackCount).toBe(0);
    expect(state.files["B"].pingBackCount).toBe(0);
    expect(state.files["C"].pingBackCount).toBe(0);
  });

  it("increments ping-back when returning to a file after a different one", () => {
    recordEdit(state, "A"); // first
    recordEdit(state, "B"); // first for B
    recordEdit(state, "A"); // ping-back for A
    expect(state.files["A"].pingBackCount).toBe(1);
    expect(state.files["B"].pingBackCount).toBe(0);
  });

  it("counts 2-file ping-pong correctly", () => {
    // A, B, A, B, A, B → A count 2 (returned twice), B count 2 (returned twice)
    recordEdit(state, "A"); // A first
    recordEdit(state, "B"); // B first
    recordEdit(state, "A"); // A pingback (1)
    recordEdit(state, "B"); // B pingback (1)
    recordEdit(state, "A"); // A pingback (2)
    recordEdit(state, "B"); // B pingback (2)
    expect(state.files["A"].pingBackCount).toBe(2);
    expect(state.files["B"].pingBackCount).toBe(2);
    expect(state.files["A"].totalEdits).toBe(3);
    expect(state.files["B"].totalEdits).toBe(3);
  });

  it("counts 3-file rotation correctly", () => {
    // A, B, C, A, B, C, A → A 2, B 1, C 1
    ["A", "B", "C", "A", "B", "C", "A"].forEach((f) => recordEdit(state, f));
    expect(state.files["A"].pingBackCount).toBe(2);
    expect(state.files["B"].pingBackCount).toBe(1);
    expect(state.files["C"].pingBackCount).toBe(1);
  });

  it("triggers warning at default threshold (3)", () => {
    // A, B, A, B, A, B, A → A 3, B 2
    ["A", "B", "A", "B", "A", "B", "A"].forEach((f) => recordEdit(state, f));
    const warnings = analyzeCrossFile(state);
    const warning = warnings.find((w) => w.level === "warning");
    expect(warning).toBeDefined();
    expect(warning!.files).toContain("A");
    expect(warning!.files).not.toContain("B"); // B at 2 not yet warning
  });

  it("escalates to critical at threshold 5", () => {
    // 12-step ping-pong: A B A B A B A B A B A B → A.pb=5, B.pb=5
    // (in odd-length sequences, the leading file leads by one, so use 12)
    const seq = ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B", "A", "B"];
    seq.forEach((f) => recordEdit(state, f));
    expect(state.files["A"].pingBackCount).toBe(5);
    expect(state.files["B"].pingBackCount).toBe(5);
    const warnings = analyzeCrossFile(state);
    const critical = warnings.find((w) => w.level === "critical");
    expect(critical).toBeDefined();
    expect(critical!.files).toEqual(expect.arrayContaining(["A", "B"]));
  });

  it("respects custom thresholds", () => {
    recordEdit(state, "A");
    recordEdit(state, "B");
    recordEdit(state, "A"); // A.pingBack=1
    const warnings = analyzeCrossFile(state, {
      pingBackWarning: 1,
      pingBackCritical: 99,
    });
    const w = warnings.find((x) => x.level === "warning");
    expect(w).toBeDefined();
    expect(w!.files).toContain("A");
  });

  it("returns empty warnings for fresh state", () => {
    expect(analyzeCrossFile(state)).toEqual([]);
  });

  it("returns empty warnings when ping-backs below threshold", () => {
    recordEdit(state, "A");
    recordEdit(state, "B");
    recordEdit(state, "A"); // A.pingBack=1, default warning=3
    expect(analyzeCrossFile(state)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The coercion the load runs on whatever `cross-file.json` holds. Same defect as
// churn's, same rows: every one of them is well-formed JSON, which is why the
// `try/catch` around the old `as` cast could not see any of it (issue
// 260809-1101). See `churn.test.ts` for the full account.
// ---------------------------------------------------------------------------
describe("coerceCrossFileState", () => {
  it("reads {} as an empty state that recordEdit can use", () => {
    const coerced = coerceCrossFileState(JSON.parse("{}"));
    expect(coerced.files).toEqual({});
    expect(() => recordEdit(coerced, "A")).not.toThrow();
    expect(coerced.files["A"].totalEdits).toBe(1);
  });

  for (const [name, value] of [
    ["null", null],
    ["an array", []],
    ["a bare number", 7],
    ["undefined — an absent, unreadable or unparseable file", undefined],
  ] as [string, unknown][]) {
    it(`reads ${name} as an empty state`, () => {
      expect(coerceCrossFileState(value)).toEqual({
        files: {},
        lastEditFile: null,
        lastEditTimestamp: null,
      });
    });
  }

  it("nulls a lastEditFile that is not a string, so no edit reads as a return visit", () => {
    // `recordEdit` compares this value against the file being edited. A non-string
    // carried into that comparison would count a first edit as a ping-back.
    const coerced = coerceCrossFileState({
      files: { A: { pingBackCount: 0, totalEdits: 1, lastEditTimestamp: "" } },
      lastEditFile: 42,
    });
    expect(coerced.lastEditFile).toBeNull();
    recordEdit(coerced, "A");
    expect(coerced.files["A"].pingBackCount).toBe(0);
  });

  it("drops a file entry that is not an object and defaults the counters", () => {
    const coerced = coerceCrossFileState({
      files: {
        A: null,
        B: { pingBackCount: -3, totalEdits: "many", lastEditTimestamp: 9 },
      },
    });
    expect(Object.keys(coerced.files)).toEqual(["B"]);
    expect(coerced.files["B"]).toEqual({
      pingBackCount: 0,
      totalEdits: 0,
      lastEditTimestamp: "",
    });
  });

  it("round-trips a well-formed state unchanged", () => {
    // Anti-vacuity: a coercion that emptied everything would pass every case
    // above while silently resetting a project's ping-back history on load.
    const written: CrossFileState = {
      files: {
        A: {
          pingBackCount: 4,
          totalEdits: 9,
          lastEditTimestamp: "2026-08-09T10:00:00.000Z",
        },
      },
      lastEditFile: "A",
      lastEditTimestamp: "2026-08-09T10:00:00.000Z",
    };
    expect(coerceCrossFileState(JSON.parse(JSON.stringify(written)))).toEqual(
      written,
    );
  });
});
