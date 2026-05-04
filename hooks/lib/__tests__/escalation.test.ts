import { describe, it, expect, beforeEach } from "vitest";
import {
  isHalted,
  recordBlock,
  resetBlockCounter,
  clearHalt,
} from "../escalation.js";
import type { EscalationState } from "../escalation.js";

function freshState(): EscalationState {
  return {
    haltActive: false,
    consecutiveBlocks: 0,
    lastBlockTimestamp: null,
    recentEvents: [],
  };
}

describe("escalation state", () => {
  let state: EscalationState;

  beforeEach(() => {
    state = freshState();
  });

  it("starts not halted", () => {
    expect(isHalted(state)).toBe(false);
  });

  it("records blocks and increments counter", () => {
    recordBlock(state, 3, "test", "test message", "Write", "foo.ts");
    expect(state.consecutiveBlocks).toBe(1);
    expect(state.recentEvents).toHaveLength(1);
    expect(state.recentEvents[0].level).toBe("block");
  });

  it("triggers halt after blocksBeforeHalt consecutive blocks", () => {
    const halted1 = recordBlock(state, 3, "test", "msg1");
    expect(halted1).toBe(false);
    const halted2 = recordBlock(state, 3, "test", "msg2");
    expect(halted2).toBe(false);
    const halted3 = recordBlock(state, 3, "test", "msg3");
    expect(halted3).toBe(true);
    expect(isHalted(state)).toBe(true);
    // Should have block events + halt event
    expect(state.recentEvents.filter((e) => e.level === "halt")).toHaveLength(1);
  });

  it("resets block counter", () => {
    recordBlock(state, 3, "test", "msg1");
    recordBlock(state, 3, "test", "msg2");
    expect(state.consecutiveBlocks).toBe(2);
    resetBlockCounter(state);
    expect(state.consecutiveBlocks).toBe(0);
  });

  it("clears halt mode", () => {
    // Force halt
    recordBlock(state, 1, "test", "msg");
    expect(isHalted(state)).toBe(true);
    clearHalt(state);
    expect(isHalted(state)).toBe(false);
    expect(state.consecutiveBlocks).toBe(0);
    expect(state.recentEvents.at(-1)?.trigger).toBe("halt_cleared");
  });

  it("does not halt if threshold not reached", () => {
    recordBlock(state, 5, "test", "msg1");
    recordBlock(state, 5, "test", "msg2");
    recordBlock(state, 5, "test", "msg3");
    recordBlock(state, 5, "test", "msg4");
    expect(isHalted(state)).toBe(false);
    expect(state.consecutiveBlocks).toBe(4);
  });
});
