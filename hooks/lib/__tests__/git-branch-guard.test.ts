import { describe, it, expect } from "vitest";
import {
  classifyGitCommand,
  extractCommandSegments,
  isEnvFlagSet,
  overridesFromEnv,
} from "../git-branch-guard.js";
import type { GitGuardOverrides } from "../git-branch-guard.js";

const NO_OVERRIDE: GitGuardOverrides = {
  allowBranchSwitch: false,
  allowWorktree: false,
};
const ALLOW_BRANCH: GitGuardOverrides = {
  allowBranchSwitch: true,
  allowWorktree: false,
};
const ALLOW_WORKTREE: GitGuardOverrides = {
  allowBranchSwitch: false,
  allowWorktree: true,
};

function deny(cmd: string, overrides = NO_OVERRIDE) {
  return classifyGitCommand(cmd, overrides);
}

describe("git branch-switch classifier — DENY cases", () => {
  it("denies git switch <branch>", () => {
    expect(deny("git switch main").deny).toBe(true);
  });

  it("denies git switch -c <new>", () => {
    expect(deny("git switch -c feature").deny).toBe(true);
  });

  it("denies git switch -C <new>", () => {
    expect(deny("git switch -C feature").deny).toBe(true);
  });

  it("denies git switch --detach", () => {
    expect(deny("git switch --detach abc123").deny).toBe(true);
  });

  it("denies git switch - (previous branch)", () => {
    expect(deny("git switch -").deny).toBe(true);
  });

  it("denies git checkout <branch> (no -- separator)", () => {
    expect(deny("git checkout main").deny).toBe(true);
  });

  it("denies git checkout -b <new>", () => {
    expect(deny("git checkout -b feature").deny).toBe(true);
  });

  it("denies git checkout -B <new>", () => {
    expect(deny("git checkout -B feature").deny).toBe(true);
  });

  it("denies git checkout --detach <ref>", () => {
    expect(deny("git checkout --detach abc").deny).toBe(true);
  });

  it("denies git checkout --orphan <new>", () => {
    expect(deny("git checkout --orphan newbranch").deny).toBe(true);
  });

  it("denies git checkout - (previous branch)", () => {
    expect(deny("git checkout -").deny).toBe(true);
  });

  it("denies git worktree add", () => {
    expect(deny("git worktree add ../wt feature").deny).toBe(true);
  });

  it("denies compound: cd x && git checkout other", () => {
    const v = deny("cd x && git checkout other");
    expect(v.deny).toBe(true);
    expect(v.offendingSegment).toContain("git checkout other");
  });

  it("denies a git switch hidden inside a subshell $(...)", () => {
    expect(deny("echo $(git switch main)").deny).toBe(true);
  });

  it("denies a git switch hidden inside backticks", () => {
    expect(deny("echo `git switch main`").deny).toBe(true);
  });

  it("denies if ANY segment is a deny-case", () => {
    expect(deny("git status; git checkout other; git log").deny).toBe(true);
  });

  it("sets the offending segment and kind on deny", () => {
    const v = deny("git worktree add ../wt x");
    expect(v.kind).toBe("worktree-add");
    expect(v.offendingSegment).toContain("git worktree add");
  });

  it("provides a plain actionable deny reason mentioning the overrides", () => {
    const v = deny("git switch main");
    expect(v.reason).toMatch(/FUSION_ALLOW_BRANCH_SWITCH/);
    expect(v.reason).toMatch(/FUSION_ALLOW_WORKTREE/);
    expect(v.reason).toMatch(/STOP and ask the user/);
  });
});

