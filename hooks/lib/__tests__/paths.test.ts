import { describe, it, expect } from "vitest";
import {
  matchesPattern,
  matchesAny,
  foldCase,
  globToRegex,
  collapseSegments,
} from "../paths.js";

describe("globToRegex", () => {
  it("converts simple wildcard", () => {
    const re = globToRegex("pkg/*.go");
    expect(re.test("pkg/main.go")).toBe(true);
    expect(re.test("pkg/sub/main.go")).toBe(false);
  });

  it("converts globstar", () => {
    const re = globToRegex("pkg/**/*.go");
    expect(re.test("pkg/sub/main.go")).toBe(true);
    expect(re.test("pkg/a/b/c.go")).toBe(true);
    expect(re.test("other/main.go")).toBe(false);
  });

  it("converts question mark", () => {
    const re = globToRegex("pkg/?.go");
    expect(re.test("pkg/a.go")).toBe(true);
    expect(re.test("pkg/ab.go")).toBe(false);
  });

  it("escapes regex special chars in path", () => {
    const re = globToRegex("pkg/file.name+v2.go");
    expect(re.test("pkg/file.name+v2.go")).toBe(true);
    expect(re.test("pkg/fileXnameXv2.go")).toBe(false);
  });
});

describe("matchesPattern", () => {
  it("matches exact path", () => {
    expect(matchesPattern("fusion-workbench/issues/foo.md", "fusion-workbench/**")).toBe(true);
  });

  it("rejects non-matching path", () => {
    expect(matchesPattern("src/main.go", "fusion-workbench/**")).toBe(false);
  });

  it("matches recursive glob", () => {
    expect(matchesPattern(".claude/agents/coder.md", ".claude/agents/**")).toBe(true);
  });

  it("matches file-level glob", () => {
    expect(matchesPattern("codebase/python/ueo-verb-check.py", "codebase/python/ueo-*.py")).toBe(true);
  });

  it("returns false on invalid regex", () => {
    // matchesPattern should not throw on broken patterns
    expect(matchesPattern("foo", "[invalid")).toBe(false);
  });
});

describe("matchesAny", () => {
  it("returns true when any pattern matches", () => {
    const patterns = ["fusion-workbench/**", ".claude/agents/**"];
    expect(matchesAny("fusion-workbench/issues/foo.md", patterns)).toBe(true);
    expect(matchesAny(".claude/agents/coder.md", patterns)).toBe(true);
  });

  it("returns false when no pattern matches", () => {
    const patterns = ["fusion-workbench/**", ".claude/agents/**"];
    expect(matchesAny("src/main.go", patterns)).toBe(false);
  });

  it("returns false for empty patterns", () => {
    expect(matchesAny("anything.txt", [])).toBe(false);
  });

  it("is CASE-SENSITIVE, and that is the grant side's contract", () => {
    // The exemption matches through this function. Folding here would hand
    // `FUSION_ALLOW_RULES_WRITE` to a spelling `RULE_DIR_PATTERNS` does not
    // name. The folded variant that used to sit below, and the protected list
    // it matched for, are gone.
    expect(matchesAny("RULES/x.md", ["rules/**"])).toBe(false);
    expect(matchesAny("rules/x.md", ["rules/**"])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Case folding.
//
// `matchesPattern` compiles a glob to a case-sensitive regex, so on a
// case-insensitive filesystem (APFS in its default configuration, so every
// stock macOS install) two spellings of one file match differently. `foldCase`
// is the locale-independent normalisation that lets a caller ask the question
// with case taken out of it.
//
// The folded MATCH — `matchesAnyFolded` — and its end-to-end proof went with
// the protected-path half of the guard. These are the properties of the fold
// itself, which the surviving callers still rest on.
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

describe("collapseSegments — does not fold case", () => {
  // The fold belongs to the MATCH, not to the normalisation. A fold added down
  // here would reach every caller of `collapseSegments`, including the ones
  // that decide a GRANT, and widen a permission. Pinned so the tempting
  // one-line move fails a test rather than a review.
  it("collapseSegments preserves case", () => {
    expect(collapseSegments("./AGENTS/../Rules/X.md")).toBe("Rules/X.md");
  });
});
