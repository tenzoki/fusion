import { describe, it, expect } from "vitest";
import { matchesPattern, matchesAny, globToRegex } from "../paths.js";

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
});
