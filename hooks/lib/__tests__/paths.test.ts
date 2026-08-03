import { describe, it, expect } from "vitest";
import {
  matchesPattern,
  matchesAny,
  matchesAnyFolded,
  foldCase,
  globToRegex,
  collapseSegments,
  canonicalise,
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
    // name. The protection side uses `matchesAnyFolded` below instead.
    expect(matchesAny("RULES/x.md", ["rules/**"])).toBe(false);
    expect(matchesAny("rules/x.md", ["rules/**"])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Case folding — the PROTECTION side only.
//
// `matchesPattern` compiles a glob to a case-sensitive regex, so before this
// existed the entire protected list was bypassable by shifting one letter on a
// case-insensitive filesystem (APFS in its default configuration, so every
// stock macOS install). Measured against the real guard:
//
//   Edit agents/coder.md    DENY        Edit AGENTS/coder.md    allow
//
// The end-to-end proof on both write surfaces is in
// `guard-case-folding.test.ts`; these are the unit-level properties.
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

describe("matchesAnyFolded", () => {
  const protectedPaths = [
    "agents/**",
    "rules/**",
    "hooks/config.json",
    "settings.json",
    "bin/monitor",
    "fusion-workbench/.guard-state/**",
  ];

  it("matches the spelling the list uses", () => {
    // The baseline: folding must not cost a single denial that already held.
    expect(matchesAnyFolded("agents/coder.md", protectedPaths)).toBe(true);
    expect(matchesAnyFolded("hooks/config.json", protectedPaths)).toBe(true);
    expect(matchesAnyFolded("bin/monitor", protectedPaths)).toBe(true);
  });

  it("matches a differently-cased spelling of the same file", () => {
    // Each of these ALSO missed before the fold — asserted alongside, because
    // without that half the cases would pass against any implementation.
    for (const path of [
      "AGENTS/coder.md",
      "Agents/Coder.md",
      "RULES/x.md",
      "HOOKS/config.json",
      "hooks/Config.JSON",
      "Settings.json",
      "BIN/Monitor",
      "fusion-workbench/.GUARD-STATE/escalation.json",
    ]) {
      expect(matchesAnyFolded(path, protectedPaths), path).toBe(true);
      expect(matchesAny(path, protectedPaths), path).toBe(false);
    }
  });

  it("was never the whole story: a `**` tail already swallowed case", () => {
    // The bound on what the fold bought. `agents/**` compiles to `^agents/.*$`
    // and `.*` is case-blind, so only the LITERAL segments of a pattern ever
    // missed. `agents/CODER.MD` was denied at HEAD; `AGENTS/coder.md` was not.
    // Worth pinning so nobody reads the fix as broader than it is.
    expect(matchesAny("agents/CODER.MD", protectedPaths)).toBe(true);
    expect(matchesAnyFolded("agents/CODER.MD", protectedPaths)).toBe(true);
  });

  it("does not match a path that is merely near the list", () => {
    for (const path of [
      "notes.txt",
      "NOTES.txt",
      "build/out.js",
      "BUILD/OUT.JS",
      "rulesdraft/x.md",
      "RULESDRAFT/x.md",
      "agentsmith/x.md",
      "AGENTSMITH/x.md",
      "docs/rules.md",
      "DOCS/RULES.md",
    ]) {
      expect(matchesAnyFolded(path, protectedPaths), path).toBe(false);
    }
  });

  it("keeps the trailing-separator asymmetry intact", () => {
    // `rules/**` compiles to `^rules/.*$`, whose `.*` matches the empty
    // string, so the trailing separator is what makes the bare directory node
    // protected. Folding is a second, independent dimension and must not
    // disturb this one.
    expect(matchesAnyFolded("rules/", protectedPaths)).toBe(true);
    expect(matchesAnyFolded("RULES/", protectedPaths)).toBe(true);
    expect(matchesAnyFolded("rules", protectedPaths)).toBe(false);
    expect(matchesAnyFolded("RULES", protectedPaths)).toBe(false);
  });

  it("folds the PATTERNS too, so a mixed-case config still matches", () => {
    // A consuming project writes its own `protectedPaths`. One that names
    // `Rules/**` protects `rules/x.md` on the filesystem where those are one
    // file, which is the same property read from the other end.
    expect(matchesAnyFolded("rules/x.md", ["Rules/**"])).toBe(true);
    expect(matchesAnyFolded("RULES/x.md", ["Rules/**"])).toBe(true);
  });

  it("returns false for an empty pattern list", () => {
    // A project with nothing protected has opted out, and folding must not
    // invent a match for it.
    expect(matchesAnyFolded("agents/coder.md", [])).toBe(false);
  });
});

describe("collapseSegments and canonicalise — neither folds case", () => {
  // The fold belongs to the MATCH, not to the normalisation: `canonicalise` is
  // built on `collapseSegments`, so a fold added down there would fold the
  // GRANT too and widen a permission. Pinned so the tempting one-line move
  // fails a test rather than a review.
  it("collapseSegments preserves case", () => {
    expect(collapseSegments("./AGENTS/../Rules/X.md")).toBe("Rules/X.md");
  });

  it("canonicalise preserves case", () => {
    expect(canonicalise("RULES/x.md/")).toBe("RULES/x.md");
  });
});