describe("git branch-switch classifier — ALLOW cases (HEAD stays / non-git)", () => {
  it("ALLOWS git checkout HEAD -- foo.go (the load-bearing revert path)", () => {
    expect(deny("git checkout HEAD -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout -- foo.go", () => {
    expect(deny("git checkout -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout abc123 -- foo.go", () => {
    expect(deny("git checkout abc123 -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout HEAD -- multiple files", () => {
    expect(deny("git checkout HEAD -- a.go b.go c.ts").deny).toBe(false);
  });

  it("ALLOWS git status", () => {
    expect(deny("git status").deny).toBe(false);
  });

  it("ALLOWS git branch (listing)", () => {
    expect(deny("git branch").deny).toBe(false);
  });

  it("ALLOWS git branch <new> (create without switch)", () => {
    expect(deny("git branch newbranch").deny).toBe(false);
  });

  it("ALLOWS git log", () => {
    expect(deny("git log --oneline -10").deny).toBe(false);
  });

  it("ALLOWS git diff", () => {
    expect(deny("git diff HEAD~1").deny).toBe(false);
  });

  it("ALLOWS git worktree list", () => {
    expect(deny("git worktree list").deny).toBe(false);
  });

  it("ALLOWS git worktree remove", () => {
    expect(deny("git worktree remove ../wt").deny).toBe(false);
  });

  it("ALLOWS plain non-git command", () => {
    expect(deny("ls -la && cat foo.txt").deny).toBe(false);
  });

  it("ALLOWS bare git with no subcommand", () => {
    expect(deny("git").deny).toBe(false);
  });

  it("ALLOWS git commit", () => {
    expect(deny("git commit -m 'msg'").deny).toBe(false);
  });

  it("ALLOWS git checkout HEAD -- foo even inside a compound", () => {
    expect(deny("git status && git checkout HEAD -- foo.go").deny).toBe(false);
  });
});

describe("git branch-switch classifier — env overrides (least privilege)", () => {
  it("FUSION_ALLOW_BRANCH_SWITCH allows git checkout main", () => {
    const v = classifyGitCommand("git checkout main", ALLOW_BRANCH);
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideKind).toBe("branch-switch");
  });

  it("FUSION_ALLOW_BRANCH_SWITCH allows git switch feature", () => {
    expect(classifyGitCommand("git switch feature", ALLOW_BRANCH).deny).toBe(false);
  });

  it("FUSION_ALLOW_WORKTREE allows git worktree add", () => {
    const v = classifyGitCommand("git worktree add ../wt x", ALLOW_WORKTREE);
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideKind).toBe("worktree-add");
  });

  it("branch-switch override does NOT lift the worktree deny (independent)", () => {
    expect(classifyGitCommand("git worktree add ../wt x", ALLOW_BRANCH).deny).toBe(true);
  });

  it("worktree override does NOT lift the branch-switch deny (independent)", () => {
    expect(classifyGitCommand("git checkout main", ALLOW_WORKTREE).deny).toBe(true);
  });
});

describe("git branch-switch classifier — fail-closed on ambiguity", () => {
  it("denies git checkout with a weird ref and no -- separator", () => {
    expect(deny("git checkout origin/main").deny).toBe(true);
  });

  it("denies git checkout with global -C option then a branch", () => {
    expect(deny("git -C /repo checkout main").deny).toBe(true);
  });

  it("denies env-prefixed git switch", () => {
    expect(deny("GIT_TRACE=1 git switch main").deny).toBe(true);
  });

  it("allows git -C /repo checkout HEAD -- foo (-- separator wins)", () => {
    expect(deny("git -C /repo checkout HEAD -- foo.go").deny).toBe(false);
  });
});

describe("extractCommandSegments", () => {
  it("splits on && ; || |", () => {
    const segs = extractCommandSegments("a && b ; c || d | e");
    expect(segs).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e"]));
  });

  it("extracts subshell bodies from $(...)", () => {
    const segs = extractCommandSegments("echo $(git switch main)");
    expect(segs.some((s) => s.includes("git switch main"))).toBe(true);
  });

  it("extracts subshell bodies from backticks", () => {
    const segs = extractCommandSegments("echo `git status`");
    expect(segs.some((s) => s.includes("git status"))).toBe(true);
  });
});

describe("env flag parsing", () => {
  it("treats 1 and true as set", () => {
    expect(isEnvFlagSet("1")).toBe(true);
    expect(isEnvFlagSet("true")).toBe(true);
    expect(isEnvFlagSet("TRUE")).toBe(true);
  });

  it("treats anything else as unset", () => {
    expect(isEnvFlagSet(undefined)).toBe(false);
    expect(isEnvFlagSet("0")).toBe(false);
    expect(isEnvFlagSet("false")).toBe(false);
    expect(isEnvFlagSet("")).toBe(false);
  });

  it("overridesFromEnv reads both flags independently", () => {
    expect(overridesFromEnv({ FUSION_ALLOW_BRANCH_SWITCH: "1" })).toEqual({
      allowBranchSwitch: true,
      allowWorktree: false,
    });
    expect(overridesFromEnv({ FUSION_ALLOW_WORKTREE: "true" })).toEqual({
      allowBranchSwitch: false,
      allowWorktree: true,
    });
  });
});
