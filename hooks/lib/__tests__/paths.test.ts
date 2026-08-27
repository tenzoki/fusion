import { describe, it, expect } from "vitest";
import { foldCase } from "../paths.js";

// Case folding — all that is left of this module. The glob compiler and the
// normalisation it carried went on 2026-08-16 with their last caller (issue
// `260816-2108`; the module's own header has the account). `foldCase` keeps its
// caller in `tracker.ts`, and these are the properties that caller rests on.

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
