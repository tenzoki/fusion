import { describe, it, expect, beforeEach } from "vitest";
import {
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
