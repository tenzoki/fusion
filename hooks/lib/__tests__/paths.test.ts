import { describe, it, expect } from "vitest";
import { foldCase } from "../paths.js";

// ---------------------------------------------------------------------------
// Case folding — all that is left of this module, and all that is left of this
// file.
//
// `paths.ts` carried a glob-to-regex compiler and the lexical normalisation a
// matched set was computed on: `globToRegex`, `matchesPattern`, `matchesAny`,
// `collapseSegments`. Four describes here covered them. All four functions were
// deleted on 2026-08-16 once `findRelevantDecisions` — their last caller, in the
// configuration loader rather than in `guard.ts`, which is what the plan got
// wrong (issue `260816-2108`) — went with the guard's verdict.
//
// The describes went with the functions rather than being re-pointed, for the
// reason the module's own header gives: a matcher with nothing to match has no
// behaviour to pin. `collapseSegments — does not fold case` is the one worth
// naming, because its subject was a RULE rather than a function: the fold
// belongs to the match and not to the normalisation, so that a one-line move of
// `toLowerCase()` down into the normaliser could not widen a grant. There is no
// match, no grant and no normaliser left for that rule to be about.
//
// `foldCase` keeps its caller — `tracker.ts` folds both sides of a containment
// test so a case-insensitive filesystem does not decide whether the
// review-coverage measurement fires — so these are the properties the surviving
// caller rests on.
// ---------------------------------------------------------------------------

describe("foldCase", () => {
  it("folds ASCII", () => {
    expect(foldCase("AGENTS/Coder.MD")).toBe("agents/coder.md");
  });

  it("leaves an already-folded path alone", () => {
    expect(foldCase("agents/coder.md")).toBe("agents/coder.md");
  });

  it("touches nothing but case — separators, dots and globs survive", () => {
    expect(foldCase("./A/../B/**/c.md")).toBe("./a/../b/**/c.md");
    expect(foldCase("rules/")).toBe("rules/");
  });

  it("uses the locale-independent mapping", () => {
    // `toLocaleLowerCase` under a Turkish locale maps `I` to a dotless `ı`,
    // which would stop `rules/I.md` folding onto `rules/i.md` on one
    // developer's machine and nowhere else. A boundary that moves with `LANG`
    // is worse than a slightly coarse one.
    expect(foldCase("I")).toBe("i");
    expect(foldCase("RULES/I.md")).toBe("rules/i.md");
  });
});
