import { describe, it, expect } from "vitest";
import { projectRelative } from "../project-relative.js";

// ---------------------------------------------------------------------------
// `projectRelative` — the coordinate space every protected pattern is matched
// in. Plan Step 1 of the C5b remediation, closing `260804-1604`.
//
// The function is pure arithmetic over two strings, and it used to live inside
// `guard.ts` where the only way to ask it anything was to spawn a hook. These
// cases are the reason it was moved: "what does the guard read when its working
// directory is a subdirectory of the project" is the question the defect turns
// on, and it takes one line to ask here.
//
// The verdicts these spellings actually produce are asserted through the real
// guard subprocess in `guard-rules-write-integration.test.ts`. This file is
// about the string, not about the deny.
// ---------------------------------------------------------------------------

const ROOT = "/proj";
const SUB = "/proj/sub";

describe("a path inside the working directory", () => {
  const inside: [string, string, string][] = [
    ["an absolute path, which is what Claude Code sends", "/proj/rules/x.md", "rules/x.md"],
    ["a relative path, unchanged", "rules/x.md", "rules/x.md"],
    ["a `./` prefix, collapsed", "./rules/x.md", "rules/x.md"],
    ["a `..` that comes back inside", "sub/../rules/x.md", "rules/x.md"],
    ["repeated separators", "rules//x.md", "rules/x.md"],
    ["a nested relative path", "a/b/c.md", "a/b/c.md"],
  ];

  for (const [what, input, expected] of inside) {
    it(`${what}: ${input}`, () => {
      expect(projectRelative(input, ROOT)).toBe(expected);
    });
  }

  it("returns the empty string for the working directory itself", () => {
    // What `relative` answers, and what both call sites normalise to `.`.
    expect(projectRelative(ROOT, ROOT)).toBe("");
    expect(projectRelative(".", ROOT)).toBe("");
    // Including when spelled with a trailing separator: a bare `/` would read as
    // the filesystem root, which is not what `./` names.
    expect(projectRelative("./", ROOT)).toBe("");
    expect(projectRelative(ROOT + "/", ROOT)).toBe("");
  });
});

describe("a trailing separator survives, because a deny depends on it", () => {
  // `resolve` throws it away and `agents/**` compiles to `^agents/.*$`, whose
  // `.*` matches the empty string — so `agents/` matches the protected pattern
  // and the bare `agents` does not. Dropping it turned `Edit agents/` from a
  // deny into an allow, which the suite caught while this step was being built.
  const kept: [string, string][] = [
    ["agents/", "agents/"],
    ["rules/", "rules/"],
    ["rules/retired/", "rules/retired/"],
    ["/proj/agents/", "agents/"],
    ["rules//", "rules/"],
    ["./rules/", "rules/"],
  ];

  for (const [input, expected] of kept) {
    it(`${input} → ${expected}`, () => {
      expect(projectRelative(input, ROOT)).toBe(expected);
    });
  }

  it("keeps it on the absolute answer too", () => {
    expect(projectRelative("../rules/", SUB)).toBe("/proj/rules/");
  });

  it("does not invent one for a path spelled without it", () => {
    expect(projectRelative("agents", ROOT)).toBe("agents");
    expect(projectRelative("/proj/agents", ROOT)).toBe("agents");
  });
});

describe("a path outside the working directory comes back absolute", () => {
  it("an absolute path above the working directory", () => {
    expect(projectRelative("/proj/fusion-guard.json", SUB)).toBe(
      "/proj/fusion-guard.json",
    );
  });

  it("a `..` spelling of the same file — the row 260804-1604 measured", () => {
    // Before this change the answer was the literal string `../fusion-guard.json`,
    // which no pattern in `guard.protectedPaths` can match: every one of them is
    // project-relative and none begins with `..`. The floor named the file and
    // the guard could not see it.
    expect(projectRelative("../fusion-guard.json", SUB)).toBe(
      "/proj/fusion-guard.json",
    );
  });

  it("a path in an unrelated tree", () => {
    expect(projectRelative("/etc/passwd", ROOT)).toBe("/etc/passwd");
    expect(projectRelative("../../etc/passwd", SUB)).toBe("/etc/passwd");
  });

  it("the parent of the working directory", () => {
    expect(projectRelative("..", SUB)).toBe(ROOT);
  });

  it("normalises the absolute answer rather than echoing the spelling", () => {
    // The old function returned an outside-the-tree absolute path VERBATIM. An
    // absolute pattern has one spelling, so the answer has to have one too.
    expect(projectRelative("/proj/./sub/../fusion-guard.json", SUB)).toBe(
      "/proj/fusion-guard.json",
    );
  });
});

describe("a sibling directory is not read as being inside", () => {
  it("does not confuse /proj/subsidiary with /proj/sub", () => {
    // The prefix test is on a separator boundary. Without it `subsidiary/x`
    // would relativise to `sidiary/x` and match a pattern it has nothing to do
    // with.
    expect(projectRelative("/proj/subsidiary/x.md", SUB)).toBe(
      "/proj/subsidiary/x.md",
    );
  });
});

describe("the property the anti-regression argument rests on", () => {
  // Every path that used to relativise INSIDE the working directory must still
  // produce the same string, or a pattern that matched it stops matching and a
  // protected path becomes unprotected. Stated as the old function, transcribed,
  // rather than as prose.
  function before(filePath: string, cwd: string): string {
    if (!filePath.startsWith("/")) return filePath;
    const resolved = filePath.replace(/\/+/g, "/");
    if (resolved.startsWith(cwd + "/") || resolved === cwd) {
      return resolved === cwd ? "" : resolved.slice(cwd.length + 1);
    }
    return filePath;
  }

  const absolutePaths = [
    "/proj/rules/x.md",
    "/proj/agents/coder.md",
    "/proj/fusion-workbench/.guard-state/escalation.json",
    "/proj/hooks/config.json",
    "/proj",
    "/proj/a/b/c/d/e.md",
  ];

  for (const p of absolutePaths) {
    it(`answers as it always did for ${p}`, () => {
      expect(projectRelative(p, ROOT)).toBe(before(p, ROOT));
    });
  }

  it("answers as it always did for relative paths that stay inside", () => {
    for (const p of ["rules/x.md", "agents/coder.md", "a/b.md", "notes.txt"]) {
      expect(projectRelative(p, ROOT)).toBe(before(p, ROOT));
    }
  });
});
